import { z } from "zod";
import type { StudentStatus } from "@/types"; // Import the status type

const studentStatusEnum: [StudentStatus, ...StudentStatus[]] = ['New', 'Transferee', 'Continuing', 'Returnee'];
const yearLevelEnum = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const; // Define valid year levels


// Schema for adding/editing a student
export const studentSchema = z.object({
  id: z.number().optional(), // Optional for adding, required for editing reference
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  course: z.string().min(1, "Course is required"),
  status: z.enum(studentStatusEnum, { required_error: "Status is required"}),
  year: z.enum(yearLevelEnum).optional(), // Year is optional initially
  section: z.string().optional(), // Section is now optional in the form, will be auto-assigned
  email: z.string().email("Invalid email address").optional().or(z.literal('')), // Optional email
  phone: z.string().optional().or(z.literal('')), // Optional phone
  // Detailed Emergency Contact - all optional
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactRelationship: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  emergencyContactAddress: z.string().optional().or(z.literal('')),
  // Generated fields - not part of the form input, but part of the type
  studentId: z.string().optional(),
}).superRefine((data, ctx) => {
    // If status is 'Continuing', 'Transferee', or 'Returnee', year is required.
    if (['Continuing', 'Transferee', 'Returnee'].includes(data.status) && !data.year) {
        ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Year level is required for this status.",
        path: ["year"],
        });
    }
    // If status is 'New', year should not be provided or will be ignored/overwritten.
    // No explicit validation needed here as it's handled in the submission logic.
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
// Student profile is mostly read-only for academic info, editable for contact
export const profileSchema = z.object({
   id: z.number(), // User ID is needed to update the correct record
   firstName: z.string().min(1, "First name is required"),
   lastName: z.string().min(1, "Last name is required"),
   email: z.string().email("Invalid email address").optional().or(z.literal('')),
   phone: z.string().optional().or(z.literal('')),
   // Detailed Emergency Contact - all optional and editable by student
   emergencyContactName: z.string().optional().or(z.literal('')),
   emergencyContactRelationship: z.string().optional().or(z.literal('')),
   emergencyContactPhone: z.string().optional().or(z.literal('')),
   emergencyContactAddress: z.string().optional().or(z.literal('')),
   // Add other editable fields specific to the role if needed
   // Password change might need a separate form/process
});

// Schema for Class Schedule Entry (No longer used directly, kept for reference)
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

// Schema for Assigning a Teacher to a Section
export const assignTeacherSchema = z.object({
  teacherId: z.coerce.number({ invalid_type_error: "Please select a teacher."}).min(1, "Please select a teacher."), // Ensure a teacher ID is selected
});

// Schema for Creating an Announcement
export const announcementSchema = z.object({
  title: z.string().min(1, "Announcement title is required"),
  content: z.string().min(10, "Announcement content must be at least 10 characters"),
  targetCourse: z.string().optional(), // Allow 'all' or specific course value
  targetYearLevel: z.string().optional(), // Allow 'all' or specific year level value
  targetSection: z.string().optional(), // Allow 'all' or specific section value
});


// Schema for Password Change
export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"], // Point error to the confirmation field
});
