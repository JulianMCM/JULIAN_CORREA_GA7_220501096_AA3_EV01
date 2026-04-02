<?php
session_start();
header("Content-Type: application/json");
include("../config/db.php");

if (!isset($_SESSION['id'])) {
  echo json_encode(["status" => "error", "message" => "No autenticado"]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$idUsuario = $_SESSION['id'];
$idVideojuego = $data['idVideojuego'] ?? null;

if (!$idVideojuego) {
  echo json_encode(["status" => "error", "message" => "ID requerido"]);
  exit;
}

$conn->begin_transaction();

try {
  // 1. Obtener o crear carrito
  $stmt = $conn->prepare("SELECT IdCarrito FROM Carrito WHERE IdUsuario = ?");
  $stmt->bind_param("i", $idUsuario);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 0) {
    $stmt = $conn->prepare("INSERT INTO Carrito (IdUsuario) VALUES (?)");
    $stmt->bind_param("i", $idUsuario);
    $stmt->execute();
    $idCarrito = $stmt->insert_id;
  } else {
    $row = $result->fetch_assoc();
    $idCarrito = $row['IdCarrito'];
  }

  // 2. Insertar juego (evitar duplicados)
  $stmt = $conn->prepare("INSERT IGNORE INTO Carrito_Videojuego (IdCarrito, IdVideojuego) VALUES (?, ?)");
  $stmt->bind_param("ii", $idCarrito, $idVideojuego);
  $stmt->execute();

  $conn->commit();

  echo json_encode(["status" => "success"]);

} catch (Exception $e) {
  $conn->rollback();
  echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}