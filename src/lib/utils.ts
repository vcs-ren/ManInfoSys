
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DepartmentType, YearLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function generateRandomDigits(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}


export function generateStudentId(): string {
    const baseId = "100"; 
    // Generate unique 4 digits until a unique ID is found (less likely to collide in mock)
    // For a real system, DB sequence or UUID is better.
    let randomDigits = generateRandomDigits(4);
    // In a real app, you'd check against existing IDs in the database.
    // For mock, this simple generation is usually sufficient for small datasets.
    return `${baseId}${randomDigits}`;
}

export function generateStudentUsername(studentId: string): string {
    return `s${studentId}`;
}

export function generateTeacherId(): string {
    const baseId = "1000";
    let randomDigits = generateRandomDigits(4);
    // Similar uniqueness consideration as generateStudentId
    return `${baseId}${randomDigits}`;
}

export function generateTeacherUsername(teacherId: string, department: DepartmentType): string {
     const prefix = department === 'Teaching' ? 't' : 'a';
     return `${prefix}${teacherId}`;
}

// This function is mainly for display purposes on the frontend after a reset.
// The actual password hashing and storage happens on the backend.
export function generateDefaultPasswordDisplay(lastName: string): string {
    if (typeof lastName !== 'string' || lastName.length < 2) {
        lastName = "User"; // Fallback if lastName is too short or invalid
    }
    const firstTwoLetters = lastName.substring(0, 2).toUpperCase();
    return `@${firstTwoLetters}1001`;
}


export function generateSectionCode(programId: string, year: YearLevel, existingSectionCountForYearAndProgram: number): string {
    const yearPrefixMap: { [key in YearLevel]: string } = {
        "1st Year": "1",
        "2nd Year": "2",
        "3rd Year": "3",
        "4th Year": "4",
    };
    const yearNum = yearPrefixMap[year] || "1"; 

    const safeProgramId = typeof programId === 'string' ? programId.toUpperCase() : 'PROG';

    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const letterIndex = existingSectionCountForYearAndProgram % letters.length;
    const cycleCount = Math.floor(existingSectionCountForYearAndProgram / letters.length);
    
    const sectionSuffix = cycleCount > 0 ? `${letters[letterIndex]}${cycleCount + 1}` : letters[letterIndex];

    return `${safeProgramId}${yearNum}${sectionSuffix}`;
}
