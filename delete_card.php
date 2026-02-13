<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Verificar que sea admin
if (!isset($_SESSION['es_admin']) || !$_SESSION['es_admin']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso denegado'], JSON_UNESCAPED_UNICODE);
    exit;
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "the conjurer";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error de conexión'], JSON_UNESCAPED_UNICODE);
    exit;
}

$conn->set_charset('utf8');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'ID requerido'], JSON_UNESCAPED_UNICODE);
    exit;
}

$id = $data['id'];

$stmt = $conn->prepare("DELETE FROM cartas WHERE ID = ?");
$stmt->bind_param("s", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success'=>true,'message'=>'Carta eliminada'], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(404);
        echo json_encode(['success'=>false,'error'=>'Carta no encontrada'], JSON_UNESCAPED_UNICODE);
    }
} else {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>$stmt->error], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();
?>
