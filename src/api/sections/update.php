<?php
// --- api/sections/update.php --- (PUT /api/sections/{sectionId})

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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate input data: programId and yearLevel are required for update
if (
    empty($data->programId) ||
    empty($data->yearLevel)
    // sectionCode (ID) is not updatable here. Adviser ID is handled by a separate endpoint.
) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to update section. Required fields: programId, yearLevel."));
    exit();
}

try {
    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

    // Sanitize inputs
    $sectionId = htmlspecialchars(strip_tags($sectionId));
    $programId = htmlspecialchars(strip_tags($data->programId));
    $yearLevel = htmlspecialchars(strip_tags($data->yearLevel));

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

    // Check if programId exists
    $progCheckQuery = "SELECT id FROM programs WHERE id = :programId";
    $progCheckStmt = $db->prepare($progCheckQuery);
    $progCheckStmt->bindParam(':programId', $programId);
    $progCheckStmt->execute();
    if ($progCheckStmt->rowCount() == 0) {
        http_response_code(400);
        echo json_encode(array("message" => "Program with ID {$programId} not found."));
        exit();
    }

    // Update query
    $query = "UPDATE sections
                SET
                    program_id = :programId,
                    year_level = :yearLevel
                WHERE
                    id = :id";

    // Prepare statement
    $stmt = $db->prepare($query);

    // Bind data
    $stmt->bindParam(':programId', $programId);
    $stmt->bindParam(':yearLevel', $yearLevel);
    $stmt->bindParam(':id', $sectionId);

    // Execute query
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            // Fetch the updated section details to return
            $fetchQuery = "SELECT
                             s.id, s.section_code AS sectionCode, s.program_id as programId, s.year_level AS yearLevel,
                             s.adviser_id AS adviserId,
                             CONCAT(t.first_name, ' ', t.last_name) AS adviserName
                           FROM sections s
                           LEFT JOIN teachers t ON s.adviser_id = t.id
                           WHERE s.id = :id";
            $fetchStmt = $db->prepare($fetchQuery);
            $fetchStmt->bindParam(':id', $sectionId);
            $fetchStmt->execute();
            $updatedSection = $fetchStmt->fetch(PDO::FETCH_ASSOC);

            if ($updatedSection) {
                $updatedSection['adviserId'] = $updatedSection['adviserId'] ? (int)$updatedSection['adviserId'] : null;
                http_response_code(200); // OK
                echo json_encode($updatedSection);
            } else {
                error_log("Section {$sectionId} updated but failed to fetch details.");
                http_response_code(500);
                echo json_encode(array("message" => "Section updated but could not fetch details."));
            }
        } else {
            // No rows affected, possibly data was the same or section not found (though checked)
            http_response_code(200); // OK, but no change
            echo json_encode(array("message" => "No changes made to the section. Data might be the same."));
        }
    } else {
        http_response_code(503);
        error_log("Failed to update section {$sectionId}: " . implode(" | ", $stmt->errorInfo()));
        echo json_encode(array("message" => "Unable to update section due to database error."));
    }
} catch (PDOException $e) {
    http_response_code(503);
    error_log("PDOException updating section: " . $e->getMessage());
    echo json_encode(array("message" => "Database error occurred: " . $e->getMessage()));
} catch (Exception $e) {
    error_log("Exception updating section: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}
?>