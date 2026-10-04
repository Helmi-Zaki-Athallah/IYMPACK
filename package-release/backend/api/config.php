<?php
/**
 * IYMPACK CMS — Hostinger Database Configuration
 * 
 * Silakan sesuaikan data koneksi database MySQL di bawah ini sesuai informasi
 * database yang dibuat di hPanel Hostinger (Menu: Databases -> MySQL Databases).
 */

header('Content-Type: application/json; charset=utf-8');

// Matikan display error raw HTML agar respon API selalu JSON valid
ini_set('display_errors', '0');
error_reporting(E_ALL);

return [
    // Host database, default di Hostinger biasanya 'localhost'
    'host' => getenv('DB_HOST') ?: 'localhost',

    // Nama database yang Anda buat di Hostinger
    'dbname' => getenv('DB_NAME') ?: 'u405306452_iympack',

    // Username database di Hostinger
    'username' => getenv('DB_USER') ?: 'u405306452_admin',

    // Password database yang Anda atur saat membuat database di Hostinger
    'password' => getenv('DB_PASSWORD') ?: 'Webiympack041124!',

    // Port MySQL default
    'port' => (int)(getenv('DB_PORT') ?: 3306),

    // Folder tujuan upload gambar (relatif terhadap direktori root website)
    'upload_dir' => __DIR__ . '/../uploads',

    // URL path publik untuk file yang di-upload
    'upload_url_prefix' => '/uploads'
];
