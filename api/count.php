<?php
require __DIR__ . '/../config.php';
header('Content-Type: application/json');
header('Cache-Control: no-store');

try {
    $db = getDb();
    $row = $db->query('SELECT total FROM counter WHERE id = 1')->fetch();
    echo json_encode(['total' => (int)$row['total']]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'database error']);
}