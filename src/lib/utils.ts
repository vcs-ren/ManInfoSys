
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

// Renamed function to generate faculty ID (e.g., t1001)
// Helper function to generate teacher ID based on department (e.g., t1001 or a1001)
export function generateTeacherId(dbId: number): string { // Keep function name for compatibility with backend expectations if necessary
    return `${1000 + dbId}`;
}

// Helper function to generate faculty username (e.g., t1001 or a1001)
export function generateTeacherUsername(teacherId: string): string { // Keep function name for compatibility
     return `${teacherId}`; // Username is the same as teacherId

}

// Helper function to generate admin username (e.g., a1001)
export function generateAdminUsername(dbId: number): string {
    return `a${1000 + dbId}`;
}

// Helper function to generate section code (e.g., 10A, 20B)
export function generateSectionCode(year: string): string {
    const yearPrefixMap: { [key: string]: string } = {
        "1st Year": "10",
        "2nd Year": "20",
        "3rd Year": "30",
        "4th Year": "40",
    };
    const prefix = yearPrefixMap[year] || "10"; // Default to 10 if year is invalid/missing
    const letters = ['A', 'B', 'C', 'D'];
    const letterIndex = Math.floor(Math.random() * letters.length);
    return `${prefix}${letters[letterIndex]}`;
}
