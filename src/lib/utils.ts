import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DepartmentType, YearLevel } from "@/types"; // Import DepartmentType and YearLevel

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to generate 4 random digits as a string
function generateFourRandomDigits(): string {
  return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

// Helper function to generate student ID (e.g., 100XXXX)
// No longer uses dbId
export function generateStudentId(): string {
    const baseId = "100"; // Base for students
    return `${baseId}${generateFourRandomDigits()}`;
}

// Helper function to generate student username (e.g., s100XXXX)
export function generateStudentUsername(studentId: string): string {
    // studentId here is the full ID like "100XXXX"
    return `s${studentId}`;
}

// Helper function to generate faculty ID (e.g., 1000YYYY)
// No longer uses dbId
export function generateTeacherId(): string {
    const baseId = "1000"; // Base for faculty
    return `${baseId}${generateFourRandomDigits()}`;
}

// Helper function to generate faculty username based on department (e.g., t1000YYYY or a1000ZZZZ)
export function generateTeacherUsername(teacherId: string, department: DepartmentType): string {
     const prefix = department === 'Teaching' ? 't' : 'a';
     // Username combines prefix with the full teacherId (which now includes random digits)
     return `${prefix}${teacherId}`;
}

// Helper function to generate admin username (e.g., a1001BBBB)
// Note: This is for sub-admins derived from faculty. Super admin is 'admin'.
// This function might need re-evaluation if admin IDs are generated differently or tied to faculty IDs.
export function generateAdminUsername(facultyIdString: string): string {
    // Admin usernames for sub-admins derived from faculty use 'a' + their faculty ID string.
    return `a${facultyIdString}`;
}

// Helper function to generate section code (e.g., CS1A, IT2B)
export function generateSectionCode(programId: string, year: YearLevel, existingSectionCountForYearAndProgram: number): string {
    const yearPrefixMap: { [key in YearLevel]: string } = {
        "1st Year": "1",
        "2nd Year": "2",
        "3rd Year": "3",
        "4th Year": "4",
    };
    const yearNum = yearPrefixMap[year] || "1"; // Default to 1 if year is invalid/missing

    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // Expand letters if needed
    // Use existingSectionCountForYearAndProgram to cycle through letters for uniqueness within that year/program
    const letterIndex = existingSectionCountForYearAndProgram % letters.length;
    return `${programId.toUpperCase()}${yearNum}${letters[letterIndex]}`;
}

