<?php
// --- api/teacher/announcements/read.php --- (GET /api/teacher/announcements)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Includes
include_once '../../config/database.php';

// ** Authentication Check (Placeholder - Implement properly) **
// Get the logged-in teacher's ID, Department, and potentially Courses/Years/Sections they teach
$loggedInTeacherId = null;
$teacherDepartment = null;
// Fetching sections/courses/years taught might be complex, simplify for now
// Example session check:
// session_start();
// if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Teacher' && isset($_SESSION['user_id'])) {
//     $loggedInTeacherId = $_SESSION['user_id'];
//     // Fetch teacher's department from DB
//     // $teacherDetails = fetchTeacherDetails($loggedInTeacherId); // Implement this
//     // if ($teacherDetails) {
//     //     $teacherDepartment = $teacherDetails['department'];
//     // } else {
//     //      http_response_code(404); echo json_encode(array("message" => "Teacher details not found.")); exit();
//     // }
// } else {
//     http_response_code(401); // Unauthorized
//     echo json_encode(array("message" => "Authentication required. Teacher access only."));
//     exit();
// }
// ** END Placeholder Auth **

// ** Temporary Hardcoding for Testing (REMOVE IN PRODUCTION) **
$loggedInTeacherId = 1; // Example teacher ID
$teacherDepartment = 'Computer Science'; // Example Department - Fetch this dynamically
// ** REMOVE Hardcoding Above **

if (!$loggedInTeacherId) {
     http_response_code(401);
     echo json_encode(array("message" => "Missing teacher authentication details."));
     exit();
}

try {
    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

    // Query to fetch announcements relevant to the teacher
    // Logic: Show 'Admin' announcements targeted to 'all' OR announcements created by this teacher
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
              WHERE
                -- Show 'Admin' announcements targeted broadly (to everyone)
                (a.author_type = 'Admin' AND
                    (a.target_course IS NULL OR a.target_course = 'all') AND
                    (a.target_year_level IS NULL OR a.target_year_level = 'all') AND
                    (a.target_section IS NULL OR a.target_section = 'all')
                )
                -- OR show announcements authored by this specific teacher
                OR (a.author_type = 'Teacher' AND a.author_id = :teacherId)
              ORDER BY
                a.created_at DESC"; // Fetch newest first

    $stmt = $db->prepare($query);

    // Bind teacher ID for filtering own announcements
    $stmt->bindParam(':teacherId', $loggedInTeacherId, PDO::PARAM_INT);

    $stmt->execute();
    $num = $stmt->rowCount();

    $announcements_arr = array();

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            // Construct target object
             $target_obj = array(
                 "course" => ($target_course === NULL || $target_course === 'all') ? null : $target_course,
                 "yearLevel" => ($target_year_level === NULL || $target_year_level === 'all') ? null : $target_year_level,
                 "section" => ($target_section === NULL || $target_section === 'all') ? null : $target_section
            );

            $announcement_item = array(
                "id" => (string)$id, // Ensure ID is string
                "title" => $title,
                "content" => $content,
                "date" => $date,
                "target" => $target_obj,
                "author" => $author
            );
            array_push($announcements_arr, $announcement_item);
        }
    }

    // Set response code - 200 OK
    http_response_code(200);
    // Show announcements data in json format
    echo json_encode($announcements_arr); // Return array (empty if no results)

} catch (PDOException $exception) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching teacher announcements: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch announcements. Database error: " . $exception->getMessage()));
} catch (Exception $e) {
     error_log("General error fetching teacher announcements: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred while fetching announcements."));
}
?>
