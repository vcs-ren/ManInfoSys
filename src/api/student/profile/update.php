<?php
// --- api/student/profile/update.php --- (PUT /api/student/profile)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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


// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields from payload (ensure ID matches logged-in user)
if (
    !empty($data->id) &&
    $data->id == $loggedInStudentId && // **Crucial security check**
    !empty($data->firstName) &&
    !empty($data->lastName)
    // Add validation for other required fields if necessary
) {
    // Instantiate DB and student object
    $database = new Database();
    $db = $database->getConnection();
    $student = new Student($db);

    // --- Set student properties from payload ---
    $student->id = $loggedInStudentId; // Use authenticated ID
    $student->firstName = $data->firstName;
    $student->lastName = $data->lastName;
    // Only update fields that students are allowed to change
    $student->email = $data->email ?? null;
    $student->phone = $data->phone ?? null;
    $student->emergencyContactName = $data->emergencyContactName ?? null;
    $student->emergencyContactRelationship = $data->emergencyContactRelationship ?? null;
    $student->emergencyContactPhone = $data->emergencyContactPhone ?? null;
    $student->emergencyContactAddress = $data->emergencyContactAddress ?? null;

    // ** IMPORTANT: DO NOT allow students to update these fields via this endpoint:**
    // $student->studentId (generated)
    // $student->course
    // $student->status
    // $student->year
    // $student->section
    // $student->passwordHash (should be handled via change password endpoint)

    // --- Adapt the update method or create a specific profile update method ---
    // For now, we'll modify the existing update() method in the Student model
    // to ONLY update the allowed fields.
    // A better approach might be a dedicated updateProfile() method.

    // --- Let's modify the query within the Student model's update method ---
    // Go to src/api/models/student.php and adjust the UPDATE query in the update() method
    // to only include firstName, lastName, email, phone, and emergency contact fields.

    // Attempt to update student profile using the (modified) model method
    $updatedStudentData = $student->update(); // Assumes update() is modified

    if ($updatedStudentData) {
        // Set response code - 200 OK
        http_response_code(200);
        // Send response with the updated student data
        echo json_encode($updatedStudentData);
    } else {
        // Determine if the error was 'not found' or 'unable to update'
         $checkStudent = new Student($db);
         $checkStudent->id = $student->id;
         if (!$checkStudent->readOne()) { // Check if student exists
              http_response_code(404);
              echo json_encode(array("message" => "Student profile not found."));
         } else {
            http_response_code(503); // Service Unavailable
            error_log("Failed to update student profile for ID: " . $student->id);
            echo json_encode(array("message" => "Unable to update student profile."));
         }
    }
} else if (empty($data->id) || $data->id != $loggedInStudentId) {
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
