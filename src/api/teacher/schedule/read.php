<?php
// --- api/teacher/schedule/read.php --- (GET /api/teacher/schedule)

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
// Get the logged-in teacher's ID
$loggedInTeacherId = null;
// Example session check:
// session_start();
// if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Teacher' && isset($_SESSION['user_id'])) {
//     $loggedInTeacherId = $_SESSION['user_id'];
// } else {
//     http_response_code(401); // Unauthorized
//     echo json_encode(array("message" => "Authentication required. Teacher access only."));
//     exit();
// }
// ** END Placeholder Auth **

// ** Temporary Hardcoding for Testing (REMOVE IN PRODUCTION) **
$loggedInTeacherId = 1; // Example: Assume teacher with ID 1 is logged in. REMOVE THIS.

if (!$loggedInTeacherId) {
     http_response_code(401);
     echo json_encode(array("message" => "Missing teacher authentication details."));
     exit();
}


try {
    // Instantiate DB
    $database = new Database();
    $db = $database->getConnection();

    // --- Query Logic ---
    // Fetch subjects/sections assigned to the teacher.
    // A real system would have a dedicated schedule table with days/times.

    // ** THIS IS A SIMPLIFIED QUERY - A REAL SCHEDULE REQUIRES MORE DETAIL (Days, Times) **
    $query = "SELECT
                ssa.id AS scheduleEntryId, -- Use assignment ID as a base for schedule entry ID
                CONCAT(sub.name, ' - ', sec.section_code) AS title, -- Combine Subject and Section for title
                sec.section_code AS sectionCode,
                sub.name AS subjectName
                -- Add dummy start/end times or fetch from a schedule table if exists
                -- Example dummy times (replace with actual schedule logic)
                -- CURDATE() AS startDate, -- Example: Assume all classes are today
                -- DATE_ADD(CURDATE(), INTERVAL 1 HOUR) AS endDate -- Example: 1 hour duration
              FROM
                section_subject_assignments ssa
              JOIN
                subjects sub ON ssa.subject_id = sub.id
              JOIN
                sections sec ON ssa.section_id = sec.id
              WHERE
                ssa.teacher_id = :teacherId -- Filter by the logged-in teacher
              ORDER BY
                sub.name ASC, sec.section_code ASC"; // Order as needed

    $stmt = $db->prepare($query);

    // Bind logged-in teacher ID
    $stmt->bindParam(':teacherId', $loggedInTeacherId, PDO::PARAM_INT);

    $stmt->execute();
    $num = $stmt->rowCount();

    $schedule_arr = array();

    // --- DUMMY SCHEDULE GENERATION (Replace with real data) ---
    $currentDate = date('Y-m-d');
    $startTimeHour = 8; // Start at 8 AM
    $dayOfWeek = date('N'); // 1 (Mon) to 7 (Sun)
    $processedCount = 0;

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            // Generate dummy start and end times for demonstration, distribute across week
            $dayOffset = ($processedCount % 5); // Simple distribution Mon-Fri (0-4)
            $classDate = date('Y-m-d', strtotime("{$currentDate} +" . ($dayOffset - $dayOfWeek + 1 + ($dayOffset < $dayOfWeek -1 ? 7 : 0)) . " days")); // Find next occurrence of that weekday

            $startDateTime = date('Y-m-d H:i:s', strtotime("{$classDate} {$startTimeHour}:00:00"));
            $endDateTime = date('Y-m-d H:i:s', strtotime("{$classDate} " . ($startTimeHour + 1) . ":00:00")); // 1 hour duration

            $schedule_item = array(
                "id" => $scheduleEntryId . '-' . date('Ymd', strtotime($classDate)), // Make ID unique per day for demo
                "title" => $title, // Already combined Subject - Section
                "start" => $startDateTime,
                "end" => $endDateTime,
                "type" => 'class', // Assume all are classes for now
                "location" => "Room " . (100 + ($processedCount % 10)), // Slightly less random room
                "section" => $sectionCode // Include section code
            );
            array_push($schedule_arr, $schedule_item);

            $startTimeHour++; // Increment hour for the next class on the *same* dummy day
            if ($startTimeHour > 16) $startTimeHour = 8; // Reset time if past 4 PM
             $processedCount++;
        }
    }
     // --- END DUMMY SCHEDULE GENERATION ---


    // Set response code - 200 OK
    http_response_code(200);
    // Show schedule data in json format
    echo json_encode($schedule_arr); // Return array (empty if no results)

} catch (PDOException $exception) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching teacher schedule: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch schedule. Database error: " . $exception->getMessage()));
} catch (Exception $e) {
     error_log("General error fetching teacher schedule: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred while fetching schedule."));
}
?>
