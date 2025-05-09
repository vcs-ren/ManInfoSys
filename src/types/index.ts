
// Shared types for the application

export type StudentStatus = 'New' | 'Transferee' | 'Returnee';
export type EmploymentType = 'Regular' | 'Part Time'; // Added employment type
export type AdminRole = 'Super Admin' | 'Sub Admin';
export type DepartmentType = 'Teaching' | 'Administrative'; // Defined Department types
export type CourseType = 'Major' | 'Minor'; // Added Course Type
export type YearLevel = '1st Year' | '2nd Year' | '3rd Year' | '4th Year'; // Define YearLevel type


export interface Student {
  id: number; // Database ID
  studentId: string; // e.g., "101", "102" - Generated ID (100 + DB ID)
  username: string; // e.g., "s101", "s102" - Generated username (s + studentId)
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  gender?: 'Male' | 'Female' | 'Other';
  birthday?: string; // YYYY-MM-DD format
  course: string; // References Program Name (UI Label: Program) - Keep key as 'course' for backend
  status: StudentStatus;
  year?: YearLevel; // Use YearLevel type
  section: string; // e.g., "CS-1A", "IT-1B" - Auto-generated
  email?: string;
  phone?: string;
  // Detailed emergency contact info
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  lastAccessed?: string | null; // ISO date string or null
}

// Renamed Teacher to Faculty and updated department type
export interface Faculty {
  id: number; // Database ID
  teacherId: string; //  e.g., "1001", "1002" (DB ID + 1000)
  username: string; // Prefixed e.g., "t1001", "a1002"
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  gender?: 'Male' | 'Female' | 'Other';
  employmentType: EmploymentType; // Make employmentType non-optional
  address?: string;
  department: DepartmentType; // Updated to use defined types
  email?: string;
  phone?: string;
  birthday?: string; // YYYY-MM-DD format
  // Emergency Contact Fields
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  lastAccessed?: string | null; // ISO date string or null
}

// Defines the grading periods
export type Term = 'Prelim' | 'Midterm' | 'Final';

// Represents a single grade entry for a specific student, subject, and term
// This is likely more for backend/database structure
export interface StudentGradeEntry {
    id?: string; // Optional: ID if stored in a DB
    studentId: number;
    subjectId: string; // Represents the Course ID
    term: Term;
    grade: number | null; // Only numeric or null
    remarks?: string;
}

// Represents a course
export interface Course {
    id: string; // Unique identifier (e.g., "CS101")
    name: string; // e.g., "Introduction to Programming"
    description?: string;
    type: CourseType; // Major or Minor
    programId?: string[]; // Array of Program IDs if type is Major, to allow a course to be a major in multiple programs
    yearLevel?: YearLevel; // Year level this course is typically assigned in
}


// Represents a program offered by the institution
export interface Program {
    id: string; // Unique identifier (e.g., "CS")
    name: string; // Full name (e.g., "Computer Science")
    description?: string;
    // Courses grouped by year level, references Course IDs or full Course objects
    courses: {
        [key in YearLevel]: Course[]; // e.g., "1st Year": [Course, Course, ...]
    };
}


// Represents a specific class section (now references Program ID)
export interface Section {
    id: string; // Unique identifier for the section (e.g., "CS-1A")
    sectionCode: string; // e.g., "1A", "2B" - Auto-generated based on year and count
    programId: string; // References Program.id (e.g., "CS")
    programName?: string; // Denormalized program name
    yearLevel: YearLevel; // Use YearLevel type
    adviserId?: number;
    adviserName?: string;
    studentCount?: number;
}

// Represents the assignment of a faculty member to a course within a specific section
export interface SectionSubjectAssignment {
    id: string; // Unique ID for the assignment itself (e.g., sectionId-subjectId)
    sectionId: string;
    subjectId: string; // Course ID
    subjectName?: string; // Denormalized course name
    teacherId: number; // Keep as teacherId for backend consistency
    teacherName?: string; // Denormalized faculty name
}


// Represents an announcement
export interface Announcement {
    id: string; // Unique identifier
    title: string;
    content: string;
    date: Date; // Changed to Date type
    target: {
        course?: string | 'all' | null; // Program target using Program ID (keep key as 'course')
        yearLevel?: string | 'all' | null; // Specific year level or 'all' or null
        section?: string | 'all' | null; // Specific section or 'all' or null
    };
    author?: string; // Optional: Name of the admin/faculty who posted
    author_type?: 'Admin' | 'Teacher'; // Keep 'Teacher' for backend consistency
}


export interface ScheduleEntry {
    id: string; // Unique identifier for the schedule entry
    title: string; // e.g., "Introduction to Programming - CS-1A"
    start: Date;
    end: Date;
    type: 'class' | 'event' | 'exam';
    location?: string;
    teacher?: string; // For student view (displays faculty name)
    section?: string; // For faculty view
}


// Type for displaying student-subject assignments in the faculty's grade submission table
export interface StudentSubjectAssignmentWithGrades {
    assignmentId: string; // Unique ID combining student-subject for this context
    studentId: number;
    studentName: string;
    subjectId: string; // Course ID
    subjectName: string; // Course Name
    section: string; // Section Code (e.g., CS-1A)
    year: YearLevel; // Use YearLevel type
    prelimGrade?: number | null; // Numeric grade only (or null/undefined)
    prelimRemarks?: string | null;
    midtermGrade?: number | null; // Numeric grade only (or null/undefined)
    midtermRemarks?: string | null;
    finalGrade?: number | null; // Numeric grade only (or null/undefined)
    finalRemarks?: string | null;
    status: 'Not Submitted' | 'Incomplete' | 'Complete';
}

// Type representing the grades a student sees (per subject/course across terms)
export interface StudentTermGrade {
    id: string; // Can be subjectId or a unique identifier for the row
    subjectName: string; // Course Name
    prelimGrade?: number | null; // Numeric grade only
    midtermGrade?: number | null; // Numeric grade only
    finalGrade?: number | null; // Numeric grade only
    finalRemarks?: string | null; // Optional final remark from teacher
    status: 'Not Submitted' | 'Incomplete' | 'Complete'; // Derived status
}

export interface AdminUser {
  id: number;
  username: string;
  firstName?: string; // Added optional first name
  lastName?: string;  // Added optional last name
  email?: string; // Email is required by form schema
  role: AdminRole; // Use AdminRole type
  isSuperAdmin?: boolean;
}

// Interface for dashboard stats fetched from API
export interface DashboardStats {
    totalStudents: number;
    totalTeachers: number; // Faculty with 'Teaching' department
    totalAdmins: number;   // Faculty with 'Administrative' department (excluding Super Admin)
    upcomingEvents: number;
    totalFaculty: number; // New: Total faculty members
}

// Interface for upcoming items (simplified) - Keep this if used by mock data
export interface UpcomingItem {
    id: string;
    title: string;
    date?: string; // Date might be string from API
    type: string; // Keep type flexible
}

// Interface for Activity Log Entries
export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  user: string; // e.g., "Admin", "System", or specific username if available
  action: string; // e.g., "Added Student", "Deleted Faculty"
  description: string; // e.g., "John Doe (s103)", "Jane Smith (t1003)"
  targetId?: number | string; // ID of the entity affected (studentId, facultyId, etc.)
  targetType?: 'student' | 'faculty' | 'program' | 'course' | 'section' | 'announcement' | 'admin';
  canUndo: boolean;
  originalData?: any; // To store data for undo operation
}
