<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar admin
if (!isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$conn = new mysqli('localhost', 'root', '', 'the conjurer');
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión']);
    exit;
}

$conn->set_charset('utf8');

// Crear tabla si no existe
$sql_create = "CREATE TABLE IF NOT EXISTS noticia_referencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    noticia_id INT NOT NULL,
    tipo VARCHAR(20) NOT NULL COMMENT 'carta o mazo',
    referencia_id INT NOT NULL COMMENT 'ID de carta o mazo',
    orden INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ref (noticia_id, tipo, referencia_id)
)";

if (!$conn->query($sql_create)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error creando tabla: ' . $conn->error]);
    exit;
}

// Recibir datos
$data = json_decode(file_get_contents('php://input'), true);
$noticia_id = $data['noticia_id'] ?? null;
$tipo = $data['tipo'] ?? null;  // 'carta' o 'mazo'
$referencia_id = $data['referencia_id'] ?? null;

if (!$noticia_id || !$tipo || !$referencia_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

if (!in_array($tipo, ['carta', 'mazo'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo inválido']);
    exit;
}

// Insertar referencia (ignora duplicados)
$sql = "INSERT IGNORE INTO noticia_referencias (noticia_id, tipo, referencia_id) 
        VALUES (?, ?, ?)";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Error prepare: ' . $conn->error]);
    exit;
}

$stmt->bind_param('isi', $noticia_id, $tipo, $referencia_id);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'Error execute: ' . $stmt->error]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Referencia guardada']);
$stmt->close();
$conn->close();
?>
