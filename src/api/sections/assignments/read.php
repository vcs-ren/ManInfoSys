<?php
// --- api/sections/assignments/read.php --- (GET /api/sections/{sectionId}/assignments)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");

// Includes
include_once '../../config/database.php';

// Get Section ID from URL path
// Assumes URL like /api/sections/CS-1-A/assignments
$url_parts = explode('/', $_SERVER['REQUEST_URI']);
// Find the index of 'sections' and get the next part as the ID
$sections_index = array_search('sections', $url_parts);
$sectionId = null;
if ($sections_index !== false && isset($url_parts[$sections_index + 1])) {
    $sectionId = $url_parts[$sections_index + 1];
}

// Validate Section ID
if (empty($sectionId)) {
    http_response_code(400);
    echo json_encode(array("message" => "Missing or invalid Section ID in URL. Expected format: /api/sections/{sectionId}/assignments"));
    exit();
}

// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// Query assignments for the given section ID, joining with subjects and teachers
$query = "SELECT
            ssa.id,
            ssa.section_id AS sectionId,
            ssa.subject_id AS subjectId,
            sub.name AS subjectName,
            ssa.teacher_id AS teacherId,
            CONCAT(t.first_name, ' ', t.last_name) AS teacherName
          FROM
            section_subject_assignments ssa
          JOIN
            subjects sub ON ssa.subject_id = sub.id
          JOIN
            teachers t ON ssa.teacher_id = t.id
          WHERE
            ssa.section_id = :sectionId
          ORDER BY
            sub.name ASC"; // Order by subject name

try {
    $stmt = $db->prepare($query);

    // Sanitize and bind Section ID
    $sectionId = htmlspecialchars(strip_tags($sectionId));
    $stmt->bindParam(':sectionId', $sectionId);

    $stmt->execute();
    $num = $stmt->rowCount();

    $assignments_arr = array();

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
             // Extract row automatically creates variables like $id, $subjectId, $subjectName etc.
             extract($row);
            $assignment_item = array(
                "id" => $id, // This is the assignment's unique ID
                "sectionId" => $sectionId, // from query param
                "subjectId" => $subjectId,
                "subjectName" => $subjectName,
                "teacherId" => (int)$teacherId, // Ensure integer
                "teacherName" => $teacherName
            );
            array_push($assignments_arr, $assignment_item);
        }
    }

    // Set response code - 200 OK (even if no assignments found)
    http_response_code(200);
    // Show assignments data in json format (will be an empty array if none found)
    echo json_encode($assignments_arr);

} catch (PDOException $exception) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching assignments for section {$sectionId}: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch assignments. " . $exception->getMessage()));
}
?>
