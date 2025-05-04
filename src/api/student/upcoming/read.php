<?php
// --- api/student/upcoming/read.php --- (GET /api/student/upcoming)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Includes
include_once '../../config/database.php';

// ** Authentication Check (Placeholder - Implement properly) **
// Get the logged-in student's ID
$loggedInStudentId = null;
// Example session check:
// session_start();
// if (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'Student' && isset($_SESSION['user_id'])) {
//     $loggedInStudentId = $_SESSION['user_id'];
// } else {
//     http_response_code(401); // Unauthorized
//     echo json_encode(array("message" => "Authentication required. Student access only."));
//     exit();
// }
// ** END Placeholder Auth **

// ** Temporary Hardcoding for Testing (REMOVE IN PRODUCTION) **
$loggedInStudentId = 1; // Example: Assume student with ID 1 is logged in. REMOVE THIS.


// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// --- Placeholder Logic ---
// This endpoint needs significant implementation based on how you store
// assignments, deadlines, events, and class schedules.

// Example: Fetch upcoming assignment deadlines (requires an 'assignments' table with due dates)
/*
$assignmentQuery = "SELECT
                        a.id, a.title, a.due_date as date, 'assignment' as type
                      FROM
                        assignments a
                      JOIN
                        student_assignments sa ON a.id = sa.assignment_id -- Join based on student linkage
                      WHERE
                        sa.student_id = :studentId AND a.due_date >= CURDATE()
                      ORDER BY a.due_date ASC LIMIT 5"; // Limit results

$assignmentStmt = $db->prepare($assignmentQuery);
$assignmentStmt->bindParam(':studentId', $loggedInStudentId);
$assignmentStmt->execute();
$upcomingAssignments = $assignmentStmt->fetchAll(PDO::FETCH_ASSOC);
*/

// Example: Fetch upcoming events (requires an 'events' table)
/*
$eventQuery = "SELECT
                   e.id, e.title, e.event_date as date, 'event' as type
                 FROM
                   events e
                 WHERE
                   e.event_date >= CURDATE()
                   -- Add filtering based on student's course/year/section if applicable
                 ORDER BY e.event_date ASC LIMIT 5";

$eventStmt = $db->prepare($eventQuery);
// Bind parameters if filtering is added
$eventStmt->execute();
$upcomingEvents = $eventStmt->fetchAll(PDO::FETCH_ASSOC);
*/

// Example: Fetch today's classes (requires schedule info)
/*
$today = date('Y-m-d');
$classQuery = "SELECT
                   cs.id, cs.title, cs.start_time as date, 'class' as type -- Adapt fields as needed
                 FROM
                   class_schedule cs -- Assuming a class schedule table
                 WHERE
                   cs.student_id = :studentId AND DATE(cs.start_time) = :today -- Filter by student and today's date
                 ORDER BY cs.start_time ASC";
$classStmt = $db->prepare($classQuery);
$classStmt->bindParam(':studentId', $loggedInStudentId);
$classStmt->bindParam(':today', $today);
$classStmt->execute();
$todayClasses = $classStmt->fetchAll(PDO::FETCH_ASSOC);
*/


// Combine results (example structure)
$upcomingItems = [];
// if (isset($upcomingAssignments)) { $upcomingItems = array_merge($upcomingItems, $upcomingAssignments); }
// if (isset($upcomingEvents)) { $upcomingItems = array_merge($upcomingItems, $upcomingEvents); }
// if (isset($todayClasses)) { $upcomingItems = array_merge($upcomingItems, $todayClasses); }

// Sort combined items by date (if applicable)
// usort($upcomingItems, function($a, $b) {
//     return strtotime($a['date']) - strtotime($b['date']);
// });


// --- Return Placeholder Data ---
$upcomingItems = [
    // ["id" => "assign1", "title" => "Submit Math Homework 1", "date" => date('Y-m-d', strtotime('+3 days')), "type" => "assignment"],
    // ["id" => "event1", "title" => "Campus Fair", "date" => date('Y-m-d', strtotime('+7 days')), "type" => "event"],
    // ["id" => "class1", "title" => "CS101 Lecture", "date" => date('Y-m-d H:i:s', strtotime('today 9:00')), "type" => "class"]
];
// --- End Placeholder ---


http_response_code(200);
echo json_encode($upcomingItems); // Return the (currently empty or placeholder) array

?>
