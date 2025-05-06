<?php
// --- api/config/database.php ---
class Database {
    private $host = "localhost"; // Or your database host
    private $db_name = "campus_connect_db";
    private $username = "root"; // Replace with your database username
    private $password = ""; // Replace with your database password (use environment variables in production)
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            // Set character set to utf8mb4 for broader compatibility
            $this->conn->exec("set names utf8mb4");
        } catch(PDOException $exception) {
             // Log the error securely
             error_log("Database Connection Error: " . $exception->getMessage());

             // ** Important: Send headers *before* outputting the error message **
             // Ensure CORS headers are sent even for errors if not already sent by the calling script
             if (!headers_sent()) {
                header("Access-Control-Allow-Origin: *"); // Adjust for production
                header("Content-Type: application/json; charset=UTF-8");
                // Add other necessary CORS headers if applicable
                header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
                header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
             }

             // Return a generic error response to the client
             http_response_code(503); // Service Unavailable
             echo json_encode(array("message" => "Database connection error. Check backend configuration and ensure the database server is running. Details: " . $exception->getMessage()));
             exit(); // Exit script on critical connection failure
        }
        return $this->conn;
    }
}
?>

    