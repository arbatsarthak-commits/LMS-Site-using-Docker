<?php

require_once __DIR__ . '/util.php';
cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$sql = "
  SELECT
    p.id,
    u.username,
    c.name AS course,
    p.amount,
    p.status,
    p.created_at
  FROM payments p
  LEFT JOIN users u ON u.id = p.user_id
  LEFT JOIN courses c ON c.id = p.course_id
  ORDER BY p.id DESC
";

$res = mysqli_query($conn, $sql);
if (!$res) {
  json_response(['ok' => false, 'error' => 'Query failed', 'details' => mysqli_error($conn)], 500);
}

$payments = [];
while ($row = mysqli_fetch_assoc($res)) {
  $payments[] = [
    'id' => (int)$row['id'],
    'username' => $row['username'] ?? '',
    'course' => $row['course'] ?? '',
    'amount' => (float)$row['amount'],
    'status' => $row['status'] ?? '',
    'createdAt' => $row['created_at'] ?? null,
  ];
}

json_response(['ok' => true, 'payments' => $payments]);

