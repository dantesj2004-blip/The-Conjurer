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

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID requerido']);
    exit;
}

$id = intval($data['id']);

// Prevenir que se quite admin al actual
if ($id == $_SESSION['user_id']) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No puedes cambiar tus propios permisos']);
    exit;
}

// Obtener estado actual
$result = $conexion->query("SELECT es_admin FROM usuarios WHERE id = $id");
$row = $result->fetch_assoc();
$nuevo_estado = $row['es_admin'] == 1 ? 0 : 1;

$stmt = $conexion->prepare("UPDATE usuarios SET es_admin = ? WHERE id = ?");
$stmt->bind_param("ii", $nuevo_estado, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Permisos actualizados']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conexion->close();
?>
