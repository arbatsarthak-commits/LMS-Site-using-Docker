<?php

require_once __DIR__ . '/util.php';
cors();
require_method('GET');

require_once __DIR__ . '/db.php';

global $conn;

$result = mysqli_query($conn, 'SELECT id, name, fee FROM courses ORDER BY id ASC');
if (!$result) {
  json_response(['ok' => false, 'error' => 'Query failed', 'details' => mysqli_error($conn)], 500);
}

$courses = [];
while ($row = mysqli_fetch_assoc($result)) {
  $courses[] = [
    'id' => (int)$row['id'],
    'name' => $row['name'],
    'fee' => (float)$row['fee'],
  ];
}

json_response(['ok' => true, 'courses' => $courses]);

