<?php
require_once __DIR__ . '/api-bootstrap.php';

$userId = isset($_SESSION['id']) ? (int) $_SESSION['id'] : null;
$minPrecio = isset($_GET['minPrecio']) ? (float) $_GET['minPrecio'] : 0;
$maxPrecio = isset($_GET['maxPrecio']) ? (float) $_GET['maxPrecio'] : 100;
$genero = isset($_GET['genero']) ? $conn->real_escape_string($_GET['genero']) : '';
$idioma = isset($_GET['idioma']) ? $conn->real_escape_string($_GET['idioma']) : '';
$so = isset($_GET['so']) ? $conn->real_escape_string($_GET['so']) : '';
$orden = isset($_GET['orden']) ? $conn->real_escape_string($_GET['orden']) : 'nombre';
$busqueda = isset($_GET['busqueda']) ? $conn->real_escape_string($_GET['busqueda']) : '';

$sql = "SELECT v.IdVideojuego, v.Titulo AS nombre, v.FechaLanzamiento AS fecha, v.Genero AS etiqueta, v.Precio AS precio, v.Idioma, v.SO, v.ValoracionPromedio, d.PaisOrigen AS paisDesarrollador, d.Nombre AS desarrollador, v.Descripcion AS descripcion
        FROM Videojuego v
        LEFT JOIN Desarrollador d ON v.IdDesarrollador = d.IdDesarrollador";

$where = [];
if ($minPrecio > 0 || $maxPrecio < 100) {
    $where[] = "v.Precio BETWEEN $minPrecio AND $maxPrecio";
}
if ($genero) {
    $generos = explode(',', $genero);
    $conditions = array_map(function ($item) use ($conn) {
        return "v.Genero LIKE '%" . $conn->real_escape_string(trim($item)) . "%'";
    }, $generos);
    $where[] = '(' . implode(' OR ', $conditions) . ')';
}
if ($idioma) {
    $idiomas = explode(',', $idioma);
    $conditions = array_map(function ($item) use ($conn) {
        return "v.Idioma LIKE '%" . $conn->real_escape_string(trim($item)) . "%'";
    }, $idiomas);
    $where[] = '(' . implode(' OR ', $conditions) . ')';
}
if ($so) {
    $sistemas = explode(',', $so);
    $conditions = array_map(function ($item) use ($conn) {
        return "v.SO LIKE '%" . $conn->real_escape_string(trim($item)) . "%'";
    }, $sistemas);
    $where[] = '(' . implode(' OR ', $conditions) . ')';
}
if ($busqueda) {
    $where[] = "v.Titulo LIKE '%$busqueda%'";
}
if ($userId && !$busqueda) {
    $where[] = "v.IdVideojuego NOT IN (SELECT IdVideojuego FROM Ignorado WHERE IdUsuario = $userId)";
}
if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}

switch ($orden) {
    case 'precio':
        $sql .= ' ORDER BY v.Precio ASC';
        break;
    case 'fecha':
        $sql .= ' ORDER BY v.FechaLanzamiento DESC';
        break;
    case 'valoraciones':
        $sql .= ' ORDER BY v.Precio DESC';
        break;
    default:
        $sql .= ' ORDER BY v.Titulo ASC';
}

$result = $conn->query($sql);

$games = [];
while ($row = $result->fetch_assoc()) {
    $games[] = [
        'id' => (int) $row['IdVideojuego'],
        'nombre' => $row['nombre'],
        'fecha' => $row['fecha'],
        'valoraciones' => (float) $row['ValoracionPromedio'],
        'precio' => (float) $row['precio'],
        'genero' => $row['etiqueta'],
        'idioma' => $row['Idioma'] ? explode(',', $row['Idioma']) : ['espanol', 'ingles'],
        'so' => $row['SO'] ? explode(',', $row['SO']) : ['windows'],
        'paisDesarrollador' => $row['paisDesarrollador'],
        'desarrollador' => $row['desarrollador'],
        'descripcion' => $row['descripcion'],
    ];
}

echo json_encode($games, JSON_UNESCAPED_UNICODE);
