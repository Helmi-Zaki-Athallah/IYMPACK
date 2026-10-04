<?php
/**
 * IYMPACK CMS — Diagnostic & Health Check Endpoint
 * Akses URL ini di browser (misal: https://domainanda.com/api/status.php)
 * untuk mengecek apakah backend PHP, folder uploads, dan database Hostinger aktif dengan benar.
 */

require_once __DIR__ . '/db.php';
$config = require __DIR__ . '/config.php';

$pdo = getDbConnection();
$dataDir = __DIR__ . '/data';
$dataFile = $dataDir . '/collections.json';
$uploadDir = rtrim($config['upload_dir'], '/\\') . '/';

$dataDirWritable = is_writable($dataDir) || @chmod($dataDir, 0777);
$dataFileWritable = file_exists($dataFile) ? is_writable($dataFile) : $dataDirWritable;
$uploadDirWritable = is_writable($uploadDir) || @chmod($uploadDir, 0777);

$collectionsCount = 0;
$driver = 'unknown';

if ($pdo !== null) {
    $driver = 'mysql';
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM `iympack_collections`");
        $collectionsCount = (int)$stmt->fetchColumn();
    } catch (Exception $e) {
        $collectionsCount = 0;
    }
} else {
    $driver = 'file';
    if (file_exists($dataFile)) {
        $raw = @file_get_contents($dataFile);
        $decoded = json_decode($raw, true);
        $collectionsCount = is_array($decoded) ? count($decoded) : 0;
    }
}

respondJson([
    'success' => true,
    'status' => 'OK',
    'timestamp' => date('Y-m-d H:i:s'),
    'driver' => $driver,
    'mysql_connected' => ($pdo !== null),
    'mysql_error' => ($pdo === null) ? getDbError() : null,
    'database_configured' => (!empty(getenv('DB_NAME')) || !empty($config['dbname'])),
    'collections_count' => $collectionsCount,
    'storage' => [
        'upload_dir' => $uploadDir,
        'upload_dir_exists' => is_dir($uploadDir),
        'upload_dir_writable' => $uploadDirWritable,
        'data_file' => $dataFile,
        'data_file_exists' => file_exists($dataFile),
        'data_file_writable' => $dataFileWritable,
    ],
    'server' => [
        'php_version' => PHP_VERSION,
        'post_max_size' => ini_get('post_max_size'),
        'upload_max_filesize' => ini_get('upload_max_filesize'),
    ]
]);
