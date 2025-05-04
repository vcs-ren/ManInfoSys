<?php
// --- api/teacher/profile/update.php --- (PUT /api/teacher/profile)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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
    !empty($data->id) &&
    $data->id == $loggedInTeacherId && // **Crucial security check**
    !empty($data->firstName) &&
    !empty($data->lastName)
    // Add validation for other required fields if necessary
) {
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

    // --- Ensure the update method in the Teacher model only updates allowed fields ---
    // Go to src/api/models/teacher.php and adjust the UPDATE query in the update() method
    // to only include firstName, lastName, email, and phone.

    // Attempt to update teacher profile using the (modified) model method
    $updatedTeacherData = $teacher->update(); // Assumes update() is modified correctly

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
            http_response_code(503); // Service Unavailable
            error_log("Failed to update teacher profile for ID: " . $teacher->id);
            echo json_encode(array("message" => "Unable to update teacher profile."));
         }
    }
} else if (empty($data->id) || $data->id != $loggedInTeacherId) {
     http_response_code(403); // Forbidden
     echo json_encode(array("message" => "Unauthorized: Payload ID does not match authenticated user."));
}
else {
    // Set response code - 400 Bad Request
    http_response_code(400);
    // Send error response for missing data
    $errorMessage = "Unable to update profile. Required data is missing (firstName, lastName).";
    echo json_encode(array("message" => $errorMessage));
}
?>
