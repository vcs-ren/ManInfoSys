
import { z } from "zod";
import type { StudentStatus, EmploymentType, AdminRole, DepartmentType, CourseType, YearLevel } from "@/types"; // Import DepartmentType, CourseType, YearLevel

const studentStatusEnum: [StudentStatus, ...StudentStatus[]] = ['New', 'Transferee', 'Returnee'];
const yearLevelEnum: [YearLevel, ...YearLevel[]] = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const; // Use YearLevel type
const genderEnum = ['Male', 'Female', 'Other'] as const;
const employmentTypeEnum: [EmploymentType, ...EmploymentType[]] = ['Regular', 'Part Time'];
const adminRoleEnum: [AdminRole, ...AdminRole[]] = ['Super Admin', 'Sub Admin'];
const departmentEnum: [DepartmentType, ...DepartmentType[]] = ['Teaching', 'Administrative']; // Use DepartmentType
const courseTypeEnum: [CourseType, ...CourseType[]] = ['Major', 'Minor']; 
const announcementAudienceEnum: ['Student', 'Faculty', 'All'] = ['Student', 'Faculty', 'All'];

// Schema for Course Management (used for global courses and within programs)
export const courseSchema = z.object({
  id: z.string().min(1, "Course ID is required (e.g., CS101, GEN001)"),
  name: z.string().min(1, "Course(subject) name is required"),
  description: z.string().optional().or(z.literal('')),
  type: z.enum(courseTypeEnum, { required_error: "Course type (Major/Minor) is required"}),
  programId: z.array(z.string()).optional().default([]), 
  yearLevel: z.enum(yearLevelEnum).optional(), 
}).superRefine((data, ctx) => {
  if (data.type === 'Major' && (!data.programId || data.programId.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one Program ID is required for Major courses.",
      path: ["programId"],
    });
  }
});


export const yearLevelCoursesSchema = z.record(
  z.enum(yearLevelEnum),
  z.array(courseSchema) 
);

export const programSchema = z.object({
  id: z.string().min(1, "Program ID is required (e.g., CS, IT)"),
  name: z.string().min(1, "Program name is required"),
  description: z.string().optional().or(z.literal('')),
  courses: yearLevelCoursesSchema.optional().default({
    "1st Year": [],
    "2nd Year": [],
    "3rd Year": [],
    "4th Year": [],
  }),
});

// Schema for adding/editing a student
export const studentSchema = z.object({
  id: z.number().optional(),
  // Personal Info
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional().or(z.literal('')),
  suffix: z.string().optional().or(z.literal('')),
  gender: z.enum(genderEnum).optional().or(z.literal('')),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')),
  // Enrollment Info
  status: z.enum(studentStatusEnum, { required_error: "Status is required"}),
  year: z.enum(yearLevelEnum).optional(),
  course: z.string().min(1, "Program is required"), 
  // Contact / Account Info
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  // Emergency Contact Info
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactRelationship: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  emergencyContactAddress: z.string().optional().or(z.literal('')),
  // Generated fields - not part of the form input, but part of the type
  studentId: z.string().optional(),
  username: z.string().optional(),
  section: z.string().optional(),
}).superRefine((data, ctx) => {
    if (['Transferee', 'Returnee'].includes(data.status) && !data.year) {
        ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Year level is required for this status.",
        path: ["year"],
        });
    }
});

// Schema for adding/editing a faculty member
export const teacherSchema = z.object({
  id: z.number().optional(),
  // Personal Info
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional().or(z.literal('')),
  suffix: z.string().optional().or(z.literal('')),
  gender: z.enum(genderEnum).optional().or(z.literal('')),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  // Employee Info
  employmentType: z.enum(employmentTypeEnum, { required_error: "Employment type is required"}),
  department: z.enum(departmentEnum, { required_error: "Department is required"}),
  // Contact / Account Info
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  // Emergency Contact Info
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactRelationship: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  emergencyContactAddress: z.string().optional().or(z.literal('')),
  // Generated fields
  teacherId: z.string().optional(),
  username: z.string().optional(),
});

export const adminUserSchema = z.object({
  id: z.number(), 
  username: z.string().min(1, "Username is required."),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Valid email is required.").optional().or(z.literal('')),
  role: z.enum(adminRoleEnum, { required_error: "Admin role is required" }),
  isSuperAdmin: z.boolean().optional(),
});


// Schema for validating a single grade value
const gradeValueSchema = z.union([
    z.coerce.number({invalid_type_error: 'Must be a number'})
        .min(0, "Min 0")
        .max(100, "Max 100")
        .finite("Invalid number")
        .optional(),
    z.literal(""),
    z.null(),
]).nullable();

// Schema for submitting grades
export const submitGradesSchema = z.object({
    assignmentId: z.string(),
    studentId: z.number(),
    subjectId: z.string(),
    prelimGrade: gradeValueSchema,
    prelimRemarks: z.string().optional().or(z.literal('')).nullable(),
    midtermGrade: gradeValueSchema,
    midtermRemarks: z.string().optional().or(z.literal('')).nullable(),
    finalGrade: gradeValueSchema,
    finalRemarks: z.string().optional().or(z.literal('')).nullable(),
});

// Schema for Profile Editing (Student)
export const studentProfileSchema = z.object({
   id: z.number(),
   firstName: z.string().min(1, "First name is required"),
   lastName: z.string().min(1, "Last name is required"),
   middleName: z.string().optional().or(z.literal('')),
   suffix: z.string().optional().or(z.literal('')),
   gender: z.enum(genderEnum).optional().or(z.literal('')),
   birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')),
   email: z.string().email("Invalid email address").optional().or(z.literal('')),
   phone: z.string().optional().or(z.literal('')),
   emergencyContactName: z.string().optional().or(z.literal('')),
   emergencyContactRelationship: z.string().optional().or(z.literal('')),
   emergencyContactPhone: z.string().optional().or(z.literal('')),
   emergencyContactAddress: z.string().optional().or(z.literal('')),
});

// Schema for Profile Editing (Faculty)
export const teacherProfileSchema = z.object({
    id: z.number(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    middleName: z.string().optional().or(z.literal('')),
    suffix: z.string().optional().or(z.literal('')),
    gender: z.enum(genderEnum).optional().or(z.literal('')), 
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    emergencyContactName: z.string().optional().or(z.literal('')),
    emergencyContactRelationship: z.string().optional().or(z.literal('')),
    emergencyContactPhone: z.string().optional().or(z.literal('')),
    emergencyContactAddress: z.string().optional().or(z.literal('')),
});

// Schema for Assigning an Adviser
export const assignAdviserSchema = z.object({
  adviserId: z.coerce.number({ invalid_type_error: "Please select an adviser." })
    .int()
    .nonnegative("Adviser selection cannot be negative."),
});

// Schema for Creating an Announcement
export const announcementSchema = z.object({
  title: z.string().min(1, "Announcement title is required"),
  content: z.string().min(10, "Announcement content must be at least 10 characters"),
  targetAudience: z.enum(announcementAudienceEnum).default('All'), 
  targetProgramId: z.string().optional(),
  targetYearLevel: z.string().optional(),
  targetSection: z.string().optional(),
});

// Schema for Password Change
export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
});

// Schema for Assigning a Subject/Course and Faculty member in Manage Courses Modal
export const assignSubjectSchema = z.object({
  subjectId: z.string().min(1, "Please select a course(subject)."),
  teacherId: z.coerce.number({ invalid_type_error: "Please select a faculty member." }).min(1, "Please select a faculty member."),
});

// Schema for Login
export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Schema for editing an existing Section (sectionCode/ID is not editable here)
export const sectionSchema = z.object({
    id: z.string().optional(), 
    programId: z.string().min(1, "Program is required."),
    yearLevel: z.enum(yearLevelEnum, { required_error: "Year level is required." }),
    sectionCode: z.string().optional().or(z.literal('')), 
    adviserId: z.number().optional().nullable(),
});

// Schema for Assigning Courses to Program/Year
export const assignCoursesToProgramSchema = z.object({
  programId: z.string().min(1, "Program selection is required."),
  yearLevel: z.enum(yearLevelEnum, { required_error: "Year level selection is required." }),
  courseIds: z.array(z.string()).min(0), // Can be empty if no courses are selected for a year
});
    
