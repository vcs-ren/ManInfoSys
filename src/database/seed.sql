
-- Seed data for the MIS application

-- Default Super Admin (ID will be 1 due to AUTO_INCREMENT)
-- IMPORTANT: Replace 'hashed_defadmin_password' with the actual hash of 'defadmin'
-- Use PHP: echo password_hash('defadmin', PASSWORD_DEFAULT);
INSERT INTO admins (username, password_hash)
VALUES ('admin', '$2y$10$YOUR_GENERATED_HASH_FOR_DEFADMIN_HERE'); -- Replace with actual hash

-- Sample Programs
INSERT INTO programs (id, name, description) VALUES
('CS', 'Computer Science', 'Bachelor of Science in Computer Science program focusing on software development, algorithms, and data structures.'),
('IT', 'Information Technology', 'Bachelor of Science in Information Technology program focusing on network administration, web technologies, and system management.'),
('BSED-ENG', 'Secondary Education Major in English', 'Program for aspiring English teachers in secondary education.'),
('BSBA-MM', 'Business Administration Major in Marketing', 'Program for business students specializing in marketing management.');

-- Sample Courses (Subjects)
INSERT INTO courses (id, name, description, type) VALUES
('CS101', 'Introduction to Programming', 'Fundamentals of programming logic and design.', 'Major'),
('IT101', 'IT Fundamentals', 'Basic concepts of Information Technology.', 'Major'),
('ENG101', 'Purposive Communication', 'Developing effective communication skills for various purposes.', 'Minor'),
('MATH101', 'College Algebra', 'Fundamental concepts of algebra.', 'Minor'),
('FIL101', 'Kontekstwalisadong Komunikasyon sa Filipino', 'Filipino language communication in various contexts.', 'Minor'),
('CS201', 'Data Structures and Algorithms', 'Advanced data organization and algorithm design.', 'Major'),
('MKTG101', 'Principles of Marketing', 'Introduction to marketing concepts and strategies.', 'Major');


-- Assign some courses to programs and year levels
-- CS Program
INSERT INTO program_courses (program_id, course_id, year_level) VALUES
('CS', 'CS101', '1st Year'),
('CS', 'MATH101', '1st Year'),
('CS', 'ENG101', '1st Year'),
('CS', 'FIL101', '1st Year'),
('CS', 'CS201', '2nd Year');

-- IT Program
INSERT INTO program_courses (program_id, course_id, year_level) VALUES
('IT', 'IT101', '1st Year'),
('IT', 'MATH101', '1st Year'),
('IT', 'ENG101', '1st Year');

-- Sample Faculty (Teaching and Administrative)
-- Passwords are 'lastname_initials' + '1000' hashed. e.g., 'smithj1000' for John Smith.
-- Replace hashes with actual generated hashes.
INSERT INTO faculty (faculty_id, username, first_name, last_name, department, employment_type, email, password_hash) VALUES
('10000001', 't10000001', 'John', 'Smith', 'Teaching', 'Regular', 'john.smith@example.com', '$2y$10$YOUR_HASH_FOR_smithj1000'),
('10000002', 'a10000002', 'Alice', 'Wonderland', 'Administrative', 'Regular', 'alice.wonder@example.com', '$2y$10$YOUR_HASH_FOR_wondera1000'),
('10000003', 't10000003', 'Robert', 'Doe', 'Teaching', 'Part Time', 'robert.doe@example.com', '$2y$10$YOUR_HASH_FOR_doer1000');


-- Sample Students
-- Passwords are 'lastname_initials' + '1000' hashed. e.g., 'brownc1000' for Charlie Brown.
-- Replace hashes with actual generated hashes.
INSERT INTO students (student_id, username, first_name, last_name, program, enrollment_type, year, section, email, password_hash) VALUES
('1000001', 's1000001', 'Charlie', 'Brown', 'CS', 'New', '1st Year', 'CS1A', 'charlie.brown@example.com', '$2y$10$YOUR_HASH_FOR_brownc1000'),
('1000002', 's1000002', 'Lucy', 'VanPelt', 'IT', 'Transferee', '2nd Year', 'IT2A', 'lucy.vanpelt@example.com', '$2y$10$YOUR_HASH_FOR_vanpel1000');


-- Sample Sections (Advisers can be assigned later)
-- Sections should ideally be created dynamically or by an admin based on enrollment.
-- These are just examples.
INSERT INTO sections (id, section_code, program_id, year_level, adviser_id) VALUES
('CS1A', 'CS1A', 'CS', '1st Year', 1), -- John Smith advises CS1A
('IT2A', 'IT2A', 'IT', '2nd Year', NULL);


-- Sample Section-Subject-Assignments
INSERT INTO section_subject_assignments (id, section_id, subject_id, teacher_id) VALUES
('CS1A-CS101', 'CS1A', 'CS101', 1), -- John Smith teaches CS101 in CS1A
('CS1A-MATH101', 'CS1A', 'MATH101', 3), -- Robert Doe teaches MATH101 in CS1A
('IT2A-IT101', 'IT2A', 'IT101', 1); -- John Smith teaches IT101 in IT2A (assuming IT101 is also taught in 2nd year IT for this example)


-- Sample Announcements
INSERT INTO announcements (title, content, author_type, author_id, target_audience, target_program) VALUES
('Welcome Week Activities', 'Join us for a week of fun activities to kick off the new semester!', 'Admin', NULL, 'All', 'all'),
('CS Department Meeting', 'All Computer Science students are invited to a department meeting on Friday.', 'Teacher', 1, 'Student', 'CS');


-- Initial System Activity Log (Optional)
INSERT INTO activity_log (user_id, user_role, action, description) VALUES
('system', 'System', 'Database Seeded', 'Initial data inserted into the database.');

-- Note: To generate password hashes in PHP:
-- php -r "echo password_hash('your_password_here', PASSWORD_DEFAULT);"
-- Example for 'defadmin': php -r "echo password_hash('defadmin', PASSWORD_DEFAULT);"
-- Example for 'smithj1000': php -r "echo password_hash('smithj1000', PASSWORD_DEFAULT);"

