<?php
$TypeProfil = new class
{
    public $TOUS = 'all';
    public $VACATAIRE = 'vacataire';
    public $PROFIL_RECHERCHE = 'profil-recherche';
    public $RESPONSABLE_VACATAIRES = 'responsable';
};

function error($message)
{
    file_put_contents("error.txt", json_encode($message) . "\n", FILE_APPEND);
}

function handleNewFile($data, $fileType, $table)
{
    if (isset($data->$fileType) && $data->$fileType != '') {
        removeFile($data->ID, $fileType, $table);

        if ($data->$fileType != 'DELETE') {
            $mime = mime_content_type($data->$fileType);
            $extension = explode('/', $mime)[1];
            

            if ($extension && $extension != '') {
                $randomFileName = generateRandomHash() . "." . $extension;
                $savePath = $fileType === 'cvFile' ? '../assets/CV/' : '../assets/photosIdentite/';
        
                return saveDataURIToFile($data->$fileType, $savePath, $randomFileName);
            }
        }
    }

    return $fileType == 'cvFile' ? $data->cv ?? '' : $data->photoIdentite ?? '';
}

function removeFile($id, $fileType, $table)
{
    global $conn;

    try {
        $query = "SELECT * FROM $table WHERE ID = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $filePath = $fileType === 'cvFile' ? $user['cv'] : $user['photoIdentite'];

            if ($filePath != '') {
                // $actualPath = "../" . $filePath;
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
        }
    } catch (PDOException $e) {
        error($e->getMessage());
    }
}

function saveDataURIToFile($dataURI, $path, $fileName)
{
    // Split the data URI to extract the MIME type and data
    list($type, $data) = explode(';', $dataURI, 2);
    list(, $data) = explode(',', $data, 2);

    // Decode the data and save it to the specified path
    $data = base64_decode($data);
    
    if ($data === false) return '';

    $fileExtension = '';

    // Example: Extract the extension from a MIME type
    if (preg_match('/^data:(.*?);/', $type, $matches)) {
        $fileExtension = $matches[1];
    }

    // Ensure the file extension is safe
    $fileExtension = preg_replace('/[^a-zA-Z0-9]/', '', $fileExtension);

    // Combine the file extension with the provided filename
    $fullPath = $path . $fileName;

    // Save the data to the specified path
    if (file_put_contents($fullPath, $data) !== false) {
        return $fullPath;
    } else {
        return '';
    }
}

// Helper function to generate a random hash
function generateRandomHash($length = 10)
{
    return bin2hex(random_bytes($length));
}

// Helper function to remove null values from an array
function removeNullValues($array)
{
    foreach ($array as $key => $value) {
        if ($value === null) {
            unset($array[$key]);
        }
    }
    return $array;
}