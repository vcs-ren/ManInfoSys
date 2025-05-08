
import { z } from "zod";
import type { StudentStatus, EmploymentType } from "@/types"; // Import the status type

const studentStatusEnum: [StudentStatus, ...StudentStatus[]] = ['New', 'Transferee', 'Returnee']; // Removed 'Continuing'
const yearLevelEnum = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const; // Define valid year levels
const genderEnum = ['Male', 'Female', 'Other'] as const;
const employmentTypeEnum: [EmploymentType, ...EmploymentType[]] = ['Regular', 'Part Time']; // Define employment types


// Schema for adding/editing a student
export const studentSchema = z.object({
  id: z.number().optional(), // Optional for adding, required for editing reference
  // Personal Info
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional().or(z.literal('')), // Added
  suffix: z.string().optional().or(z.literal('')), // Added
  gender: z.enum(genderEnum, { errorMap: () => ({ message: "Please select a gender." }) }).optional().or(z.literal('')), // Added optional gender
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')), // Added optional birthday
  // Enrollment Info
  status: z.enum(studentStatusEnum, { required_error: "Status is required"}), // Updated enum
  year: z.enum(yearLevelEnum).optional(), // Year is optional initially
  course: z.string().min(1, "Program is required"), // Changed label
  // Section is auto-generated, not in form
  // Contact / Account Info
  email: z.string().email("Invalid email address").optional().or(z.literal('')), // Optional email
  phone: z.string().optional().or(z.literal('')), // Optional phone
  // Emergency Contact Info
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactRelationship: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  emergencyContactAddress: z.string().optional().or(z.literal('')),
  // Generated fields - not part of the form input, but part of the type
  studentId: z.string().optional(),
  username: z.string().optional(), // Add username here for type completeness
  section: z.string().optional(), // Section is now optional in the form, will be auto-assigned
}).superRefine((data, ctx) => {
    // If status is 'Transferee' or 'Returnee', year is required.
    if (['Transferee', 'Returnee'].includes(data.status) && !data.year) { // Adjusted condition
        ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Year level is required for this status.",
        path: ["year"],
        });
    }
});


// Schema for adding/editing a teacher - Updated
export const teacherSchema = z.object({
  id: z.number().optional(),
  // Personal Info
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional().or(z.literal('')), // Added optional middle name
  suffix: z.string().optional().or(z.literal('')), // Added optional suffix
  gender: z.enum(genderEnum, { errorMap: () => ({ message: "Please select a gender." }) }).optional().or(z.literal('')), // Added optional gender
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')), // Added optional birthday (YYYY-MM-DD)
  address: z.string().optional().or(z.literal('')), // Added optional address
  // Employee Info
  employmentType: z.enum(employmentTypeEnum, { required_error: "Employment type is required"}), // Added required employment type
  department: z.string().min(1, "Department is required"), // Department remains required
  // Contact / Account Info
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')), // Renamed from contact number for consistency
  // Emergency Contact Info
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactRelationship: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  emergencyContactAddress: z.string().optional().or(z.literal('')),
  // Generated fields
  teacherId: z.string().optional(), // This will be like 't1001'
  username: z.string().optional(), // Add username here for type completeness (same as teacherId)
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
    z.coerce.number({invalid_type_error: 'Must be a number'}) // Ensure coercion happens first
        .min(0, "Min 0")
        .max(100, "Max 100")
        .finite("Invalid number") // Add check for finite numbers
        .optional(),
    z.literal(""), // Allow empty string for clearing the field
    z.null(), // Allow null
]).nullable(); // Explicitly allow null


// Schema for submitting grades for all terms at once
export const submitGradesSchema = z.object({
    assignmentId: z.string(), // ID linking student and subject for this context
    studentId: z.number(),
    subjectId: z.string(), // Course ID
    prelimGrade: gradeValueSchema,
    prelimRemarks: z.string().optional().or(z.literal('')).nullable(),
    midtermGrade: gradeValueSchema,
    midtermRemarks: z.string().optional().or(z.literal('')).nullable(),
    finalGrade: gradeValueSchema,
    finalRemarks: z.string().optional().or(z.literal('')).nullable(),
});


// Schema for Profile Editing (Specific for Student)
export const studentProfileSchema = z.object({
   id: z.number(), // User ID is needed to update the correct record
   firstName: z.string().min(1, "First name is required"),
   lastName: z.string().min(1, "Last name is required"),
   middleName: z.string().optional().or(z.literal('')), // Added
   suffix: z.string().optional().or(z.literal('')), // Added
   gender: z.enum(genderEnum, { errorMap: () => ({ message: "Please select a gender." }) }).optional().or(z.literal('')), // Added optional gender
   birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')), // Added optional birthday
   email: z.string().email("Invalid email address").optional().or(z.literal('')),
   phone: z.string().optional().or(z.literal('')),
   // Detailed Emergency Contact - all optional and editable by student
   emergencyContactName: z.string().optional().or(z.literal('')),
   emergencyContactRelationship: z.string().optional().or(z.literal('')),
   emergencyContactPhone: z.string().optional().or(z.literal('')),
   emergencyContactAddress: z.string().optional().or(z.literal('')),
});


// Schema for Profile Editing (Specific for Teacher) - Aligned with teacherSchema fields
export const teacherProfileSchema = z.object({
    id: z.number(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    middleName: z.string().optional().or(z.literal('')),
    suffix: z.string().optional().or(z.literal('')),
    gender: z.enum(genderEnum, { errorMap: () => ({ message: "Please select a gender." }) }).optional().or(z.literal('')), // Added gender
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    // Emergency contacts are editable by teacher
    emergencyContactName: z.string().optional().or(z.literal('')),
    emergencyContactRelationship: z.string().optional().or(z.literal('')),
    emergencyContactPhone: z.string().optional().or(z.literal('')),
    emergencyContactAddress: z.string().optional().or(z.literal('')),
     // Non-editable fields (department, employmentType) are not included here
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
  targetCourse: z.string().optional(), // Program/Course target
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
  subjectId: z.string().min(1, "Please select a course(subject)."), // Changed label
  teacherId: z.coerce.number({ invalid_type_error: "Please select a teacher." }).min(1, "Please select a teacher."),
});


// Schema for Login - Updated to include password
export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }), // Password is now required
});
