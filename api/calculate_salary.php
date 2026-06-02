<?php

require_once __DIR__ . '/util.php';
require_once __DIR__ . '/salary_rules.php';

cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$month = isset($_GET['month']) ? trim((string)$_GET['month']) : '';
if ($month === '') {
  $month = null;
}

$roleFilter = isset($_GET['role']) ? trim((string)$_GET['role']) : '';
$allowedRoles = ['teacher', 'front_office', 'lab_instructor'];
if ($roleFilter !== '' && !in_array($roleFilter, $allowedRoles, true)) {
  json_response(['ok' => false, 'error' => 'Invalid role filter'], 400);
}
if ($roleFilter === '') {
  $roleFilter = null;
}

$agg = salary_aggregate_from_students($conn, $month);
if (!$agg['ok']) {
  json_response(['ok' => false, 'error' => 'Aggregation failed', 'details' => $agg['error'] ?? ''], 500);
}

$rows = salary_buckets_to_rows($agg['buckets'], $roleFilter);
$totalPayout = 0.0;
foreach ($rows as $r) {
  $totalPayout += (float)$r['totalSalary'];
}

json_response([
  'ok' => true,
  'month' => $month ?? 'all',
  'totalPayout' => round($totalPayout, 2),
  'staffCount' => count($rows),
  'salaries' => $rows,
  // Flat array alias for clients expecting a top-level list
  'data' => $rows,
]);
