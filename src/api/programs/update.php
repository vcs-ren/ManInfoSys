<?php
// --- api/programs/update.php --- (PUT /api/programs/{programId})

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

$url_parts = explode('/', $_SERVER['REQUEST_URI']);
$programId = end($url_parts);

if (empty($programId) || empty($data->name)) {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to update program. Program ID and name are required."));
    exit();
}

try {
    $db->beginTransaction();

    // Update program details
    $query = "UPDATE programs SET name = :name, description = :description WHERE id = :id";
    $stmt = $db->prepare($query);

    $name = htmlspecialchars(strip_tags($data->name));
    $description = isset($data->description) ? htmlspecialchars(strip_tags($data->description)) : null;

    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':id', $programId);

    if (!$stmt->execute()) {
        $db->rollBack();
        http_response_code(503);
        error_log("Failed to update program details for ID {$programId}: " . implode(" | ", $stmt->errorInfo()));
        echo json_encode(array("message" => "Unable to update program details."));
        exit();
    }

    // Update course assignments for the program
    // First, clear existing course assignments for this program
    $deleteCoursesQuery = "DELETE FROM program_courses WHERE program_id = :programId";
    $deleteStmt = $db->prepare($deleteCoursesQuery);
    $deleteStmt->bindParam(':programId', $programId);
    if (!$deleteStmt->execute()) {
        $db->rollBack();
        http_response_code(503);
        error_log("Failed to clear existing courses for program ID {$programId}: " . implode(" | ", $deleteStmt->errorInfo()));
        echo json_encode(array("message" => "Unable to update program courses (clear failed)."));
        exit();
    }

    // Insert new course assignments
    if (isset($data->courses) && is_object($data->courses)) {
        $insertCourseQuery = "INSERT INTO program_courses (program_id, course_id, year_level) VALUES (:programId, :courseId, :yearLevel)";
        $insertStmt = $db->prepare($insertCourseQuery);

        foreach ($data->courses as $yearLevel => $coursesInYear) {
            if (is_array($coursesInYear)) {
                foreach ($coursesInYear as $courseObj) {
                    if (isset($courseObj->id)) {
                        $courseId = htmlspecialchars(strip_tags($courseObj->id));
                        $yearLevelClean = htmlspecialchars(strip_tags($yearLevel));

                        $insertStmt->bindParam(':programId', $programId);
                        $insertStmt->bindParam(':courseId', $courseId);
                        $insertStmt->bindParam(':yearLevel', $yearLevelClean);

                        if (!$insertStmt->execute()) {
                            $db->rollBack();
                            http_response_code(503);
                            error_log("Failed to assign course {$courseId} to program ID {$programId} for year {$yearLevelClean}: " . implode(" | ", $insertStmt->errorInfo()));
                            echo json_encode(array("message" => "Unable to update program courses (assign failed for course {$courseId})."));
                            exit();
                        }
                    }
                }
            }
        }
    }

    $db->commit();

    // Fetch the updated program to return
    $fetchQuery = "SELECT p.id, p.name, p.description FROM programs p WHERE p.id = :id";
    $fetchStmt = $db->prepare($fetchQuery);
    $fetchStmt->bindParam(':id', $programId);
    $fetchStmt->execute();
    $updatedProgram = $fetchStmt->fetch(PDO::FETCH_ASSOC);

    if ($updatedProgram) {
        // Fetch assigned courses
        $coursesQuery = "SELECT pc.course_id, pc.year_level, c.name as course_name, c.type as course_type, c.description as course_description
                         FROM program_courses pc
                         JOIN courses c ON pc.course_id = c.id
                         WHERE pc.program_id = :programId";
        $coursesStmt = $db->prepare($coursesQuery);
        $coursesStmt->bindParam(':programId', $programId);
        $coursesStmt->execute();
        $assignedCoursesRaw = $coursesStmt->fetchAll(PDO::FETCH_ASSOC);

        $updatedProgram['courses'] = ["1st Year" => [], "2nd Year" => [], "3rd Year" => [], "4th Year" => []];
        foreach ($assignedCoursesRaw as $assignedCourse) {
            $year = $assignedCourse['year_level'];
            if (array_key_exists($year, $updatedProgram['courses'])) {
                 // Construct course object similar to mock
                 $courseItem = [
                    "id" => $assignedCourse['course_id'],
                    "name" => $assignedCourse['course_name'],
                    "description" => $assignedCourse['course_description'],
                    "type" => $assignedCourse['course_type'],
                    // programId for major courses is usually handled in courses table or business logic
                    // For this response, we can assume it's correctly set if it's a major.
                    "programId" => ($assignedCourse['course_type'] === 'Major') ? [$programId] : [],
                    "yearLevel" => $year
                 ];
                array_push($updatedProgram['courses'][$year], $courseItem);
            }
        }

        http_response_code(200);
        echo json_encode($updatedProgram);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Program updated but could not be fetched."));
    }

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    error_log("Error updating program: " . $e->getMessage());
    echo json_encode(array("message" => "An error occurred while updating the program: " . $e->getMessage()));
}
?>
