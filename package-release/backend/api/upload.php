<?php
/**
 * IYMPACK CMS — Hardened Secure Image & Document Upload Handler
 * 
 * Lapisan Keamanan Berlapis (OWASP A04 & A05):
 * 1. Strict Server-Side MIME-Type Verification via finfo (Magic Bytes).
 * 2. Strict Extension Whitelist & Blacklist (Mencegah PHP Web Shell / Polyglot).
 * 3. File Re-encoding via GD ke WebP (Menghilangkan Payload Malicious dalam EXIF/Metadata).
 * 4. Image Header Verification via getimagesize().
 * 5. Cryptographically Secure Random Filenames (Anti LFI / Path Traversal).
 * 6. File Size Restriction (Maks 5 MB).
 * 7. Non-executable permissions (chmod 0644).
 */

require_once __DIR__ . '/db.php';

// Atur CORS aman
setSecureCorsHeaders();

$config = require __DIR__ . '/config.php';
$uploadDir = rtrim($config['upload_dir'], '/\\') . '/';
$urlPrefix = rtrim($config['upload_url_prefix'], '/');

// Pastikan direktori uploads ada dengan hak akses aman (0755)
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

// ─── Whitelist Ekstensi & MIME yang Diizinkan ────────────────────
$allowedMimes = [
    'image/jpeg'      => 'jpg',
    'image/pjpeg'     => 'jpg',
    'image/png'       => 'png',
    'image/x-png'     => 'png',
    'image/webp'      => 'webp',
    'application/pdf' => 'pdf'
];

$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

// Blacklist ekstensi berbahaya yang wajib diblokir total
$dangerousExtensions = [
    'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phps', 'phar',
    'html', 'htm', 'xhtml', 'shtml', 'svg', 'xml',
    'js', 'jsp', 'asp', 'aspx', 'cgi', 'pl', 'py', 'sh', 'bash',
    'exe', 'bat', 'cmd', 'com', 'msi', 'bin',
    'htaccess', 'htpasswd', 'ini', 'env', 'config', 'sql'
];

/**
 * Validasi mendalam struktur dan integritas berkas
 */
function validateUploadedFile($tmpPath, $originalName, &$detectedExt, &$isRasterImage) {
    global $allowedMimes, $allowedExtensions, $dangerousExtensions;

    if (!file_exists($tmpPath) || !is_readable($tmpPath)) {
        return 'Berkas sementara tidak ditemukan di server.';
    }

    // 1. Cek ekstensi nama file asli
    $origExt = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    
    // Periksa apakah ada ekstensi ganda atau ekstensi berbahaya (misal: shell.php.jpg)
    $nameParts = explode('.', strtolower($originalName));
    foreach ($nameParts as $part) {
        if (in_array($part, $dangerousExtensions, true)) {
            return 'Berkas ditolak: Terdeteksi ekstensi berbahaya.';
        }
    }

    if (!in_array($origExt, $allowedExtensions, true)) {
        return 'Format file tidak diizinkan. Hanya mendukung JPG, PNG, WebP, dan PDF.';
    }

    // 2. Deteksi MIME Type asli dari file signature (Magic Bytes) via finfo
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $realMime = finfo_file($finfo, $tmpPath);
    finfo_close($finfo);

    if (!array_key_exists($realMime, $allowedMimes)) {
        return 'Tipe konten berkas tidak valid (' . htmlspecialchars($realMime, ENT_QUOTES, 'UTF-8') . '). Berkas manipulatif ditolak.';
    }

    $detectedExt = $allowedMimes[$realMime];
    $isRasterImage = in_array($realMime, ['image/jpeg', 'image/pjpeg', 'image/png', 'image/x-png', 'image/webp'], true);

    // 3. Jika gambar raster, verifikasi integritas struktur gambar dengan getimagesize
    if ($isRasterImage) {
        $imageInfo = @getimagesize($tmpPath);
        if ($imageInfo === false || empty($imageInfo[0]) || empty($imageInfo[1])) {
            return 'Integritas file gambar rusak atau palsu.';
        }

        // Mencegah image decompression bomb (DoS)
        if ($imageInfo[0] > 6000 || $imageInfo[1] > 6000) {
            return 'Dimensi gambar terlalu besar (Maksimal 6000x6000px).';
        }
    }

    // 4. Jika PDF, cek magic bytes header PDF (%PDF-)
    if ($realMime === 'application/pdf') {
        $handle = @fopen($tmpPath, 'rb');
        $header = $handle ? fread($handle, 5) : '';
        if ($handle) fclose($handle);
        if (strpos($header, '%PDF-') !== 0) {
            return 'Berkas PDF tidak valid atau korup.';
        }
    }

    return null; // Valid
}

/**
 * Kompresi dan konversi gambar ke format WebP murni
 * Proses raster ulang menghancurkan segala macam malware/script payload di dalam EXIF/metadata
 */
function sanitizeAndConvertToWebp($sourcePath, $targetWebpPath, $maxWidth = 1920, $quality = 82) {
    if (!extension_loaded('gd') || !function_exists('imagewebp')) {
        return false;
    }

    $info = @getimagesize($sourcePath);
    if (!$info) return false;

    $mime = $info['mime'];
    $src = null;

    switch ($mime) {
        case 'image/jpeg':
        case 'image/pjpeg':
            $src = @imagecreatefromjpeg($sourcePath);
            break;
        case 'image/png':
        case 'image/x-png':
            $src = @imagecreatefrompng($sourcePath);
            break;
        case 'image/webp':
            $src = @imagecreatefromwebp($sourcePath);
            break;
        default:
            return false;
    }

    if (!$src) return false;

    // Koreksi rotasi otomatis kamera smartphone via EXIF
    if (function_exists('exif_read_data') && ($mime === 'image/jpeg' || $mime === 'image/pjpeg')) {
        $exif = @exif_read_data($sourcePath);
        if (!empty($exif['Orientation'])) {
            switch ($exif['Orientation']) {
                case 3: $src = imagerotate($src, 180, 0); break;
                case 6: $src = imagerotate($src, -90, 0); break;
                case 8: $src = imagerotate($src, 90, 0); break;
            }
        }
    }

    $origW = imagesx($src);
    $origH = imagesy($src);

    $newW = $origW;
    $newH = $origH;
    if ($origW > $maxWidth || $origH > $maxWidth) {
        if ($origW >= $origH) {
            $newW = $maxWidth;
            $newH = (int)round(($origH / $origW) * $maxWidth);
        } else {
            $newH = $maxWidth;
            $newW = (int)round(($origW / $origH) * $maxWidth);
        }
    }

    $dst = imagecreatetruecolor($newW, $newH);
    imagealphablending($dst, false);
    imagesavealpha($dst, true);
    $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
    imagefilledrectangle($dst, 0, 0, $newW, $newH, $transparent);

    imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

    $success = imagewebp($dst, $targetWebpPath, $quality);

    imagedestroy($src);
    imagedestroy($dst);

    return $success;
}

// ─── 1. Handle Multipart Form-Data Upload ───────────────────────
if (isset($_FILES['file'])) {
    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        respondJson(['success' => false, 'error' => 'Gagal mengunggah file (Kode error: ' . (int)$file['error'] . ')'], 400);
    }

    // Batas ukuran 5MB (Mencegah Resource Exhaustion DoS)
    if ($file['size'] > 5 * 1024 * 1024) {
        respondJson(['success' => false, 'error' => 'Ukuran berkas melebihi batas maksimum 5MB.'], 400);
    }

    $detectedExt = '';
    $isRaster = false;
    $validationError = validateUploadedFile($file['tmp_name'], $file['name'], $detectedExt, $isRaster);

    if ($validationError !== null) {
        respondJson(['success' => false, 'error' => $validationError], 400);
    }

    // Nama file acak menggunakan 16-byte cryptographically secure random bytes
    $randomHash = bin2hex(random_bytes(16));
    $baseName = 'media_' . date('Ymd_His') . '_' . $randomHash;

    $finalFilename = $baseName . ($isRaster ? '.webp' : '.' . $detectedExt);
    $finalDestination = $uploadDir . $finalFilename;

    $saved = false;

    // Jika gambar bitmap, konversi dan kompres ke WebP murni
    if ($isRaster) {
        $saved = sanitizeAndConvertToWebp($file['tmp_name'], $finalDestination, 1920, 82);
    }

    // Fallback jika berupa PDF atau konversi GD gagal
    if (!$saved) {
        $finalFilename = $baseName . '.' . $detectedExt;
        $finalDestination = $uploadDir . $finalFilename;
        $saved = @move_uploaded_file($file['tmp_name'], $finalDestination);
        if (!$saved) {
            $saved = @copy($file['tmp_name'], $finalDestination);
        }
    }

    if ($saved) {
        @chmod($finalDestination, 0644); // Hak akses aman: Read-only untuk public
        $publicUrl = $urlPrefix . '/' . $finalFilename;
        respondJson([
            'success' => true,
            'url' => $publicUrl,
            'filename' => $finalFilename,
            'format' => pathinfo($finalFilename, PATHINFO_EXTENSION),
            'size' => filesize($finalDestination)
        ]);
    } else {
        respondJson(['success' => false, 'error' => 'Gagal menyimpan berkas ke server.'], 500);
    }
}

// ─── 2. Handle Base64 Upload ───────────────────────────────────
$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);

if (is_array($payload) && !empty($payload['image'])) {
    $base64Data = $payload['image'];

    if (preg_match('/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+\/=\r\n]+)$/', $base64Data, $matches)) {
        $data = $matches[2];
        $decoded = base64_decode($data, true);

        if ($decoded === false || strlen($decoded) > 5 * 1024 * 1024) {
            respondJson(['success' => false, 'error' => 'Payload Base64 tidak valid atau melebihi 5MB.'], 400);
        }

        $randomHash = bin2hex(random_bytes(16));
        $baseName = 'media_' . date('Ymd_His') . '_' . $randomHash;
        $tempFile = $uploadDir . 'tmp_' . $baseName . '.raw';
        file_put_contents($tempFile, $decoded);

        $detectedExt = '';
        $isRaster = false;
        $validationError = validateUploadedFile($tempFile, 'upload.jpg', $detectedExt, $isRaster);

        if ($validationError !== null) {
            @unlink($tempFile);
            respondJson(['success' => false, 'error' => $validationError], 400);
        }

        $finalFilename = $baseName . '.webp';
        $finalDestination = $uploadDir . $finalFilename;

        $saved = sanitizeAndConvertToWebp($tempFile, $finalDestination, 1920, 82);
        @unlink($tempFile);

        if ($saved) {
            @chmod($finalDestination, 0644);
            $publicUrl = $urlPrefix . '/' . $finalFilename;
            respondJson([
                'success' => true,
                'url' => $publicUrl,
                'filename' => $finalFilename,
                'format' => 'webp',
                'size' => filesize($finalDestination)
            ]);
        } else {
            respondJson(['success' => false, 'error' => 'Gagal memproses gambar.'], 500);
        }
    } else {
        respondJson(['success' => false, 'error' => 'Format Base64 gambar tidak valid.'], 400);
    }
}

respondJson(['success' => false, 'error' => 'Tidak ada berkas yang diunggah.'], 400);
