<?php

require_once __DIR__ . '/util.php';
cors();
require_method('GET');
ensure_session_started();

$a = random_int(1, 9);
$b = random_int(1, 9);
$answer = $a + $b;

$_SESSION['captcha'] = [
  'answer' => (string)$answer,
  'expires_at' => time() + 300,
];

json_response([
  'status' => 'success',
  'ok' => true,
  'question' => "{$a} + {$b} = ?",
]);

