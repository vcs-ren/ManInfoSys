<?php
// --- api/sections/assignments/create.php --- (POST /api/sections/assignments) - Expects sectionId in payload

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
include_once '../../config/database.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate input data from payload
if (
    empty($data->sectionId) ||
    empty($data->subjectId) ||
    empty($data->teacherId) || !is_numeric($data->teacherId)
) {
     http_response_code(400);
     echo json_encode(array("message" => "Unable to create assignment. Missing required fields in payload (sectionId, subjectId, teacherId)."));
     exit();
}


try {
    $sectionId = htmlspecialchars(strip_tags($data->sectionId));
    $subjectId = htmlspecialchars(strip_tags($data->subjectId));
    $teacherId = (int)$data->teacherId;

    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

    // Generate a unique ID for the assignment (e.g., sectionId-subjectId)
    $assignmentId = $sectionId . '-' . $subjectId;

    // ** Check if necessary entities exist **
    // Check Section
    $checkSecQuery = "SELECT id FROM sections WHERE id = :sectionId";
    $checkSecStmt = $db->prepare($checkSecQuery);
    $checkSecStmt->bindParam(':sectionId', $sectionId);
    $checkSecStmt->execute();
    if ($checkSecStmt->rowCount() == 0) {
        http_response_code(400);
        echo json_encode(array("message" => "Section with ID {$sectionId} not found."));
        exit();
    }
    // Check Subject
    $checkSubQuery = "SELECT id FROM subjects WHERE id = :subjectId";
    $checkSubStmt = $db->prepare($checkSubQuery);
    $checkSubStmt->bindParam(':subjectId', $subjectId);
    $checkSubStmt->execute();
    if ($checkSubStmt->rowCount() == 0) {
        http_response_code(400);
        echo json_encode(array("message" => "Subject with ID {$subjectId} not found."));
        exit();
    }
    // Check Teacher
    $checkTchQuery = "SELECT id FROM teachers WHERE id = :teacherId";
    $checkTchStmt = $db->prepare($checkTchQuery);
    $checkTchStmt->bindParam(':teacherId', $teacherId);
    $checkTchStmt->execute();
     if ($checkTchStmt->rowCount() == 0) {
        http_response_code(400);
        echo json_encode(array("message" => "Teacher with ID {$teacherId} not found."));
        exit();
    }


    // Check if assignment already exists (using composite key logic)
    $checkQuery = "SELECT id FROM section_subject_assignments WHERE section_id = :sectionId AND subject_id = :subjectId";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':sectionId', $sectionId);
    $checkStmt->bindParam(':subjectId', $subjectId);
    $checkStmt->execute();

    if ($checkStmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(array("message" => "This subject ({$subjectId}) is already assigned to this section ({$sectionId})."));
        exit();
    }


    // Insert query
    $query = "INSERT INTO section_subject_assignments
                SET
                    id = :id,
                    section_id = :sectionId,
                    subject_id = :subjectId,
                    teacher_id = :teacherId";

    // Prepare statement
    $stmt = $db->prepare($query);

    // Bind data
    $stmt->bindParam(':id', $assignmentId);
    $stmt->bindParam(':sectionId', $sectionId);
    $stmt->bindParam(':subjectId', $subjectId);
    $stmt->bindParam(':teacherId', $teacherId);

    // Execute query
    if ($stmt->execute()) {
        // Fetch the newly created record with names for response
        $fetchQuery = "SELECT
                         ssa.id, ssa.section_id AS sectionId, ssa.subject_id AS subjectId,
                         sub.name AS subjectName, ssa.teacher_id AS teacherId,
                         CONCAT(t.first_name, ' ', t.last_name) AS teacherName
                       FROM section_subject_assignments ssa
                       JOIN subjects sub ON ssa.subject_id = sub.id
                       JOIN teachers t ON ssa.teacher_id = t.id
                       WHERE ssa.id = :id";
        $fetchStmt = $db->prepare($fetchQuery);
        $fetchStmt->bindParam(':id', $assignmentId);
        $fetchStmt->execute();
        $newAssignment = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        if ($newAssignment) {
            // Ensure teacherId is integer
            $newAssignment['teacherId'] = (int)$newAssignment['teacherId'];
            // Set response code - 201 Created
            http_response_code(201);
            // Send response with the created assignment data
            echo json_encode($newAssignment);
        } else {
             // Should not happen if insert succeeded, but handle defensively
             error_log("Assignment created (ID: {$assignmentId}) but could not fetch details.");
             http_response_code(500);
             echo json_encode(array("message" => "Assignment created but could not fetch details."));
        }
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);
        // Log error details
        error_log("Failed to create assignment: " . implode(" | ", $stmt->errorInfo()));
        echo json_encode(array("message" => "Unable to create assignment due to database error."));
    }
} catch (PDOException $e) {
     http_response_code(503);
     error_log("PDOException creating assignment: " . $e->getMessage());
     echo json_encode(array("message" => "Database error occurred: " . $e->getMessage()));
} catch (Exception $e) {
      error_log("Exception creating assignment: " . $e->getMessage());
      http_response_code(500);
      echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}

?>
