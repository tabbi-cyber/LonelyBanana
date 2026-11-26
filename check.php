<?php
// Open http://localhost/lonelybanana/check.php to find setup problems.
// Delete this file before putting the site online.
header('Content-Type: text/plain; charset=utf-8');
require __DIR__ . '/config.php';

echo "PHP is running: version " . PHP_VERSION . "\n";

if (!extension_loaded('pdo_mysql')) {
    echo "PROBLEM: the pdo_mysql PHP extension is not enabled.\n";
    exit;
}
echo "pdo_mysql extension: OK\n";

try {
    $db = getDb();
    echo "Connected to database '" . DB_NAME . "': OK\n";
} catch (Throwable $e) {
    echo "PROBLEM: cannot connect.\n" . $e->getMessage() . "\n";
    echo "Check: MySQL is started, database.sql was imported, and DB_USER / DB_PASS in config.php match phpMyAdmin.\n";
    exit;
}

try {
    $row = $db->query('SELECT total FROM counter WHERE id = 1')->fetch();
    if ($row) {
        echo "Counter row found. Current total: " . $row['total'] . "\n";
        echo "\nEverything works.\n";
    } else {
        echo "PROBLEM: table 'counter' exists but has no row with id = 1.\n";
        echo "Run in phpMyAdmin: INSERT INTO counter (id, total) VALUES (1, 0);\n";
    }
} catch (Throwable $e) {
    echo "PROBLEM: table 'counter' not found or unreadable.\n" . $e->getMessage() . "\n";
    echo "Import database.sql again in phpMyAdmin.\n";
}