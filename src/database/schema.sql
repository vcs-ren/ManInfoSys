
CREATE DATABASE IF NOT EXISTS campus_connect_db;
USE campus_connect_db;

-- Admins Table (For Super Admin primarily)
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty Table (Replaces Teachers table, includes Administrative staff)
CREATE TABLE IF NOT EXISTS faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., 1000XXXX
    username VARCHAR(50) NOT NULL UNIQUE, -- e.g., t1000XXXX or a1000XXXX
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    suffix VARCHAR(10),
    gender ENUM('Male', 'Female', 'Other'),
    birthday DATE,
    address TEXT,
    department ENUM('Teaching', 'Administrative') NOT NULL,
    employment_type ENUM('Regular', 'Part Time') NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    emergency_contact_name VARCHAR(200),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NULL DEFAULT NULL
);


-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., 100XXXX
    username VARCHAR(50) NOT NULL UNIQUE, -- e.g., s100XXXX
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    suffix VARCHAR(10),
    gender ENUM('Male', 'Female', 'Other'),
    birthday DATE,
    program VARCHAR(100) NOT NULL, -- References program ID
    enrollment_type ENUM('New', 'Transferee', 'Returnee') NOT NULL, -- Changed from status
    year ENUM('1st Year', '2nd Year', '3rd Year', '4th Year'),
    section VARCHAR(20), -- References section ID
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    emergency_contact_name VARCHAR(200),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NULL DEFAULT NULL
);

-- Programs Table
CREATE TABLE IF NOT EXISTS programs (
    id VARCHAR(20) PRIMARY KEY, -- e.g., CS, IT, BSED-ENG
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses (Subjects) Table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(20) PRIMARY KEY, -- e.g., CS101, ENG203, FIL101
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('Major', 'Minor') NOT NULL,
    -- For Major courses, this field might be populated or handled by program_courses linking
    -- For Minor courses, it would typically be empty here.
    -- This column might be better managed in a linking table if a course can be major to multiple programs
    -- For simplicity now, let's assume programId will be updated if needed for Majors
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Program-Courses Linking Table (Many-to-Many relationship)
-- Defines the curriculum: which courses belong to which program at which year level
CREATE TABLE IF NOT EXISTS program_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id VARCHAR(20) NOT NULL,
    course_id VARCHAR(20) NOT NULL,
    year_level ENUM('1st Year', '2nd Year', '3rd Year', '4th Year') NOT NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY (program_id, course_id, year_level) -- Ensure a course isn't added multiple times to the same year of a program
);


-- Sections Table
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(20) PRIMARY KEY, -- e.g., CS1A, IT2B
    section_code VARCHAR(20) NOT NULL UNIQUE, -- Redundant but kept for consistency if ID changes
    program_id VARCHAR(20) NOT NULL,
    year_level ENUM('1st Year', '2nd Year', '3rd Year', '4th Year') NOT NULL,
    adviser_id INT, -- Foreign key to faculty.id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (adviser_id) REFERENCES faculty(id) ON DELETE SET NULL
);

-- Section-Subject-Assignments (Class Assignments) Table
CREATE TABLE IF NOT EXISTS section_subject_assignments (
    id VARCHAR(50) PRIMARY KEY, -- Composite: section_id + '-' + subject_id
    section_id VARCHAR(20) NOT NULL,
    subject_id VARCHAR(20) NOT NULL, -- References courses.id
    teacher_id INT NOT NULL, -- References faculty.id
    -- schedule_details TEXT, -- Could be JSON or link to a more complex schedule table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES faculty(id) ON DELETE CASCADE,
    UNIQUE KEY (section_id, subject_id) -- A subject can only be assigned once per section
);


-- Grades Table
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id VARCHAR(20) NOT NULL, -- References courses.id
    assignment_id VARCHAR(50), -- References section_subject_assignments.id (optional but good for context)
    term ENUM('Prelim', 'Midterm', 'Final') NOT NULL,
    grade DECIMAL(5, 2), -- e.g., 95.50, allows for null
    remarks TEXT,
    submitted_by_teacher_id INT, -- References faculty.id of who submitted/updated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES section_subject_assignments(id) ON DELETE SET NULL,
    FOREIGN KEY (submitted_by_teacher_id) REFERENCES faculty(id) ON DELETE SET NULL,
    UNIQUE KEY (student_id, subject_id, term) -- One grade per student, per subject, per term
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT, -- Can be Admin (null) or Faculty ID
    author_type ENUM('Admin', 'Teacher') NOT NULL, -- Keep 'Teacher' for faculty author
    target_audience ENUM('Student', 'Faculty', 'All') DEFAULT 'All',
    target_program VARCHAR(20) DEFAULT NULL, -- Program ID, or 'all'
    target_year_level VARCHAR(20) DEFAULT NULL, -- e.g., '1st Year', 'all'
    target_section VARCHAR(20) DEFAULT NULL, -- Section ID, or 'all'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES faculty(id) ON DELETE SET NULL -- If author_type is 'Teacher'
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(50), -- Username or system identifier
    user_role VARCHAR(20), -- Admin, Teacher, Student, System
    action VARCHAR(255) NOT NULL,
    description TEXT,
    target_entity_type VARCHAR(50), -- e.g., student, faculty, course
    target_entity_id VARCHAR(50), -- ID of the affected entity
    can_undo BOOLEAN DEFAULT FALSE,
    original_data TEXT -- JSON string of data before change, for undo
);

-- Indexes for performance
CREATE INDEX idx_student_program_year ON students(program, year);
CREATE INDEX idx_section_program_year ON sections(program_id, year_level);
CREATE INDEX idx_grades_student_subject ON grades(student_id, subject_id);
CREATE INDEX idx_ssa_teacher_subject ON section_subject_assignments(teacher_id, subject_id);
CREATE INDEX idx_announcements_target ON announcements(target_program, target_year_level, target_section);
