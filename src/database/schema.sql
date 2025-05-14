
-- Main Tables

CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) DEFAULT NULL,
  `last_name` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(255) UNIQUE DEFAULT NULL,
  `role` ENUM('Super Admin', 'Sub Admin') NOT NULL DEFAULT 'Sub Admin',
  `is_super_admin` BOOLEAN DEFAULT FALSE, -- Redundant if role is 'Super Admin', but kept for initial logic
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `programs` (
  `id` VARCHAR(50) PRIMARY KEY, -- e.g., CS, IT, BSED-ENG
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `courses` ( -- Represents Subjects
  `id` VARCHAR(50) PRIMARY KEY, -- e.g., CS101, MATH202
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `type` ENUM('Major', 'Minor') NOT NULL DEFAULT 'Minor',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Linking table for Major courses to their specific programs
CREATE TABLE IF NOT EXISTS `course_program_assignments` (
    `course_id` VARCHAR(50) NOT NULL,
    `program_id` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`course_id`, `program_id`),
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `program_courses` ( -- Curriculum: which courses are in which year of a program
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `program_id` VARCHAR(50) NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  `year_level` ENUM('1st Year', '2nd Year', '3rd Year', '4th Year') NOT NULL,
  UNIQUE KEY `unique_program_course_year` (`program_id`, `course_id`, `year_level`),
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `teachers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_id` VARCHAR(50) NOT NULL UNIQUE, -- e.g., 10001234
  `username` VARCHAR(50) NOT NULL UNIQUE, -- e.g., t10001234 or a10001234
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `middle_name` VARCHAR(100) DEFAULT NULL,
  `suffix` VARCHAR(50) DEFAULT NULL,
  `gender` ENUM('Male', 'Female', 'Other') DEFAULT NULL,
  `birthday` DATE DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `department` ENUM('Teaching', 'Administrative') NOT NULL,
  `employment_type` ENUM('Regular', 'Part Time') NOT NULL,
  `email` VARCHAR(255) UNIQUE DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `emergency_contact_name` VARCHAR(255) DEFAULT NULL,
  `emergency_contact_relationship` VARCHAR(100) DEFAULT NULL,
  `emergency_contact_phone` VARCHAR(50) DEFAULT NULL,
  `emergency_contact_address` TEXT DEFAULT NULL,
  `last_accessed` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sections` (
  `id` VARCHAR(50) PRIMARY KEY, -- Auto-generated section code, e.g., CS1A
  `section_code` VARCHAR(50) NOT NULL UNIQUE, -- Should be same as id
  `program_id` VARCHAR(50) NOT NULL,
  `year_level` ENUM('1st Year', '2nd Year', '3rd Year', '4th Year') NOT NULL,
  `adviser_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`adviser_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL UNIQUE, -- e.g., 1001234
  `username` VARCHAR(50) NOT NULL UNIQUE, -- e.g., s1001234
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `middle_name` VARCHAR(100) DEFAULT NULL,
  `suffix` VARCHAR(50) DEFAULT NULL,
  `gender` ENUM('Male', 'Female', 'Other') DEFAULT NULL,
  `birthday` DATE DEFAULT NULL,
  `program` VARCHAR(50) NOT NULL, -- FK to programs.id
  `enrollment_type` ENUM('New', 'Transferee', 'Returnee', 'Continuing') NOT NULL,
  `year` ENUM('1st Year', '2nd Year', '3rd Year', '4th Year') NOT NULL,
  `section` VARCHAR(50) DEFAULT NULL, -- FK to sections.id
  `email` VARCHAR(255) UNIQUE DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `emergency_contact_name` VARCHAR(255) DEFAULT NULL,
  `emergency_contact_relationship` VARCHAR(100) DEFAULT NULL,
  `emergency_contact_phone` VARCHAR(50) DEFAULT NULL,
  `emergency_contact_address` TEXT DEFAULT NULL,
  `last_accessed` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`program`) REFERENCES `programs`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`section`) REFERENCES `sections`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `section_subject_assignments` (
  `id` VARCHAR(100) PRIMARY KEY, -- e.g., CS1A-CS101 (section_id + subject_id)
  `section_id` VARCHAR(50) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL, -- This is the course_id from 'courses' table
  `teacher_id` INT DEFAULT NULL, -- Can be NULL if no teacher assigned yet
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_section_subject` (`section_id`, `subject_id`),
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `author_id` INT DEFAULT NULL, -- Can be admin (null or specific admin id) or teacher id
  `author_type` ENUM('Admin', 'Teacher', 'System') NOT NULL,
  `target_program` VARCHAR(50) DEFAULT NULL, -- Program ID or NULL for 'all'
  `target_year_level` ENUM('1st Year', '2nd Year', '3rd Year', '4th Year', 'all') DEFAULT 'all',
  `target_section` VARCHAR(50) DEFAULT NULL, -- Section ID or NULL for 'all'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`author_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL -- if author_type is Teacher
  -- If author_type is Admin and you have multiple admins, you might link to admins table too.
  -- For simplicity, if author_type is Admin and author_id is NULL, it means system-wide admin announcement.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `grades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `assignment_id` VARCHAR(100) NULL, -- Link to the specific class instance (section_subject_assignment)
  `term` ENUM('Prelim', 'Midterm', 'Final') NOT NULL,
  `grade` DECIMAL(5,2) DEFAULT NULL,
  `remarks` TEXT DEFAULT NULL,
  `submitted_by_teacher_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_grade_entry` (`student_id`, `subject_id`, `assignment_id`, `term`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assignment_id`) REFERENCES `section_subject_assignments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`submitted_by_teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- New Tables

CREATE TABLE IF NOT EXISTS `activity_log` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `user_identifier` VARCHAR(255) NOT NULL, -- Username, 'System', etc.
  `user_role` VARCHAR(50) DEFAULT NULL, -- Admin, Teacher, Student
  `action` VARCHAR(255) NOT NULL, -- e.g., "Added Student", "Login"
  `description` TEXT DEFAULT NULL,
  `target_id` VARCHAR(100) DEFAULT NULL, -- ID of the entity affected
  `target_type` VARCHAR(50) DEFAULT NULL, -- e.g., 'student', 'faculty'
  `can_undo` BOOLEAN DEFAULT FALSE,
  `original_data` JSON DEFAULT NULL -- For storing data needed for undo operations
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `teacher_teachable_courses` (
  `teacher_id` INT NOT NULL,
  `course_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`teacher_id`, `course_id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `student_attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `section_id` VARCHAR(50) NOT NULL,
  `attendance_date` DATE NOT NULL,
  `status` ENUM('Present', 'Absent', 'Late', 'Excused') NOT NULL,
  `remarks` TEXT DEFAULT NULL,
  `marked_by_teacher_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_attendance` (`student_id`, `subject_id`, `section_id`, `attendance_date`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`marked_by_teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for performance
CREATE INDEX idx_students_program_year_section ON students (program, year, section);
CREATE INDEX idx_teachers_department ON teachers (department);
CREATE INDEX idx_activity_log_timestamp ON activity_log (timestamp);
CREATE INDEX idx_grades_student_subject ON grades (student_id, subject_id);
CREATE INDEX idx_ssa_teacher_subject ON section_subject_assignments (teacher_id, subject_id);

-- Example for adding a foreign key to announcements if admin author_id refers to admins table
-- ALTER TABLE `announcements` ADD CONSTRAINT `fk_announcement_admin_author` FOREIGN KEY (`author_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL;
-- This would require author_id to be INT and a way to differentiate admin vs teacher author.
-- The current ENUM approach for author_type is simpler if admin announcements are generic or by a single 'System Admin' concept.

-- End of schema.sql
