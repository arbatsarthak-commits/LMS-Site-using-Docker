<?php

require_once __DIR__ . '/util.php';
cors();
require_method('POST');

require_once __DIR__ . '/auth.php';
$user = require_auth('admin');

global $conn;

$body = read_json_body();

$name = trim((string)($body['name'] ?? ''));
$course = trim((string)($body['course'] ?? ''));
$faculty = trim((string)($body['faculty'] ?? ''));
$frontOffice = trim((string)($body['frontOffice'] ?? ''));
$labInstructor = trim((string)($body['labInstructor'] ?? ''));

// Optional: also create a login for the student
$studentUsername = trim((string)($body['username'] ?? ''));
$studentPassword = (string)($body['password'] ?? '');

if ($name === '' || $course === '') {
  json_response(['ok' => false, 'error' => 'Name and course are required'], 400);
}

mysqli_begin_transaction($conn);
try {
  $studentUserId = null;
  if ($studentUsername !== '' && $studentPassword !== '') {
    // Ensure unique username
    $stmtU = mysqli_prepare($conn, 'SELECT id FROM users WHERE username = ? LIMIT 1');
    mysqli_stmt_bind_param($stmtU, 's', $studentUsername);
    mysqli_stmt_execute($stmtU);
    $resU = mysqli_stmt_get_result($stmtU);
    $exists = $resU ? mysqli_fetch_assoc($resU) : null;
    mysqli_stmt_close($stmtU);

    if ($exists) {
      throw new Exception('Username already exists');
    }

    $hash = password_hash($studentPassword, PASSWORD_DEFAULT);
    $role = 'student';
    $stmtInsU = mysqli_prepare($conn, 'INSERT INTO users (username, password_hash, password, role) VALUES (?, ?, ?, ?)');
    mysqli_stmt_bind_param($stmtInsU, 'ssss', $studentUsername, $hash, $studentPassword, $role);
    if (!mysqli_stmt_execute($stmtInsU)) {
      throw new Exception('Failed to create user: ' . mysqli_error($conn));
    }
    $studentUserId = mysqli_insert_id($conn);
    mysqli_stmt_close($stmtInsU);
  }

  $stmt = mysqli_prepare(
    $conn,
    'INSERT INTO students (user_id, name, course, faculty, front_office, lab_instructor) VALUES (?, ?, ?, ?, ?, ?)'
  );
  $uid = $studentUserId ? (int)$studentUserId : null;
  mysqli_stmt_bind_param($stmt, 'isssss', $uid, $name, $course, $faculty, $frontOffice, $labInstructor);
  if (!mysqli_stmt_execute($stmt)) {
    throw new Exception('Failed to insert student: ' . mysqli_error($conn));
  }
  $studentId = (int)mysqli_insert_id($conn);
  mysqli_stmt_close($stmt);

  mysqli_commit($conn);

  json_response([
    'ok' => true,
    'student' => [
      'id' => $studentId,
      'name' => $name,
      'course' => $course,
      'faculty' => $faculty,
      'frontOffice' => $frontOffice,
      'labInstructor' => $labInstructor,
    ],
  ]);
} catch (Exception $e) {
  mysqli_rollback($conn);
  json_response(['ok' => false, 'error' => $e->getMessage()], 400);
}

