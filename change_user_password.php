<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar admin
if (!isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$usuario_id = $data['usuario_id'] ?? null;
$nueva_password = $data['nueva_password'] ?? null;

if (!$usuario_id || !$nueva_password || strlen($nueva_password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos o contraseña muy corta']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

$conn->set_charset('utf8');

// Hash de la nueva contraseña
$hashed_password = password_hash($nueva_password, PASSWORD_DEFAULT);

// Actualizar contraseña
$sql = "UPDATE usuarios SET contraseña = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en prepare: ' . $conn->error]);
    exit;
}

$stmt->bind_param('si', $hashed_password, $usuario_id);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Contraseña actualizada correctamente']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al actualizar contraseña: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
