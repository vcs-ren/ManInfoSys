<?php
// --- api/teachers/delete.php --- (DELETE /api/teachers/{id})

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Includes
include_once '../config/database.php';
include_once '../models/teacher.php'; // Use the Teacher model

// Instantiate DB and teacher object
$database = new Database();
$db = $database->getConnection();
$teacher = new Teacher($db);

// Get ID from URL path
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$id = end($url_parts);

// Validate ID
if ($id && is_numeric($id)) {
    $teacher->id = intval($id);

    // Attempt to delete the teacher using the model method
    if ($teacher->delete()) {
        // Set response code - 204 No Content
        http_response_code(204);
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete teacher."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);
    echo json_encode(array("message" => "Unable to delete teacher. Missing or invalid ID."));
}
?>
