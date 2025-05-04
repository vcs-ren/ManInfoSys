<?php
// --- api/students/create.php --- (POST /api/students)
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Includes
include_once '../config/database.php';
include_once '../models/student.php'; // Use the Student model

// Instantiate DB and student object
$database = new Database();
$db = $database->getConnection();
$student = new Student($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (
    !empty($data->firstName) &&
    !empty($data->lastName) &&
    !empty($data->course) &&
    !empty($data->status)
    // Optional: Add more strict validation based on status/year rules if needed
) {
    // Assign data to student object properties
    $student->firstName = $data->firstName;
    $student->lastName = $data->lastName;
    $student->course = $data->course;
    $student->status = $data->status;
    // Model handles year logic based on status
    $student->year = $student->status === 'New' ? '1st Year' : ($data->year ?? null);
    $student->email = $data->email ?? null;
    $student->phone = $data->phone ?? null;
    $student->emergencyContactName = $data->emergencyContactName ?? null;
    $student->emergencyContactRelationship = $data->emergencyContactRelationship ?? null;
    $student->emergencyContactPhone = $data->emergencyContactPhone ?? null;
    $student->emergencyContactAddress = $data->emergencyContactAddress ?? null;


    // Attempt to create student using the model method
    $result = $student->create(); // create() method handles insert, ID/section/password generation

    if ($result) {
        // Set response code - 201 Created
        http_response_code(201);
        // Send response with the created student data (excluding password hash)
        echo json_encode($result); // Return the data array provided by the model's create() method
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);
        // Send error response
        echo json_encode(array("message" => "Unable to add student."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);
    // Send error response for incomplete data
    echo json_encode(array("message" => "Unable to add student. Data is incomplete. Required: firstName, lastName, course, status. Year is required if status is Continuing, Transferee, or Returnee."));
}
?>
