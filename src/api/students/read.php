<?php
// --- api/students/read.php --- (GET /api/students)
header("Access-Control-Allow-Origin: *"); // Allow requests (adjust in production)
header("Content-Type: application/json; charset=UTF-8");

// Includes
include_once '../config/database.php';
include_once '../models/student.php'; // Use the Student model

// Instantiate DB and student object
$database = new Database();
$db = $database->getConnection();
$student = new Student($db);

// Query students using the model's read method
$stmt = $student->read();
$num = $stmt->rowCount();

// Check if any students found
if ($num > 0) {
    // Students array
    $students_arr = array();
    $students_arr["records"] = array();

    // Retrieve table contents
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Extract row (this will make $id, $firstName, etc. available)
        // Note: We use the aliases defined in the model's read() query
        extract($row);

        $student_item = array(
            "id" => $id,
            "studentId" => $studentId, // Use the alias from the model query
            "firstName" => $firstName, // Use the alias
            "lastName" => $lastName,   // Use the alias
            "course" => $course,
            "status" => $status,
            "year" => $year,
            "section" => $section,
            "email" => $email,
            "phone" => $phone,
            "emergencyContactName" => $emergencyContactName, // Use the alias
            "emergencyContactRelationship" => $emergencyContactRelationship, // Use the alias
            "emergencyContactPhone" => $emergencyContactPhone, // Use the alias
            "emergencyContactAddress" => $emergencyContactAddress, // Use the alias
        );
        array_push($students_arr["records"], $student_item);
    }

    // Set response code - 200 OK
    http_response_code(200);
    // Show students data in json format
    echo json_encode($students_arr);
} else {
    // Set response code - 404 Not found
    http_response_code(404);
    // Tell the user no students found
    echo json_encode(array("message" => "No students found."));
}
?>
