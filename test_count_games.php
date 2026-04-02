<?php
// test_count_games.php — Contar juegos en DB y verificar qué devuelve videos.php
include("config/db.php");

echo "<h1>Contando Juegos en Base de Datos</h1>";
echo "<pre>";

// Contar total de juegos
$result = $conn->query("SELECT COUNT(*) as total FROM Videojuego");
$total = $result->fetch_assoc()['total'];
echo "Total de juegos en DB: $total\n\n";

// Listar todos los juegos
$result = $conn->query("SELECT IdVideojuego, Titulo, Genero FROM Videojuego");
echo "Lista de juegos:\n";
while ($row = $result->fetch_assoc()) {
    echo "- ID: {$row['IdVideojuego']}, Título: {$row['Titulo']}, Género: {$row['Genero']}\n";
}
echo "\n";

// Simular petición sin filtros a videos.php
echo "Respuesta de videos.php sin filtros:\n";
$_GET = []; // Sin parámetros
ob_start();
include("backend/videos.php");
$output = ob_get_clean();
echo "Output raw: $output\n";
$games = json_decode($output, true);
if ($games === null) {
    echo "Error decodificando JSON\n";
    exit;
}
echo "Número de juegos devueltos: " . count($games) . "\n";
foreach ($games as $game) {
    echo "- {$game['nombre']} (ID: {$game['id']})\n";
}

$conn->close();

echo "\n🎉 Verificación completada!\n";
echo "</pre>";
?>