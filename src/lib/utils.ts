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

// Helper function to generate student ID (e.g., 101XXXX)
export function generateStudentId(dbId: number): string {
    const baseId = (100 + dbId).toString();
    return `${baseId}${generateFourRandomDigits()}`; 
}

// Helper function to generate student username (e.g., s101XXXX)
export function generateStudentUsername(studentId: string): string {
    // studentId here is the full ID like "101XXXX"
    return `s${studentId}`; 
}

// Helper function to generate faculty ID (e.g., 1001YYYY)
export function generateTeacherId(dbId: number): string {
    // IDs are base (1000 + dbId) + 4 random digits
    const baseId = (1000 + dbId).toString();
    return `${baseId}${generateFourRandomDigits()}`;
}

// Helper function to generate faculty username based on department (e.g., t1001YYYY or a1002ZZZZ)
export function generateTeacherUsername(teacherId: string, department: DepartmentType): string {
     const prefix = department === 'Teaching' ? 't' : 'a';
     // Username combines prefix with the full teacherId (which now includes random digits)
     return `${prefix}${teacherId}`; 
}

// Helper function to generate admin username (e.g., a1001BBBB)
// Note: This is for sub-admins derived from faculty. Super admin is 'admin'.
export function generateAdminUsername(dbId: number): string {
    // Admin usernames (for sub-admins) might follow a similar pattern to administrative faculty
    const baseId = (1000 + dbId).toString(); // Using same base as faculty for consistency
    return `a${baseId}${generateFourRandomDigits()}`;
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

