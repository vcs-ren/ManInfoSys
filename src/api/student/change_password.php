<?php
// --- api/student/change_password.php --- (POST)

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
include_once '../models/student.php'; // Use the Student model

// Instantiate DB and student object
$database = new Database();
$db = $database->getConnection();
$student = new Student($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

$loggedInStudentId = 1; 


// Validate input data and logged-in user ID
if (
    empty($loggedInStudentId) ||
    empty($data->currentPassword) ||
    empty($data->newPassword)
) {
     if (empty($loggedInStudentId)) {
          http_response_code(401); 
          echo json_encode(array("message" => "Authentication required to change password."));
     } else {
         http_response_code(400); 
         echo json_encode(array("message" => "Unable to change password. Data is incomplete. Requires currentPassword and newPassword."));
     }
    exit();
}

$currentPassword = $data->currentPassword;
$newPassword = $data->newPassword;

// Validate new password strength (server-side)
if (strlen($newPassword) < 7) {
    http_response_code(400);
    echo json_encode(array("message" => "New password must be at least 7 characters long."));
    exit();
}
if (!preg_match('/[a-zA-Z]/', $newPassword)) {
    http_response_code(400);
    echo json_encode(array("message" => "New password must contain at least one letter."));
    exit();
}
if (!preg_match('/[0-9]/', $newPassword)) {
    http_response_code(400);
    echo json_encode(array("message" => "New password must contain at least one number."));
    exit();
}
if (!preg_match('/[@#&?*]/', $newPassword)) { // Updated symbols
    http_response_code(400);
    echo json_encode(array("message" => "New password must contain at least one symbol (@, #, &, ?, *)."));
    exit();
}


try {
    if ($student->changePassword($loggedInStudentId, $currentPassword, $newPassword)) {
        http_response_code(200);
        echo json_encode(array("message" => "Password updated successfully."));
    } else {
         http_response_code(503);
         echo json_encode(array("message" => "Unable to update password. Student not found or database error."));
    }
} catch (Exception $e) {
     if ($e->getMessage() == "Incorrect current password.") {
          http_response_code(401); 
          echo json_encode(array("message" => $e->getMessage()));
     } else {
          error_log("Error changing student password: " . $e->getMessage());
          http_response_code(503); 
          echo json_encode(array("message" => "Failed to update password: " . $e->getMessage()));
     }
}

?>
```