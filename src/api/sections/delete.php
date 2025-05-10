<?php
// --- api/sections/delete.php --- (DELETE /api/sections/{sectionId})

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Includes
include_once '../config/database.php';

// Get Section ID from URL path
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$sectionId = end($url_parts);

// Validate Section ID
if (empty($sectionId)) {
    http_response_code(400);
    echo json_encode(array("message" => "Missing or invalid Section ID in URL. Expected format: /api/sections/{sectionId}"));
    exit();
}

try {
    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

    $sectionId = htmlspecialchars(strip_tags($sectionId));

    // Check if the section exists
    $checkSectionQuery = "SELECT id FROM sections WHERE id = :id";
    $checkSectionStmt = $db->prepare($checkSectionQuery);
    $checkSectionStmt->bindParam(':id', $sectionId);
    $checkSectionStmt->execute();
    if ($checkSectionStmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(array("message" => "Section with ID {$sectionId} not found."));
        exit();
    }

    // Before deleting the section, consider dependencies:
    // 1. Unassign students from this section or reassign them. (For now, we might just disassociate)
    //    UPDATE students SET section = NULL WHERE section = :sectionId; (Example)
    // 2. Delete related section_subject_assignments.
    //    DELETE FROM section_subject_assignments WHERE section_id = :sectionId; (Example)

    $db->beginTransaction();

    // Example: Disassociate students (set their section to NULL)
    $updateStudentsQuery = "UPDATE students SET section = NULL WHERE section = :sectionId";
    $updateStudentsStmt = $db->prepare($updateStudentsQuery);
    $updateStudentsStmt->bindParam(':sectionId', $sectionId);
    $updateStudentsStmt->execute(); // No need to check rowCount here, it's okay if no students were in section

    // Example: Delete related subject assignments
    $deleteAssignmentsQuery = "DELETE FROM section_subject_assignments WHERE section_id = :sectionId";
    $deleteAssignmentsStmt = $db->prepare($deleteAssignmentsQuery);
    $deleteAssignmentsStmt->bindParam(':sectionId', $sectionId);
    $deleteAssignmentsStmt->execute(); // No need to check rowCount here

    // Delete the section itself
    $deleteQuery = "DELETE FROM sections WHERE id = :id";
    $stmt = $db->prepare($deleteQuery);
    $stmt->bindParam(':id', $sectionId);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            $db->commit();
            http_response_code(204); // No Content
        } else {
            $db->rollBack();
            // This case implies the record disappeared between check and delete, or DB issue
            error_log("Section ID {$sectionId} found but delete affected 0 rows.");
            http_response_code(500); // Internal Server Error
            echo json_encode(array("message" => "Section found but could not be deleted."));
        }
    } else {
        $db->rollBack();
        http_response_code(503);
        error_log("Failed to delete section {$sectionId}: " . implode(" | ", $stmt->errorInfo()));
        echo json_encode(array("message" => "Unable to delete section due to database error."));
    }
} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(503);
    error_log("PDOException deleting section: " . $e->getMessage());
    echo json_encode(array("message" => "Database error occurred: " . $e->getMessage()));
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Exception deleting section: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}
?>