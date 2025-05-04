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
            // Log the error securely instead of echoing sensitive info
             error_log("Database Connection Error: " . $exception->getMessage());
             // Return a generic error response to the client
             http_response_code(503); // Service Unavailable
             echo json_encode(array("message" => "Database connection error. Please try again later."));
            exit(); // Exit script on critical connection failure
        }
        return $this->conn;
    }
}
?>
