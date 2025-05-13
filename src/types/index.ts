// Shared types for the application

export type EnrollmentType = 'New' | 'Transferee' | 'Returnee';
export type EmploymentType = 'Regular' | 'Part Time';
export type AdminRole = 'Super Admin' | 'Sub Admin';
export type DepartmentType = 'Teaching' | 'Administrative';
export type CourseType = 'Major' | 'Minor';
export type YearLevel = '1st Year' | '2nd Year' | '3rd Year' | '4th Year';


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
    programId?: string[];
    yearLevel?: YearLevel;
}

export interface Program {
    id: string;
    name: string;
    description?: string;
    courses: {
        [key in YearLevel]: Course[];
    };
}

export interface Section {
    id: string;
    sectionCode: string;
    programId: string;
    programName?: string;
    yearLevel: YearLevel;
    adviserId?: number;
    adviserName?: string;
    studentCount?: number;
}

export interface SectionSubjectAssignment {
    id: string;
    sectionId: string;
    subjectId: string;
    subjectName?: string;
    teacherId: number;
    teacherName?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: Date;
    targetAudience?: 'Student' | 'Faculty' | 'All';
    target: {
        programId?: string | 'all' | null; // Changed from program
        yearLevel?: string | 'all' | null;
        section?: string | 'all' | null;
    };
    author?: string;
    author_type?: 'Admin' | 'Teacher';
}

export interface ScheduleEntry {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: 'class' | 'event' | 'exam';
    location?: string;
    teacher?: string;
    section?: string;
}

export interface StudentSubjectAssignmentWithGrades {
    assignmentId: string;
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
    id: string;
    subjectName: string;
    prelimGrade?: number | null;
    midtermGrade?: number | null;
    finalGrade?: number | null;
    finalRemarks?: string | null;
    status: 'Not Submitted' | 'Incomplete' | 'Complete';
}

export interface AdminUser {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: AdminRole;
  isSuperAdmin?: boolean;
}

export interface DashboardStats {
    totalStudents: number;
    totalFacultyStaff: number; // Renamed from totalTeachers/totalFaculty
    totalAdminUsers: number;  // Renamed from totalAdmins
    upcomingEvents: number;
}

export interface UpcomingItem {
    id: string;
    title: string;
    date?: string;
    type: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  description: string;
  targetId?: number | string;
  targetType?: 'student' | 'faculty' | 'program' | 'course' | 'section' | 'announcement' | 'admin';
  canUndo: boolean;
  originalData?: any;
}