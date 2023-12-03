<?php
// Import necessary dependencies
require_once 'config.php';
require_once 'utils.php';

// Define the HTTP method
$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
    case 'POST':
        return handlePOST();
    case 'DELETE':
        return handleDELETE();
    default:
        http_response_code(405); // Method Not Allowed
        return json_encode(array("message" => "Method not allowed"));
}

function handlePOST(){
    $data = json_decode(file_get_contents("php://input"));
    global $conn, $TypeProfil;
    try {
        $vacataireQuery = "SELECT * FROM Vacataire WHERE adresseEmail = :email AND archiver = 0";
        $vacataireStmt = $conn->prepare($vacataireQuery);
        $vacataireStmt->bindParam(':email', $data->email);
        $vacataireStmt->execute();
        $vacataire = $vacataireStmt->fetch(PDO::FETCH_ASSOC);

        $respVacataireQuery = "SELECT * FROM ResponsableVacataires WHERE adresseEmail = :email AND archiver = 0";
        $respVacataireStmt = $conn->prepare($respVacataireQuery);
        $respVacataireStmt->bindParam(':email',$data->email);
        $respVacataireStmt->execute();
        $respVacataire = $respVacataireStmt->fetch(PDO::FETCH_ASSOC);
        if ($vacataire  && password_verify($data->password, $vacataire['hashMdp'])) {
            $_SESSION['userId'] = $vacataire['ID'];
            $_SESSION['type'] = $TypeProfil->VACATAIRE;
            http_response_code(200);
            return json_encode(array("message" => "Login successful", "nom" => $vacataire['nom'], "prenom" => $vacataire['prenom'], "typeProfil" =>"vacataire","id"=>$vacataire['ID']));
        }
        elseif ($respVacataire && password_verify($data->password, $respVacataire['hashMdp'])) {
            $_SESSION['userId'] = $respVacataire['ID'];
            $_SESSION['type'] = $TypeProfil->RESPONSABLE_VACATAIRES;
            http_response_code(200);
            return json_encode(array("message" => "Login successful", "nom" => $respVacataire['nom'], "prenom" => $respVacataire['prenom'], "typeProfil" =>"responsable", "id"=>$respVacataire['ID']));
        }
        else {
            http_response_code(404);
            return json_encode(array("message" => "No vacataire found"));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        return json_encode(array("message" => "Internal server error", "error" => $e->getMessage()));
    }
}

function handleDELETE(){
    try {
        session_destroy();
        http_response_code(200);
        return json_encode(array("message" => "Logout successful"));
    } catch (PDOException $e) {
        http_response_code(500);
        return json_encode(array("message" => "Internal server error", "error" => $e->getMessage()));
    }
}

