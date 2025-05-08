<?php
// --- api/admin/dashboard-stats.php --- (GET)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Includes
include_once '../config/database.php';

// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// ** Authentication Check (Placeholder - Implement properly) **
// Ensure only authenticated admins can access this
// if (!isAdminAuthenticated()) {
//     http_response_code(401); // Unauthorized
//     echo json_encode(array("message" => "Authentication required."));
//     exit();
// }

// Define the ID of the Super Admin to exclude
define('SUPER_ADMIN_ID', 0); // Assuming Super Admin ID is 0

// Initialize stats array
$stats = array(
    "totalStudents" => 0,
    "totalTeachers" => 0, // Represents Teaching Staff
    "totalAdmins" => 0, // Represents Administrative Staff (excluding Super Admin)
    "upcomingEvents" => 0 // Placeholder, implement event fetching if needed
);

try {
    // Query for total students
    $queryStudents = "SELECT COUNT(*) as count FROM students";
    $stmtStudents = $db->prepare($queryStudents);
    $stmtStudents->execute();
    $rowStudents = $stmtStudents->fetch(PDO::FETCH_ASSOC);
    $stats["totalStudents"] = (int)$rowStudents['count'];

    // Query for total teaching staff (from teachers table where department is 'Teaching')
    $queryTeachers = "SELECT COUNT(*) as count FROM teachers WHERE department = 'Teaching'";
    $stmtTeachers = $db->prepare($queryTeachers);
    $stmtTeachers->execute();
    $rowTeachers = $stmtTeachers->fetch(PDO::FETCH_ASSOC);
    $stats["totalTeachers"] = (int)$rowTeachers['count'];

    // Query for total administrative staff (from admins table, excluding Super Admin ID 0)
    // AND teachers table where department is 'Administrative'
    $queryAdmins = "SELECT
                        (SELECT COUNT(*) FROM admins WHERE id != :superAdminId) +
                        (SELECT COUNT(*) FROM teachers WHERE department = 'Administrative')
                    AS count";
    $stmtAdmins = $db->prepare($queryAdmins);
    $superAdminId = SUPER_ADMIN_ID; // Use the defined constant
    $stmtAdmins->bindParam(':superAdminId', $superAdminId, PDO::PARAM_INT);
    $stmtAdmins->execute();
    $rowAdmins = $stmtAdmins->fetch(PDO::FETCH_ASSOC);
    $stats["totalAdmins"] = (int)$rowAdmins['count'];


    // Placeholder for Upcoming Events count
    // You would need an 'events' table and logic to count future events
    // $queryEvents = "SELECT COUNT(*) as count FROM events WHERE event_date >= CURDATE()";
    // ... execute query and set $stats["upcomingEvents"] ...
    $stats["upcomingEvents"] = 0; // Set to 0 for now

    // Set response code - 200 OK
    http_response_code(200);
    // Send the stats data
    echo json_encode($stats);

} catch (Exception $e) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching dashboard stats: " . $e->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch dashboard statistics. " . $e->getMessage()));
}

?>
