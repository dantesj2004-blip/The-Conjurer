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
    echo json_encode(['success'=>false,'error'=>'Error de conexión: '.$conn->connect_error], JSON_UNESCAPED_UNICODE);
    exit;
}
$conn->set_charset('utf8');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !isset($data['id']) || !isset($data['Nombre']) || !isset($data['Tipo'])) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'Datos incompletos'], JSON_UNESCAPED_UNICODE);
    exit;
}

$id = $data['id'];
$nombre = $data['Nombre'] ?? '';
$tipo = $data['Tipo'] ?? '';
$mitologia = $data['Mitologia'] ?? '';
$era = $data['Era'] ?? '';
$coste = $data['Coste'] ?? '';
$fuerza = $data['Fuerza'] ?? '';
$poder = $data['Poder'] ?? '';
$claves = $data['Claves'] ?? '';
$texto = $data['Texto - Habilidades'] ?? '';
$urlimg = $data['URL-IMG'] ?? '';

$stmt = $conn->prepare("UPDATE cartas SET Nombre=?, Tipo=?, Mitologia=?, Era=?, Coste=?, Fuerza=?, Poder=?, Claves=?, `Texto - Habilidades`=?, `URL-IMG`=? WHERE ID=?");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error en preparación: '.$conn->error], JSON_UNESCAPED_UNICODE);
    exit;
}

$stmt->bind_param("sssssssssss", $nombre, $tipo, $mitologia, $era, $coste, $fuerza, $poder, $claves, $texto, $urlimg, $id);

if ($stmt->execute()) {
    echo json_encode(['success'=>true,'message'=>'Carta actualizada'], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error al actualizar: '.$stmt->error], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();
?>
