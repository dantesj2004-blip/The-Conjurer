<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar que sea admin
if (!isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Configuración
$uploadDir = __DIR__ . '/uploads/imagenes/';
$maxFileSize = 5 * 1024 * 1024; // 5MB
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// Verificar que la carpeta existe
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Verificar que se subió un archivo
if (!isset($_FILES['imagen'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No se envió archivo'], JSON_UNESCAPED_UNICODE);
    exit;
}

$file = $_FILES['imagen'];

// Validaciones
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Error en la carga del archivo'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($file['size'] > $maxFileSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Archivo demasiado grande (máximo 5MB)'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tipo de archivo no permitido. Usa: JPG, PNG, GIF, WebP'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Obtener extensión
$fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($fileExt, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Extensión no permitida'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Generar nombre único
$timestamp = time();
$randomStr = bin2hex(random_bytes(5));
$newFileName = "img_{$timestamp}_{$randomStr}.{$fileExt}";
$uploadPath = $uploadDir . $newFileName;

// Mover archivo
if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al guardar el archivo'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Retornar información del archivo subido
$relativePath = 'uploads/imagenes/' . $newFileName;

echo json_encode([
    'success' => true,
    'message' => 'Imagen subida exitosamente',
    'filename' => $newFileName,
    'path' => $relativePath,
    'size' => $file['size'],
    'url' => $relativePath
], JSON_UNESCAPED_UNICODE);
?>
