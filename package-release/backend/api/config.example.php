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
    'host' => 'localhost',

    // Nama database yang Anda buat di Hostinger (misal: u123456789_iympack)
    'dbname' => 'u123456789_iympack',

    // Username database di Hostinger (misal: u123456789_admin)
    'username' => 'u123456789_admin',

    // Password database yang Anda atur saat membuat database di Hostinger
    'password' => 'PasswordDatabaseAnda123!',

    // Port MySQL default
    'port' => 3306,

    // Folder tujuan upload gambar (relatif terhadap direktori root website)
    'upload_dir' => __DIR__ . '/../uploads',

    // URL path publik untuk file yang di-upload
    'upload_url_prefix' => '/uploads'
];
