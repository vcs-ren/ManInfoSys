<?php
// --- api/students/create.php --- (POST /api/students)
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
include_once '../models/student.php'; // Use the Student model

// Instantiate DB and student object
$database = new Database();
$db = $database->getConnection();
$student = new Student($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Basic validation for required fields
if (
    empty($data->firstName) ||
    empty($data->lastName) ||
    empty($data->course) ||
    empty($data->status) ||
    // If status requires year, ensure it's provided
    (in_array($data->status, ['Transferee', 'Returnee']) && empty($data->year))
) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to add student. Required fields (firstName, lastName, course, status) are missing or invalid. Year level is required for Transferee or Returnee status."));
    exit();
}


try {
    // Assign data to student object properties
    $student->firstName = $data->firstName;
    $student->lastName = $data->lastName;
    $student->middleName = $data->middleName ?? null;
    $student->suffix = $data->suffix ?? null;
    $student->gender = $data->gender ?? null;
    $student->birthday = $data->birthday ?? null;
    $student->course = $data->course;
    $student->status = $data->status;
    // Let the model handle year logic, but provide it if available
    $student->year = $data->year ?? null; // Year is required based on status checked above
    // Make sure year is set for 'New' status before section generation
    if ($student->status === 'New') {
         $student->year = '1st Year';
    }
    $student->email = $data->email ?? null;
    $student->phone = $data->phone ?? null;
    $student->emergencyContactName = $data->emergencyContactName ?? null;
    $student->emergencyContactRelationship = $data->emergencyContactRelationship ?? null;
    $student->emergencyContactPhone = $data->emergencyContactPhone ?? null;
    $student->emergencyContactAddress = $data->emergencyContactAddress ?? null;

    // Attempt to create student using the model method
    // create() method handles insert, ID/username/section/password generation
    $result = $student->create();

    if ($result && isset($result['id'])) { // Check if result contains the expected data
        // Set response code - 201 Created
        http_response_code(201);
        // Send response with the created student data (excluding password hash)
        echo json_encode($result); // Return the data array provided by the model's create() method
    } else {
        // Log detailed error if available
        error_log("Failed to create student in API. Model returned: " . print_r($result, true));
        // Set response code - 503 Service Unavailable
        http_response_code(503);
        // Send error response
        echo json_encode(array("message" => "Unable to add student. Internal server error or failed database operation."));
    }
} catch (PDOException $e) {
    // Database-level error (e.g., unique constraint violation on username)
    error_log("PDOException creating student: " . $e->getMessage());
    if ($e->errorInfo[1] == 1062) { // Error code for duplicate entry
        http_response_code(409); // Conflict
        echo json_encode(array("message" => "Cannot add student. The generated username already exists. Please try again or contact support if the issue persists."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Database error occurred while creating student: " . $e->getMessage()));
    }
} catch (Exception $e) {
     // Other exceptions (e.g., from ID generation)
     error_log("Exception creating student: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}

?>

    