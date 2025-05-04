<?php
// --- api/teacher/assignments/grades/read.php --- (GET /api/teacher/assignments/grades)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

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


// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// Query to fetch student assignments for the logged-in teacher,
// joining students, subjects, sections, and grades.
$query = "SELECT
            ssa.id AS assignmentId, -- Use assignment ID as the unique key for this context
            st.id AS studentId,
            CONCAT(st.first_name, ' ', st.last_name) AS studentName,
            sub.id AS subjectId,
            sub.name AS subjectName,
            sec.section_code AS section,
            sec.year_level AS year,
            -- Fetch grades using LEFT JOINs and aggregate MAX to get the latest grade per term
            MAX(CASE WHEN g.term = 'Prelim' THEN g.grade ELSE NULL END) AS prelimGrade,
            MAX(CASE WHEN g.term = 'Prelim' THEN g.remarks ELSE NULL END) AS prelimRemarks,
            MAX(CASE WHEN g.term = 'Midterm' THEN g.grade ELSE NULL END) AS midtermGrade,
            MAX(CASE WHEN g.term = 'Midterm' THEN g.remarks ELSE NULL END) AS midtermRemarks,
            MAX(CASE WHEN g.term = 'Final' THEN g.grade ELSE NULL END) AS finalGrade,
            MAX(CASE WHEN g.term = 'Final' THEN g.remarks ELSE NULL END) AS finalRemarks
          FROM
            section_subject_assignments ssa
          JOIN
            sections sec ON ssa.section_id = sec.id
          JOIN
            subjects sub ON ssa.subject_id = sub.id
          JOIN
            students st ON st.section = sec.section_code -- Assuming students are linked by section code
                         -- Consider a more robust join if students can be in multiple sections
                         -- or if section assignment is stored differently.
          LEFT JOIN -- Use LEFT JOIN for grades as they might not exist yet
            grades g ON g.student_id = st.id AND g.subject_id = ssa.subject_id
                      -- Optionally link via assignment_id if available in grades: AND g.assignment_id = ssa.id
          WHERE
            ssa.teacher_id = :teacherId -- Filter by logged-in teacher
          GROUP BY -- Group by student and assignment to consolidate grades
            ssa.id, st.id, st.first_name, st.last_name, sub.id, sub.name, sec.section_code, sec.year_level
          ORDER BY
            sub.name ASC, sec.year_level ASC, sec.section_code ASC, st.last_name ASC, st.first_name ASC";


try {
    $stmt = $db->prepare($query);

    // Bind logged-in teacher ID
    $stmt->bindParam(':teacherId', $loggedInTeacherId, PDO::PARAM_INT);

    $stmt->execute();
    $num = $stmt->rowCount();

    $assignments_arr = array();

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row data
            extract($row);

             // Determine overall status based on grades
             $status = 'Not Submitted';
             if ($prelimGrade !== null || $midtermGrade !== null || $finalGrade !== null) {
                 $status = 'Incomplete';
             }
             // If final grade is present, consider it complete (pass/fail logic is UI side)
             if ($finalGrade !== null) {
                  $status = 'Complete';
             }


            $assignment_item = array(
                "assignmentId" => $assignmentId,
                "studentId" => (int)$studentId,
                "studentName" => $studentName,
                "subjectId" => $subjectId,
                "subjectName" => $subjectName,
                "section" => $section,
                "year" => $year,
                // Ensure grades are numbers or null
                "prelimGrade" => $prelimGrade === null ? null : (float)$prelimGrade,
                "prelimRemarks" => $prelimRemarks,
                "midtermGrade" => $midtermGrade === null ? null : (float)$midtermGrade,
                "midtermRemarks" => $midtermRemarks,
                "finalGrade" => $finalGrade === null ? null : (float)$finalGrade,
                "finalRemarks" => $finalRemarks,
                "status" => $status // Calculated status
            );
            array_push($assignments_arr, $assignment_item);
        }
    }

    // Set response code - 200 OK
    http_response_code(200);
    // Show assignments data in json format
    echo json_encode($assignments_arr); // Return array (empty if no results)

} catch (PDOException $exception) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching teacher assignments/grades: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch assignments and grades. " . $exception->getMessage()));
}
?>
