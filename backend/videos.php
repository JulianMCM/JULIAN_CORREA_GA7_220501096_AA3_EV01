<?php
// videos.php — Endpoint para obtener videojuegos con filtros server-side
// Recibe parámetros GET: minPrecio, maxPrecio, genero, idioma, so, orden, busqueda
// Devuelve JSON con lista de juegos filtrados y ordenados
// 
// NOTAS IMPORTANTES:
// - ValoracionPromedio se calcula automáticamente mediante TRIGGERS en la tabla Reseña
// - Cuando se INSERT/UPDATE/DELETE una reseña, el trigger actualiza ValoracionPromedio
// - Esto asegura que siempre tengamos la valoración promedio actualizada en la DB

header('Content-Type: application/json; charset=utf-8');
include("../config/db.php");

// Iniciar sesión para verificar usuario logueado
session_start();
$userId = isset($_SESSION['id']) ? $_SESSION['id'] : null;

// Obtener parámetros GET (con sanitización básica)
$minPrecio = isset($_GET['minPrecio']) ? (float)$_GET['minPrecio'] : 0;
$maxPrecio = isset($_GET['maxPrecio']) ? (float)$_GET['maxPrecio'] : 100;
$genero = isset($_GET['genero']) ? $conn->real_escape_string($_GET['genero']) : '';
$idioma = isset($_GET['idioma']) ? $conn->real_escape_string($_GET['idioma']) : '';
$so = isset($_GET['so']) ? $conn->real_escape_string($_GET['so']) : '';
$orden = isset($_GET['orden']) ? $conn->real_escape_string($_GET['orden']) : 'nombre';
$busqueda = isset($_GET['busqueda']) ? $conn->real_escape_string($_GET['busqueda']) : '';

// Construir consulta base
// SELECT trae ValoracionPromedio en lugar de generar valores aleatorios
$sql = "SELECT v.IdVideojuego, v.Titulo AS nombre, v.FechaLanzamiento AS fecha, v.Genero AS etiqueta, v.Precio AS precio, v.Idioma, v.SO, v.ValoracionPromedio, d.PaisOrigen AS paisDesarrollador, d.Nombre AS desarrollador, v.Descripcion AS descripcion
        FROM Videojuego v
        LEFT JOIN Desarrollador d ON v.IdDesarrollador = d.IdDesarrollador";

// Construir WHERE dinámico
$where = [];
if ($minPrecio > 0 || $maxPrecio < 100) {
    $where[] = "v.Precio BETWEEN $minPrecio AND $maxPrecio";
}
if ($genero) {
    $generos = explode(',', $genero);
    $conditions = array_map(function($g) use ($conn) {
        return "v.Genero LIKE '%" . $conn->real_escape_string(trim($g)) . "%'";
    }, $generos);
    $where[] = "(" . implode(" OR ", $conditions) . ")";
}
if ($idioma) {
    $idiomas = explode(',', $idioma);
    $conditions = array_map(function($i) use ($conn) {
        return "v.Idioma LIKE '%" . $conn->real_escape_string(trim($i)) . "%'";
    }, $idiomas);
    $where[] = "(" . implode(" OR ", $conditions) . ")";
}
if ($so) {
    $sos = explode(',', $so);
    $conditions = array_map(function($s) use ($conn) {
        return "v.SO LIKE '%" . $conn->real_escape_string(trim($s)) . "%'";
    }, $sos);
    $where[] = "(" . implode(" OR ", $conditions) . ")";
}
if ($busqueda) {
    $where[] = "v.Titulo LIKE '%$busqueda%'";
}
// Excluir juegos ignorados por el usuario logueado (a menos que sea búsqueda explícita por título)
if ($userId && !$busqueda) {
    $where[] = "v.IdVideojuego NOT IN (SELECT IdVideojuego FROM Ignorado WHERE IdUsuario = $userId)";
}
if ($where) {
    $sql .= " WHERE " . implode(" AND ", $where);
}

// Construir ORDER BY
switch ($orden) {
    case 'precio':
        $sql .= " ORDER BY v.Precio ASC";
        break;
    case 'fecha':
        $sql .= " ORDER BY v.FechaLanzamiento DESC";
        break;
    case 'valoraciones':
        // Valoraciones son generadas, ordenar por precio como proxy
        $sql .= " ORDER BY v.Precio DESC";
        break;
    default: // nombre
        $sql .= " ORDER BY v.Titulo ASC";
}

// Ejecutar consulta
$result = $conn->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "Query failed: " . $conn->error]);
    exit;
}

// Procesar resultados
$games = [];
while ($row = $result->fetch_assoc()) {
    $games[] = [
        'id' => (int)$row['IdVideojuego'],
        'nombre' => $row['nombre'],
        'fecha' => $row['fecha'],
        'valoraciones' => (float)$row['ValoracionPromedio'], // Traer del DB mediante triggers
        'precio' => (float)$row['precio'],
        'genero' => $row['etiqueta'],
        'idioma' => $row['Idioma'] ? explode(',', $row['Idioma']) : ['español', 'ingles'],
        'so' => $row['SO'] ? explode(',', $row['SO']) : ['windows'],
        'paisDesarrollador' => $row['paisDesarrollador'],
        'desarrollador' => $row['desarrollador'],
        'descripcion' => $row['descripcion']
    ];
}

$conn->close();
echo json_encode($games);
