<?php
// check_and_fix_db.php — Verificar y arreglar estructura de DB
include("config/db.php");

echo "<h1>Verificando Estructura de Base de Datos</h1>";
echo "<pre>";

// Verificar si existe la columna FechaAdicion en Biblioteca_Videojuego
$result = $conn->query("SHOW COLUMNS FROM Biblioteca_Videojuego LIKE 'FechaAdicion'");
if ($result->num_rows == 0) {
    echo "❌ La columna 'FechaAdicion' no existe en Biblioteca_Videojuego\n";
    echo "Agregando columna...\n";
    
    $alterSql = "ALTER TABLE Biblioteca_Videojuego ADD COLUMN FechaAdicion DATE DEFAULT (CURRENT_DATE)";
    if ($conn->query($alterSql) === TRUE) {
        echo "✅ Columna 'FechaAdicion' agregada exitosamente\n";
    } else {
        echo "❌ Error agregando columna: " . $conn->error . "\n";
    }
} else {
    echo "✅ La columna 'FechaAdicion' ya existe\n";
}

// Verificar otras tablas y columnas necesarias
$tables = ['Deseado', 'Seguido', 'Ignorado'];
foreach ($tables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows == 0) {
        echo "❌ La tabla '$table' no existe\n";
    } else {
        echo "✅ La tabla '$table' existe\n";
    }
}

$conn->close();

echo "\n🎉 Verificación completada!\n";
echo "</pre>";
?>