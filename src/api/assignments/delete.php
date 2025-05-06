<?php
// --- api/assignments/delete.php --- (DELETE /api/assignments/{assignmentId})

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

// Get Assignment ID from URL path
// Assumes URL like /api/assignments/CS1A-CS101
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$assignmentId = end($url_parts); // Get the last part as ID

// Validate ID
if (empty($assignmentId)) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to delete assignment. Missing or invalid Assignment ID in URL."));
    exit();
}

try {
    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

     // Optional: Check if assignment exists first
    $checkQuery = "SELECT id FROM section_subject_assignments WHERE id = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $assignmentId);
    $checkStmt->execute();
    if ($checkStmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(array("message" => "Assignment not found."));
        exit();
    }

    // Delete query
    $query = "DELETE FROM section_subject_assignments WHERE id = :id";

    // Prepare statement
    $stmt = $db->prepare($query);

    // Clean data
    $assignmentId = htmlspecialchars(strip_tags($assignmentId));

    // Bind data
    $stmt->bindParam(':id', $assignmentId);

    // Execute query
    if ($stmt->execute()) {
        // Check if any row was actually deleted (should be 1 if check passed)
        if ($stmt->rowCount() > 0) {
            // Set response code - 204 No Content (successful deletion)
            http_response_code(204);
        } else {
            // This implies the record disappeared between check and delete or DB issue
            error_log("Assignment {$assignmentId} found but delete affected 0 rows.");
            http_response_code(500);
            echo json_encode(array("message" => "Assignment found but could not be deleted."));
        }
    } else {
        // Database execution error
        http_response_code(503);
        error_log("Failed to delete assignment {$assignmentId}: " . implode(" | ", $stmt->errorInfo()));
        echo json_encode(array("message" => "Unable to delete assignment due to database error."));
    }
} catch (PDOException $e) {
     http_response_code(503);
     error_log("PDOException deleting assignment: " . $e->getMessage());
     echo json_encode(array("message" => "Database error occurred while deleting assignment: " . $e->getMessage()));
} catch (Exception $e) {
     error_log("Exception deleting assignment: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}
?>
