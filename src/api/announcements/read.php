<?php
// --- api/announcements/read.php --- (GET /api/announcements)

// ** ALWAYS SEND CORS HEADERS FIRST **
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS"); // Allow GET and OPTIONS
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Respond to preflight requests (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Includes - Place includes after headers
include_once '../config/database.php';

// Instantiate DB
$database = new Database();
$db = $database->getConnection(); // Handles connection errors internally

// Base Query to fetch announcements and author name
$query = "SELECT
            a.id,
            a.title,
            a.content,
            a.created_at AS date,
            a.target_course,
            a.target_year_level,
            a.target_section,
            a.author_type,
            CASE
                WHEN a.author_type = 'Admin' THEN 'Admin'
                WHEN a.author_type = 'Teacher' THEN CONCAT(t.first_name, ' ', t.last_name)
                ELSE 'System'
            END AS author
          FROM
            announcements a
          LEFT JOIN
            teachers t ON a.author_id = t.id AND a.author_type = 'Teacher'
          ORDER BY
            a.created_at DESC"; // Fetch newest first

try {
    $stmt = $db->prepare($query);
    $stmt->execute();
    $num = $stmt->rowCount();

    // Check if any announcements found
    $announcements_arr = array();

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row automatically creates variables
            extract($row);

            // Construct the target object structure expected by the frontend
            $target_obj = array(
                 // Use null if value is NULL or 'all'
                 "course" => ($target_course === NULL || $target_course === 'all') ? null : $target_course,
                 "yearLevel" => ($target_year_level === NULL || $target_year_level === 'all') ? null : $target_year_level,
                 "section" => ($target_section === NULL || $target_section === 'all') ? null : $target_section
            );


            $announcement_item = array(
                "id" => (string)$id, // Ensure ID is string
                "title" => $title,
                "content" => $content,
                "date" => $date, // Already fetched as 'date'
                "target" => $target_obj,
                "author" => $author // Fetched via CASE statement
            );
            array_push($announcements_arr, $announcement_item);
        }
    }

    // Set response code - 200 OK (even if empty)
    http_response_code(200);
    // Show announcements data in json format
    echo json_encode($announcements_arr); // Return the array directly

} catch (PDOException $exception) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching announcements: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch announcements. Database error: " . $exception->getMessage()));
} catch (Exception $e) {
     error_log("General error fetching announcements: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred while fetching announcements."));
}
?>
