-- Database Schema for CampusConnect MIS

-- ** Make sure to create the database first! **
-- CREATE DATABASE IF NOT EXISTS campus_connect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE campus_connect_db;

-- Admins Table (Only one admin initially)
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_super_admin BOOLEAN DEFAULT FALSE, -- To distinguish the main admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(10) UNIQUE NOT NULL, -- e.g., '101', '102'
    username VARCHAR(50) UNIQUE NOT NULL,   -- e.g., 's101', 's102'
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    suffix VARCHAR(10),
    gender ENUM('Male', 'Female', 'Other'),
    birthday DATE,
    course VARCHAR(100) NOT NULL,
    status ENUM('New', 'Transferee', 'Returnee') NOT NULL, -- Removed 'Continuing'
    year VARCHAR(20), -- e.g., '1st Year', '2nd Year' (Required for Transferee/Returnee)
    section VARCHAR(20) NOT NULL, -- Auto-generated based on year
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL, -- Hashed password
    emergency_contact_name VARCHAR(100),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(10) UNIQUE NOT NULL, -- e.g., 't101', 't102'
    username VARCHAR(50) UNIQUE NOT NULL,   -- e.g., 't101', 't102'
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    suffix VARCHAR(10),
    address TEXT,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    birthday DATE,
    password_hash VARCHAR(255) NOT NULL, -- Hashed password
    emergency_contact_name VARCHAR(100),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sections Table
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(50) PRIMARY KEY, -- e.g., "CS-10A" (Course-YearPrefix-Letter)
    section_code VARCHAR(10) NOT NULL, -- e.g., "10A", "20B"
    course VARCHAR(100) NOT NULL,
    year_level VARCHAR(20) NOT NULL, -- e.g., "1st Year"
    adviser_id INT, -- Foreign key to teachers table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adviser_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY, -- Subject Code (e.g., CS101, MATH201)
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Section-Subject Assignments Table (Junction Table)
CREATE TABLE IF NOT EXISTS section_subject_assignments (
    id VARCHAR(100) PRIMARY KEY, -- Composite key for frontend simplicity (e.g., "CS-1A-CS101")
    section_id VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    teacher_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (section_id, subject_id) -- Ensure a subject is assigned only once per section
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Grades Table
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    term ENUM('Prelim', 'Midterm', 'Final') NOT NULL,
    grade DECIMAL(5, 2), -- Store grades like 85.00, 92.50, allows NULL
    remarks TEXT,
    submitted_by_teacher_id INT, -- Optional: Track who submitted/updated
    assignment_id VARCHAR(100), -- Optional: Link back to the specific assignment if needed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (assignment_id) REFERENCES section_subject_assignments(id) ON DELETE SET NULL, -- Added FK
    UNIQUE KEY unique_grade (student_id, subject_id, term) -- Ensure only one grade per student, subject, term
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT, -- Can be NULL for Admin, or link to teachers.id
    author_type ENUM('Admin', 'Teacher') NOT NULL,
    target_course VARCHAR(100) DEFAULT NULL, -- NULL or 'all' means all courses
    target_year_level VARCHAR(20) DEFAULT NULL, -- NULL or 'all' means all year levels
    target_section VARCHAR(50) DEFAULT NULL, -- NULL or 'all' means all sections
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES teachers(id) ON DELETE SET NULL -- Link if author is teacher
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add Indexes for performance
CREATE INDEX idx_student_username ON students(username);
CREATE INDEX idx_teacher_username ON teachers(username);
CREATE INDEX idx_student_section ON students(section);
CREATE INDEX idx_section_adviser ON sections(adviser_id);
CREATE INDEX idx_assignment_section ON section_subject_assignments(section_id);
CREATE INDEX idx_assignment_teacher ON section_subject_assignments(teacher_id);
CREATE INDEX idx_grade_student_subject ON grades(student_id, subject_id);
CREATE INDEX idx_announcement_targets ON announcements(target_course, target_year_level, target_section);


-- Example initial data might be added via seed.sql

    