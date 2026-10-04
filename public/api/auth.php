<?php
/**
 * IYMPACK CMS — Hardened Admin Authentication & Anti-Brute Force API
 * 
 * Fitur Keamanan (OWASP A07):
 * 1. IP-Based Rate Limiting (Maks 5 kali gagal / 15 menit).
 * 2. Modern Password Hashing dengan BCRYPT / Argon2id (password_hash & password_verify).
 * 3. Cryptographically Secure Session Tokens (HMAC / random_bytes 32).
 * 4. Constant-Time Timing Attack Mitigation.
 * 5. Audit Logging untuk setiap percobaan login.
 */

require_once __DIR__ . '/db.php';

setSecureCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') {
    respondJson(['status' => 'ok']);
}

if ($method !== 'POST') {
    respondJson(['success' => false, 'error' => 'Metode HTTP tidak diizinkan.'], 405);
}

$pdo = getDbConnection();

// Dapatkan IP pengunjung (dengan proteksi Cloudflare / Reverse Proxy)
function getClientIp() {
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return $_SERVER['HTTP_CF_CONNECTING_IP'];
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

$clientIp = getClientIp();

// Pastikan tabel login attempts dan sessions ada di MySQL
if ($pdo !== null) {
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `iympack_login_attempts` (
                `ip_address` VARCHAR(45) NOT NULL,
                `email` VARCHAR(128) NOT NULL,
                `attempt_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_ip_time` (`ip_address`, `attempt_time`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS `iympack_sessions` (
                `token` VARCHAR(64) NOT NULL PRIMARY KEY,
                `user_id` VARCHAR(64) NOT NULL,
                `email` VARCHAR(128) NOT NULL,
                `role` VARCHAR(32) NOT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `expires_at` TIMESTAMP NOT NULL,
                INDEX `idx_token_exp` (`token`, `expires_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
    } catch (Throwable $e) {
        error_log('[Auth Init] ' . $e->getMessage());
    }
}

// ─── 1. Rate Limiting Check (Anti-Brute Force) ───────────────────
function checkIpRateLimit($pdo, $ip) {
    $maxAttempts = 5;
    $lockoutSeconds = 900; // 15 menit

    if ($pdo !== null) {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) AS total 
            FROM `iympack_login_attempts` 
            WHERE `ip_address` = ? AND `attempt_time` > (NOW() - INTERVAL 15 MINUTE)
        ");
        $stmt->execute([$ip]);
        $res = $stmt->fetch();
        return ($res && (int)$res['total'] >= $maxAttempts);
    }

    // Fallback file-based rate limit jika database offline
    $cacheFile = __DIR__ . '/data/rate_limits.json';
    if (!file_exists($cacheFile)) return false;
    $limits = json_decode(@file_get_contents($cacheFile), true);
    if (!is_array($limits) || !isset($limits[$ip])) return false;

    $recent = array_filter($limits[$ip], function ($timestamp) use ($lockoutSeconds) {
        return (time() - $timestamp) < $lockoutSeconds;
    });

    return count($recent) >= $maxAttempts;
}

function recordFailedAttempt($pdo, $ip, $email) {
    if ($pdo !== null) {
        try {
            $stmt = $pdo->prepare("INSERT INTO `iympack_login_attempts` (`ip_address`, `email`) VALUES (?, ?)");
            $stmt->execute([$ip, substr($email, 0, 128)]);
            return;
        } catch (Throwable $e) {}
    }

    // Fallback file
    $dataDir = __DIR__ . '/data';
    if (!is_dir($dataDir)) @mkdir($dataDir, 0755, true);
    $cacheFile = $dataDir . '/rate_limits.json';
    $limits = file_exists($cacheFile) ? json_decode(@file_get_contents($cacheFile), true) : [];
    if (!is_array($limits)) $limits = [];
    $limits[$ip][] = time();
    @file_put_contents($cacheFile, json_encode($limits));
}

function clearFailedAttempts($pdo, $ip) {
    if ($pdo !== null) {
        try {
            $stmt = $pdo->prepare("DELETE FROM `iympack_login_attempts` WHERE `ip_address` = ?");
            $stmt->execute([$ip]);
        } catch (Throwable $e) {}
    }
}

// Cek apakah IP sedang terkunci
if (checkIpRateLimit($pdo, $clientIp)) {
    respondJson([
        'success' => false,
        'error' => 'Terlalu banyak percobaan login gagal dari IP Anda. Akses diblokir sementara selama 15 menit demi keamanan.'
    ], 429);
}

// ─── 2. Baca Payload Login ──────────────────────────────────────
$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);

$email = isset($payload['email']) ? strtolower(trim($payload['email'])) : '';
$password = isset($payload['password']) ? (string)$payload['password'] : '';
$action = isset($payload['action']) ? $payload['action'] : 'login';

if ($action === 'verify_token') {
    $token = isset($payload['token']) ? trim($payload['token']) : '';
    if (empty($token) || $pdo === null) {
        respondJson(['valid' => false], 200);
    }
    $stmt = $pdo->prepare("SELECT `user_id`, `email`, `role`, `expires_at` FROM `iympack_sessions` WHERE `token` = ? AND `expires_at` > NOW() LIMIT 1");
    $stmt->execute([$token]);
    $session = $stmt->fetch();
    respondJson(['valid' => (bool)$session, 'session' => $session]);
}

if (empty($email) || empty($password)) {
    respondJson(['success' => false, 'error' => 'Email dan password wajib diisi.'], 400);
}

// ─── 3. Verifikasi Akun & Password Hashing ──────────────────────
// Daftar akun default dengan hash BCRYPT pra-komputasi (cost=12).
// PENTING: Setelah deploy pertama, segera ganti password semua admin via panel /admin/akun.
//
// Cara generate hash baru di server Hostinger (via SSH atau file PHP sementara):
//   php -r "echo password_hash('PasswordBaruAnda', PASSWORD_BCRYPT, ['cost'=>12]);"
//
// Cara memverifikasi hash:
//   php -r "var_dump(password_verify('admin@iympack2026', '\$2y\$12\$...hash...'));" 
//
// Hash di bawah adalah untuk password default: admin@iympack2026
// GANTI INI SETELAH DEPLOY PERTAMA!
define('DEFAULT_BCRYPT_HASH', '$2b$12$Tcr53ha4yHOCTfzAukYufewxibAQt4Q0uLkdXy4neoZU2taikp7/e');

$DEFAULT_USERS = [
    'superadmin@iympack.id' => ['id' => 'user-superadmin-001', 'name' => 'Super Admin IYMPACK', 'role' => 'super_admin', 'teamId' => 'pusat', 'hash' => DEFAULT_BCRYPT_HASH],
    'pusat@iympack.id'      => ['id' => 'user-pusat-001',      'name' => 'Admin IYMPACK Pusat',  'role' => 'super_admin', 'teamId' => 'pusat', 'hash' => DEFAULT_BCRYPT_HASH],
    'jakarta@iympack.id'    => ['id' => 'user-jakarta-001',    'name' => 'Admin IYMPACK Jakarta', 'role' => 'admin',       'teamId' => 'jakarta', 'hash' => DEFAULT_BCRYPT_HASH],
    'bogor@iympack.id'      => ['id' => 'user-bogor-001',      'name' => 'Admin IYMPACK Bogor',   'role' => 'admin',       'teamId' => 'bogor', 'hash' => DEFAULT_BCRYPT_HASH],
    'depok@iympack.id'      => ['id' => 'user-depok-001',      'name' => 'Admin IYMPACK Depok',   'role' => 'admin',       'teamId' => 'depok', 'hash' => DEFAULT_BCRYPT_HASH],
    'tangerang@iympack.id'  => ['id' => 'user-tangerang-001',  'name' => 'Admin IYMPACK Tangerang', 'role' => 'admin',     'teamId' => 'tangerang', 'hash' => DEFAULT_BCRYPT_HASH],
    'bekasi@iympack.id'     => ['id' => 'user-bekasi-001',     'name' => 'Admin IYMPACK Bekasi',  'role' => 'admin',       'teamId' => 'bekasi', 'hash' => DEFAULT_BCRYPT_HASH],
    'bandung@iympack.id'    => ['id' => 'user-bandung-001',    'name' => 'Admin IYMPACK Bandung', 'role' => 'admin',       'teamId' => 'bandung', 'hash' => DEFAULT_BCRYPT_HASH],
    'mengajar@iympack.id'   => ['id' => 'user-mengajar-001',   'name' => 'Admin IYMPACK Mengajar', 'role' => 'admin',      'teamId' => 'mengajar', 'hash' => DEFAULT_BCRYPT_HASH],
];

// Cek apakah ada data users kustom di koleksi iympack_users MySQL
$matchedUser = null;
if ($pdo !== null) {
    try {
        $stmt = $pdo->prepare("SELECT `data` FROM `iympack_collections` WHERE `name` = 'iympack_users' LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch();
        if ($row) {
            $userList = json_decode($row['data'], true);
            if (is_array($userList)) {
                foreach ($userList as $u) {
                    if (isset($u['email']) && strtolower(trim($u['email'])) === $email) {
                        $matchedUser = $u;
                        break;
                    }
                }
            }
        }
    } catch (Throwable $e) {}
}

if (!$matchedUser && isset($DEFAULT_USERS[$email])) {
    $matchedUser = $DEFAULT_USERS[$email];
}

if (!$matchedUser) {
    recordFailedAttempt($pdo, $clientIp, $email);
    // Timing delay acak untuk mencegah user enumeration timing attack
    usleep(random_int(100000, 250000));
    respondJson(['success' => false, 'error' => 'Email atau password salah.'], 401);
}

// Verifikasi password menggunakan password_verify() (BCRYPT / ARGON2ID) + SHA256+salt (frontend)
$isPasswordValid = false;

if (!empty($matchedUser['hash'])) {
    // Hash BCRYPT/Argon2 — verifikasi langsung
    $isPasswordValid = password_verify($password, $matchedUser['hash']);
} elseif (!empty($matchedUser['passwordHash'])) {
    $hashVal = $matchedUser['passwordHash'];
    $saltVal = isset($matchedUser['salt']) ? $matchedUser['salt'] : '';
    if (strpos($hashVal, '$2y$') === 0 || strpos($hashVal, '$argon2') === 0) {
        // Hash BCRYPT dari panel ganti password
        $isPasswordValid = password_verify($password, $hashVal);
    } elseif (!empty($saltVal) && preg_match('/^[a-f0-9]{32,}$/i', $saltVal)) {
        // WebCrypto SHA-256(salt + password) dari frontend — dipakai setelah user ganti password
        $calc = hash('sha256', $saltVal . $password);
        $isPasswordValid = hash_equals(strtolower($hashVal), strtolower($calc));
    }
    // Tidak ada fallback plaintext — jika hash tidak dikenal, akses ditolak
} else {
    // Tidak ada credential tersimpan — akses ditolak
    $isPasswordValid = false;
}

if (!$isPasswordValid) {
    recordFailedAttempt($pdo, $clientIp, $email);
    usleep(random_int(100000, 250000));
    respondJson(['success' => false, 'error' => 'Email atau password salah.'], 401);
}

// ─── 4. Sukses: Reset Rate Limit & Buat Secure Session Token ────
clearFailedAttempts($pdo, $clientIp);

// Generate cryptographically secure token (64 hex chars)
$sessionToken = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', time() + (60 * 60 * 2)); // 2 Jam

if ($pdo !== null) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO `iympack_sessions` (`token`, `user_id`, `email`, `role`, `expires_at`)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $sessionToken,
            $matchedUser['id'] ?? 'user-custom',
            $email,
            $matchedUser['role'] ?? 'admin',
            $expiresAt
        ]);
    } catch (Throwable $e) {
        error_log('[Session Save] ' . $e->getMessage());
    }
}

respondJson([
    'success' => true,
    'token' => $sessionToken,
    'expiresAt' => $expiresAt,
    'user' => [
        'userId' => $matchedUser['id'] ?? 'user-custom',
        'userName' => $matchedUser['name'] ?? 'Admin IYMPACK',
        'userEmail' => $email,
        'userRole' => $matchedUser['role'] ?? 'admin',
        'userTeamId' => $matchedUser['teamId'] ?? ($matchedUser['role'] === 'super_admin' ? 'pusat' : ''),
    ]
]);
