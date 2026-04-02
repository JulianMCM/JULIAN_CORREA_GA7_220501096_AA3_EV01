<?php
session_start();
header("Content-Type: application/json");
include("../config/db.php");

if (!isset($_SESSION['id'])) {
  echo json_encode(["status" => "error"]);
  exit;
}

$idUsuario = $_SESSION['id'];

$sql = "SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio
        FROM Carrito c
        INNER JOIN Carrito_Videojuego cv ON c.IdCarrito = cv.IdCarrito
        INNER JOIN Videojuego v ON cv.IdVideojuego = v.IdVideojuego
        WHERE c.IdUsuario = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idUsuario);
$stmt->execute();
$result = $stmt->get_result();

$juegos = [];
while ($row = $result->fetch_assoc()) {
  $juegos[] = $row;
}

echo json_encode($juegos);