<?php
/**
 * IYMPACK CMS — Reset & Clean Posts Tool
 * 
 * Mengosongkan seluruh post (kegiatan, artikel, pendaftar, dan voucher) di database MySQL Hostinger
 * agar website mulai dari keadaan bersih (Clean Slate).
 * Akun admin dan setelan website tetap aman terjaga.
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

require_once __DIR__ . '/db.php';
setSecureCorsHeaders();

// Keamanan: Wajibkan metode POST dan kunci otorisasi rahasia untuk mencegah pembersihan data tanpa izin
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondJson(['success' => false, 'error' => 'Metode HTTP tidak diizinkan. Gunakan metode POST.'], 405);
}

$secretKey = getenv('ADMIN_SECRET_KEY') ?: '';
$providedKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? $_POST['secret_key'] ?? '';

// Jika ADMIN_SECRET_KEY belum diatur atau kunci yang dimasukkan salah, tolak akses
if (empty($secretKey) || !hash_equals($secretKey, (string)$providedKey)) {
    respondJson([
        'success' => false,
        'error' => 'Akses ditolak. Tindakan pembersihan database membutuhkan otorisasi khusus.'
    ], 403);
}

$pdo = getDbConnection();

$clearedCollections = [
    'iympack_events',
    'iympack_articles',
    'iympack_applicants',
    'iympack_gallery',
    'iympack_testimonials',
    'iympack_vouchers',
    'iympack_audit_logs'
];

if ($pdo !== null) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO `iympack_collections` (`name`, `data`)
            VALUES (:name, '[]')
            ON DUPLICATE KEY UPDATE `data` = '[]', `updated_at` = CURRENT_TIMESTAMP
        ");
        foreach ($clearedCollections as $name) {
            $stmt->execute([':name' => $name]);
        }

        // Hapus juga file fallback jika ada
        $dataFile = __DIR__ . '/data/collections.json';
        if (file_exists($dataFile)) {
            $raw = @file_get_contents($dataFile);
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                foreach ($clearedCollections as $name) {
                    $decoded[$name] = [];
                }
                @file_put_contents($dataFile, json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
            }
        }

        respondJson([
            'success' => true,
            'driver' => 'mysql',
            'message' => 'Semua post (kegiatan, artikel, pendaftar) berhasil dikosongkan dari database MySQL Hostinger!',
            'cleared' => $clearedCollections,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        respondJson([
            'success' => false,
            'error' => 'Gagal mengosongkan database: ' . $e->getMessage()
        ], 500);
    }
} else {
    // Mode file fallback
    $dataFile = __DIR__ . '/data/collections.json';
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) $decoded = [];
        foreach ($clearedCollections as $name) {
            $decoded[$name] = [];
        }
        @file_put_contents($dataFile, json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    respondJson([
        'success' => true,
        'driver' => 'file',
        'message' => 'Semua post berhasil dikosongkan dari File Storage.',
        'cleared' => $clearedCollections,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
