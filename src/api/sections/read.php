
<?php
// --- api/sections/read.php --- (GET /api/sections)

// ** ALWAYS SEND CORS HEADERS FIRST **
header("Access-Control-Allow-Origin: *"); // Adjust for production (e.g., your frontend origin)
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
// No specific model needed for this query, direct PDO usage is fine

// Instantiate DB
$database = new Database();
$db = $database->getConnection(); // Handles connection errors internally

// Query sections and join with teachers to get adviser name
$query = "SELECT
            s.id,
            s.section_code AS sectionCode,
            s.course, -- Keep backend key as 'course'
            s.year_level AS yearLevel,
            s.adviser_id AS adviserId,
            CONCAT(t.first_name, ' ', t.last_name) AS adviserName
          FROM
            sections s
          LEFT JOIN
            teachers t ON s.adviser_id = t.id
          ORDER BY
            s.course ASC, s.year_level ASC, s.section_code ASC"; // Keep backend key for ordering

try {
    $stmt = $db->prepare($query);
    $stmt->execute();
    $num = $stmt->rowCount();

    $sections_arr = array();
    // Check if any sections found
    if ($num > 0) {
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row automatically creates variables like $id, $sectionCode etc.
            extract($row);

            $section_item = array(
                "id" => $id,
                "sectionCode" => $sectionCode,
                "course" => $course, // Keep backend key as 'course'
                "yearLevel" => $yearLevel,
                // Ensure adviserId is integer or null
                "adviserId" => $adviserId ? (int)$adviserId : null,
                // Use adviserName from the JOIN, default to null if no adviser
                "adviserName" => $adviserName
            );
            array_push($sections_arr, $section_item);
        }
    }

    // Set response code - 200 OK (even if empty)
    http_response_code(200);
    // Show sections data in json format
    echo json_encode($sections_arr); // Return the array directly

} catch (PDOException $exception) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching sections: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch sections. Database error: " . $exception->getMessage()));
} catch (Exception $e) {
     error_log("General error fetching sections: " . $e->getMessage());
     http_response_code(500);
     echo json_encode(array("message" => "An unexpected error occurred while fetching sections."));
}
?>
