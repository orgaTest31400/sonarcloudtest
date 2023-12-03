<?php
// Import necessary dependencies
require_once 'config.php';
require_once 'utils.php';

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
  global $conn, $TypeProfil;

  $typeProfil = isset($_GET['typeProfil']) ? $_GET['typeProfil'] : $TypeProfil->TOUS;
  $id = isset($_GET['id']) ? $_GET['id'] : null;
  $libelleCompetence = isset($_GET['libelleCompetence']) ? urldecode($_GET['libelleCompetence']) : null;

  try {
    $query = "SELECT VP.* FROM VacatairePosseder VP";
    $conditions = array();

    if ($typeProfil == $TypeProfil->PROFIL_RECHERCHE) {
      $query = "SELECT PRP.* FROM ProfilRecherchePosseder PRP";
    }

    if ($id) {
      switch ($typeProfil) {
        case $TypeProfil->VACATAIRE:
          $conditions[] = "VP.IDVacataire = :id";
          break;
        case $TypeProfil->PROFIL_RECHERCHE:
          $conditions[] = "PRP.IDVacataire = :id";
          break;
      }
    }

    if ($libelleCompetence) {
      switch ($typeProfil) {
        case $TypeProfil->VACATAIRE:
          $conditions[] = "VP.libelleCompetence = :libelleCompetence";
          break;
        case $TypeProfil->PROFIL_RECHERCHE:
          $conditions[] = "PRP.libelleCompetence = :libelleCompetence";
          break;
      }
    }

    if (!empty($conditions)) {
      $query .= " WHERE " . implode(" AND ", $conditions);
    }

    $stmt = $conn->prepare($query);

    if ($id) {
      $stmt->bindParam(':id', $id);
    }

    if ($libelleCompetence) {
      $stmt->bindParam(':libelleCompetence', $libelleCompetence);
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);


    if ($typeProfil == $TypeProfil->TOUS) {
      $stmt = $conn->prepare("SELECT PRP.* FROM ProfilRecherchePosseder PRP");
      $stmt->execute();
      $results = array_merge($results, $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    foreach ($results as &$result) {
      if (isset($result['IDVacataire'])) $result['IDVacataire'] = intval($result['IDVacataire']);
      if (isset($result['IDProfilRecherche'])) $result['IDProfilRecherche'] = intval($result['IDProfilRecherche']);
    }

    // Convert the results to JSON
    http_response_code(200);
    return json_encode($results);
  } catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    return json_encode(array("message" => "Unable to retrieve competences for vacataire.\n$e"));
  }
}

function handlePOST()
{
  global $conn, $TypeProfil;

  $typeProfil = isset($_GET['typeProfil']) ? $_GET['typeProfil'] : null;
  $libelleCompetence = isset($_GET['libelleCompetence']) ? urldecode($_GET['libelleCompetence']) : null;
  $id = isset($_GET['id']) ? $_GET['id'] : null;

  if($id!==$_SESSION['userId'] && $_SESSION['type']!=="responsable"){
    http_response_code(403);
    return json_encode(array("message" => "Forbidden"));
  }

  if ($libelleCompetence == null || $id == null || $typeProfil == null) {
    http_response_code(400); // Bad Request
    return json_encode(array("message" => "typeProfil, libelleCompetence and IDVacataire parameters are required."));
  } else if ($typeProfil == $TypeProfil->TOUS) {
    http_response_code(400); // Bad Request
    return json_encode(array("message" => "Can't use value 'all' for type profil."));
  } else {
    $insertQuery = "";

    switch ($typeProfil) {
      case $TypeProfil->PROFIL_RECHERCHE:
        $insertQuery = "INSERT INTO ProfilRecherchePosseder (libelleCompetence, IDProfilRecherche) VALUES (:libelleCompetence, :id)";
        break;
      case $TypeProfil->VACATAIRE:
        $insertQuery = "INSERT INTO VacatairePosseder (libelleCompetence, IDVacataire) VALUES (:libelleCompetence, :id)";
    }

    $stmt = $conn->prepare($insertQuery);
    $stmt->bindParam(':libelleCompetence', $libelleCompetence);
    $stmt->bindParam(':id', $id);

    if ($stmt->execute()) {
      http_response_code(200); // Created
      return json_encode(array("message" => "Competence assigned to vacataire successfully."));
    } else {
      http_response_code(500); // Internal Server Error
      return json_encode(array("message" => "Unable to assign competence to vacataire."));
    }
  }
}

function handleDELETE()
{
  global $conn, $TypeProfil;

  $typeProfil = isset($_GET['typeProfil']) ? $_GET['typeProfil'] : null;
  $libelleCompetence = isset($_GET['libelleCompetence']) ? urldecode($_GET['libelleCompetence']) : null;
  $id = isset($_GET['id']) ? $_GET['id'] : null;

  if($id!==$_SESSION['userId'] && $_SESSION['type']!=="responsable"){
    return json_encode(array("code" => 403, "message" => "Forbidden"));
  }

  if ($libelleCompetence == null || $id == null || $typeProfil == null) {
    http_response_code(400); // Bad Request
    return json_encode(array("message" => "typeProfil, libelleCompetence and IDVacataire parameters are required."));
  } else if ($typeProfil == $TypeProfil->TOUS) {
    http_response_code(400); // Bad Request
    return json_encode(array("message" => "Can't use value 'all' for type profil."));
  }else {
    $insertQuery = "";

    switch ($typeProfil) {
      case $TypeProfil->PROFIL_RECHERCHE:
        $insertQuery = "DELETE FROM ProfilRecherchePosseder WHERE libelleCompetence = :libelleCompetence AND IDProfilRecherche = :id";
        break;
      case $TypeProfil->VACATAIRE:
        $insertQuery = "DELETE FROM VacatairePosseder WHERE libelleCompetence = :libelleCompetence AND IDVacataire = :id";
    }

    $stmt = $conn->prepare($insertQuery);
    $stmt->bindParam(':libelleCompetence', $libelleCompetence);
    $stmt->bindParam(':id', $id);

    if ($stmt->execute()) {
      http_response_code(200); // Created
      return json_encode(array("message" => "Competence unassigned from vacataire successfully."));
    } else {
      http_response_code(500); // Internal Server Error
      return json_encode(array("message" => "Unable to unassign competence from vacataire."));
    }
  }
}
