<?php
require_once __DIR__ . '/api-bootstrap.php';

if (!isset($_SESSION['id'])) {
    echo json_encode(['enBiblioteca' => false], JSON_UNESCAPED_UNICODE);
    exit;
}

$idUsuario = (int) $_SESSION['id'];
$idVideojuego = isset($_GET['idVideojuego']) ? (int) $_GET['idVideojuego'] : 0;

if ($idVideojuego <= 0) {
    echo json_encode(['enBiblioteca' => false], JSON_UNESCAPED_UNICODE);
    exit;
}

$sql = "SELECT bv.IdVideojuego
        FROM Biblioteca_Videojuego bv
        INNER JOIN Biblioteca b ON bv.IdBiblioteca = b.IdBiblioteca
        WHERE b.IdUsuario = ? AND bv.IdVideojuego = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param('ii', $idUsuario, $idVideojuego);
$stmt->execute();
$result = $stmt->get_result();
$stmt->close();

echo json_encode([
    'enBiblioteca' => $result->num_rows > 0,
], JSON_UNESCAPED_UNICODE);
