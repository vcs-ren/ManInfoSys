-- Seed data for CampusConnect MIS

-- IMPORTANT: Generate a secure password hash for 'defadmin' using PHP's password_hash()
-- and replace the placeholder hash below before running this script.
-- Example PHP command: php -r "echo password_hash('defadmin', PASSWORD_DEFAULT);"
-- Paste the output hash into the INSERT statement.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Seed Admin User
INSERT INTO `admins` (`id`, `username`, `password_hash`, `email`, `first_name`, `last_name`, `is_super_admin`, `created_at`) VALUES
(1, 'admin', '$2y$10$PLACEHOLDER_ADMIN_PASSWORD_HASH', 'admin@campusconnect.example', 'Main', 'Admin', TRUE, NOW());
-- Example Hash (DO NOT USE THIS, GENERATE YOUR OWN): $2y$10$yourGeneratedPasswordHashHere....

-- Seed Example Subjects (Optional, but useful for testing assignments)
INSERT INTO `subjects` (`id`, `name`, `description`, `created_at`) VALUES
('CS101', 'Introduction to Programming', 'Fundamentals of programming using Python.', NOW()),
('IT202', 'Networking Fundamentals', 'Basic concepts of computer networks and protocols.', NOW()),
('GEN001', 'Purposive Communication', 'Principles of effective communication.', NOW()),
('MATH101', 'College Algebra', 'Algebraic concepts and problem-solving.', NOW());

-- Seed Example Teachers (Optional, for testing adviser/assignments)
-- Ensure teacher usernames are generated if needed by the login logic
INSERT INTO `teachers` (`id`, `teacher_id`, `username`, `first_name`, `last_name`, `department`, `email`, `password_hash`, `created_at`) VALUES
(1, 't101', 't101', 'David', 'Lee', 'Computer Science', 'david.lee@example.com', '$2y$10$PLACEHOLDER_TEACHER1_PASSWORD_HASH', NOW()),
(2, 't102', 't102', 'Eve', 'Davis', 'Information Technology', 'eve.davis@example.com', '$2y$10$PLACEHOLDER_TEACHER2_PASSWORD_HASH', NOW());
-- Remember to generate hashes for teacher default passwords (e.g., 'le1000', 'da1000')

-- Seed Example Sections (Optional)
-- Make sure 'adviser_id' corresponds to an existing teacher ID if assigned
INSERT INTO `sections` (`id`, `section_code`, `course`, `year_level`, `adviser_id`, `created_at`) VALUES
('CS-10A', '10A', 'Computer Science', '1st Year', 1, NOW()),
('IT-10B', '10B', 'Information Technology', '1st Year', 2, NOW()),
('CS-20A', '20A', 'Computer Science', '2nd Year', 1, NOW());

-- Seed Example Students (Optional)
-- Ensure usernames match the 's' + student_id format
INSERT INTO `students` (`id`, `student_id`, `username`, `first_name`, `last_name`, `course`, `status`, `year`, `section`, `email`, `password_hash`, `created_at`) VALUES
(1, '101', 's101', 'Alice', 'Smith', 'Computer Science', 'New', '1st Year', 'CS-10A', 'alice@example.com', '$2y$10$PLACEHOLDER_STUDENT1_PASSWORD_HASH', NOW()),
(2, '102', 's102', 'Bob', 'Johnson', 'Information Technology', 'New', '1st Year', 'IT-10B', 'bob@example.com', '$2y$10$PLACEHOLDER_STUDENT2_PASSWORD_HASH', NOW());
-- Remember to generate hashes for student default passwords (e.g., 'sm1000', 'jo1000')


COMMIT;

    