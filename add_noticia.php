<?php
header('Content-Type: application/json');

$servidor = 'localhost';
$usuario = 'root';
$contraseña = '';
$base_datos = 'the conjurer';

$conexion = new mysqli($servidor, $usuario, $contraseña, $base_datos);

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error de conexión: ' . $conexion->connect_error]);
    exit;
}

$conexion->set_charset('utf8');

// Recibir datos POST
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['titulo']) || !isset($data['contenido'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

$titulo = $data['titulo'];
$fecha = $data['fecha'] ?? date('Y-m-d');
$imagen_url = $data['imagen_url'] ?? 'https://placehold.co/600x400/3b0066/ffffff?text=Sin+Imagen';
$resumen = $data['resumen'] ?? '';
$contenido = $data['contenido'];
$es_destacada = isset($data['es_destacada']) ? intval($data['es_destacada']) : 0;

// Si esta es la nueva noticia destacada, desmarcar la anterior
if ($es_destacada) {
    $conexion->query("UPDATE noticias SET es_destacada = 0");
}

// Insertar noticia
$stmt = $conexion->prepare("INSERT INTO noticias (titulo, fecha, imagen_url, resumen, contenido, es_destacada) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssi", $titulo, $fecha, $imagen_url, $resumen, $contenido, $es_destacada);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Noticia publicada exitosamente', 'id' => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al insertar: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();
?>
