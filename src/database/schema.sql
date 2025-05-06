-- Database schema for CampusConnect MIS

CREATE DATABASE IF NOT EXISTS campus_connect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE campus_connect_db;

-- Admins Table (Typically only one record)
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Students Table
CREATE TABLE IF NOT EXISTS `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL UNIQUE,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `course` varchar(100) NOT NULL,
  `status` enum('New','Transferee','Continuing','Returnee') NOT NULL DEFAULT 'New',
  `year` varchar(20) NOT NULL COMMENT 'e.g., 1st Year, 2nd Year',
  `section` varchar(20) NOT NULL COMMENT 'e.g., 10A, 20B - Section ID like CS-1-A is preferred',
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `emergency_contact_name` varchar(200) DEFAULT NULL,
  `emergency_contact_relationship` varchar(50) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `emergency_contact_address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student_name` (`last_name`, `first_name`),
  KEY `idx_student_course_year_section` (`course`,`year`,`section`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Teachers Table
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` varchar(20) NOT NULL UNIQUE,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
   KEY `idx_teacher_name` (`last_name`, `first_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Subjects Table
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` varchar(50) NOT NULL COMMENT 'Unique subject code, e.g., CS101, MATH101',
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Sections Table
CREATE TABLE IF NOT EXISTS `sections` (
  `id` varchar(50) NOT NULL COMMENT 'Unique section identifier, e.g., CS-1-A',
  `section_code` varchar(20) NOT NULL COMMENT 'Display code, e.g., 10A',
  `course` varchar(100) NOT NULL,
  `year_level` varchar(20) NOT NULL COMMENT 'e.g., 1st Year',
  `adviser_id` int DEFAULT NULL COMMENT 'FK to teachers table',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_section_course_year` (`course`, `year_level`),
  KEY `fk_section_adviser` (`adviser_id`),
  CONSTRAINT `fk_section_adviser` FOREIGN KEY (`adviser_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Ensure student.section matches sections.id for proper linking


-- Announcements Table
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `author_id` int DEFAULT NULL COMMENT 'FK to teachers table if author_type is Teacher',
  `author_type` enum('Admin','Teacher') NOT NULL DEFAULT 'Admin',
  `target_course` varchar(100) DEFAULT NULL COMMENT 'Target course or NULL/all for all',
  `target_year_level` varchar(20) DEFAULT NULL COMMENT 'Target year or NULL/all for all',
  `target_section` varchar(50) DEFAULT NULL COMMENT 'Target section ID or NULL/all for all',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_announcement_author` (`author_id`),
  KEY `idx_announcement_target` (`target_course`, `target_year_level`, `target_section`)
  -- No FK constraint on author_id to allow Admin (NULL author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Section-Subject Assignments Table (Many-to-Many linking sections, subjects, and teachers)
CREATE TABLE IF NOT EXISTS `section_subject_assignments` (
  `id` varchar(100) NOT NULL COMMENT 'Unique ID, e.g., sectionId-subjectId',
  `section_id` varchar(50) NOT NULL COMMENT 'FK to sections table',
  `subject_id` varchar(50) NOT NULL COMMENT 'FK to subjects table',
  `teacher_id` int NOT NULL COMMENT 'FK to teachers table',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_section_subject` (`section_id`, `subject_id`), -- Ensure one teacher per subject per section
  KEY `fk_assignment_section` (`section_id`),
  KEY `fk_assignment_subject` (`subject_id`),
  KEY `fk_assignment_teacher` (`teacher_id`),
  CONSTRAINT `fk_assignment_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_assignment_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_assignment_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Grades Table
CREATE TABLE IF NOT EXISTS `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL COMMENT 'FK to students table',
  `subject_id` varchar(50) NOT NULL COMMENT 'FK to subjects table',
  `term` enum('Prelim','Midterm','Final') NOT NULL,
  `grade` decimal(5,2) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `submitted_by_teacher_id` int DEFAULT NULL COMMENT 'FK to teachers table',
  `assignment_id` varchar(100) DEFAULT NULL COMMENT 'FK to section_subject_assignments',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_subject_term` (`student_id`, `subject_id`, `term`), -- Ensure one grade per student/subject/term
  KEY `fk_grade_student` (`student_id`),
  KEY `fk_grade_subject` (`subject_id`),
  KEY `fk_grade_teacher` (`submitted_by_teacher_id`),
  KEY `fk_grade_assignment` (`assignment_id`),
  CONSTRAINT `fk_grade_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_grade_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_grade_teacher` FOREIGN KEY (`submitted_by_teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_grade_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `section_subject_assignments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial data (subjects, sections, admin) in seed.sql
