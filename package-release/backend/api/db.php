<?php
/**
 * IYMPACK CMS — Database Connection & Hardened Security Core
 * 
 * Lapisan Keamanan:
 * - Strict Non-Wildcard CORS (Hanya domain terotorisasi)
 * - Anti-Cache & Privacy Headers
 * - Emulated Prepared Statements OFF (Mencegah SQL Injection di level PDO engine)
 * - Safe Error Masking (Mencegah Information Disclosure OWASP A05)
 */

// Matikan raw error leakage
ini_set('display_errors', '0');
error_reporting(E_ALL);

function setSecureCorsHeaders() {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    $matchedOrigin = null;

    if (!empty($origin)) {
        $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
        $originHost = parse_url($origin, PHP_URL_HOST);

        if ($originHost && $host && ($originHost === $host || strpos($originHost, $host) !== false)) {
            $matchedOrigin = $origin;
        } elseif (preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#i', $origin)) {
            $matchedOrigin = $origin;
        } elseif (preg_match('#^https?://([a-z0-9\-]+\.)*(iympack\.id|iympack\.org|hostingerapp\.com|preview-domain\.com)$#i', $origin)) {
            $matchedOrigin = $origin;
        }
    }

    if ($matchedOrigin) {
        header("Access-Control-Allow-Origin: $matchedOrigin");
        header('Access-Control-Allow-Credentials: true');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires, X-Auth-Token');
    header('Access-Control-Max-Age: 86400');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('X-LiteSpeed-Cache-Control: no-cache');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
}

// Helper function untuk mengekstrak Bearer token dari HTTP headers, query, atau body payload
function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    } elseif (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        return trim($_SERVER['HTTP_X_AUTH_TOKEN']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        } elseif (isset($requestHeaders['authorization'])) {
            $headers = trim($requestHeaders['authorization']);
        } elseif (isset($requestHeaders['X-Auth-Token'])) {
            return trim($requestHeaders['X-Auth-Token']);
        }
    }
    if (!empty($headers) && preg_match('/Bearer\s+(\S+)/i', $headers, $matches)) {
        return $matches[1];
    }
    // Cek query string (?token=...)
    if (!empty($_GET['token']) && is_string($_GET['token'])) {
        return trim($_GET['token']);
    }
    // Cek POST form data
    if (!empty($_POST['token']) && is_string($_POST['token'])) {
        return trim($_POST['token']);
    }
    // Cek JSON payload body
    global $payload;
    if (is_array($payload) && !empty($payload['token']) && is_string($payload['token'])) {
        return trim($payload['token']);
    }
    return null;
}

// Helper function untuk memverifikasi apakah request berasal dari Admin aktif
function getAuthenticatedUser($pdo) {
    $token = getBearerToken();
    if (empty($token) || !preg_match('/^[a-f0-9]{32,64}$/i', $token)) {
        return null;
    }

    if ($pdo !== null) {
        try {
            $stmt = $pdo->prepare("
                SELECT `token`, `user_id`, `email`, `role`, `expires_at`
                FROM `iympack_sessions`
                WHERE `token` = ? AND `expires_at` > NOW()
                LIMIT 1
            ");
            $stmt->execute([$token]);
            $user = $stmt->fetch();
            if ($user) {
                // Auto-extend sliding session selama 30 hari ke depan saat aktif digunakan
                try {
                    $extStmt = $pdo->prepare("UPDATE `iympack_sessions` SET `expires_at` = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE `token` = ?");
                    $extStmt->execute([$token]);
                } catch (Throwable $e) {}
                return $user;
            }
        } catch (Throwable $e) {
            error_log('[Auth Check Error] ' . $e->getMessage());
        }
    }

    // Fallback file mode jika MySQL offline atau session baru tercatat di JSON
    $sessFile = __DIR__ . '/data/sessions.json';
    if (file_exists($sessFile)) {
        $sessions = json_decode(@file_get_contents($sessFile), true);
        if (is_array($sessions) && isset($sessions[$token])) {
            $sess = $sessions[$token];
            if (isset($sess['expires_at']) && strtotime($sess['expires_at']) > time()) {
                if ($pdo !== null) {
                    try {
                        $ins = $pdo->prepare("INSERT IGNORE INTO `iympack_sessions` (`token`, `user_id`, `email`, `role`, `expires_at`) VALUES (?, ?, ?, ?, ?)");
                        $ins->execute([$token, $sess['user_id'] ?? 'user-custom', $sess['email'] ?? '', $sess['role'] ?? 'admin', $sess['expires_at']]);
                    } catch (Throwable $e) {}
                }
                return $sess;
            }
        }
    }
    return null;
}

// Helper function untuk mewajibkan autentikasi admin
function requireAdminAuth($pdo) {
    $user = getAuthenticatedUser($pdo);
    if (!$user) {
        respondJson([
            'success' => false,
            'error' => 'Akses ditolak: Autentikasi sesi admin diperlukan untuk tindakan ini.'
        ], 401);
    }
    return $user;
}

// Helper function untuk mewajibkan hak akses super admin
function requireSuperAdminAuth($pdo) {
    $user = requireAdminAuth($pdo);
    if (isset($user['role']) && $user['role'] !== 'super_admin') {
        respondJson([
            'success' => false,
            'error' => 'Akses ditolak: Hanya Super Admin yang berhak melakukan tindakan ini.'
        ], 403);
    }
    return $user;
}

// Helper function untuk mengirim respon JSON terenkapsulasi
function respondJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    setSecureCorsHeaders();
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    respondJson(['status' => 'ok']);
}

$lastDbError = null;

function getDbConnection() {
    global $lastDbError;
    static $pdo = null;
    static $attempted = false;

    if ($attempted) {
        return $pdo;
    }
    $attempted = true;

    $config = require __DIR__ . '/config.php';

    // Pastikan direktori uploads ada
    if (!is_dir($config['upload_dir'])) {
        @mkdir($config['upload_dir'], 0755, true);
    }

    try {
        $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['dbname']};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Nonaktifkan emulasi prepared statements agar dieksekusi native oleh MySQL server (Anti SQLi)
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 3,
        ];
        $pdo = new PDO($dsn, $config['username'], $config['password'], $options);

        // Auto-create table iympack_collections jika belum ada (dengan index pada updated_at)
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `iympack_collections` (
                `name` VARCHAR(64) NOT NULL PRIMARY KEY,
                `data` LONGTEXT NOT NULL,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_updated_at` (`updated_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $lastDbError = null;
        return $pdo;
    } catch (Throwable $e) {
        // Jangan pernah menampilkan kredensial atau stack trace ke publik
        error_log('[DB Error] ' . $e->getMessage());
        $lastDbError = 'Koneksi database gagal diproses.';
        $pdo = null;
        return null;
    }
}

function getDbError() {
    global $lastDbError;
    return $lastDbError;
}
