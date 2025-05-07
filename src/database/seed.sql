
-- src/database/seed.sql

-- Use the campus_connect_db database
USE campus_connect_db;

-- Add default admin user (if not exists)
-- IMPORTANT: Replace 'YOUR_HASHED_PASSWORD_HERE' with the actual hash generated for 'defadmin'
-- Use PHP: echo password_hash('defadmin', PASSWORD_DEFAULT);
INSERT IGNORE INTO `admins` (`username`, `password_hash`, `first_name`, `last_name`, `email`, `is_super_admin`) VALUES
('admin', '$2y$10$YOUR_HASHED_PASSWORD_HERE', 'Super', 'Admin', 'admin@campusconnect.example', TRUE);
-- Add more admin users if needed, e.g.:
-- INSERT IGNORE INTO `admins` (`username`, `password_hash`, `first_name`, `last_name`, `email`, `is_super_admin`) VALUES
-- ('a1001', '$2y$10$SOME_OTHER_HASH', 'Sub', 'Admin', 'subadmin@campusconnect.example', FALSE);

-- Add sample teachers (modify as needed)
-- Remember to hash default passwords (e.g., 'le1000' for David Lee)
-- INSERT IGNORE INTO `teachers` (`teacher_id`, `first_name`, `last_name`, `department`, `email`, `password_hash`, `address`) VALUES
-- ('t1001', 'David', 'Lee', 'Computer Science', 'david.lee@example.com', '$2y$10$HASH_FOR_le1000', '123 University Ave'),
-- ('t1002', 'Eve', 'Davis', 'Information Technology', 'eve.davis@example.com', '$2y$10$HASH_FOR_da1000', '456 College St');

-- Add sample students (modify as needed)
-- Remember to hash default passwords (e.g., 'sm1000' for Alice Smith)
-- INSERT IGNORE INTO `students` (`student_id`, `first_name`, `last_name`, `course`, `status`, `year`, `section`, `email`, `password_hash`) VALUES
-- ('s1001', 'Alice', 'Smith', 'Computer Science', 'Continuing', '2nd Year', 'CS-2A', 'alice@example.com', '$2y$10$HASH_FOR_sm1000'),
-- ('s1002', 'Bob', 'Johnson', 'Information Technology', 'New', '1st Year', 'IT-1B', 'bob@example.com', '$2y$10$HASH_FOR_jo1000');

-- Add sample subjects (if not already added by schema.sql)
INSERT IGNORE INTO `subjects` (`id`, `name`, `description`) VALUES
('CS101', 'Introduction to Programming', 'Basics of programming using Python.'),
('IT202', 'Networking Fundamentals', 'Understanding computer networks, TCP/IP.'),
('GEN001', 'Purposive Communication', 'Effective communication skills for academic and professional settings.'),
('MATH101', 'Calculus I', 'Differential and integral calculus.');

-- Add sample sections (if not already added by schema.sql)
INSERT IGNORE INTO `sections` (`id`, `section_code`, `course`, `year_level`, `adviser_id`) VALUES
('CS-1A', '1A', 'Computer Science', '1st Year', NULL),
('CS-2A', '2A', 'Computer Science', '2nd Year', NULL),
('IT-1B', '1B', 'Information Technology', '1st Year', NULL);

-- Add sample section-subject assignments (optional, link sections/subjects/teachers)
-- INSERT IGNORE INTO `section_subject_assignments` (`id`, `section_id`, `subject_id`, `teacher_id`) VALUES
-- ('CS-1A-CS101', 'CS-1A', 'CS101', 1), -- Assign CS101 to Section CS-1A taught by Teacher 1
-- ('CS-2A-MATH101', 'CS-2A', 'MATH101', 1), -- Assign MATH101 to Section CS-2A taught by Teacher 1
-- ('IT-1B-IT202', 'IT-1B', 'IT202', 2); -- Assign IT202 to Section IT-1B taught by Teacher 2

-- Note: Grades and Announcements are typically added through the application, not seed data.

