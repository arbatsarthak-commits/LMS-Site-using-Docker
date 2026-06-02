<?php

require_once __DIR__ . '/util.php';
require_once __DIR__ . '/dashboard_helpers.php';

cors();
require_method('GET');

require_once __DIR__ . '/auth.php';
require_auth('admin');

global $conn;

$stats = dash_build_stats($conn);
$stats['courseTrendPercent'] = 0.0;

json_response(['ok' => true, 'stats' => $stats]);
