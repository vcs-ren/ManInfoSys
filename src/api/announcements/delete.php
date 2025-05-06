<?php
// --- api/announcements/delete.php --- (DELETE /api/announcements/{announcementId})

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

try {
    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

    // Optional: Check if announcement exists first
    $checkQuery = "SELECT id FROM announcements WHERE id = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $announcementId, PDO::PARAM_INT);
    $checkStmt->execute();
    if ($checkStmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(array("message" => "Announcement not found."));
        exit();
    }

    // Delete query
    $query = "DELETE FROM announcements WHERE id = :id";

    // Prepare statement
    $stmt = $db->prepare($query);

    // Clean data (though ID is numeric)
    $announcementId = htmlspecialchars(strip_tags($announcementId));

    // Bind data
    $stmt->bindParam(':id', $announcementId, PDO::PARAM_INT); // Bind as integer

    // Execute query
    if ($stmt->execute()) {
        // Check if any row was actually deleted (should be 1 if exists check passed)
        if ($stmt->rowCount() > 0) {
            // Set response code - 204 No Content (successful deletion)
            http_response_code(204);
        } else {
            // This case implies the record disappeared between check and delete, or DB issue
            error_log("Announcement ID {$announcementId} found but delete affected 0 rows.");
            http_response_code(500); // Internal Server Error
            echo json_encode(array("message" => "Announcement found but could not be deleted."));
        }
    } else {
        // Database execution error
        http_response_code(503);
        error_log("Failed to delete announcement ID {$announcementId}: " . implode(" | ", $stmt->errorInfo()));
        echo json_encode(array("message" => "Unable to delete announcement due to database error."));
    }
} catch (PDOException $e) {
     http_response_code(503);
     error_log("PDOException deleting announcement: " . $e->getMessage());
     echo json_encode(array("message" => "Database error occurred while deleting announcement: " . $e->getMessage()));
} catch (Exception $e) {
     error_log("Exception deleting announcement: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred: " . $e->getMessage()));
}
?>
