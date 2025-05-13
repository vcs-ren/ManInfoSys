
<?php
// --- api/models/student.php ---
class Student {
    // Connection
    private $conn;
    private $table = 'students'; // Table name in your database

    // Student properties
    public $id;
    public $studentId; // e.g., 100XXXX
    public $username; // e.g., s100XXXX
    public $firstName;
    public $lastName;
    public $middleName;
    public $suffix;
    public $gender;
    public $birthday; // (expect YYYY-MM-DD)
    public $program; // Renamed from course for consistency
    public $enrollmentType; // Renamed from status
    public $year;
    public $section;
    public $email;
    public $phone;
    public $passwordHash;
    public $emergencyContactName;
    public $emergencyContactRelationship;
    public $emergencyContactPhone;
    public $emergencyContactAddress;
    public $lastAccessed; // Added lastAccessed

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
                    program, 
                    enrollment_type as enrollmentType, 
                    year,
                    section,
                    email,
                    phone,
                    emergency_contact_name as emergencyContactName,
                    emergency_contact_relationship as emergencyContactRelationship,
                    emergency_contact_phone as emergencyContactPhone,
                    emergency_contact_address as emergencyContactAddress,
                    last_accessed as lastAccessed
                  FROM
                    " . $this->table . "
                  ORDER BY
                    lastName ASC, firstName ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Create student
    public function create() {
        $this->studentId = $this->generateStudentId();
        $this->username = $this->generateStudentUsername($this->studentId);
        $this->section = $this->generateSection($this->program, $this->year);
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
                        program = :program, 
                        enrollment_type = :enrollmentType, 
                        year = :year,
                        section = :section,
                        email = :email,
                        phone = :phone,
                        password_hash = :passwordHash,
                        emergency_contact_name = :emergencyContactName,
                        emergency_contact_relationship = :emergencyContactRelationship,
                        emergency_contact_phone = :emergencyContactPhone,
                        emergency_contact_address = :emergencyContactAddress,
                        last_accessed = NULL"; 

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->gender = !empty($this->gender) ? htmlspecialchars(strip_tags($this->gender)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->program = htmlspecialchars(strip_tags($this->program));
        $this->enrollmentType = htmlspecialchars(strip_tags($this->enrollmentType));
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
        $stmt->bindParam(':program', $this->program);
        $stmt->bindParam(':enrollmentType', $this->enrollmentType);
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
             $this->id = $this->conn->lastInsertId();
             return $this->readOne();
        }
        error_log("Student Create Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

    public function update() {
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

        $stmt = $this->conn->prepare($query);

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

        if ($stmt->execute()) {
             return $this->readOne();
        }
        error_log("Student Update Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

    public function adminUpdate() {
        $query = "UPDATE " . $this->table . "
                    SET
                        first_name = :firstName,
                        last_name = :lastName,
                        middle_name = :middleName,
                        suffix = :suffix,
                        gender = :gender,
                        birthday = :birthday,
                        program = :program, 
                        enrollment_type = :enrollmentType, 
                        year = :year,
                        email = :email,
                        phone = :phone,
                        emergency_contact_name = :emergencyContactName,
                        emergency_contact_relationship = :emergencyContactRelationship,
                        emergency_contact_phone = :emergencyContactPhone,
                        emergency_contact_address = :emergencyContactAddress
                    WHERE
                        id = :id";

        $stmt = $this->conn->prepare($query);

        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->gender = !empty($this->gender) ? htmlspecialchars(strip_tags($this->gender)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->program = htmlspecialchars(strip_tags($this->program));
        $this->enrollmentType = htmlspecialchars(strip_tags($this->enrollmentType));
        $this->year = htmlspecialchars(strip_tags($this->year));
        $this->email = !empty($this->email) ? htmlspecialchars(strip_tags($this->email)) : null;
        $this->phone = !empty($this->phone) ? htmlspecialchars(strip_tags($this->phone)) : null;
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->emergencyContactName = !empty($this->emergencyContactName) ? htmlspecialchars(strip_tags($this->emergencyContactName)) : null;
        $this->emergencyContactRelationship = !empty($this->emergencyContactRelationship) ? htmlspecialchars(strip_tags($this->emergencyContactRelationship)) : null;
        $this->emergencyContactPhone = !empty($this->emergencyContactPhone) ? htmlspecialchars(strip_tags($this->emergencyContactPhone)) : null;
        $this->emergencyContactAddress = !empty($this->emergencyContactAddress) ? htmlspecialchars(strip_tags($this->emergencyContactAddress)) : null;

        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':middleName', $this->middleName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':suffix', $this->suffix, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':gender', $this->gender, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':birthday', $this->birthday, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':program', $this->program);
        $stmt->bindParam(':enrollmentType', $this->enrollmentType);
        $stmt->bindParam(':year', $this->year);
        $stmt->bindParam(':email', $this->email, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress, PDO::PARAM_STR | PDO::PARAM_NULL);

        if ($stmt->execute()) {
             return $this->readOne();
        }
        error_log("Student Admin Update Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(':id', $this->id);
        if ($stmt->execute()) {
             return $stmt->rowCount() > 0;
        }
         error_log("Student Delete Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

    public function readOne() {
        $query = "SELECT
                    id, student_id as studentId, username,
                    first_name as firstName, last_name as lastName, middle_name as middleName, suffix, gender, birthday,
                    program, enrollment_type as enrollmentType, year, section, email, phone, 
                    emergency_contact_name as emergencyContactName,
                    emergency_contact_relationship as emergencyContactRelationship,
                    emergency_contact_phone as emergencyContactPhone,
                    emergency_contact_address as emergencyContactAddress,
                    last_accessed as lastAccessed
                FROM " . $this->table . "
                WHERE id = :id LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->studentId = $row['studentId'];
            $this->username = $row['username'];
            $this->firstName = $row['firstName'];
            $this->lastName = $row['lastName'];
            $this->middleName = $row['middleName'];
            $this->suffix = $row['suffix'];
            $this->gender = $row['gender'];
            $this->birthday = $row['birthday'];
            $this->program = $row['program'];
            $this->enrollmentType = $row['enrollmentType'];
            $this->year = $row['year'];
            $this->section = $row['section'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->emergencyContactName = $row['emergencyContactName'];
            $this->emergencyContactRelationship = $row['emergencyContactRelationship'];
            $this->emergencyContactPhone = $row['emergencyContactPhone'];
            $this->emergencyContactAddress = $row['emergencyContactAddress'];
            $this->lastAccessed = $row['lastAccessed'];
             return [
                 "id" => (int)$this->id,
                 "studentId" => $this->studentId,
                 "username" => $this->username,
                 "firstName" => $this->firstName,
                 "lastName" => $this->lastName,
                 "middleName" => $this->middleName,
                 "suffix" => $this->suffix,
                 "gender" => $this->gender,
                 "birthday" => $this->birthday,
                 "program" => $this->program,
                 "enrollmentType" => $this->enrollmentType,
                 "year" => $this->year,
                 "section" => $this->section,
                 "email" => $this->email,
                 "phone" => $this->phone,
                 "emergencyContactName" => $this->emergencyContactName,
                 "emergencyContactRelationship" => $this->emergencyContactRelationship,
                 "emergencyContactPhone" => $this->emergencyContactPhone,
                 "emergencyContactAddress" => $this->emergencyContactAddress,
                 "lastAccessed" => $this->lastAccessed,
             ];
        }
        return null;
    }

    private function generateFourRandomDigits(): string {
        return sprintf('%04d', mt_rand(0, 9999));
    }

    private function generateStudentId(): string {
         $baseId = "100";
         return $baseId . $this->generateFourRandomDigits();
    }

    private function generateStudentUsername(string $studentId): string {
         return 's' . $studentId;
    }

     private function generateSection($programId, $year) {
         $yearPrefixMap = [
            "1st Year" => "1", "2nd Year" => "2", "3rd Year" => "3", "4th Year" => "4",
         ];
         $yearNum = $yearPrefixMap[$year] ?? "1";

          try {
             // Count existing sections for this program and year
             $query = "SELECT COUNT(*) as count FROM sections WHERE program_id = :programId AND year_level = :year";
             $stmt = $this->conn->prepare($query);
             $stmt->bindParam(':programId', $programId);
             $stmt->bindParam(':year', $year);
             $stmt->execute();
             $row = $stmt->fetch(PDO::FETCH_ASSOC);
             $count = $row ? (int)$row['count'] : 0;
             
             $sectionLetter = chr(65 + $count); // A, B, C...
             return strtoupper($programId) . $yearNum . $sectionLetter;
         } catch (PDOException $e) {
             error_log("Error generating section: " . $e->getMessage());
             // Fallback in case of DB error during count
             $sectionLetter = chr(65 + (rand(0, 3)));
             return strtoupper($programId) . $yearNum . $sectionLetter;
         }
    }

    private function generateDefaultPassword($lastName) {
        if (empty($lastName) || strlen($lastName) < 2) {
            $lastName = "User"; // Fallback if lastName is too short
        }
        // New format: @ + first 2 letters of lastname (capitalized) + 1001
        $defaultPassword = '@' . strtoupper(substr($lastName, 0, 2)) . '1001';
        return password_hash($defaultPassword, PASSWORD_DEFAULT);
    }

    public function resetPassword($userId, $lastName) {
         $newPasswordHash = $this->generateDefaultPassword($lastName);
         $query = "UPDATE " . $this->table . " SET password_hash = :passwordHash WHERE id = :userId";
         $stmt = $this->conn->prepare($query);

         $stmt->bindParam(':passwordHash', $newPasswordHash);
         $stmt->bindParam(':userId', $userId);

         if ($stmt->execute()) {
             return $stmt->rowCount() > 0;
         }
          error_log("Student Reset Password Error: " . implode(" | ", $stmt->errorInfo()));
         return false;
    }

    public function changePassword($studentId, $currentPassword, $newPassword) {
        $query = "SELECT password_hash FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $studentId);
        $stmt->execute();
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$student || !password_verify($currentPassword, $student['password_hash'])) {
             throw new Exception("Incorrect current password.");
        }
        
        // Validate new password strength (basic validation, enhance as needed)
        if (strlen($newPassword) < 7) {
            throw new Exception("New password must be at least 7 characters long.");
        }
        if (!preg_match('/[a-zA-Z]/', $newPassword)) {
            throw new Exception("New password must contain at least one letter.");
        }
        if (!preg_match('/[0-9]/', $newPassword)) {
            throw new Exception("New password must contain at least one number.");
        }
        if (!preg_match('/[@#&?*]/', $newPassword)) {
            throw new Exception("New password must contain at least one symbol (@, #, &, ?, *).");
        }


        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

        $updateQuery = "UPDATE " . $this->table . " SET password_hash = :newPasswordHash WHERE id = :id";
        $updateStmt = $this->conn->prepare($updateQuery);
        $updateStmt->bindParam(':newPasswordHash', $newPasswordHash);
        $updateStmt->bindParam(':id', $studentId);

        if ($updateStmt->execute()) {
             return $updateStmt->rowCount() > 0;
        } else {
             error_log("Failed to update password for student ID: " . $studentId . " Error: " . implode(" | ", $updateStmt->errorInfo()));
             throw new Exception("Failed to update password.");
        }
    }
}
?>
```