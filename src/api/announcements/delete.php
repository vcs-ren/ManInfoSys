<?php
// --- api/announcements/delete.php --- (DELETE /api/announcements/{announcementId})

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Includes
include_once '../config/database.php';

// ** Authentication Check (Placeholder - Implement properly) **
// Ensure only authenticated admins (or potentially the author teacher) can delete
// if (!isAdminAuthenticated()) { // Or check if user is admin or author
//     http_response_code(403); // Forbidden
//     echo json_encode(array("message" => "Unauthorized to delete announcements."));
//     exit();
// }
// ** END Placeholder Auth **


// Get Announcement ID from URL path
// Assumes URL like /api/announcements/123
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$announcementId = end($url_parts); // Get the last part as ID

// Validate ID
if (empty($announcementId) || !is_numeric($announcementId)) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to delete announcement. Missing or invalid Announcement ID in URL."));
    exit();
}

// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// Delete query
$query = "DELETE FROM announcements WHERE id = :id";

// Prepare statement
$stmt = $db->prepare($query);

// Clean data
$announcementId = htmlspecialchars(strip_tags($announcementId));

// Bind data
$stmt->bindParam(':id', $announcementId, PDO::PARAM_INT); // Bind as integer

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
            echo json_encode(array("message" => "Announcement not found."));
        }
    } else {
        // Set response code - 503 Service Unavailable
        http_response_code(503);
        error_log("Failed to delete announcement ID {$announcementId}: " . implode(" | ", $stmt->errorInfo()));
        echo json_encode(array("message" => "Unable to delete announcement."));
    }
} catch (PDOException $e) {
     http_response_code(503);
     error_log("PDOException deleting announcement: " . $e->getMessage());
     echo json_encode(array("message" => "Database error occurred while deleting announcement. " . $e->getMessage()));
}
?>
