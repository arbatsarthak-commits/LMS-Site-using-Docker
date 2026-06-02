<?php

require_once __DIR__ . '/util.php';

// Update these if your MySQL settings differ.
// With XAMPP, root often has empty password.
$DB_HOST = env_string('DB_HOST', '127.0.0.1');
$DB_USER = env_string('DB_USER', 'root');
$DB_PASS = env_string('DB_PASS', '');
$DB_NAME = env_string('DB_NAME', 'student_management');
$DB_PORT = (int) env_string('DB_PORT', '3306');

$conn = mysqli_connect($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME, $DB_PORT);
if (!$conn) {
  json_response(['ok' => false, 'error' => 'DB connection failed', 'details' => mysqli_connect_error()], 500);
}

mysqli_set_charset($conn, 'utf8mb4');

