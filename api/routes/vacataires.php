<?php
// Import necessary dependencies
require_once 'config.php';
require_once 'utils.php';

// Define the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods using a switch statement
switch ($method) {
  case 'GET':
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    if ($id == $_SESSION['userId'] || $_SESSION['type'] == $TypeProfil->RESPONSABLE_VACATAIRES) {
      return getVacataires($id);
    } else {
      return json_encode(array("message" => "Forbidden"));
    }
  case 'POST':
    return handlePOST();
  case 'PUT':
    return handlePUT();
  default:
    http_response_code(405); // Method Not Allowed
    return json_encode(array("message" => "Method not allowed"));
}

function getVacataires($id)
{
  global $conn;

  try {
    $query = "SELECT V.*,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('libelle', C.libelle))
         FROM Competence C
         WHERE C.libelle IN (
             SELECT VP.libelleCompetence
             FROM VacatairePosseder VP
             WHERE VP.IdVacataire = V.id
         )) AS competences,
        (SELECT JSON_OBJECTAGG(D.libelle, IFNULL((SELECT JSON_ARRAYAGG(JSON_OBJECT('ID', C2.ID, 'libelle', C2.libelle, 'nbVacatairesNecessaires', C2.nbVacatairesNecessaires, 'professeurReferent', (SELECT JSON_OBJECT('ID', PR.ID,
            'prenom', PR.prenom,
            'nom', PR.nom) AS professeurReferent
          FROM ProfesseurReferent PR
          WHERE PR.ID = C2.IDProfesseurReferent
         ), 'vacataires', (SELECT JSON_ARRAYAGG(JSON_OBJECT('ID', V2.ID, 'prenom', V2.prenom, 'nom', V2.nom)) AS vacataires
              FROM Vacataire V2
              INNER JOIN Intervenir I2 ON V2.ID = I2.IDVacataire
              WHERE I2.IDCours = C2.ID
	      AND V2.archiver = 0
             )
            ))
           FROM Cours C2
           WHERE C2.ID IN (
               SELECT I.IdCours
               FROM Intervenir I
               WHERE I.IdVacataire = V.ID
               AND C2.IDDepartement = D.ID
	       AND C2.archiver = 0
           )
          ), JSON_ARRAY()))
         FROM Departement D
         ) AS cours
 FROM Vacataire V";

    $conditions = ["archiver = 0"];

    if ($id) {
      $conditions[] = "V.ID = :id";
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

    // Process results
    $processedResults = [];
    foreach ($results as $result) {
      unset($result['hashMdp']);
      $result['ID'] = intval($result['ID']);
      $result['competences'] = json_decode($result['competences'], true) ?? [];

      // Deserialize the "formations" field
      $result['formations'] = unserialize($result['formations']);
      $result['formations'] = $result['formations'] === false ? [] : $result['formations'];

      $result['archiver'] = filter_var($result['archiver'], FILTER_VALIDATE_BOOLEAN);

      $result['cours'] = json_decode($result['cours'], true);
      foreach ($result['cours'] as $dept => $cours) {
        if ($cours == null) unset($result['cours'][$dept]);
        else foreach ($cours as $index => &$c) {
          $c['vacataires'] = $c['vacataires'] ?? [];
        }
      }

      $processedResults[] = $result;
    }

    http_response_code(200);
    if ($id) {
      return json_encode($processedResults[0] ?? null);
    }
    return json_encode($processedResults);
  } catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    return json_encode(array("message" => "Internal Server Error"));
  }
}

function handlePOST()
{
  global $conn;

  // Handle POST request to create a new Vacataire
  $data = json_decode(file_get_contents("php://input"));

  // Validate and sanitize the data as needed
  $photoIdentitePath = handleNewFile($data, 'image', 'Vacataire');
  $cvPath = handleNewFile($data, 'cvFile', 'Vacataire');

  // Insert the new Vacataire into the database
  $insertQuery = "INSERT INTO Vacataire (prenom, nom, hashMdp, description, photoIdentite, cv, statut, dateCandidature, adresseEmail, numeroTelephone, tagDiscord, lienProfilGitHub)
                  VALUES (:prenom, :nom, :hashMdp, :description, :photoIdentite, :cv, :statut, CURRENT_TIMESTAMP, :adresseEmail, :numeroTelephone, :tagDiscord, :lienProfilGitHub)";

  // Hashing the mot de passe
  $mdpHash = password_hash($data->hashMdp, PASSWORD_DEFAULT);

  $stmt = $conn->prepare($insertQuery);
  $stmt->bindParam(':prenom', $data->prenom);
  $stmt->bindParam(':nom', $data->nom);
  $stmt->bindParam(':hashMdp', $mdpHash);
  $stmt->bindParam(':description', $data->description);
  $stmt->bindParam(':statut', $data->statut);
  $stmt->bindParam(':adresseEmail', $data->adresseEmail);
  $stmt->bindParam(':numeroTelephone', $data->numeroTelephone);
  $stmt->bindParam(':tagDiscord', $data->tagDiscord);
  $stmt->bindParam(':lienProfilGitHub', $data->lienProfilGitHub);
  $stmt->bindParam(':photoIdentite', $photoIdentitePath);
  $stmt->bindParam(':cv', $cvPath);

  try {
    if ($stmt->execute()) {
      http_response_code(200);
      return json_encode(array("message" => "Vacataire created successfully."));
    } else {
      http_response_code(500);
      return json_encode(array("message" => "Internal Server Error"));
    }
  } catch (Exception $e) {
    http_response_code(500);
    return json_encode(array("message" => $e->getMessage()));
  }
}

function handlePUT()
{
  global $conn;

  // Handle PUT request to update a Vacataire
  $id = isset($_GET['id']) ? $_GET['id'] : null;
  if ($id !== $_SESSION['userId'] && $_SESSION['type'] !== "responsable") {
    http_response_code(403);
    return json_encode(array("message" => "Forbidden"));
  }

  $data = json_decode(file_get_contents("php://input"));

  // Validate and sanitize the data as needed
  $data->formations = serialize($data->formations);
  if (isset($data->hashMdp) && $data->hashMdp != '') $data->hashMdp = password_hash($data->hashMdp, PASSWORD_DEFAULT);
  else unset($data->hashMdp);
  $data->archiver = $data->archiver ? 1 : 0;

  // Initialize an array to store the fields to update
  $fieldsToUpdate = [];

  $photoIdentitePath = handleNewFile($data, 'image', 'Vacataire');
  $cvPath = handleNewFile($data, 'cvFile', 'Vacataire');

  // Define the fields that can be updated for Vacataire
  $allowedFields = ['prenom', 'nom', 'hashMdp', 'description', 'statut', 'photoIdentite', 'cv', 'dateCandidature', 'dateRecrutement', 'adresseEmail', 'numeroTelephone', 'tagDiscord', 'lienProfilGitHub', 'formations', 'archiver'];

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
  $updateQuery = "UPDATE Vacataire SET " . implode(', ', $fieldsToUpdate) . " WHERE ID = :id";

  $stmt = $conn->prepare($updateQuery);

  // Bind parameters for the fields that are provided in the data
  foreach ($allowedFields as $field) {
    if (isset($data->{$field})) {
      $stmt->bindParam(":{$field}", $data->{$field});
    }
  }

  // Bind the ID parameter
  $stmt->bindParam(':id', $id);

  // Bind the photoIdentite path if it was provided
  if (isset($photoIdentitePath)) $stmt->bindParam(':photoIdentite', $photoIdentitePath);

  // Bind the photoIdentite path if it was provided
  if (isset($cvPath)) $stmt->bindParam(':cv', $cvPath);

  try {
    if ($stmt->execute()) {
      http_response_code(200);
      return json_encode(array("message" => "Vacataire updated successfully." . error_get_last()['message']));
    } else {
      http_response_code(500); // Internal Server Error
      return json_encode(array("message" => "Internal Server Error"));
    }
  } catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    return json_encode(array("message" => $e->getMessage()));
  }
}
