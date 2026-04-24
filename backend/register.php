<?php
require_once __DIR__ . '/api-bootstrap.php';

$data = getJsonInput();
$nombreUsuario = trim($data['nombreUsuario'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$pais = trim($data['pais'] ?? '');

if ($nombreUsuario === '' || $email === '' || $password === '' || $pais === '') {
    apiResponse([
        'status' => 'error',
        'message' => 'Todos los campos son obligatorios.',
    ], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    apiResponse([
        'status' => 'error',
        'message' => 'Correo electrónico inválido.',
    ], 400);
}

if (strlen($password) < 6) {
    apiResponse([
        'status' => 'error',
        'message' => 'La contraseña debe tener mínimo 6 caracteres.',
    ], 400);
}

if (strlen($nombreUsuario) < 3) {
    apiResponse([
        'status' => 'error',
        'message' => 'El nombre de usuario debe tener al menos 3 caracteres.',
    ], 400);
}

$checkEmail = $conn->prepare('SELECT IdUsuario FROM Usuario WHERE Correo = ?');
$checkEmail->bind_param('s', $email);
$checkEmail->execute();
$resultEmail = $checkEmail->get_result();

if ($resultEmail->num_rows > 0) {
    $checkEmail->close();
    apiResponse([
        'status' => 'error',
        'message' => 'El correo ya está registrado.',
    ], 409);
}
$checkEmail->close();

$checkUser = $conn->prepare('SELECT IdUsuario FROM Usuario WHERE NombreUsuario = ?');
$checkUser->bind_param('s', $nombreUsuario);
$checkUser->execute();
$resultUser = $checkUser->get_result();

if ($resultUser->num_rows > 0) {
    $checkUser->close();
    apiResponse([
        'status' => 'error',
        'message' => 'El nombre de usuario ya está en uso.',
    ], 409);
}
$checkUser->close();

$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare('INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, Pais) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssss', $nombreUsuario, $email, $passwordHash, $pais);
$stmt->execute();
$stmt->close();

apiResponse(['status' => 'success'], 201);
