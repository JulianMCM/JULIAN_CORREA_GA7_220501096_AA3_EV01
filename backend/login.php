<?php
require_once __DIR__ . '/api-bootstrap.php';

$data = getJsonInput();
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if ($email === '' || $password === '') {
    apiResponse([
        'status' => 'error',
        'message' => 'Correo y contraseña son obligatorios.',
    ], 400);
}

$stmt = $conn->prepare('SELECT IdUsuario, NombreUsuario, Contrasena FROM Usuario WHERE Correo = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    apiResponse([
        'status' => 'error',
        'message' => 'Usuario no encontrado.',
    ], 404);
}

if (!password_verify($password, $user['Contrasena'])) {
    apiResponse([
        'status' => 'error',
        'message' => 'Contraseña incorrecta.',
    ], 401);
}

$_SESSION['usuario'] = $user['NombreUsuario'];
$_SESSION['id'] = (int) $user['IdUsuario'];

apiResponse(['status' => 'success']);
