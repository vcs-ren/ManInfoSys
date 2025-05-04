<?php
// --- api/sections/assignments/create.php --- (POST /api/sections/{sectionId}/assignments)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Includes
include_once '../../config/database.php';

// Get Section ID from URL path
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$sections_index = array_search('sections', $url_parts);
$urlSectionId = null;
if ($sections_index !== false && isset($url_parts[$sections_index + 1])) {
    $urlSectionId = $url_parts[$sections_index + 1];
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate input data and URL section ID
if (
    !empty($urlSectionId) &&
    !empty($data->sectionId) &&
    $urlSectionId === $data->sectionId && // Ensure URL ID matches payload ID
    !empty($data->subjectId) &&
    !empty($data->teacherId) &&
    is_numeric($data->teacherId)
) {
    $sectionId = htmlspecialchars(strip_tags($data->sectionId));
    $subjectId = htmlspecialchars(strip_tags($data->subjectId));
    $teacherId = (int)$data->teacherId;

    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

    // Generate a unique ID for the assignment (e.g., sectionId-subjectId)
    $assignmentId = $sectionId . '-' . $subjectId;

    // Check if assignment already exists
    $checkQuery = "SELECT id FROM section_subject_assignments WHERE id = :assignmentId OR (section_id = :sectionId AND subject_id = :subjectId)";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':assignmentId', $assignmentId);
    $checkStmt->bindParam(':sectionId', $sectionId);
    $checkStmt->bindParam(':subjectId', $subjectId);
    $checkStmt->execute();

    if ($checkStmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(array("message" => "This subject is already assigned to this section."));
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
    try {
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
                 http_response_code(500);
                 echo json_encode(array("message" => "Assignment created but could not fetch details."));
            }
        } else {
            // Set response code - 503 Service Unavailable
            http_response_code(503);
            // Log error details
            error_log("Failed to create assignment: " . implode(" | ", $stmt->errorInfo()));
            echo json_encode(array("message" => "Unable to create assignment."));
        }
    } catch (PDOException $e) {
         http_response_code(503);
         error_log("PDOException creating assignment: " . $e->getMessage());
         echo json_encode(array("message" => "Database error occurred. " . $e->getMessage()));
    }

} else {
    // Set response code - 400 Bad Request
    http_response_code(400);
    // Send error response for incomplete data or mismatch
    $errorMessage = "Unable to create assignment. Data is incomplete or Section ID in URL does not match payload.";
    if(empty($urlSectionId)) $errorMessage = "Missing Section ID in URL.";
    if(empty($data->sectionId) || empty($data->subjectId) || empty($data->teacherId)) $errorMessage = "Missing required fields in payload (sectionId, subjectId, teacherId).";
    if(!empty($urlSectionId) && !empty($data->sectionId) && $urlSectionId !== $data->sectionId) $errorMessage = "Section ID in URL ({$urlSectionId}) does not match Section ID in payload ({$data->sectionId}).";

    echo json_encode(array("message" => $errorMessage));
}
?>
