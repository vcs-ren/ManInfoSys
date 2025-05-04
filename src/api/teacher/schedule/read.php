<?php
// --- api/teacher/schedule/read.php --- (GET /api/teacher/schedule)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

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


// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// --- Query Logic ---
// Fetch subjects/sections assigned to the teacher.
// We need to simulate schedule entries based on this.
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

try {
    $stmt = $db->prepare($query);

    // Bind logged-in teacher ID
    $stmt->bindParam(':teacherId', $loggedInTeacherId);

    $stmt->execute();
    $num = $stmt->rowCount();

    $schedule_arr = array();

    // --- DUMMY SCHEDULE GENERATION (Replace with real data) ---
    $currentDate = date('Y-m-d');
    $startTimeHour = 8; // Start at 8 AM
    $dayOfWeek = date('N'); // 1 (for Monday) through 7 (for Sunday)

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            // Generate dummy start and end times for demonstration
            // Let's try to distribute classes across the week based on assignment ID hash
            $dayOffset = crc32($scheduleEntryId) % 5; // Simple way to get 0-4 offset (Mon-Fri)
            $classDate = date('Y-m-d', strtotime("{$currentDate} +" . ($dayOffset - $dayOfWeek + 1) . " days")); // Find next occurrence of that weekday

            $startDateTime = date('Y-m-d H:i:s', strtotime("{$classDate} {$startTimeHour}:00:00"));
            $endDateTime = date('Y-m-d H:i:s', strtotime("{$classDate} " . ($startTimeHour + 1) . ":00:00")); // 1 hour duration
            $startTimeHour++; // Increment hour for the next class on the *same* day

            $schedule_item = array(
                "id" => $scheduleEntryId . '-' . date('Ymd', strtotime($classDate)), // Make ID unique per day for demo
                "title" => $title, // Already combined Subject - Section
                "start" => $startDateTime,
                "end" => $endDateTime,
                "type" => 'class', // Assume all are classes for now
                "location" => "Room " . (crc32($subjectName) % 200 + 100), // Slightly less random room
                "section" => $sectionCode // Include section
            );
            array_push($schedule_arr, $schedule_item);

            // Reset time for the next assignment to avoid stacking too late
            if ($startTimeHour > 16) $startTimeHour = 8;
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
    echo json_encode(array("message" => "Unable to fetch schedule. " . $exception->getMessage()));
}
?>
