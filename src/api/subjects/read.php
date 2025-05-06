<?php
// --- api/subjects/read.php --- (GET /api/subjects)

// ** ALWAYS SEND CORS HEADERS FIRST **
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS"); // Allow GET and OPTIONS
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Respond to preflight requests (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// Includes - Place includes after headers
include_once '../config/database.php';
// No specific model needed, direct query is simple

// Instantiate DB
$database = new Database();
$db = $database->getConnection(); // Handles connection errors internally

// Query subjects
$query = "SELECT id, name, description FROM subjects ORDER BY name ASC";

try {
    $stmt = $db->prepare($query);
    $stmt->execute();
    $num = $stmt->rowCount();

    $subjects_arr = array();
    // Check if any subjects found
    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row); // $id, $name, $description

            $subject_item = array(
                "id" => $id,
                "name" => $name,
                "description" => $description
            );
            array_push($subjects_arr, $subject_item);
        }
    }

    // Set response code - 200 OK (even if empty)
    http_response_code(200);
    // Show subjects data in json format
    echo json_encode($subjects_arr); // Return the array directly

} catch (PDOException $exception) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching subjects: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch subjects. Database error: " . $exception->getMessage()));
} catch (Exception $e) {
     error_log("General error fetching subjects: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred while fetching subjects."));
}
?>
