<?php
// --- api/teachers/create.php --- (POST /api/teachers)
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Includes
include_once '../config/database.php';
include_once '../models/teacher.php'; // Use the Teacher model

// Instantiate DB and teacher object
$database = new Database();
$db = $database->getConnection();
$teacher = new Teacher($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (
    !empty($data->firstName) &&
    !empty($data->lastName) &&
    !empty($data->department)
) {
    // Assign data to teacher object properties
    $teacher->firstName = $data->firstName;
    $teacher->lastName = $data->lastName;
    $teacher->department = $data->department;
    $teacher->email = $data->email ?? null;
    $teacher->phone = $data->phone ?? null;

    // Attempt to create teacher using the model method
    $result = $teacher->create(); // create() handles insert, ID/password generation

    if ($result) {
        // Set response code - 201 Created
        http_response_code(201);
        // Send response with the created teacher data
        echo json_encode($result);
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);
        // Send error response
        echo json_encode(array("message" => "Unable to add teacher."));
    }
} else {
    // Set response code - 400 Bad Request
    http_response_code(400);
    // Send error response for incomplete data
    echo json_encode(array("message" => "Unable to add teacher. Data is incomplete. Required: firstName, lastName, department."));
}
?>
