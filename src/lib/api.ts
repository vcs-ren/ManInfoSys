// src/lib/api.ts
'use client';

import type { Student, Faculty, Section, Course, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole, CourseType, YearLevel, ActivityLogEntry, EmploymentType, EnrollmentType } from '@/types'; // Added EnrollmentType
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateTeacherUsername, generateStudentId as generateFrontendStudentId } from '@/lib/utils';
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
// Initialize student counts for sections
mockSections.forEach(section => {
    section.studentCount = mockStudents.filter(student => student.section === section.id).length;
});


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
    // Sub-admin derived from faculty
    { id: mockFaculty.find(f=>f.department === 'Administrative')!.id, username: mockFaculty.find(f=>f.department === 'Administrative')!.username, firstName: mockFaculty.find(f=>f.department === 'Administrative')!.firstName, lastName: mockFaculty.find(f=>f.department === 'Administrative')!.lastName, email: mockFaculty.find(f=>f.department === 'Administrative')!.email, role: "Sub Admin", isSuperAdmin: false },
    // Example explicit sub-admin not tied to a faculty record
    { id: 1001, username: "a1001", firstName: "Test", lastName: "SubAdmin", email: "subadmin.test@example.com", role: "Sub Admin", isSuperAdmin: false },
];

export const mockActivityLog: ActivityLogEntry[] = [
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
    if (action === "Added Student" && description.includes("to section")) {
        return;
    }
    const now = new Date();
    const newLogEntry: ActivityLogEntry = {
        id: `log-${nextActivityLogId++}-${now.getTime()}`,
        timestamp: now,
        user,
        action,
        description,
        targetId,
        targetType,
        canUndo,
        originalData
    };
    
    const isRecentDuplicate = mockActivityLog.some(
        log => log.action === action &&
               log.description === description &&
               log.user === user &&
               log.targetId === targetId &&
               log.targetType === targetType &&
               (now.getTime() - new Date(log.timestamp).getTime() < 1000) 
    );

    if (!isRecentDuplicate) {
        mockActivityLog.unshift(newLogEntry); 
        if (mockActivityLog.length > 50) { 
            mockActivityLog.pop();
        }
    } else {
        console.warn("Duplicate log entry prevented:", newLogEntry);
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
    const adminStaffCount = mockFaculty.filter(f => f.department === 'Administrative').length; // This is total Admin faculty
    const totalEventsAnnouncementsCount = mockAnnouncements.length;

    mockDashboardStats = {
        totalStudents: mockStudents.length,
        totalTeachingStaff: teachingStaffCount,
        totalAdministrativeStaff: adminStaffCount, 
        totalEventsAnnouncements: totalEventsAnnouncementsCount,
    };
};
recalculateDashboardStats(); // Initial calculation


// --- API CONFIGURATION ---
export const USE_MOCK_API = true; // Set to true to use mock data, false for real API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export function executeUndoAddStudent(studentId: number, originalStudentData: Student) {
  const studentIndex = mockStudents.findIndex(s => s.id === studentId);
  if (studentIndex > -1) {
    mockStudents.splice(studentIndex, 1);
    recalculateMockSectionCounts();
    logActivity("Undone Action: Add Student", `Reverted addition of ${originalStudentData.firstName} ${originalStudentData.lastName}`, "System", studentId, "student");
    recalculateDashboardStats();
  }
}

export function executeUndoDeleteStudent(originalStudentData: Student) {
  if (!mockStudents.some(s => s.id === originalStudentData.id)) {
    mockStudents.push(originalStudentData);
    recalculateMockSectionCounts();
    logActivity("Undone Action: Delete Student", `Restored student ${originalStudentData.firstName} ${originalStudentData.lastName}`, "System", originalStudentData.id, "student");
    recalculateDashboardStats();
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
        logActivity("Undone Action: Add Faculty", `Reverted addition of ${originalFacultyData.firstName} ${originalFacultyData.lastName}`, "System", facultyId, "faculty");
        recalculateDashboardStats();
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
        logActivity("Undone Action: Delete Faculty", `Restored faculty ${originalFacultyData.firstName} ${originalFacultyData.lastName}`, "System", originalFacultyData.id, "faculty");
        recalculateDashboardStats();
    }
}

export function executeUndoRemoveAdminRole(adminData: AdminUser & { originalDepartment?: DepartmentType }): boolean {
    const facultyMember = mockFaculty.find(f => f.id === adminData.id);
    if (facultyMember) {
        // If it was a faculty member whose department changed, revert it
        facultyMember.department = adminData.originalDepartment || 'Administrative'; 
        // If they are now Administrative, ensure they are in mockApiAdmins as Sub Admin
        if (facultyMember.department === 'Administrative' && !mockApiAdmins.some(a => a.id === adminData.id)) {
             mockApiAdmins.push({
                id: adminData.id, username: adminData.username, firstName: adminData.firstName,
                lastName: adminData.lastName, email: adminData.email, role: 'Sub Admin', isSuperAdmin: false
            });
        } else if (facultyMember.department !== 'Administrative' && mockApiAdmins.some(a => a.id === adminData.id && !a.isSuperAdmin)) {
            // If they are no longer Administrative, remove them from mockApiAdmins (unless super admin)
            const adminIndex = mockApiAdmins.findIndex(a => a.id === adminData.id && !a.isSuperAdmin);
            if(adminIndex > -1 && !adminData.isSuperAdmin) mockApiAdmins.splice(adminIndex, 1);
        }
        logActivity("Undone Action: Remove Admin Role", `Restored admin role (via faculty department) for ${adminData.username}`, "System", adminData.id, "admin");
        recalculateDashboardStats();
        return true;
    }
    // If it was an explicit Sub Admin (not tied to faculty) that was removed, re-add them
    if (!facultyMember && !mockApiAdmins.some(a => a.id === adminData.id) && adminData.role !== 'Super Admin') {
        mockApiAdmins.push(adminData);
        logActivity("Undone Action: Remove Admin Role", `Restored explicit admin role for ${adminData.username}`, "System", adminData.id, "admin");
        recalculateDashboardStats();
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

const finalMockPath = (path: string): string => {
    let formattedPath = path;
    if (formattedPath.startsWith('/api/')) {
        formattedPath = formattedPath.substring(5);
    }
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
            // Combine Super Admin with faculty members marked as 'Administrative'
            const superAdmin = mockApiAdmins.find(a => a.isSuperAdmin && a.id === 0);
            const facultyAdmins: AdminUser[] = mockFaculty
                .filter(f => f.department === 'Administrative')
                .map(f => ({
                    id: f.id, // Use faculty ID as admin ID
                    username: f.username, // Use faculty username
                    firstName: f.firstName,
                    lastName: f.lastName,
                    email: f.email,
                    role: 'Sub Admin' as AdminRole, // Explicitly cast to AdminRole
                    isSuperAdmin: false,
                }));
            
            // Add any explicit sub-admins not derived from faculty (ensure they are not duplicates)
            const explicitSubAdmins = mockApiAdmins.filter(a => !a.isSuperAdmin && !facultyAdmins.some(fa => fa.id === a.id));

            let allAdmins: AdminUser[] = [];
            if(superAdmin) allAdmins.push(superAdmin);
            allAdmins = [...allAdmins, ...facultyAdmins, ...explicitSubAdmins];
            
            // Ensure uniqueness by ID, prioritizing the super admin and then others
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
                     return [singleSection] as unknown as T; // Wrap in array to match PHP endpoint structure
                 }
                 return [] as unknown as T;
            } else {
                // Return all sections with student counts
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
            // General announcements for admin view
            return [...mockAnnouncements].sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'student/announcements/read.php') {
            // For student: Eve Davis (id=2), Sub Admin.
            // Let's assume student Alice Smith (id=1) is logged in.
            const studentDetails = mockStudents.find(s => s.id === 1);
            if (!studentDetails) return [] as T;

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
            // For teacher: David Lee (id=1)
            const teacherId = 1; // Assuming David Lee is logged in
            return mockAnnouncements.filter(ann =>
                (ann.author_type === 'Admin' && (ann.targetAudience === 'All' || ann.targetAudience === 'Faculty')) ||
                (ann.author_type === 'Teacher' && ann.author === String(teacherId)) // TODO: Mock announcement needs author_id if by teacher
            ).sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }


        if (phpPath === 'admin/dashboard-stats.php') {
            recalculateDashboardStats(); // Make sure stats are up-to-date
            return { ...mockDashboardStats } as T;
        }
         if (phpPath.startsWith('sections/assignments/read.php')) {
            // This endpoint is used by SectionDetailsPage to get assignments for a specific section
            // And by TeacherCourseAssignmentsPage to get all assignments (if ?all=true)
            const url = new URL(`http://localhost?${phpPath.split('?')[1] || ''}`);
            const sectionIdParam = url.searchParams.get('sectionId');
            const allParam = url.searchParams.get('all');

            let assignmentsToReturn = mockSectionAssignments;

            if (sectionIdParam && allParam !== 'true') { // Filter by sectionId if not fetching all
                 assignmentsToReturn = mockSectionAssignments.filter(a => a.sectionId === sectionIdParam);
            }
             return assignmentsToReturn.map(a => ({
                ...a,
                subjectName: mockCourses.find(s => s.id === a.subjectId)?.name || a.subjectId,
                teacherName: mockFaculty.find(t => t.id === a.teacherId)?.firstName + ' ' + mockFaculty.find(t => t.id === a.teacherId)?.lastName || `Faculty ID ${a.teacherId}`,
            })) as T;
        }
         if (phpPath === 'student/grades/read.php') {
             // Assuming student Alice Smith (id=1) is logged in
             const studentId = 1;
             const studentGrades = mockStudentSubjectAssignmentsWithGrades
                .filter(g => g.studentId === studentId)
                .map(g => ({
                    id: g.subjectId, // Use subjectId as the main ID for the row
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
            // Assuming teacher David Lee (id=1) is logged in
            const teacherId = 1;
             const teacherAssignments = mockSectionAssignments.filter(sa => sa.teacherId === teacherId);
             const gradesToReturn: StudentSubjectAssignmentWithGrades[] = [];

             // Iterate over students and their assigned sections/subjects for this teacher
             mockStudents.forEach(student => {
                 teacherAssignments.forEach(ta => {
                     // If the student is in the section the teacher is assigned to for this subject
                     if (student.section === ta.sectionId) {
                         // Find if a grade entry already exists for this student-subject combination
                         const existingGradeEntry = mockStudentSubjectAssignmentsWithGrades.find(
                             g => g.studentId === student.id && g.subjectId === ta.subjectId && g.assignmentId.startsWith(ta.id) // Match by student and subject
                         );
                         gradesToReturn.push({
                             assignmentId: existingGradeEntry?.assignmentId || `${ta.id}-${student.id}`, // Use existing or create a new one
                             studentId: student.id,
                             studentName: `${student.firstName} ${student.lastName}`,
                             subjectId: ta.subjectId,
                             subjectName: ta.subjectName || mockCourses.find(c => c.id === ta.subjectId)?.name || ta.subjectId,
                             section: student.section, // From student's record
                             year: student.year!, // From student's record
                             prelimGrade: existingGradeEntry?.prelimGrade ?? null,
                             prelimRemarks: existingGradeEntry?.prelimRemarks ?? "",
                             midtermGrade: existingGradeEntry?.midtermGrade ?? null,
                             midtermRemarks: existingGradeEntry?.midtermRemarks ?? null,
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
             // Assuming student Alice Smith (id=1) is logged in
             const student = mockStudents.find(s => s.id === 1);
             if (student) return { ...student } as T; // Return a copy
             throw new Error("Mock student profile not found.");
        }
        if (phpPath === 'teacher/profile/read.php') {
             // Assuming teacher David Lee (id=1) is logged in
             const faculty = mockFaculty.find(t => t.id === 1);
             if (faculty) return { ...faculty } as T; // Return a copy
             throw new Error("Mock faculty profile not found.");
        }
         if (phpPath === 'student/schedule/read.php') {
            // Assuming student Alice Smith (id=1) is logged in
            const studentDetails = mockStudents.find(s => s.id === 1);
            if (!studentDetails) return [] as T;
            const studentSection = studentDetails.section;
            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments
                .filter(a => a.sectionId === studentSection) // Get assignments for the student's section
                .forEach((assign, index) => {
                     // Simple schedule generation for demo: Mon-Fri, 8am-5pm, 1 hour slots
                     const dayOffset = index % 5; // 0 for Mon, 1 for Tue, ...
                     const startTime = new Date();
                     // Set to next Monday then add offset
                     startTime.setDate(startTime.getDate() + (dayOffset - startTime.getDay() + 1 + (dayOffset < startTime.getDay() -1 ? 7 : 0) ));
                     startTime.setHours(8 + index, 0, 0, 0); // Stagger start times
                     const endTime = new Date(startTime);
                     endTime.setHours(startTime.getHours() + 1);

                     schedule.push({
                        id: `${assign.id}-${formatDate(startTime)}`, // Unique ID for the event
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
            // Assuming teacher David Lee (id=1) is logged in
            const teacherId = 1;
            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments
                .filter(a => a.teacherId === teacherId) // Get assignments for this teacher
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
                        section: assign.sectionId // Add section
                     });
                });
             return schedule as T;
        }
         if (phpPath === 'teacher/subjects/read.php') {
             // Assuming teacher David Lee (id=1) is logged in
             const teacherId = 1;
             // Get distinct subject IDs taught by this teacher
             const subjectIds = new Set(mockSectionAssignments.filter(a => a.teacherId === teacherId).map(a => a.subjectId));
             return mockCourses.filter(s => subjectIds.has(s.id)) as T;
         }
         if (phpPath === 'teacher/teachable-courses/read.php') {
            // This should return the structure { teacherId: number; courseIds: string[] }[]
            // For now, just return the mock data.
            return [...mockTeacherTeachableCourses] as T;
        }
          if (phpPath === 'student/upcoming/read.php') {
             // Placeholder for upcoming items for student Alice Smith (id=1)
             const upcoming: UpcomingItem[] = [];
              // Mock: Get student's schedule for today/upcoming
              const studentDetails = mockStudents.find(s => s.id === 1);
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
                // Just take the first one for demo
                upcoming.push(studentSchedule[0]);
            }
             // Mock: Add a dummy assignment
             upcoming.push({ id: "assign-mock1", title: "Submit CS101 Homework", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), type: "assignment" });
             // Mock: Add a dummy event
             upcoming.push({ id: "event-mock1", title: "Department Meeting", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), type: "event" });
             return upcoming.slice(0, 5) as T; // Limit to 5 items
         }
         if (phpPath === 'admin/activity-log/read.php') {
            // Ensure unique logs by ID before sorting and slicing
            const uniqueLogs = Array.from(new Map(mockActivityLog.map(log => [log.id, log])).values());
            return uniqueLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10) as T;
        }
         // Handle fetching a single section for SectionDetailsPage
         if (phpPath.startsWith('sections/read.php/')) { // Assuming format /api/sections/read.php/{sectionId}
            const sectionId = phpPath.split('/').pop(); // Get the last part as ID
            const section = mockSections.find(s => s.id === sectionId);
             if (section) {
                 // Enrich with programName and adviserName if needed for the page
                 const program = mockApiPrograms.find(p => p.id === section.programId);
                 const adviser = mockFaculty.find(f => f.id === section.adviserId);
                 return {
                     ...section,
                     programName: program?.name || section.programId,
                     adviserName: adviser ? `${adviser.firstName} ${adviser.lastName}` : undefined,
                     studentCount: mockStudents.filter(st => st.section === section.id).length // Recalculate count
                 } as T;
             }
            // If not found, it's a 404, but mockFetchData should throw or return empty
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
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
         if (phpPath === 'login.php') {
             const { username, password } = data as any; // Assume username/password in payload
             // Super Admin login
            if (username.toLowerCase() === "admin" && password === "defadmin") {
                 if (typeof window !== 'undefined') {
                    localStorage.setItem('userRole', "Super Admin");
                    localStorage.setItem('userId', String(0));
                 }
                logActivity("User Login", `Super Admin logged in.`, "admin", 0, "admin");
                return { success: true, role: "Super Admin", redirectPath: "/admin/dashboard", userId: 0 } as ResponseData;
            }
            // Student login check
            const studentUser = mockStudents.find(s => s.username === username);
            if (studentUser && password === `${studentUser.lastName.substring(0, 2).toLowerCase()}1000`) { // Default password logic
                 if (typeof window !== 'undefined') {
                    localStorage.setItem('userRole', "Student");
                    localStorage.setItem('userId', String(studentUser.id));
                 }
                studentUser.lastAccessed = new Date().toISOString();
                logActivity("User Login", `Student ${studentUser.username} logged in.`, studentUser.username, studentUser.id, "student");
                return { success: true, role: "Student", redirectPath: "/student/dashboard", userId: studentUser.id } as ResponseData;
            }
             // Faculty (Teacher or Sub Admin) login check
            const facultyUser = mockFaculty.find(f => f.username === username);
            if (facultyUser && password === `${facultyUser.lastName.substring(0, 2).toLowerCase()}1000`) { // Default password logic
                let role: AdminRole | 'Teacher' = 'Teacher';
                let redirectPath = "/teacher/dashboard";
                if (facultyUser.department === 'Administrative') {
                    role = 'Sub Admin';
                    redirectPath = "/admin/dashboard"; // Sub Admins go to admin dashboard
                }
                 if (typeof window !== 'undefined') {
                    localStorage.setItem('userRole', role);
                    localStorage.setItem('userId', String(facultyUser.id));
                 }
                facultyUser.lastAccessed = new Date().toISOString();
                logActivity("User Login", `Faculty ${facultyUser.username} logged in as ${role}.`, facultyUser.username, facultyUser.id, role.toLowerCase().replace(' ', '_') as ActivityLogEntry['targetType']);
                return { success: true, role: role, redirectPath: redirectPath, userId: facultyUser.id } as ResponseData;
            }

             throw new Error("Invalid username or password.");
        }
         if (phpPath === 'students/create.php') {
            const newStudentData = data as unknown as Omit<Student, 'id' | 'studentId' | 'section' | 'username' | 'lastAccessed'>;
            // Section assignment logic
            const studentProgramId = newStudentData.program;
            let studentYearLevel = newStudentData.year;
            if (newStudentData.enrollmentType === 'New') {
                studentYearLevel = '1st Year';
            } else if (!studentYearLevel && (newStudentData.enrollmentType === 'Transferee' || newStudentData.enrollmentType === 'Returnee')) {
                 // This validation should ideally be in the form schema as well
                 throw new Error("Year level is required for Transferee or Returnee enrollment type.");
            }

            if (!studentProgramId || !studentYearLevel) {
                throw new Error("Program and Year Level are required to determine section.");
            }

            let assignedSectionCode: string | undefined = undefined;
            const existingSectionsForProgramYear = mockSections
                .filter(s => s.programId === studentProgramId && s.yearLevel === studentYearLevel)
                .sort((a, b) => a.sectionCode.localeCompare(b.sectionCode)); // Ensure consistent ordering for new section letter

            for (const section of existingSectionsForProgramYear) {
                const studentCountInSection = mockStudents.filter(st => st.section === section.id).length;
                if (studentCountInSection < 30) { // Max 30 students per section
                    assignedSectionCode = section.id;
                    break;
                }
            }

            if (!assignedSectionCode) {
                // No existing section with space, or no sections exist yet for this program/year
                // Generate a new section code
                const newSectionLetterSuffixIndex = existingSectionsForProgramYear.length; // e.g., 0 for 'A', 1 for 'B'
                assignedSectionCode = generateSectionCode(studentProgramId, studentYearLevel, newSectionLetterSuffixIndex);

                // Add this new section to mockSections if it doesn't exist
                if (!mockSections.some(s => s.id === assignedSectionCode)) {
                    const programDetails = mockApiPrograms.find(p => p.id === studentProgramId);
                    const newSectionObject: Section = {
                        id: assignedSectionCode,
                        sectionCode: assignedSectionCode,
                        programId: studentProgramId,
                        programName: programDetails?.name || studentProgramId, // Get program name
                        yearLevel: studentYearLevel,
                        studentCount: 0, // Will be incremented
                        // adviserId and adviserName can be assigned later
                    };
                    mockSections.push(newSectionObject);
                    // logActivity("Created Section", `Section ${newSectionObject.sectionCode} created for ${newStudentData.program} ${studentYearLevel}.`, "System", newSectionObject.id, "section");
                }
            }

            const nextId = mockStudents.reduce((max, s) => Math.max(max, s.id), 0) + 1;
            const studentId = generateFrontendStudentId(); // Generates "100" + 4 random digits
            const username = generateStudentUsername(studentId); // Generates "s" + studentId
            const student: Student = {
                ...(newStudentData as Omit<Student, 'id' | 'studentId' | 'username' | 'section' | 'year' | 'lastAccessed'>),
                id: nextId,
                studentId: studentId, // Use the generated studentId
                username: username,     // Use the generated username
                section: assignedSectionCode,
                year: studentYearLevel, // Ensure year is set
                lastAccessed: null, // New students haven't accessed
            };
            mockStudents.push(student);
            // Update student count in the section
            const sectionToUpdate = mockSections.find(s => s.id === assignedSectionCode);
            if (sectionToUpdate) {
                sectionToUpdate.studentCount = mockStudents.filter(s => s.section === assignedSectionCode).length;
            }
            logActivity("Added Student", `${student.firstName} ${student.lastName} (${student.username})`, "Admin", student.id, "student", true, { ...student, passwordHash: "mock_hash" });
            recalculateDashboardStats();
            return student as ResponseData;
        }
         if (phpPath === 'teachers/create.php') {
            const newFacultyData = data as unknown as Omit<Faculty, 'id' | 'facultyId' | 'username' | 'lastAccessed'>;
            const nextId = mockFaculty.reduce((max, f) => Math.max(max, f.id), 0) + 1;
            const facultyId = generateTeacherId(); // Now uses the centralized utility
            const department = newFacultyData.department || 'Teaching'; // Default if not provided
            const username = generateTeacherUsername(facultyId, department); // Use centralized utility

            const faculty: Faculty = {
                ...newFacultyData,
                id: nextId,
                facultyId: facultyId, // Use the generated facultyId
                username: username,     // Use the generated username
                department: department,
                lastAccessed: null,
            };
            mockFaculty.push(faculty);
             // If Administrative, add/update in mockApiAdmins as Sub Admin
             if (faculty.department === 'Administrative') {
                 const existingAdminIndex = mockApiAdmins.findIndex(a => a.id === faculty.id);
                 const adminEntry: AdminUser = {
                    id: faculty.id,
                    username: faculty.username,
                    firstName: faculty.firstName,
                    lastName: faculty.lastName,
                    email: faculty.email,
                    role: 'Sub Admin',
                    isSuperAdmin: false,
                 };
                 if (existingAdminIndex > -1) {
                     mockApiAdmins[existingAdminIndex] = adminEntry; // Update if already exists (e.g., department changed)
                 } else {
                     mockApiAdmins.push(adminEntry);
                 }
             }
            logActivity("Added Faculty", `${faculty.firstName} ${faculty.lastName} (${faculty.username})`, "Admin", faculty.id, "faculty", true, { ...faculty, passwordHash: "mock_hash" });
            recalculateDashboardStats();
            return faculty as ResponseData;
        }
         if (phpPath === 'programs/create.php') {
             const newProgramData = data as unknown as Program;
             const newProgramId = newProgramData.id || newProgramData.name.toUpperCase().substring(0, 3) + mockApiPrograms.length;
             if (mockApiPrograms.some(p => p.id === newProgramId)) {
                 throw new Error("Program with this ID already exists.");
             }
             const newProgram: Program = {
                 id: newProgramId,
                 name: newProgramData.name,
                 description: newProgramData.description,
                 // Ensure courses structure is initialized for all year levels
                 courses: newProgramData.courses || { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] },
             };
             // When a new program is created, iterate through its defined courses (if any)
             // and ensure these courses exist in the global mockCourses list.
             // If a course is of type 'Major', its programId array should include this new program's ID.
             Object.values(newProgram.courses).flat().forEach(courseInProgram => {
                 const globalCourseIndex = mockCourses.findIndex(c => c.id === courseInProgram.id);
                 if (globalCourseIndex > -1) {
                     // If course exists globally, update its programId if it's a Major for this new program
                     if (mockCourses[globalCourseIndex].type === 'Major') {
                         if (!mockCourses[globalCourseIndex].programId) {
                             mockCourses[globalCourseIndex].programId = [];
                         }
                         if (!mockCourses[globalCourseIndex].programId!.includes(newProgram.id)) {
                             mockCourses[globalCourseIndex].programId!.push(newProgram.id);
                         }
                     }
                 } else {
                     // If course doesn't exist globally, add it.
                     // If it's a Major, assign its programId to this new program.
                     mockCourses.push({ 
                        ...courseInProgram, 
                        programId: courseInProgram.type === 'Major' ? [newProgram.id] : [] 
                    });
                 }
             });
             mockApiPrograms.push(newProgram);
             logActivity("Added Program", newProgram.name, "Admin", newProgram.id, "program");
             return newProgram as ResponseData;
         }
         if (phpPath === 'courses/create.php') {
             const newCourseData = data as Course;
             // Ensure a unique ID if not provided, e.g., C + next number
             const nextIdNumber = mockCourses.reduce((max, c) => {
                const numId = parseInt(c.id.replace(/[^0-9]/g, ''), 10); // Extract numbers
                return isNaN(numId) ? max : Math.max(max, numId);
             }, 0) +1; // Get max existing number and increment

             const newCourse: Course = {
                 ...newCourseData,
                 id: newCourseData.id || `C${String(nextIdNumber).padStart(3,'0')}`, // Ensure unique ID
                 // If it's a Major, ensure programId is an array. If Minor, programId should be empty or undefined.
                 programId: newCourseData.type === 'Major' ? (Array.isArray(newCourseData.programId) ? newCourseData.programId : (newCourseData.programId ? [newCourseData.programId as unknown as string] : [])) : [],
             };
             if (mockCourses.some(c => c.id === newCourse.id)) {
                 throw new Error(`Course with ID ${newCourse.id} already exists.`);
             }
             mockCourses.push(newCourse);
             logActivity("Added Course", newCourse.name, "Admin", newCourse.id, "course");
             return newCourse as ResponseData;
         }
          // POST for assigning a course to a specific year level of a program
          if (phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)) { // Path: /api/programs/{programId}/courses/assign
              const programId = phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)?.[1];
              const { courseId, yearLevel } = data as { courseId: string, yearLevel: YearLevel }; // Payload from frontend
              
              const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
              const course = mockCourses.find(c => c.id === courseId);

              if (programIndex === -1) throw new Error("Program not found.");
              if (!course) throw new Error("Course not found.");
              
               // Ensure the year level exists in the program's courses object
               if (!mockApiPrograms[programIndex].courses[yearLevel]) {
                  mockApiPrograms[programIndex].courses[yearLevel] = [];
               }

                // Check if course is already assigned to this year level in this program
                if (mockApiPrograms[programIndex].courses[yearLevel].some(c => c.id === courseId)) {
                    throw new Error(`Course ${course.name} is already assigned to ${programId} - ${yearLevel}.`);
                }

                // Constraint: Major courses can only be assigned to their specific program.
                if (course.type === 'Major' && (!course.programId || !course.programId.includes(programId))) {
                     throw new Error(`Major course ${course.name} does not belong to program ${programId} and cannot be assigned.`);
                }

                // Constraint: Prevent assigning the same course to multiple year levels within the SAME program.
                for (const yr in mockApiPrograms[programIndex].courses) {
                    if (mockApiPrograms[programIndex].courses[yr as YearLevel].some(c => c.id === courseId) && yr !== yearLevel) {
                        throw new Error(`Course ${course.name} is already assigned to ${yr} in this program.`);
                    }
                }

                mockApiPrograms[programIndex].courses[yearLevel].push(course);
                logActivity("Assigned Course to Program", `${course.name} to ${mockApiPrograms[programIndex].name} (${yearLevel})`, "Admin");
                return { ...mockApiPrograms[programIndex] } as ResponseData; // Return the updated program
         }
         if (phpPath === 'admin/reset_password.php') {
              const { userId, userType, lastName } = data as { userId: number; userType: string; lastName: string };
              let targetFullname: string = `ID ${userId}`;
              if (userType === 'student') {
                  const student = mockStudents.find(s => s.id === userId);
                  if (student) targetFullname = `${student.firstName} ${student.lastName}`;
                  else throw new Error(`Student with ID ${userId} not found.`);
                  // Password reset is conceptual in mock; no actual password change
                  logActivity(`Reset Student Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'teacher') { // This covers both Teaching and Administrative faculty
                  const facultyMember = mockFaculty.find(f => f.id === userId);
                  if (facultyMember) targetFullname = `${facultyMember.firstName} ${facultyMember.lastName}`;
                  else throw new Error(`Faculty with ID ${userId} not found.`);
                   // Password reset is conceptual
                   logActivity(`Reset Faculty Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'admin') { // This is for explicit Sub Admins not in faculty, or Super Admin
                  const adminUser = mockApiAdmins.find(a => a.id === userId);
                  if (adminUser) {
                      if(adminUser.isSuperAdmin) throw new Error("Super Admin password must be changed via Settings."); // Super admin cannot be reset this way
                      targetFullname = adminUser.firstName ? `${adminUser.firstName} ${adminUser.lastName}` : adminUser.username;
                      logActivity("Reset Admin Password", `For ${targetFullname} (${adminUser.username})`, "Admin");
                  } else {
                      // This case might occur if an admin was derived from faculty but faculty record deleted,
                      // or if an ID doesn't match any admin type.
                      throw new Error(`Admin user with ID ${userId} not found.`);
                  }
              } else {
                  throw new Error(`Invalid user type for password reset: ${userType}`);
              }
              console.log(`Mock password reset for ${userType} ${targetFullname} using lastName: ${lastName}`);
              const defaultPassword = `${lastName.substring(0, 2).toLowerCase()}1000`;
              console.log(`Default password would be: ${defaultPassword}`);
              // The actual password change would happen in the backend.
              // For mock, we just simulate success.
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
                author: "Admin" // Assuming admin creates this
            };
            mockAnnouncements.unshift(newAnnouncement); // Add to beginning for recent first
            logActivity("Created Announcement", newAnnData.title, "Admin", newAnnData.target.programId || newAnnData.target.section || newAnnData.target.yearLevel || 'all', 'announcement');
            recalculateDashboardStats(); // Update stats if announcements are counted
            return newAnnouncement as ResponseData;
        }
         if (phpPath.match(/^sections\/adviser\/update\.php$/)) { // Changed from sections/update.php/{sectionId}/adviser
             const { sectionId, adviserId } = data as { sectionId: string, adviserId: number | null };
             const sectionIndex = mockSections.findIndex(s => s.id === sectionId);
             if (sectionIndex > -1) {
                 const adviser = mockFaculty.find(t => t.id === adviserId && t.department === 'Teaching'); // Only teaching staff
                 if (adviserId !== null && !adviser) {
                     throw new Error("Selected adviser is not a teaching staff member or does not exist.");
                 }
                 mockSections[sectionIndex].adviserId = adviserId ?? undefined;
                 mockSections[sectionIndex].adviserName = adviser ? `${adviser.firstName} ${adviser.lastName}` : undefined;
                 logActivity("Updated Section Adviser", `For section ${mockSections[sectionIndex].sectionCode} to ${adviser ? adviser.firstName + ' ' + adviser.lastName : 'None'}`, "Admin");
                 return { ...mockSections[sectionIndex] } as ResponseData;
             }
             throw new Error("Section not found.");
         }
         if (phpPath === 'sections/assignments/create.php') { // Endpoint for assigning a teacher to a course in a section
             const { sectionId, subjectId, teacherId } = data as { sectionId: string; subjectId: string; teacherId: number };
             
             const subject = mockCourses.find(s => s.id === subjectId);
             const facultyMember = mockFaculty.find(t => t.id === teacherId && t.department === 'Teaching'); // Ensure teacher is teaching staff
             const section = mockSections.find(sec => sec.id === sectionId);

             if (!section) throw new Error(`Section ${sectionId} not found.`);
             if (!subject) throw new Error(`Course(subject) ${subjectId} not found.`);
             if (!facultyMember) throw new Error(`Teacher with ID ${teacherId} not found or is not teaching staff.`);

             // Check if this teacher is qualified for this subject (using mockTeacherTeachableCourses)
             const teachableEntry = mockTeacherTeachableCourses.find(ttc => ttc.teacherId === teacherId);
             if (teachableEntry && teachableEntry.courseIds.length > 0 && !teachableEntry.courseIds.includes(subjectId)) {
                throw new Error(`Teacher ${facultyMember.firstName} ${facultyMember.lastName} is not assigned to teach ${subject.name}.`);
             }


             const assignmentId = `${sectionId}-${subjectId}`; // Composite ID for the assignment

              // Check if this course is already assigned to this section (potentially with a different teacher)
              const existingAssignmentIndex = mockSectionAssignments.findIndex(a => a.id === assignmentId);

              if (existingAssignmentIndex > -1) {
                   // Update existing assignment (change teacher)
                   mockSectionAssignments[existingAssignmentIndex].teacherId = teacherId;
                   mockSectionAssignments[existingAssignmentIndex].teacherName = facultyMember ? `${facultyMember.firstName} ${facultyMember.lastName}` : undefined;
                   logActivity("Updated Teacher for Course-Section", `${subject?.name} in section ${sectionId} to ${facultyMember?.firstName} ${facultyMember?.lastName}`, "Admin");
                   return { ...mockSectionAssignments[existingAssignmentIndex] } as ResponseData;
              } else {
                  // Create new assignment
                 const newAssignment: SectionSubjectAssignment = {
                     id: assignmentId,
                     sectionId,
                     subjectId,
                     subjectName: subject?.name,
                     teacherId,
                     teacherName: facultyMember ? `${facultyMember.firstName} ${facultyMember.lastName}` : undefined
                 };
                 mockSectionAssignments.push(newAssignment);
                 logActivity("Assigned Course to Section", `${subject?.name} to section ${sectionId} with ${facultyMember?.firstName} ${facultyMember?.lastName}`, "Admin");
                 return newAssignment as ResponseData;
              }
         }
         if (phpPath === 'assignments/grades/update.php') { // Called by Teacher to submit/update grades
              const gradeData = data as StudentSubjectAssignmentWithGrades; // This type matches the payload from SubmitGradesModal
              const index = mockStudentSubjectAssignmentsWithGrades.findIndex(a => a.assignmentId === gradeData.assignmentId && a.studentId === gradeData.studentId);
              
              if (index > -1) {
                   // Update existing grade entry
                   mockStudentSubjectAssignmentsWithGrades[index] = {
                       ...mockStudentSubjectAssignmentsWithGrades[index], // Keep existing non-grade fields
                       prelimGrade: gradeData.prelimGrade,
                       prelimRemarks: gradeData.prelimRemarks,
                       midtermGrade: gradeData.midtermGrade,
                       midtermRemarks: gradeData.midtermRemarks,
                       finalGrade: gradeData.finalGrade,
                       finalRemarks: gradeData.finalRemarks,
                   };
                   const updated = mockStudentSubjectAssignmentsWithGrades[index];
                    // Recalculate status based on submitted grades
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (updated.prelimGrade !== null || updated.midtermGrade !== null || updated.finalGrade !== null) {
                        status = 'Incomplete';
                    }
                    if (updated.finalGrade !== null) { // If final grade is present, it's complete
                        status = 'Complete';
                    }
                    updated.status = status;
                    logActivity("Updated Grades", `For ${updated.studentName} in ${updated.subjectName}`, "Teacher"); // Assume teacher is logged in
                   return updated as ResponseData;
               } else {
                    // This case should ideally not happen if the grade submission is for an existing assignment context.
                    // However, if we need to create a new grade entry:
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (gradeData.prelimGrade !== null || gradeData.midtermGrade !== null || gradeData.finalGrade !== null) {
                        status = 'Incomplete';
                    }
                    if (gradeData.finalGrade !== null) {
                        status = 'Complete';
                    }
                    // Fetch student and subject details for the new entry
                    const student = mockStudents.find(s => s.id === gradeData.studentId);
                    const subject = mockCourses.find(s => s.id === gradeData.subjectId);
                    // The assignmentId from payload should be sectionId-subjectId-studentId for new grade entries
                    // Or just sectionId-subjectId if grades are tied to the class assignment rather than per student per assignment.
                    // For simplicity, let's assume assignmentId in payload correctly identifies the context.
                    const sectionAssignment = mockSectionAssignments.find(sa => sa.id === gradeData.assignmentId.substring(0, gradeData.assignmentId.lastIndexOf('-')));


                    const newEntry: StudentSubjectAssignmentWithGrades = {
                        ...gradeData, // This includes assignmentId, studentId, subjectId, and grades
                        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
                        subjectName: subject ? subject.name : 'Unknown Subject',
                        section: sectionAssignment?.sectionId || 'N/A', // Need to derive section if not in payload
                         year: student?.year || 'N/A', // Need to derive year
                        status: status,
                    };
                    mockStudentSubjectAssignmentsWithGrades.push(newEntry);
                    logActivity("Submitted Grades", `For ${newEntry.studentName} in ${newEntry.subjectName}`, "Teacher");
                    return newEntry as ResponseData;
               }
         }
        // Password change endpoints (mock success)
        if (phpPath === 'admin/change_password.php') { logActivity("Changed Admin Password", "Super Admin password updated", "Admin"); return { message: "Admin password updated successfully." } as ResponseData; }
        if (phpPath === 'student/change_password.php') { logActivity("Changed Password", "Student updated their password", "Student"); return { message: "Student password updated successfully." } as ResponseData; }
        if (phpPath === 'teacher/change_password.php') { logActivity("Changed Password", "Faculty updated their password", "Faculty"); return { message: "Faculty password updated successfully." } as ResponseData; }

        // Undo activity log (mock)
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

            // Handle specific undo actions based on logEntry
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
                // Pass the full originalData which now includes originalDepartment
                undoSuccess = executeUndoRemoveAdminRole(logEntry.originalData as AdminUser & { originalDepartment?: DepartmentType });
                 if (!undoSuccess) {
                    specificUndoMessage = "Could not fully undo admin role removal: Corresponding faculty record might not exist or was not a faculty-derived admin.";
                }
            } else {
                 // Add more undo handlers as needed
                 console.error(`Undo failed: Undo logic for action type "${logEntry.action}" is not implemented or data missing for log ID ${logId}.`);
                 throw new Error(`Undo for action type "${logEntry.action}" is not implemented in mock or data missing.`);
            }

            if (undoSuccess) {
                recalculateDashboardStats(); // Update stats after undo
                mockActivityLog.splice(logEntryIndex, 1); // Remove the undone log entry
                // Do NOT add a new "Undone Action" log here, as it will be filtered out by the duplicate check.
                // The removal of the original log and UI refresh is sufficient.
                return { success: true, message: "Action undone." } as ResponseData;
            } else {
                throw new Error(specificUndoMessage || "Undo operation failed or was not applicable.");
            }
        }
        if (phpPath === 'sections/create.php') { // For creating sections (though auto-generated on student add now)
            const newSectionData = data as Partial<Section>; // Expect programId, yearLevel, sectionCode (optional)
            const { programId, yearLevel, sectionCode: providedSectionCode } = newSectionData;
            if (!programId || !yearLevel) {
                throw new Error("Program ID and Year Level are required to create a section.");
            }
            // Section code is now typically auto-generated when a student is added to a non-existent section.
            // This endpoint might be less used directly for creation, but kept for completeness or manual overrides.
            const sectionCode = providedSectionCode || generateSectionCode(
                programId,
                yearLevel,
                mockSections.filter(s => s.programId === programId && s.yearLevel === yearLevel).length // Count existing for letter suffix
            );

            if (mockSections.some(s => s.id === sectionCode)) {
                 throw new Error(`Section with code ${sectionCode} already exists.`);
            }
            const newSection: Section = {
                id: sectionCode,
                sectionCode: sectionCode,
                programId: programId,
                yearLevel: yearLevel,
                programName: mockApiPrograms.find(p => p.id === programId)?.name, // Get program name
                adviserId: newSectionData.adviserId, // Optional adviser
                adviserName: newSectionData.adviserId ? mockFaculty.find(f => f.id === newSectionData.adviserId)?.firstName + " " + mockFaculty.find(f => f.id === newSectionData.adviserId)?.lastName : undefined,
                studentCount: 0, // New section starts with 0 students
            };
            mockSections.push(newSection);
            // logActivity("Created Section", `Section ${newSection.sectionCode} created.`, "Admin", newSection.id, "section");
            return newSection as ResponseData;
        }
        if (phpPath === 'teacher/teachable-courses/update.php') { // Endpoint for Admin to set teachable courses for a teacher
            const { teacherId, courseIds } = data as { teacherId: number, courseIds: string[] };
            const index = mockTeacherTeachableCourses.findIndex(ttc => ttc.teacherId === teacherId);
            if (index > -1) {
                mockTeacherTeachableCourses[index].courseIds = courseIds;
            } else {
                mockTeacherTeachableCourses.push({ teacherId, courseIds });
            }
            const teacher = mockFaculty.find(f => f.id === teacherId);
            logActivity("Updated Teachable Courses", `For ${teacher?.firstName} ${teacher?.lastName}`, "Admin");
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
    await new Promise(resolve => setTimeout(resolve, 300));
    const idStr = phpPath.split('/').pop() || ''; // Get ID from URL if present

    try {
         if (phpPath.startsWith('students/update.php/')) {
            const id = parseInt(idStr, 10); // Expect ID in URL path
            const studentIndex = mockStudents.findIndex(s => s.id === id);
            if (studentIndex > -1) {
                const oldStudentData = { ...mockStudents[studentIndex] }; // For logging or comparison
                const updatedStudentData = data as unknown as Partial<Student>;
                // Update student details
                mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...updatedStudentData };
                // If section changed, recalculate student counts for sections
                if (oldStudentData.section !== mockStudents[studentIndex].section) {
                    recalculateMockSectionCounts();
                }
                logActivity("Updated Student", `${mockStudents[studentIndex].firstName} ${mockStudents[studentIndex].lastName}`, "Admin", id, "student");
                recalculateDashboardStats();
                return { ...mockStudents[studentIndex] } as ResponseData;
            }
            throw new Error("Student not found for mock update.");
        }
         if (phpPath.startsWith('teachers/update.php/')) { // Admin updating faculty
            const id = parseInt(idStr, 10);
            const facultyIndex = mockFaculty.findIndex(t => t.id === id);
             if (facultyIndex > -1) {
                const oldDepartment = mockFaculty[facultyIndex].department;
                // Update faculty details
                mockFaculty[facultyIndex] = { ...mockFaculty[facultyIndex], ...(data as unknown as Partial<Faculty>) };
                const updatedFaculty = mockFaculty[facultyIndex];

                // If department changed, update admin status in mockApiAdmins
                const adminIndex = mockApiAdmins.findIndex(a => a.id === updatedFaculty.id && !a.isSuperAdmin);

                if (updatedFaculty.department === 'Administrative') {
                    // If now Administrative, ensure they are an admin (or update existing)
                    const adminEntry: AdminUser = {
                        id: updatedFaculty.id,
                        username: updatedFaculty.username, // Username should also be updated if tied to department prefix
                        firstName: updatedFaculty.firstName,
                        lastName: updatedFaculty.lastName,
                        email: updatedFaculty.email,
                        role: 'Sub Admin',
                        isSuperAdmin: false
                    };
                    if (adminIndex > -1) {
                        mockApiAdmins[adminIndex] = adminEntry;
                    } else if (!mockApiAdmins.some(a => a.id === updatedFaculty.id)) { // Add only if not already present as super admin
                        mockApiAdmins.push(adminEntry);
                    }
                } else if (oldDepartment === 'Administrative' && updatedFaculty.department !== 'Administrative') {
                    // If changed from Administrative to something else, remove from sub-admins
                    if (adminIndex > -1) {
                        mockApiAdmins.splice(adminIndex, 1);
                    }
                }
                logActivity("Updated Faculty", `${updatedFaculty.firstName} ${updatedFaculty.lastName}`, "Admin", id, "faculty");
                recalculateDashboardStats();
                return { ...updatedFaculty } as ResponseData;
            }
            throw new Error("Faculty not found for mock update.");
        }
         if (phpPath === 'student/profile/update.php') { // Student updating their own profile
            const profileData = data as Student; // Payload is the full student object with changes
            // In a real app, you'd get studentId from session/token. For mock, assume student id 1.
            const studentId = profileData.id; // Assuming student ID is in the payload
            const index = mockStudents.findIndex(s => s.id === studentId);
            if (index > -1) {
                // Students can only update specific fields
                mockStudents[index] = {
                    ...mockStudents[index], // Keep existing non-editable fields
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
         if (phpPath === 'teacher/profile/update.php') { // Teacher updating their own profile
             const profileData = data as Faculty; // Payload with changes
             const teacherId = profileData.id; // Assuming ID is in payload
             const index = mockFaculty.findIndex(t => t.id === teacherId);
             if (index > -1) {
                 // Teachers can only update specific fields
                 mockFaculty[index] = {
                    ...mockFaculty[index], // Keep non-editable fields
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    middleName: profileData.middleName,
                    suffix: profileData.suffix,
                    gender: profileData.gender, // Added if editable
                    birthday: profileData.birthday,
                    address: profileData.address, // Added if editable
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
          if (phpPath.startsWith('programs/update.php/')) { // Admin updating a program
             const programId = idStr; // Program ID from URL
             const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1) {
                 const updatedData = data as unknown as Program; // Full program data with changes
                 // Update program details
                 mockApiPrograms[programIndex].name = updatedData.name ?? mockApiPrograms[programIndex].name;
                 mockApiPrograms[programIndex].description = updatedData.description ?? mockApiPrograms[programIndex].description;
                
                // Update course assignments within this program
                if (updatedData.courses) {
                    (Object.keys(updatedData.courses) as YearLevel[]).forEach(year => {
                        if (updatedData.courses[year]) { // If this year level's courses are provided
                            // Update or add courses for this year level
                            mockApiPrograms[programIndex].courses[year] = updatedData.courses[year].map(courseInPayload => {
                                const globalCourseIndex = mockCourses.findIndex(gc => gc.id === courseInPayload.id);
                                if (globalCourseIndex > -1) {
                                    // Update existing global course if details changed (name, desc, type)
                                    mockCourses[globalCourseIndex] = {...mockCourses[globalCourseIndex], ...courseInPayload};
                                     // If it's a Major, ensure this programId is in its list
                                    if (mockCourses[globalCourseIndex].type === 'Major') {
                                        if (!mockCourses[globalCourseIndex].programId) mockCourses[globalCourseIndex].programId = [];
                                        if (!mockCourses[globalCourseIndex].programId!.includes(programId)) {
                                            mockCourses[globalCourseIndex].programId!.push(programId);
                                        }
                                    }
                                } else {
                                    // If course doesn't exist globally, add it
                                    mockCourses.push({
                                        ...courseInPayload, 
                                        programId: courseInPayload.type === 'Major' ? [programId] : [] 
                                    });
                                }
                                return courseInPayload; // Return the course structure for the program's course list
                            });
                        }
                    });
                }
                 logActivity("Updated Program", mockApiPrograms[programIndex].name, "Admin", programId, "program");
                 return { ...mockApiPrograms[programIndex] } as ResponseData;
             }
             throw new Error("Program not found for mock update.");
          }
          if (phpPath.startsWith('courses/update.php/')) { // Admin updating a system course
              const courseId = idStr; // Course ID from URL
              const courseIndex = mockCourses.findIndex(c => c.id === courseId);
              if (courseIndex > -1) {
                   const updatedCourseData = data as Partial<Course>;
                   // Update course details in the global list
                   mockCourses[courseIndex] = {
                       ...mockCourses[courseIndex],
                       ...updatedCourseData,
                       // Ensure programId is correctly handled based on type
                       programId: updatedCourseData.type === 'Major' ? (Array.isArray(updatedCourseData.programId) ? updatedCourseData.programId : (updatedCourseData.programId ? [updatedCourseData.programId as unknown as string] : [])) : [],
                    };
                    // Reflect changes in all programs that use this course
                    mockApiPrograms.forEach(program => {
                         Object.keys(program.courses).forEach(year => {
                             const yr = year as YearLevel;
                             const assignedIndex = program.courses[yr].findIndex(c => c.id === courseId);
                             if (assignedIndex > -1) {
                                 // Update the course details in the program's assignment
                                 program.courses[yr][assignedIndex] = { ...mockCourses[courseIndex] };
                             }
                         });
                    });
                    logActivity("Updated Course", mockCourses[courseIndex].name, "Admin", courseId, "course");
                   return { ...mockCourses[courseIndex] } as ResponseData;
              }
              throw new Error("Course not found for mock update.");
          }
          if (phpPath.startsWith('sections/update.php/')) { // Admin updating section (e.g., programId, yearLevel)
            const sectionIdToUpdate = idStr;
            const sectionIndex = mockSections.findIndex(s => s.id === sectionIdToUpdate);
            if (sectionIndex > -1) {
                const updatedSectionData = data as Partial<Section>; // Payload might only contain programId, yearLevel
                mockSections[sectionIndex] = {
                    ...mockSections[sectionIndex],
                    programId: updatedSectionData.programId ?? mockSections[sectionIndex].programId,
                    yearLevel: updatedSectionData.yearLevel ?? mockSections[sectionIndex].yearLevel,
                    // Update programName if programId changed
                    programName: mockApiPrograms.find(p => p.id === (updatedSectionData.programId ?? mockSections[sectionIndex].programId))?.name,
                    // Adviser info is handled by a separate endpoint
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
        throw error;
    }
};

const mockDeleteData = async (path: string): Promise<void> => {
    const phpPath = finalMockPath(path);
    console.log(`MOCK deleteData at: ${phpPath}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const idPart = phpPath.split('/').pop() || ''; // Get ID from URL (e.g., student ID, faculty ID)

    try {
         if (phpPath.startsWith('students/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const studentIndex = mockStudents.findIndex(s => s.id === id);
            if (studentIndex === -1) throw new Error("Student not found for mock delete.");
            const deletedStudent = { ...mockStudents[studentIndex] }; // Store for logging
            mockStudents.splice(studentIndex, 1);
            recalculateMockSectionCounts(); // Update student counts in sections
            logActivity("Deleted Student", `${deletedStudent.firstName} ${deletedStudent.lastName} (${deletedStudent.username})`, "Admin", id, "student", true, deletedStudent);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('teachers/delete.php/')) { // Admin deleting faculty
            const id = parseInt(idPart || '0', 10);
            const facultyIndex = mockFaculty.findIndex(t => t.id === id);
            if (facultyIndex === -1) throw new Error("Faculty not found for mock delete.");
            const deletedFaculty = { ...mockFaculty[facultyIndex] }; // Store for logging
            
            mockFaculty.splice(facultyIndex, 1); // Remove from faculty list
            
            // If this faculty was an admin, remove their admin role
            if (deletedFaculty.department === 'Administrative') {
                 mockApiAdmins = mockApiAdmins.filter(a => a.id !== id || a.isSuperAdmin); // Keep super admin
            }
            // Unassign from sections (adviser) and course assignments
            mockSections.forEach(sec => { if(sec.adviserId === id) { sec.adviserId = undefined; sec.adviserName = undefined;} });
            mockSectionAssignments = mockSectionAssignments.filter(assign => assign.teacherId !== id);
            mockTeacherTeachableCourses = mockTeacherTeachableCourses.filter(ttc => ttc.teacherId !== id);

            logActivity("Deleted Faculty", `${deletedFaculty.firstName} ${deletedFaculty.lastName} (${deletedFaculty.username})`, "Admin", id, "faculty", true, deletedFaculty);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('admins/delete.php/')) { // Admin removing another admin's role
            const adminIdToRemove = parseInt(idPart || '0', 10);
            if (adminIdToRemove === 0) throw new Error("Cannot remove Super Admin role."); // Prevent super admin deletion

            const adminUser = mockApiAdmins.find(a => a.id === adminIdToRemove);
            if (!adminUser) throw new Error("Admin role not found for mock removal.");

            const originalAdminData = {...adminUser}; // For logging undo
            let originalDepartment: DepartmentType | undefined = undefined;

            // Check if this admin is also a faculty member
            const facultyMember = mockFaculty.find(f => f.id === adminIdToRemove);
            if (facultyMember && facultyMember.department === 'Administrative') {
                originalDepartment = facultyMember.department;
                facultyMember.department = 'Teaching'; // Change department to 'Teaching' or another default
                logActivity("Removed Admin Role", `For ${adminUser.username}. Faculty department changed to Teaching.`, "Admin", adminIdToRemove, "admin", true, {...originalAdminData, originalDepartment});
            } else {
                 // If it's an explicit sub-admin not tied to faculty, just remove from mockApiAdmins
                 logActivity("Removed Admin Role", `Explicit admin ${adminUser.username} removed.`, "Admin", adminIdToRemove, "admin", true, originalAdminData);
            }
             // Remove from mockApiAdmins list (unless it's the super admin)
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
             recalculateDashboardStats(); // Update stats if announcements are counted
             return;
         }
         if (phpPath.startsWith('assignments/delete.php/')) { // Deleting a teacher-course-section assignment
             const id = idPart; // Assignment ID (e.g., CS1A-CS101)
             const assignIndex = mockSectionAssignments.findIndex(a => a.id === id);
             if (assignIndex === -1) throw new Error("Section-Course assignment not found for mock delete.");
             const deletedAssignment = { ...mockSectionAssignments[assignIndex] };
             mockSectionAssignments.splice(assignIndex, 1);
             logActivity("Deleted Section-Course Assignment", `Course ${deletedAssignment.subjectName} from section ${deletedAssignment.sectionId}`, "Admin");
             // No direct impact on dashboard stats, but recalculate if needed elsewhere
             return;
         }
         if (phpPath.startsWith('programs/delete.php/')) { // Admin deleting a program
             const programId = idPart;
             const progIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (progIndex === -1) throw new Error("Program not found for mock delete.");
             const deletedProgram = { ...mockApiPrograms[progIndex] };
             
             mockApiPrograms.splice(progIndex, 1); // Remove program

             // Remove this programId from any Major courses that were exclusively tied to it
             // (or if it was one of multiple, just remove this one)
             mockCourses = mockCourses.map(c => {
                 if (c.type === 'Major' && c.programId?.includes(programId)) {
                     const updatedProgramIds = c.programId.filter(pid => pid !== programId);
                     // If it becomes empty and was major, it might become an orphaned major or need reclassification.
                     // For simplicity, we just remove the ID. A real system might have more complex logic.
                     return { ...c, programId: updatedProgramIds };
                 }
                 return c;
             });
            
             // Remove sections and their assignments associated with this program
             const sectionsToDelete = mockSections.filter(s => s.programId === programId).map(s => s.id);
             mockSections = mockSections.filter(s => s.programId !== programId);
             mockSectionAssignments = mockSectionAssignments.filter(a => !sectionsToDelete.includes(a.sectionId));
             // Update student sections to 'UNASSIGNED' or similar if their section was deleted
             mockStudents.forEach(student => {
                if (sectionsToDelete.includes(student.section)) {
                    student.section = "UNASSIGNED"; // Or handle re-sectioning
                }
             });

             logActivity("Deleted Program", deletedProgram.name, "Admin", programId, "program");
             return;
          }
          if (phpPath.startsWith('courses/delete.php/')) { // Admin deleting a system course
             const courseId = idPart;
             const courseIndex = mockCourses.findIndex(c => c.id === courseId);
             if (courseIndex === -1) throw new Error("Course not found for mock delete.");
             const deletedCourse = { ...mockCourses[courseIndex] };
             
             mockCourses.splice(courseIndex, 1); // Remove from global courses

             // Remove this course from all program assignments
             mockApiPrograms.forEach(program => {
                 Object.keys(program.courses).forEach(year => {
                      const yr = year as YearLevel;
                      program.courses[yr] = program.courses[yr].filter(c => c.id !== courseId);
                 });
             });
             // Remove from section-subject assignments
             mockSectionAssignments = mockSectionAssignments.filter(a => a.subjectId !== courseId);
             // Remove from teacher teachable courses
             mockTeacherTeachableCourses.forEach(ttc => {
                ttc.courseIds = ttc.courseIds.filter(cid => cid !== courseId);
             });

             logActivity("Deleted Course", deletedCourse.name, "Admin", courseId, "course");
             return;
          }
          // Mock for removing a specific course from a program's year level
          if (phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/)) { // Path: /api/programs/{programId}/courses/remove/{yearLevel}/{courseId}
             const [, programId, yearLevelEncoded, courseId] = phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/) || [];
             const yearLevel = decodeURIComponent(yearLevelEncoded) as YearLevel; // Decode if year level might have spaces

             const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1 && mockApiPrograms[programIndex].courses[yearLevel]) {
                 const courseIndexInProgram = mockApiPrograms[programIndex].courses[yearLevel].findIndex(c => c.id === courseId);
                 if (courseIndexInProgram === -1) throw new Error("Course assignment not found in program/year for mock removal.");
                 
                 const removedCourse = mockApiPrograms[programIndex].courses[yearLevel][courseIndexInProgram];
                 mockApiPrograms[programIndex].courses[yearLevel].splice(courseIndexInProgram, 1);
                 
                 // If this was a Major course and this program was its only assignment,
                 // its programId list in mockCourses might need updating (or the course becomes "orphaned major").
                 // For simplicity, this step is omitted here but would be important in a real system.

                 logActivity("Removed Course from Program", `${removedCourse.name} from ${mockApiPrograms[programIndex].name} (${yearLevel})`, "Admin");
                 return;
             }
             throw new Error("Program or year level not found for removing course assignment.");
          }
           if (phpPath.startsWith('sections/delete.php/')) { // Admin deleting a section
            const sectionIdToDelete = idPart;
            const sectionIndex = mockSections.findIndex(s => s.id === sectionIdToDelete);
            if (sectionIndex === -1) throw new Error("Section not found for mock delete.");

            const deletedSection = { ...mockSections[sectionIndex] };
            const studentsInSec = mockStudents.filter(s => s.section === sectionIdToDelete).length;
            if (studentsInSec > 0) {
                // Handle students in the section, e.g., move to 'UNASSIGNED' or another section
                console.warn(`Attempting to delete section ${deletedSection.sectionCode} which has ${studentsInSec} student(s). For mock, proceeding with disassociation.`);
                mockStudents = mockStudents.map(s => {
                    if (s.section === sectionIdToDelete) {
                        return { ...s, section: 'UNASSIGNED' }; // Or implement re-sectioning logic
                    }
                    return s;
                });
            }
            mockSections.splice(sectionIndex, 1); // Remove section
            // Remove associated section-subject assignments
            mockSectionAssignments = mockSectionAssignments.filter(sa => sa.sectionId !== sectionIdToDelete);
            logActivity("Deleted Section", `Section ${deletedSection.sectionCode}`, "Admin", sectionIdToDelete, "section");
            recalculateMockSectionCounts(); // Recalculate all section counts
            return;
        }
        console.warn(`Mock API unhandled DELETE path: ${phpPath}`);
        throw new Error(`Mock DELETE endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
         console.error(`Error in mock deleteData for ${phpPath}:`, error);
         throw error; // Re-throw to be caught by the caller
    }
};

export const fetchData = async <T>(path: string): Promise<T> => {
    if (USE_MOCK_API) return mockFetchData(path);

    const url = getApiUrl(path);
    let response: Response;
    try {
        response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json'} });
    } catch (networkError: any) {
        // This is a network error (e.g., server down, DNS issue, CORS on preflight)
        return handleFetchError(networkError, path, 'GET', true);
    }

    let responseBodyText = "";
    try {
        responseBodyText = await response.text(); // Read body once
    } catch (readError) {
        // This means reading the response body failed, but connection was made.
        console.warn(`Failed to read response body as text for GET ${url}:`, readError);
         if (!response.ok) { // If status is bad AND body read failed
            handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'GET');
        }
        // If status is OK but body read failed, it's problematic, might treat as empty or error
        // For now, let's assume if OK and read failed, it might be an intended empty response from a successful call
    }

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;

        // Try to parse error body if it exists
        if (responseBodyText) {
            try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage; // Prioritize parsed message
            } catch (jsonParseError) {
                 // If not JSON, use the raw text
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage }; // Keep the structure
            }
        }
        console.error("API Error Response Text (fetchData):", responseBodyText || "(empty body)");
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'GET');
    }

    // Handle successful responses
    if (response.status === 204 || !responseBodyText) { // No Content or empty body
        return {} as T; // Or handle as appropriate (e.g., null, undefined)
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
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json', // Important for some backends to send JSON response
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

    // Handle successful POST (200, 201 typically)
    // For 201 Created, body might be the created resource.
    // For 200 OK, body might be a success message or updated resource.
    // For 204 No Content, body will be empty.
    if (response.status === 204 || (response.status === 201 && !responseBodyText)) { // Handle 201 with empty body specifically
        return { success: true, message: `Operation successful (Status ${response.status})` } as unknown as ResponseData; // Or just {} as ResponseData for 204
    }

    try {
        return JSON.parse(responseBodyText) as ResponseData;
    } catch (jsonError: any) {
        console.error("Failed to parse JSON response on successful POST:", jsonError, "Body was:", responseBodyText);
        // If parsing fails but status was OK, it might be an issue with backend returning non-JSON for success.
        // Return a generic success or the raw text if appropriate.
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
    // Handle successful PUT (200 OK or 204 No Content typically)
    if (response.status === 204 || !responseBodyText) { // 204 or empty body on 200
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
         // For DELETE, a 204 No Content is common and OK.
         // Only if not OK and not 204, should we error out immediately on read failure.
         if (!response.ok && response.status !== 204) {
            handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'DELETE');
        }
    }

    // If status is not OK and not 204 (No Content, which is a success for DELETE)
    if (!response.ok && response.status !== 204) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
         if (responseBodyText) { // Attempt to parse if there's a body
             try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
             } catch (jsonParseError) {
                 // If body is not JSON, use the raw text
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
             }
         }
        console.error("API Error Response Text (deleteData):", responseBodyText || "(empty body)");
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'DELETE');
    }
    // If successful (200 with body, or 204), just return.
    // If there was a body on a 200, you might parse it if needed, but typically DELETE doesn't return much.
    if (responseBodyText && response.status !== 204) { // Check if there's a body on non-204 success
        try {
            JSON.parse(responseBodyText); // Attempt to parse if backend sends JSON on 200 for DELETE
        } catch (e) {
            // Not JSON, or empty, which is fine for DELETE.
            console.log("DELETE response was not JSON or empty:", responseBodyText);
        }
    }
    // Implicit void return for successful DELETE
};

// Helper to format date for unique ID generation in mock schedule
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}


export { USE_MOCK_API as defaultUSE_MOCK_API };
// Ensure all mock data arrays are exported
export { mockApiPrograms, mockCourses, mockStudents, mockFaculty, mockSections, mockAnnouncements, mockSectionAssignments, mockApiAdmins };
export { mockActivityLog, mockDashboardStats, mockStudentSubjectAssignmentsWithGrades, mockTeacherTeachableCourses };
    