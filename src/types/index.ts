
// Shared types for the application

export type StudentStatus = 'New' | 'Transferee' | 'Returnee'; // Removed 'Continuing'
export type EmploymentType = 'Regular' | 'Part Time'; // Added employment type

export interface Student {
  id: number; // Database ID
  studentId: string; // e.g., "101", "102" - Generated ID (100 + DB ID)
  username: string; // e.g., "s101", "s102" - Generated username (s + studentId)
  firstName: string;
  lastName: string;
  middleName?: string; // Added
  suffix?: string; // Added
  gender?: 'Male' | 'Female' | 'Other'; // Added
  birthday?: string; // Added (YYYY-MM-DD format)
  course: string; // Keep backend key, label as "Program" in UI
  status: StudentStatus;
  year?: string; // Optional year level (e.g., '1st Year', '2nd Year')
  section: string; // e.g., "10A", "20B" - Auto-generated
  email?: string; // Optional fields
  phone?: string;
  // Detailed emergency contact info
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  // Add other relevant student fields
}

export interface Teacher {
  id: number; // Database ID
  teacherId: string; // e.g., "t1001", "t1002" - Generated ID (t + 1000 + DB ID)
  username: string; // e.g., "t1001", "t1002" - Generated username (same as teacherId)
  firstName: string;
  lastName: string;
  middleName?: string; // Added
  suffix?: string; // Added
  gender?: 'Male' | 'Female' | 'Other'; // Added
  employmentType?: EmploymentType; // Added
  address?: string; // Added teacher's address
  department: string; // Make department optional? No, required in form
  email?: string; // Optional fields
  phone?: string; // Renamed from contact number for consistency
  birthday?: string; // Added (use string YYYY-MM-DD for simplicity)
  // Added Emergency Contact Fields
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  // Add other relevant teacher fields
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


// Represents a specific class section
export interface Section {
    id: string; // Unique identifier for the section (e.g., "CS-1A")
    sectionCode: string; // e.g., "1A", "2B" - Auto-generated based on year and count
    course: string; // Keep backend key, label as "Program" in UI (e.g., "Computer Science")
    yearLevel: string; // e.g., "1st Year"
    adviserId?: number; // ID of the assigned adviser (previously teacherId)
    adviserName?: string; // Optional: Denormalized adviser name for display (previously teacherName)
    studentCount?: number; // Optional: Number of students in the section
}

// Represents a course (previously Subject)
export interface Subject { // Keep name Subject for now to avoid breaking existing code, but it means Course
    id: string; // Unique identifier (e.g., "CS101")
    name: string; // e.g., "Introduction to Programming"
    description?: string;
}

// Represents the assignment of a teacher to a course(subject) within a specific section
export interface SectionSubjectAssignment {
    id: string; // Unique ID for the assignment itself (e.g., sectionId-subjectId)
    sectionId: string;
    subjectId: string; // Course ID
    subjectName?: string; // Denormalized course name
    teacherId: number;
    teacherName?: string; // Denormalized teacher name
}


// Represents an announcement
export interface Announcement {
    id: string; // Unique identifier
    title: string;
    content: string;
    date: Date; // Changed to Date type
    target: {
        course?: string | 'all' | null; // Program/Course target
        yearLevel?: string | 'all' | null; // Specific year level or 'all' or null
        section?: string | 'all' | null; // Specific section or 'all' or null
    };
    author?: string; // Optional: Name of the admin/teacher who posted
    author_type?: 'Admin' | 'Teacher'; // Added author type
}


export interface ScheduleEntry {
    id: string; // Unique identifier for the schedule entry
    title: string; // e.g., "Introduction to Programming - CS-1A"
    start: Date;
    end: Date;
    type: 'class' | 'event' | 'exam';
    location?: string;
    teacher?: string; // For student view
    section?: string; // For teacher view
}


// Type for displaying student-subject assignments in the teacher's grade submission table
export interface StudentSubjectAssignmentWithGrades {
    assignmentId: string; // Unique ID combining student-subject for this context
    studentId: number;
    studentName: string;
    subjectId: string; // Course ID
    subjectName: string; // Course Name
    section: string; // Section Code (e.g., CS-1A)
    year: string; // Add year level for filtering
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
  firstName?: string; // Made optional
  lastName?: string; // Made optional
  email?: string; // Email is required by form schema
  isSuperAdmin?: boolean; // To differentiate the main admin
  // password field should not be part of this type for security
}

// Interface for dashboard stats fetched from API
export interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number; // Added totalAdmins
    upcomingEvents: number;
    // Add more stats as needed
}

// Interface for upcoming items (simplified) - Keep this if used by mock data
export interface UpcomingItem {
    id: string;
    title: string;
    date?: string; // Date might be string from API
    type: string; // Keep type flexible
}
