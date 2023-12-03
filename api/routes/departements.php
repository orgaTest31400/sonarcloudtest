<?php
// Import necessary dependencies
require_once 'config.php';

// Define the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods using a switch statement
switch ($method) {
    case 'GET':
        return getDepartements();
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(array("message" => "Method not allowed"));
}

function getDepartements() {
    global $conn;

    try {
        $query = "SELECT D.* FROM Departement D";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($results as &$result) {
            $result['ID'] = intval($result['ID']);
        }
	
        http_response_code(200);
        return json_encode($results);
    } catch (PDOException $e) {
       http_response_code(500);
       return json_encode(array("message" => $e->getMessage()));
    }
}
?>
