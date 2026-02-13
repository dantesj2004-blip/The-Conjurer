<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar que sea admin
if (!isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado']);
    exit;
}

$servidor = 'localhost';
$usuario = 'root';
$contraseña = '';
$base_datos = 'the conjurer';

$conexion = new mysqli($servidor, $usuario, $contraseña, $base_datos);

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error de conexión']);
    exit;
}

$conexion->set_charset('utf8');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id']) || !isset($data['titulo']) || !isset($data['contenido'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

$id = intval($data['id']);
$titulo = $data['titulo'];
$fecha = $data['fecha'] ?? date('Y-m-d');
$imagen_url = $data['imagen_url'] ?? 'https://placehold.co/600x400/3b0066/ffffff?text=Sin+Imagen';
$resumen = $data['resumen'] ?? '';
$contenido = $data['contenido'];
$es_destacada = isset($data['es_destacada']) ? intval($data['es_destacada']) : 0;

// Si marca como destacada, desmarcar otras
if ($es_destacada) {
    $conexion->query("UPDATE noticias SET es_destacada = 0 WHERE id != $id");
}

$stmt = $conexion->prepare("UPDATE noticias SET titulo = ?, fecha = ?, imagen_url = ?, resumen = ?, contenido = ?, es_destacada = ? WHERE id = ?");
$stmt->bind_param("sssssii", $titulo, $fecha, $imagen_url, $resumen, $contenido, $es_destacada, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Noticia actualizada']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conexion->close();
?>
