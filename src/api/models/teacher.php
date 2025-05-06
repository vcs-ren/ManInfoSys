<?php
// --- api/models/teacher.php ---
class Teacher {
    // Connection
    private $conn;
    private $table = 'teachers'; // Table name in your database

    // Teacher properties
    public $id;
    public $teacherId;
    public $firstName;
    public $lastName;
    public $department;
    public $email;
    public $phone;
    public $passwordHash; // Store hashed password

    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }

     // Read all teachers
    public function read() {
        $query = "SELECT
                    id,
                    teacher_id as teacherId,
                    first_name as firstName,
                    last_name as lastName,
                    department,
                    email,
                    phone
                    -- Exclude password_hash
                  FROM
                    " . $this->table . "
                  ORDER BY
                    lastName ASC, firstName ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

      // Create teacher
    public function create() {
        // Generate teacher ID and default password
        $this->teacherId = $this->generateTeacherId();
        $this->passwordHash = $this->generateDefaultPassword($this->lastName);

         // Validate generated ID format
        if (!preg_match('/^t\d{4,}$/', $this->teacherId)) {
             error_log("Generated invalid teacher ID format: " . $this->teacherId);
             throw new Exception("Failed to generate valid teacher ID.");
        }

        // Insert query
        $query = "INSERT INTO " . $this->table . "
                    SET
                        teacher_id = :teacherId,
                        first_name = :firstName,
                        last_name = :lastName,
                        department = :department,
                        email = :email,
                        phone = :phone,
                        password_hash = :passwordHash";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->department = htmlspecialchars(strip_tags($this->department));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));

        // Bind data
        $stmt->bindParam(':teacherId', $this->teacherId);
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':department', $this->department);
        $stmt->bindParam(':email', $this->email, !empty($this->email) ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, !empty($this->phone) ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindParam(':passwordHash', $this->passwordHash);

        // Execute query
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
             // Return the created teacher's data (excluding password hash)
             return array(
                 "id" => (int)$this->id, // Ensure ID is integer
                 "teacherId" => $this->teacherId,
                 "firstName" => $this->firstName,
                 "lastName" => $this->lastName,
                 "department" => $this->department,
                 "email" => $this->email,
                 "phone" => $this->phone,
             );
        }
        error_log("Teacher Create Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

     // Update teacher - Modified to only update profile-editable fields
    public function update() {
        // Update query - ONLY include fields editable by teacher profile or admin management
        $query = "UPDATE " . $this->table . "
                    SET
                        first_name = :firstName,
                        last_name = :lastName,
                        email = :email,
                        phone = :phone
                    WHERE
                        id = :id";
         // Note: Admin update endpoint (/api/teachers/update.php) should use a different query
         // if it needs to update department.

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind data
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':email', $this->email, !empty($this->email) ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, !empty($this->phone) ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindParam(':id', $this->id);


        // Execute query
        if ($stmt->execute()) {
             // Fetch and return the updated record
             return $this->readOne(); // Assumes readOne method exists and returns needed fields
        }
        error_log("Teacher Update Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

      // Update method specifically for admin teacher management (updates all fields)
    public function adminUpdate() {
         $query = "UPDATE " . $this->table . "
                    SET
                        first_name = :firstName,
                        last_name = :lastName,
                        department = :department,
                        email = :email,
                        phone = :phone
                    WHERE
                        id = :id";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data (ensure all properties are set)
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->department = htmlspecialchars(strip_tags($this->department));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind data
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':department', $this->department);
        $stmt->bindParam(':email', $this->email, !empty($this->email) ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, !empty($this->phone) ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindParam(':id', $this->id);


        // Execute query
        if ($stmt->execute()) {
             return $this->readOne(); // Return updated record
        }
        error_log("Teacher Admin Update Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

      // Delete teacher
    public function delete() {
        // Delete query
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind data
        $stmt->bindParam(':id', $this->id);

        // Execute query
        if ($stmt->execute()) {
            return $stmt->rowCount() > 0; // Return true if a row was deleted
        }
         error_log("Teacher Delete Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

     // Helper to get a single teacher record
    public function readOne() {
        $query = "SELECT
                    id, teacher_id as teacherId, first_name as firstName, last_name as lastName,
                    department, email, phone
                    -- Exclude password_hash
                FROM " . $this->table . "
                WHERE id = :id LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->teacherId = $row['teacherId'];
            $this->firstName = $row['firstName'];
            $this->lastName = $row['lastName'];
            $this->department = $row['department'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            // Return as array with all expected fields
             return [
                 "id" => (int)$this->id,
                 "teacherId" => $this->teacherId,
                 "firstName" => $this->firstName,
                 "lastName" => $this->lastName,
                 "department" => $this->department,
                 "email" => $this->email,
                 "phone" => $this->phone,
             ];
        }
        return null;
    }

    // Helper function to generate teacher ID (e.g., t1001)
    private function generateTeacherId() {
        // Use AUTO_INCREMENT if possible, fallback to MAX(id)
        $query = "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = :dbName AND TABLE_NAME = :tableName";
        $stmt = $this->conn->prepare($query);
         $dbName = 'campus_connect_db'; // Replace if needed
         $stmt->bindParam(':dbName', $dbName);
         $stmt->bindParam(':tableName', $this->table);
         $stmt->execute();
         $row = $stmt->fetch(PDO::FETCH_ASSOC);
         $nextId = ($row && $row['AUTO_INCREMENT']) ? $row['AUTO_INCREMENT'] : 1;

         if ($nextId === 1) {
            $maxIdQuery = "SELECT MAX(id) as last_id FROM " . $this->table;
            $maxStmt = $this->conn->prepare($maxIdQuery);
            $maxStmt->execute();
            $maxRow = $maxStmt->fetch(PDO::FETCH_ASSOC);
            $nextId = ($maxRow && $maxRow['last_id']) ? $maxRow['last_id'] + 1 : 1;
         }
        return 't' . (1000 + $nextId);
    }

    // Helper function to generate default password hash
     private function generateDefaultPassword($lastName) {
        if (empty($lastName) || strlen($lastName) < 2) {
             $lastName = "user"; // Fallback last name
        }
        $defaultPassword = strtolower(substr($lastName, 0, 2)) . '1000';
        return password_hash($defaultPassword, PASSWORD_DEFAULT);
    }

     // Method to reset password for a given user ID
    public function resetPassword($userId, $lastName) {
         $newPasswordHash = $this->generateDefaultPassword($lastName);
         $query = "UPDATE " . $this->table . " SET password_hash = :passwordHash WHERE id = :userId";
         $stmt = $this->conn->prepare($query);

         $stmt->bindParam(':passwordHash', $newPasswordHash);
         $stmt->bindParam(':userId', $userId);

         if ($stmt->execute()) {
             return $stmt->rowCount() > 0; // Check if row was updated
         }
         error_log("Teacher Reset Password Error: " . implode(" | ", $stmt->errorInfo()));
         return false;
    }

     // Method for a teacher to change their own password
    public function changePassword($teacherId, $currentPassword, $newPassword) {
        // 1. Verify the current password
        $query = "SELECT password_hash FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $teacherId);
        $stmt->execute();
        $teacher = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$teacher || !password_verify($currentPassword, $teacher['password_hash'])) {
            // Current password incorrect or teacher not found
            throw new Exception("Incorrect current password."); // Throw specific error
        }

        // 2. Hash the new password
        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

        // 3. Update the password in the database
        $updateQuery = "UPDATE " . $this->table . " SET password_hash = :newPasswordHash WHERE id = :id";
        $updateStmt = $this->conn->prepare($updateQuery);
        $updateStmt->bindParam(':newPasswordHash', $newPasswordHash);
        $updateStmt->bindParam(':id', $teacherId);

        if ($updateStmt->execute()) {
             return $updateStmt->rowCount() > 0;
        } else {
            error_log("Failed to update password for teacher ID: " . $teacherId . " Error: " . implode(" | ", $updateStmt->errorInfo()));
            throw new Exception("Failed to update password."); // Throw generic error
        }
    }
}
?>

