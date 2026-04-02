<?php
session_start();
include("../config/db.php");

// Agrega esto para debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data received"]);
    exit;
}

    $email = $conn->real_escape_string($data['email']);
    $password = $data['password']; // recibimos plaintext, no escapa aquí para password_verify

    $stmt = $conn->prepare("SELECT IdUsuario, NombreUsuario, Contrasena FROM Usuario WHERE Correo = ?");
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit;
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

if (!$result) {
        echo json_encode(["status" => "error", "message" => "Query failed: " . $conn->error]);
    exit;
}

if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['Contrasena'])) {
        $_SESSION['usuario'] = $user['NombreUsuario'];
        $_SESSION['id'] = $user['IdUsuario'];
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Wrong password"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "User not found"]);
}
$stmt->close();
$conn->close();
?>