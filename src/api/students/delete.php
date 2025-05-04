<?php
// --- api/students/delete.php --- (DELETE /api/students/{id})

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Includes
include_once '../config/database.php';
include_once '../models/student.php'; // Use the Student model

// Instantiate DB and student object
$database = new Database();
$db = $database->getConnection();
$student = new Student($db);

// Get ID from URL path or query parameter
// This part depends on how your routing/server handles the URL.
// Assuming the ID is the last part of the URL path, e.g., /api/students/123
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$id = end($url_parts);

// Alternative: Get ID from query parameter like /api/students/delete.php?id=123
// $id = isset($_GET['id']) ? $_GET['id'] : null;

// Validate ID
if ($id && is_numeric($id)) {
    $student->id = intval($id);

    // Attempt to delete the student using the model method
    if ($student->delete()) {
        // Set response code - 204 No Content (successful deletion)
        http_response_code(204);
        // No body needed for 204 response
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);
        // Send error response
        echo json_encode(array("message" => "Unable to delete student."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);
    // Send error response for missing or invalid ID
    echo json_encode(array("message" => "Unable to delete student. Missing or invalid ID."));
}
?>
