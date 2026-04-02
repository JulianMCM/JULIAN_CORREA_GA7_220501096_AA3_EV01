<?php
// test_ignored.php — Verificar juegos ignorados
include("config/db.php");

echo "<h1>Verificando Juegos Ignorados</h1>";
echo "<pre>";

// Ver si hay entradas en Ignorado
$result = $conn->query("SELECT i.IdUsuario, i.IdVideojuego, v.Titulo FROM Ignorado i JOIN Videojuego v ON i.IdVideojuego = v.IdVideojuego");
echo "Juegos ignorados:\n";
if ($result->num_rows == 0) {
    echo "No hay juegos ignorados.\n";
} else {
    while ($row = $result->fetch_assoc()) {
        echo "- Usuario {$row['IdUsuario']} ignora: {$row['Titulo']}\n";
    }
}

$conn->close();

echo "\n🎉 Verificación completada!\n";
echo "</pre>";
?>