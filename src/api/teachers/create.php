<?php
// --- api/teachers/create.php --- (POST /api/teachers)
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (
    empty($data->firstName) ||
    empty($data->lastName) ||
    empty($data->department)
) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to add teacher. Data is incomplete. Required: firstName, lastName, department."));
    exit();
}

try {
    // Assign data to teacher object properties - Updated
    $teacher->firstName = $data->firstName;
    $teacher->lastName = $data->lastName;
    $teacher->middleName = $data->middleName ?? null;
    $teacher->suffix = $data->suffix ?? null;
    $teacher->address = $data->address ?? null; // Assign address
    $teacher->department = $data->department;
    $teacher->email = $data->email ?? null;
    $teacher->phone = $data->phone ?? null;
    $teacher->birthday = $data->birthday ?? null; // Expect YYYY-MM-DD
    $teacher->emergencyContactName = $data->emergencyContactName ?? null;
    $teacher->emergencyContactRelationship = $data->emergencyContactRelationship ?? null;
    $teacher->emergencyContactPhone = $data->emergencyContactPhone ?? null;
    $teacher->emergencyContactAddress = $data->emergencyContactAddress ?? null;


    // Attempt to create teacher using the model method
    $result = $teacher->create(); // create() handles insert, ID/password generation

    if ($result && isset($result['id'])) { // Check if result contains expected data
        // Set response code - 201 Created
        http_response_code(201);
        // Send response with the created teacher data
        echo json_encode($result);
    } else {
         error_log("Failed to create teacher in API. Model returned: " . print_r($result, true));
        // Set response code - 503 Service Unavailable
        http_response_code(503);
        // Send error response
        echo json_encode(array("message" => "Unable to add teacher. Internal server error or failed database operation."));
    }
} catch (PDOException $e) {
    error_log("PDOException creating teacher: " . $e->getMessage());
    http_response_code(503);
    echo json_encode(array("message" => "Database error occurred while creating teacher: " . $e->getMessage()));
} catch (Exception $e) {
     error_log("Exception creating teacher: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}
?>
