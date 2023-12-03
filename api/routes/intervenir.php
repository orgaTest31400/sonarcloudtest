<?php
// Import necessary dependencies
require_once 'config.php';

// Define the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods using a switch statement
switch ($method) {
    case 'GET':
        return handleGET();
    case 'POST':
        return handlePOST();
    case 'DELETE':
        return handleDELETE();
    default:
        http_response_code(405); // Method Not Allowed
        return json_encode(array("message" => "Method not allowed"));
}

function handleGET()
{
    global $conn;

    // Handle GET request to retrieve courses assigned to a vacataire
    $IDVacataire = isset($_GET['IDVacataire']) ? $_GET['IDVacataire'] : null;
    $IDCours = isset($_GET['IDCours']) ? $_GET['IDCours'] : null;

    try {
        // Query to retrieve courses assigned to the vacataire
        $query = "SELECT I.*
                  FROM Intervenir I";

        $conditions = array();

        if ($IDVacataire) {
            $conditions[] = "I.IDVacataire = :IDVacataire";
        }

        if ($IDCours) {
            $conditions[] = "I.IDCours = :IDCours";
        }

        if (!empty($conditions)) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }

        $stmt = $conn->prepare($query);

        if ($IDVacataire) {
            $stmt->bindParam(':IDVacataire', $IDVacataire);
        }

        if ($IDCours) {
            $stmt->bindParam(':IDCours', $IDCours);
        }

        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convert the results to JSON
        http_response_code(200);
        return json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500); // Internal Server Error
        return json_encode(array("message" => "Unable to retrieve courses for vacataire.\n$e"));
    }
}

function handlePOST()
{
    global $conn;

    // Handle DELETE request to remove a course from a vacataire
    $IDCours = isset($_GET['IDCours']) ? $_GET['IDCours'] : null;
    $IDVacataire = isset($_GET['IDVacataire']) ? $_GET['IDVacataire'] : null;

    if($IDVacataire!==$_SESSION['userId'] && $_SESSION['type']!=="responsable"){
      http_response_code(403);
      return json_encode(array("message" => "Forbidden"));
    }

    if ($IDCours == null || $IDVacataire == null) {
        http_response_code(400); // Bad Request
        return json_encode(array("message" => "Both IDCours and IDVacataire parameters are required."));
    } else {
        // Validate and sanitize the data as needed

        // Insert a new row into the Intervenir table
        $insertQuery = "INSERT INTO Intervenir (IDCours, IDVacataire) VALUES (:IDCours, :IDVacataire)";

        $stmt = $conn->prepare($insertQuery);
        $stmt->bindParam(':IDCours', $IDCours);
        $stmt->bindParam(':IDVacataire', $IDVacataire);

        if ($stmt->execute()) {
            http_response_code(200); // Created
            return json_encode(array("message" => "Course assigned to vacataire successfully."));
        } else {
            http_response_code(500); // Internal Server Error
            return json_encode(array("message" => "Unable to assign course to vacataire."));
        }
    }
}

function handleDELETE()
{
    global $conn;

    // Handle DELETE request to remove a course from a vacataire
    $IDCours = isset($_GET['IDCours']) ? $_GET['IDCours'] : null;
    $IDVacataire = isset($_GET['IDVacataire']) ? $_GET['IDVacataire'] : null;

    if($IDVacataire!==$_SESSION['userId'] && $_SESSION['type']!=="responsable"){
      http_response_code(403);
      return json_encode(array("message" => "Forbidden"));
    }

    if ($IDCours == null || $IDVacataire == null) {
        http_response_code(400); // Bad Request
        return json_encode(array("message" => "Both IDCours and IDVacataire parameters are required."));
    } else {
        // Delete the row from the Intervenir table
        $deleteQuery = "DELETE FROM Intervenir WHERE IDCours = :IDCours AND IDVacataire = :IDVacataire";

        $stmt = $conn->prepare($deleteQuery);
        $stmt->bindParam(':IDCours', $IDCours);
        $stmt->bindParam(':IDVacataire', $IDVacataire);

        if ($stmt->execute()) {
            http_response_code(200); // OK
            return json_encode(array("message" => "Course removed from vacataire successfully."));
        } else {
            http_response_code(500); // Internal Server Error
            return json_encode(array("message" => "Unable to remove course from vacataire."));
        }
    }
}
