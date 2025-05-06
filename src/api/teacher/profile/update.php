<?php
// --- api/teacher/profile/update.php --- (PUT /api/teacher/profile)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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


// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields from payload (ensure ID matches logged-in user)
if (
    empty($data->id) ||
    $data->id != $loggedInTeacherId || // **Crucial security check**
    empty($data->firstName) ||
    empty($data->lastName)
    // Add validation for other required fields if necessary
) {
    http_response_code(400); // Bad Request or 403 Forbidden
     $errorMessage = "Unable to update profile. ";
     if (empty($data->id) || $data->id != $loggedInTeacherId) {
         $errorMessage .= "Invalid request or ID mismatch.";
     } else {
         $errorMessage .= "Required data is missing (firstName, lastName).";
     }
     echo json_encode(array("message" => $errorMessage));
     exit();
}

try {
    // Instantiate DB and teacher object
    $database = new Database();
    $db = $database->getConnection();
    $teacher = new Teacher($db);

    // --- Set teacher properties from payload ---
    $teacher->id = $loggedInTeacherId; // Use authenticated ID
    $teacher->firstName = $data->firstName;
    $teacher->lastName = $data->lastName;
    // Only update fields that teachers are allowed to change
    $teacher->email = $data->email ?? null;
    $teacher->phone = $data->phone ?? null;

    // ** IMPORTANT: DO NOT allow teachers to update these fields via this endpoint:**
    // $teacher->teacherId (generated)
    // $teacher->department (usually admin controlled)
    // $teacher->passwordHash (handled via change password endpoint)

    // Attempt to update teacher profile using the standard update() method
    // (The model's update method was modified correctly)
    $updatedTeacherData = $teacher->update();

    if ($updatedTeacherData) {
        // Set response code - 200 OK
        http_response_code(200);
        // Send response with the updated teacher data
        echo json_encode($updatedTeacherData);
    } else {
        // Determine if the error was 'not found' or 'unable to update'
         $checkTeacher = new Teacher($db);
         $checkTeacher->id = $teacher->id;
         if (!$checkTeacher->readOne()) { // Check if teacher exists
              http_response_code(404);
              echo json_encode(array("message" => "Teacher profile not found."));
         } else {
            error_log("Failed to update teacher profile for ID: " . $teacher->id);
            http_response_code(503); // Service Unavailable
            echo json_encode(array("message" => "Unable to update teacher profile. Database operation failed."));
         }
    }
} catch (PDOException $e) {
     error_log("PDOException updating teacher profile: " . $e->getMessage());
     http_response_code(503);
     echo json_encode(array("message" => "Database error occurred while updating profile: " . $e->getMessage()));
} catch (Exception $e) {
      error_log("Exception updating teacher profile: " . $e->getMessage());
      http_response_code(500);
      echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}

?>
