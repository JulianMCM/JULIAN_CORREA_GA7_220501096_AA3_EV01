<?php
include("../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$nombreUsuario = $conn->real_escape_string($data['nombreUsuario']);
$email = $conn->real_escape_string($data['email']);
$password = $conn->real_escape_string($data['password']);
$pais = $conn->real_escape_string($data['pais']);

// =========================
// VALIDAR CAMPOS VACÍOS
// =========================
if (
    empty($data['nombreUsuario']) ||
    empty($data['email']) ||
    empty($data['password']) ||
    empty($data['pais'])
) {
    echo json_encode([
        "status" => "error",
        "message" => "Todos los campos son obligatorios"
    ]);
    exit;
}

// =========================
// VALIDAR EMAIL
// =========================
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "status" => "error",
        "message" => "Correo electrónico inválido"
    ]);
    exit;
}

// =========================
// VALIDAR CONTRASEÑA
// =========================
if (strlen($password) < 6) {
    echo json_encode([
        "status" => "error",
        "message" => "La contraseña debe tener mínimo 6 caracteres"
    ]);
    exit;
}

// =========================
// VALIDAR USUARIO
// =========================
if (strlen($nombreUsuario) < 3) {
    echo json_encode([
        "status" => "error",
        "message" => "El nombre de usuario debe tener al menos 3 caracteres"
    ]);
    exit;
}

// 🔍 Verificar si el correo ya existe
$checkEmail = $conn->prepare("SELECT IdUsuario FROM usuario WHERE Correo = ?");
$checkEmail->bind_param("s", $email);
$checkEmail->execute();
$resultEmail = $checkEmail->get_result();

if ($resultEmail->num_rows > 0) {
    echo json_encode([
        "status" => "error",
        "message" => "El correo ya está registrado"
    ]);
    exit;
}

// 🔍 Verificar si el nombre de usuario ya existe
$checkUser = $conn->prepare("SELECT IdUsuario FROM usuario WHERE NombreUsuario = ?");
$checkUser->bind_param("s", $nombreUsuario);
$checkUser->execute();
$resultUser = $checkUser->get_result();

if ($resultUser->num_rows > 0) {
    echo json_encode([
        "status" => "error",
        "message" => "El nombre de usuario ya está en uso"
    ]);
    exit;
}

// 🔐 Hash de contraseña
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

// ✅ Insertar usuario
$stmt = $conn->prepare("INSERT INTO usuario (NombreUsuario, Correo, Contrasena, Pais) VALUES (?, ?, ?, ?)");

$stmt->bind_param("ssss", $nombreUsuario, $email, $passwordHash, $pais);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Error al registrar usuario"
    ]);
}

$stmt->close();
$conn->close();
?>