
<?php
// --- api/models/student.php ---
class Student {
    // Connection
    private $conn;
    private $table = 'students'; // Table name in your database

    // Student properties
    public $id;
    public $studentId; // e.g., 100XXXX (base 100 + 4 random digits)
    public $username; // e.g., s100XXXX
    public $firstName;
    public $lastName;
    public $middleName;
    public $suffix;
    public $gender;
    public $birthday; // (expect YYYY-MM-DD)
    public $course;
    public $status;
    public $year;
    public $section;
    public $email;
    public $phone;
    public $passwordHash;
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
                    lastName ASC, firstName ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Create student
    public function create() {
        // Generate student ID (base 100 + 4 random digits) and username ('s' + full_student_id)
        $this->studentId = $this->generateStudentId();
        $this->username = $this->generateStudentUsername($this->studentId);
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
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->gender = !empty($this->gender) ? htmlspecialchars(strip_tags($this->gender)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->course = htmlspecialchars(strip_tags($this->course));
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
        $stmt->bindParam(':course', $this->course);
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

        $stmt = $this->conn->prepare($query);

        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->gender = !empty($this->gender) ? htmlspecialchars(strip_tags($this->gender)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->course = htmlspecialchars(strip_tags($this->course));
        $this->status = htmlspecialchars(strip_tags($this->status));
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
        $stmt->bindParam(':course', $this->course);
        $stmt->bindParam(':status', $this->status);
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
            $this->studentId = $row['studentId'];
            $this->username = $row['username'];
            $this->firstName = $row['firstName'];
            $this->lastName = $row['lastName'];
            $this->middleName = $row['middleName'];
            $this->suffix = $row['suffix'];
            $this->gender = $row['gender'];
            $this->birthday = $row['birthday'];
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
             ];
        }
        return null;
    }


    private function generateFourRandomDigits(): string {
        return sprintf('%04d', mt_rand(0, 9999));
    }

    // Generates student ID: base "100" + 4 random digits
    private function generateStudentId(): string {
         $baseId = "100";
         return $baseId . $this->generateFourRandomDigits();
    }

    private function generateStudentUsername(string $studentId): string {
         return 's' . $studentId; // studentId is now the full ID like "100XXXX"
    }

     private function generateSection($year) {
         $yearPrefixMap = [
            "1st Year" => "10", "2nd Year" => "20", "3rd Year" => "30", "4th Year" => "40",
         ];
         $prefix = $yearPrefixMap[$year] ?? "10";

          try {
             $query = "SELECT COUNT(*) as count FROM " . $this->table . " WHERE year = :year";
             $stmt = $this->conn->prepare($query);
             $stmt->bindParam(':year', $year);
             $stmt->execute();
             $row = $stmt->fetch(PDO::FETCH_ASSOC);
             $count = $row ? (int)$row['count'] : 0;
             $sectionLetter = chr(65 + ($count % 4));
             return $prefix . $sectionLetter;
         } catch (PDOException $e) {
             error_log("Error generating section: " . $e->getMessage());
             $sectionLetter = chr(65 + (rand(0, 3)));
             return $prefix . $sectionLetter;
         }
    }


     private function generateDefaultPassword($lastName) {
         if (empty($lastName) || strlen($lastName) < 2) {
             $lastName = "user";
         }
         $defaultPassword = strtolower(substr($lastName, 0, 2)) . '1000';
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

    