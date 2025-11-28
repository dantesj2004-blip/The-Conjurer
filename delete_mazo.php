<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Compatibilidad con claves de sesión 'user_id' o 'usuario_id'
$usuario_id = null;
if (isset($_SESSION['user_id'])) $usuario_id = $_SESSION['user_id'];
elseif (isset($_SESSION['usuario_id'])) $usuario_id = $_SESSION['usuario_id'];

if (!$usuario_id) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

$conn->set_charset('utf8');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['mazo_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de mazo requerido']);
    exit;
}

$usuario_id = (int)$usuario_id;
$mazo_id = (int)$data['mazo_id'];

// Verificar que el mazo pertenece al usuario (usando prepared statement)
$check_stmt = $conn->prepare("SELECT id FROM mazos WHERE id = ? AND usuario_id = ?");
$check_stmt->bind_param('ii', $mazo_id, $usuario_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permiso']);
    $check_stmt->close();
    $conn->close();
    exit;
}
$check_stmt->close();

// Eliminar mazo (usando prepared statement)
$delete_stmt = $conn->prepare("DELETE FROM mazos WHERE id = ? AND usuario_id = ?");
$delete_stmt->bind_param('ii', $mazo_id, $usuario_id);

if ($delete_stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Mazo eliminado'], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al eliminar: ' . $delete_stmt->error]);
}

$delete_stmt->close();
$conn->close();
?>
