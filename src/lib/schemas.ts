
import { z } from "zod";
import type { StudentStatus } from "@/types"; // Import the status type

const studentStatusEnum: [StudentStatus, ...StudentStatus[]] = ['New', 'Transferee', 'Continuing', 'Returnee'];


// Schema for adding/editing a student
export const studentSchema = z.object({
  id: z.number().optional(), // Optional for adding, required for editing reference
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  course: z.string().min(1, "Course is required"),
  // year: z.coerce.number().min(1, "Year is required").max(6, "Year seems too high"), // Removed year
  status: z.enum(studentStatusEnum, { required_error: "Status is required"}), // Added status validation
  section: z.string().optional(), // Section is now optional in the form, will be auto-assigned
  email: z.string().email("Invalid email address").optional().or(z.literal('')), // Optional email
  phone: z.string().optional().or(z.literal('')), // Optional phone
  // Generated fields - not part of the form input, but part of the type
  studentId: z.string().optional(),
});

// Schema for adding/editing a teacher
export const teacherSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  department: z.string().min(1, "Department is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  // Generated fields
  teacherId: z.string().optional(),
});

// Schema for grade submission
export const gradeSchema = z.object({
    subject: z.string().min(1, "Subject name is required"),
    grade: z.union([
        z.coerce.number().min(0, "Grade cannot be negative").max(100, "Grade seems too high"), // Assuming 0-100 scale
        z.string().regex(/^[A-F][+-]?$|^P$|^F$|^INC$|^DRP$/, "Invalid grade format (e.g., A+, B, 75, P, F)") // Allow letter grades, P/F, INC, DRP
    ]).refine(value => value !== '', { message: "Grade is required" }), // Ensure not empty string
    remarks: z.string().optional(),
});


// Schema for Profile Editing (Generic example - customize per role)
export const profileSchema = z.object({
   id: z.number(), // User ID is needed to update the correct record
   firstName: z.string().min(1, "First name is required"),
   lastName: z.string().min(1, "Last name is required"),
   email: z.string().email("Invalid email address").optional().or(z.literal('')),
   phone: z.string().optional().or(z.literal('')),
   // Add other editable fields specific to the role (e.g., department for teacher)
   // Password change might need a separate form/process
});

// Schema for Class Schedule Entry
export const scheduleEntrySchema = z.object({
    id: z.string().optional(), // Optional for new entries
    title: z.string().min(1, "Title is required"),
    start: z.date({ required_error: "Start date/time is required"}),
    end: z.date({ required_error: "End date/time is required"}),
    type: z.enum(['class', 'event', 'exam'], { required_error: "Type is required" }),
    location: z.string().optional(),
    // Potentially add fields like 'teacherId' or 'sectionId' depending on context
}).refine((data) => data.end >= data.start, {
    message: "End date cannot be before start date",
    path: ["end"], // Point error to 'end' field
});

