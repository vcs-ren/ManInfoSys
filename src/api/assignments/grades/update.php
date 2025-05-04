<?php
// --- api/assignments/grades/update.php --- (POST /api/assignments/{assignmentId}/grades)
// Using POST for simplicity, but PUT/PATCH might be more semantically correct for update

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT, PATCH");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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


// Get Assignment ID from URL path
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$assignments_index = array_search('assignments', $url_parts);
$assignmentId = null;
if ($assignments_index !== false && isset($url_parts[$assignments_index + 1]) && $url_parts[$assignments_index + 1] !== 'grades') {
    $assignmentId = $url_parts[$assignments_index + 1];
}

// Validate Assignment ID from URL
if (empty($assignmentId)) {
    http_response_code(400);
    echo json_encode(array("message" => "Missing Assignment ID in URL. Expected format: /api/assignments/{assignmentId}/grades"));
    exit();
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate Payload
if (
    !isset($data->assignmentId) || $data->assignmentId !== $assignmentId || // Ensure URL ID matches payload
    !isset($data->studentId) || !is_numeric($data->studentId) ||
    !isset($data->subjectId) ||
    // Grades can be null, so check existence but not emptiness if nullable
    !array_key_exists('prelimGrade', (array)$data) ||
    !array_key_exists('midtermGrade', (array)$data) ||
    !array_key_exists('finalGrade', (array)$data)
) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid payload. Required fields: assignmentId, studentId, subjectId, prelimGrade, midtermGrade, finalGrade. URL assignmentId must match payload."));
    exit();
}

// Sanitize and prepare data
$payloadAssignmentId = htmlspecialchars(strip_tags($data->assignmentId));
$studentId = (int)$data->studentId;
$subjectId = htmlspecialchars(strip_tags($data->subjectId));

// Function to sanitize grade input (allow null or numeric 0-100)
function sanitizeGrade($grade) {
    if ($grade === null || $grade === "") {
        return null;
    }
    $numGrade = filter_var($grade, FILTER_VALIDATE_FLOAT);
    if ($numGrade === false || $numGrade < 0 || $numGrade > 100) {
        // Invalid grade format or out of range, treat as null or throw error?
        // Let's treat as null for now to avoid blocking submission if one term is invalid.
        // Alternatively, throw new Exception("Invalid grade value: {$grade}. Must be numeric between 0 and 100.");
        return null;
    }
    return (float)$numGrade;
}

try {
    $prelimGrade = sanitizeGrade($data->prelimGrade ?? null);
    $prelimRemarks = isset($data->prelimRemarks) ? htmlspecialchars(strip_tags($data->prelimRemarks)) : null;
    $midtermGrade = sanitizeGrade($data->midtermGrade ?? null);
    $midtermRemarks = isset($data->midtermRemarks) ? htmlspecialchars(strip_tags($data->midtermRemarks)) : null;
    $finalGrade = sanitizeGrade($data->finalGrade ?? null);
    $finalRemarks = isset($data->finalRemarks) ? htmlspecialchars(strip_tags($data->finalRemarks)) : null;
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(array("message" => $e->getMessage()));
    exit();
}

// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// ** Authorization Check:** Verify the logged-in teacher is assigned to this subject/section
$authQuery = "SELECT COUNT(*) FROM section_subject_assignments
              WHERE id = :assignmentId AND teacher_id = :teacherId";
$authStmt = $db->prepare($authQuery);
$authStmt->bindParam(':assignmentId', $payloadAssignmentId);
$authStmt->bindParam(':teacherId', $loggedInTeacherId);
$authStmt->execute();
if ($authStmt->fetchColumn() == 0) {
     http_response_code(403); // Forbidden
     echo json_encode(array("message" => "You are not authorized to submit grades for this assignment."));
     exit();
}


// Upsert logic: Insert or update grades for each term
$terms = [
    'Prelim' => ['grade' => $prelimGrade, 'remarks' => $prelimRemarks],
    'Midterm' => ['grade' => $midtermGrade, 'remarks' => $midtermRemarks],
    'Final' => ['grade' => $finalGrade, 'remarks' => $finalRemarks],
];

$db->beginTransaction(); // Start transaction

try {
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
        $stmt->bindParam(':grade', $values['grade'], $values['grade'] === null ? PDO::PARAM_NULL : PDO::PARAM_STR); // Bind as string due to DECIMAL
        $stmt->bindParam(':remarks', $values['remarks'], $values['remarks'] === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':teacherId', $loggedInTeacherId, PDO::PARAM_INT);
        $stmt->bindParam(':assignmentId', $payloadAssignmentId, PDO::PARAM_STR); // Include assignment_id

        if (!$stmt->execute()) {
            // Rollback transaction on error
            $db->rollBack();
            http_response_code(503);
            error_log("Failed to upsert grade for term {$term}, student {$studentId}, subject {$subjectId}: " . implode(" | ", $stmt->errorInfo()));
            echo json_encode(array("message" => "Failed to submit grades for term: {$term}."));
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
                  GROUP BY ssa.id, st.id"; // Group by assignment and student
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
             http_response_code(500);
             echo json_encode(array("message" => "Grades submitted, but failed to fetch updated assignment details."));
      }

} catch (PDOException $e) {
    $db->rollBack(); // Rollback on any PDO exception during transaction
    http_response_code(503);
    error_log("PDOException submitting grades: " . $e->getMessage());
    echo json_encode(array("message" => "Database error occurred while submitting grades. " . $e->getMessage()));
}

?>
