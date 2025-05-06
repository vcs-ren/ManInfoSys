<?php
// --- api/assignments/grades/update.php --- (POST /api/assignments/grades) - Expects payload with assignmentId, studentId etc.
// Using POST for simplicity, but PUT/PATCH might be more semantically correct for update

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT, PATCH, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// Includes
include_once '../../config/database.php';

// ** Authentication Check (Placeholder - Implement properly) **
// Get the logged-in teacher's ID and ensure they are authorized to submit grades for this assignment
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

// Validate Payload
if (
    empty($data->assignmentId) ||
    empty($data->studentId) || !is_numeric($data->studentId) ||
    empty($data->subjectId) ||
    // Grades can be null, so check existence but not emptiness if nullable
    !property_exists($data, 'prelimGrade') ||
    !property_exists($data, 'midtermGrade') ||
    !property_exists($data, 'finalGrade')
) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid payload. Required fields: assignmentId, studentId, subjectId, prelimGrade, midtermGrade, finalGrade."));
    exit();
}

// Sanitize and prepare data
$payloadAssignmentId = htmlspecialchars(strip_tags($data->assignmentId));
$studentId = (int)$data->studentId;
$subjectId = htmlspecialchars(strip_tags($data->subjectId));

// Function to sanitize grade input (allow null or numeric 0-100)
function sanitizeGrade($grade, $termName) {
    if ($grade === null || $grade === "") {
        return null;
    }
    // Check if it's numeric and within range
    if (!is_numeric($grade) || $grade < 0 || $grade > 100) {
        throw new Exception("Invalid grade value for {$termName}: '{$grade}'. Must be numeric between 0 and 100, or empty/null.");
    }
    // Return as float for consistency, database handles DECIMAL
    return (float)$grade;
}

try {
    $prelimGrade = sanitizeGrade($data->prelimGrade, 'Prelim');
    $prelimRemarks = isset($data->prelimRemarks) ? htmlspecialchars(strip_tags($data->prelimRemarks)) : null;
    $midtermGrade = sanitizeGrade($data->midtermGrade, 'Midterm');
    $midtermRemarks = isset($data->midtermRemarks) ? htmlspecialchars(strip_tags($data->midtermRemarks)) : null;
    $finalGrade = sanitizeGrade($data->finalGrade, 'Final');
    $finalRemarks = isset($data->finalRemarks) ? htmlspecialchars(strip_tags($data->finalRemarks)) : null;
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(array("message" => $e->getMessage()));
    exit();
}


try {
    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

    // ** Authorization Check:** Verify the logged-in teacher is assigned to this subject/section
    // Check using the assignment ID which links section, subject, and teacher
    $authQuery = "SELECT COUNT(*) FROM section_subject_assignments
                  WHERE id = :assignmentId AND teacher_id = :teacherId";
    $authStmt = $db->prepare($authQuery);
    $authStmt->bindParam(':assignmentId', $payloadAssignmentId);
    $authStmt->bindParam(':teacherId', $loggedInTeacherId);
    $authStmt->execute();
    if ($authStmt->fetchColumn() == 0) {
         http_response_code(403); // Forbidden
         echo json_encode(array("message" => "You are not authorized to submit grades for this assignment ({$payloadAssignmentId})."));
         exit();
    }

    // ** Check if student belongs to the section of the assignment **
    // This prevents submitting grades for students not in the assigned section
    $studentCheckQuery = "SELECT COUNT(*) FROM students s
                          JOIN section_subject_assignments ssa ON s.section = ssa.section_id -- Join based on section ID/code
                          WHERE s.id = :studentId AND ssa.id = :assignmentId";
    $studentCheckStmt = $db->prepare($studentCheckQuery);
    $studentCheckStmt->bindParam(':studentId', $studentId);
    $studentCheckStmt->bindParam(':assignmentId', $payloadAssignmentId);
    $studentCheckStmt->execute();
    if ($studentCheckStmt->fetchColumn() == 0) {
         http_response_code(400); // Bad Request
         echo json_encode(array("message" => "Student ID {$studentId} does not belong to the section associated with assignment ID {$payloadAssignmentId}."));
         exit();
    }


    // Upsert logic: Insert or update grades for each term within a transaction
    $terms = [
        'Prelim' => ['grade' => $prelimGrade, 'remarks' => $prelimRemarks],
        'Midterm' => ['grade' => $midtermGrade, 'remarks' => $midtermRemarks],
        'Final' => ['grade' => $finalGrade, 'remarks' => $finalRemarks],
    ];

    $db->beginTransaction(); // Start transaction

    foreach ($terms as $term => $values) {
        $upsertQuery = "INSERT INTO grades (student_id, subject_id, term, grade, remarks, submitted_by_teacher_id, assignment_id)
                        VALUES (:studentId, :subjectId, :term, :grade, :remarks, :teacherId, :assignmentId)
                        ON DUPLICATE KEY UPDATE
                           grade = VALUES(grade),
                           remarks = VALUES(remarks),
                           submitted_by_teacher_id = VALUES(submitted_by_teacher_id),
                           updated_at = CURRENT_TIMESTAMP";

        $stmt = $db->prepare($upsertQuery);

        $stmt->bindParam(':studentId', $studentId, PDO::PARAM_INT);
        $stmt->bindParam(':subjectId', $subjectId, PDO::PARAM_STR);
        $stmt->bindParam(':term', $term, PDO::PARAM_STR);
        // Bind grade as string for DECIMAL type, handle NULL explicitly
        $stmt->bindValue(':grade', $values['grade'], ($values['grade'] === null) ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':remarks', $values['remarks'], $values['remarks'] === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':teacherId', $loggedInTeacherId, PDO::PARAM_INT);
        $stmt->bindParam(':assignmentId', $payloadAssignmentId, PDO::PARAM_STR); // Include assignment_id

        if (!$stmt->execute()) {
            // Rollback transaction on error
            $db->rollBack();
            http_response_code(503);
            error_log("Failed to upsert grade for term {$term}, student {$studentId}, subject {$subjectId}, assignment {$payloadAssignmentId}: " . implode(" | ", $stmt->errorInfo()));
            echo json_encode(array("message" => "Failed to submit grades for term: {$term}. Database error."));
            exit();
        }
    }

    // Commit transaction if all terms were successful
    $db->commit();

    // Fetch the updated full assignment record to return
    // (Similar query as in assignments/grades/read.php, but filtered for this specific assignment/student)
      $fetchQuery = "SELECT
                    ssa.id AS assignmentId, st.id AS studentId, CONCAT(st.first_name, ' ', st.last_name) AS studentName,
                    sub.id AS subjectId, sub.name AS subjectName, sec.section_code AS section, sec.year_level AS year,
                    MAX(CASE WHEN g.term = 'Prelim' THEN g.grade ELSE NULL END) AS prelimGrade,
                    MAX(CASE WHEN g.term = 'Prelim' THEN g.remarks ELSE NULL END) AS prelimRemarks,
                    MAX(CASE WHEN g.term = 'Midterm' THEN g.grade ELSE NULL END) AS midtermGrade,
                    MAX(CASE WHEN g.term = 'Midterm' THEN g.remarks ELSE NULL END) AS midtermRemarks,
                    MAX(CASE WHEN g.term = 'Final' THEN g.grade ELSE NULL END) AS finalGrade,
                    MAX(CASE WHEN g.term = 'Final' THEN g.remarks ELSE NULL END) AS finalRemarks
                  FROM section_subject_assignments ssa
                  JOIN sections sec ON ssa.section_id = sec.id
                  JOIN subjects sub ON ssa.subject_id = sub.id
                  JOIN students st ON st.id = :studentId -- Join directly with student ID
                  LEFT JOIN grades g ON g.student_id = st.id AND g.subject_id = ssa.subject_id
                  WHERE ssa.id = :assignmentId
                  GROUP BY ssa.id, st.id, st.first_name, st.last_name, sub.id, sub.name, sec.section_code, sec.year_level"; // Group by assignment and student details
      $fetchStmt = $db->prepare($fetchQuery);
      $fetchStmt->bindParam(':studentId', $studentId);
      $fetchStmt->bindParam(':assignmentId', $payloadAssignmentId);
      $fetchStmt->execute();
      $updatedAssignment = $fetchStmt->fetch(PDO::FETCH_ASSOC);

       if ($updatedAssignment) {
            // Calculate status
            $status = 'Not Submitted';
            if ($updatedAssignment['prelimGrade'] !== null || $updatedAssignment['midtermGrade'] !== null || $updatedAssignment['finalGrade'] !== null) {
                $status = 'Incomplete';
            }
            if ($updatedAssignment['finalGrade'] !== null) {
                 $status = 'Complete';
            }
             $updatedAssignment['status'] = $status;

            // Ensure types
            $updatedAssignment['studentId'] = (int)$updatedAssignment['studentId'];
            $updatedAssignment['prelimGrade'] = $updatedAssignment['prelimGrade'] === null ? null : (float)$updatedAssignment['prelimGrade'];
            $updatedAssignment['midtermGrade'] = $updatedAssignment['midtermGrade'] === null ? null : (float)$updatedAssignment['midtermGrade'];
            $updatedAssignment['finalGrade'] = $updatedAssignment['finalGrade'] === null ? null : (float)$updatedAssignment['finalGrade'];

            http_response_code(200); // OK
            echo json_encode($updatedAssignment);
      } else {
             error_log("Grades submitted successfully for assignment {$payloadAssignmentId}, student {$studentId}, but failed to fetch updated details.");
             http_response_code(500);
             echo json_encode(array("message" => "Grades submitted, but failed to fetch updated assignment details."));
      }

} catch (PDOException $e) {
    // Check if transaction was started before trying to rollback
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(503);
    error_log("PDOException submitting grades: " . $e->getMessage());
    echo json_encode(array("message" => "Database error occurred while submitting grades: " . $e->getMessage()));
} catch (Exception $e) {
     if ($db->inTransaction()) {
        $db->rollBack();
     }
     error_log("Exception submitting grades: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}

?>
