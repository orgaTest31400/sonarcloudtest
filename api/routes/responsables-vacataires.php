<?php
// Import necessary dependencies
require_once 'config.php';

// Define the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods using a switch statement
switch ($method) {
    case 'GET':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        return getResponsableVacataires($id);
    case 'POST':
        // Handle POST request to create a new responsable-vacataire
        break;
    case 'PUT':
        // Handle PUT request to update a responsable-vacataire
        return handlePUT();
        break;
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(array("message" => "Method not allowed"));
}

function getResponsableVacataires($id) {
    global $conn;

    if ($id == null) {
      http_response_code(400); // Bad Request
      return json_encode(array("message" => "id is required."));
    }

    if(!($_SESSION['type']=="responsable" && $id==$_SESSION['userId'])){
      http_response_code(403);
      return json_encode(array("message" => "Forbidden"));
    }

    try {
        $query = "SELECT RV.*,
                         (SELECT JSON_ARRAYAGG(JSON_OBJECT('ID', D.ID, 'libelle', D.libelle))
                          FROM Departement D
                          WHERE D.ID IN (
                              SELECT R.idDepartement
                              FROM ResponsableVacatairesRattacher R
                              WHERE R.idResponsableVacataires = RV.ID
                          )) AS departements
                  FROM ResponsableVacataires RV
                  WHERE ID = :id AND archiver = 0";

        $stmt = $conn->prepare($query);

        if ($id) {
            $stmt->bindParam(":id", $id);
        }

        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convert the JSON strings into arrays
        foreach ($results as &$result) { unset($result['hashMdp']); $result['ID'] = intval($result['ID']);
            $result['departements'] = json_decode($result['departements'], true) ?? [];
	    $result['archiver'] = filter_var($result['archiver'], FILTER_VALIDATE_BOOLEAN);
        }

        http_response_code(200);
        if ($id) return json_encode($results[0] ?? null);
        return json_encode($results);
    } catch (PDOException $e) {
        echo "$e";
        return false; // Error
    }
}

function handlePUT()
{
  global $conn;

  // Handle PUT request to update a Vacataire
  $id = isset($_GET['id']) ? $_GET['id'] : null;
  if(!($_SESSION['type']=="responsable" && $id==$_SESSION['userId'])){
    http_response_code(403);
    return json_encode(array("message" => "Forbidden"));
  }

  $data = json_decode(file_get_contents("php://input"));

  // Validate and sanitize the data as needed
  if ($data->hashMdp && $data->hashMdp != '') $data->hashMdp = password_hash($data->hashMdp, PASSWORD_DEFAULT);
  else unset($data->hashMdp);
  $data->archiver = $data->archiver ? 1 : 0;

  // Initialize an array to store the fields to update
  $fieldsToUpdate = [];

  // Define the fields that can be updated for Vacataire
  $allowedFields = ['prenom', 'nom', 'hashMdp', 'adresseEmail', 'archiver'];

  // Build the SQL query and parameter bindings dynamically
  foreach ($allowedFields as $field) {
    if (isset($data->{$field})) {
      $fieldsToUpdate[] = "{$field} = :{$field}";
    }
  }

  // Check if any fields were provided in the data
  if (empty($fieldsToUpdate)) {
    http_response_code(400); // Bad Request
    return json_encode(array("message" => "No valid fields provided for update."));
  }

  // Build the SQL update query
  $updateQuery = "UPDATE ResponsableVacataires SET " . implode(', ', $fieldsToUpdate) . " WHERE ID = :id";

  $stmt = $conn->prepare($updateQuery);

  // Bind parameters for the fields that are provided in the data
  foreach ($allowedFields as $field) {
    if (isset($data->{$field})) {
      $stmt->bindParam(":{$field}", $data->{$field});
    }
  }

  // Bind the ID parameter
  $stmt->bindParam(':id', $id);

  try {
    if ($stmt->execute()) {
      http_response_code(200);
      return json_encode(array("message" => "Responsable vacataires updated successfully." . error_get_last()['message']));
    } else {
      http_response_code(500); // Internal Server Error
      return json_encode(array("message" => "Internal Server Error"));
    }
  } catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    return json_encode(array("message" => "Internal Server Error"));
  }
}
?>

