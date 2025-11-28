<?php
header('Content-Type: application/json');

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

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de noticia requerido']);
    exit;
}

$id = intval($data['id']);

$stmt = $conexion->prepare("DELETE FROM noticias WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Noticia eliminada']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al eliminar']);
}

$stmt->close();
$conexion->close();
?>
