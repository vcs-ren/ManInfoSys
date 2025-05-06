<?php
// --- api/teacher/subjects/read.php --- (GET /api/teacher/subjects)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Includes
include_once '../../config/database.php';

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


try {
    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

    // Query to fetch distinct subjects taught by the logged-in teacher
    $query = "SELECT DISTINCT
                sub.id,
                sub.name,
                sub.description
              FROM
                subjects sub
              JOIN
                section_subject_assignments ssa ON sub.id = ssa.subject_id
              WHERE
                ssa.teacher_id = :teacherId
              ORDER BY
                sub.name ASC";

    $stmt = $db->prepare($query);

    // Bind logged-in teacher ID
    $stmt->bindParam(':teacherId', $loggedInTeacherId, PDO::PARAM_INT);

    $stmt->execute();
    $num = $stmt->rowCount();

    $subjects_arr = array();

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row data
            extract($row);

            $subject_item = array(
                "id" => $id,
                "name" => $name,
                "description" => $description
            );
            array_push($subjects_arr, $subject_item);
        }
    }

    // Set response code - 200 OK
    http_response_code(200);
    // Show subjects data in json format
    echo json_encode($subjects_arr); // Return array (empty if no results)

} catch (PDOException $exception) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching teacher subjects: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch subjects. Database error: " . $exception->getMessage()));
} catch (Exception $e) {
     error_log("General error fetching teacher subjects: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred while fetching subjects."));
}
?>
