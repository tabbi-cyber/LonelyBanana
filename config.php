<?php
// Database settings. These are the XAMPP/WAMP defaults.
// Change them if your phpMyAdmin login is different.
const DB_HOST = 'localhost';
const DB_NAME = 'lonelybanana';
const DB_USER = 'root';
const DB_PASS = '';

function getDb(): PDO {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
    return $pdo;
}