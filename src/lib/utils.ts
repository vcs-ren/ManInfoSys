
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to generate student ID (e.g., s1001)
export function generateStudentId(dbId: number): string {
    return `s${1000 + dbId}`;
}

// Helper function to generate teacher ID (e.g., t1001)
export function generateTeacherId(dbId: number): string {
    return `t${1000 + dbId}`;
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
    const randomLetter = String.fromCharCode(65 + (Math.floor(Math.random() * 3))); // A, B, or C
    return `${prefix}${randomLetter}`;
}
