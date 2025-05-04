
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
  section: string;
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

export interface Grade {
    subject: string;
    grade: number | string; // Can be numeric or letter grade
    remarks?: string;
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

// Define more types as needed (e.g., Course, Section, Announcement)


