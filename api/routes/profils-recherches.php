<?php
require_once 'config.php'; // Include your database configuration file

// Define the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods using a switch statement
switch ($method) {
  case 'GET':
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    return getRecherches($id);
  case 'POST':
    return handlePOST();
  case 'PUT':
    return handlePUT();
  default:
    http_response_code(405); // Method Not Allowed
    return json_encode(array("message" => "Method not allowed"));
}

function getRecherches($id) {
  global $conn;

  try {
    $query = "SELECT PR.*,
                     (SELECT JSON_ARRAYAGG(JSON_OBJECT('libelle', C.libelle))
                      FROM ProfilRecherchePosseder PRP
                      JOIN Competence C ON PRP.libelleCompetence = C.libelle
                      WHERE PRP.IDProfilRecherche = PR.ID) AS competences
              FROM ProfilRecherche PR";

    $conditions = ["archiver = 0"];

    if ($id) {
      $conditions[] = "PR.ID = :id";
    }

    if (!empty($conditions)) {
      $query .= " WHERE " . implode(" AND ", $conditions);
    }

    $stmt = $conn->prepare($query);

    if ($id) {
      $stmt->bindParam(":id", $id);
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert the JSON strings into arrays
    foreach ($results as &$result) {
      $result['ID'] = intval($result['ID']);
      $result['competences'] = $result['competences'] ? json_decode($result['competences'], true) : [];
      $result['archiver'] = filter_var($result['archiver'], FILTER_VALIDATE_BOOLEAN);
    }

    http_response_code(200);
    if ($id) return json_encode($results[0] ?? null);
    return json_encode($results);
  } catch (PDOException $e) {
    http_response_code(500);
    return json_encode(array("message" => "Database error: " . $e->getMessage()));
  }
}

function handlePOST() {
  global $conn;

  // Handle POST request to create a new Recherche
  $data = json_decode(file_get_contents("php://input"));

  // Validate and sanitize the data as needed

  // Insert the new Recherche into the database
  $insertQuery = "INSERT INTO ProfilRecherche (libelle, description)
                  VALUES (:libelle, :description)";

  $stmt = $conn->prepare($insertQuery);
  $stmt->bindParam(':description', $data->description);
  $stmt->bindParam(':libelle', $data->libelle);

  try {
    if ($stmt->execute()) {
      http_response_code(201); // Created
      return json_encode(array("message" => "Recherche created successfully."));
    } else {
      http_response_code(500); // Internal Server Error
      return json_encode(array("message" => "Unable to create Recherche."));
    }
  } catch (Exception $e) {
    http_response_code(500);
    return json_encode(array("message" => "Error: " . $e->getMessage()));
  }
}

function handlePUT() {
  global $conn;

  // Handle PUT request to update a Recherche
  $id = isset($_GET['id']) ? $_GET['id'] : null;
  $data = json_decode(file_get_contents("php://input"));

  // Validate and sanitize the data as needed
  $data->archiver = $data->archiver ? 1 : 0;

  // Build the SQL update query
  $updateQuery = "UPDATE ProfilRecherche SET libelle = :libelle, description = :description, archiver = :archiver WHERE ID = :id";

  $stmt = $conn->prepare($updateQuery);
  $stmt->bindParam(':id', $id);
  $stmt->bindParam(':libelle', $data->libelle);
  $stmt->bindParam(':description', $data->description);
  $stmt->bindParam(':archiver', $data->archiver);

  try {
    if ($stmt->execute()) {
      http_response_code(200); // OK
      return json_encode(array("message" => "Recherche updated successfully."));
    } else {
      http_response_code(500); // Internal Server Error
      return json_encode(array( "message" => "Unable to update Recherche."));
    }
  } catch (Exception $e) {
    http_response_code(500);
    return json_encode(array("message" => "Error: " . $e->getMessage()));
  }
}

?>
