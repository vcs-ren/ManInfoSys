
-- CampusConnect MIS Seed Data

-- IMPORTANT: Before running this seed script, you MUST generate a secure password hash
-- for the default admin user's password ('defadmin') and replace the placeholder below.
--
-- How to generate the hash in PHP:
-- 1. Open a PHP interactive shell (php -a) or create a temporary PHP file.
-- 2. Execute: echo password_hash('defadmin', PASSWORD_DEFAULT);
-- 3. Copy the entire output string (it will look something like $2y$10$...)
-- 4. Replace '!!!REPLACE_THIS_WITH_GENERATED_PASSWORD_HASH!!!' in the INSERT statement below with the copied hash.

-- Default Super Admin User
INSERT INTO `admins` (`username`, `password_hash`, `first_name`, `last_name`, `email`, `role`, `is_super_admin`)
VALUES
('admin', '!!!REPLACE_THIS_WITH_GENERATED_PASSWORD_HASH!!!', 'Super', 'Admin', 'superadmin@example.com', 'Super Admin', TRUE);

-- Sample Programs
INSERT INTO `programs` (`id`, `name`, `description`) VALUES
('CS', 'Bachelor of Science in Computer Science', 'A comprehensive program covering various aspects of computer science, software development, and information technology.'),
('IT', 'Bachelor of Science in Information Technology', 'Focuses on the practical application of technology to solve business and organizational problems.'),
('BSED-ENG', 'Bachelor of Secondary Education major in English', 'Prepares students to become effective English language teachers for secondary education.'),
('BSBM', 'Bachelor of Science in Business Management', 'Provides a broad understanding of business principles and management practices.');

-- Sample Courses (Subjects)
-- Minor Courses (General Education)
INSERT INTO `courses` (`id`, `name`, `description`, `type`) VALUES
('GEN001', 'Purposive Communication', 'Develops students communication skills for various purposes.', 'Minor'),
('GEN002', 'Readings in Philippine History', 'A study of Philippine history from various perspectives.', 'Minor'),
('GEN003', 'The Contemporary World', 'An overview of globalization and its impact on various aspects of society.', 'Minor'),
('MATH001', 'Mathematics in the Modern World', 'Explores the nature of mathematics and its applications in everyday life.', 'Minor'),
('PE001', 'Physical Education 1', 'Fundamentals of physical fitness and wellness.', 'Minor');

-- Major Courses for Computer Science (CS)
INSERT INTO `courses` (`id`, `name`, `description`, `type`) VALUES
('CS101', 'Introduction to Programming', 'Fundamentals of programming using a high-level language.', 'Major'),
('CS102', 'Data Structures and Algorithms', 'Study of fundamental data structures and algorithm design.', 'Major'),
('CS201', 'Object-Oriented Programming', 'Principles and practices of object-oriented programming.', 'Major'),
('CS202', 'Database Management Systems', 'Concepts and design of database systems.', 'Major');
-- Assign CS Major courses to CS program
INSERT INTO `course_program_assignments` (`course_id`, `program_id`) VALUES
('CS101', 'CS'),
('CS102', 'CS'),
('CS201', 'CS'),
('CS202', 'CS');


-- Major Courses for Information Technology (IT)
INSERT INTO `courses` (`id`, `name`, `description`, `type`) VALUES
('IT101', 'Fundamentals of Information Technology', 'Overview of IT concepts, hardware, software, and systems.', 'Major'),
('IT102', 'Web Development Basics', 'Introduction to HTML, CSS, and JavaScript for web development.', 'Major'),
('IT201', 'Networking Essentials', 'Basic concepts of computer networking and protocols.', 'Major'),
('IT202', 'System Analysis and Design', 'Methodologies for analyzing and designing information systems.', 'Major');
-- Assign IT Major courses to IT program
INSERT INTO `course_program_assignments` (`course_id`, `program_id`) VALUES
('IT101', 'IT'),
('IT102', 'IT'),
('IT201', 'IT'),
('IT202', 'IT');


-- Sample Curriculum (Program Courses)
-- CS - 1st Year
INSERT INTO `program_courses` (`program_id`, `course_id`, `year_level`) VALUES
('CS', 'GEN001', '1st Year'),
('CS', 'MATH001', '1st Year'),
('CS', 'CS101', '1st Year'),
('CS', 'PE001', '1st Year');

-- CS - 2nd Year
INSERT INTO `program_courses` (`program_id`, `course_id`, `year_level`) VALUES
('CS', 'GEN002', '2nd Year'),
('CS', 'CS102', '2nd Year'),
('CS', 'CS201', '2nd Year');

-- IT - 1st Year
INSERT INTO `program_courses` (`program_id`, `course_id`, `year_level`) VALUES
('IT', 'GEN001', '1st Year'),
('IT', 'MATH001', '1st Year'),
('IT', 'IT101', '1st Year'),
('IT', 'PE001', '1st Year');


-- Initial Activity Log Entry
INSERT INTO `activity_log` (`user_identifier`, `user_role`, `action`, `description`, `target_type`)
VALUES
('System', 'System', 'System Startup', 'System initialized successfully.', 'system');

-- Note: No initial students, teachers (other than admin), or sections are added by default.
-- These will be created through the application.
-- Make sure to update this file if your application's auto-generation logic for IDs
-- (student_id, teacher_id, section_id) needs specific starting points or might conflict.
-- The current PHP models generate these IDs dynamically.

-- End of seed.sql
