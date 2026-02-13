<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar que el usuario esté logueado
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Usuario no autenticado']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión: ' . $conn->connect_error]);
    exit;
}

$conn->set_charset('utf8');

// Obtener datos del POST
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['nombre']) || !isset($data['mitologia']) || !isset($data['mazo_data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];
$nombre = $data['nombre'] ?? '';
$mitologia = $data['mitologia'] ?? '';
$mazo_data = $data['mazo_data'] ?? '{}';

// Crear tabla mazos si no existe
$sql_create = "CREATE TABLE IF NOT EXISTS mazos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    mitologia VARCHAR(100),
    mazo_data LONGTEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
)";

$conn->query($sql_create);

// Insertar mazo
$sql = "INSERT INTO mazos (usuario_id, nombre, mitologia, mazo_data) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en prepare: ' . $conn->error]);
    exit;
}

$stmt->bind_param('isss', $usuario_id, $nombre, $mitologia, $mazo_data);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al guardar: ' . $stmt->error]);
    exit;
}

$mazo_id = $stmt->insert_id;

echo json_encode([
    'success' => true,
    'mazo_id' => $mazo_id,
    'mensaje' => 'Mazo importado exitosamente'
], JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();
?>
