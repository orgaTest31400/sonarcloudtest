<?php
// Import necessary dependencies
require_once 'config.php';

// Define the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods using a switch statement
switch ($method) {
    case 'GET':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $dep = isset($_GET['dep']) ? $_GET['dep'] : null;
        $cards = isset($_GET['cards']) ? true : false;

        if ($cards) return getCoursCards($id, $dep);
        return getCours($id, $dep);
    case 'POST':
        return handlePOST();
    case 'PUT':
        return handlePUT();
    default:
        http_response_code(405); // Method Not Allowed
        return json_encode(array("message" => "Method not allowed"));
}

function getCours($id = null, $dep = null) {
    global $conn;

    try {
	$query = "SELECT C.*, D.libelle AS libelleDepartement,
                        (SELECT JSON_OBJECT('prenom', PR.prenom, 'nom', PR.nom)
                          FROM ProfesseurReferent PR
                          WHERE PR.ID = C.IDProfesseurReferent
                        ) AS professeurReferent
                  FROM Cours C
                  LEFT JOIN Departement D ON C.IDDepartement = D.ID";

        $conditions = ["archiver = 0"];

        if ($id) {
            $conditions[] = "C.ID = :id";
        }

        if ($dep) {
            $conditions[] = "D.libelle = :dep";
        }

        if (!empty($conditions)) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }

        // Sort by department if specified in the URL
        if ($dep) {
            $query .= " ORDER BY D.libelle";
        }

        $stmt = $conn->prepare($query);

        if ($id) {
            $stmt->bindParam(":id", $id);
        }

        if ($dep) {
            $stmt->bindParam(":dep", $dep);
        }

        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convert the JSON strings into arrays
        foreach ($results as &$result) {
          $result['ID'] = intval($result['ID']);
          $result['IDDepartement'] = intval($result['IDDepartement']);
          $result['nbVacatairesNecessaires'] = intval($result['nbVacatairesNecessaires']);
 	  $result['professeurReferent'] = json_decode($result['professeurReferent'], true);
	  $result['archiver'] = filter_var($result['archiver'], FILTER_VALIDATE_BOOLEAN);
        }

	http_response_code(200);
        if ($id) return json_encode($results[0] ?? null);
        return json_encode($results);
    } catch (PDOException $e) {
	http_response_code(500);
        return json_encode(array("message" => $e)); // Error
    }
}

function getCoursCards($id = null, $dep = null) {
    global $conn;

    try {
        $query = "SELECT C.*, D.libelle AS libelleDepartement,
                         (SELECT JSON_OBJECT('ID', PR.ID, 'prenom', PR.prenom, 'nom', PR.nom, 'adresseEmail', PR.adresseEmail, 'numeroTelephone', PR.numeroTelephone, 'lienProfilGitHub', PR.lienProfilGitHub)
                          FROM ProfesseurReferent PR
                          WHERE PR.ID = C.IDProfesseurReferent
                         ) AS professeurReferent,
                         (SELECT JSON_ARRAYAGG(JSON_OBJECT('ID', V.ID, 'prenom', V.prenom, 'nom', V.nom, 'description', V.description, 'photoIdentite', V.photoIdentite))
                          FROM Vacataire V
                          INNER JOIN Intervenir I ON V.ID = I.IDVacataire
                          WHERE I.IDCours = C.ID
			  AND V.archiver = 0
                         ) AS vacataires
                  FROM Cours C
                  LEFT JOIN Departement D ON C.IDDepartement = D.ID";

        $conditions = ["archiver = 0"];

        if ($dep) {
            $conditions[] = "C.IDDepartement = (SELECT ID FROM Departement WHERE libelle = :dep)";
        }

        if ($id) {
            $conditions[] = "C.ID = :id";
        }

        if (!empty($conditions)) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }

        $stmt = $conn->prepare($query);

        if ($dep) {
            $stmt->bindParam(":dep", $dep);
        }

        if ($id) {
            $stmt->bindParam(":id", $id);
        }

        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Convert the JSON strings into arrays
        foreach ($results as &$result) {
            $result['ID'] = intval($result['ID']);
            $result['IDProfesseurReferent'] = intval($result['IDProfesseurReferent']);
            $result['IDDepartement'] = intval($result['IDDepartement']);
            $result['nbVacatairesNecessaires'] = intval($result['nbVacatairesNecessaires']);
            $result['professeurReferent'] = json_decode($result['professeurReferent'], true);
            $result['vacataires'] = json_decode($result['vacataires'], true) ?? [];
            $result['archiver'] = filter_var($result['archiver'], FILTER_VALIDATE_BOOLEAN);
        }

	http_response_code(200);
        if ($id) return json_encode($results[0] ?? null);
        return json_encode($results);
    } catch (PDOException $e) {
      http_response_code(500);
      return json_encode(array("message" => $e)); // Error
    }
}

function handlePOST() {
    global $conn;

    // Handle POST request to create a new Cours
    $data = json_decode(file_get_contents("php://input"));

    if($_SESSION['type']!=="responsable"){
      http_response_code(403);
      return json_encode(array("message" => "Forbidden"));
    }

    // Validate and sanitize the data as needed

    // Insert the new Cours into the database
    $insertQuery = "INSERT INTO Cours (libelle, description, nbVacatairesNecessaires, IDProfesseurReferent, IDDepartement)
                    VALUES (:libelle, :description, :nbVacatairesNecessaires, :IDProfesseurReferent, :IDDepartement)";

    $stmt = $conn->prepare($insertQuery);
    $stmt->bindParam(':libelle', $data->libelle);
    $stmt->bindParam(':description', $data->description);
    $stmt->bindParam(':nbVacatairesNecessaires', $data->nbVacatairesNecessaires);
    $stmt->bindParam(':IDProfesseurReferent', $data->IDProfesseurReferent);
    $stmt->bindParam(':IDDepartement', $data->IDDepartement);

    if ($stmt->execute()) {
	http_response_code(200);
        return json_encode(array("message" => "Cours created successfully."));
    } else {
	http_response_code(500);
        return json_encode(array("message" => "Unable to create Cours."));
    }
}

function handlePUT() {
    global $conn;

    // Handle PUT request to update a Cours
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    $data = json_decode(file_get_contents("php://input"));

    if($_SESSION['type']!=="responsable"){
      http_response_code(403);
      return json_encode(array("message" => "Forbidden"));
    }

    // Validate and sanitize the data as needed
    $data->archiver = $data->archiver ? 1 : 0;

    // Define the fields that can be updated
    $allowedFields = ['libelle', 'nbVacatairesNecessaires', 'description', 'IDDepartement', 'archiver'];

    // Initialize an array to store the fields to update
    $fieldsToUpdate = array("IDProfesseurReferent = :IDProfesseurReferent");

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

    // Build the SQL query
    $query = "UPDATE Cours SET " . implode(', ', $fieldsToUpdate) . " WHERE ID = :id";

    $stmt = $conn->prepare($query);

    // Bind parameters for the fields that are provided in the data
    foreach ($allowedFields as $field) {
        if (isset($data->{$field})) {
            $stmt->bindParam(":{$field}", $data->{$field});
        }
    }

    // Bind the ID parameter
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':IDProfesseurReferent', $data->IDProfesseurReferent);

    try {
        if ($stmt->execute()) {
           http_response_code(200);
           return json_encode(array("message" => "Cours updated successfully."));
        } else {
           http_response_code(500);
           return json_encode(array("message" => "Unable to update Cours."));
        }
    } catch (Exception $e) {
        http_response_code(500);
        return json_encode(array("Message" => $e->getMessage()));
    }
}
