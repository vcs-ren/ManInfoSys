<?php
// --- api/sections/read.php --- (GET /api/sections)
header("Access-Control-Allow-Origin: *"); // Allow requests (adjust in production)
header("Content-Type: application/json; charset=UTF-8");

// Includes
include_once '../config/database.php';
// No specific model needed for this query, direct PDO usage is fine

// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// Query sections and join with teachers to get adviser name
$query = "SELECT
            s.id,
            s.section_code AS sectionCode,
            s.course,
            s.year_level AS yearLevel,
            s.adviser_id AS adviserId,
            CONCAT(t.first_name, ' ', t.last_name) AS adviserName
          FROM
            sections s
          LEFT JOIN
            teachers t ON s.adviser_id = t.id
          ORDER BY
            s.course ASC, s.year_level ASC, s.section_code ASC";

try {
    $stmt = $db->prepare($query);
    $stmt->execute();
    $num = $stmt->rowCount();

    // Check if any sections found
    if ($num > 0) {
        $sections_arr = array();

        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row automatically creates variables like $id, $sectionCode etc.
            extract($row);

            $section_item = array(
                "id" => $id,
                "sectionCode" => $sectionCode,
                "course" => $course,
                "yearLevel" => $yearLevel,
                // Ensure adviserId is integer or null
                "adviserId" => $adviserId ? (int)$adviserId : null,
                // Use adviserName from the JOIN, default to null if no adviser
                "adviserName" => $adviserName
            );
            array_push($sections_arr, $section_item);
        }

        // Set response code - 200 OK
        http_response_code(200);
        // Show sections data in json format
        echo json_encode($sections_arr); // Return the array directly
    } else {
        // Set response code - 200 OK (It's not an error if there are no sections)
        http_response_code(200);
        // Return an empty array
        echo json_encode(array());
    }
} catch (PDOException $exception) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    // Log the error
    error_log("Error fetching sections: " . $exception->getMessage());
    // Send error response
    echo json_encode(array("message" => "Unable to fetch sections. " . $exception->getMessage()));
}
?>
