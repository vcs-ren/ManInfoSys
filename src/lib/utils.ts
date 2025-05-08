
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DepartmentType } from "@/types"; // Import DepartmentType

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
    return `${1000 + dbId}`; // Numeric ID like 1001, 1002
}

// Helper function to generate faculty username based on department (e.g., t1001 or a1002)
export function generateTeacherUsername(teacherId: string, department: DepartmentType): string {
     const prefix = department === 'Teaching' ? 't' : 'a';
     return `${prefix}${teacherId}`; // Example: t1001 or a1002
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

