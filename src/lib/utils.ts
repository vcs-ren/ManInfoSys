
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

// Helper function to generate teacher ID (e.g., t101)
// Assuming teacher ID follows a different pattern, maybe t + 1000 + dbId
export function generateTeacherId(dbId: number): string {
    return `t${1000 + dbId}`; // Example: if dbId=1, teacherId='t1001'
}

// Helper function to generate teacher username (e.g., t101)
export function generateTeacherUsername(teacherId: string): string {
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

    // Simple logic to cycle through A, B, C based on some counter or random for mock
    // For a real system, this needs to be more robust, e.g., count existing sections for that year.
    // For now, let's use a pseudo-random letter based on current time to vary it a bit for mocks
    const letters = ['A', 'B', 'C', 'D'];
    const letterIndex = Math.floor(Math.random() * letters.length); // More random sections for mock
    return `${prefix}${letters[letterIndex]}`;
}

    