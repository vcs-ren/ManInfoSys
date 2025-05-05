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

// Get ID from URL path
// Assuming the ID is the last part of the URL path, e.g., /api/students/123
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$id = end($url_parts);

// Validate ID
if ($id && is_numeric($id)) {
    $student->id = intval($id);

    // Attempt to delete the student using the model method
    if ($student->delete()) {
        // Set response code - 204 No Content (successful deletion)
        http_response_code(204);
        // No body needed for 204 response
    } else {
        // Check if the student was not found
        $checkStudent = new Student($db);
        $checkStudent->id = $student->id;
        if (!$checkStudent->readOne()) {
            http_response_code(404);
            echo json_encode(array("message" => "Student not found."));
        } else {
            // Set response code - 503 Service Unavailable (deletion failed for other reasons)
            http_response_code(503);
            error_log("Failed to delete student with ID: {$student->id}"); // Log the error
            echo json_encode(array("message" => "Unable to delete student."));
        }
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);
    // Send error response for missing or invalid ID
    echo json_encode(array("message" => "Unable to delete student. Missing or invalid ID."));
}
?>
