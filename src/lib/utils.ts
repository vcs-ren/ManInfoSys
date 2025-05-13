
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DepartmentType, YearLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function generateFourRandomDigits(): string {
  // Generate a number between 0000 and 9999
  const randomNumber = Math.floor(Math.random() * 10000);
  // Pad with leading zeros if necessary to ensure 4 digits
  return randomNumber.toString().padStart(4, '0');
}


export function generateStudentId(): string {
    const baseId = "100";
    // This will generate IDs like 1000000 to 1009999
    return `${baseId}${generateFourRandomDigits()}`;
}

export function generateStudentUsername(studentId: string): string {
    // Username is 's' + studentId (e.g., s100XXXX)
    return `s${studentId}`;
}

export function generateTeacherId(): string {
    const baseId = "1000";
    // This will generate IDs like 10000000 to 10009999
    return `${baseId}${generateFourRandomDigits()}`;
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
    const yearNum = yearPrefixMap[year] || "1"; // Default to "1" if year is not in map

    // Ensure programId is a string and convert to uppercase
    const safeProgramId = typeof programId === 'string' ? programId.toUpperCase() : 'PROG';


    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // Use existingSectionCountForYearAndProgram to determine the letter.
    // If count is 0, letter is A. If 1, B, and so on.
    // This handles more than 8 sections by cycling through letters or adding numbers, though the current letter array is limited.
    const letterIndex = existingSectionCountForYearAndProgram % letters.length;
    const cycleCount = Math.floor(existingSectionCountForYearAndProgram / letters.length);
    
    const sectionSuffix = cycleCount > 0 ? `${letters[letterIndex]}${cycleCount + 1}` : letters[letterIndex];

    return `${safeProgramId}${yearNum}${sectionSuffix}`;
}
