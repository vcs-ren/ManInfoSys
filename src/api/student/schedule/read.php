<?php
// --- api/student/schedule/read.php --- (GET /api/student/schedule)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Includes
include_once '../../config/database.php';

// ** Authentication Check (Placeholder - Implement properly) **
// Get the logged-in student's ID and Section
$loggedInStudentId = null;
$studentSectionId = null; // The ID of the section the student belongs to
// Example session check:
// session_start();
// if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Student' && isset($_SESSION['user_id'])) {
//     $loggedInStudentId = $_SESSION['user_id'];
//     // Fetch student's section ID from DB
//     // $studentSectionId = fetchStudentSectionId($loggedInStudentId); // Implement this
// } else {
//     http_response_code(401); // Unauthorized
//     echo json_encode(array("message" => "Authentication required. Student access only."));
//     exit();
// }
// ** END Placeholder Auth **

// ** Temporary Hardcoding for Testing (REMOVE IN PRODUCTION) **
$loggedInStudentId = 1; // Example student ID
$studentSectionId = 'CS-1-A'; // Example Section ID. Fetch this dynamically!
// ** REMOVE Hardcoding Above **


// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// --- Query Logic ---
// Fetch subjects assigned to the student's section and the assigned teacher.
// We need to simulate schedule entries based on this.
// A real system would have a dedicated schedule table with days/times.

// ** THIS IS A SIMPLIFIED QUERY - A REAL SCHEDULE REQUIRES MORE DETAIL (Days, Times) **
$query = "SELECT
            ssa.id AS scheduleEntryId, -- Use assignment ID as a base for schedule entry ID
            sub.name AS title, -- Subject name as the title
            CONCAT(t.first_name, ' ', t.last_name) AS teacher,
            sec.section_code AS sectionCode
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
          JOIN
            teachers t ON ssa.teacher_id = t.id
          WHERE
            ssa.section_id = :sectionId -- Filter by the student's section
          ORDER BY
            sub.name ASC"; // Order as needed

try {
    $stmt = $db->prepare($query);

    // Bind student's section ID
    $stmt->bindParam(':sectionId', $studentSectionId);

    $stmt->execute();
    $num = $stmt->rowCount();

    $schedule_arr = array();

    // --- DUMMY SCHEDULE GENERATION (Replace with real data) ---
    $currentDate = date('Y-m-d');
    $startTimeHour = 8; // Start at 8 AM

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            // Generate dummy start and end times for demonstration
            $startDateTime = date('Y-m-d H:i:s', strtotime("{$currentDate} {$startTimeHour}:00:00"));
            $endDateTime = date('Y-m-d H:i:s', strtotime("{$currentDate} " . ($startTimeHour + 1) . ":00:00")); // 1 hour duration
            $startTimeHour++; // Increment hour for the next class

            $schedule_item = array(
                "id" => $scheduleEntryId . '-' . date('Ymd'), // Make ID unique per day for demo
                "title" => $title . " (" . $sectionCode . ")", // Add section code to title
                "start" => $startDateTime,
                "end" => $endDateTime,
                "type" => 'class', // Assume all are classes for now
                "location" => "Room " . rand(101, 305), // Dummy location
                "teacher" => $teacher,
                "section" => $sectionCode // Include section if needed
            );
            array_push($schedule_arr, $schedule_item);

             // Simple break to prevent too many overlapping dummy entries if needed
             if ($startTimeHour > 16) $startTimeHour = 8; // Reset if past 4 PM
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
    error_log("Error fetching student schedule: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch schedule. " . $exception->getMessage()));
}
?>
