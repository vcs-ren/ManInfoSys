<?php
// --- api/student/profile/read.php --- (GET /api/student/profile)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Includes
include_once '../../config/database.php';
include_once '../../models/student.php'; // Use Student model

// ** Authentication Check (Placeholder - Implement properly) **
// Get the logged-in student's ID
$loggedInStudentId = null;
// Example session check:
// session_start();
// if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Student' && isset($_SESSION['user_id'])) {
//     $loggedInStudentId = $_SESSION['user_id'];
// } else {
//     http_response_code(401); // Unauthorized
//     echo json_encode(array("message" => "Authentication required. Student access only."));
//     exit();
// }
// ** END Placeholder Auth **

// ** Temporary Hardcoding for Testing (REMOVE IN PRODUCTION) **
$loggedInStudentId = 1; // Example: Assume student with ID 1 is logged in. REMOVE THIS.


// Instantiate DB and student object
$database = new Database();
$db = $database->getConnection();
$student = new Student($db);

// Set the ID in the model to the logged-in student's ID
$student->id = $loggedInStudentId;

// Attempt to read the student's profile data
$studentData = $student->readOne(); // Use the existing readOne method

if ($studentData) {
    // Set response code - 200 OK
    http_response_code(200);
    // Send the student profile data
    // readOne returns an array, which is fine for json_encode
    echo json_encode($studentData);
} else {
    // Set response code - 404 Not Found
    http_response_code(404);
    // Send error response
    echo json_encode(array("message" => "Student profile not found."));
}
?>
