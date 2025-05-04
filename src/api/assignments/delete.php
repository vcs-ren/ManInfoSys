<?php
// --- api/assignments/delete.php --- (DELETE /api/assignments/{assignmentId})

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// Delete query
$query = "DELETE FROM section_subject_assignments WHERE id = :id";

// Prepare statement
$stmt = $db->prepare($query);

// Clean data
$assignmentId = htmlspecialchars(strip_tags($assignmentId));

// Bind data
$stmt->bindParam(':id', $assignmentId);

// Execute query
try {
    if ($stmt->execute()) {
        // Check if any row was actually deleted
        if ($stmt->rowCount() > 0) {
            // Set response code - 204 No Content (successful deletion)
            http_response_code(204);
        } else {
            // Set response code - 404 Not Found
            http_response_code(404);
            echo json_encode(array("message" => "Assignment not found."));
        }
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);
        error_log("Failed to delete assignment: " . implode(" | ", $stmt->errorInfo()));
        echo json_encode(array("message" => "Unable to delete assignment."));
    }
} catch (PDOException $e) {
     http_response_code(503);
     error_log("PDOException deleting assignment: " . $e->getMessage());
     echo json_encode(array("message" => "Database error occurred while deleting assignment. " . $e->getMessage()));
}
?>
