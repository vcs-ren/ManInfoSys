<?php
// --- api/models/admin.php ---
// Model for interacting with the 'admins' table.

class Admin {
    // Database connection and table name
    private $conn;
    private $table_name = "admins";

    // Object properties
    public $id;
    public $username;
    public $passwordHash; // Renamed for clarity
    public $created_at;

    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }

    // Authenticate admin user
    public function authenticate($username, $password) {
        // Check if DB connection exists
        if (!$this->conn) {
            error_log("Admin authentication requires a database connection.");
            return false;
        }

        // Select query to find the admin by username
        $query = "SELECT id, username, password_hash FROM " . $this->table_name . " WHERE username = :username LIMIT 1";

        // Prepare query statement
        $stmt = $this->conn->prepare($query);

        // Sanitize username
        $username = htmlspecialchars(strip_tags($username));

        // Bind parameters
        $stmt->bindParam(':username', $username);

        // Execute query
        $stmt->execute();
        $num = $stmt->rowCount();

        // If admin exists
        if ($num > 0) {
            // Get record details
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->id = $row['id'];
            $this->username = $row['username'];
            $this->passwordHash = $row['password_hash'];

            // Verify password
            if (password_verify($password, $this->passwordHash)) {
                return true; // Authentication successful
            }
        }

        // Authentication failed (user not found or password mismatch)
        return false;
    }

     // Method to change admin password (Requires DB interaction)
    public function changePassword($adminId, $currentPassword, $newPassword) {
        if (!$this->conn) {
            error_log("Admin password change requires a database connection.");
             throw new Exception("Database connection error."); // Throw specific exception
        }

        // 1. Verify the current password
        $query = "SELECT password_hash FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $adminId);
        $stmt->execute();
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$admin || !password_verify($currentPassword, $admin['password_hash'])) {
            // Current password incorrect or admin not found
             throw new Exception("Incorrect current password."); // Throw exception for specific error
        }

        // 2. Hash the new password
        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

        // 3. Update the password in the database
        $updateQuery = "UPDATE " . $this->table_name . " SET password_hash = :newPasswordHash WHERE id = :id";
        $updateStmt = $this->conn->prepare($updateQuery);
        $updateStmt->bindParam(':newPasswordHash', $newPasswordHash);
        $updateStmt->bindParam(':id', $adminId);

        if ($updateStmt->execute()) {
            return true;
        } else {
             error_log("Failed to update admin password for ID: " . $adminId . " - Error: " . implode(" | ", $updateStmt->errorInfo()));
             throw new Exception("Failed to update password.");
        }
    }
}
?>
