<?php
header('Content-Type: application/json; charset=utf-8');

$mazo_id = $_GET['mazo_id'] ?? null;
if (!$mazo_id) {
    http_response_code(400);
    echo json_encode(['error' => 'mazo_id requerido']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

$conn->set_charset('utf8');

// Obtener datos del mazo
$sql = "SELECT id, nombre, mitologia, mazo_data FROM mazos WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $mazo_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Mazo no encontrado']);
    $stmt->close();
    $conn->close();
    exit;
}

$row = $result->fetch_assoc();

echo json_encode([
    'id' => (int)$row['id'],
    'nombre' => $row['nombre'],
    'mitologia' => $row['mitologia'],
    'mazo_data' => $row['mazo_data']
], JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();
?>
