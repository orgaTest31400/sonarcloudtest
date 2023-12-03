<?php
// Database configuration
$db_host = "127.0.0.1"; // Mettre à jour avec données de l'hôte
$db_name = "gestion_vacataires"; // Mettre à jour avec le nom de la base de données
$db_user = "root"; // Mettre à jour avec le nom d'utilisateur
$db_password = "LesVacatairesNontQuaBienSeTenir"; // Mettre à jour avec le mot de passe

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
