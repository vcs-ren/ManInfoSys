<?php
// --- api/student/announcements/read.php --- (GET /api/student/announcements)

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
// Get the logged-in student's ID, Course, Year Level, and Section
$loggedInStudentId = null;
$studentCourse = null;
$studentYearLevel = null;
$studentSection = null; // Use Section ID (e.g., 'CS-1-A') for filtering

// Example session check:
// session_start();
// if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Student' && isset($_SESSION['user_id'])) {
//     $loggedInStudentId = $_SESSION['user_id'];
//     // You NEED to fetch the student's course, year, section ID from the DB based on ID
//     // $studentDetails = fetchStudentDetails($loggedInStudentId); // Implement this function
//     // if ($studentDetails) {
//     //     $studentCourse = $studentDetails['course'];
//     //     $studentYearLevel = $studentDetails['year'];
//     //     $studentSection = $studentDetails['section']; // Assuming 'section' holds the ID like 'CS-1-A'
//     // } else {
//     //      // Handle student not found error
//     //      http_response_code(404); echo json_encode(array("message" => "Student details not found.")); exit();
//     // }
// } else {
//     http_response_code(401); // Unauthorized
//     echo json_encode(array("message" => "Authentication required. Student access only."));
//     exit();
// }
// ** END Placeholder Auth **

// ** Temporary Hardcoding for Testing (REMOVE IN PRODUCTION) **
$loggedInStudentId = 1; // Example student ID
$studentCourse = 'Computer Science'; // Example
$studentYearLevel = '1st Year'; // Example
$studentSection = 'CS-1-A'; // Example Section ID (use the actual section ID from DB)
// ** REMOVE Hardcoding Above **

if (!$loggedInStudentId || !$studentCourse || !$studentYearLevel || !$studentSection) {
     http_response_code(401); // Or 400 Bad Request if info is missing
     echo json_encode(array("message" => "Missing student authentication details (ID, Course, Year, Section)."));
     exit();
}


try {
    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

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
              WHERE
                -- Targeting Logic: Matches if target is NULL/all OR matches the specific student detail
                (a.target_course IS NULL OR a.target_course = 'all' OR a.target_course = :studentCourse)
                AND
                (a.target_year_level IS NULL OR a.target_year_level = 'all' OR a.target_year_level = :studentYearLevel)
                AND
                (a.target_section IS NULL OR a.target_section = 'all' OR a.target_section = :studentSection) -- Match section ID
              ORDER BY
                a.created_at DESC"; // Fetch newest first

    $stmt = $db->prepare($query);

    // Bind student details for filtering
    $stmt->bindParam(':studentCourse', $studentCourse);
    $stmt->bindParam(':studentYearLevel', $studentYearLevel);
    $stmt->bindParam(':studentSection', $studentSection); // Bind the section ID


    $stmt->execute();
    $num = $stmt->rowCount();

    $announcements_arr = array();

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            // Construct the target object (though less relevant for student view)
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
                "target" => $target_obj, // Include target for consistency if needed
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
    error_log("Error fetching student announcements: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch announcements. Database error: " . $exception->getMessage()));
} catch (Exception $e) {
     error_log("General error fetching student announcements: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred while fetching announcements."));
}
?>
