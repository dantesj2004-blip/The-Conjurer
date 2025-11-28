<?php
header('Content-Type: application/json');

$servidor = 'localhost';
$usuario = 'root';
$contraseña = '';
$base_datos = 'the conjurer';

$conexion = new mysqli($servidor, $usuario, $contraseña, $base_datos);

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión: ' . $conexion->connect_error]);
    exit;
}

$conexion->set_charset('utf8');

// Obtener ID de noticia si se solicita una específica
$noticia_id = isset($_GET['id']) ? intval($_GET['id']) : null;

if ($noticia_id) {
    // Obtener una noticia específica
    $stmt = $conexion->prepare("SELECT * FROM noticias WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $noticia_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows > 0) {
        $noticia = $resultado->fetch_assoc();
        echo json_encode($noticia);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Noticia no encontrada']);
    }
    $stmt->close();
} else {
    // Obtener todas las noticias ordenadas por fecha
    $resultado = $conexion->query("SELECT id, titulo, fecha, imagen_url, resumen, es_destacada FROM noticias ORDER BY fecha DESC");
    
    if ($resultado->num_rows > 0) {
        $noticias = [];
        while ($fila = $resultado->fetch_assoc()) {
            $noticias[] = $fila;
        }
        echo json_encode($noticias);
    } else {
        echo json_encode([]);
    }
}

$conexion->close();
?>
