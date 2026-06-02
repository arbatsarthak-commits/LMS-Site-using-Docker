<?php

require_once __DIR__ . '/util.php';
cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
$user = require_auth();

global $conn;

$uid = (int)$user['id'];

$sql = "
  SELECT
    c.id AS course_id,
    c.name,
    c.fee,
    (SELECT COUNT(*) FROM payments p WHERE p.user_id = ? AND p.course_id = c.id AND p.status = 'paid') AS paid_count
  FROM course_registrations r
  JOIN courses c ON c.id = r.course_id
  WHERE r.user_id = ?
  ORDER BY r.id DESC
";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'ii', $uid, $uid);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);
$out = [];
while ($row = mysqli_fetch_assoc($res)) {
  $out[] = [
    'id' => (int)$row['course_id'],
    'name' => $row['name'],
    'fee' => (float)$row['fee'],
    'paid' => ((int)$row['paid_count']) > 0,
  ];
}
mysqli_stmt_close($stmt);

json_response(['ok' => true, 'courses' => $out]);

