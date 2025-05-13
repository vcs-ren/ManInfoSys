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

// Initialize stats array
$stats = array(
    "totalStudents" => 0,
    "totalTeachingStaff" => 0, 
    "totalAdministrativeStaff" => 0,
    "totalEventsAnnouncements" => 0 // Changed from totalAdmins
);

try {
    // Query for total students
    $queryStudents = "SELECT COUNT(*) as count FROM students";
    $stmtStudents = $db->prepare($queryStudents);
    $stmtStudents->execute();
    $rowStudents = $stmtStudents->fetch(PDO::FETCH_ASSOC);
    $stats["totalStudents"] = (int)$rowStudents['count'];

    // Query for total teaching staff (from teachers table where department is 'Teaching')
    $queryTeaching = "SELECT COUNT(*) as count FROM teachers WHERE department = 'Teaching'";
    $stmtTeaching = $db->prepare($queryTeaching);
    $stmtTeaching->execute();
    $rowTeaching = $stmtTeaching->fetch(PDO::FETCH_ASSOC);
    $stats["totalTeachingStaff"] = (int)$rowTeaching['count'];

    // Query for total administrative staff (from teachers table where department is 'Administrative')
    $queryAdministrative = "SELECT COUNT(*) as count FROM teachers WHERE department = 'Administrative'";
    $stmtAdministrative = $db->prepare($queryAdministrative);
    $stmtAdministrative->execute();
    $rowAdministrative = $stmtAdministrative->fetch(PDO::FETCH_ASSOC);
    $stats["totalAdministrativeStaff"] = (int)$rowAdministrative['count'];

    // Query for total events/announcements
    $queryEventsAnnouncements = "SELECT COUNT(*) as count FROM announcements";
    $stmtEventsAnnouncements = $db->prepare($queryEventsAnnouncements);
    $stmtEventsAnnouncements->execute();
    $rowEventsAnnouncements = $stmtEventsAnnouncements->fetch(PDO::FETCH_ASSOC);
    $stats["totalEventsAnnouncements"] = (int)$rowEventsAnnouncements['count'];


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
```