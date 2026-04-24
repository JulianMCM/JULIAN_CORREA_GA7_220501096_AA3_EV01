<?php
$defaultConfig = [
    'host' => '127.0.0.1',
    'user' => 'root',
    'password' => 'root',
    'database' => 'PlayCoreDB',
    'port' => 3308,
];

$localConfigPath = __DIR__ . '/db.local.php';
$localConfig = file_exists($localConfigPath) ? require $localConfigPath : [];
$config = array_merge($defaultConfig, is_array($localConfig) ? $localConfig : []);

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = new mysqli(
        $config['host'],
        $config['user'],
        $config['password'],
        $config['database'],
        (int) $config['port']
    );
    $conn->set_charset('utf8mb4');
} catch (mysqli_sql_exception $exception) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => 'error',
        'message' => 'No fue posible conectar con la base de datos MySQL.',
        'detail' => $exception->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
