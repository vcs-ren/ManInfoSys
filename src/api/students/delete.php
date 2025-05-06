<?php
// --- api/students/delete.php --- (DELETE /api/students/{id})

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS"); // Allow DELETE and OPTIONS
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
if (empty($id) || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to delete student. Missing or invalid student ID in URL."));
    exit();
}

try {
    $student->id = intval($id);

    // Optional: Check if student exists before attempting delete
    // This avoids a potentially confusing "success" if the ID didn't exist
    $checkStudent = new Student($db);
    $checkStudent->id = $student->id;
    if (!$checkStudent->readOne()) {
        http_response_code(404);
        echo json_encode(array("message" => "Student not found. Cannot delete."));
        exit();
    }


    // Attempt to delete the student using the model method
    if ($student->delete()) {
        // Set response code - 204 No Content (successful deletion)
        http_response_code(204);
        // No body needed for 204 response
    } else {
        // If delete returned false, but we know the student existed, it's likely a DB error
        error_log("Failed to delete student with ID: {$student->id}"); // Log the error
        http_response_code(503); // Service Unavailable (deletion failed for other reasons)
        echo json_encode(array("message" => "Unable to delete student. A database error likely occurred."));
    }
} catch (PDOException $e) {
     error_log("PDOException deleting student: " . $e->getMessage());
     http_response_code(503);
     echo json_encode(array("message" => "Database error occurred while deleting student: " . $e->getMessage()));
} catch (Exception $e) {
     error_log("Exception deleting student: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}
?>

