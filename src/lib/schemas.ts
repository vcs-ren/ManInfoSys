

import { z } from "zod";
import type { StudentStatus } from "@/types"; // Import the status type

const studentStatusEnum: [StudentStatus, ...StudentStatus[]] = ['New', 'Transferee', 'Returnee']; // Removed 'Continuing'
const yearLevelEnum = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const; // Define valid year levels


// Schema for adding/editing a student
export const studentSchema = z.object({
  id: z.number().optional(), // Optional for adding, required for editing reference
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  course: z.string().min(1, "Course is required"),
  status: z.enum(studentStatusEnum, { required_error: "Status is required"}), // Updated enum
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
    // If status is 'Transferee' or 'Returnee', year is required.
    if (['Transferee', 'Returnee'].includes(data.status) && !data.year) { // Adjusted condition
        ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Year level is required for this status.",
        path: ["year"],
        });
    }
    // If status is 'New', year should not be provided or will be ignored/overwritten.
    // No explicit validation needed here as it's handled in the submission logic.
});


// Schema for adding/editing a teacher - Updated
export const teacherSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional().or(z.literal('')), // Added optional middle name
  suffix: z.string().optional().or(z.literal('')), // Added optional suffix
  address: z.string().optional().or(z.literal('')), // Added optional address
  department: z.string().min(1, "Department is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')), // Renamed from contact number for consistency
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')), // Added optional birthday (YYYY-MM-DD)
  // Added optional emergency contact fields
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactRelationship: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  emergencyContactAddress: z.string().optional().or(z.literal('')),
  // Generated fields
  teacherId: z.string().optional(),
});

// Schema for adding a new admin (excluding super admin capabilities)
export const adminUserSchema = z.object({
  id: z.number().optional(), // For UserForm generic type, not used for creation path
  email: z.string().email("Valid email is required."), // Email is required
  // Optional for type compatibility, not collected in form
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});


// Schema for validating a single grade value (numeric 0-100 or empty/null)
const gradeValueSchema = z.union([
    z.coerce.number().min(0, "Min 0").max(100, "Max 100").optional(), // Numeric 0-100
    z.literal(""), // Allow empty string for clearing the field
    z.null(), // Allow null
]).nullable(); // Explicitly allow null


// Schema for submitting grades for all terms at once
export const submitGradesSchema = z.object({
    assignmentId: z.string(), // ID linking student and subject for this context
    studentId: z.number(),
    subjectId: z.string(),
    prelimGrade: gradeValueSchema,
    prelimRemarks: z.string().optional(),
    midtermGrade: gradeValueSchema,
    midtermRemarks: z.string().optional(),
    finalGrade: gradeValueSchema,
    finalRemarks: z.string().optional(),
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
   // Teacher profile specific fields
   middleName: z.string().optional().or(z.literal('')),
   suffix: z.string().optional().or(z.literal('')),
   birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')),
   address: z.string().optional().or(z.literal('')),
   // Add other editable fields specific to the role if needed
   // Password change might need a separate form/process
});

// Schema for Assigning an Adviser to a Section
export const assignAdviserSchema = z.object({
  // adviserId can be 0 (for unassigning) or a positive number
  adviserId: z.coerce.number({ invalid_type_error: "Please select an adviser." })
    .int()
    .nonnegative("Adviser selection cannot be negative."), // Allow 0
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

// Schema for Assigning a Subject and Teacher in the Manage Subjects Modal
export const assignSubjectSchema = z.object({
  subjectId: z.string().min(1, "Please select a subject."),
  teacherId: z.coerce.number({ invalid_type_error: "Please select a teacher." }).min(1, "Please select a teacher."),
});


// Schema for Login - Updated to include password
export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }), // Password is now required
});
