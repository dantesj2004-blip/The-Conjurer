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

if (!$data || !isset($data['noticia_id']) || !isset($data['archivo_path']) || !isset($data['tipo'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos incompletos'], JSON_UNESCAPED_UNICODE);
    exit;
}

$noticia_id = intval($data['noticia_id']);
$archivo_path = $data['archivo_path'];
$tipo = $data['tipo']; // 'imagen' o 'adjunto'
$nombre_original = $data['nombre_original'] ?? '';

// Crear tabla si no existe
$sql_tabla = "CREATE TABLE IF NOT EXISTS noticia_archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    noticia_id INT NOT NULL,
    tipo VARCHAR(20) NOT NULL COMMENT 'imagen o adjunto',
    archivo_path VARCHAR(500) NOT NULL,
    nombre_original VARCHAR(255),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE
)";

$conexion->query($sql_tabla);

// Insertar referencia a archivo
$stmt = $conexion->prepare("INSERT INTO noticia_archivos (noticia_id, tipo, archivo_path, nombre_original) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $noticia_id, $tipo, $archivo_path, $nombre_original);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Archivo registrado exitosamente',
        'id' => $stmt->insert_id
    ], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $stmt->error], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conexion->close();
?>
