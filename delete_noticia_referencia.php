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
$referencia_id = $data['referencia_id'] ?? null;

if (!$referencia_id) {
    http_response_code(400);
    echo json_encode(['error' => 'referencia_id requerido']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

$conn->set_charset('utf8');

$sql = "DELETE FROM noticia_referencias WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $referencia_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al eliminar']);
}

$stmt->close();
$conn->close();
?>
