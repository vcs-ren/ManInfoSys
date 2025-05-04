<?php
// --- api/admin/change_password.php --- (POST)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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
$loggedInAdminId = 1; // Fetch this from session or token

// Validate input data
if (
    !empty($loggedInAdminId) &&
    !empty($data->currentPassword) &&
    !empty($data->newPassword)
) {
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
             // This case might not be reached if the model throws exceptions
             http_response_code(503);
             echo json_encode(array("message" => "Unable to update admin password."));
        }
    } catch (Exception $e) {
         // Handle specific exceptions from the model
         if ($e->getMessage() == "Incorrect current password.") {
              http_response_code(401); // Unauthorized or Bad Request
              echo json_encode(array("message" => $e->getMessage()));
         } else {
              http_response_code(503); // Service Unavailable for other errors
              echo json_encode(array("message" => $e->getMessage()));
         }
    }

} else {
    // Set response code - 400 Bad Request
    http_response_code(400);
    // Send error response for incomplete data
    echo json_encode(array("message" => "Unable to change password. Data is incomplete. Requires currentPassword and newPassword."));
}
?>
