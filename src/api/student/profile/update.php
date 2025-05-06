<?php
// --- api/student/profile/update.php --- (PUT /api/student/profile)

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
    empty($data->id) ||
    $data->id != $loggedInStudentId || // **Crucial security check**
    empty($data->firstName) ||
    empty($data->lastName)
    // Add validation for other required fields if necessary
) {
     http_response_code(400); // Bad Request or 403 Forbidden
     $errorMessage = "Unable to update profile. ";
     if (empty($data->id) || $data->id != $loggedInStudentId) {
         $errorMessage .= "Invalid request or ID mismatch.";
     } else {
         $errorMessage .= "Required data is missing (firstName, lastName).";
     }
     echo json_encode(array("message" => $errorMessage));
     exit();
}

try {
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


    // Attempt to update student profile using the standard update() method
    // (The model's update method was modified to only update allowed fields)
    $updatedStudentData = $student->update();

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
            error_log("Failed to update student profile for ID: " . $student->id);
            http_response_code(503); // Service Unavailable
            echo json_encode(array("message" => "Unable to update student profile. Database operation failed."));
         }
    }
} catch (PDOException $e) {
     error_log("PDOException updating student profile: " . $e->getMessage());
     http_response_code(503);
     echo json_encode(array("message" => "Database error occurred while updating profile: " . $e->getMessage()));
} catch (Exception $e) {
      error_log("Exception updating student profile: " . $e->getMessage());
      http_response_code(500);
      echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}

?>
