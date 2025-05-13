
import { z } from "zod";
import type { EnrollmentType, EmploymentType, AdminRole, DepartmentType, CourseType, YearLevel } from "@/types"; // Import EnrollmentType

const enrollmentTypeEnum: [EnrollmentType, ...EnrollmentType[]] = ['New', 'Transferee', 'Returnee'];
const yearLevelEnum: [YearLevel, ...YearLevel[]] = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const;
const genderEnum = ['Male', 'Female', 'Other'] as const;
const employmentTypeEnum: [EmploymentType, ...EmploymentType[]] = ['Regular', 'Part Time'];
const adminRoleEnum: [AdminRole, ...AdminRole[]] = ['Super Admin', 'Sub Admin'];
const departmentEnum: [DepartmentType, ...DepartmentType[]] = ['Teaching', 'Administrative'];
const courseTypeEnum: [CourseType, ...CourseType[]] = ['Major', 'Minor'];
const announcementAudienceEnum: ['Student', 'Faculty', 'All'] = ['Student', 'Faculty', 'All'];

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

export const studentSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional().or(z.literal('')),
  suffix: z.string().optional().or(z.literal('')),
  gender: z.enum(genderEnum).optional().or(z.literal('')),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')),
  enrollmentType: z.enum(enrollmentTypeEnum, { required_error: "Enrollment type is required"}),
  year: z.enum(yearLevelEnum).optional(),
  program: z.string().min(1, "Program is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactRelationship: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  emergencyContactAddress: z.string().optional().or(z.literal('')),
  studentId: z.string().optional(),
  username: z.string().optional(),
  section: z.string().optional(),
}).superRefine((data, ctx) => {
    if (['Transferee', 'Returnee'].includes(data.enrollmentType) && !data.year) {
        ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Year level is required for this enrollment type.",
        path: ["year"],
        });
    }
});

export const teacherSchema = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional().or(z.literal('')),
  suffix: z.string().optional().or(z.literal('')),
  gender: z.enum(genderEnum).optional().or(z.literal('')),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  employmentType: z.enum(employmentTypeEnum, { required_error: "Employment type is required"}),
  department: z.enum(departmentEnum, { required_error: "Department is required"}),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactRelationship: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  emergencyContactAddress: z.string().optional().or(z.literal('')),
  facultyId: z.string().optional(),
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

const gradeValueSchema = z.union([
    z.coerce.number({invalid_type_error: 'Must be a number'})
        .min(0, "Min 0")
        .max(100, "Max 100")
        .finite("Invalid number")
        .optional(),
    z.literal(""),
    z.null(),
]).nullable();

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

export const assignAdviserSchema = z.object({
  adviserId: z.coerce.number({ invalid_type_error: "Please select an adviser." })
    .int()
    .nonnegative("Adviser selection cannot be negative."),
});

export const announcementSchema = z.object({
  title: z.string().min(1, "Announcement title is required"),
  content: z.string().min(10, "Announcement content must be at least 10 characters"),
  targetAudience: z.enum(announcementAudienceEnum).default('All'),
  targetProgramId: z.string().optional(),
  targetYearLevel: z.string().optional(),
  targetSection: z.string().optional(),
});

export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
        .min(7, "New password must be at least 7 characters long")
        .regex(/[a-zA-Z]/, "Password must contain at least one letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@#&?*]/, "Password must contain at least one symbol (@, #, &, ?, *)"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
});

export const assignSubjectSchema = z.object({
  subjectId: z.string().min(1, "Please select a course(subject)."),
  teacherId: z.coerce.number({ invalid_type_error: "Please select a faculty member." }).min(0, "Please select a faculty member or unassign."), // Allow 0 for unassigning
});

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const sectionSchema = z.object({
    id: z.string().optional(),
    programId: z.string().min(1, "Program is required."),
    yearLevel: z.enum(yearLevelEnum, { required_error: "Year level is required." }),
    sectionCode: z.string().optional().or(z.literal('')),
    adviserId: z.number().optional().nullable(),
});

export const assignCoursesToProgramSchema = z.object({
  programId: z.string().min(1, "Program selection is required."),
  yearLevel: z.enum(yearLevelEnum, { required_error: "Year level selection is required." }),
  courseIds: z.array(z.string()).min(0),
});
