<?php
// --- api/students/update.php --- (PUT /api/students/{id})

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT"); // Allow PUT method
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
// This part depends on how your routing/server handles the URL.
// Assuming the ID is the last part of the URL path, e.g., /api/students/123
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$id = end($url_parts);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate ID and required fields
if (
    $id && is_numeric($id) &&
    !empty($data->firstName) &&
    !empty($data->lastName) &&
    !empty($data->course) &&
    !empty($data->status)
    // Add more validation if needed
) {
    // Set ID and other properties in the student object
    $student->id = intval($id);
    $student->firstName = $data->firstName;
    $student->lastName = $data->lastName;
    $student->course = $data->course;
    $student->status = $data->status;
    $student->year = $student->status === 'New' ? '1st Year' : ($data->year ?? null); // Handle year logic
    $student->email = $data->email ?? null;
    $student->phone = $data->phone ?? null;
    $student->emergencyContactName = $data->emergencyContactName ?? null;
    $student->emergencyContactRelationship = $data->emergencyContactRelationship ?? null;
    $student->emergencyContactPhone = $data->emergencyContactPhone ?? null;
    $student->emergencyContactAddress = $data->emergencyContactAddress ?? null;


    // Attempt to update student using the model method
    $updatedStudentData = $student->update();

    if ($updatedStudentData) {
        // Set response code - 200 OK
        http_response_code(200);
        // Send response with the updated student data
        echo json_encode($updatedStudentData);
    } else {
        // Determine if the error was 'not found' or 'unable to update'
        // A simple check: if execute returned false but the ID was valid, assume update failure
        // A better approach would be for the model to return specific error types.
         $checkStudent = new Student($db);
         $checkStudent->id = $student->id;
         if (!$checkStudent->readOne()) { // Check if student exists
              http_response_code(404);
              echo json_encode(array("message" => "Student not found."));
         } else {
            http_response_code(503); // Service Unavailable
            echo json_encode(array("message" => "Unable to update student."));
         }
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);
    // Send error response for missing ID or incomplete data
    $errorMessage = "Unable to update student. ";
    if (empty($id) || !is_numeric($id)) {
        $errorMessage .= "Missing or invalid ID. ";
    }
    if (empty($data->firstName) || empty($data->lastName) || empty($data->course) || empty($data->status)) {
        $errorMessage .= "Required data is missing (firstName, lastName, course, status).";
    }
    echo json_encode(array("message" => $errorMessage));
}
?>
