<?php
// --- api/login.php --- (POST /login.php)

// ** ALWAYS SEND CORS HEADERS FIRST **
// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production (e.g., http://localhost:9002)
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Allow POST and OPTIONS (for preflight)
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Respond to preflight requests (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Includes
// Place includes after headers are sent
include_once './config/database.php';

// --- Function to send JSON response and exit ---
function sendJsonResponse($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// --- Database Connection ---
$database = new Database();
$db = $database->getConnection(); // getConnection() handles its own errors and exits if needed

// --- Request Body Parsing ---
$data = json_decode(file_get_contents("php://input"));

// --- Input Validation ---
if (empty($data->username) || empty($data->password)) {
    sendJsonResponse(400, ["success" => false, "message" => "Username and password are required."]);
}

$username = $data->username;
$password = $data->password; // Keep the plain text password for verification

$role = null;
$redirectPath = null;
$table = null;
$id_column = null; // Column name for username (student_id or teacher_id)
$user_id = null; // Store the actual DB user ID (pk)

// --- Determine User Type and Authenticate ---
try {
    if ($username === 'admin') {
        // --- Admin Login ---
        // **IMPORTANT:** Replace with your actual secure admin credential check
        $admin_password_hash = '$2y$10$yJgS.gXwz.Q6iP5tYhR8nOeJy.ZkL6Tq.u7W1p.O3eG9cX5rF0eDq'; // Hash for 'adminpassword'

        if (password_verify($password, $admin_password_hash)) {
            $role = "Admin";
            $redirectPath = "/admin/dashboard";
            $user_id = 0; // Assign a nominal ID for admin if needed
        }
    } elseif (strpos($username, 's') === 0 && ctype_digit(substr($username, 1))) {
        // --- Student Login ---
        $table = 'students';
        $id_column = 'student_id';
        $role = "Student";
        $redirectPath = "/student/dashboard";
    } elseif (strpos($username, 't') === 0 && ctype_digit(substr($username, 1))) {
        // --- Teacher Login ---
        $table = 'teachers';
        $id_column = 'teacher_id';
        $role = "Teacher";
        $redirectPath = "/teacher/dashboard";
    } else {
         // Invalid username format
         sendJsonResponse(401, ["success" => false, "message" => "Invalid username format."]);
    }

    // If role is student or teacher, query the database
    if ($table && $id_column && $role && $redirectPath) {
        $query = "SELECT id, password_hash FROM " . $table . " WHERE " . $id_column . " = :username LIMIT 1";
        $stmt = $db->prepare($query);

        // Sanitize username (although PDO binding helps)
        $username_sanitized = htmlspecialchars(strip_tags($username));
        $stmt->bindParam(':username', $username_sanitized);

        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            // Password is correct for student or teacher
            $user_id = $user['id'];
            // Role and redirectPath are already set
        } else {
            // Invalid username or password for student/teacher
             sendJsonResponse(401, ["success" => false, "message" => "Invalid username or password."]);
        }
    } elseif ($role !== "Admin") { // If not Admin and didn't match Student/Teacher DB check
         sendJsonResponse(401, ["success" => false, "message" => "Invalid credentials."]);
    }

    // --- Send Success Response ---
    if ($role && $redirectPath) {
         // Start session or generate token here if implementing sessions/JWT
         // session_start();
         // $_SESSION['user_id'] = $user_id;
         // $_SESSION['user_role'] = $role;
         // $_SESSION['username'] = $username; // Store username if needed

        sendJsonResponse(200, [
            "success" => true,
            "message" => "Login successful.",
            "role" => $role,
            "redirectPath" => $redirectPath
            // Optional: "token" => $jwt_token
        ]);
    } else {
         // Should not be reached if validation is correct, but as a fallback
         sendJsonResponse(401, ["success" => false, "message" => "Login failed due to an unexpected error."]);
    }

} catch (PDOException $e) {
    error_log("Database Error during Login: " . $e->getMessage());
    sendJsonResponse(500, ["success" => false, "message" => "Database error during login."]);
} catch (Exception $e) {
    error_log("General Error during Login: " . $e->getMessage());
    sendJsonResponse(500, ["success" => false, "message" => "An unexpected error occurred."]);
}

?>

    