
<?php
// --- api/student/profile/read.php --- (GET /api/student/profile)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Includes
include_once '../../config/database.php';
include_once '../../models/student.php'; // Use Student model

// ** Authentication Check (Placeholder - Implement properly) **
$loggedInStudentId = 1; // Example: Assume student with ID 1 is logged in. REMOVE THIS.

// Instantiate DB and student object
$database = new Database();
$db = $database->getConnection();
$student = new Student($db);

try {
    // Set the ID in the model to the logged-in student's ID
    $student->id = $loggedInStudentId;

    // Attempt to read the student's profile data
    $studentData = $student->readOne(); // Use the existing readOne method

    if ($studentData) {
        // Ensure enrollmentType is included (it should be if readOne is updated)
        // Backend model `readOne` should now return `enrollment_type` as `enrollmentType`
        http_response_code(200);
        echo json_encode($studentData);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Student profile not found."));
    }
} catch (PDOException $e) {
     error_log("PDOException reading student profile: " . $e->getMessage());
     http_response_code(503);
     echo json_encode(array("message" => "Database error occurred while fetching profile: " . $e->getMessage()));
} catch (Exception $e) {
     error_log("Exception reading student profile: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}
?>
