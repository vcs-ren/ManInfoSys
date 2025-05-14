// Shared types for the application

export type EnrollmentType = 'New' | 'Transferee' | 'Returnee' | 'Continuing';
export type EmploymentType = 'Regular' | 'Part Time';
export type AdminRole = 'Super Admin' | 'Sub Admin';
export type DepartmentType = 'Teaching' | 'Administrative';
export type CourseType = 'Major' | 'Minor';
export type YearLevel = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';


export interface Student {
  id: number; // Database ID
  studentId: string; // e.g., "100XXXX"
  username: string; // e.g., "s100XXXX"
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  gender?: 'Male' | 'Female' | 'Other';
  birthday?: string; // YYYY-MM-DD format
  program: string; // References Program ID (UI Label: Program)
  enrollmentType: EnrollmentType;
  year?: YearLevel;
  section: string; // e.g., "CS1A", "IT1B" - Auto-generated
  email?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  lastAccessed?: string | null;
}

export interface Faculty {
  id: number; // Database ID
  facultyId: string; // e.g., "1000YYYY"
  username: string; // Prefixed e.g., "t1000YYYY", "a1000ZZZZ"
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  gender?: 'Male' | 'Female' | 'Other';
  employmentType: EmploymentType;
  address?: string;
  department: DepartmentType;
  email?: string;
  phone?: string;
  birthday?: string; // YYYY-MM-DD format
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  lastAccessed?: string | null;
}

export type Term = 'Prelim' | 'Midterm' | 'Final';

export interface StudentGradeEntry {
    id?: string;
    studentId: number;
    subjectId: string;
    term: Term;
    grade: number | null;
    remarks?: string;
}

export interface Course {
    id: string;
    name: string;
    description?: string;
    type: CourseType;
    programId?: string[]; // Can belong to multiple programs if Major (though typically one), or none if Minor
    yearLevel?: YearLevel; // The year level this course is typically taught
}

export interface Program {
    id: string; // e.g., CS, IT, BSED-ENG
    name: string; // e.g., Bachelor of Science in Computer Science
    description?: string;
    // Defines which courses are part of this program for each year level
    courses: {
        [key in YearLevel]: Course[];
    };
}

export interface Section {
    id: string; // Auto-generated, e.g., CS1A, IT2B
    sectionCode: string; // Same as ID, but explicitly named
    programId: string; // FK to Program
    programName?: string; // For display
    yearLevel: YearLevel;
    adviserId?: number; // FK to Faculty
    adviserName?: string; // For display
    studentCount?: number; // For display
}

export interface SectionSubjectAssignment {
    id: string; // Auto-generated, e.g., CS1A-CS101
    sectionId: string; // FK to Section
    subjectId: string; // FK to Course (Subject)
    subjectName?: string; // For display
    teacherId: number; // FK to Faculty
    teacherName?: string; // For display
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: Date;
    targetAudience?: 'Student' | 'Faculty' | 'All';
    target: {
        programId?: string | 'all' | null;
        yearLevel?: string | 'all' | null;
        section?: string | 'all' | null;
    };
    author?: string; // Name of the author
    author_type?: 'Admin' | 'Teacher'; // Role of the author
}

export interface ScheduleEntry {
    id: string; // Unique ID for the schedule entry (e.g., sectionId-courseId-day-time)
    title: string; // e.g., "CS101 - Intro to Programming"
    start: Date; // Start date and time
    end: Date;   // End date and time
    type: 'class' | 'event' | 'exam';
    location?: string; // e.g., "Room 301"
    teacher?: string;  // Name of the teacher
    section?: string;  // Section code, e.g., "CS1A"
}

export interface StudentSubjectAssignmentWithGrades {
    assignmentId: string; // Unique ID for this specific student-subject-section context, e.g., CS1A-CS101-student123
    studentId: number;
    studentName: string;
    subjectId: string;
    subjectName: string;
    section: string;
    year: YearLevel;
    prelimGrade?: number | null;
    prelimRemarks?: string | null;
    midtermGrade?: number | null;
    midtermRemarks?: string | null;
    finalGrade?: number | null;
    finalRemarks?: string | null;
    status: 'Not Submitted' | 'Incomplete' | 'Complete';
}

export interface StudentTermGrade {
    id: string; // subjectId
    subjectName: string;
    prelimGrade?: number | null;
    midtermGrade?: number | null;
    finalGrade?: number | null;
    finalRemarks?: string | null;
    status: 'Not Submitted' | 'Incomplete' | 'Complete';
}

export interface AdminUser {
  id: number; // Database ID
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: AdminRole;
  isSuperAdmin?: boolean; // True for the main 'admin' account
}

export interface DashboardStats {
    totalStudents: number;
    totalTeachingStaff: number;
    totalAdministrativeStaff: number;
    totalEventsAnnouncements: number;
    // totalAdmins field removed as it's no longer a separate card
}

export interface UpcomingItem {
    id: string;
    title: string;
    date?: string; // ISO string format
    type: string; // e.g., 'assignment', 'event', 'class'
}

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  user: string; // Username or role of the user performing the action
  action: string; // e.g., "Added Student", "Deleted Faculty"
  description: string; // More details, e.g., "Student John Doe (s100123) was added."
  targetId?: number | string; // ID of the entity affected (studentId, facultyId, etc.)
  targetType?: 'student' | 'faculty' | 'program' | 'course' | 'section' | 'announcement' | 'admin' | 'grade' | 'assignment' | 'login' | 'logout' | 'password_change' | 'system';
  canUndo: boolean;
  originalData?: any; // To store data needed for undo operation
}

// --- Attendance Specific Types ---
export interface AttendanceRecord {
  id: string; // Unique ID for the attendance entry OR composite key like studentId-subjectId-date
  studentId: number;
  studentName?: string; // For display on teacher's side
  subjectId: string;
  subjectName?: string; // For display
  sectionId?: string; // To identify the specific class instance
  date: string; // ISO Date string YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string; // Optional remarks by teacher
  teacherId?: number; // Who marked the attendance
}

export interface TeacherClassInfo { // Represents a class a teacher is assigned to
  id: string; // Could be sectionSubjectAssignment.id
  subjectName: string;
  subjectId: string;
  sectionCode: string;
  sectionId: string;
  yearLevel?: YearLevel;
}

// For the student attendance form in the teacher's view
export interface StudentAttendanceData {
  studentId: number;
  studentName: string; // For display in table
  status: AttendanceStatus;
  remarks: string;
}
