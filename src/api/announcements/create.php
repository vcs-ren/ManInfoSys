<?php
// --- api/announcements/create.php --- (POST /api/announcements)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Includes
include_once '../config/database.php';
// No specific model needed

// ** Authentication Check (Placeholder - Implement properly) **
// Determine author based on logged-in user (Admin or Teacher)
$authorId = null; // Assuming Admin if null
$authorType = 'Admin'; // Default to Admin
// Example session check:
// session_start();
// if (isset($_SESSION['user_role'])) {
//     if ($_SESSION['user_role'] === 'Admin') {
//         $authorType = 'Admin';
//         $authorId = null; // Or admin ID if applicable
//     } elseif ($_SESSION['user_role'] === 'Teacher' && isset($_SESSION['user_id'])) {
//         $authorType = 'Teacher';
//         $authorId = $_SESSION['user_id'];
//     } else {
//         // Unauthorized role
//         http_response_code(403); // Forbidden
//         echo json_encode(array("message" => "Unauthorized to create announcements."));
//         exit();
//     }
// } else {
//     http_response_code(401); // Unauthorized
//     echo json_encode(array("message" => "Authentication required."));
//     exit();
// }
// ** END Placeholder Auth **

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (
    !empty($data->title) &&
    !empty($data->content) &&
    isset($data->target) // Target object must exist
) {
    $title = htmlspecialchars(strip_tags($data->title));
    $content = htmlspecialchars(strip_tags($data->content));

    // Process target object - use null if 'all' or missing
    $targetCourse = (!empty($data->target->course) && $data->target->course !== 'all') ? htmlspecialchars(strip_tags($data->target->course)) : null;
    $targetYearLevel = (!empty($data->target->yearLevel) && $data->target->yearLevel !== 'all') ? htmlspecialchars(strip_tags($data->target->yearLevel)) : null;
    $targetSection = (!empty($data->target->section) && $data->target->section !== 'all') ? htmlspecialchars(strip_tags($data->target->section)) : null;


    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

    // Insert query
    $query = "INSERT INTO announcements
                SET
                    title = :title,
                    content = :content,
                    author_id = :authorId,
                    author_type = :authorType,
                    target_course = :targetCourse,
                    target_year_level = :targetYearLevel,
                    target_section = :targetSection";

    // Prepare statement
    $stmt = $db->prepare($query);

    // Bind data
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':content', $content);
    $stmt->bindParam(':authorId', $authorId, $authorId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
    $stmt->bindParam(':authorType', $authorType);
    $stmt->bindParam(':targetCourse', $targetCourse, $targetCourse === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindParam(':targetYearLevel', $targetYearLevel, $targetYearLevel === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindParam(':targetSection', $targetSection, $targetSection === null ? PDO::PARAM_NULL : PDO::PARAM_STR);


    // Execute query
    try {
        if ($stmt->execute()) {
            $lastInsertId = $db->lastInsertId();

            // Fetch the newly created announcement to return it
             $fetchQuery = "SELECT
                              a.id, a.title, a.content, a.created_at AS date,
                              a.target_course, a.target_year_level, a.target_section,
                              a.author_type,
                              CASE
                                  WHEN a.author_type = 'Admin' THEN 'Admin'
                                  WHEN a.author_type = 'Teacher' THEN CONCAT(t.first_name, ' ', t.last_name)
                                  ELSE 'System'
                              END AS author
                            FROM announcements a
                            LEFT JOIN teachers t ON a.author_id = t.id AND a.author_type = 'Teacher'
                            WHERE a.id = :id";
            $fetchStmt = $db->prepare($fetchQuery);
            $fetchStmt->bindParam(':id', $lastInsertId);
            $fetchStmt->execute();
            $newAnnouncement = $fetchStmt->fetch(PDO::FETCH_ASSOC);

             if ($newAnnouncement) {
                 // Construct target object for response
                 $newAnnouncement['target'] = [
                     "course" => ($newAnnouncement['target_course'] === NULL || $newAnnouncement['target_course'] === 'all') ? null : $newAnnouncement['target_course'],
                     "yearLevel" => ($newAnnouncement['target_year_level'] === NULL || $newAnnouncement['target_year_level'] === 'all') ? null : $newAnnouncement['target_year_level'],
                     "section" => ($newAnnouncement['target_section'] === NULL || $newAnnouncement['target_section'] === 'all') ? null : $newAnnouncement['target_section']
                 ];
                 // Remove redundant target fields
                 unset($newAnnouncement['target_course'], $newAnnouncement['target_year_level'], $newAnnouncement['target_section']);
                 // Ensure ID is string
                 $newAnnouncement['id'] = (string)$newAnnouncement['id'];

                 http_response_code(201); // Created
                 echo json_encode($newAnnouncement);
             } else {
                  http_response_code(500);
                  echo json_encode(array("message" => "Announcement created but failed to fetch details."));
             }

        } else {
            // Set response code - 503 Service Unavailable
            http_response_code(503);
            error_log("Failed to create announcement: " . implode(" | ", $stmt->errorInfo()));
            echo json_encode(array("message" => "Unable to create announcement."));
        }
    } catch (PDOException $e) {
         http_response_code(503);
         error_log("PDOException creating announcement: " . $e->getMessage());
         echo json_encode(array("message" => "Database error occurred. " . $e->getMessage()));
    }

} else {
    // Set response code - 400 Bad Request
    http_response_code(400);
    // Send error response for incomplete data
    echo json_encode(array("message" => "Unable to create announcement. Required fields: title, content, target object."));
}
?>
