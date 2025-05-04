<?php
// --- api/teacher/profile/read.php --- (GET /api/teacher/profile)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Includes
include_once '../../config/database.php';
include_once '../../models/teacher.php'; // Use Teacher model

// ** Authentication Check (Placeholder - Implement properly) **
// Get the logged-in teacher's ID
$loggedInTeacherId = null;
// Example session check:
// session_start();
// if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Teacher' && isset($_SESSION['user_id'])) {
//     $loggedInTeacherId = $_SESSION['user_id'];
// } else {
//     http_response_code(401); // Unauthorized
//     echo json_encode(array("message" => "Authentication required. Teacher access only."));
//     exit();
// }
// ** END Placeholder Auth **

// ** Temporary Hardcoding for Testing (REMOVE IN PRODUCTION) **
$loggedInTeacherId = 1; // Example: Assume teacher with ID 1 is logged in. REMOVE THIS.


// Instantiate DB and teacher object
$database = new Database();
$db = $database->getConnection();
$teacher = new Teacher($db);

// Set the ID in the model to the logged-in teacher's ID
$teacher->id = $loggedInTeacherId;

// Attempt to read the teacher's profile data using the model's readOne method
$teacherData = $teacher->readOne(); // Assumes readOne() exists and fetches the needed fields

if ($teacherData) {
    // Set response code - 200 OK
    http_response_code(200);
    // Send the teacher profile data
    // readOne returns an array, suitable for json_encode
    echo json_encode($teacherData);
} else {
    // Set response code - 404 Not Found
    http_response_code(404);
    // Send error response
    echo json_encode(array("message" => "Teacher profile not found."));
}
?>
