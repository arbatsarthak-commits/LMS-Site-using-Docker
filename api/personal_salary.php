<?php

require_once __DIR__ . '/util.php';
require_once __DIR__ . '/salary_rules.php';

cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$base = isset($_GET['base']) ? (float)$_GET['base'] : 5000.0;

$agg = salary_aggregate_from_students($conn, null);
if (!$agg['ok']) {
  json_response(['ok' => false, 'error' => 'Query failed', 'details' => $agg['error'] ?? ''], 500);
}

$rows = salary_buckets_to_rows($agg['buckets'], null);
$out = [];
foreach ($rows as $r) {
  $incentive = (float)$r['totalSalary'];
  $out[] = [
    'name' => $r['name'],
    'role' => $r['role'],
    'incentive' => round($incentive, 2),
    'total' => round($base + $incentive, 2),
  ];
}

usort($out, static function ($a, $b) {
  return ($b['total'] <=> $a['total']);
});

json_response($out);
