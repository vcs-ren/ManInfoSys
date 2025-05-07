-- Database: campus_connect_db

-- Use the database
USE campus_connect_db;

-- Table structure for table `students`
CREATE TABLE IF NOT EXISTS `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) NOT NULL UNIQUE, -- e.g., s1001
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `course` varchar(100) NOT NULL,
  `status` enum('New','Transferee','Continuing','Returnee') NOT NULL DEFAULT 'New',
  `year` enum('1st Year','2nd Year','3rd Year','4th Year') DEFAULT NULL,
  `section` varchar(50) DEFAULT NULL, -- e.g., 10A, 20B
  `email` varchar(100) DEFAULT NULL UNIQUE,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_relationship` varchar(50) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `emergency_contact_address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `teachers` - Updated
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` varchar(50) NOT NULL UNIQUE, -- e.g., t1001
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL, -- Added
  `suffix` varchar(20) DEFAULT NULL, -- Added
  `department` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL UNIQUE,
  `phone` varchar(20) DEFAULT NULL,
  `birthday` date DEFAULT NULL, -- Added
  `password_hash` varchar(255) NOT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL, -- Added
  `emergency_contact_relationship` varchar(50) DEFAULT NULL, -- Added
  `emergency_contact_phone` varchar(20) DEFAULT NULL, -- Added
  `emergency_contact_address` text DEFAULT NULL, -- Added
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for table `admins`
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `is_super_admin` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `subjects`
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` varchar(20) NOT NULL, -- Subject code, e.g., CS101
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `sections`
CREATE TABLE IF NOT EXISTS `sections` (
  `id` varchar(50) NOT NULL, -- Unique section ID, e.g., CS-1-A
  `section_code` varchar(20) NOT NULL, -- e.g. 10A, 20B (matches student section)
  `course` varchar(100) NOT NULL,
  `year_level` enum('1st Year','2nd Year','3rd Year','4th Year') NOT NULL,
  `adviser_id` int(11) DEFAULT NULL, -- Foreign key to teachers table
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `adviser_id` (`adviser_id`),
  CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`adviser_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `section_subject_assignments`
CREATE TABLE IF NOT EXISTS `section_subject_assignments` (
  `id` varchar(100) NOT NULL, -- Composite ID, e.g., CS-1A-CS101
  `section_id` varchar(50) NOT NULL,
  `subject_id` varchar(20) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `section_subject_unique` (`section_id`,`subject_id`), -- Ensures a subject is assigned only once per section
  KEY `section_id` (`section_id`),
  KEY `subject_id` (`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `ssa_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ssa_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ssa_ibfk_3` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `announcements`
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `author_type` enum('Admin','Teacher') NOT NULL DEFAULT 'Admin',
  `author_id` int(11) DEFAULT NULL, -- FK to teachers.id if author_type is Teacher
  `target_course` varchar(100) DEFAULT NULL, -- NULL or 'all' for all courses
  `target_year_level` varchar(50) DEFAULT NULL, -- NULL or 'all' for all year levels
  `target_section` varchar(50) DEFAULT NULL, -- NULL or 'all' for all sections
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`)
  -- No strict FK constraint on author_id to allow Admin author without a teacher ID
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `grades`
CREATE TABLE IF NOT EXISTS `grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_id` varchar(20) NOT NULL,
  `assignment_id` varchar(100) DEFAULT NULL, -- Optional: Link to specific assignment row
  `term` enum('Prelim','Midterm','Final') NOT NULL,
  `grade` decimal(5,2) DEFAULT NULL, -- Allow NULL grades
  `remarks` text DEFAULT NULL,
  `submitted_by_teacher_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_subject_term` (`student_id`,`subject_id`,`term`),
  KEY `student_id` (`student_id`),
  KEY `subject_id` (`subject_id`),
  KEY `submitted_by_teacher_id` (`submitted_by_teacher_id`),
  KEY `assignment_id` (`assignment_id`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`submitted_by_teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grades_ibfk_4` FOREIGN KEY (`assignment_id`) REFERENCES `section_subject_assignments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indices for better performance
ALTER TABLE `students` ADD INDEX `idx_course` (`course`);
ALTER TABLE `students` ADD INDEX `idx_year` (`year`);
ALTER TABLE `students` ADD INDEX `idx_section` (`section`);
ALTER TABLE `teachers` ADD INDEX `idx_department` (`department`);
ALTER TABLE `sections` ADD INDEX `idx_course_year` (`course`, `year_level`);
ALTER TABLE `announcements` ADD INDEX `idx_target` (`target_course`, `target_year_level`, `target_section`);
ALTER TABLE `grades` ADD INDEX `idx_term` (`term`);

-- Potential schedule table (more complex, example only)
/*
CREATE TABLE `schedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` varchar(100) NOT NULL, -- FK to section_subject_assignments
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `assignment_id` (`assignment_id`),
  CONSTRAINT `schedule_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `section_subject_assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/

-- --- END OF SCHEMA ---
