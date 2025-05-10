
<?php
// --- api/students/update.php --- (PUT /api/students/{id})

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS"); // Allow PUT method and OPTIONS for preflight
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
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$id = end($url_parts);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Basic validation for ID and required fields
if (
    empty($id) || !is_numeric($id) ||
    empty($data->firstName) ||
    empty($data->lastName) ||
    empty($data->program) || // Keep backend key as 'program'
    empty($data->enrollmentType) || // Changed from status
    (in_array($data->enrollmentType, ['Transferee', 'Returnee']) && empty($data->year))
) {
    http_response_code(400);
    $errorMessage = "Unable to update student. ";
    if (empty($id) || !is_numeric($id)) {
        $errorMessage .= "Missing or invalid student ID in URL. ";
    }
    if (empty($data->firstName) || empty($data->lastName) || empty($data->program) || empty($data->enrollmentType)) {
        $errorMessage .= "Required data is missing (firstName, lastName, program, enrollmentType). ";
    }
    if (in_array($data->enrollmentType, ['Transferee', 'Returnee']) && empty($data->year)) {
         $errorMessage .= "Year level is required for Transferee or Returnee enrollmentType.";
    }
    echo json_encode(array("message" => trim($errorMessage)));
    exit();
}

try {
    // Set ID and other properties in the student object
    $student->id = intval($id);
    $student->firstName = $data->firstName;
    $student->lastName = $data->lastName;
    $student->middleName = $data->middleName ?? null;
    $student->suffix = $data->suffix ?? null;
    $student->gender = $data->gender ?? null;
    $student->birthday = $data->birthday ?? null;
    $student->program = $data->program; // Keep backend key as 'program'
    $student->enrollmentType = $data->enrollmentType; // Changed from status
    $student->year = $data->enrollmentType === 'New' ? '1st Year' : ($data->year ?? null); // Set year based on enrollmentType
    $student->email = $data->email ?? null;
    $student->phone = $data->phone ?? null;
    $student->emergencyContactName = $data->emergencyContactName ?? null;
    $student->emergencyContactRelationship = $data->emergencyContactRelationship ?? null;
    $student->emergencyContactPhone = $data->emergencyContactPhone ?? null;
    $student->emergencyContactAddress = $data->emergencyContactAddress ?? null;

    // Attempt to update student using the specific admin update method
    $updatedStudentData = $student->adminUpdate();

    if ($updatedStudentData) {
        // Set response code - 200 OK
        http_response_code(200);
        // Send response with the updated student data
        echo json_encode($updatedStudentData);
    } else {
        // Determine if the error was 'not found' or 'unable to update'
        $checkStudent = new Student($db);
        $checkStudent->id = $student->id;
        if (!$checkStudent->readOne()) { // Check if student exists
              http_response_code(404);
              echo json_encode(array("message" => "Student not found."));
        } else {
            error_log("Failed to update student ID {$student->id} via admin endpoint.");
            http_response_code(503); // Service Unavailable
            echo json_encode(array("message" => "Unable to update student. Database error or record not found."));
        }
    }
} catch (PDOException $e) {
     error_log("PDOException updating student: " . $e->getMessage());
     http_response_code(503);
     echo json_encode(array("message" => "Database error occurred while updating student: " . $e->getMessage()));
} catch (Exception $e) {
      error_log("Exception updating student: " . $e->getMessage());
      http_response_code(500);
      echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}
?>
