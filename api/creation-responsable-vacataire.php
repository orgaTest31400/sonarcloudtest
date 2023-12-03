<?php
require_once("config.php");

if(isset($_POST['prenom']) && 
    isset($_POST['nom']) &&
    isset($_POST['mdp']) &&
    isset($_POST['description']) &&
    isset($_POST['photo']) &&
    isset($_POST['email']) &&
    isset($_POST['tel'])) {

    $prenom = $_POST['prenom'];
    $nom = $_POST['nom'];
    $mdp = password_hash($_POST['mdp'], PASSWORD_DEFAULT);
    $description = $_POST['description'];
    $photo = $_POST['photo'];
    $email = $_POST['email'];
    $tel = $_POST['tel'];

    $insertQuery = "INSERT INTO ResponsableVacataires (prenom, nom, hashMdp, description, photoIdentite, adresseEmail, numeroTelephone)
                    VALUES (:prenom, :nom, :hashMdp, :description, :photoIdentite, :adresseEmail, :numeroTelephone)";
    
    try {
        $stmt = $conn->prepare($insertQuery);
        $stmt->bindParam(':prenom', $prenom);
        $stmt->bindParam(':nom', $nom);
        $stmt->bindParam(':hashMdp', $mdp); // Assuming $mdp contains the hashed password
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':photoIdentite', $photo);
        // The following lines are missing in the original code, make sure to define these variables
        $stmt->bindParam(':adresseEmail', $email);
        $stmt->bindParam(':numeroTelephone', $tel);
        $stmt->execute();
    } catch (\Throwable $th) {
        echo $th;
    }
}
?>

<form action="" method="post">
    <input type="text" placeholder="prénom" name="prenom" />
    <input type="text" placeholder="nom" name="nom"/>
    <input type="text" placeholder="mot de passe" name="mdp"/>
    <input type="text" placeholder="description" name="description"/>
    <input type="text" placeholder="photo d' identité" name="photo"/>
    <input type="text" placeholder="email" name="email"/>
    <input type="text" placeholder="numéro de téléphone" name="tel"/>
    <button>Ajouter un responsable</button>
</form>
