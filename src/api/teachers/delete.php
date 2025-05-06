<?php
// --- api/teachers/delete.php --- (DELETE /api/teachers/{id})

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
if (empty($id) || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to delete teacher. Missing or invalid teacher ID in URL."));
    exit();
}

try {
    $teacher->id = intval($id);

    // Optional: Check if teacher exists before delete
    $checkTeacher = new Teacher($db);
    $checkTeacher->id = $teacher->id;
    if (!$checkTeacher->readOne()) {
        http_response_code(404);
        echo json_encode(array("message" => "Teacher not found. Cannot delete."));
        exit();
    }

    // Attempt to delete the teacher using the model method
    if ($teacher->delete()) {
        // Set response code - 204 No Content
        http_response_code(204);
    } else {
        error_log("Failed to delete teacher with ID: {$teacher->id}"); // Log the error
        http_response_code(503); // Service Unavailable
        echo json_encode(array("message" => "Unable to delete teacher. A database error likely occurred."));
    }
} catch (PDOException $e) {
     error_log("PDOException deleting teacher: " . $e->getMessage());
     http_response_code(503);
     echo json_encode(array("message" => "Database error occurred while deleting teacher: " . $e->getMessage()));
} catch (Exception $e) {
     error_log("Exception deleting teacher: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}
?>
