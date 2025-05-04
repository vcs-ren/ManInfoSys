
-- Database Schema for CampusConnect

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS campus_connect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_connect_db;

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL, -- Generated e.g., s1001
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    status ENUM('New', 'Transferee', 'Continuing', 'Returnee') NOT NULL,
    year ENUM('1st Year', '2nd Year', '3rd Year', '4th Year') NULL, -- Nullable, set based on status
    section VARCHAR(10) NOT NULL, -- Generated e.g., 10A, 20B
    email VARCHAR(255) NULL UNIQUE,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed password
    emergency_contact_name VARCHAR(200) NULL,
    emergency_contact_relationship VARCHAR(50) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    emergency_contact_address TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_name (last_name, first_name),
    INDEX idx_student_section (section)
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(20) UNIQUE NOT NULL, -- Generated e.g., t1001
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(255) NULL UNIQUE,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_teacher_name (last_name, first_name)
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY, -- e.g., "MATH101", "CS203"
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sections Table
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(50) PRIMARY KEY, -- e.g., "CS-1-A", "IT-2-B" (Generated or defined)
    section_code VARCHAR(10) NOT NULL, -- e.g., "10A", "20B"
    course VARCHAR(100) NOT NULL,
    year_level ENUM('1st Year', '2nd Year', '3rd Year', '4th Year') NOT NULL,
    adviser_id INT NULL, -- Foreign key to teachers table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adviser_id) REFERENCES teachers(id) ON DELETE SET NULL, -- Set adviser to NULL if teacher is deleted
    INDEX idx_section_course_year (course, year_level)
);

-- Section Subject Assignments (Teacher-Subject-Section Mapping)
CREATE TABLE IF NOT EXISTS section_subject_assignments (
    id VARCHAR(50) PRIMARY KEY, -- Unique ID for the assignment (e.g., UUID or composite based)
    section_id VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    teacher_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE, -- Cascade delete if teacher is removed? Or restrict?
    UNIQUE INDEX idx_section_subject (section_id, subject_id) -- Ensure a subject is assigned only once per section
);


-- Grades Table (Stores individual term grades)
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id VARCHAR(50) NULL, -- Link to section_subject_assignments (Use this or student+subject)
    student_id INT NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    term ENUM('Prelim', 'Midterm', 'Final') NOT NULL,
    grade DECIMAL(5, 2) NULL, -- Allow decimal grades (e.g., 85.50) or NULL if not submitted
    remarks TEXT NULL,
    submitted_by_teacher_id INT NULL, -- Track who submitted the grade
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (assignment_id) REFERENCES section_subject_assignments(id) ON DELETE CASCADE, -- If using assignment_id link
    UNIQUE INDEX idx_student_subject_term (student_id, subject_id, term) -- Ensure unique grade per student/subject/term
);


-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NULL, -- Can be admin (NULL?) or teacher ID
    author_type ENUM('Admin', 'Teacher') NULL,
    target_course VARCHAR(100) NULL, -- NULL or 'all' means all courses
    target_year_level ENUM('1st Year', '2nd Year', '3rd Year', '4th Year', 'all') NULL, -- NULL or 'all' means all years
    target_section VARCHAR(50) NULL, -- NULL or 'all' means all sections in the course/year
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_announcement_target (target_course, target_year_level, target_section),
    FOREIGN KEY (author_id) REFERENCES teachers(id) ON DELETE SET NULL -- Only if author_type is 'Teacher'
    -- Consider adding an index on created_at for sorting
);


-- Optional: Admin Users Table (More secure than hardcoding)
-- CREATE TABLE IF NOT EXISTS admins (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Insert a default admin user (replace with a secure password setup process)
-- -- Example: password is 'adminpassword'
-- -- INSERT IGNORE INTO admins (username, password_hash) VALUES ('admin', '$2y$10$examplehashedpassword...');


-- Placeholder Data (Optional: Add some initial data for testing)

-- Example Subjects
INSERT IGNORE INTO subjects (id, name) VALUES
('CS101', 'Introduction to Programming'),
('IT201', 'Database Management'),
('BA301', 'Business Finance'),
('MATH101', 'College Algebra'),
('ENG101', 'Academic Writing');

-- Example Teachers (Passwords are 'la1000', 'sm1000')
INSERT IGNORE INTO teachers (id, teacher_id, first_name, last_name, department, email, password_hash) VALUES
(1, 't1001', 'Jane', 'Smith', 'Computer Science', 'jane.smith@example.com', '$2y$10$k.N5tF8Yg./L4.JqX0hQ9ugl5v.P0Z0p.u2Z1LzR.r3T6eG5wX6g.'),
(2, 't1002', 'John', 'Doe', 'Business Administration', 'john.doe@example.com', '$2y$10$3GqW.u7yH/uI.g8zL0pQ5uR.5v.P0Z0p.u2Z1LzR.r3T6eG5wX6g.');

-- Example Sections
INSERT IGNORE INTO sections (id, section_code, course, year_level, adviser_id) VALUES
('CS-1-A', '10A', 'Computer Science', '1st Year', 1),
('BA-1-B', '10B', 'Business Administration', '1st Year', 2);

-- Example Section Subject Assignments
INSERT IGNORE INTO section_subject_assignments (id, section_id, subject_id, teacher_id) VALUES
('CS1A-CS101', 'CS-1-A', 'CS101', 1),
('CS1A-MATH101', 'CS-1-A', 'MATH101', 1),
('BA1B-BA301', 'BA-1-B', 'BA301', 2),
('BA1B-ENG101', 'BA-1-B', 'ENG101', 2);


-- Example Students (Passwords are 'do1000', 'ma1000')
INSERT IGNORE INTO students (id, student_id, first_name, last_name, course, status, year, section, email, password_hash) VALUES
(1, 's1001', 'Alice', 'Doe', 'Computer Science', 'New', '1st Year', '10A', 'alice.doe@example.com', '$2y$10$F8Yg.N5t/L4.JqX0hQ9ugl5v.P0Z0p.u2Z1LzR.r3T6eG5wX6gK.'),
(2, 's1002', 'Bob', 'Martin', 'Business Administration', 'New', '1st Year', '10B', 'bob.martin@example.com', '$2y$10$u7yH.uI.g8zL0pQ5uR.5v.P0Z0p.u2Z1LzR.r3T6eG5wX6gM.');

-- Example Grades (Initial state - likely NULL)
-- Grades are typically added through the application interface


-- Example Announcement
INSERT IGNORE INTO announcements (title, content, author_type, target_course, target_year_level, target_section) VALUES
('Welcome!', 'Welcome to the new academic year!', 'Admin', 'all', 'all', 'all');


