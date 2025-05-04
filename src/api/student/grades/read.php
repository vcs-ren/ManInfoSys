<?php
// --- api/student/grades/read.php --- (GET /api/student/grades)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Includes
include_once '../../config/database.php';

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


// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// Query to fetch grades for the logged-in student, grouped by subject
$query = "SELECT
            sub.id AS subjectId, -- Use subject ID as the main ID for the row
            sub.name AS subjectName,
            -- Fetch grades using MAX aggregation within the group
            MAX(CASE WHEN g.term = 'Prelim' THEN g.grade ELSE NULL END) AS prelimGrade,
            MAX(CASE WHEN g.term = 'Midterm' THEN g.grade ELSE NULL END) AS midtermGrade,
            MAX(CASE WHEN g.term = 'Final' THEN g.grade ELSE NULL END) AS finalGrade,
            MAX(CASE WHEN g.term = 'Final' THEN g.remarks ELSE NULL END) AS finalRemarks
          FROM
            grades g
          JOIN
            subjects sub ON g.subject_id = sub.id
          WHERE
            g.student_id = :studentId
          GROUP BY
            sub.id, sub.name -- Group by subject to get one row per subject
          ORDER BY
            sub.name ASC"; // Order by subject name

try {
    $stmt = $db->prepare($query);

    // Bind logged-in student ID
    $stmt->bindParam(':studentId', $loggedInStudentId, PDO::PARAM_INT);

    $stmt->execute();
    $num = $stmt->rowCount();

    $grades_arr = array();

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row data
            extract($row);

             // Determine overall status based on grades
             $status = 'Not Submitted';
             if ($prelimGrade !== null || $midtermGrade !== null || $finalGrade !== null) {
                 $status = 'Incomplete';
             }
             if ($finalGrade !== null) {
                  $status = 'Complete';
             }

            $grade_item = array(
                "id" => $subjectId, // Use subjectId as the unique row ID for the frontend table
                "subjectName" => $subjectName,
                // Ensure grades are numbers or null
                "prelimGrade" => $prelimGrade === null ? null : (float)$prelimGrade,
                "midtermGrade" => $midtermGrade === null ? null : (float)$midtermGrade,
                "finalGrade" => $finalGrade === null ? null : (float)$finalGrade,
                "finalRemarks" => $finalRemarks,
                "status" => $status // Calculated status
            );
            array_push($grades_arr, $grade_item);
        }
    }

    // Set response code - 200 OK
    http_response_code(200);
    // Show grades data in json format
    echo json_encode($grades_arr); // Return array (empty if no results)

} catch (PDOException $exception) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching student grades: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch grades. " . $exception->getMessage()));
}
?>
