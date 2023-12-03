<?php
$domain = $_SERVER['SERVER_NAME'];
session_set_cookie_params(
  [
    'lifetime' => 3600,
    'path' => '/',
    'domain' => $domain,
    'secure' => true,
    'httponly' => true,
    'samesite' => 'none' // TODO: mettre en 'lax' ?
  ]
);

session_start();

$http_origin = $_SERVER['HTTP_ORIGIN'];
if ($http_origin == "https://sae5.yvelin.net" || $http_origin == "http://localhost:4200" || $http_origin == "https://xn--chvre-5ra.yvelin.net") {
  header("Access-Control-Allow-Origin: $http_origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

require_once 'config.php';

// allow preflight request for cors
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit();
}
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Remove '/api/' from the beginning of $request_path
$request_path = preg_replace('~^/api/~', '', $request_path);

if ($request_path != 'auth' && empty($_SESSION['userId'])) {
  http_response_code(401);
  echo json_encode(array("message" => "Unauthorized", "data" => $_SESSION['userId']));
  exit();
}

// allow get and put http methods for Session type vacataire
if (
  !empty($_SESSION['userId']) &&
  $_SESSION['type'] == "vacataire" &&
  $request_path != 'vacataires' &&
  $request_path != 'auth'  &&
  $request_path != 'cours' &&
  $request_path != 'departements' &&
  $request_path != 'intervenir' &&
  $request_path != 'posseder' &&
  $request_path != 'competences' &&
  ($_SERVER['REQUEST_METHOD'] != 'GET' || $_SERVER['REQUEST_METHOD'] != 'PUT')
) {
  http_response_code(403);
  echo json_encode(array("message" => "Forbidden"));
  exit();
}

switch ($request_path) {
  case 'auth':
    echo require_once 'routes/auth.php';
    exit();
  case 'vacataires':
    echo require_once 'routes/vacataires.php';
    exit();
  case 'cours':
    echo require_once 'routes/cours.php';
    exit();
  case 'departements':
    echo require_once 'routes/departements.php';
    exit();
  case 'responsables-vacataires':
    echo require_once 'routes/responsables-vacataires.php';
    exit();
  case 'intervenir':
    echo require_once 'routes/intervenir.php';
    exit();
  case 'profils-recherches':
    echo require_once 'routes/profils-recherches.php';
    exit();
  case 'professeurs-referents':
    echo require_once 'routes/professeurs-referents.php';
    exit();
  case 'competences':
    echo require_once 'routes/competences.php';
    exit();
  case 'posseder':
    echo require_once 'routes/posseder.php';
    exit();
  case 'professeurs-referents':
    echo require_once 'routes/professeurs-referents.php';
    exit();
  default:
    http_response_code(404);
    echo json_encode(array("message" => "Route not found"));
    exit();
}
