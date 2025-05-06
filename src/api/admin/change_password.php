<?php
// --- api/admin/change_password.php --- (POST)

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
include_once '../models/admin.php'; // Use the Admin model

// Instantiate DB and admin object
$database = new Database();
$db = $database->getConnection();
$admin = new Admin($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// *** IMPORTANT: Replace with actual authentication/session handling ***
// Get the logged-in admin's ID (this is a placeholder)
// In a real app, you'd verify a session token or similar
$loggedInAdminId = 1; // Fetch this from session or token. Assuming Admin ID is always 1 for now.

// Validate input data
if (
    empty($loggedInAdminId) || // Ensure we have a logged-in user context
    empty($data->currentPassword) ||
    empty($data->newPassword)
) {
     http_response_code(400);
     echo json_encode(array("message" => "Unable to change password. Data is incomplete. Requires currentPassword and newPassword."));
     exit();
}

$currentPassword = $data->currentPassword;
$newPassword = $data->newPassword;

try {
    // Attempt to change the password using the model's method
    if ($admin->changePassword($loggedInAdminId, $currentPassword, $newPassword)) {
        // Set response code - 200 OK
        http_response_code(200);
        // Send success response
        echo json_encode(array("message" => "Admin password updated successfully."));
    } else {
         // This case might not be reached if the model throws exceptions for specific failures
         // but could indicate a general DB update failure where 0 rows were affected.
         http_response_code(503);
         echo json_encode(array("message" => "Unable to update admin password. Operation may not have completed."));
    }
} catch (Exception $e) {
     // Handle specific exceptions from the model
     if ($e->getMessage() == "Incorrect current password.") {
          http_response_code(401); // Unauthorized or Bad Request
          echo json_encode(array("message" => $e->getMessage()));
     } else {
          // Log the generic error
          error_log("Error changing admin password: " . $e->getMessage());
          http_response_code(503); // Service Unavailable for other errors
          echo json_encode(array("message" => "An error occurred while changing the password: " . $e->getMessage()));
     }
}

?>
