<?php

require_once __DIR__ . '/util.php';
cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$res = mysqli_query($conn, "SELECT id, username, role, created_at FROM users WHERE role = 'student' ORDER BY id DESC");
if (!$res) {
  json_response(['status' => 'error', 'ok' => false, 'message' => 'Query failed'], 500);
}

$users = [];
while ($row = mysqli_fetch_assoc($res)) {
  $users[] = [
    'id' => (int)$row['id'],
    'username' => $row['username'],
    'role' => $row['role'],
    'createdAt' => $row['created_at'],
  ];
}

json_response(['status' => 'success', 'ok' => true, 'users' => $users]);

