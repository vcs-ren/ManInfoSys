<?php
// --- api/config/database.php ---
class Database {
    private $host = "localhost";
    private $db_name = "campus_connect_db";
    private $username = "your_db_user"; // Replace with your database username
    private $password = "your_db_password"; // Replace with your database password
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // Log the error securely instead of echoing
            error_log("Database Connection Error: " . $exception->getMessage());
            // Return a generic error response or re-throw for higher level handling
            // For simplicity here, we echo, but avoid this in production
            echo json_encode(array("message" => "Database connection error."));
            exit(); // Exit script on connection failure
        }
        return $this->conn;
    }
}
?>
