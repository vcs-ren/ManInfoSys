
<?php
// --- api/students/read.php --- (GET /api/students)
header("Access-Control-Allow-Origin: *"); // Allow requests (adjust in production)
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS"); // Allow GET and OPTIONS
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Includes
include_once '../config/database.php';
include_once '../models/student.php'; // Use the Student model

// Instantiate DB and student object
$database = new Database();
$db = $database->getConnection();
$student = new Student($db);

try {
    // Query students using the model's read method
    $stmt = $student->read();
    $num = $stmt->rowCount();

    // Students array
    $students_arr = array();

    // Check if any students found
    if ($num > 0) {
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row (this will make $id, $firstName, etc. available)
            // Note: We use the aliases defined in the model's read() query
            extract($row);

            $student_item = array(
                "id" => (int)$id, // Ensure ID is integer
                "studentId" => $studentId,
                "username" => $username,
                "firstName" => $firstName,
                "lastName" => $lastName,
                "middleName" => $middleName,
                "suffix" => $suffix,
                "gender" => $gender,
                "birthday" => $birthday,
                "program" => $program, // Use program key for frontend consistency
                "enrollmentType" => $enrollmentType, // Changed from status
                "year" => $year,
                "section" => $section,
                "email" => $email,
                "phone" => $phone,
                "emergencyContactName" => $emergencyContactName,
                "emergencyContactRelationship" => $emergencyContactRelationship,
                "emergencyContactPhone" => $emergencyContactPhone,
                "emergencyContactAddress" => $emergencyContactAddress,
                "lastAccessed" => $lastAccessed, // Added lastAccessed
            );
            array_push($students_arr, $student_item);
        }
    }

    // Set response code - 200 OK (even if empty)
    http_response_code(200);
    // Show students data in json format (return the array directly)
    echo json_encode($students_arr);

} catch (PDOException $exception) {
    error_log("Error fetching students: " . $exception->getMessage());
    http_response_code(500);
    echo json_encode(array("message" => "Unable to fetch students. Database error."));
} catch (Exception $e) {
    error_log("General error fetching students: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array("message" => "An unexpected error occurred while fetching students."));
}
?>
