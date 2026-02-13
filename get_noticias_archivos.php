<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Nota: este endpoint devuelve los archivos asociados a una noticia.
// Permitir lectura pública para que las noticias puedan mostrar imágenes y adjuntos.

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

// Obtener noticia_id desde query string
$noticia_id = isset($_GET['noticia_id']) ? intval($_GET['noticia_id']) : 0;

if ($noticia_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de noticia requerido'], JSON_UNESCAPED_UNICODE);
    exit;
}

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

// Obtener archivos de la noticia
$stmt = $conexion->prepare("SELECT id, tipo, archivo_path, nombre_original, fecha_subida FROM noticia_archivos WHERE noticia_id = ? ORDER BY fecha_subida DESC");
$stmt->bind_param("i", $noticia_id);
$stmt->execute();
$result = $stmt->get_result();

$archivos = [];
while ($row = $result->fetch_assoc()) {
    $archivos[] = $row;
}

echo json_encode($archivos, JSON_UNESCAPED_UNICODE);

$stmt->close();
$conexion->close();
?>
