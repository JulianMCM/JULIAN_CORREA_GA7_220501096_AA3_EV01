<?php
session_start();
header("Content-Type: application/json");
include("../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$idUsuario = $_SESSION['id'];
$idVideojuego = $data['idVideojuego'];

$sql = "DELETE cv FROM Carrito_Videojuego cv
        INNER JOIN Carrito c ON cv.IdCarrito = c.IdCarrito
        WHERE c.IdUsuario = ? AND cv.IdVideojuego = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $idUsuario, $idVideojuego);
$stmt->execute();

echo json_encode(["status" => "success"]);