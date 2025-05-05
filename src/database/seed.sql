
-- SQL script to seed the database with initial data, including a default admin user.
-- Make sure to run this script against your `campus_connect_db` database.

-- Create the 'admins' table if it doesn't exist.
-- Adjust column types and constraints as needed for your specific setup.
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert the default admin user.
-- The password 'defadmin' is hashed using PHP's password_hash() with PASSWORD_DEFAULT.
-- You should generate this hash securely in your environment and update it here.
-- Example hash for 'defadmin': (Generate this using password_hash('defadmin', PASSWORD_DEFAULT))
-- Replace the placeholder hash below with your generated hash.
INSERT INTO `admins` (`username`, `password_hash`)
VALUES ('admin', '$2y$10$EXAMPLE.HASH.FOR.DEFADMIN.REPLACE.ME'); -- <<< REPLACE THIS HASH!

-- Example command to generate the hash in PHP:
-- php -r "echo password_hash('defadmin', PASSWORD_DEFAULT);"

-- You might also want to seed other tables like 'subjects', 'sections' etc. here.

-- Example: Add some subjects
-- CREATE TABLE IF NOT EXISTS `subjects` (
--   `id` VARCHAR(50) PRIMARY KEY, -- e.g., CS101
--   `name` VARCHAR(100) NOT NULL,
--   `description` TEXT
-- );
-- INSERT INTO `subjects` (`id`, `name`, `description`) VALUES
-- ('CS101', 'Introduction to Computer Science', 'Fundamentals of programming and computer systems.'),
-- ('IT201', 'Networking Basics', 'Introduction to computer networks and protocols.'),
-- ('BA101', 'Principles of Management', 'Core concepts of business management.');


-- Example: Add some sections (assuming no dependencies first)
-- CREATE TABLE IF NOT EXISTS `sections` (
--   `id` VARCHAR(50) PRIMARY KEY, -- e.g., CS-1-A
--   `section_code` VARCHAR(10) NOT NULL, -- e.g., 10A
--   `course` VARCHAR(100) NOT NULL,
--   `year_level` VARCHAR(20) NOT NULL, -- e.g., 1st Year
--   `adviser_id` INT NULL, -- Foreign key to teachers table
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   UNIQUE KEY `unique_section` (`course`, `year_level`, `section_code`),
--   FOREIGN KEY (`adviser_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL
-- );
-- INSERT INTO `sections` (`id`, `section_code`, `course`, `year_level`) VALUES
-- ('CS-1-A', '10A', 'Computer Science', '1st Year'),
-- ('IT-2-B', '20B', 'Information Technology', '2nd Year'),
-- ('BA-1-C', '10C', 'Business Administration', '1st Year');

-- Remember to adjust table structures and foreign keys based on your actual schema.
-- Add CREATE TABLE statements for students, teachers, grades, etc. if they don't exist.

