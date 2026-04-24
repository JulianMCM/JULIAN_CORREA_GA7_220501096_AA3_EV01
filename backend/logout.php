<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/session-bootstrap.php';
ensureProjectSessionStarted();

$_SESSION = [];
session_destroy();

echo json_encode([
    'status' => 'success',
    'message' => 'Sesión cerrada correctamente.',
], JSON_UNESCAPED_UNICODE);
