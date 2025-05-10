import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DepartmentType, YearLevel } from "@/types"; // Import DepartmentType and YearLevel

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to generate student ID (e.g., 101)
export function generateStudentId(dbId: number): string {
    return `${100 + dbId}`; // Example: if dbId=1, studentId='101'
}

// Helper function to generate student username (e.g., s101)
export function generateStudentUsername(studentId: string): string {
    return `s${studentId}`; // Example: if studentId='101', username='s101'
}

// Helper function to generate faculty ID (numeric, e.g., 1001)
export function generateTeacherId(dbId: number): string {
    // IDs are simple numeric like 1001, 1002, based on DB auto-increment + 1000
    return `${1000 + dbId}`;
}

// Helper function to generate faculty username based on department (e.g., t1001 or a1002)
export function generateTeacherUsername(teacherId: string, department: DepartmentType): string {
     const prefix = department === 'Teaching' ? 't' : 'a';
     // Username combines prefix with the numeric part of teacherId
     return `${prefix}${teacherId}`; // Example: t1001 or a1002
}

// Helper function to generate admin username (e.g., a1001)
// Note: This is for sub-admins derived from faculty. Super admin is 'admin'.
export function generateAdminUsername(dbId: number): string {
    // Admin usernames (for sub-admins) might follow a similar pattern to administrative faculty
    return `a${1000 + dbId}`;
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
