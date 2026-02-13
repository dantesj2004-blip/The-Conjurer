<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar admin
if (!isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$noticia_id = $_GET['noticia_id'] ?? null;
if (!$noticia_id) {
    http_response_code(400);
    echo json_encode(['error' => 'noticia_id requerido']);
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
    tipo VARCHAR(20) NOT NULL,
    referencia_id INT NOT NULL,
    orden INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE,
    UNIQUE KEY unique_ref (noticia_id, tipo, referencia_id)
)";

$conn->query($sql_create);

// Obtener referencias
$sql = "SELECT id, tipo, referencia_id FROM noticia_referencias 
        WHERE noticia_id = ? 
        ORDER BY orden ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $noticia_id);
$stmt->execute();
$result = $stmt->get_result();

$referencias = [];
while ($row = $result->fetch_assoc()) {
    $referencias[] = [
        'id' => (int)$row['id'],
        'tipo' => $row['tipo'],
        'referencia_id' => (int)$row['referencia_id']
    ];
}

echo json_encode(['referencias' => $referencias], JSON_UNESCAPED_UNICODE);
$stmt->close();
$conn->close();
?>
