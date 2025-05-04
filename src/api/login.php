<?php
// --- api/login.php --- (POST /api/login.php)

// Headers
header("Access-Control-Allow-Origin: *"); // Adjust for production
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Includes
include_once './config/database.php';
// No need to include models directly here, we'll query based on username prefix

// Instantiate DB
$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate input data
if (!empty($data->username) && !empty($data->password)) {
    $username = $data->username;
    $password = $data->password;

    $user = null;
    $role = null;
    $redirectPath = null;
    $table = null;
    $id_column = null; // Column name for user ID (student_id or teacher_id)

    // Determine user type based on username prefix or specific usernames
    if ($username === 'admin') {
        // --- Admin Login ---
        // **IMPORTANT:** Replace with your actual secure admin credential check
        // This is a placeholder and insecure! Use a dedicated admin table or secure config.
        $admin_password_hash = password_hash("adminpassword", PASSWORD_DEFAULT); // Hash the password

        if (password_verify($password, $admin_password_hash)) { // Compare hashed password
            $role = "Admin";
            $redirectPath = "/admin/dashboard";
        }
    } elseif (strpos($username, 's') === 0) {
        // --- Student Login ---
        $table = 'students';
        $id_column = 'student_id';
        $role = "Student";
        $redirectPath = "/student/dashboard";
    } elseif (strpos($username, 't') === 0) {
        // --- Teacher Login ---
        $table = 'teachers';
        $id_column = 'teacher_id';
        $role = "Teacher";
        $redirectPath = "/teacher/dashboard";
    }

    // If role is student or teacher, query the database
    if ($table && $id_column && $role) {
        $query = "SELECT id, password_hash FROM " . $table . " WHERE " . $id_column . " = :username LIMIT 1";
        $stmt = $db->prepare($query);

        // Sanitize username
        $username = htmlspecialchars(strip_tags($username));
        $stmt->bindParam(':username', $username);

        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            // Password is correct for student or teacher
            // Role and redirectPath are already set
        } else {
            // Invalid username or password for student/teacher
            $role = null; // Invalidate role if password doesn't match
        }
    } elseif ($username === 'admin' && $role) {
        // Admin login successful (handled above)
    } else {
        // Username format is incorrect or not an admin
        $role = null;
    }


    // Prepare and send response
    if ($role && $redirectPath) {
        // Login successful
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Login successful.",
            "role" => $role,
            "redirectPath" => $redirectPath
            // Optional: Generate and return a session token here
        ));
    } else {
        // Login failed
        http_response_code(401); // Unauthorized
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid username or password."
        ));
    }

} else {
    // Data incomplete
    http_response_code(400); // Bad Request
    echo json_encode(array(
        "success" => false,
        "message" => "Username and password are required."
    ));
}
?>
