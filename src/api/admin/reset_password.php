<?php
// --- api/admin/reset_password.php --- (POST /api/admin/reset-password)

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
include_once '../models/student.php';
include_once '../models/teacher.php';

// Instantiate DB and objects
$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate input data
if (
    empty($data->userId) || !is_numeric($data->userId) ||
    empty($data->userType) ||
    !in_array($data->userType, ['student', 'teacher'])
) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to reset password. Data is incomplete or invalid user type specified (must be 'student' or 'teacher' with a numeric userId)."));
    exit();
}

$userId = (int)$data->userId;
$userType = $data->userType;

try {
    // Instantiate the correct model
    $userModel = ($userType === 'student') ? new Student($db) : new Teacher($db);
    $userModel->id = $userId; // Set the ID in the model

    // Fetch the user's last name (needed for default password generation)
    $userInfo = $userModel->readOne(); // Assumes readOne() returns user data including lastName

    if ($userInfo && isset($userInfo['lastName'])) {
         $lastName = $userInfo['lastName'];

         // Attempt to reset the password using the model's method
        if ($userModel->resetPassword($userId, $lastName)) {
            // Set response code - 200 OK
            http_response_code(200);
            // Send success response
            echo json_encode(array("message" => ucfirst($userType) . " password reset successfully."));
        } else {
            // Log error if resetPassword failed
            error_log("Failed to reset password for {$userType} ID {$userId}.");
            http_response_code(503); // Service Unavailable
            echo json_encode(array("message" => "Unable to reset " . $userType . " password. Database operation failed."));
        }
    } else {
         // Set response code - 404 Not Found
         http_response_code(404);
         echo json_encode(array("message" => ucfirst($userType) . " with ID {$userId} not found or missing last name."));
    }
} catch (PDOException $e) {
    error_log("PDOException resetting password: " . $e->getMessage());
    http_response_code(503);
    echo json_encode(array("message" => "Database error occurred while resetting password: " . $e->getMessage()));
} catch (Exception $e) {
     error_log("Exception resetting password: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}

?>
