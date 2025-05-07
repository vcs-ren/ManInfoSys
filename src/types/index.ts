

// Shared types for the application

export type StudentStatus = 'New' | 'Transferee' | 'Continuing' | 'Returnee';

export interface Student {
  id: number; // Database ID
  studentId: string; // e.g., "s1001" - Generated ID (1000 + DB ID)
  firstName: string;
  lastName: string;
  course: string;
  status: StudentStatus; // Replaces year level
  year?: string; // Optional year level (e.g., '1st Year', '2nd Year')
  section: string; // e.g., "10A", "20B"
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
  teacherId: string; // e.g., "t1001" - Generated ID (1000 + DB ID)
  firstName: string;
  lastName: string;
  department: string;
  email?: string; // Optional fields
  phone?: string;
  // Add other relevant teacher fields
}

// Defines the grading periods
export type Term = 'Prelim' | 'Midterm' | 'Final';

// Represents a single grade entry for a specific student, subject, and term
// This is likely more for backend/database structure
export interface StudentGradeEntry {
    id?: string; // Optional: ID if stored in a DB
    studentId: number;
    subjectId: string;
    term: Term;
    grade: number | null; // Only numeric or null
    remarks?: string;
}


// Represents a specific class section
export interface Section {
    id: string; // Unique identifier for the section (e.g., "CS-10A")
    sectionCode: string; // e.g., "10A"
    course: string; // e.g., "Computer Science"
    yearLevel: string; // e.g., "1st Year"
    adviserId?: number; // ID of the assigned adviser (previously teacherId)
    adviserName?: string; // Optional: Denormalized adviser name for display (previously teacherName)
    studentCount?: number; // Optional: Number of students in the section
}

// Represents a subject
export interface Subject {
    id: string; // Unique identifier (e.g., "MATH101")
    name: string; // e.g., "Mathematics 101"
    description?: string;
    // Potentially add course/year level relevance
}

// Represents the assignment of a teacher to a subject within a specific section
export interface SectionSubjectAssignment {
    id: string; // Unique ID for the assignment itself
    sectionId: string;
    subjectId: string;
    subjectName?: string; // Denormalized subject name
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
        course?: string | 'all'; // Specific course or 'all'
        yearLevel?: string | 'all'; // Specific year level or 'all'
        section?: string | 'all'; // Specific section or 'all'
    };
    author?: string; // Optional: Name of the admin/teacher who posted
}


export interface ScheduleEntry {
    id: string; // Unique identifier for the schedule entry
    title: string; // e.g., "Math 101 - Section A"
    start: Date;
    end: Date;
    type: 'class' | 'event' | 'exam';
    location?: string;
    teacher?: string; // For student view
    section?: string; // For teacher view
}


// Type for displaying student-subject assignments in the teacher's grade submission table
// Includes placeholder grades for each term. Status is used internally for logic,
// but the UI might display "Passed"/"Failed" in the Remarks column if status is "Complete".
export interface StudentSubjectAssignmentWithGrades {
    assignmentId: string; // Unique ID combining student and subject for this context
    studentId: number;
    studentName: string;
    subjectId: string;
    subjectName: string;
    section: string;
    year: string; // Add year level for filtering
    prelimGrade?: number | null; // Numeric grade only (or null/undefined)
    prelimRemarks?: string;
    midtermGrade?: number | null; // Numeric grade only (or null/undefined)
    midtermRemarks?: string;
    finalGrade?: number | null; // Numeric grade only (or null/undefined)
    finalRemarks?: string;
    // Status calculated based on term grades, used for internal logic
    status: 'Not Submitted' | 'Incomplete' | 'Complete';
}

// Type representing the grades a student sees (per subject across terms)
// This replaces the previous simple Grade type
export interface StudentTermGrade {
    id: string; // Can be subjectId or a unique identifier for the row
    subjectName: string;
    prelimGrade?: number | null; // Numeric grade only
    midtermGrade?: number | null; // Numeric grade only
    finalGrade?: number | null; // Numeric grade only
    finalRemarks?: string; // Optional final remark from teacher
    status: 'Not Submitted' | 'Incomplete' | 'Complete'; // Derived status
}

export interface AdminUser {
  id: number;
  username: string;
  firstName?: string; // Made optional
  lastName?: string; // Made optional
  email?: string; // Email is now optional at the type level, but required by the form schema
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

// Define more types as needed (e.g., Course)
