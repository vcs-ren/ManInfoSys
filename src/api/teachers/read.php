<?php
// --- api/teachers/read.php --- (GET /api/teachers)

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
include_once '../models/teacher.php'; // Use the Teacher model

// Instantiate DB and teacher object
$database = new Database();
$db = $database->getConnection(); // Handles connection errors internally
$teacher = new Teacher($db);

// Query teachers using the model's read method
$stmt = $teacher->read();
$num = $stmt->rowCount();

// Check if any teachers found
if ($num > 0) {
    $teachers_arr = array();
    $teachers_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row); // Use aliases from model query

        $teacher_item = array(
            "id" => $id,
            "teacherId" => $teacherId,
            "firstName" => $firstName,
            "lastName" => $lastName,
            "department" => $department,
            "email" => $email,
            "phone" => $phone,
        );
        array_push($teachers_arr["records"], $teacher_item);
    }

    // Set response code - 200 OK
    http_response_code(200);
    echo json_encode($teachers_arr);
} else {
    // Set response code - 200 OK (Not an error if empty)
    http_response_code(200);
    // Return an empty array to signify no records found, instead of 404
    echo json_encode(array("records" => array()));
}
?>
