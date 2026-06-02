<?php

require_once __DIR__ . '/util.php';
cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
require_auth(); // both roles can read

global $conn;

$res = mysqli_query($conn, 'SELECT id, title, message, created_at FROM notices ORDER BY id DESC');
if (!$res) {
  json_response(['ok' => false, 'error' => 'Query failed', 'details' => mysqli_error($conn)], 500);
}

$notices = [];
while ($row = mysqli_fetch_assoc($res)) {
  $notices[] = [
    'id' => (int)$row['id'],
    'title' => $row['title'],
    'message' => $row['message'],
    'createdAt' => $row['created_at'],
  ];
}

json_response(['ok' => true, 'notices' => $notices]);

