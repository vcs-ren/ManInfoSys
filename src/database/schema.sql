-- Basic MySQL Schema for CampusConnect (campus_connect_db)
-- This is a starting point. Adapt constraints, types, and relationships as needed.

-- Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(20) NOT NULL UNIQUE, -- Generated e.g., s1001
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `course` VARCHAR(100) NOT NULL,
  `status` ENUM('New', 'Transferee', 'Continuing', 'Returnee') NOT NULL,
  `year` VARCHAR(20) NULL, -- e.g., 1st Year, 2nd Year (NULL for 'New' initially?)
  `section` VARCHAR(10) NOT NULL, -- Generated e.g., 10A
  `email` VARCHAR(255) NULL UNIQUE,
  `phone` VARCHAR(20) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `emergency_contact_name` VARCHAR(200) NULL,
  `emergency_contact_relationship` VARCHAR(50) NULL,
  `emergency_contact_phone` VARCHAR(20) NULL,
  `emergency_contact_address` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  -- Consider adding foreign keys if sections are predefined, e.g., FOREIGN KEY (section_id) REFERENCES sections(id)
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_id` VARCHAR(20) NOT NULL UNIQUE, -- Generated e.g., t1001
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NULL UNIQUE,
  `phone` VARCHAR(20) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sections Table
CREATE TABLE IF NOT EXISTS `sections` (
  `id` VARCHAR(50) PRIMARY KEY, -- Composite ID like CS-1-A might be better or auto-increment
  `section_code` VARCHAR(10) NOT NULL, -- e.g., 10A, 20B
  `course` VARCHAR(100) NOT NULL,
  `year_level` VARCHAR(20) NOT NULL, -- e.g., 1st Year
  `adviser_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_section` (`course`, `year_level`, `section_code`), -- Ensure unique sections per course/year
  FOREIGN KEY (`adviser_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL -- Optional: Set adviser to NULL if teacher is deleted
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` VARCHAR(50) PRIMARY KEY, -- e.g., CS101
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Section-Subject Assignments (Many-to-Many linking Sections, Subjects, and Teachers)
CREATE TABLE IF NOT EXISTS `section_subject_assignments` (
  `id` VARCHAR(100) PRIMARY KEY, -- Composite ID like SectionID-SubjectID
  `section_id` VARCHAR(50) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `teacher_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_assignment` (`section_id`, `subject_id`), -- One teacher per subject per section
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE CASCADE, -- Cascade delete if section removed
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE, -- Cascade delete if subject removed
  FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE CASCADE -- Cascade delete if teacher removed (or SET NULL?)
);

-- Grades Table
CREATE TABLE IF NOT EXISTS `grades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `term` ENUM('Prelim', 'Midterm', 'Final') NOT NULL,
  `grade` DECIMAL(5, 2) NULL, -- Allow NULL grades initially
  `remarks` TEXT NULL,
  `submitted_by_teacher_id` INT NULL, -- Track who submitted/updated
  `assignment_id` VARCHAR(100) NULL, -- Optional: Link back to the specific assignment
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_grade` (`student_id`, `subject_id`, `term`), -- One grade per student per subject per term
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`submitted_by_teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assignment_id`) REFERENCES `section_subject_assignments`(`id`) ON DELETE SET NULL
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `author_id` INT NULL, -- NULL for Admin, teacher ID for Teacher
  `author_type` ENUM('Admin', 'Teacher', 'System') NOT NULL DEFAULT 'System',
  `target_course` VARCHAR(100) NULL, -- NULL or 'all' means all courses
  `target_year_level` VARCHAR(20) NULL, -- NULL or 'all' means all year levels
  `target_section` VARCHAR(10) NULL, -- NULL or 'all' means all sections
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  -- No foreign key for author_id as it can be Admin (no table) or Teacher
);

-- Indexes for performance (Add as needed based on query patterns)
-- CREATE INDEX idx_student_name ON students (lastName, firstName);
-- CREATE INDEX idx_teacher_name ON teachers (lastName, firstName);
-- CREATE INDEX idx_grades_student_subject ON grades (student_id, subject_id);
-- CREATE INDEX idx_assignments_teacher ON section_subject_assignments (teacher_id);
-- CREATE INDEX idx_announcements_created ON announcements (created_at);

