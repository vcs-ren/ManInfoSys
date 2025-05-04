<?php
// --- api/subjects/read.php --- (GET /api/subjects)
header("Access-Control-Allow-Origin: *"); // Allow requests (adjust in production)
header("Content-Type: application/json; charset=UTF-8");

// Includes
include_once '../config/database.php';
// No specific model needed, direct query is simple

// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// Query subjects
$query = "SELECT id, name, description FROM subjects ORDER BY name ASC";

try {
    $stmt = $db->prepare($query);
    $stmt->execute();
    $num = $stmt->rowCount();

    // Check if any subjects found
    if ($num > 0) {
        $subjects_arr = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row); // $id, $name, $description

            $subject_item = array(
                "id" => $id,
                "name" => $name,
                "description" => $description
            );
            array_push($subjects_arr, $subject_item);
        }

        // Set response code - 200 OK
        http_response_code(200);
        // Show subjects data in json format
        echo json_encode($subjects_arr); // Return the array directly
    } else {
        // Set response code - 200 OK (Not an error if empty)
        http_response_code(200);
        // Return an empty array
        echo json_encode(array());
    }
} catch (PDOException $exception) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching subjects: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch subjects. " . $exception->getMessage()));
}
?>
