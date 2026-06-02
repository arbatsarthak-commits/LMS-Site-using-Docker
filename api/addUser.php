<?php

require_once __DIR__ . '/util.php';
cors();
require_method('POST');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$body = read_json_body();
$studentName = trim((string)($body['studentName'] ?? ''));
$username = trim((string)($body['username'] ?? ''));
$password = trim((string)($body['password'] ?? ''));
$course = trim((string)($body['course'] ?? 'MSCIT'));

if ($username === '' || $password === '') {
  json_response(['status' => 'error', 'message' => 'Username and password required', 'ok' => false], 400);
}

$role = 'student';
$hash = password_hash($password, PASSWORD_DEFAULT);

mysqli_begin_transaction($conn);
try {
  $check = mysqli_prepare($conn, 'SELECT id FROM users WHERE username = ? LIMIT 1');
  mysqli_stmt_bind_param($check, 's', $username);
  mysqli_stmt_execute($check);
  $res = mysqli_stmt_get_result($check);
  $exists = $res ? mysqli_fetch_assoc($res) : null;
  mysqli_stmt_close($check);
  if ($exists) {
    throw new Exception('Username already exists');
  }

  $stmt = mysqli_prepare($conn, 'INSERT INTO users (username, password_hash, password, role) VALUES (?, ?, ?, ?)');
  mysqli_stmt_bind_param($stmt, 'ssss', $username, $hash, $password, $role);
  if (!mysqli_stmt_execute($stmt)) {
    throw new Exception('Failed to create user: ' . mysqli_error($conn));
  }
  $userId = (int)mysqli_insert_id($conn);
  mysqli_stmt_close($stmt);

  if ($studentName !== '') {
    $faculty = '';
    $front = '';
    $lab = '';
    $stmtS = mysqli_prepare(
      $conn,
      'INSERT INTO students (user_id, name, course, faculty, front_office, lab_instructor) VALUES (?, ?, ?, ?, ?, ?)'
    );
    mysqli_stmt_bind_param($stmtS, 'isssss', $userId, $studentName, $course, $faculty, $front, $lab);
    mysqli_stmt_execute($stmtS);
    mysqli_stmt_close($stmtS);
  }

  mysqli_commit($conn);
  json_response(['status' => 'success', 'ok' => true, 'message' => 'Student login created']);
} catch (Exception $e) {
  mysqli_rollback($conn);
  json_response(['status' => 'error', 'ok' => false, 'message' => $e->getMessage()], 400);
}

