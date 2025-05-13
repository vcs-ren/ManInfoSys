// src/lib/api.ts
'use client';

import type { Student, Faculty, Section, Course, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole, CourseType, YearLevel, ActivityLogEntry, EmploymentType, EnrollmentType } from '@/types'; // Added EnrollmentType
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateAdminUsername, generateTeacherUsername, generateStudentId as generateFrontendStudentId } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

let nextStudentDbId = 3;
let nextFacultyDbId = 4;
let nextProgramDbId = 3;
let nextCourseDbId = 10;
let nextActivityLogId = 1; // Start from 1 for new logs

export let mockCourses: Course[] = [
    { id: "CS101", name: "Introduction to Programming", description: "Fundamentals of programming.", type: "Major", programId: ["CS"], yearLevel: "1st Year" },
    { id: "IT101", name: "IT Fundamentals", description: "Basics of IT.", type: "Major", programId: ["IT"], yearLevel: "1st Year" },
    { id: "CS201", name: "Data Structures", description: "Study of data organization.", type: "Major", programId: ["CS"], yearLevel: "2nd Year" },
    { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills", type: "Minor", programId: [] },
    { id: "MATH101", name: "Calculus I", description: "Differential Calculus", type: "Minor", programId: []},
];

export let mockApiPrograms: Program[] = [
    {
        id: "CS", name: "Computer Science", description: "Focuses on algorithms, data structures, and software development.",
        courses: { "1st Year": [mockCourses[0], mockCourses[4]], "2nd Year": [mockCourses[2]], "3rd Year": [], "4th Year": [] },
    },
    {
        id: "IT", name: "Information Technology", description: "Focuses on network administration, system management, and web technologies.",
        courses: { "1st Year": [mockCourses[1], mockCourses[3]], "2nd Year": [], "3rd Year": [], "4th Year": [] },
    },
];

export let mockStudents: Student[] = [
  { id: 1, studentId: generateFrontendStudentId(), username: "", firstName: "Alice", lastName: "Smith", program: "CS", enrollmentType: "Returnee", year: "2nd Year", section: "CS2A", email: "alice@example.com", phone: "123-456-7890", emergencyContactName: "John Smith", emergencyContactRelationship: "Father", emergencyContactPhone: "111-222-3333", emergencyContactAddress: "123 Main St", lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, studentId: generateFrontendStudentId(), username: "", firstName: "Bob", lastName: "Johnson", program: "IT", enrollmentType: "New", year: "1st Year", section: "IT1A", email: "bob@example.com", phone: "987-654-3210", lastAccessed: null },
];
mockStudents[0].username = generateStudentUsername(mockStudents[0].studentId);
mockStudents[1].username = generateStudentUsername(mockStudents[1].studentId);

export let mockFaculty: Faculty[] = [
  { id: 1, facultyId: generateTeacherId(), username: "", firstName: "David", lastName: "Lee", department: "Teaching", email: "david.lee@example.com", phone: "555-1234", employmentType: 'Regular', lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, facultyId: generateTeacherId(), username: "", firstName: "Eve", lastName: "Davis", department: "Administrative", email: "eve.davis@example.com", phone: "555-5678", employmentType: 'Part Time', lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, facultyId: generateTeacherId(), username: "", firstName: "Carol", lastName: "White", department: "Teaching", email: "carol.white@example.com", phone: "555-9012", employmentType: 'Regular', lastAccessed: null },
];
mockFaculty[0].username = generateTeacherUsername(mockFaculty[0].facultyId, mockFaculty[0].department);
mockFaculty[1].username = generateTeacherUsername(mockFaculty[1].facultyId, mockFaculty[1].department);
mockFaculty[2].username = generateTeacherUsername(mockFaculty[2].facultyId, mockFaculty[2].department);

export let mockSections: Section[] = [
    { id: "CS1A", sectionCode: "CS1A", programId: "CS", programName: "Computer Science", yearLevel: "1st Year", adviserId: 1, adviserName: "David Lee", studentCount: 0 },
    { id: "CS2A", sectionCode: "CS2A", programId: "CS", programName: "Computer Science", yearLevel: "2nd Year", adviserId: 1, adviserName: "David Lee", studentCount: 1 },
    { id: "IT1A", sectionCode: "IT1A", programId: "IT", programName: "Information Technology", yearLevel: "1st Year", studentCount: 1 },
];

export let mockSectionAssignments: SectionSubjectAssignment[] = [
    { id: "CS2A-CS201", sectionId: "CS2A", subjectId: "CS201", subjectName: "Data Structures", teacherId: 1, teacherName: "David Lee" },
    { id: "IT1A-IT101", sectionId: "IT1A", subjectId: "IT101", subjectName: "IT Fundamentals", teacherId: 1, teacherName: "David Lee" },
];

export let mockAnnouncements: Announcement[] = [
  { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year.", date: new Date(2024, 7, 15), targetAudience: "All", target: { programId: "all" }, author: "Admin" },
];

export let mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = [
    { assignmentId: `CS2A-CS201-${mockStudents[0].id}`, studentId: mockStudents[0].id, studentName: "Alice Smith", subjectId: "CS201", subjectName: "Data Structures", section: "CS2A", year: "2nd Year", prelimGrade: 85, prelimRemarks: "Good start", midtermGrade: 90, midtermRemarks: "Excellent", finalGrade: 88, finalRemarks: "Very Good", status: "Complete" },
    { assignmentId: `IT1A-IT101-${mockStudents[1].id}`, studentId: mockStudents[1].id, studentName: "Bob Johnson", subjectId: "IT101", subjectName: "IT Fundamentals", section: "IT1A", year: "1st Year", prelimGrade: null, prelimRemarks: "", midtermGrade: null, midtermRemarks: "", finalGrade: null, finalRemarks: "", status: "Not Submitted" },
];

export let mockApiAdmins: AdminUser[] = [
    { id: 0, username: "admin", firstName: "Super", lastName: "Admin", email: "superadmin@example.com", role: "Super Admin", isSuperAdmin: true },
    { id: 2, username: mockFaculty.find(f=>f.id === 2)!.username, firstName: mockFaculty.find(f=>f.id === 2)!.firstName, lastName: mockFaculty.find(f=>f.id === 2)!.lastName, email: mockFaculty.find(f=>f.id === 2)!.email, role: "Sub Admin", isSuperAdmin: false },
    { id: 1001, username: "a1001", firstName: "Test", lastName: "SubAdmin", email: "subadmin.test@example.com", role: "Sub Admin", isSuperAdmin: false },
];

export let mockActivityLog: ActivityLogEntry[] = [
    { id: `log-${nextActivityLogId++}-${Date.now()}`, timestamp: new Date(Date.now() - 1000 * 60 * 5), user: "System", action: "System Startup", description: "System initialized successfully.", canUndo: false, targetType: 'system' }
];


export let mockTeacherTeachableCourses: { teacherId: number; courseIds: string[] }[] = [
    { teacherId: 1, courseIds: ["CS101", "CS201", "IT101"] },
    { teacherId: 3, courseIds: ["GEN001", "MATH101"] },
];

export const logActivity = (
    action: string,
    description: string,
    user: string = "Admin",
    targetId?: number | string,
    targetType?: ActivityLogEntry['targetType'],
    canUndo: boolean = false,
    originalData?: any
) => {
    const newLogEntry: ActivityLogEntry = {
        id: `log-${nextActivityLogId++}-${Date.now()}`, // Ensure unique ID with timestamp component
        timestamp: new Date(),
        user,
        action,
        description,
        targetId,
        targetType,
        canUndo,
        originalData
    };
    const existingLogIndex = mockActivityLog.findIndex(log => log.id === newLogEntry.id);
    if (existingLogIndex === -1) {
        mockActivityLog.unshift(newLogEntry);
        if (mockActivityLog.length > 50) {
            mockActivityLog.pop();
        }
    } else {
        // If a log with the same ID exists (should be rare with timestamp), update it or handle as needed
        // For now, we'll assume IDs are unique enough and this branch is unlikely
        console.warn("Attempted to add duplicate log ID:", newLogEntry.id);
    }

    if (targetType === 'student' || targetType === 'faculty' || targetType === 'admin' || targetType === 'announcement') {
        recalculateDashboardStats();
    }
};

export let mockDashboardStats: DashboardStats = {} as DashboardStats;

const recalculateMockSectionCounts = () => {
    mockSections.forEach(section => {
        section.studentCount = mockStudents.filter(student => student.section === section.id).length;
    });
};


export const recalculateDashboardStats = () => {
    const teachingStaffCount = mockFaculty.filter(f => f.department === 'Teaching').length;
    const adminStaffCount = mockFaculty.filter(f => f.department === 'Administrative').length;
    const totalEventsAnnouncementsCount = mockAnnouncements.length;

    mockDashboardStats = {
        totalStudents: mockStudents.length,
        totalTeachingStaff: teachingStaffCount,
        totalAdministrativeStaff: adminStaffCount,
        totalEventsAnnouncements: totalEventsAnnouncementsCount,
    };
};
recalculateDashboardStats(); // Initial calculation

export let mockTestUsers: { username: string; password?: string; role: AdminRole | 'Student' | 'Teacher'; userId: number; id: number; }[] = [
    { username: "admin", password: "defadmin", role: "Super Admin", userId: 0, id: 0 },
    { username: "s1001", password: "password", role: "Student", userId: 1, id: 1 }, // Corresponds to Alice Smith
    { username: "t1001", password: "password", role: "Teacher", userId: 1, id: 1 }, // Corresponds to David Lee
    { username: "a1001", password: "password", role: "Sub Admin", userId: 1001, id: 1001 }, // Test Sub Admin
];


// --- API CONFIGURATION ---
export const USE_MOCK_API = true; // Set to true to use mock data, false for real API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export function executeUndoAddStudent(studentId: number, originalStudentData: Student) {
  const studentIndex = mockStudents.findIndex(s => s.id === studentId);
  if (studentIndex > -1) {
    mockStudents.splice(studentIndex, 1);
    recalculateMockSectionCounts();
    recalculateDashboardStats();
    logActivity("Undone Action: Add Student", `Reverted addition of ${originalStudentData.firstName} ${originalStudentData.lastName}`, "System", studentId, "student");
  }
}

export function executeUndoDeleteStudent(originalStudentData: Student) {
  if (!mockStudents.some(s => s.id === originalStudentData.id)) {
    mockStudents.push(originalStudentData);
    recalculateMockSectionCounts();
    recalculateDashboardStats();
    logActivity("Undone Action: Delete Student", `Restored student ${originalStudentData.firstName} ${originalStudentData.lastName}`, "System", originalStudentData.id, "student");
  }
}

export function executeUndoAddFaculty(facultyId: number, originalFacultyData: Faculty) {
    const facultyIndex = mockFaculty.findIndex(f => f.id === facultyId);
    if (facultyIndex > -1) {
        mockFaculty.splice(facultyIndex, 1);
        if (originalFacultyData.department === 'Administrative') {
             const adminIndex = mockApiAdmins.findIndex(a => a.id === facultyId && !a.isSuperAdmin);
             if (adminIndex > -1) {
                mockApiAdmins.splice(adminIndex, 1);
             }
        }
        recalculateDashboardStats();
        logActivity("Undone Action: Add Faculty", `Reverted addition of ${originalFacultyData.firstName} ${originalFacultyData.lastName}`, "System", facultyId, "faculty");
    }
}

export function executeUndoDeleteFaculty(originalFacultyData: Faculty) {
    if (!mockFaculty.some(f => f.id === originalFacultyData.id)) {
        mockFaculty.push(originalFacultyData);
        if (originalFacultyData.department === 'Administrative') {
             if (!mockApiAdmins.some(a => a.id === originalFacultyData.id)) {
                mockApiAdmins.push({
                    id: originalFacultyData.id, username: originalFacultyData.username,
                    firstName: originalFacultyData.firstName, lastName: originalFacultyData.lastName,
                    email: originalFacultyData.email, role: 'Sub Admin', isSuperAdmin: false
                });
            }
        }
        recalculateDashboardStats();
        logActivity("Undone Action: Delete Faculty", `Restored faculty ${originalFacultyData.firstName} ${originalFacultyData.lastName}`, "System", originalFacultyData.id, "faculty");
    }
}

export function executeUndoRemoveAdminRole(adminData: AdminUser & { originalDepartment?: DepartmentType }): boolean {
    // If the admin was faculty-derived, restore their department
    const facultyMember = mockFaculty.find(f => f.id === adminData.id);
    if (facultyMember) {
        facultyMember.department = adminData.originalDepartment || 'Administrative'; // Restore original or set to Admin
        // Ensure they are in mockApiAdmins if they are now administrative
        if (facultyMember.department === 'Administrative' && !mockApiAdmins.some(a => a.id === adminData.id)) {
             mockApiAdmins.push({
                id: adminData.id, username: adminData.username, firstName: adminData.firstName,
                lastName: adminData.lastName, email: adminData.email, role: 'Sub Admin', isSuperAdmin: false
            });
        } else if (facultyMember.department !== 'Administrative' && mockApiAdmins.some(a => a.id === adminData.id && !a.isSuperAdmin)) {
            // If department changed away from Administrative, remove from sub-admins (unless it was an explicit admin)
             const adminIndex = mockApiAdmins.findIndex(a => a.id === adminData.id && !a.isSuperAdmin);
             if(adminIndex > -1 && !adminData.isSuperAdmin) mockApiAdmins.splice(adminIndex, 1);
        }
        recalculateDashboardStats();
        logActivity("Undone Action: Remove Admin Role", `Restored admin role (via faculty department) for ${adminData.username}`, "System", adminData.id, "admin");
        return true;
    }
    // If it was an explicit admin not tied to faculty (shouldn't happen with current setup, but good to handle)
    if (!facultyMember && !mockApiAdmins.some(a => a.id === adminData.id) && adminData.role !== 'Super Admin') {
        mockApiAdmins.push(adminData); // Add them back to mockApiAdmins
        recalculateDashboardStats();
        logActivity("Undone Action: Remove Admin Role", `Restored explicit admin role for ${adminData.username}`, "System", adminData.id, "admin");
        return true;
    }
    console.warn("Could not fully undo admin role removal: No corresponding faculty or explicit admin found for ID:", adminData.id);
    return false;
}


const getApiUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const baseUrl = API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash if any
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${formattedPath}`;
};

const handleFetchError = (error: any, path: string, method: string, isNetworkError: boolean = false): never => {
    const targetUrl = getApiUrl(path);
    let errorMessage = `Failed to ${method.toLowerCase()} data.`;
    let detailedLog = `API Request Details:\n    - Method: ${method}\n    - Path Provided: ${path}\n    - Resolved URL: ${targetUrl}`;

    if (typeof window !== 'undefined') {
        detailedLog += `\n    - Frontend Origin: ${window.location.origin}`;
    }

    if (isNetworkError || error.message === 'Failed to fetch') {
        errorMessage = `Network Error: Could not connect to the API backend at ${targetUrl}.\n\n        Possible Causes & Checks:\n        1. PHP Server Status: Is the PHP server running? Start it using: 'php -S localhost:8000 -t src/api' in your project's root terminal.\n        2. Backend URL: Is the API_BASE_URL (${API_BASE_URL}) correct and accessible from your browser?\n        3. Endpoint Path: Is the API endpoint path "${path}" correct relative to the 'src/api' directory? (e.g., /login.php, /students/read.php)\n        4. CORS Policy: Is the PHP backend configured to allow requests from your frontend origin (${typeof window !== 'undefined' ? window.location.origin : 'N/A'})? Check 'Access-Control-Allow-Origin' headers in your PHP files.\n        5. Firewall/Network: Could a firewall or network issue be blocking the connection?\n        6. Browser Console: Check the browser's Network tab for the failed request details and the Console tab for specific CORS error messages.\n        `;
        detailedLog += `\n    - Error Type: NetworkError (Failed to fetch)`;
    } else {
        errorMessage = error.message || `An unexpected error occurred during the ${method} request.`;
        detailedLog += `\n    - Error Type: ${error.name || 'UnknownError'}`;
        detailedLog += `\n    - Error Message: ${error.message}`;
    }
     detailedLog += `\n    \n        Troubleshooting Tips:\n        - Ensure the PHP server is running and listening on the correct port (8000).\n        - Check the PHP server's console output for any startup errors or errors during the request.\n        - Verify the 'Access-Control-Allow-Origin' header in the failing PHP endpoint matches your frontend origin or is '*'.\n        - Temporarily simplify the PHP endpoint to just return headers and a basic JSON to isolate the issue.\n        `;


    console.error("Detailed Fetch Error Log:", detailedLog);
    // Re-throw a new error with the processed, more user-friendly message
    throw new Error(errorMessage);
};

/**
 * Converts a full PHP path (e.g., /api/students/read.php) to a path suitable for mock API lookups
 * (e.g., students/read.php).
 */
const finalMockPath = (path: string): string => {
    let formattedPath = path;
    // Remove leading '/api/' if present
    if (formattedPath.startsWith('/api/')) {
        formattedPath = formattedPath.substring(5);
    }
    // Remove leading '/' if still present (e.g., if original path was '/students/read.php')
    if (formattedPath.startsWith('/')) {
        formattedPath = formattedPath.substring(1);
    }
    return formattedPath;
};

const mockFetchData = async <T>(path: string): Promise<T> => {
    const phpPath = finalMockPath(path);
    console.log(`MOCK fetchData from: ${phpPath}`);
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        if (phpPath === 'students/read.php') return [...mockStudents] as T;
        if (phpPath === 'teachers/read.php') return [...mockFaculty] as T;
        if (phpPath === 'admins/read.php') {
            // Admins list now dynamically includes faculty with 'Administrative' department
            const superAdmin = mockApiAdmins.find(a => a.isSuperAdmin && a.id === 0); // Assuming ID 0 is super admin
            const facultyAdmins: AdminUser[] = mockFaculty
                .filter(f => f.department === 'Administrative')
                .map(f => ({
                    id: f.id,
                    username: f.username, // Faculty username (e.g., a1000YYYY)
                    firstName: f.firstName,
                    lastName: f.lastName,
                    email: f.email,
                    role: 'Sub Admin' as AdminRole,
                    isSuperAdmin: false,
                }));

            // Include explicitly defined Sub Admins from mockApiAdmins who are not faculty-derived
            const explicitSubAdmins = mockApiAdmins.filter(a => !a.isSuperAdmin && !facultyAdmins.some(fa => fa.id === a.id));


            let allAdmins: AdminUser[] = [];
            if(superAdmin) allAdmins.push(superAdmin);
            allAdmins = [...allAdmins, ...facultyAdmins, ...explicitSubAdmins];

            // Ensure uniqueness just in case (though should be managed by add/delete logic)
            const uniqueAdmins = Array.from(new Map(allAdmins.map(admin => [admin.id, admin])).values());
            return uniqueAdmins as T;
        }
        if (phpPath === 'programs/read.php') return [...mockApiPrograms] as T;
        if (phpPath === 'courses/read.php') return [...mockCourses] as T;

        if (phpPath.startsWith('sections/read.php')) {
            const urlParams = new URLSearchParams(phpPath.split('?')[1] || '');
            const sectionIdParam = urlParams.get('id');

            if (sectionIdParam) {
                const section = mockSections.find(s => s.id === sectionIdParam);
                 if (section) {
                     const program = mockApiPrograms.find(p => p.id === section.programId);
                     const adviser = mockFaculty.find(f => f.id === section.adviserId);
                     const singleSection = {
                         ...section,
                         programName: program?.name || section.programId,
                         adviserName: adviser ? `${adviser.firstName} ${adviser.lastName}` : undefined,
                         studentCount: mockStudents.filter(st => st.section === section.id).length
                     };
                     return [singleSection] as unknown as T; // Ensure it's returned as an array
                 }
                 return [] as unknown as T; // Return empty array if not found
            } else {
                // Return all sections
                const sectionsWithCounts = mockSections.map(section => {
                    const count = mockStudents.filter(student => student.section === section.id).length;
                    return {
                        ...section,
                        studentCount: count,
                        programName: mockApiPrograms.find(p => p.id === section.programId)?.name || section.programId,
                        adviserName: section.adviserId ? mockFaculty.find(f=>f.id === section.adviserId)?.firstName + " " + mockFaculty.find(f=>f.id === section.adviserId)?.lastName : undefined,
                    };
                });
                return sectionsWithCounts as T;
            }
        }

        if (phpPath === 'announcements/read.php') {
            // Return a copy and sort by date descending
            return [...mockAnnouncements].sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'student/announcements/read.php') {
            // Find student details (assuming a way to identify current student, e.g., ID 1 for mock)
            const studentUser = mockTestUsers.find(u => u.username === "s1001") // Example student username
            const studentDetails = mockStudents.find(s => s.id === studentUser?.userId);

            if (!studentDetails) return [] as T; // No student, no announcements

            const studentProgram = studentDetails.program;
            const studentYear = studentDetails.year;
            const studentSection = studentDetails.section;

             return mockAnnouncements.filter(ann =>
                (ann.targetAudience === 'All' || ann.targetAudience === 'Student') &&
                (ann.target.programId === 'all' || ann.target.programId === studentProgram || !ann.target.programId) &&
                (ann.target.yearLevel === 'all' || ann.target.yearLevel === studentYear || !ann.target.yearLevel) &&
                (ann.target.section === 'all' || ann.target.section === studentSection || !ann.target.section)
            ).sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'teacher/announcements/read.php') {
            // Assuming a way to identify current teacher, e.g., ID 1 for mock
            const teacherUser = mockTestUsers.find(u => u.username === "t1001"); // Example teacher username
            const teacherId = teacherUser?.userId;

            return mockAnnouncements.filter(ann =>
                (ann.author_type === 'Admin' && (ann.targetAudience === 'All' || ann.targetAudience === 'Faculty')) ||
                (ann.author_type === 'Teacher' && ann.author === String(teacherId)) // Assuming author stores teacher's ID string for their announcements
            ).sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'admin/dashboard-stats.php') {
            recalculateDashboardStats(); // Ensure stats are up-to-date
            return { ...mockDashboardStats } as T;
        }
         if (phpPath.startsWith('sections/assignments/read.php')) {
            const url = new URL(`http://localhost?${phpPath.split('?')[1] || ''}`);
            const sectionIdParam = url.searchParams.get('sectionId');
            const allParam = url.searchParams.get('all');
            
            let assignmentsToReturn = mockSectionAssignments;

            if (sectionIdParam && allParam !== 'true') {
                 assignmentsToReturn = mockSectionAssignments.filter(a => a.sectionId === sectionIdParam);
            }
            // If 'all=true' or no sectionId, return all assignments
             return assignmentsToReturn.map(a => ({
                ...a,
                subjectName: mockCourses.find(s => s.id === a.subjectId)?.name || a.subjectId,
                teacherName: mockFaculty.find(t => t.id === a.teacherId)?.firstName + ' ' + mockFaculty.find(t => t.id === a.teacherId)?.lastName || `Faculty ID ${a.teacherId}`,
            })) as T;
        }
         if (phpPath === 'student/grades/read.php') {
             const studentUser = mockTestUsers.find(u => u.username === "s1001")
             const studentId = studentUser?.userId;
             // Simulate fetching grades for the student
             const studentGrades = mockStudentSubjectAssignmentsWithGrades
                .filter(g => g.studentId === studentId)
                .map(g => ({
                    id: g.subjectId, // Use subjectId as the main ID for the row in student's view
                    subjectName: g.subjectName,
                    prelimGrade: g.prelimGrade,
                    midtermGrade: g.midtermGrade,
                    finalGrade: g.finalGrade,
                    finalRemarks: g.finalRemarks,
                    status: g.status
                }));
            return studentGrades as T;
        }
         if (phpPath === 'teacher/assignments/grades/read.php') {
            // Find teacher (assuming ID 1 for mock)
            const teacherUser = mockTestUsers.find(u => u.username === "t1001");
            const teacherId = teacherUser?.userId;
            // Filter assignments for this teacher
             const teacherAssignments = mockSectionAssignments.filter(sa => sa.teacherId === teacherId);
             const gradesToReturn: StudentSubjectAssignmentWithGrades[] = [];

             // For each student, check if they are in a section taught by this teacher
             // and if they have a grade entry for the subjects taught by this teacher in that section.
             mockStudents.forEach(student => {
                 teacherAssignments.forEach(ta => {
                     if (student.section === ta.sectionId) { // Student is in a section this teacher handles
                         // Check if there's an existing grade entry
                         const existingGradeEntry = mockStudentSubjectAssignmentsWithGrades.find(
                             g => g.studentId === student.id && g.subjectId === ta.subjectId && g.assignmentId.startsWith(ta.id) // Match by student and subject, and ensure assignmentId starts correctly
                         );
                         gradesToReturn.push({
                             assignmentId: existingGradeEntry?.assignmentId || `${ta.id}-${student.id}`, // Construct a unique assignmentId if not found
                             studentId: student.id,
                             studentName: `${student.firstName} ${student.lastName}`,
                             subjectId: ta.subjectId,
                             subjectName: ta.subjectName || mockCourses.find(c => c.id === ta.subjectId)?.name || ta.subjectId,
                             section: student.section,
                             year: student.year!, // Assuming year is always present for students
                             prelimGrade: existingGradeEntry?.prelimGrade ?? null,
                             prelimRemarks: existingGradeEntry?.prelimRemarks ?? "",
                             midtermGrade: existingGradeEntry?.midtermGrade ?? null,
                             midtermRemarks: existingGradeEntry?.midtermRemarks ?? "",
                             finalGrade: existingGradeEntry?.finalGrade ?? null,
                             finalRemarks: existingGradeEntry?.finalRemarks ?? "",
                             status: existingGradeEntry?.status || 'Not Submitted',
                         });
                     }
                 });
             });
             return gradesToReturn as T;
         }
         if (phpPath === 'student/profile/read.php') {
             const studentUser = mockTestUsers.find(u => u.username === "s1001")
             const student = mockStudents.find(s => s.id === studentUser?.userId);
             if (student) return { ...student } as T; // Return a copy
             throw new Error("Mock student profile not found.");
        }
        if (phpPath === 'teacher/profile/read.php') {
             const teacherUser = mockTestUsers.find(u => u.username === "t1001");
             const faculty = mockFaculty.find(t => t.id === teacherUser?.userId);
             if (faculty) return { ...faculty } as T; // Return a copy
             throw new Error("Mock faculty profile not found.");
        }
         if (phpPath === 'student/schedule/read.php') {
            // Find student (assuming ID 1 for mock)
            const studentUser = mockTestUsers.find(u => u.username === "s1001")
            const studentDetails = mockStudents.find(s => s.id === studentUser?.userId);
            if (!studentDetails) return [] as T;
            const studentSection = studentDetails.section;

            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments
                .filter(a => a.sectionId === studentSection) // Filter assignments for the student's section
                .forEach((assign, index) => {
                     // Simple schedule generation: Mon-Fri, 8 AM onwards, 1 hour slots
                     const dayOffset = index % 5; // 0 for Mon, 1 for Tue, ...
                     const startTime = new Date(); // Today
                     startTime.setDate(startTime.getDate() + (dayOffset - startTime.getDay() + 1 + (dayOffset < startTime.getDay() -1 ? 7 : 0) )); // Get next Mon, Tue, etc.
                     startTime.setHours(8 + index, 0, 0, 0); // Start at 8 AM, increment hour for each subject
                     const endTime = new Date(startTime);
                     endTime.setHours(startTime.getHours() + 1);

                     schedule.push({
                        id: `${assign.id}-${formatDate(startTime)}`, // Unique ID for the schedule entry
                        title: `${assign.subjectName || assign.subjectId} - ${assign.sectionId}`,
                        start: startTime,
                        end: endTime,
                        type: 'class',
                        location: `Room ${101 + index}`, // Example room
                        teacher: assign.teacherName // Add teacher name
                     });
                });
             return schedule as T;
        }
         if (phpPath === 'teacher/schedule/read.php') {
            // Find teacher (assuming ID 1 for mock)
            const teacherUser = mockTestUsers.find(u => u.username === "t1001");
            const teacherId = teacherUser?.userId;
            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments
                .filter(a => a.teacherId === teacherId) // Filter assignments for this teacher
                .forEach((assign, index) => {
                     const dayOffset = index % 5;
                     const startTime = new Date();
                     startTime.setDate(startTime.getDate() + (dayOffset - startTime.getDay() + 1 + (dayOffset < startTime.getDay() -1 ? 7 : 0) ));
                     startTime.setHours(8 + index, 0, 0, 0);
                     const endTime = new Date(startTime);
                     endTime.setHours(startTime.getHours() + 1);

                     schedule.push({
                         id: `${assign.id}-${formatDate(startTime)}`,
                         title: `${assign.subjectName || assign.subjectId} - ${assign.sectionId}`,
                        start: startTime,
                        end: endTime,
                        type: 'class',
                        location: `Room ${101 + index}`,
                        section: assign.sectionId // Include section for teacher's view
                     });
                });
             return schedule as T;
        }
         if (phpPath === 'teacher/subjects/read.php') {
             // Find teacher (assuming ID 1 for mock)
             const teacherUser = mockTestUsers.find(u => u.username === "t1001");
             const teacherId = teacherUser?.userId;
             const subjectIds = new Set(mockSectionAssignments.filter(a => a.teacherId === teacherId).map(a => a.subjectId));
             return mockCourses.filter(s => subjectIds.has(s.id)) as T;
         }
         if (phpPath === 'teacher/teachable-courses/read.php') {
            return [...mockTeacherTeachableCourses] as T;
        }
          if (phpPath === 'student/upcoming/read.php') {
             const upcoming: UpcomingItem[] = [];
             // Example: Add next 2 classes from schedule as upcoming
              const studentUser = mockTestUsers.find(u => u.username === "s1001")
              const studentDetails = mockStudents.find(s => s.id === studentUser?.userId);
              if (!studentDetails) return [] as T;

              const studentSchedule = mockSectionAssignments
                .filter(a => a.sectionId === studentDetails.section)
                .map((assign, index) => {
                     const dayOffset = index % 5;
                     const startTime = new Date();
                     startTime.setDate(startTime.getDate() + (dayOffset - startTime.getDay() + 1 + (dayOffset < startTime.getDay() - 1 ? 7 : 0)));
                     startTime.setHours(8 + index, 0, 0, 0);
                     return {
                         id: `${assign.id}-${formatDate(startTime)}`,
                         title: `${assign.subjectName || assign.subjectId} Class`,
                         date: startTime.toISOString(),
                         type: 'class',
                     };
                });
            if (studentSchedule.length > 0) {
                upcoming.push(studentSchedule[0]);
            } // Add first class if exists
            // Add some mock assignments/events
             upcoming.push({ id: "assign-mock1", title: "Submit CS101 Homework", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), type: "assignment" });
             upcoming.push({ id: "event-mock1", title: "Department Meeting", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), type: "event" });

             return upcoming.slice(0, 5) as T;
         }
         if (phpPath === 'admin/activity-log/read.php') {
            // Ensure unique IDs for logs before returning
            const uniqueLogs = Array.from(new Map(mockActivityLog.map(log => [log.id, log])).values());
            return uniqueLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10) as T;
        }
         if (phpPath.startsWith('sections/read.php/')) { // To fetch a single section by ID if needed
            const sectionId = phpPath.split('/').pop();
            const section = mockSections.find(s => s.id === sectionId);
             if (section) {
                 // Enhance with programName and adviserName if not already present
                 const program = mockApiPrograms.find(p => p.id === section.programId);
                 const adviser = mockFaculty.find(f => f.id === section.adviserId);
                 return {
                     ...section,
                     programName: program?.name || section.programId,
                     adviserName: adviser ? `${adviser.firstName} ${adviser.lastName}` : undefined,
                     studentCount: mockStudents.filter(st => st.section === section.id).length // Recalculate count
                 } as T;
             }
            throw new Error(`Mock section with ID ${sectionId} not found.`);
        }


        console.warn(`Mock API unhandled GET path: ${phpPath}`);
        throw new Error(`Mock GET endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
        console.error(`Error in mock fetchData for ${phpPath}:`, error);
        throw error; // Re-throw to be caught by the caller
    }
};

const mockPostData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const phpPath = finalMockPath(path);
    console.log(`MOCK postData to: ${phpPath}`, data);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    try {
         if (phpPath === 'login.php') {
             const { username, password } = data as any; // Type assertion for simplicity
            // Find user by username (case-insensitive for mock)
            let user = mockTestUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

            // Mock password check
            if (user && password === user.password) {
                let roleToReturn: AdminRole | 'Student' | 'Teacher' = user.role;
                if (user.role === 'Super Admin' || user.role === 'Sub Admin') {
                    const adminUserDetails = mockApiAdmins.find(a => a.id === user.userId);
                    if (adminUserDetails) {
                         roleToReturn = adminUserDetails.role; // Use specific Super Admin or Sub Admin role
                    }
                }

                const redirectPath = roleToReturn === 'Super Admin' || roleToReturn === 'Sub Admin' ? '/admin/dashboard'
                                 : user.role === 'Student' ? '/student/dashboard'
                                 : '/teacher/dashboard';
                // Simulate setting session/token
                if (typeof window !== 'undefined') {
                    localStorage.setItem('userRole', roleToReturn); // Store specific admin role
                    localStorage.setItem('userId', String(user.userId)); // Store userId from mockTestUsers
                }
                // Update lastAccessed for students and teachers
                if (user.role === 'Student') {
                    const studentIndex = mockStudents.findIndex(s => s.id === user.userId);
                    if (studentIndex > -1) mockStudents[studentIndex].lastAccessed = new Date().toISOString();
                } else if (user.role === 'Teacher') {
                    const facultyIndex = mockFaculty.findIndex(f => f.id === user.userId);
                    if (facultyIndex > -1) mockFaculty[facultyIndex].lastAccessed = new Date().toISOString();
                } else if (user.role === 'Sub Admin') { // For sub-admins if they are faculty
                    const facultyAdmin = mockFaculty.find(f => f.id === user.userId && f.department === 'Administrative');
                    if (facultyAdmin) {
                         const facultyIndex = mockFaculty.findIndex(f => f.id === user.userId);
                         if (facultyIndex > -1) mockFaculty[facultyIndex].lastAccessed = new Date().toISOString();
                    }
                }

                logActivity("User Login", `${user.username} logged in.`, user.username, user.userId, roleToReturn.toLowerCase().replace(' ', '_') as ActivityLogEntry['targetType']);
                return { success: true, role: roleToReturn as any, redirectPath: redirectPath, userId: user.userId } as ResponseData;
             }
             throw new Error("Invalid mock credentials or password mismatch.");
        }
         if (phpPath === 'students/create.php') {
            const newStudentData = data as unknown as Omit<Student, 'id' | 'studentId' | 'section' | 'username' | 'lastAccessed'>; // Ensure correct type for data

            const studentProgramId = newStudentData.program;
            let studentYearLevel = newStudentData.year;

            // Set year to '1st Year' if enrollment type is 'New'
            if (newStudentData.enrollmentType === 'New') {
                studentYearLevel = '1st Year';
            } else if (!studentYearLevel && (newStudentData.enrollmentType === 'Transferee' || newStudentData.enrollmentType === 'Returnee')) {
                 // For other types, year must be provided, otherwise it's an error (should be caught by schema validation ideally)
                 throw new Error("Year level is required for Transferee or Returnee enrollment type.");
            }

            if (!studentProgramId || !studentYearLevel) {
                throw new Error("Program and Year Level are required to determine section.");
            }

            // Section assignment logic
            let assignedSectionCode: string | undefined = undefined;
            const existingSectionsForProgramYear = mockSections
                .filter(s => s.programId === studentProgramId && s.yearLevel === studentYearLevel)
                .sort((a, b) => a.sectionCode.localeCompare(b.sectionCode)); // Sort to get the last section

            // Try to fill existing sections first (max 30 students per section)
            for (const section of existingSectionsForProgramYear) {
                const studentCountInSection = mockStudents.filter(st => st.section === section.id).length;
                if (studentCountInSection < 30) {
                    assignedSectionCode = section.id;
                    break;
                }
            }

            // If no existing section has space, or no sections exist for program/year, create a new one
            if (!assignedSectionCode) {
                // Generate a new section code (e.g., CS1A, CS1B, ...)
                const newSectionLetterSuffixIndex = existingSectionsForProgramYear.length; // 0 for 'A', 1 for 'B'
                assignedSectionCode = generateSectionCode(studentProgramId, studentYearLevel, newSectionLetterSuffixIndex);

                // Add the new section to mockSections if it doesn't exist
                if (!mockSections.some(s => s.id === assignedSectionCode)) {
                    const programDetails = mockApiPrograms.find(p => p.id === studentProgramId);
                    const newSectionObject: Section = {
                        id: assignedSectionCode,
                        sectionCode: assignedSectionCode,
                        programId: studentProgramId,
                        programName: programDetails?.name || studentProgramId, // Get program name
                        yearLevel: studentYearLevel,
                        studentCount: 0, // Will be incremented below
                        // adviserId and adviserName can be assigned later
                    };
                    mockSections.push(newSectionObject);
                    logActivity("Auto-Added Section", `Section ${assignedSectionCode} for ${studentProgramId} - ${studentYearLevel} due to enrollment.`, "System", assignedSectionCode, "section");
                }
            }
            const nextId = mockStudents.reduce((max, s) => Math.max(max, s.id), 0) + 1;
            const studentId = generateFrontendStudentId();
            const username = generateStudentUsername(studentId);

            const student: Student = {
                ...(newStudentData as Omit<Student, 'id' | 'studentId' | 'username' | 'section' | 'year' | 'lastAccessed'>), // Cast to remove fields that will be generated
                id: nextId,
                studentId: studentId,
                username: username,
                section: assignedSectionCode, // Assign the determined section
                year: studentYearLevel, // Assign the determined year level
                lastAccessed: null,
            };
            mockStudents.push(student);

            // Update student count in the assigned section
            const sectionToUpdate = mockSections.find(s => s.id === assignedSectionCode);
            if (sectionToUpdate) {
                sectionToUpdate.studentCount = mockStudents.filter(s => s.section === assignedSectionCode).length;
            }

            logActivity("Added Student", `${student.firstName} ${student.lastName} (${student.username}) to section ${student.section}`, "Admin", student.id, "student", true, { ...student, passwordHash: "mock_hash" }); // Add originalData for undo
            recalculateDashboardStats();
            return student as ResponseData;
        }
         if (phpPath === 'teachers/create.php') {
            const newFacultyData = data as unknown as Omit<Faculty, 'id' | 'facultyId' | 'username' | 'lastAccessed'>; // Data from form
            const nextId = mockFaculty.reduce((max, f) => Math.max(max, f.id), 0) + 1;
            const facultyId = generateTeacherId(); // Generates full ID like "1000YYYY"
            const department = newFacultyData.department || 'Teaching'; // Default if not provided
            const username = generateTeacherUsername(facultyId, department); // Use department for prefix

            const faculty: Faculty = {
                ...newFacultyData,
                id: nextId,
                facultyId: facultyId,
                username: username,
                lastAccessed: null,
            };
            mockFaculty.push(faculty);
             // If administrative staff, also add/update in mockApiAdmins
             if (faculty.department === 'Administrative') {
                 const existingAdminIndex = mockApiAdmins.findIndex(a => a.id === faculty.id);
                 const adminEntry: AdminUser = {
                    id: faculty.id,
                    username: faculty.username, // Use faculty username
                    firstName: faculty.firstName,
                    lastName: faculty.lastName,
                    email: faculty.email,
                    role: 'Sub Admin', // Default role for new administrative faculty
                    isSuperAdmin: false,
                 };
                 if (existingAdminIndex > -1) {
                     mockApiAdmins[existingAdminIndex] = adminEntry; // Update if exists
                 } else {
                     mockApiAdmins.push(adminEntry); // Add if new
                 }
             }
            logActivity("Added Faculty", `${faculty.firstName} ${faculty.lastName} (${faculty.username})`, "Admin", faculty.id, "faculty", true, { ...faculty, passwordHash: "mock_hash" }); // Add originalData for undo
            recalculateDashboardStats();
            return faculty as ResponseData;
        }
         if (phpPath === 'programs/create.php') {
             const newProgramData = data as unknown as Program; // Assuming payload matches Program type
             // Generate ID if not provided, or use provided ID
             const newProgramId = newProgramData.id || newProgramData.name.toUpperCase().substring(0, 3) + mockApiPrograms.length; // Simple ID generation
             if (mockApiPrograms.some(p => p.id === newProgramId)) {
                 throw new Error("Program with this ID already exists.");
             }
             const newProgram: Program = {
                 id: newProgramId,
                 name: newProgramData.name,
                 description: newProgramData.description,
                 courses: newProgramData.courses || { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] }, // Initialize courses structure
             };
             // Add any new courses defined within the program to the global mockCourses list if they don't exist
             Object.values(newProgram.courses).flat().forEach(course => {
                 if (!mockCourses.some(c => c.id === course.id)) {
                     mockCourses.push({ ...course, programId: course.type === 'Major' ? (course.programId || [newProgram.id]) : [] }); // Ensure major courses have programId
                 }
             });
             mockApiPrograms.push(newProgram);
             logActivity("Added Program", newProgram.name, "Admin", newProgram.id, "program");
             return newProgram as ResponseData;
         }
         if (phpPath === 'courses/create.php') {
             const newCourseData = data as Course; // Expect full Course object from form
             // Generate ID if not provided
             const nextIdNumber = mockCourses.reduce((max, c) => {
                const numId = parseInt(c.id.replace(/[^0-9]/g, ''), 10); // Extract number from ID like CS101 -> 101
                return isNaN(numId) ? max : Math.max(max, numId);
             }, 0) +1;
             const newCourse: Course = {
                 ...newCourseData,
                 id: newCourseData.id || `C${String(nextIdNumber).padStart(3,'0')}`, // Example: C001, C102
                 programId: newCourseData.type === 'Major' ? (newCourseData.programId || []) : [], // Ensure programId is array for Major, empty for Minor
             };
             if (mockCourses.some(c => c.id === newCourse.id)) {
                 throw new Error(`Course with ID ${newCourse.id} already exists.`);
             }
             mockCourses.push(newCourse);
             logActivity("Added Course", newCourse.name, "Admin", newCourse.id, "course");
             return newCourse as ResponseData;
         }
          // Mock endpoint for assigning a course to a specific year in a program
          if (phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)) {
              const programId = phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)?.[1];
              const { courseId, yearLevel } = data as { courseId: string, yearLevel: YearLevel }; // Payload from modal
              const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
              const course = mockCourses.find(c => c.id === courseId);

              if (programIndex === -1) throw new Error("Program not found.");
              if (!course) throw new Error("Course not found.");

               // Ensure the year level exists in the program's courses structure
               if (!mockApiPrograms[programIndex].courses[yearLevel]) {
                  mockApiPrograms[programIndex].courses[yearLevel] = [];
               }
                // Check if course is already assigned to this year level in this program
                if (mockApiPrograms[programIndex].courses[yearLevel].some(c => c.id === courseId)) {
                    throw new Error(`Course ${course.name} is already assigned to ${programId} - ${yearLevel}.`);
                }
                // For Major courses, ensure it belongs to the target program
                if (course.type === 'Major' && (!course.programId || !course.programId.includes(programId))) {
                     throw new Error(`Major course ${course.name} does not belong to program ${programId} and cannot be assigned.`);
                }
                mockApiPrograms[programIndex].courses[yearLevel].push(course); // Add the course
                logActivity("Assigned Course to Program", `${course.name} to ${mockApiPrograms[programIndex].name} (${yearLevel})`, "Admin");
                return { ...mockApiPrograms[programIndex] } as ResponseData; // Return updated program
         }

         if (phpPath === 'admin/reset_password.php') {
              const { userId, userType, lastName } = data as { userId: number; userType: string; lastName: string };
              let targetFullname: string = `ID ${userId}`;

              if (userType === 'student') {
                  const student = mockStudents.find(s => s.id === userId);
                  if (student) targetFullname = `${student.firstName} ${student.lastName}`;
                  else throw new Error(`Student with ID ${userId} not found.`);
                  // Actual password reset logic for mock would update a mock password field if it existed
                  logActivity(`Reset Student Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'teacher') {
                  const facultyMember = mockFaculty.find(f => f.id === userId);
                  if (facultyMember) targetFullname = `${facultyMember.firstName} ${facultyMember.lastName}`;
                  else throw new Error(`Faculty with ID ${userId} not found.`);
                  // Actual password reset logic for mock
                   logActivity(`Reset Faculty Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'admin') { // For Sub Admins
                  const adminUser = mockApiAdmins.find(a => a.id === userId);
                  if (adminUser) {
                      if(adminUser.isSuperAdmin) throw new Error("Super Admin password must be changed via Settings."); // Prevent Super Admin reset here
                      targetFullname = adminUser.firstName ? `${adminUser.firstName} ${adminUser.lastName}` : adminUser.username;
                      // Actual password reset logic for mock
                      logActivity("Reset Admin Password", `For ${targetFullname} (${adminUser.username})`, "Admin");
                  } else {
                      // Check if it's a faculty member who is an admin but not in mockApiAdmins explicitly
                      const facultyAsAdmin = mockFaculty.find(f => f.id === userId && f.department === 'Administrative');
                      if (facultyAsAdmin) {
                          targetFullname = `${facultyAsAdmin.firstName} ${facultyAsAdmin.lastName}`;
                          logActivity("Reset Admin Password", `For ${targetFullname} (Faculty Admin)`, "Admin");
                      } else {
                        throw new Error(`Admin user with ID ${userId} not found.`);
                      }
                  }
              } else {
                  throw new Error(`Invalid user type for password reset: ${userType}`);
              }

              console.log(`Mock password reset for ${userType} ${targetFullname} using lastName: ${lastName}`);
              // Default password: first two letters of last name + 1000
              const defaultPassword = `${lastName.substring(0, 2).toLowerCase()}1000`;
              console.log(`Default password would be: ${defaultPassword}`);
              return { message: `${userType} password reset successfully. Default: ${defaultPassword}` } as ResponseData;
        }
        if (phpPath === 'announcements/create.php') {
            const newAnnData = data as { title: string; content: string; targetAudience: Announcement['targetAudience'], target: any };
            const nextId = `ann${mockAnnouncements.length + 1}`;
            const newAnnouncement: Announcement = {
                id: nextId,
                title: newAnnData.title,
                content: newAnnData.content,
                date: new Date(),
                targetAudience: newAnnData.targetAudience || 'All', // Default to 'All'
                target: newAnnData.target, // Should include programId, yearLevel, section
                author: "Admin" // Assuming Admin creates announcements via this mock
            };
            mockAnnouncements.unshift(newAnnouncement); // Add to the beginning for recent first
            logActivity("Created Announcement", newAnnData.title, "Admin", newAnnData.target.programId || newAnnData.target.section || newAnnData.target.yearLevel || 'all', 'announcement');
            return newAnnouncement as ResponseData;
        }
         if (phpPath.match(/^sections\/adviser\/update\.php$/)) { // Updated path to match the call
             const { sectionId, adviserId } = data as { sectionId: string, adviserId: number | null };
             const sectionIndex = mockSections.findIndex(s => s.id === sectionId);
             if (sectionIndex > -1) {
                 const adviser = mockFaculty.find(t => t.id === adviserId);
                 mockSections[sectionIndex].adviserId = adviserId ?? undefined; // Update to undefined if null
                 mockSections[sectionIndex].adviserName = adviser ? `${adviser.firstName} ${adviser.lastName}` : undefined;
                 logActivity("Updated Section Adviser", `For section ${mockSections[sectionIndex].sectionCode} to ${adviser ? adviser.firstName + ' ' + adviser.lastName : 'None'}`, "Admin");
                 return { ...mockSections[sectionIndex] } as ResponseData;
             }
             throw new Error("Section not found.");
         }
         if (phpPath === 'sections/assignments/create.php') {
             const { sectionId, subjectId, teacherId } = data as { sectionId: string; subjectId: string; teacherId: number };
             const subject = mockCourses.find(s => s.id === subjectId);
             const facultyMember = mockFaculty.find(t => t.id === teacherId);
             const assignmentId = `${sectionId}-${subjectId}`; // Unique ID for section-subject assignment
             // Check if assignment already exists (update teacher if so)
              if (mockSectionAssignments.some(a => a.id === assignmentId)) {
                   const existingAssignmentIndex = mockSectionAssignments.findIndex(a => a.id === assignmentId);
                   mockSectionAssignments[existingAssignmentIndex].teacherId = teacherId;
                   mockSectionAssignments[existingAssignmentIndex].teacherName = facultyMember ? `${facultyMember.firstName} ${facultyMember.lastName}` : undefined;
                   logActivity("Updated Teacher for Course-Section", `${subject?.name} in section ${sectionId} to ${facultyMember?.firstName} ${facultyMember?.lastName}`, "Admin");
                   return { ...mockSectionAssignments[existingAssignmentIndex] } as ResponseData;
              }
             // Create new assignment if it doesn't exist
             const newAssignment: SectionSubjectAssignment = {
                 id: assignmentId,
                 sectionId,
                 subjectId,
                 subjectName: subject?.name,
                 teacherId,
                 teacherName: facultyMember ? `${facultyMember.firstName} ${facultyMember.lastName}` : undefined // Use Faculty names
             };
             mockSectionAssignments.push(newAssignment);
             logActivity("Assigned Course to Section", `${subject?.name} to section ${sectionId} with ${facultyMember?.firstName} ${facultyMember?.lastName}`, "Admin");
             return newAssignment as ResponseData;
         }
         if (phpPath === 'assignments/grades/update.php') { // Endpoint for submitting/updating grades
              const gradeData = data as StudentSubjectAssignmentWithGrades; // Payload matches this type
              // Find if an entry already exists for this student and subject
              const index = mockStudentSubjectAssignmentsWithGrades.findIndex(a => a.assignmentId === gradeData.assignmentId && a.studentId === gradeData.studentId);

              if (index > -1) {
                  // Update existing grades
                   mockStudentSubjectAssignmentsWithGrades[index] = {
                       ...mockStudentSubjectAssignmentsWithGrades[index], // Keep existing non-grade fields
                       ...gradeData // Update with new grade values
                   };
                   const updated = mockStudentSubjectAssignmentsWithGrades[index];
                    // Recalculate status
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (updated.prelimGrade !== null || updated.midtermGrade !== null || updated.finalGrade !== null) {
                        status = 'Incomplete';
                    }
                    if (updated.finalGrade !== null) { // If final grade is present, consider it complete
                        status = 'Complete';
                    }
                    updated.status = status;
                    logActivity("Updated Grades", `For ${updated.studentName} in ${updated.subjectName}`, "Teacher"); // Assuming Teacher submits
                   return updated as ResponseData;
               } else {
                    // If no entry, create a new one (should ideally not happen if assignments are pre-populated)
                    // For mock, we might need to create it if it's the first submission
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (gradeData.prelimGrade !== null || gradeData.midtermGrade !== null || gradeData.finalGrade !== null) {
                        status = 'Incomplete';
                    }
                    if (gradeData.finalGrade !== null) {
                        status = 'Complete';
                    }
                    const student = mockStudents.find(s => s.id === gradeData.studentId);
                    const subject = mockCourses.find(s => s.id === gradeData.subjectId);
                    // Try to find section and year from student data
                    const sectionAssignment = mockSectionAssignments.find(sa => sa.id === gradeData.assignmentId.substring(0, gradeData.assignmentId.lastIndexOf('-'))); // Extract base assignment ID


                    const newEntry: StudentSubjectAssignmentWithGrades = {
                        ...gradeData,
                        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
                        subjectName: subject ? subject.name : 'Unknown Subject',
                        section: sectionAssignment?.sectionId || 'N/A', // Get section from assignment
                         year: student?.year || 'N/A', // Get year from student
                        status: status,
                    };
                    mockStudentSubjectAssignmentsWithGrades.push(newEntry);
                    logActivity("Submitted Grades", `For ${newEntry.studentName} in ${newEntry.subjectName}`, "Teacher");
                    return newEntry as ResponseData;
               }
         }
        // Placeholder for password change for admin - actual logic would be in PHP
        if (phpPath === 'admin/change_password.php') { logActivity("Changed Admin Password", "Super Admin password updated", "Admin"); return { message: "Admin password updated successfully." } as ResponseData; }
        if (phpPath === 'student/change_password.php') { logActivity("Changed Password", "Student updated their password", "Student"); return { message: "Student password updated successfully." } as ResponseData; }
        if (phpPath === 'teacher/change_password.php') { logActivity("Changed Password", "Faculty updated their password", "Faculty"); return { message: "Faculty password updated successfully." } as ResponseData; }

        if (phpPath === 'admin/activity-log/undo.php') {
            const { logId } = data as { logId: string };
            const logEntryIndex = mockActivityLog.findIndex(entry => entry.id === logId);

            if (logEntryIndex === -1) {
                console.error(`Undo failed: Log entry with ID ${logId} not found.`);
                throw new Error("Action cannot be undone: Log entry not found.");
            }
            const logEntry = mockActivityLog[logEntryIndex];

            if (!logEntry.canUndo) {
                 console.error(`Undo failed: Action "${logEntry.action}" for log ID ${logId} is not undoable.`);
                throw new Error("This action cannot be undone.");
            }


            let undoSuccess = false;
            let specificUndoMessage: string | undefined;

            // Call specific undo functions
            if (logEntry.action === "Added Student" && logEntry.targetType === "student" && logEntry.originalData && logEntry.targetId) {
                executeUndoAddStudent(logEntry.targetId as number, logEntry.originalData as Student);
                undoSuccess = true;
            } else if (logEntry.action === "Deleted Student" && logEntry.targetType === "student" && logEntry.originalData) {
                executeUndoDeleteStudent(logEntry.originalData as Student);
                undoSuccess = true;
            } else if (logEntry.action === "Added Faculty" && logEntry.targetType === "faculty" && logEntry.originalData && logEntry.targetId) {
                executeUndoAddFaculty(logEntry.targetId as number, logEntry.originalData as Faculty);
                undoSuccess = true;
            } else if (logEntry.action === "Deleted Faculty" && logEntry.targetType === "faculty" && logEntry.originalData) {
                executeUndoDeleteFaculty(logEntry.originalData as Faculty);
                undoSuccess = true;
            } else if (logEntry.action === "Removed Admin Role" && logEntry.targetType === "admin" && logEntry.originalData) {
                undoSuccess = executeUndoRemoveAdminRole(logEntry.originalData as AdminUser & { originalDepartment?: DepartmentType });
                 if (!undoSuccess) { // If executeUndoRemoveAdminRole returned false
                    specificUndoMessage = "Could not fully undo admin role removal: Corresponding faculty record might not exist or was not a faculty-derived admin.";
                }
            } else {
                 console.error(`Undo failed: Undo logic for action type "${logEntry.action}" is not implemented or data missing for log ID ${logId}.`);
                 throw new Error(`Undo for action type "${logEntry.action}" is not implemented in mock or data missing.`);
            }

            if (undoSuccess) {
                recalculateDashboardStats(); // Recalculate stats after undo
                mockActivityLog.splice(logEntryIndex, 1); // Remove the undone log
                return { success: true, message: "Action undone." } as ResponseData;
            } else {
                throw new Error(specificUndoMessage || "Undo operation failed or was not applicable.");
            }
        }
        if (phpPath === 'sections/create.php') { // For admin adding sections manually (if ever needed)
            const newSectionData = data as Partial<Section>; // Expect section details
            const { programId, yearLevel, sectionCode: providedSectionCode } = newSectionData;

            if (!programId || !yearLevel) {
                throw new Error("Program ID and Year Level are required to create a section.");
            }

            // Use provided sectionCode or generate one if not provided
            const sectionCode = providedSectionCode || generateSectionCode(
                programId,
                yearLevel,
                mockSections.filter(s => s.programId === programId && s.yearLevel === yearLevel).length
            );

            if (mockSections.some(s => s.id === sectionCode)) { // Check if ID (which is sectionCode) already exists
                 throw new Error(`Section with code ${sectionCode} already exists.`);
            }

            const newSection: Section = {
                id: sectionCode, // sectionCode is the ID
                sectionCode: sectionCode,
                programId: programId,
                yearLevel: yearLevel,
                programName: mockApiPrograms.find(p => p.id === programId)?.name, // Add program name
                adviserId: newSectionData.adviserId, // Optional adviser
                adviserName: newSectionData.adviserId ? mockFaculty.find(f => f.id === newSectionData.adviserId)?.firstName + " " + mockFaculty.find(f => f.id === newSectionData.adviserId)?.lastName : undefined,
                studentCount: 0, // New sections start with 0 students
            };
            mockSections.push(newSection);
            logActivity("Added Section", `Section ${newSection.sectionCode} for ${newSection.programName} - ${newSection.yearLevel}`, "Admin", newSection.id, "section");
            return newSection as ResponseData;
        }
        if (phpPath === 'teacher/teachable-courses/update.php') {
            const { teacherId, courseIds } = data as { teacherId: number, courseIds: string[] };
            const index = mockTeacherTeachableCourses.findIndex(ttc => ttc.teacherId === teacherId);
            if (index > -1) {
                mockTeacherTeachableCourses[index].courseIds = courseIds;
            } else {
                mockTeacherTeachableCourses.push({ teacherId, courseIds });
            }
            return { success: true, message: "Teachable courses updated." } as ResponseData;
        }


        console.warn(`Mock API unhandled POST path: ${phpPath}`);
         throw new Error(`Mock POST endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
         console.error(`Error in mock postData for ${phpPath}:`, error);
         throw error; // Re-throw to be caught by the caller
    }
};

const mockPutData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
     const phpPath = finalMockPath(path);
    console.log(`MOCK putData to: ${phpPath}`, data);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    const idStr = phpPath.split('/').pop() || ''; // Get ID from path for updates

    try {
         if (phpPath.startsWith('students/update.php/')) {
            const id = parseInt(idStr, 10);
            const studentIndex = mockStudents.findIndex(s => s.id === id);
            if (studentIndex > -1) {
                const oldStudentData = { ...mockStudents[studentIndex] }; // For logging or undo comparison
                const updatedStudentData = data as unknown as Partial<Student>; // Data from form
                // Merge existing data with new data, ensuring required fields are maintained
                mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...updatedStudentData };

                // If section was changed, recalculate section counts
                if (oldStudentData.section !== mockStudents[studentIndex].section) {
                    recalculateMockSectionCounts();
                }
                logActivity("Updated Student", `${mockStudents[studentIndex].firstName} ${mockStudents[studentIndex].lastName}`, "Admin", id, "student");
                recalculateDashboardStats();
                return { ...mockStudents[studentIndex] } as ResponseData;
            }
            throw new Error("Student not found for mock update.");
        }
         if (phpPath.startsWith('teachers/update.php/')) {
            const id = parseInt(idStr, 10);
            const facultyIndex = mockFaculty.findIndex(t => t.id === id);
             if (facultyIndex > -1) {
                const oldDepartment = mockFaculty[facultyIndex].department;
                mockFaculty[facultyIndex] = { ...mockFaculty[facultyIndex], ...(data as unknown as Partial<Faculty>) };
                const updatedFaculty = mockFaculty[facultyIndex];

                // Update admin list if department changed to/from Administrative
                const adminIndex = mockApiAdmins.findIndex(a => a.id === updatedFaculty.id && !a.isSuperAdmin);
                if (updatedFaculty.department === 'Administrative') {
                    const adminEntry: AdminUser = {
                        id: updatedFaculty.id, username: updatedFaculty.username, firstName: updatedFaculty.firstName,
                        lastName: updatedFaculty.lastName, email: updatedFaculty.email, role: 'Sub Admin', isSuperAdmin: false
                    };
                    if (adminIndex > -1) mockApiAdmins[adminIndex] = adminEntry; // Update existing admin
                    else if (!mockApiAdmins.some(a => a.id === updatedFaculty.id)) mockApiAdmins.push(adminEntry); // Add if new
                } else if (oldDepartment === 'Administrative' && updatedFaculty.department !== 'Administrative') {
                    // If department changed FROM Administrative, remove from sub-admins
                    if (adminIndex > -1) mockApiAdmins.splice(adminIndex, 1);
                }

                logActivity("Updated Faculty", `${updatedFaculty.firstName} ${updatedFaculty.lastName}`, "Admin", id, "faculty");
                recalculateDashboardStats();
                return { ...updatedFaculty } as ResponseData;
            }
            throw new Error("Faculty not found for mock update.");
        }
         if (phpPath === 'student/profile/update.php') {
            const profileData = data as Student; // Assuming full Student object is passed
            // Find student by ID (assuming student ID is passed correctly or known from session)
            const studentUser = mockTestUsers.find(u => u.username === "s1001") // Using fixed mock student for now
            const studentId = studentUser?.userId; // Get ID from mock test user
            const index = mockStudents.findIndex(s => s.id === studentId);
            if (index > -1) {
                // Only update editable fields
                mockStudents[index] = {
                    ...mockStudents[index], // Keep existing data
                    // Update only allowed fields
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    middleName: profileData.middleName,
                    suffix: profileData.suffix,
                    gender: profileData.gender,
                    birthday: profileData.birthday,
                    email: profileData.email,
                    phone: profileData.phone,
                    emergencyContactName: profileData.emergencyContactName,
                    emergencyContactRelationship: profileData.emergencyContactRelationship,
                    emergencyContactPhone: profileData.emergencyContactPhone,
                    emergencyContactAddress: profileData.emergencyContactAddress,
                 };
                logActivity("Updated Profile", `Student ${mockStudents[index].firstName} ${mockStudents[index].lastName} updated their profile.`, "Student", mockStudents[index].id, "student");
                return { ...mockStudents[index] } as ResponseData;
            }
            throw new Error("Mock student profile not found for update.");
        }
         if (phpPath === 'teacher/profile/update.php') {
             const profileData = data as Faculty;
             const teacherUser = mockTestUsers.find(u => u.username === "t1001"); // Fixed mock teacher
            const teacherId = teacherUser?.userId;
             const index = mockFaculty.findIndex(t => t.id === teacherId);
             if (index > -1) {
                 // Update only allowed fields
                 mockFaculty[index] = {
                    ...mockFaculty[index],
                    // Editable fields
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    middleName: profileData.middleName,
                    suffix: profileData.suffix,
                    gender: profileData.gender,
                    birthday: profileData.birthday,
                    address: profileData.address,
                    email: profileData.email,
                    phone: profileData.phone,
                    emergencyContactName: profileData.emergencyContactName,
                    emergencyContactRelationship: profileData.emergencyContactRelationship,
                    emergencyContactPhone: profileData.emergencyContactPhone,
                    emergencyContactAddress: profileData.emergencyContactAddress,
                  };
                 logActivity("Updated Profile", `Faculty ${mockFaculty[index].firstName} ${mockFaculty[index].lastName} updated their profile.`, "Faculty", mockFaculty[index].id, "faculty");
                 return { ...mockFaculty[index] } as ResponseData;
             }
             throw new Error("Mock faculty profile not found for update.");
         }
          if (phpPath.startsWith('programs/update.php/')) { // Assuming ID is in path
             const programId = idStr;
             const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1) {
                 const updatedData = data as unknown as Program; // Full program object with courses
                 // Update basic program details
                 mockApiPrograms[programIndex].name = updatedData.name ?? mockApiPrograms[programIndex].name;
                 mockApiPrograms[programIndex].description = updatedData.description ?? mockApiPrograms[programIndex].description;
                 // Update courses for each year level
                if (updatedData.courses) {
                    (Object.keys(updatedData.courses) as YearLevel[]).forEach(year => {
                        if (updatedData.courses[year]) { // If this year level data is provided
                            // Replace the courses for this year level
                            mockApiPrograms[programIndex].courses[year] = updatedData.courses[year].map(c => {
                                // Ensure these courses are also updated in the global mockCourses list or added if new
                                const globalCourseIndex = mockCourses.findIndex(gc => gc.id === c.id);
                                if (globalCourseIndex > -1) {
                                    mockCourses[globalCourseIndex] = {...mockCourses[globalCourseIndex], ...c};
                                } else {
                                    mockCourses.push(c);
                                }
                                return c; // Return the course object for the program's course list
                            });
                        }
                    });
                }
                 logActivity("Updated Program", mockApiPrograms[programIndex].name, "Admin", programId, "program");
                 return { ...mockApiPrograms[programIndex] } as ResponseData;
             }
             throw new Error("Program not found for mock update.");
          }
          if (phpPath.startsWith('courses/update.php/')) { // Assuming ID is in path
              const courseId = idStr;
              const courseIndex = mockCourses.findIndex(c => c.id === courseId);
              if (courseIndex > -1) {
                   const updatedCourseData = data as Partial<Course>; // Payload from form
                   mockCourses[courseIndex] = {
                       ...mockCourses[courseIndex], // Keep existing fields
                       ...updatedCourseData, // Update with new data
                       programId: updatedCourseData.type === 'Major' ? (updatedCourseData.programId || []) : [], // Handle programId based on type
                    };
                    // If this course is used in any program, update it there too
                    mockApiPrograms.forEach(program => {
                         Object.keys(program.courses).forEach(year => {
                             const yr = year as YearLevel;
                             const assignedIndex = program.courses[yr].findIndex(c => c.id === courseId);
                             if (assignedIndex > -1) {
                                 // Update with the new details from mockCourses
                                 program.courses[yr][assignedIndex] = { ...mockCourses[courseIndex] };
                             }
                         });
                    });
                    logActivity("Updated Course", mockCourses[courseIndex].name, "Admin", courseId, "course");
                   return { ...mockCourses[courseIndex] } as ResponseData;
              }
              throw new Error("Course not found for mock update.");
          }
          if (phpPath.startsWith('sections/update.php/')) { // Update section details (e.g., program, year - not adviser)
            const sectionIdToUpdate = idStr;
            const sectionIndex = mockSections.findIndex(s => s.id === sectionIdToUpdate);
            if (sectionIndex > -1) {
                const updatedSectionData = data as Partial<Section>;
                // Only allow updating programId and yearLevel here
                mockSections[sectionIndex] = {
                    ...mockSections[sectionIndex],
                    programId: updatedSectionData.programId ?? mockSections[sectionIndex].programId,
                    yearLevel: updatedSectionData.yearLevel ?? mockSections[sectionIndex].yearLevel,
                    // Update programName based on new programId
                    programName: mockApiPrograms.find(p => p.id === (updatedSectionData.programId ?? mockSections[sectionIndex].programId))?.name,
                };
                logActivity("Updated Section Details", `Section ${mockSections[sectionIndex].sectionCode} program/year updated.`, "Admin", sectionIdToUpdate, "section");
                return { ...mockSections[sectionIndex] } as ResponseData;
            }
            throw new Error("Section not found for mock update.");
        }

        console.warn(`Mock API unhandled PUT path: ${phpPath}`);
        throw new Error(`Mock PUT endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
        console.error(`Error in mock putData for ${phpPath}:`, error);
        throw error; // Re-throw
    }
};

const mockDeleteData = async (path: string): Promise<void> => {
    const phpPath = finalMockPath(path);
    console.log(`MOCK deleteData at: ${phpPath}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    const idPart = phpPath.split('/').pop() || ''; // Get ID from path

    try {
         if (phpPath.startsWith('students/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const studentIndex = mockStudents.findIndex(s => s.id === id);
            if (studentIndex === -1) throw new Error("Student not found for mock delete.");
            const deletedStudent = { ...mockStudents[studentIndex] }; // Capture data for undo
            mockStudents.splice(studentIndex, 1);
            recalculateMockSectionCounts(); // Update section student counts
            logActivity("Deleted Student", `${deletedStudent.firstName} ${deletedStudent.lastName} (${deletedStudent.username})`, "Admin", id, "student", true, deletedStudent); // Mark as undoable and pass originalData
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('teachers/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const facultyIndex = mockFaculty.findIndex(t => t.id === id);
            if (facultyIndex === -1) throw new Error("Faculty not found for mock delete.");
            const deletedFaculty = { ...mockFaculty[facultyIndex] }; // Capture data for undo
            mockFaculty.splice(facultyIndex, 1);
            // If faculty was administrative, remove from admin list as well
            if (deletedFaculty.department === 'Administrative') {
                 mockApiAdmins = mockApiAdmins.filter(a => a.id !== id || a.isSuperAdmin); // Don't remove super admin
            }
            // Remove as adviser from sections and unassign from courses
            mockSections.forEach(sec => { if(sec.adviserId === id) { sec.adviserId = undefined; sec.adviserName = undefined;} });
            mockSectionAssignments = mockSectionAssignments.filter(assign => assign.teacherId !== id);

            logActivity("Deleted Faculty", `${deletedFaculty.firstName} ${deletedFaculty.lastName} (${deletedFaculty.username})`, "Admin", id, "faculty", true, deletedFaculty); // Mark as undoable
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('admins/delete.php/')) { // For removing admin role, not deleting user record
            const adminIdToRemove = parseInt(idPart || '0', 10);
            if (adminIdToRemove === 0) throw new Error("Cannot remove Super Admin role."); // Super admin cannot be removed

            const adminUser = mockApiAdmins.find(a => a.id === adminIdToRemove);
            if (!adminUser) throw new Error("Admin role not found for mock removal.");
            const originalAdminData = {...adminUser}; // For undo log

            // If this admin is also a faculty member, change their department to 'Teaching'
            // This effectively removes their admin privileges derived from being 'Administrative' faculty
            const facultyMember = mockFaculty.find(f => f.id === adminIdToRemove);
            let originalDepartment: DepartmentType | undefined = undefined;
            if (facultyMember && facultyMember.department === 'Administrative') {
                originalDepartment = facultyMember.department;
                facultyMember.department = 'Teaching'; // Change department
                logActivity("Removed Admin Role", `For ${adminUser.username}. Faculty department changed to Teaching.`, "Admin", adminIdToRemove, "admin", true, {...originalAdminData, originalDepartment});
            } else {
                 // If it's an explicit admin not tied to faculty (or faculty not administrative)
                 logActivity("Removed Admin Role", `Explicit admin ${adminUser.username} removed.`, "Admin", adminIdToRemove, "admin", true, originalAdminData);
            }
             // Remove from mockApiAdmins list in all cases (except super admin)
             mockApiAdmins = mockApiAdmins.filter(a => a.id !== adminIdToRemove);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('announcements/delete.php/')) {
             const id = idPart; // Announcement ID is string
             const annIndex = mockAnnouncements.findIndex(a => a.id === id);
             if (annIndex === -1) throw new Error("Announcement not found for mock delete.");
             const deletedAnnouncement = { ...mockAnnouncements[annIndex] };
             mockAnnouncements.splice(annIndex, 1);
             logActivity("Deleted Announcement", deletedAnnouncement.title, "Admin", id, "announcement");
             return;
         }
         if (phpPath.startsWith('assignments/delete.php/')) { // Used by SectionDetailsPage to unassign teacher
             const id = idPart; // This is the assignmentId (e.g., sectionId-subjectId)
             const assignIndex = mockSectionAssignments.findIndex(a => a.id === id);
             if (assignIndex === -1) throw new Error("Section-Course assignment not found for mock delete.");
             const deletedAssignment = { ...mockSectionAssignments[assignIndex] };
             mockSectionAssignments.splice(assignIndex, 1);
             // Log appropriately if needed, e.g., Teacher Unassigned
             logActivity("Deleted Section-Course Assignment", `Course ${deletedAssignment.subjectName} from section ${deletedAssignment.sectionId}`, "Admin");
             return;
         }
         if (phpPath.startsWith('programs/delete.php/')) { // Delete a whole program
             const programId = idPart;
             const progIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (progIndex === -1) throw new Error("Program not found for mock delete.");
             const deletedProgram = { ...mockApiPrograms[progIndex] };
             mockApiPrograms.splice(progIndex, 1);

             // Also remove this programId from any Major courses associated with it
             mockCourses = mockCourses.map(c => {
                 if (c.type === 'Major' && c.programId?.includes(programId)) {
                     const updatedProgramIds = c.programId.filter(pid => pid !== programId);
                     return { ...c, programId: updatedProgramIds };
                 }
                 return c;
             });
             // Remove sections associated with this program
             mockSections = mockSections.filter(s => s.programId !== programId);
             // Remove course assignments within those sections
             mockSectionAssignments = mockSectionAssignments.filter(a => !mockSections.some(s => s.id === a.sectionId && s.programId === programId));
             logActivity("Deleted Program", deletedProgram.name, "Admin", programId, "program");
             return;
          }
          if (phpPath.startsWith('courses/delete.php/')) { // Delete a system course
             const courseId = idPart;
             const courseIndex = mockCourses.findIndex(c => c.id === courseId);
             if (courseIndex === -1) throw new Error("Course not found for mock delete.");
             const deletedCourse = { ...mockCourses[courseIndex] };
             mockCourses.splice(courseIndex, 1);

             // Remove this course from all programs' yearly assignments
             mockApiPrograms.forEach(program => {
                 Object.keys(program.courses).forEach(year => {
                      const yr = year as YearLevel;
                      program.courses[yr] = program.courses[yr].filter(c => c.id !== courseId);
                 });
             });
             // Remove from section assignments
             mockSectionAssignments = mockSectionAssignments.filter(a => a.subjectId !== courseId);
             logActivity("Deleted Course", deletedCourse.name, "Admin", courseId, "course");
             return;
          }
          // Mock endpoint for removing a specific course from a program's year level
          if (phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/)) {
             const [, programId, yearLevelEncoded, courseId] = phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/) || [];
             const yearLevel = decodeURIComponent(yearLevelEncoded) as YearLevel; // Decode year level string
             const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1 && mockApiPrograms[programIndex].courses[yearLevel]) {
                 const courseIndexInProgram = mockApiPrograms[programIndex].courses[yearLevel].findIndex(c => c.id === courseId);
                 if (courseIndexInProgram === -1) throw new Error("Course assignment not found in program/year for mock removal.");
                 const removedCourse = mockApiPrograms[programIndex].courses[yearLevel][courseIndexInProgram];
                 mockApiPrograms[programIndex].courses[yearLevel].splice(courseIndexInProgram, 1);
                 logActivity("Removed Course from Program", `${removedCourse.name} from ${mockApiPrograms[programIndex].name} (${yearLevel})`, "Admin");
                 return;
             }
             throw new Error("Program or year level not found for removing course assignment.");
          }
           if (phpPath.startsWith('sections/delete.php/')) {
            const sectionIdToDelete = idPart;
            const sectionIndex = mockSections.findIndex(s => s.id === sectionIdToDelete);
            if (sectionIndex === -1) throw new Error("Section not found for mock delete.");
            const deletedSection = { ...mockSections[sectionIndex] };

            // Check if students are enrolled
            const studentsInSec = mockStudents.filter(s => s.section === sectionIdToDelete).length;
            if (studentsInSec > 0) {
                // Instead of throwing error, just log a warning or prevent deletion if hard rule
                console.warn(`Attempting to delete section ${deletedSection.sectionCode} which has ${studentsInSec} student(s). For mock, proceeding with disassociation.`);
                // Disassociate students (set their section to null or a default 'unassigned' section)
                mockStudents = mockStudents.map(s => {
                    if (s.section === sectionIdToDelete) {
                        return { ...s, section: 'UNASSIGNED' }; // Or null, depending on desired behavior
                    }
                    return s;
                });
            }

            mockSections.splice(sectionIndex, 1);
            // Also remove related section_subject_assignments
            mockSectionAssignments = mockSectionAssignments.filter(sa => sa.sectionId !== sectionIdToDelete);

            logActivity("Deleted Section", `Section ${deletedSection.sectionCode}`, "Admin", sectionIdToDelete, "section");
            recalculateMockSectionCounts(); // Update counts if needed for other displays
            return;
        }

        console.warn(`Mock API unhandled DELETE path: ${phpPath}`);
        throw new Error(`Mock DELETE endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
         console.error(`Error in mock deleteData for ${phpPath}:`, error);
         throw error; // Re-throw
    }
};

// --- Data Fetching Functions ---
export const fetchData = async <T>(path: string): Promise<T> => {
    if (USE_MOCK_API) return mockFetchData(path);

    const url = getApiUrl(path);
    let response: Response;
    try {
        response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json'} });
    } catch (networkError: any) {
        return handleFetchError(networkError, path, 'GET', true);
    }

    let responseBodyText = "";
    try {
        responseBodyText = await response.text(); // Read the body as text first
    } catch (readError) {
        console.warn(`Failed to read response body as text for GET ${url}:`, readError);
         if (!response.ok) {
            handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'GET');
        }
    }

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
        if (responseBodyText) {
            try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
            } catch (jsonParseError) {
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
            }
        }
        console.error("API Error Response Text (fetchData):", responseBodyText || "(empty body)");
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'GET');
    }

    if (response.status === 204 || !responseBodyText) {
        return {} as T;
    }

    try {
        return JSON.parse(responseBodyText) as T;
    } catch (jsonError: any) {
        console.error("Failed to parse JSON response (fetchData):", jsonError, "Body was:", responseBodyText);
        handleFetchError({ name: 'JSONError', message: 'Failed to parse JSON response.' }, path, 'GET');
    }
};

export const postData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    if (USE_MOCK_API) return mockPostData(path, data);

    const url = getApiUrl(path);
    let response: Response;
     console.log(`Posting data to: ${url}`, data);
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (networkError: any) {
         return handleFetchError(networkError, path, 'POST', true);
    }

    let responseBodyText = "";
    try {
        responseBodyText = await response.text();
    } catch (readError) {
        console.warn(`Failed to read response body as text for POST ${url}:`, readError);
        if (!response.ok) {
             handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'POST');
        }
    }

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
        if (responseBodyText) {
            try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
            } catch (jsonParseError) {
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
            }
        }
        console.error("API Error Response Text (postData):", responseBodyText || "(empty body)");
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'POST');
    }

    if (response.status === 204 || (response.status === 201 && !responseBodyText)) {
        return { success: true, message: `Operation successful (Status ${response.status})` } as unknown as ResponseData;
    }

    try {
        return JSON.parse(responseBodyText) as ResponseData;
    } catch (jsonError: any) {
        console.error("Failed to parse JSON response on successful POST:", jsonError, "Body was:", responseBodyText);
        return { success: true, message: "Operation successful, but response body could not be parsed.", rawResponse: responseBodyText } as unknown as ResponseData;
    }
};

export const putData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
     if (USE_MOCK_API) return mockPutData(path, data);

    const url = getApiUrl(path);
    let response: Response;
    try {
        response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (networkError: any) {
        return handleFetchError(networkError, path, 'PUT', true);
    }

    let responseBodyText = "";
    try {
        responseBodyText = await response.text();
    } catch (readError) {
        console.warn(`Failed to read response body as text for PUT ${url}:`, readError);
         if (!response.ok) {
            handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'PUT');
        }
    }

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
         if (responseBodyText) {
             try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
             } catch (jsonParseError) {
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
             }
         }
         console.error("API Error Response Text (putData):", responseBodyText || "(empty body)");
         handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'PUT');
    }

    if (response.status === 204 || !responseBodyText) {
        return { success: true, message: `Update successful (Status ${response.status})` } as unknown as ResponseData;
    }

     try {
         return JSON.parse(responseBodyText) as ResponseData;
     } catch (jsonError: any) {
         console.error("Failed to parse JSON response on successful PUT:", jsonError, "Body was:", responseBodyText);
         return { success: true, message: "Update successful, but response body could not be parsed.", rawResponse: responseBodyText } as unknown as ResponseData;
     }
};

export const deleteData = async (path: string): Promise<void> => {
    if (USE_MOCK_API) return mockDeleteData(path);

    const url = getApiUrl(path);
    let response: Response;
    try {
        response = await fetch(url, { method: 'DELETE', headers: { 'Accept': 'application/json'} });
    } catch (networkError: any) {
         return handleFetchError(networkError, path, 'DELETE', true);
    }

    let responseBodyText = "";
    try {
        responseBodyText = await response.text();
    } catch (readError) {
        console.warn(`Failed to read response body as text for DELETE ${url}:`, readError);
         if (!response.ok && response.status !== 204) {
            handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'DELETE');
        }
    }

    if (!response.ok && response.status !== 204) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
         if (responseBodyText) {
             try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
             } catch (jsonParseError) {
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
             }
         }
        console.error("API Error Response Text (deleteData):", responseBodyText || "(empty body)");
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'DELETE');
    }
    if (responseBodyText && response.status !== 204) {
        try {
            JSON.parse(responseBodyText);
        } catch (e) {
            // Not JSON, or empty
        }
    }
};

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}


export { USE_MOCK_API as defaultUSE_MOCK_API };
export { mockApiPrograms, mockCourses, mockStudents, mockFaculty, mockSections, mockAnnouncements, mockSectionAssignments, mockApiAdmins, mockActivityLog, mockDashboardStats, mockTestUsers, mockStudentSubjectAssignmentsWithGrades, mockTeacherTeachableCourses };
