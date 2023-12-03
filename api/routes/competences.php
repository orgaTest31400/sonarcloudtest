<?php
// Import necessary dependencies
require_once 'config.php';

// Define the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods using a switch statement
switch ($method) {
  case 'GET':
    return handleGET();
    break;
  case 'POST':
    return handlePOST();
    break;
  case 'DELETE':
    return handleDELETE();
    break;
  default:
    http_response_code(405); // Method Not Allowed
    return json_encode(array("message" => "Method not allowed"));
}

function handleGET()
{
  global $conn;

  // Handle GET request to retrieve courses assigned to a vacataire
  $IDVacataire = isset($_GET['IDVacataire']) ? $_GET['IDVacataire'] : null;
  $libelleCompetence = isset($_GET['libelleCompetence']) ? urldecode($_GET['libelleCompetence']) : null;

  try {
    // Query to retrieve courses assigned to the vacataire
    $query = "SELECT C.libelle FROM Competence C";

    $conditions = array();

    if ($IDVacataire) {
      $conditions[] = "VP.IDVacataire = :IDVacataire";
    }

    if ($libelleCompetence) {
      $conditions[] = "VP.libelleCompetence = :libelleCompetence";
    }

    if (!empty($conditions)) {
      $query .= " WHERE " . implode(" AND ", $conditions);
    }

    $stmt = $conn->prepare($query);

    if ($IDVacataire) {
      $stmt->bindParam(':IDVacataire', $IDVacataire);
    }

    if ($libelleCompetence) {
      $stmt->bindParam(':libelleCompetence', $libelleCompetence);
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert the results to JSON
    http_response_code(200);
    if ($libelleCompetence) return json_encode($results[0] ?? []);
    return json_encode($results);
  } catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    return json_encode(array("message" => "Unable to retrieve competences for vacataire.\n$e"));
  }
}

function handlePOST()
{
  global $conn;

  $data = json_decode(file_get_contents("php://input"));

  // Insert a new row into the VacatairePosseder table
  $insertQuery = "INSERT INTO Competence (libelle) VALUES (:libelle)";

  $stmt = $conn->prepare($insertQuery);
  $stmt->bindParam(':libelle', $data->libelle);

  if ($stmt->execute()) {
    http_response_code(200); // Created
    return json_encode(array("message" => "Competence added successfully."));
  } else {
    http_response_code(500); // Internal Server Error
    return json_encode(array("message" => "Unable to add competence to vacataire."));
  }
}

function handleDELETE()
{
  global $conn;

  // Handle DELETE request to remove a course from a vacataire
  $libelleCompetence = isset($_GET['libelleCompetence']) ? urldecode($_GET['libelleCompetence']) : null;

  if ($libelleCompetence == null) {
    http_response_code(400); // Bad Request
    return json_encode(array("message" => "libelleCompetence is required."));
  } else {
    // Delete the row from the Intervenir table
    $deleteQuery = "DELETE FROM Competence WHERE libelle = :libelleCompetence";

    $stmt = $conn->prepare($deleteQuery);
    $stmt->bindParam(':libelleCompetence', $libelleCompetence);

    if ($stmt->execute()) {
      http_response_code(200); // OK
      return json_encode(array("message" => "Competence removed from vacataire successfully."));
    } else {
      http_response_code(500); // Internal Server Error
      return json_encode(array("message" => "Unable to remove competence from vacataire."));
    }
  }
}
