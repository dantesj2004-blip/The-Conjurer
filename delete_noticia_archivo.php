<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar que sea admin
if (!isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado'], JSON_UNESCAPED_UNICODE);
    exit;
}

$servidor = 'localhost';
$usuario = 'root';
$contraseña = '';
$base_datos = 'the conjurer';

$conexion = new mysqli($servidor, $usuario, $contraseña, $base_datos);

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error de conexión'], JSON_UNESCAPED_UNICODE);
    exit;
}

$conexion->set_charset('utf8');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['archivo_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de archivo requerido'], JSON_UNESCAPED_UNICODE);
    exit;
}

$archivo_id = intval($data['archivo_id']);

// Obtener información del archivo para eliminarlo del servidor
$stmt = $conexion->prepare("SELECT archivo_path FROM noticia_archivos WHERE id = ?");
$stmt->bind_param("i", $archivo_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Archivo no encontrado'], JSON_UNESCAPED_UNICODE);
    exit;
}

$row = $result->fetch_assoc();
$archivo_path = __DIR__ . '/' . $row['archivo_path'];

// Eliminar archivo del servidor si existe
if (file_exists($archivo_path)) {
    unlink($archivo_path);
}

// Eliminar registro de BD
$stmt_delete = $conexion->prepare("DELETE FROM noticia_archivos WHERE id = ?");
$stmt_delete->bind_param("i", $archivo_id);

if ($stmt_delete->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Archivo eliminado'
    ], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $stmt_delete->error], JSON_UNESCAPED_UNICODE);
}

$stmt_delete->close();
$stmt->close();
$conexion->close();
?>
