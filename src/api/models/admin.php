<?php
// --- api/models/admin.php ---
// **IMPORTANT:** This is a placeholder. Real admin authentication should be more robust,
// potentially using a dedicated 'admins' table and secure credential management.

class Admin {
    // Connection (if needed for DB check)
    private $conn;
    private $table = 'admins'; // Assuming an admins table exists

    // Admin properties
    public $id;
    public $username;
    public $passwordHash;

    // Constructor with DB connection (optional for hardcoded check)
    public function __construct($db = null) {
        $this->conn = $db;
    }

    // Basic hardcoded check (INSECURE - Replace with DB lookup and password_verify)
    public function authenticate($username, $password) {
        // --- INSECURE HARDCODED EXAMPLE ---
        $valid_admin_username = "admin";
        // Generate hash for 'adminpassword' (do this once offline)
        // $admin_password_hash = password_hash("adminpassword", PASSWORD_DEFAULT);
        $admin_password_hash = '$2y$10$yJgS.gXwz.Q6iP5tYhR8nOeJy.ZkL6Tq.u7W1p.O3eG9cX5rF0eDq'; // Example hash for 'adminpassword'

        if ($username === $valid_admin_username && password_verify($password, $admin_password_hash)) {
            // You might fetch admin details here if needed from DB
            // $this->id = 1; // Example ID
            $this->username = $username;
            return true;
        }
        // --- END INSECURE EXAMPLE ---

        /*
        // --- SECURE DB-BASED EXAMPLE (Requires 'admins' table) ---
        if (!$this->conn) {
            // Cannot authenticate without DB connection
            error_log("Admin authentication requires a database connection.");
            return false;
        }

        $query = "SELECT id, username, password_hash FROM " . $this->table . " WHERE username = :username LIMIT 1";
        $stmt = $this->conn->prepare($query);

        // Sanitize username
        $username = htmlspecialchars(strip_tags($username));
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        $admin_record = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin_record && password_verify($password, $admin_record['password_hash'])) {
            $this->id = $admin_record['id'];
            $this->username = $admin_record['username'];
            return true;
        }
        // --- END SECURE EXAMPLE ---
        */

        return false;
    }

     // Method to change admin password (Requires DB interaction)
    public function changePassword($adminId, $currentPassword, $newPassword) {
        if (!$this->conn) {
            error_log("Admin password change requires a database connection.");
            return false;
        }

        // 1. Verify the current password
        $query = "SELECT password_hash FROM " . $this->table . " WHERE id = :id LIMIT 1";
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
        $updateQuery = "UPDATE " . $this->table . " SET password_hash = :newPasswordHash WHERE id = :id";
        $updateStmt = $this->conn->prepare($updateQuery);
        $updateStmt->bindParam(':newPasswordHash', $newPasswordHash);
        $updateStmt->bindParam(':id', $adminId);

        if ($updateStmt->execute()) {
            return true;
        } else {
             error_log("Failed to update admin password for ID: " . $adminId);
             throw new Exception("Failed to update password.");
        }
    }
}
?>
