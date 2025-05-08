
<?php
// --- api/models/student.php ---
class Student {
    // Connection
    private $conn;
    private $table = 'students'; // Table name in your database

    // Student properties
    public $id;
    public $studentId; // e.g., 101, 102
    public $username; // e.g., s101, s102
    public $firstName;
    public $lastName;
    public $middleName; // Added
    public $suffix; // Added
    public $gender; // Added
    public $birthday; // Added (expect YYYY-MM-DD)
    public $course; // Keep backend key as 'course'
    public $status;
    public $year;
    public $section;
    public $email;
    public $phone;
    public $passwordHash; // Store hashed password
    public $emergencyContactName;
    public $emergencyContactRelationship;
    public $emergencyContactPhone;
    public $emergencyContactAddress;

    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }

    // Read all students
    public function read() {
        $query = "SELECT
                    id,
                    student_id as studentId,
                    username,
                    first_name as firstName,
                    last_name as lastName,
                    middle_name as middleName,
                    suffix,
                    gender,
                    birthday,
                    course, -- Keep backend key
                    status,
                    year,
                    section,
                    email,
                    phone,
                    emergency_contact_name as emergencyContactName,
                    emergency_contact_relationship as emergencyContactRelationship,
                    emergency_contact_phone as emergencyContactPhone,
                    emergency_contact_address as emergencyContactAddress
                  FROM
                    " . $this->table . "
                  ORDER BY
                    lastName ASC, firstName ASC"; // Example ordering

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Create student
    public function create() {
        // Generate student ID (100 + next DB ID) and username ('s' + studentId)
        $nextDbId = $this->getNextAutoIncrement();
        $this->studentId = $this->generateStudentId($nextDbId); // Use helper
        $this->username = $this->generateStudentUsername($this->studentId); // Use helper
        $this->section = $this->generateSection($this->year);
        $this->passwordHash = $this->generateDefaultPassword($this->lastName);

        // Insert query including username
        $query = "INSERT INTO " . $this->table . "
                    SET
                        student_id = :studentId,
                        username = :username,
                        first_name = :firstName,
                        last_name = :lastName,
                        middle_name = :middleName,
                        suffix = :suffix,
                        gender = :gender,
                        birthday = :birthday,
                        course = :course, -- Keep backend key
                        status = :status,
                        year = :year,
                        section = :section,
                        email = :email,
                        phone = :phone,
                        password_hash = :passwordHash,
                        emergency_contact_name = :emergencyContactName,
                        emergency_contact_relationship = :emergencyContactRelationship,
                        emergency_contact_phone = :emergencyContactPhone,
                        emergency_contact_address = :emergencyContactAddress";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->gender = !empty($this->gender) ? htmlspecialchars(strip_tags($this->gender)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->course = htmlspecialchars(strip_tags($this->course)); // Keep backend key
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->year = htmlspecialchars(strip_tags($this->year));
        $this->section = htmlspecialchars(strip_tags($this->section));
        $this->email = !empty($this->email) ? htmlspecialchars(strip_tags($this->email)) : null;
        $this->phone = !empty($this->phone) ? htmlspecialchars(strip_tags($this->phone)) : null;
        $this->emergencyContactName = !empty($this->emergencyContactName) ? htmlspecialchars(strip_tags($this->emergencyContactName)) : null;
        $this->emergencyContactRelationship = !empty($this->emergencyContactRelationship) ? htmlspecialchars(strip_tags($this->emergencyContactRelationship)) : null;
        $this->emergencyContactPhone = !empty($this->emergencyContactPhone) ? htmlspecialchars(strip_tags($this->emergencyContactPhone)) : null;
        $this->emergencyContactAddress = !empty($this->emergencyContactAddress) ? htmlspecialchars(strip_tags($this->emergencyContactAddress)) : null;

        // Bind data
        $stmt->bindParam(':studentId', $this->studentId);
        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':middleName', $this->middleName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':suffix', $this->suffix, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':gender', $this->gender, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':birthday', $this->birthday, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':course', $this->course); // Keep backend key
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':year', $this->year);
        $stmt->bindParam(':section', $this->section);
        $stmt->bindParam(':email', $this->email, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':passwordHash', $this->passwordHash);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress, PDO::PARAM_STR | PDO::PARAM_NULL);


        // Execute query
        if ($stmt->execute()) {
             $this->id = $this->conn->lastInsertId(); // Get the actual ID
             // Fetch the complete record to return accurate data
             return $this->readOne();
        }
        // Log error if something goes wrong
        error_log("Student Create Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

     // Update student - Modified to only update profile-editable fields
    public function update() {
        // Update query - ONLY include fields editable by student profile or admin student management
        $query = "UPDATE " . $this->table . "
                    SET
                        first_name = :firstName,
                        last_name = :lastName,
                        middle_name = :middleName,
                        suffix = :suffix,
                        gender = :gender,
                        birthday = :birthday,
                        email = :email,
                        phone = :phone,
                        emergency_contact_name = :emergencyContactName,
                        emergency_contact_relationship = :emergencyContactRelationship,
                        emergency_contact_phone = :emergencyContactPhone,
                        emergency_contact_address = :emergencyContactAddress
                    WHERE
                        id = :id";
         // Note: Admin update endpoint (/api/students/update.php) should use a different query
         // if it needs to update course, status, year.

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->gender = !empty($this->gender) ? htmlspecialchars(strip_tags($this->gender)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->email = !empty($this->email) ? htmlspecialchars(strip_tags($this->email)) : null;
        $this->phone = !empty($this->phone) ? htmlspecialchars(strip_tags($this->phone)) : null;
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->emergencyContactName = !empty($this->emergencyContactName) ? htmlspecialchars(strip_tags($this->emergencyContactName)) : null;
        $this->emergencyContactRelationship = !empty($this->emergencyContactRelationship) ? htmlspecialchars(strip_tags($this->emergencyContactRelationship)) : null;
        $this->emergencyContactPhone = !empty($this->emergencyContactPhone) ? htmlspecialchars(strip_tags($this->emergencyContactPhone)) : null;
        $this->emergencyContactAddress = !empty($this->emergencyContactAddress) ? htmlspecialchars(strip_tags($this->emergencyContactAddress)) : null;


        // Bind data
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':middleName', $this->middleName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':suffix', $this->suffix, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':gender', $this->gender, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':birthday', $this->birthday, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':email', $this->email, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress, PDO::PARAM_STR | PDO::PARAM_NULL);

        // Execute query
        if ($stmt->execute()) {
            // Return updated data (fetch it again or construct from input)
            // Fetching ensures consistency
             return $this->readOne(); // Assumes readOne() method exists and fetches all needed fields
        }
        error_log("Student Update Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

     // Update method specifically for admin student management (updates all fields)
    public function adminUpdate() {
        // Update query - Includes course, status, year, etc.
        $query = "UPDATE " . $this->table . "
                    SET
                        first_name = :firstName,
                        last_name = :lastName,
                        middle_name = :middleName,
                        suffix = :suffix,
                        gender = :gender,
                        birthday = :birthday,
                        course = :course, -- Keep backend key
                        status = :status,
                        year = :year,
                        -- Section is not updated here, usually derived or managed separately
                        email = :email,
                        phone = :phone,
                        emergency_contact_name = :emergencyContactName,
                        emergency_contact_relationship = :emergencyContactRelationship,
                        emergency_contact_phone = :emergencyContactPhone,
                        emergency_contact_address = :emergencyContactAddress
                    WHERE
                        id = :id";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data (ensure all properties are set before calling)
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->gender = !empty($this->gender) ? htmlspecialchars(strip_tags($this->gender)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->course = htmlspecialchars(strip_tags($this->course)); // Keep backend key
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->year = htmlspecialchars(strip_tags($this->year));
        $this->email = !empty($this->email) ? htmlspecialchars(strip_tags($this->email)) : null;
        $this->phone = !empty($this->phone) ? htmlspecialchars(strip_tags($this->phone)) : null;
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->emergencyContactName = !empty($this->emergencyContactName) ? htmlspecialchars(strip_tags($this->emergencyContactName)) : null;
        $this->emergencyContactRelationship = !empty($this->emergencyContactRelationship) ? htmlspecialchars(strip_tags($this->emergencyContactRelationship)) : null;
        $this->emergencyContactPhone = !empty($this->emergencyContactPhone) ? htmlspecialchars(strip_tags($this->emergencyContactPhone)) : null;
        $this->emergencyContactAddress = !empty($this->emergencyContactAddress) ? htmlspecialchars(strip_tags($this->emergencyContactAddress)) : null;

        // Bind data
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':middleName', $this->middleName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':suffix', $this->suffix, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':gender', $this->gender, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':birthday', $this->birthday, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':course', $this->course); // Keep backend key
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':year', $this->year);
        $stmt->bindParam(':email', $this->email, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress, PDO::PARAM_STR | PDO::PARAM_NULL);


        // Execute query
        if ($stmt->execute()) {
             return $this->readOne(); // Return the updated record
        }
        error_log("Student Admin Update Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

    // Delete student
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
         error_log("Student Delete Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

     // Helper to get a single student record (useful after update or for profile view)
    public function readOne() {
        $query = "SELECT
                    id, student_id as studentId, username,
                    first_name as firstName, last_name as lastName, middle_name as middleName, suffix, gender, birthday,
                    course, status, year, section, email, phone, -- Keep course backend key
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
             // Assign properties from the fetched row
            $this->studentId = $row['studentId'];
            $this->username = $row['username'];
            $this->firstName = $row['firstName'];
            $this->lastName = $row['lastName'];
            $this->middleName = $row['middleName'];
            $this->suffix = $row['suffix'];
            $this->gender = $row['gender'];
            $this->birthday = $row['birthday'];
            $this->course = $row['course']; // Keep backend key
            $this->status = $row['status'];
            $this->year = $row['year'];
            $this->section = $row['section'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->emergencyContactName = $row['emergencyContactName'];
            $this->emergencyContactRelationship = $row['emergencyContactRelationship'];
            $this->emergencyContactPhone = $row['emergencyContactPhone'];
            $this->emergencyContactAddress = $row['emergencyContactAddress'];
             // Return as an array, ensuring all expected fields are present
             return [
                 "id" => (int)$this->id,
                 "studentId" => $this->studentId, // e.g., 101
                 "username" => $this->username, // e.g., s101
                 "firstName" => $this->firstName,
                 "lastName" => $this->lastName,
                 "middleName" => $this->middleName,
                 "suffix" => $this->suffix,
                 "gender" => $this->gender,
                 "birthday" => $this->birthday,
                 "course" => $this->course, // Keep backend key
                 "status" => $this->status,
                 "year" => $this->year,
                 "section" => $this->section,
                 "email" => $this->email,
                 "phone" => $this->phone,
                 "emergencyContactName" => $this->emergencyContactName,
                 "emergencyContactRelationship" => $this->emergencyContactRelationship,
                 "emergencyContactPhone" => $this->emergencyContactPhone,
                 "emergencyContactAddress" => $this->emergencyContactAddress,
             ];
        }
        return null;
    }


     // Helper function to get the next expected AUTO_INCREMENT value
    private function getNextAutoIncrement() {
        try {
            $query = "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = :dbName AND TABLE_NAME = :tableName";
            $stmt = $this->conn->prepare($query);
            // Bind the database name (get it from the config or hardcode if needed)
            $dbName = 'campus_connect_db'; // Replace if your DB name is different
            $stmt->bindParam(':dbName', $dbName);
            $stmt->bindParam(':tableName', $this->table);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $nextId = ($row && $row['AUTO_INCREMENT']) ? $row['AUTO_INCREMENT'] : 1; // Start from 1 if table is empty

            // Fallback using MAX(id) if AUTO_INCREMENT fails or is 0
            if (!$nextId || $nextId <= 0) {
                $maxIdQuery = "SELECT MAX(id) as last_id FROM " . $this->table;
                $maxStmt = $this->conn->prepare($maxIdQuery);
                $maxStmt->execute();
                $maxRow = $maxStmt->fetch(PDO::FETCH_ASSOC);
                $nextId = ($maxRow && $maxRow['last_id']) ? $maxRow['last_id'] + 1 : 1;
            }
             return (int)$nextId;
        } catch (PDOException $e) {
             error_log("Error getting next auto increment: " . $e->getMessage());
             // Fallback to simple MAX(id) + 1 in case of error
             $maxIdQuery = "SELECT MAX(id) as last_id FROM " . $this->table;
             $maxStmt = $this->conn->prepare($maxIdQuery);
             $maxStmt->execute();
             $maxRow = $maxStmt->fetch(PDO::FETCH_ASSOC);
             return ($maxRow && $maxRow['last_id']) ? (int)$maxRow['last_id'] + 1 : 1;
        }
    }

    // Helper function to generate student ID string (e.g., "101")
    private function generateStudentId(int $dbId): string {
         return (string)(100 + $dbId);
    }

    // Helper function to generate student username string (e.g., "s101")
    private function generateStudentUsername(string $studentId): string {
         return 's' . $studentId;
    }


    // Helper function to generate section (e.g., 10A, 20B)
     private function generateSection($year) {
         $yearPrefixMap = [
            "1st Year" => "10", "2nd Year" => "20", "3rd Year" => "30", "4th Year" => "40",
         ];
         $prefix = $yearPrefixMap[$year] ?? "10"; // Default to 10 if year is invalid/missing

         // Simple logic for mock: Cycle A, B, C... based on existing sections for the year
          try {
             $query = "SELECT COUNT(*) as count FROM " . $this->table . " WHERE year = :year";
             $stmt = $this->conn->prepare($query);
             $stmt->bindParam(':year', $year);
             $stmt->execute();
             $row = $stmt->fetch(PDO::FETCH_ASSOC);
             $count = $row ? (int)$row['count'] : 0;
             $sectionLetter = chr(65 + ($count % 4)); // Cycle through A, B, C, D for example
             return $prefix . $sectionLetter;
         } catch (PDOException $e) {
             error_log("Error generating section: " . $e->getMessage());
             // Fallback to a random letter if query fails
             $sectionLetter = chr(65 + (rand(0, 3)));
             return $prefix . $sectionLetter;
         }
    }


    // Helper function to generate default password hash
     private function generateDefaultPassword($lastName) {
         if (empty($lastName) || strlen($lastName) < 2) {
             $lastName = "user"; // Fallback last name if too short or empty
         }
         $defaultPassword = strtolower(substr($lastName, 0, 2)) . '1000';
         // IMPORTANT: Use a strong hashing algorithm like Argon2 or bcrypt
         return password_hash($defaultPassword, PASSWORD_DEFAULT); // Use default PHP hashing (currently bcrypt)
    }

    // Method to reset password for a given user ID
    public function resetPassword($userId, $lastName) {
         $newPasswordHash = $this->generateDefaultPassword($lastName);
         $query = "UPDATE " . $this->table . " SET password_hash = :passwordHash WHERE id = :userId";
         $stmt = $this->conn->prepare($query);

         $stmt->bindParam(':passwordHash', $newPasswordHash);
         $stmt->bindParam(':userId', $userId);

         if ($stmt->execute()) {
             return $stmt->rowCount() > 0; // Check if the row was actually updated
         }
          error_log("Student Reset Password Error: " . implode(" | ", $stmt->errorInfo()));
         return false;
    }

      // Method for a student to change their own password
    public function changePassword($studentId, $currentPassword, $newPassword) {
        // 1. Verify the current password
        $query = "SELECT password_hash FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $studentId);
        $stmt->execute();
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$student || !password_verify($currentPassword, $student['password_hash'])) {
            // Current password incorrect or student not found
             throw new Exception("Incorrect current password."); // Throw exception for specific error handling
        }

        // 2. Hash the new password
        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

        // 3. Update the password in the database
        $updateQuery = "UPDATE " . $this->table . " SET password_hash = :newPasswordHash WHERE id = :id";
        $updateStmt = $this->conn->prepare($updateQuery);
        $updateStmt->bindParam(':newPasswordHash', $newPasswordHash);
        $updateStmt->bindParam(':id', $studentId);

        if ($updateStmt->execute()) {
             return $updateStmt->rowCount() > 0;
        } else {
             error_log("Failed to update password for student ID: " . $studentId . " Error: " . implode(" | ", $updateStmt->errorInfo()));
             throw new Exception("Failed to update password."); // Throw generic error
        }
    }


}
?>

    