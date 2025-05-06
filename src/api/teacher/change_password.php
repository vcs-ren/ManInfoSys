<?php
// --- api/teacher/change_password.php --- (POST)

// Headers
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

// *** IMPORTANT: Replace with actual authentication/session handling ***
// Get the logged-in teacher's ID (this is a placeholder)
$loggedInTeacherId = null; // Placeholder - This NEEDS to be replaced
// Example using a dummy session:
// session_start();
// if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Teacher' && isset($_SESSION['user_id'])) {
//     $loggedInTeacherId = $_SESSION['user_id'];
// }

// ** Temporary Hardcoding for Testing (REMOVE IN PRODUCTION) **
$loggedInTeacherId = 1; // Example: Assume teacher with ID 1 is logged in. REMOVE THIS.


// Validate input data and logged-in user ID
if (
    empty($loggedInTeacherId) ||
    empty($data->currentPassword) ||
    empty($data->newPassword)
) {
     if (empty($loggedInTeacherId)) {
         http_response_code(401); // Unauthorized
         echo json_encode(array("message" => "Authentication required to change password."));
     } else {
         http_response_code(400); // Bad Request
         echo json_encode(array("message" => "Unable to change password. Data is incomplete. Requires currentPassword and newPassword."));
     }
    exit();
}

$currentPassword = $data->currentPassword;
$newPassword = $data->newPassword;

try {
    // Attempt to change the password using the model's method
    if ($teacher->changePassword($loggedInTeacherId, $currentPassword, $newPassword)) {
        // Set response code - 200 OK
        http_response_code(200);
        // Send success response
        echo json_encode(array("message" => "Password updated successfully."));
    } else {
         // This case might not be reached if the model throws exceptions
         http_response_code(503);
         echo json_encode(array("message" => "Unable to update password. Teacher not found or database error."));
    }
} catch (Exception $e) {
     // Handle specific exceptions from the model
     if ($e->getMessage() == "Incorrect current password.") {
          http_response_code(401); // Unauthorized or Bad Request
          echo json_encode(array("message" => $e->getMessage()));
     } else {
          error_log("Error changing teacher password: " . $e->getMessage());
          http_response_code(503); // Service Unavailable for other errors
          echo json_encode(array("message" => "Failed to update password: " . $e->getMessage()));
     }
}

?>
