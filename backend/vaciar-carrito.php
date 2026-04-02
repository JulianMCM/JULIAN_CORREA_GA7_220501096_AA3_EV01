<?php
session_start();
include("../config/db.php");

$idUsuario = $_SESSION['id'];

$sql = "DELETE cv FROM Carrito_Videojuego cv
        INNER JOIN Carrito c ON cv.IdCarrito = c.IdCarrito
        WHERE c.IdUsuario = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idUsuario);
$stmt->execute();

echo json_encode(["status" => "success"]);