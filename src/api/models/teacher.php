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
    public $middleName; // Added
    public $suffix; // Added
    public $address; // Added
    public $department;
    public $email;
    public $phone;
    public $birthday; // Added (expect YYYY-MM-DD)
    public $passwordHash; // Store hashed password
    // Added Emergency Contact Fields
    public $emergencyContactName;
    public $emergencyContactRelationship;
    public $emergencyContactPhone;
    public $emergencyContactAddress;

    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }

     // Read all teachers - Updated
    public function read() {
        $query = "SELECT
                    id,
                    teacher_id as teacherId,
                    first_name as firstName,
                    last_name as lastName,
                    middle_name as middleName,
                    suffix,
                    address,
                    department,
                    email,
                    phone,
                    birthday,
                    emergency_contact_name as emergencyContactName,
                    emergency_contact_relationship as emergencyContactRelationship,
                    emergency_contact_phone as emergencyContactPhone,
                    emergency_contact_address as emergencyContactAddress
                    -- Exclude password_hash
                  FROM
                    " . $this->table . "
                  ORDER BY
                    lastName ASC, firstName ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

      // Create teacher - Updated
    public function create() {
        // Generate teacher ID and default password
        $this->teacherId = $this->generateTeacherId();
        $this->passwordHash = $this->generateDefaultPassword($this->lastName);

         // Validate generated ID format
        if (!preg_match('/^t\d{4,}$/', $this->teacherId)) {
             error_log("Generated invalid teacher ID format: " . $this->teacherId);
             throw new Exception("Failed to generate valid teacher ID.");
        }

        // Insert query - Updated
        $query = "INSERT INTO " . $this->table . "
                    SET
                        teacher_id = :teacherId,
                        first_name = :firstName,
                        last_name = :lastName,
                        middle_name = :middleName,
                        suffix = :suffix,
                        address = :address,
                        department = :department,
                        email = :email,
                        phone = :phone,
                        birthday = :birthday,
                        password_hash = :passwordHash,
                        emergency_contact_name = :emergencyContactName,
                        emergency_contact_relationship = :emergencyContactRelationship,
                        emergency_contact_phone = :emergencyContactPhone,
                        emergency_contact_address = :emergencyContactAddress";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data - Updated
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->address = !empty($this->address) ? htmlspecialchars(strip_tags($this->address)) : null; // Clean address
        $this->department = htmlspecialchars(strip_tags($this->department));
        $this->email = !empty($this->email) ? htmlspecialchars(strip_tags($this->email)) : null;
        $this->phone = !empty($this->phone) ? htmlspecialchars(strip_tags($this->phone)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->emergencyContactName = !empty($this->emergencyContactName) ? htmlspecialchars(strip_tags($this->emergencyContactName)) : null;
        $this->emergencyContactRelationship = !empty($this->emergencyContactRelationship) ? htmlspecialchars(strip_tags($this->emergencyContactRelationship)) : null;
        $this->emergencyContactPhone = !empty($this->emergencyContactPhone) ? htmlspecialchars(strip_tags($this->emergencyContactPhone)) : null;
        $this->emergencyContactAddress = !empty($this->emergencyContactAddress) ? htmlspecialchars(strip_tags($this->emergencyContactAddress)) : null;


        // Bind data - Updated
        $stmt->bindParam(':teacherId', $this->teacherId);
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':middleName', $this->middleName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':suffix', $this->suffix, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':address', $this->address, PDO::PARAM_STR | PDO::PARAM_NULL); // Bind address
        $stmt->bindParam(':department', $this->department);
        $stmt->bindParam(':email', $this->email, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':birthday', $this->birthday, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':passwordHash', $this->passwordHash);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress, PDO::PARAM_STR | PDO::PARAM_NULL);


        // Execute query
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
             // Return the created teacher's data (excluding password hash) - Updated
             return $this->readOne(); // Fetch the complete record
        }
        error_log("Teacher Create Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

     // Update teacher - Modified to only update profile-editable fields - Updated
    public function update() {
        // Update query - ONLY include fields editable by teacher profile or admin management
        $query = "UPDATE " . $this->table . "
                    SET
                        first_name = :firstName,
                        last_name = :lastName,
                        middle_name = :middleName,
                        suffix = :suffix,
                        address = :address,
                        email = :email,
                        phone = :phone,
                        birthday = :birthday,
                        emergency_contact_name = :emergencyContactName,
                        emergency_contact_relationship = :emergencyContactRelationship,
                        emergency_contact_phone = :emergencyContactPhone,
                        emergency_contact_address = :emergencyContactAddress
                    WHERE
                        id = :id";
         // Note: Admin update endpoint (/api/teachers/update.php) should use a different query
         // if it needs to update department.

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data - Updated
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->address = !empty($this->address) ? htmlspecialchars(strip_tags($this->address)) : null; // Clean address
        $this->email = !empty($this->email) ? htmlspecialchars(strip_tags($this->email)) : null;
        $this->phone = !empty($this->phone) ? htmlspecialchars(strip_tags($this->phone)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->emergencyContactName = !empty($this->emergencyContactName) ? htmlspecialchars(strip_tags($this->emergencyContactName)) : null;
        $this->emergencyContactRelationship = !empty($this->emergencyContactRelationship) ? htmlspecialchars(strip_tags($this->emergencyContactRelationship)) : null;
        $this->emergencyContactPhone = !empty($this->emergencyContactPhone) ? htmlspecialchars(strip_tags($this->emergencyContactPhone)) : null;
        $this->emergencyContactAddress = !empty($this->emergencyContactAddress) ? htmlspecialchars(strip_tags($this->emergencyContactAddress)) : null;
        $this->id = htmlspecialchars(strip_tags($this->id));


        // Bind data - Updated
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':middleName', $this->middleName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':suffix', $this->suffix, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':address', $this->address, PDO::PARAM_STR | PDO::PARAM_NULL); // Bind address
        $stmt->bindParam(':email', $this->email, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':birthday', $this->birthday, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress, PDO::PARAM_STR | PDO::PARAM_NULL);


        // Execute query
        if ($stmt->execute()) {
             // Fetch and return the updated record
             return $this->readOne(); // Assumes readOne method exists and returns needed fields
        }
        error_log("Teacher Update Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

      // Update method specifically for admin teacher management (updates all fields) - Updated
    public function adminUpdate() {
         $query = "UPDATE " . $this->table . "
                    SET
                        first_name = :firstName,
                        last_name = :lastName,
                        middle_name = :middleName,
                        suffix = :suffix,
                        address = :address,
                        department = :department,
                        email = :email,
                        phone = :phone,
                        birthday = :birthday,
                        emergency_contact_name = :emergencyContactName,
                        emergency_contact_relationship = :emergencyContactRelationship,
                        emergency_contact_phone = :emergencyContactPhone,
                        emergency_contact_address = :emergencyContactAddress
                    WHERE
                        id = :id";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data (ensure all properties are set) - Updated
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->address = !empty($this->address) ? htmlspecialchars(strip_tags($this->address)) : null; // Clean address
        $this->department = htmlspecialchars(strip_tags($this->department));
        $this->email = !empty($this->email) ? htmlspecialchars(strip_tags($this->email)) : null;
        $this->phone = !empty($this->phone) ? htmlspecialchars(strip_tags($this->phone)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->emergencyContactName = !empty($this->emergencyContactName) ? htmlspecialchars(strip_tags($this->emergencyContactName)) : null;
        $this->emergencyContactRelationship = !empty($this->emergencyContactRelationship) ? htmlspecialchars(strip_tags($this->emergencyContactRelationship)) : null;
        $this->emergencyContactPhone = !empty($this->emergencyContactPhone) ? htmlspecialchars(strip_tags($this->emergencyContactPhone)) : null;
        $this->emergencyContactAddress = !empty($this->emergencyContactAddress) ? htmlspecialchars(strip_tags($this->emergencyContactAddress)) : null;
        $this->id = htmlspecialchars(strip_tags($this->id));


        // Bind data - Updated
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':middleName', $this->middleName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':suffix', $this->suffix, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':address', $this->address, PDO::PARAM_STR | PDO::PARAM_NULL); // Bind address
        $stmt->bindParam(':department', $this->department);
        $stmt->bindParam(':email', $this->email, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':birthday', $this->birthday, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress, PDO::PARAM_STR | PDO::PARAM_NULL);


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

     // Helper to get a single teacher record - Updated
    public function readOne() {
        $query = "SELECT
                    id, teacher_id as teacherId, first_name as firstName, last_name as lastName,
                    middle_name as middleName, suffix, address,
                    department, email, phone, birthday,
                    emergency_contact_name as emergencyContactName,
                    emergency_contact_relationship as emergencyContactRelationship,
                    emergency_contact_phone as emergencyContactPhone,
                    emergency_contact_address as emergencyContactAddress
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
            $this->middleName = $row['middleName'];
            $this->suffix = $row['suffix'];
            $this->address = $row['address']; // Assign address
            $this->department = $row['department'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->birthday = $row['birthday'];
            $this->emergencyContactName = $row['emergencyContactName'];
            $this->emergencyContactRelationship = $row['emergencyContactRelationship'];
            $this->emergencyContactPhone = $row['emergencyContactPhone'];
            $this->emergencyContactAddress = $row['emergencyContactAddress'];

            // Return as array with all expected fields - Updated
             return [
                 "id" => (int)$this->id,
                 "teacherId" => $this->teacherId,
                 "firstName" => $this->firstName,
                 "lastName" => $this->lastName,
                 "middleName" => $this->middleName,
                 "suffix" => $this->suffix,
                 "address" => $this->address, // Include address
                 "department" => $this->department,
                 "email" => $this->email,
                 "phone" => $this->phone,
                 "birthday" => $this->birthday,
                 "emergencyContactName" => $this->emergencyContactName,
                 "emergencyContactRelationship" => $this->emergencyContactRelationship,
                 "emergencyContactPhone" => $this->emergencyContactPhone,
                 "emergencyContactAddress" => $this->emergencyContactAddress,
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
