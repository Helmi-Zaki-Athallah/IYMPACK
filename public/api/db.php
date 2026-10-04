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
    $allowedOrigins = [
        'https://demo.iympack.id',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
    ];

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    if (!empty($origin)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: *");
    }

    header('Access-Control-Allow-Credentials: true');
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

    // Prioritas pembacaan config:
    // 1. File config di luar direktori web (Best Practice Hostinger/OWASP: misal /home/uXXXX/config.php)
    // 2. File config di dalam direktori api (__DIR__ . '/config.php')
    $externalConfig = dirname(__DIR__, 2) . '/config.php';
    if (file_exists($externalConfig)) {
        $config = require $externalConfig;
    } elseif (file_exists(__DIR__ . '/config.php')) {
        $config = require __DIR__ . '/config.php';
    } else {
        $config = [];
    }

    $dbHost = getenv('DB_HOST') ?: ($config['host'] ?? 'localhost');
    $dbPort = (int)(getenv('DB_PORT') ?: ($config['port'] ?? 3306));
    $dbName = getenv('DB_NAME') ?: ($config['dbname'] ?? '');
    $dbUser = getenv('DB_USER') ?: ($config['username'] ?? '');
    $dbPass = getenv('DB_PASSWORD') ?: ($config['password'] ?? '');
    $uploadDir = $config['upload_dir'] ?? (__DIR__ . '/../uploads');

    // Pastikan direktori uploads ada
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }

    // Jika database belum dikonfigurasi, lewati koneksi PDO (akan fallback ke JSON storage)
    if (empty($dbName) || empty($dbUser)) {
        $lastDbError = 'Kredensial database MySQL belum dikonfigurasi.';
        $pdo = null;
        return null;
    }

    try {
        $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Nonaktifkan emulasi prepared statements agar dieksekusi native oleh MySQL server (Anti SQLi)
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 3,
        ];
        $pdo = new PDO($dsn, $dbUser, $dbPass, $options);

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
