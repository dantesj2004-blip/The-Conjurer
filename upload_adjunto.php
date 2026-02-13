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
$uploadDir = __DIR__ . '/uploads/adjuntos/';
$maxFileSize = 50 * 1024 * 1024; // 50MB
$allowedTypes = ['application/pdf', 'application/zip', 'application/x-rar-compressed'];
$allowedExtensions = ['pdf', 'zip', 'rar'];

// Verificar que la carpeta existe
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Verificar que se subió un archivo
if (!isset($_FILES['adjunto'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No se envió archivo'], JSON_UNESCAPED_UNICODE);
    exit;
}

$file = $_FILES['adjunto'];

// Validaciones
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Error en la carga del archivo'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($file['size'] > $maxFileSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Archivo demasiado grande (máximo 50MB)'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Obtener extensión
$fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($fileExt, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tipo de archivo no permitido. Usa: PDF, ZIP, RAR'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validar tipo MIME (seguridad adicional)
if (!in_array($file['type'], $allowedTypes) && $file['type'] !== 'application/x-zip-compressed') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tipo MIME no permitido'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Generar nombre único
$timestamp = time();
$randomStr = bin2hex(random_bytes(5));
$newFileName = "adj_{$timestamp}_{$randomStr}.{$fileExt}";
$uploadPath = $uploadDir . $newFileName;

// Mover archivo
if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al guardar el archivo'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Retornar información del archivo subido
$relativePath = 'uploads/adjuntos/' . $newFileName;
$fileIcon = $fileExt === 'pdf' ? 'pdf' : 'zip';

echo json_encode([
    'success' => true,
    'message' => 'Archivo subido exitosamente',
    'filename' => $newFileName,
    'originalName' => $file['name'],
    'path' => $relativePath,
    'size' => $file['size'],
    'sizeFormatted' => formatBytes($file['size']),
    'type' => $fileExt,
    'icon' => $fileIcon,
    'url' => $relativePath
], JSON_UNESCAPED_UNICODE);

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    return round($bytes, $precision) . ' ' . $units[$i];
}
?>
