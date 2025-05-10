<?php
// --- api/models/teacher.php ---
class Teacher {
    // Connection
    private $conn;
    private $table = 'teachers'; // Table name in your database

    // Teacher properties
    public $id;
    public $teacherId; // e.g., 1000YYYY (base 1000 + 4 random digits)
    public $username; // e.g., t1000YYYY or a1000ZZZZ
    public $firstName;
    public $lastName;
    public $middleName;
    public $suffix;
    public $address;
    public $department;
    public $email;
    public $phone;
    public $birthday; // (expect YYYY-MM-DD)
    public $passwordHash;
    public $emergencyContactName;
    public $emergencyContactRelationship;
    public $emergencyContactPhone;
    public $emergencyContactAddress;
    public $employmentType; // Added

    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT
                    id,
                    teacher_id as teacherId,
                    username, -- Added username
                    first_name as firstName,
                    last_name as lastName,
                    middle_name as middleName,
                    suffix,
                    address,
                    department,
                    email,
                    phone,
                    birthday,
                    employment_type as employmentType, -- Added employmentType
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

    public function create() {
        $this->teacherId = $this->generateTeacherId();
        $this->username = $this->generateUsername($this->teacherId, $this->department);
        $this->passwordHash = $this->generateDefaultPassword($this->lastName);

        $query = "INSERT INTO " . $this->table . "
                    SET
                        teacher_id = :teacherId,
                        username = :username, -- Added username
                        first_name = :firstName,
                        last_name = :lastName,
                        middle_name = :middleName,
                        suffix = :suffix,
                        address = :address,
                        department = :department,
                        email = :email,
                        phone = :phone,
                        birthday = :birthday,
                        employment_type = :employmentType, -- Added employmentType
                        password_hash = :passwordHash,
                        emergency_contact_name = :emergencyContactName,
                        emergency_contact_relationship = :emergencyContactRelationship,
                        emergency_contact_phone = :emergencyContactPhone,
                        emergency_contact_address = :emergencyContactAddress";

        $stmt = $this->conn->prepare($query);

        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->address = !empty($this->address) ? htmlspecialchars(strip_tags($this->address)) : null;
        $this->department = htmlspecialchars(strip_tags($this->department));
        $this->email = !empty($this->email) ? htmlspecialchars(strip_tags($this->email)) : null;
        $this->phone = !empty($this->phone) ? htmlspecialchars(strip_tags($this->phone)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->employmentType = !empty($this->employmentType) ? htmlspecialchars(strip_tags($this->employmentType)) : null;
        $this->emergencyContactName = !empty($this->emergencyContactName) ? htmlspecialchars(strip_tags($this->emergencyContactName)) : null;
        $this->emergencyContactRelationship = !empty($this->emergencyContactRelationship) ? htmlspecialchars(strip_tags($this->emergencyContactRelationship)) : null;
        $this->emergencyContactPhone = !empty($this->emergencyContactPhone) ? htmlspecialchars(strip_tags($this->emergencyContactPhone)) : null;
        $this->emergencyContactAddress = !empty($this->emergencyContactAddress) ? htmlspecialchars(strip_tags($this->emergencyContactAddress)) : null;


        $stmt->bindParam(':teacherId', $this->teacherId);
        $stmt->bindParam(':username', $this->username); // Bind username
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':middleName', $this->middleName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':suffix', $this->suffix, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':address', $this->address, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':department', $this->department);
        $stmt->bindParam(':email', $this->email, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':birthday', $this->birthday, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':employmentType', $this->employmentType, PDO::PARAM_STR | PDO::PARAM_NULL); // Bind employmentType
        $stmt->bindParam(':passwordHash', $this->passwordHash);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress, PDO::PARAM_STR | PDO::PARAM_NULL);


        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
             return $this->readOne();
        }
        error_log("Teacher Create Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

    public function update() {
        // This method is for when a teacher updates their own profile.
        // Admin updates (changing department, etc.) should use adminUpdate.
        $query = "UPDATE " . $this->table . " SET
                    first_name = :firstName,
                    last_name = :lastName,
                    middle_name = :middleName,
                    suffix = :suffix,
                    birthday = :birthday,
                    address = :address,
                    email = :email,
                    phone = :phone,
                    emergency_contact_name = :emergencyContactName,
                    emergency_contact_relationship = :emergencyContactRelationship,
                    emergency_contact_phone = :emergencyContactPhone,
                    emergency_contact_address = :emergencyContactAddress
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        // Sanitize inputs
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->address = !empty($this->address) ? htmlspecialchars(strip_tags($this->address)) : null;
        $this->email = !empty($this->email) ? htmlspecialchars(strip_tags($this->email)) : null;
        $this->phone = !empty($this->phone) ? htmlspecialchars(strip_tags($this->phone)) : null;
        $this->emergencyContactName = !empty($this->emergencyContactName) ? htmlspecialchars(strip_tags($this->emergencyContactName)) : null;
        $this->emergencyContactRelationship = !empty($this->emergencyContactRelationship) ? htmlspecialchars(strip_tags($this->emergencyContactRelationship)) : null;
        $this->emergencyContactPhone = !empty($this->emergencyContactPhone) ? htmlspecialchars(strip_tags($this->emergencyContactPhone)) : null;
        $this->emergencyContactAddress = !empty($this->emergencyContactAddress) ? htmlspecialchars(strip_tags($this->emergencyContactAddress)) : null;


        // Bind parameters
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':middleName', $this->middleName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':suffix', $this->suffix, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':birthday', $this->birthday, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':address', $this->address, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':email', $this->email, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress, PDO::PARAM_STR | PDO::PARAM_NULL);


        if ($stmt->execute()) {
            return $this->readOne(); // Return updated data
        }
        error_log("Teacher Profile Update Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

    public function adminUpdate() {
        // This method is for admins updating faculty records.
        $query = "UPDATE " . $this->table . " SET
                    first_name = :firstName,
                    last_name = :lastName,
                    middle_name = :middleName,
                    suffix = :suffix,
                    birthday = :birthday,
                    address = :address,
                    department = :department, -- Admin can change department
                    employment_type = :employmentType, -- Admin can change employment type
                    email = :email,
                    phone = :phone,
                    emergency_contact_name = :emergencyContactName,
                    emergency_contact_relationship = :emergencyContactRelationship,
                    emergency_contact_phone = :emergencyContactPhone,
                    emergency_contact_address = :emergencyContactAddress
                  WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        // Sanitize inputs
        $this->firstName = htmlspecialchars(strip_tags($this->firstName));
        $this->lastName = htmlspecialchars(strip_tags($this->lastName));
        $this->middleName = !empty($this->middleName) ? htmlspecialchars(strip_tags($this->middleName)) : null;
        $this->suffix = !empty($this->suffix) ? htmlspecialchars(strip_tags($this->suffix)) : null;
        $this->birthday = !empty($this->birthday) ? htmlspecialchars(strip_tags($this->birthday)) : null;
        $this->address = !empty($this->address) ? htmlspecialchars(strip_tags($this->address)) : null;
        $this->department = htmlspecialchars(strip_tags($this->department));
        $this->employmentType = htmlspecialchars(strip_tags($this->employmentType));
        $this->email = !empty($this->email) ? htmlspecialchars(strip_tags($this->email)) : null;
        $this->phone = !empty($this->phone) ? htmlspecialchars(strip_tags($this->phone)) : null;
        $this->emergencyContactName = !empty($this->emergencyContactName) ? htmlspecialchars(strip_tags($this->emergencyContactName)) : null;
        $this->emergencyContactRelationship = !empty($this->emergencyContactRelationship) ? htmlspecialchars(strip_tags($this->emergencyContactRelationship)) : null;
        $this->emergencyContactPhone = !empty($this->emergencyContactPhone) ? htmlspecialchars(strip_tags($this->emergencyContactPhone)) : null;
        $this->emergencyContactAddress = !empty($this->emergencyContactAddress) ? htmlspecialchars(strip_tags($this->emergencyContactAddress)) : null;

        // Bind parameters
        $stmt->bindParam(':firstName', $this->firstName);
        $stmt->bindParam(':lastName', $this->lastName);
        $stmt->bindParam(':middleName', $this->middleName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':suffix', $this->suffix, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':birthday', $this->birthday, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':address', $this->address, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':department', $this->department);
        $stmt->bindParam(':employmentType', $this->employmentType);
        $stmt->bindParam(':email', $this->email, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':phone', $this->phone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':emergencyContactName', $this->emergencyContactName, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactRelationship', $this->emergencyContactRelationship, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactPhone', $this->emergencyContactPhone, PDO::PARAM_STR | PDO::PARAM_NULL);
        $stmt->bindParam(':emergencyContactAddress', $this->emergencyContactAddress, PDO::PARAM_STR | PDO::PARAM_NULL);

        if ($stmt->execute()) {
            return $this->readOne(); // Return updated data
        }
        error_log("Faculty Admin Update Error: " . implode(" | ", $stmt->errorInfo()));
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
        error_log("Teacher Delete Error: " . implode(" | ", $stmt->errorInfo()));
        return false;
    }

     public function readOne() {
        // Fetches a single teacher's record by ID
        $query = "SELECT id, teacher_id as teacherId, username, first_name as firstName, last_name as lastName,
                         middle_name as middleName, suffix, address, department, email, phone, birthday, employment_type as employmentType,
                         emergency_contact_name as emergencyContactName, emergency_contact_relationship as emergencyContactRelationship,
                         emergency_contact_phone as emergencyContactPhone, emergency_contact_address as emergencyContactAddress
                  FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Assign properties from the fetched row
            $this->teacherId = $row['teacherId'];
            $this->username = $row['username'];
            $this->firstName = $row['firstName'];
            $this->lastName = $row['lastName'];
            $this->middleName = $row['middleName'];
            $this->suffix = $row['suffix'];
            $this->address = $row['address'];
            $this->department = $row['department'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->birthday = $row['birthday'];
            $this->employmentType = $row['employmentType'];
            $this->emergencyContactName = $row['emergencyContactName'];
            $this->emergencyContactRelationship = $row['emergencyContactRelationship'];
            $this->emergencyContactPhone = $row['emergencyContactPhone'];
            $this->emergencyContactAddress = $row['emergencyContactAddress'];
            // Return as an array, ensuring all expected fields are present
            return [
                "id" => (int)$this->id,
                "teacherId" => $this->teacherId,
                "username" => $this->username,
                "firstName" => $this->firstName,
                "lastName" => $this->lastName,
                "middleName" => $this->middleName,
                "suffix" => $this->suffix,
                "address" => $this->address,
                "department" => $this->department,
                "email" => $this->email,
                "phone" => $this->phone,
                "birthday" => $this->birthday,
                "employmentType" => $this->employmentType,
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

    // Generates faculty ID: base "1000" + 4 random digits
    private function generateTeacherId(): string {
        $baseId = "1000";
        return $baseId . $this->generateFourRandomDigits();
    }

    private function generateUsername(string $teacherId, string $department): string {
        $prefix = (strtolower($department) === 'teaching') ? 't' : 'a';
        return $prefix . $teacherId; // teacherId is now the full ID like "1000YYYY"
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
         error_log("Teacher Reset Password Error: " . implode(" | ", $stmt->errorInfo()));
         return false;
    }

    public function changePassword($teacherId, $currentPassword, $newPassword) {
        $query = "SELECT password_hash FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $teacherId);
        $stmt->execute();
        $teacher = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$teacher || !password_verify($currentPassword, $teacher['password_hash'])) {
            throw new Exception("Incorrect current password.");
        }

        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

        $updateQuery = "UPDATE " . $this->table . " SET password_hash = :newPasswordHash WHERE id = :id";
        $updateStmt = $this->conn->prepare($updateQuery);
        $updateStmt->bindParam(':newPasswordHash', $newPasswordHash);
        $updateStmt->bindParam(':id', $teacherId);

        if ($updateStmt->execute()) {
             return $updateStmt->rowCount() > 0;
        } else {
            error_log("Failed to update password for teacher ID: " . $teacherId . " Error: " . implode(" | ", $updateStmt->errorInfo()));
            throw new Exception("Failed to update password.");
        }
    }
}
?>

