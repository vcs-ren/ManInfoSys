<?php
// --- api/teachers/read.php --- (GET /api/teachers)
header("Access-Control-Allow-Origin: *"); // Allow requests (adjust in production)
header("Content-Type: application/json; charset=UTF-8");

// Includes
include_once '../config/database.php';
include_once '../models/teacher.php'; // Use the Teacher model

// Instantiate DB and teacher object
$database = new Database();
$db = $database->getConnection();
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
    // Set response code - 404 Not found
    http_response_code(404);
    echo json_encode(array("message" => "No teachers found."));
}
?>
