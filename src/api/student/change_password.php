<?php
// --- api/student/change_password.php --- (POST)

// Headers
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

// *** IMPORTANT: Replace with actual authentication/session handling ***
// Get the logged-in student's ID (this is a placeholder)
// You would typically get this from a session variable or JWT token
$loggedInStudentId = null; // Placeholder - This NEEDS to be replaced
// Example using a dummy session:
// session_start();
// if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Student' && isset($_SESSION['user_id'])) {
//     $loggedInStudentId = $_SESSION['user_id'];
// }

// ** Temporary Hardcoding for Testing (REMOVE IN PRODUCTION) **
$loggedInStudentId = 1; // Example: Assume student with ID 1 is logged in. REMOVE THIS.


// Validate input data and logged-in user ID
if (
    !empty($loggedInStudentId) &&
    !empty($data->currentPassword) &&
    !empty($data->newPassword)
) {
    $currentPassword = $data->currentPassword;
    $newPassword = $data->newPassword;

    try {
        // Attempt to change the password using the model's method
        // The model method should handle verification of the current password
        if ($student->changePassword($loggedInStudentId, $currentPassword, $newPassword)) {
            // Set response code - 200 OK
            http_response_code(200);
            // Send success response
            echo json_encode(array("message" => "Password updated successfully."));
        } else {
            // This case might not be reached if the model throws exceptions
             http_response_code(503);
             echo json_encode(array("message" => "Unable to update password."));
        }
    } catch (Exception $e) {
         // Handle specific exceptions from the model
         if ($e->getMessage() == "Incorrect current password.") {
              http_response_code(401); // Unauthorized or Bad Request
              echo json_encode(array("message" => $e->getMessage()));
         } else {
              http_response_code(503); // Service Unavailable for other errors
              echo json_encode(array("message" => "Failed to update password: " . $e->getMessage()));
         }
    }

} else if (empty($loggedInStudentId)) {
     // Handle case where user is not properly authenticated
     http_response_code(401); // Unauthorized
     echo json_encode(array("message" => "Authentication required to change password."));
}
else {
    // Set response code - 400 Bad Request for incomplete data
    http_response_code(400);
    echo json_encode(array("message" => "Unable to change password. Data is incomplete. Requires currentPassword and newPassword."));
}
?>
