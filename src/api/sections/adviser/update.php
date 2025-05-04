<?php
// --- api/sections/adviser/update.php --- (POST /api/sections/{sectionId}/adviser)
// Using POST instead of PATCH for broader compatibility, but PATCH is semantically better.

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PATCH"); // Allow POST/PATCH
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Includes
include_once '../../config/database.php';

// Get Section ID from URL path
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$sections_index = array_search('sections', $url_parts);
$sectionId = null;
if ($sections_index !== false && isset($url_parts[$sections_index + 1])) {
    $sectionId = $url_parts[$sections_index + 1];
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate Section ID from URL
if (empty($sectionId)) {
    http_response_code(400);
    echo json_encode(array("message" => "Missing Section ID in URL. Expected format: /api/sections/{sectionId}/adviser"));
    exit();
}

// Validate payload: adviserId should exist and be a number or null
if (!isset($data->adviserId) || (!is_null($data->adviserId) && !is_numeric($data->adviserId))) {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid payload. 'adviserId' (number or null) is required."));
    exit();
}

$adviserId = is_null($data->adviserId) ? null : (int)$data->adviserId; // Cast to int or null

// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// Check if the section exists
$checkSectionQuery = "SELECT id FROM sections WHERE id = :sectionId";
$checkSectionStmt = $db->prepare($checkSectionQuery);
$checkSectionStmt->bindParam(':sectionId', $sectionId);
$checkSectionStmt->execute();
if ($checkSectionStmt->rowCount() == 0) {
    http_response_code(404);
    echo json_encode(array("message" => "Section not found."));
    exit();
}

// If assigning an adviser (not null), check if the teacher exists and is not already assigned elsewhere
if ($adviserId !== null && $adviserId !== 0) { // Allow 0 or null for unassigning
    $checkTeacherQuery = "SELECT id FROM teachers WHERE id = :teacherId";
    $checkTeacherStmt = $db->prepare($checkTeacherQuery);
    $checkTeacherStmt->bindParam(':teacherId', $adviserId);
    $checkTeacherStmt->execute();
    if ($checkTeacherStmt->rowCount() == 0) {
        http_response_code(400); // Bad Request or 404 Not Found
        echo json_encode(array("message" => "Teacher with ID {$adviserId} not found."));
        exit();
    }

    // Check if teacher is already advising another section (optional, depends on rules)
    $checkAdviserQuery = "SELECT id FROM sections WHERE adviser_id = :teacherId AND id != :sectionId";
    $checkAdviserStmt = $db->prepare($checkAdviserQuery);
    $checkAdviserStmt->bindParam(':teacherId', $adviserId);
    $checkAdviserStmt->bindParam(':sectionId', $sectionId); // Exclude the current section
    $checkAdviserStmt->execute();
    if ($checkAdviserStmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(array("message" => "This teacher is already assigned as an adviser to another section."));
        exit();
    }
}


// Update query
$query = "UPDATE sections SET adviser_id = :adviserId WHERE id = :sectionId";

// Prepare statement
$stmt = $db->prepare($query);

// Clean data
$sectionId = htmlspecialchars(strip_tags($sectionId));
// adviserId is already validated and cast

// Bind data
$stmt->bindParam(':adviserId', $adviserId, $adviserId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
$stmt->bindParam(':sectionId', $sectionId);

// Execute query
try {
    if ($stmt->execute()) {
        // Fetch the updated section details including the new adviser name
        $fetchQuery = "SELECT
                         s.id, s.section_code AS sectionCode, s.course, s.year_level AS yearLevel,
                         s.adviser_id AS adviserId,
                         CONCAT(t.first_name, ' ', t.last_name) AS adviserName
                       FROM sections s
                       LEFT JOIN teachers t ON s.adviser_id = t.id
                       WHERE s.id = :sectionId";
        $fetchStmt = $db->prepare($fetchQuery);
        $fetchStmt->bindParam(':sectionId', $sectionId);
        $fetchStmt->execute();
        $updatedSection = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        if ($updatedSection) {
             // Ensure adviserId is integer or null
             $updatedSection['adviserId'] = $updatedSection['adviserId'] ? (int)$updatedSection['adviserId'] : null;
             http_response_code(200);
             echo json_encode($updatedSection);
        } else {
             // Should not happen if update succeeded, but handle defensively
             http_response_code(500);
             echo json_encode(array("message" => "Adviser updated but could not fetch section details."));
        }

    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);
        error_log("Failed to update adviser for section {$sectionId}: " . implode(" | ", $stmt->errorInfo()));
        echo json_encode(array("message" => "Unable to update adviser assignment."));
    }
} catch (PDOException $e) {
     http_response_code(503);
     error_log("PDOException updating adviser: " . $e->getMessage());
     echo json_encode(array("message" => "Database error occurred while updating adviser. " . $e->getMessage()));
}
?>
