<?php
// --- api/teachers/update.php --- (PUT /api/teachers/{id})

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate ID and required fields
if (
    $id && is_numeric($id) &&
    !empty($data->firstName) &&
    !empty($data->lastName) &&
    !empty($data->department)
) {
    // Set ID and other properties in the teacher object
    $teacher->id = intval($id);
    $teacher->firstName = $data->firstName;
    $teacher->lastName = $data->lastName;
    $teacher->department = $data->department;
    $teacher->email = $data->email ?? null;
    $teacher->phone = $data->phone ?? null;

    // Attempt to update teacher using the model method
    $updatedTeacherData = $teacher->update();

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
            http_response_code(503); // Service Unavailable
            echo json_encode(array("message" => "Unable to update teacher."));
         }
    }
} else {
    // Set response code - 400 Bad Request
    $errorMessage = "Unable to update teacher. ";
    if (empty($id) || !is_numeric($id)) {
        $errorMessage .= "Missing or invalid ID. ";
    }
    if (empty($data->firstName) || empty($data->lastName) || empty($data->department)) {
        $errorMessage .= "Required data is missing (firstName, lastName, department).";
    }
    http_response_code(400);
    echo json_encode(array("message" => $errorMessage));
}
?>
