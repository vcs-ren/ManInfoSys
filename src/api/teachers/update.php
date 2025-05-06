<?php
// --- api/teachers/update.php --- (PUT /api/teachers/{id})

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate ID and required fields
if (
    empty($id) || !is_numeric($id) ||
    empty($data->firstName) ||
    empty($data->lastName) ||
    empty($data->department)
) {
    http_response_code(400);
    $errorMessage = "Unable to update teacher. ";
    if (empty($id) || !is_numeric($id)) {
        $errorMessage .= "Missing or invalid teacher ID in URL. ";
    }
    if (empty($data->firstName) || empty($data->lastName) || empty($data->department)) {
        $errorMessage .= "Required data is missing (firstName, lastName, department).";
    }
    echo json_encode(array("message" => trim($errorMessage)));
    exit();
}

try {
    // Set ID and other properties in the teacher object
    $teacher->id = intval($id);
    $teacher->firstName = $data->firstName;
    $teacher->lastName = $data->lastName;
    $teacher->department = $data->department;
    $teacher->email = $data->email ?? null;
    $teacher->phone = $data->phone ?? null;

    // Attempt to update teacher using the admin update method from the model
    $updatedTeacherData = $teacher->adminUpdate();

    if ($updatedTeacherData) {
        // Set response code - 200 OK
        http_response_code(200);
        // Send response with the updated teacher data
        echo json_encode($updatedTeacherData);
    } else {
         // Check if teacher exists before declaring update failure
         $checkTeacher = new Teacher($db);
         $checkTeacher->id = $teacher->id;
         if (!$checkTeacher->readOne()) {
              http_response_code(404);
              echo json_encode(array("message" => "Teacher not found."));
         } else {
             error_log("Failed to update teacher ID {$teacher->id} via admin endpoint.");
            http_response_code(503); // Service Unavailable
            echo json_encode(array("message" => "Unable to update teacher. Database error or record not found."));
         }
    }
} catch (PDOException $e) {
     error_log("PDOException updating teacher: " . $e->getMessage());
     http_response_code(503);
     echo json_encode(array("message" => "Database error occurred while updating teacher: " . $e->getMessage()));
} catch (Exception $e) {
      error_log("Exception updating teacher: " . $e->getMessage());
      http_response_code(500);
      echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}
?>
