<?php
// --- api/models/student.php ---
class Student {
    // Connection
    private $conn;
    private $table = 'students'; // Table name in your database

    // Student properties
    public $id;
    public $studentId;
    public $firstName;
    public $lastName;
    public $course;
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
                    first_name as firstName,
                    last_name as lastName,
                    course,
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
        // Generate student ID and initial section
        // This requires fetching the last ID or using AUTO_INCREMENT
        $this->studentId = $this->generateStudentId();
        $this->section = $this->generateSection($this->year);
        $this->passwordHash = $this->generateDefaultPassword($this->lastName);

        // Insert query
        $query = "INSERT INTO " . $this->table . "
                    SET
                        student_id = :studentId,
                        first_name = :firstName,
                        last_name = :lastName,
                        course = :course,
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
        $this->course = htmlspecialchars(strip_tags($this->course));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->year = htmlspecialchars(strip_tags($this->year));
        $this->section = htmlspecialchars(strip_tags($this->section));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->emergencyContactName = htmlspecialchars(strip_tags($this->emergencyContactName));
        $this->emergencyContactRelationship = htmlspecialchars(strip_tags($this->emergencyContactRelationship));
        $this->emergencyContactPhone = htmlspecialchars(strip_tags($this->emergencyContactPhone));
        $this->emergencyContactAddress = htmlspecialchars(strip_tags($this->emergencyContactAddress));

        // Bind data
        $stmt->bindParam(':studentId', $this->studentId);
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':course', $this->course);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':year', $this->year);
        $stmt->bindParam(':section', $this->section);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':phone', $this->phone);
        $stmt->bindParam(':passwordHash', $this->passwordHash);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress);


        // Execute query
        if ($stmt->execute()) {
             $this->id = $this->conn->lastInsertId(); // Get the ID of the newly inserted record
             // Return the created student's data (excluding password hash)
             return array(
                 "id" => $this->id,
                 "studentId" => $this->studentId,
                 "firstName" => $this->firstName,
                 "lastName" => $this->lastName,
                 "course" => $this->course,
                 "status" => $this->status,
                 "year" => $this->year,
                 "section" => $this->section,
                 "email" => $this->email,
                 "phone" => $this->phone,
                 "emergencyContactName" => $this->emergencyContactName,
                 "emergencyContactRelationship" => $this->emergencyContactRelationship,
                 "emergencyContactPhone" => $this->emergencyContactPhone,
                 "emergencyContactAddress" => $this->emergencyContactAddress,
             );
        }
        // Print error if something goes wrong
        // In production, log this error instead of printing
        printf("Error: %s.\n", $stmt->errorInfo()[2]);
        return false;
    }

     // Update student
    public function update() {
        // Update query - Exclude studentId, section, password (handled separately)
        $query = "UPDATE " . $this->table . "
                    SET
                        first_name = :firstName,
                        last_name = :lastName,
                        course = :course,
                        status = :status,
                        year = :year,
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

        // Clean data
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->course = htmlspecialchars(strip_tags($this->course));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->year = htmlspecialchars(strip_tags($this->year));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->emergencyContactName = htmlspecialchars(strip_tags($this->emergencyContactName));
        $this->emergencyContactRelationship = htmlspecialchars(strip_tags($this->emergencyContactRelationship));
        $this->emergencyContactPhone = htmlspecialchars(strip_tags($this->emergencyContactPhone));
        $this->emergencyContactAddress = htmlspecialchars(strip_tags($this->emergencyContactAddress));


        // Bind data
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':course', $this->course);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':year', $this->year);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':phone', $this->phone);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress);

        // Execute query
        if ($stmt->execute()) {
            // Return updated data (fetch it again or construct from input)
            // Fetching ensures consistency
             return $this->readOne(); // Assumes readOne() method exists
        }
        printf("Error: %s.\n", $stmt->errorInfo()[2]);
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
            return true;
        }
        printf("Error: %s.\n", $stmt->errorInfo()[2]);
        return false;
    }

     // Helper to get a single student record (useful after update)
    public function readOne() {
        $query = "SELECT
                    id, student_id as studentId, first_name as firstName, last_name as lastName,
                    course, status, year, section, email, phone,
                    emergency_contact_name as emergencyContactName,
                    emergency_contact_relationship as emergencyContactRelationship,
                    emergency_contact_phone as emergencyContactPhone,
                    emergency_contact_address as emergencyContactAddress
                FROM " . $this->table . "
                WHERE id = :id LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
             // Assign properties from the fetched row
            $this->studentId = $row['studentId'];
            $this->firstName = $row['firstName'];
            $this->lastName = $row['lastName'];
            $this->course = $row['course'];
            $this->status = $row['status'];
            $this->year = $row['year'];
            $this->section = $row['section'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->emergencyContactName = $row['emergencyContactName'];
            $this->emergencyContactRelationship = $row['emergencyContactRelationship'];
            $this->emergencyContactPhone = $row['emergencyContactPhone'];
            $this->emergencyContactAddress = $row['emergencyContactAddress'];
            return (array)$this; // Return as array or specific DTO
        }
        return null;
    }


    // Helper function to generate student ID (e.g., s1001)
    private function generateStudentId() {
        // Get the last inserted ID + 1 (or use AUTO_INCREMENT value directly)
        $query = "SELECT MAX(id) as last_id FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $nextId = ($row && $row['last_id']) ? $row['last_id'] + 1 : 1; // Start from 1 if table is empty
        return 's' . (1000 + $nextId);
    }

    // Helper function to generate section (e.g., 10A, 20B)
    private function generateSection($year) {
         $yearPrefixMap = [
            "1st Year" => "10", "2nd Year" => "20", "3rd Year" => "30", "4th Year" => "40",
        ];
        $prefix = isset($yearPrefixMap[$year]) ? $yearPrefixMap[$year] : "10"; // Default to 10 if year is missing/invalid
        $randomLetter = chr(rand(65, 67)); // Generate A, B, or C randomly
        return $prefix . $randomLetter;
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
             return true;
         }
         printf("Error resetting password: %s.\n", $stmt->errorInfo()[2]);
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
            return true;
        } else {
             error_log("Failed to update password for student ID: " . $studentId);
             throw new Exception("Failed to update password."); // Throw generic error
        }
    }


}
?>

