-- Seed data for CampusConnect MIS

USE campus_connect_db;

-- Create Default Admin User
-- IMPORTANT: Replace the password hash below with a securely generated hash for 'defadmin'.
-- Use PHP's password_hash() function: `php -r "echo password_hash('defadmin', PASSWORD_DEFAULT);"`
-- Copy the generated hash and paste it here before running the seed script.
INSERT INTO `admins` (`username`, `password_hash`) VALUES
('admin', '$2y$10$.EXAMPLE.HASH.PLACEHOLDER.U7h177iQ/4pXbO9yP2sO'); -- <-- REPLACE THIS HASH

-- Seed Subjects (Example Subjects)
INSERT INTO `subjects` (`id`, `name`, `description`) VALUES
('CS101', 'Introduction to Computer Science', 'Fundamentals of programming and computer systems.'),
('IT101', 'Introduction to Information Technology', 'Overview of IT concepts, hardware, software, and networks.'),
('MATH101', 'College Algebra', 'Basic algebraic concepts and functions.'),
('ENG101', 'English Composition I', 'Fundamentals of academic writing and rhetoric.'),
('BUS101', 'Introduction to Business', 'Overview of business functions and principles.');

-- Seed Sections (Example Sections)
-- Note: Ensure section IDs match potential student section assignments
INSERT INTO `sections` (`id`, `section_code`, `course`, `year_level`, `adviser_id`) VALUES
('CS-1-A', '10A', 'Computer Science', '1st Year', NULL),
('CS-1-B', '10B', 'Computer Science', '1st Year', NULL),
('IT-1-A', '10A', 'Information Technology', '1st Year', NULL),
('BUS-1-A', '10A', 'Business Administration', '1st Year', NULL),
('CS-2-A', '20A', 'Computer Science', '2nd Year', NULL);
-- Add more sections as needed

-- Optional: Seed initial Teachers (Example)
-- Remember to generate default passwords (first 2 letters of last name + 1000) and hash them
-- INSERT INTO `teachers` (`teacher_id`, `first_name`, `last_name`, `department`, `password_hash`) VALUES
-- ('t1001', 'John', 'Doe', 'Computer Science', '$2y$10$.EXAMPLE.HASH.PLACEHOLDER.U7h177iQ/4pXbO9yP2sO'), -- Hash for 'do1000'
-- ('t1002', 'Jane', 'Smith', 'Information Technology', '$2y$10$.EXAMPLE.HASH.PLACEHOLDER.U7h177iQ/4pXbO9yP2sO'); -- Hash for 'sm1000'

-- Optional: Seed initial Students (Example)
-- Remember to generate default passwords and hash them
-- INSERT INTO `students` (`student_id`, `first_name`, `last_name`, `course`, `status`, `year`, `section`, `password_hash`) VALUES
-- ('s1001', 'Alice', 'Wonder', 'Computer Science', 'New', '1st Year', 'CS-1-A', '$2y$10$.EXAMPLE.HASH.PLACEHOLDER.U7h177iQ/4pXbO9yP2sO'), -- Hash for 'wo1000'
-- ('s1002', 'Bob', 'Builder', 'Information Technology', 'New', '1st Year', 'IT-1-A', '$2y$10$.EXAMPLE.HASH.PLACEHOLDER.U7h177iQ/4pXbO9yP2sO'); -- Hash for 'bu1000'
