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
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':phone', $this->phone);
        $stmt->bindParam(':passwordHash', $this->passwordHash);

        // Execute query
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
             // Return the created teacher's data (excluding password hash)
             return array(
                 "id" => $this->id,
                 "teacherId" => $this->teacherId,
                 "firstName" => $this->firstName,
                 "lastName" => $this->lastName,
                 "department" => $this->department,
                 "email" => $this->email,
                 "phone" => $this->phone,
             );
        }
        printf("Error: %s.\n", $stmt->errorInfo()[2]);
        return false;
    }

     // Update teacher
    public function update() {
        // Update query - Exclude teacherId, password (handled separately)
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

        // Clean data
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
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':phone', $this->phone);
        $stmt->bindParam(':id', $this->id);


        // Execute query
        if ($stmt->execute()) {
             // Fetch and return the updated record
             return $this->readOne(); // Assumes readOne method exists
        }
        printf("Error: %s.\n", $stmt->errorInfo()[2]);
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
            return true;
        }
        printf("Error: %s.\n", $stmt->errorInfo()[2]);
        return false;
    }

     // Helper to get a single teacher record
    public function readOne() {
        $query = "SELECT
                    id, teacher_id as teacherId, first_name as firstName, last_name as lastName,
                    department, email, phone
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
            return (array)$this; // Return as array or DTO
        }
        return null;
    }

    // Helper function to generate teacher ID (e.g., t1001)
    private function generateTeacherId() {
        $query = "SELECT MAX(id) as last_id FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $nextId = ($row && $row['last_id']) ? $row['last_id'] + 1 : 1;
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
             return true;
         }
         printf("Error resetting password: %s.\n", $stmt->errorInfo()[2]);
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
            return true;
        } else {
            error_log("Failed to update password for teacher ID: " . $teacherId);
            throw new Exception("Failed to update password."); // Throw generic error
        }
    }
}
?>
