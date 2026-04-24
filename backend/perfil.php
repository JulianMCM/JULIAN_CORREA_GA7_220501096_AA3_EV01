<?php
require_once __DIR__ . '/api-bootstrap.php';

$userId = requireAuthenticatedUserId();

try {
    $userSql = 'SELECT NombreUsuario, Correo, Pais FROM Usuario WHERE IdUsuario = ?';
    $userStmt = $conn->prepare($userSql);
    $userStmt->bind_param('i', $userId);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    $user = $userResult->fetch_assoc();
    $userStmt->close();

    if (!$user) {
        apiResponse(['error' => 'Usuario no encontrado'], 404);
    }

    $videojuegosAdquiridos = [];
    $bibliotecaSql = "SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio, v.Genero, v.FechaLanzamiento, v.ValoracionPromedio, v.Descripcion, bv.FechaAdicion
                      FROM Biblioteca_Videojuego bv
                      INNER JOIN Biblioteca b ON bv.IdBiblioteca = b.IdBiblioteca
                      INNER JOIN Videojuego v ON bv.IdVideojuego = v.IdVideojuego
                      WHERE b.IdUsuario = ?
                      ORDER BY bv.FechaAdicion DESC";
    $biblioStmt = $conn->prepare($bibliotecaSql);
    $biblioStmt->bind_param('i', $userId);
    $biblioStmt->execute();
    $biblioResult = $biblioStmt->get_result();
    while ($row = $biblioResult->fetch_assoc()) {
        $videojuegosAdquiridos[] = $row;
    }
    $biblioStmt->close();

    $deseados = [];
    $deseadoSql = "SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio, v.Genero, v.FechaLanzamiento, v.ValoracionPromedio, v.Descripcion, d.FechaAgregado
                   FROM Deseado d
                   INNER JOIN Videojuego v ON d.IdVideojuego = v.IdVideojuego
                   WHERE d.IdUsuario = ?
                   ORDER BY d.FechaAgregado DESC";
    $deseadoStmt = $conn->prepare($deseadoSql);
    $deseadoStmt->bind_param('i', $userId);
    $deseadoStmt->execute();
    $deseadoResult = $deseadoStmt->get_result();
    while ($row = $deseadoResult->fetch_assoc()) {
        $deseados[] = $row;
    }
    $deseadoStmt->close();

    $seguidos = [];
    $seguidoSql = "SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio, v.Genero, v.FechaLanzamiento, v.ValoracionPromedio, v.Descripcion, s.FechaAgregado
                   FROM Seguido s
                   INNER JOIN Videojuego v ON s.IdVideojuego = v.IdVideojuego
                   WHERE s.IdUsuario = ?
                   ORDER BY s.FechaAgregado DESC";
    $seguidoStmt = $conn->prepare($seguidoSql);
    $seguidoStmt->bind_param('i', $userId);
    $seguidoStmt->execute();
    $seguidoResult = $seguidoStmt->get_result();
    while ($row = $seguidoResult->fetch_assoc()) {
        $seguidos[] = $row;
    }
    $seguidoStmt->close();

    $ignorados = [];
    $ignoradoSql = "SELECT v.IdVideojuego, v.Titulo AS nombre, v.Precio, v.Genero, v.FechaLanzamiento, v.ValoracionPromedio, v.Descripcion, i.FechaAgregado
                    FROM Ignorado i
                    INNER JOIN Videojuego v ON i.IdVideojuego = v.IdVideojuego
                    WHERE i.IdUsuario = ?
                    ORDER BY i.FechaAgregado DESC";
    $ignoradoStmt = $conn->prepare($ignoradoSql);
    $ignoradoStmt->bind_param('i', $userId);
    $ignoradoStmt->execute();
    $ignoradoResult = $ignoradoStmt->get_result();
    while ($row = $ignoradoResult->fetch_assoc()) {
        $ignorados[] = $row;
    }
    $ignoradoStmt->close();

    echo json_encode([
        'usuario' => $user,
        'videojuegosAdquiridos' => $videojuegosAdquiridos,
        'deseados' => $deseados,
        'seguidos' => $seguidos,
        'ignorados' => $ignorados,
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $exception) {
    apiResponse(['error' => 'Error interno del servidor: ' . $exception->getMessage()], 500);
}
