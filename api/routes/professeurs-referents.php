<?php
// Import necessary dependencies and establish a database connection
require_once 'config.php';
require_once 'utils.php';

// Define the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different HTTP methods using a switch statement
switch ($method) {
  case 'GET':
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    return getProfesseursReferents($id);
  case 'POST':
    return handlePOST();
  case 'PUT':
    return handlePUT();
  default:
    http_response_code(405);
    return json_encode(array("message" => "Method not allowed"));
}

function getProfesseursReferents($id = null)
{
  global $conn;

  try {
    $query = "SELECT P.*,
       (SELECT JSON_OBJECTAGG(D.libelle, IFNULL((SELECT JSON_ARRAYAGG(JSON_OBJECT('ID', C2.ID, 'libelle', C2.libelle, 'nbVacatairesNecessaires', C2.nbVacatairesNecessaires, 'professeurReferent', (SELECT
JSON_OBJECT('ID', PR.ID,
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
           WHERE C2.IDProfesseurReferent = P.ID
           AND C2.IDDepartement = D.ID
           AND C2.archiver = 0
          ), JSON_ARRAY()))
         FROM Departement D
         ) AS cours
      FROM ProfesseurReferent P";

    $conditions = ["archiver = 0"];

    if ($id) {
      $conditions[] = "ID = :id";
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

    foreach ($results as &$result) {
      $result['ID'] = intval($result['ID']);
      if ($result['description'] == null) $result['description'] = '';
      $result['cours'] = json_decode($result['cours'], true);
      foreach ($result['cours'] as $dept => &$cours) {
        if ($cours == null) unset($result['cours'][$dept]);
        else foreach ($cours as $index => &$c) {
          $c['vacataires'] = $c['vacataires'] ?? [];
        }
      }
      $result['archiver'] = filter_var($result['archiver'], FILTER_VALIDATE_BOOLEAN);
    }

    http_response_code(200);
    if ($id) return json_encode($results[0] ?? null);
    return json_encode($results);
  } catch (PDOException $e) {
    http_response_code(500);
    return json_encode(array("message" => $e->getMessage()));
  }
}




function handlePOST()
{
  global $conn;

  $data = json_decode(file_get_contents("php://input"));

  // Validate and sanitize the data as needed
  $photoIdentitePath = handleNewFile($data, 'image', 'ProfesseurReferent');

  //return json_encode(array($data, $photoIdentitePath));

  $insertQuery = "INSERT INTO ProfesseurReferent (prenom, nom, photoIdentite, description, adresseEmail, numeroTelephone, lienProfilGitHub, tagDiscord)
                    VALUES (:prenom, :nom, :photoIdentite, :description, :adresseEmail, :numeroTelephone, :lienProfilGitHub, :tagDiscord)";

  $stmt = $conn->prepare($insertQuery);
  $stmt->bindParam(':prenom', $data->prenom);
  $stmt->bindParam(':nom', $data->nom);
  $stmt->bindParam(':adresseEmail', $data->adresseEmail);
  $stmt->bindParam(':numeroTelephone', $data->numeroTelephone);
  $stmt->bindParam(':description', $data->description);
  $stmt->bindParam(':lienProfilGitHub', $data->lienProfilGitHub);
  $stmt->bindParam(':tagDiscord', $data->tagDiscord);

  // Bind the photoIdentite path if it was provided
  $stmt->bindParam(':photoIdentite', $photoIdentitePath);

  try {
    if ($stmt->execute()) {
      http_response_code(200);
      return json_encode(array("message" => "Professeur Referent created successfully."));
    } else {
      http_response_code(500);
      return json_encode(array("message" => "Unable to create Professeur Referent."));
    }
  } catch (PDOException $e) {
    http_response_code(500);
    return json_encode(array("message" => $e->getMessage()));
  }
}




function handlePUT()
{
  global $conn;

  $id = isset($_GET['id']) ? $_GET['id'] : null;
  $data = json_decode(file_get_contents("php://input"));

  $photoIdentitePath = handleNewFile($data, 'image', 'ProfesseurReferent');

  // Validate and sanitize the data as needed
  $data->archiver = $data->archiver ? 1 : 0;

  $updateQuery = "UPDATE ProfesseurReferent SET prenom = :prenom, nom = :nom,
                  adresseEmail = :adresseEmail, numeroTelephone = :numeroTelephone, description = :description, photoIdentite = :photoIdentite, lienProfilGitHub = :lienProfilGitHub, tagDiscord = :tagDiscord,
                  archiver = :archiver WHERE ID = :id";

  $stmt = $conn->prepare($updateQuery);
  $stmt->bindParam(':prenom', $data->prenom);
  $stmt->bindParam(':nom', $data->nom);
  $stmt->bindParam(':adresseEmail', $data->adresseEmail);
  $stmt->bindParam(':numeroTelephone', $data->numeroTelephone);
  $stmt->bindParam(':lienProfilGitHub', $data->lienProfilGitHub);
  $stmt->bindParam(':photoIdentite', $data->photoIdentite);
  $stmt->bindParam(':tagDiscord', $data->tagDiscord);
  $stmt->bindParam(':description', $data->description);
  $stmt->bindParam(':id', $id);
  $stmt->bindParam(':archiver', $data->archiver);

  // Bind the photoIdentite path if it was provided
  if (isset($photoIdentitePath)) $stmt->bindParam(':photoIdentite', $photoIdentitePath);

  try {
    if ($stmt->execute()) {
      http_response_code(200);
      return json_encode(array("message" => "Professeur Referent updated successfully."));
    } else {
      http_response_code(500);
      return json_encode(array("message" => "Unable to update Professeur Referent."));
    }
  } catch (PDOException $e) {
    http_response_code(500);
    return json_encode(array("message" => $e->getMessage()));
  }
}
