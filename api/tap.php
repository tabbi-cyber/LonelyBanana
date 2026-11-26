<?php
require __DIR__ . '/../config.php';
header('Content-Type: application/json');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'use POST']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$count = $body['count'] ?? null;

if (!is_int($count) || $count < 1 || $count > 1000) {
    http_response_code(400);
    echo json_encode(['error' => 'count must be a whole number from 1 to 1000']);
    exit;
}

try {
    $db = getDb();

    // The add happens inside MySQL, so no tap is lost
    // even when many people tap at the same time.
    $stmt = $db->prepare('UPDATE counter SET total = total + :n WHERE id = 1');
    $stmt->execute([':n' => $count]);

    $row = $db->query('SELECT total FROM counter WHERE id = 1')->fetch();
    echo json_encode(['total' => (int)$row['total']]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'database error']);
}