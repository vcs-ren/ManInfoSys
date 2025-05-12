
'use client';

import type { Student, Faculty, Section, Course, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole, CourseType, YearLevel, ActivityLogEntry, EmploymentType, EnrollmentType } from '@/types';
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateAdminUsername, generateTeacherUsername, generateStudentId as generateFrontendStudentId } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

let nextStudentDbId = 3;
let nextFacultyDbId = 4;
let nextProgramDbId = 3;
let nextCourseDbId = 10;
let nextActivityLogId = 1; // Initialize for unique log IDs

const mockGenerateFourRandomDigits = () => Math.floor(Math.random() * 10000).toString().padStart(4, '0');

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
  { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year.", date: new Date(2024, 7, 15), targetAudience: "All", target: { program: "all" }, author: "Admin" },
];

let mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = [
    { assignmentId: `CS2A-CS201-${mockStudents[0].id}`, studentId: mockStudents[0].id, studentName: "Alice Smith", subjectId: "CS201", subjectName: "Data Structures", section: "CS2A", year: "2nd Year", prelimGrade: 85, prelimRemarks: "Good start", midtermGrade: 90, midtermRemarks: "Excellent", finalGrade: 88, finalRemarks: "Very Good", status: "Complete" },
    { assignmentId: `IT1A-IT101-${mockStudents[1].id}`, studentId: mockStudents[1].id, studentName: "Bob Johnson", subjectId: "IT101", subjectName: "IT Fundamentals", section: "IT1A", year: "1st Year", prelimGrade: null, prelimRemarks: "", midtermGrade: null, midtermRemarks: "", finalGrade: null, finalRemarks: "", status: "Not Submitted" },
];

export let mockApiAdmins: AdminUser[] = [
    { id: 0, username: "admin", firstName: "Super", lastName: "Admin", email: "superadmin@example.com", role: "Super Admin", isSuperAdmin: true },
    // Sub-admins are now derived from faculty with 'Administrative' department
];

// Ensure mockActivityLog has an initial entry with a unique ID
export let mockActivityLog: ActivityLogEntry[] = [
    { id: `log${nextActivityLogId++}`, timestamp: new Date(Date.now() - 1000 * 60 * 5), user: "System", action: "System Startup", description: "System initialized successfully.", canUndo: false }
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
        id: `log${nextActivityLogId++}`, // Ensures unique ID for new entries
        timestamp: new Date(),
        user,
        action,
        description,
        targetId,
        targetType,
        canUndo,
        originalData
    };
    mockActivityLog.unshift(newLogEntry); // Prepends to the global array
    if (mockActivityLog.length > 50) { // Limits the size
        mockActivityLog.pop();
    }
};

export let mockDashboardStats: DashboardStats = {} as DashboardStats;

const recalculateDashboardStats = () => {
    const teachingStaffCount = mockFaculty.filter(f => f.department === 'Teaching').length;
    const adminStaffFromFacultyCount = mockFaculty.filter(f => f.department === 'Administrative').length;
    
    mockDashboardStats = {
        totalStudents: mockStudents.length,
        totalFaculty: mockFaculty.length, 
        totalAdmins: adminStaffFromFacultyCount, // Only counts faculty designated as Administrative
        upcomingEvents: mockAnnouncements.filter(a => a.date > new Date()).length,
    };
};
recalculateDashboardStats(); // Initial calculation

let mockTestUsers = [
    { username: "admin", password: "defadmin", role: "Admin" as const, userId: 0 },
    { username: mockStudents[0].username, password: "password", role: "Student" as const, userId: mockStudents[0].id },
    { username: mockStudents[1].username, password: "password", role: "Student" as const, userId: mockStudents[1].id },
    { username: mockFaculty[0].username, password: "password", role: "Teacher" as const, userId: mockFaculty[0].id },
    // Removed faculty member with ID 2 from test users as they are now the basis for a sub-admin derived from faculty.
    // No explicit sub-admin test user is needed if they are derived from faculty list.
];

export const USE_MOCK_API = true;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const getApiUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
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
    throw new Error(errorMessage);
};

const finalMockPath = (path: string) => {
     const formattedPath = path.startsWith('/') ? path.substring(1) : path;
     return formattedPath;
}

const mockFetchData = async <T>(path: string): Promise<T> => {
    const phpPath = finalMockPath(path);
    console.log(`MOCK fetchData from: ${phpPath}`);
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        if (phpPath === 'students/read.php') return [...mockStudents] as T;
        if (phpPath === 'teachers/read.php') return [...mockFaculty] as T;
        if (phpPath === 'admins/read.php') {
            const superAdmin = mockApiAdmins.find(a => a.isSuperAdmin && a.id === 0);
            const facultyAdmins: AdminUser[] = mockFaculty
                .filter(f => f.department === 'Administrative')
                .map(f => ({
                    id: f.id,
                    username: f.username, // Ensure username is generated/available on faculty object
                    firstName: f.firstName,
                    lastName: f.lastName,
                    email: f.email,
                    role: 'Sub Admin',
                    isSuperAdmin: false,
                }));

            let allAdmins: AdminUser[] = [];
            if(superAdmin) allAdmins.push(superAdmin);
            allAdmins = [...allAdmins, ...facultyAdmins];
            
            // Deduplicate if any explicit mockApiAdmins were also facultyAdmins
            const uniqueAdmins = Array.from(new Map(allAdmins.map(admin => [admin.id, admin])).values());
            return uniqueAdmins as T;
        }
        if (phpPath === 'programs/read.php') return [...mockApiPrograms] as T;
        if (phpPath === 'courses/read.php') return [...mockCourses] as T;
        
        if (phpPath.startsWith('sections/read.php')) {
            const urlParams = new URLSearchParams(phpPath.split('?')[1] || '');
            const sectionIdParam = urlParams.get('id');

            if (sectionIdParam) { // Fetch single section
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
                     return [singleSection] as unknown as T;
                 }
                 return [] as unknown as T;
            } else { // Fetch all sections
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
            return [...mockAnnouncements].sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'student/announcements/read.php') {
            const studentUser = mockTestUsers.find(u => u.username === "s1001")
            const studentDetails = mockStudents.find(s => s.id === studentUser?.userId);

            if (!studentDetails) return [] as T;

            const studentProgram = studentDetails.program;
            const studentYear = studentDetails.year;
            const studentSection = studentDetails.section;

             return mockAnnouncements.filter(ann =>
                (ann.targetAudience === 'All' || ann.targetAudience === 'Student') &&
                (ann.target.program === 'all' || ann.target.program === studentProgram || !ann.target.program) &&
                (ann.target.yearLevel === 'all' || ann.target.yearLevel === studentYear || !ann.target.yearLevel) &&
                (ann.target.section === 'all' || ann.target.section === studentSection || !ann.target.section)
            ).sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'teacher/announcements/read.php') {
            const teacherUser = mockTestUsers.find(u => u.username === "t1001");
            const teacherId = teacherUser?.userId;

            return mockAnnouncements.filter(ann =>
                (ann.author_type === 'Admin' && (ann.targetAudience === 'All' || ann.targetAudience === 'Faculty')) ||
                (ann.author_type === 'Teacher' && ann.author === String(teacherId)) // Assuming author for teacher announcements is their ID as string
            ).sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'admin/dashboard-stats.php') {
            recalculateDashboardStats();
            return { ...mockDashboardStats } as T;
        }
         if (phpPath.startsWith('sections/assignments/read.php')) { // Covers both all and section-specific
            const sectionIdMatch = phpPath.match(/sectionId=([^&]+)/);
            const allMatch = phpPath.match(/all=true/);
            let assignmentsToReturn = mockSectionAssignments;

            if (sectionIdMatch && !allMatch) { // Filter by sectionId if 'all' is not true
                const sectionId = sectionIdMatch[1];
                assignmentsToReturn = mockSectionAssignments.filter(a => a.sectionId === sectionId);
            }
             return assignmentsToReturn.map(a => ({
                ...a,
                subjectName: mockCourses.find(s => s.id === a.subjectId)?.name || a.subjectId,
                teacherName: mockFaculty.find(t => t.id === a.teacherId)?.firstName + ' ' + mockFaculty.find(t => t.id === a.teacherId)?.lastName || `Faculty ID ${a.teacherId}`,
            })) as T;
        }
         if (phpPath === 'student/grades/read.php') {
             const studentUser = mockTestUsers.find(u => u.username === "s1001")
             const studentId = studentUser?.userId;
             const studentGrades = mockStudentSubjectAssignmentsWithGrades
                .filter(g => g.studentId === studentId)
                .map(g => ({
                    id: g.subjectId, // Use subjectId as the key for the grade row
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
            const teacherUser = mockTestUsers.find(u => u.username === "t1001"); // Assuming a mock teacher user for testing
            const teacherId = teacherUser?.userId;

             // Find all assignments for this teacher
             const teacherAssignments = mockSectionAssignments.filter(sa => sa.teacherId === teacherId);
             
             // For each student in those assignments, get their grades for the specific subject
             const gradesToReturn: StudentSubjectAssignmentWithGrades[] = [];
             mockStudents.forEach(student => {
                 teacherAssignments.forEach(ta => {
                     if (student.section === ta.sectionId) { // Check if student is in the teacher's section for this assignment
                         const existingGradeEntry = mockStudentSubjectAssignmentsWithGrades.find(
                             g => g.studentId === student.id && g.subjectId === ta.subjectId && g.assignmentId.startsWith(ta.id)
                         );
                         gradesToReturn.push({
                             assignmentId: existingGradeEntry?.assignmentId || `${ta.id}-${student.id}`,
                             studentId: student.id,
                             studentName: `${student.firstName} ${student.lastName}`,
                             subjectId: ta.subjectId,
                             subjectName: ta.subjectName || mockCourses.find(c => c.id === ta.subjectId)?.name || ta.subjectId,
                             section: student.section,
                             year: student.year!, // Assuming student.year is always defined
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
             if (student) return { ...student } as T;
             throw new Error("Mock student profile not found.");
        }
        if (phpPath === 'teacher/profile/read.php') {
             const teacherUser = mockTestUsers.find(u => u.username === "t1001");
             const faculty = mockFaculty.find(t => t.id === teacherUser?.userId);
             if (faculty) return { ...faculty } as T;
             throw new Error("Mock faculty profile not found.");
        }
         if (phpPath === 'student/schedule/read.php') {
            const studentUser = mockTestUsers.find(u => u.username === "s1001")
            const studentDetails = mockStudents.find(s => s.id === studentUser?.userId);
            if (!studentDetails) return [] as T;
            const studentSection = studentDetails.section;

            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments
                .filter(a => a.sectionId === studentSection)
                .forEach((assign, index) => {
                     const dayOffset = index % 5; // Distribute over 5 days
                     const startTime = new Date();
                     // Calculate the date for the next occurrence of this weekday
                     startTime.setDate(startTime.getDate() + (dayOffset - startTime.getDay() + 1 + (dayOffset < startTime.getDay() -1 ? 7 : 0) ));
                     startTime.setHours(8 + index, 0, 0, 0); // Stagger start times
                     const endTime = new Date(startTime);
                     endTime.setHours(startTime.getHours() + 1);
                     schedule.push({
                        id: `${assign.id}-${formatDate(startTime)}`,
                        title: `${assign.subjectName || assign.subjectId} - ${assign.sectionId}`,
                        start: startTime,
                        end: endTime,
                        type: 'class',
                        location: `Room ${101 + index}`, // Example room
                        teacher: assign.teacherName
                     });
                });
             return schedule as T;
        }
         if (phpPath === 'teacher/schedule/read.php') {
            const teacherUser = mockTestUsers.find(u => u.username === "t1001"); // Assuming a mock teacher user for testing
            const teacherId = teacherUser?.userId;
            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments
                .filter(a => a.teacherId === teacherId)
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
                        section: assign.sectionId
                     });
                });
             return schedule as T;
        }
         if (phpPath === 'teacher/subjects/read.php') { // Endpoint for teacher to see their assigned subjects
             const teacherUser = mockTestUsers.find(u => u.username === "t1001");
             const teacherId = teacherUser?.userId;
             const subjectIds = new Set(mockSectionAssignments.filter(a => a.teacherId === teacherId).map(a => a.subjectId));
             return mockCourses.filter(s => subjectIds.has(s.id)) as T;
         }
         if (phpPath === 'teacher/teachable-courses/read.php') {
            return [...mockTeacherTeachableCourses] as T;
        }
          if (phpPath === 'student/upcoming/read.php') { // Student upcoming items
             const upcoming: UpcomingItem[] = [];
              // Mock example: Get first class from student's schedule if available
              const studentUser = mockTestUsers.find(u => u.username === "s1001")
              const studentDetails = mockStudents.find(s => s.id === studentUser?.userId);
              if (!studentDetails) return [] as T;

              const studentSchedule = mockSectionAssignments
                .filter(a => a.sectionId === studentDetails.section)
                .map((assign, index) => { // Simplified schedule generation
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
                upcoming.push(studentSchedule[0]); // Add first class as an upcoming item
            }
             // Add some mock assignments/events
             upcoming.push({ id: "assign-mock1", title: "Submit CS101 Homework", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), type: "assignment" });
             upcoming.push({ id: "event-mock1", title: "Department Meeting", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), type: "event" });

             return upcoming.slice(0, 5) as T; // Return a few items
         }
         if (phpPath === 'admin/activity-log/read.php') {
            // Return a sorted and sliced copy to prevent direct modification of the log outside `logActivity`
            return [...mockActivityLog].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10) as T;
        }
         if (phpPath.startsWith('sections/read.php/')) { // Corrected from /api/sections/read.php/
            const sectionId = phpPath.split('/').pop();
            const section = mockSections.find(s => s.id === sectionId);
             if (section) {
                 const program = mockApiPrograms.find(p => p.id === section.programId);
                 const adviser = mockFaculty.find(f => f.id === section.adviserId);
                 return { // Return as single object, not array, if fetching one
                     ...section,
                     programName: program?.name || section.programId,
                     adviserName: adviser ? `${adviser.firstName} ${adviser.lastName}` : undefined,
                     studentCount: mockStudents.filter(st => st.section === section.id).length
                 } as T;
             }
            throw new Error(`Mock section with ID ${sectionId} not found.`);
        }


        console.warn(`Mock API unhandled GET path: ${phpPath}`);
        throw new Error(`Mock GET endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
        console.error(`Error in mock fetchData for ${phpPath}:`, error);
        throw error;
    }
};

const mockPostData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const phpPath = finalMockPath(path);
    console.log(`MOCK postData to: ${phpPath}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
         if (phpPath === 'login.php') {
             const { username, password } = data as any; // Assuming data contains username and password
            let user = mockTestUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

            // For mock purposes, if user is one of the test usernames, bypass password check if password is not 'defadmin' for admin
            if (user && (user.username === 'admin' ? password === 'defadmin' : true )) {
                const redirectPath = user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Student' ? '/student/dashboard' : '/teacher/dashboard';
                if (typeof window !== 'undefined') {
                    localStorage.setItem('userRole', user.role);
                    localStorage.setItem('userId', String(user.userId));
                }
                // Update lastAccessed for students and teachers
                if (user.role === 'Student') {
                    const studentIndex = mockStudents.findIndex(s => s.id === user.userId);
                    if (studentIndex > -1) mockStudents[studentIndex].lastAccessed = new Date().toISOString();
                } else if (user.role === 'Teacher') {
                    const facultyIndex = mockFaculty.findIndex(f => f.id === user.userId);
                    if (facultyIndex > -1) mockFaculty[facultyIndex].lastAccessed = new Date().toISOString();
                } else if (user.role === 'Admin' && user.userId !== 0) { // For Sub Admins derived from faculty
                    const facultyAdmin = mockFaculty.find(f => f.id === user.userId && f.department === 'Administrative');
                    if (facultyAdmin) {
                         const facultyIndex = mockFaculty.findIndex(f => f.id === user.userId);
                         if (facultyIndex > -1) mockFaculty[facultyIndex].lastAccessed = new Date().toISOString();
                    }
                }

                logActivity("User Login", `${user.username} logged in.`, user.username, user.userId, user.role.toLowerCase() as ActivityLogEntry['targetType']);
                return { success: true, role: user.role as any, redirectPath: redirectPath, userId: user.userId } as ResponseData;
             }
             // If not a special mock user or password mismatch for admin
             throw new Error("Invalid mock credentials or password mismatch for admin.");
        }
         if (phpPath === 'students/create.php') {
            const newStudentData = data as unknown as Omit<Student, 'id' | 'studentId' | 'section' | 'username' | 'lastAccessed'>;

            const studentProgramId = newStudentData.program;
            let studentYearLevel = newStudentData.year;

            if (newStudentData.enrollmentType === 'New') {
                studentYearLevel = '1st Year';
            } else if (!studentYearLevel && (newStudentData.enrollmentType === 'Transferee' || newStudentData.enrollmentType === 'Returnee')) {
                 throw new Error("Year level is required for Transferee or Returnee enrollment type.");
            }

            if (!studentProgramId || !studentYearLevel) {
                throw new Error("Program and Year Level are required to determine section.");
            }

            // Section assignment logic (max 30 students per section)
            let assignedSectionCode: string | undefined = undefined;
            const existingSectionsForProgramYear = mockSections
                .filter(s => s.programId === studentProgramId && s.yearLevel === studentYearLevel)
                .sort((a, b) => a.sectionCode.localeCompare(b.sectionCode)); // Sort to pick 'A' before 'B'

            for (const section of existingSectionsForProgramYear) {
                const studentCountInSection = mockStudents.filter(st => st.section === section.id).length;
                if (studentCountInSection < 30) { // Max 30 students
                    assignedSectionCode = section.id;
                    break;
                }
            }

            // If no suitable existing section, create a new one
            if (!assignedSectionCode) {
                // Determine the next section letter (A, B, C...)
                const newSectionLetterSuffixIndex = existingSectionsForProgramYear.length; // 0 for A, 1 for B, etc.
                assignedSectionCode = generateSectionCode(studentProgramId, studentYearLevel, newSectionLetterSuffixIndex);

                // Add new section to mockSections if it doesn't exist
                if (!mockSections.some(s => s.id === assignedSectionCode)) {
                    const programDetails = mockApiPrograms.find(p => p.id === studentProgramId);
                    const newSectionObject: Section = {
                        id: assignedSectionCode,
                        sectionCode: assignedSectionCode,
                        programId: studentProgramId,
                        programName: programDetails?.name || studentProgramId, // Add programName
                        yearLevel: studentYearLevel,
                        studentCount: 0, // Will be incremented
                    };
                    mockSections.push(newSectionObject);
                    logActivity("Auto-Added Section", `Section ${assignedSectionCode} for ${studentProgramId} - ${studentYearLevel} due to enrollment.`, "System", assignedSectionCode, "section");
                }
            }
            const nextId = mockStudents.reduce((max, s) => Math.max(max, s.id), 0) + 1;
            const studentId = generateFrontendStudentId(); // Uses the new util function
            const username = generateStudentUsername(studentId); // Uses the new util function

            const student: Student = {
                ...(newStudentData as Omit<Student, 'id' | 'studentId' | 'username' | 'section' | 'year' | 'lastAccessed'>), // Cast to exclude generated fields
                id: nextId,
                studentId: studentId,
                username: username,
                section: assignedSectionCode, // Assign determined section
                year: studentYearLevel, // Assign determined year
                lastAccessed: null,
            };
            mockStudents.push(student);

            // Update student count in the section
            const sectionToUpdate = mockSections.find(s => s.id === assignedSectionCode);
            if (sectionToUpdate) {
                sectionToUpdate.studentCount = mockStudents.filter(s => s.section === assignedSectionCode).length;
            }

            logActivity("Added Student", `${student.firstName} ${student.lastName} (${student.username}) to section ${student.section}`, "Admin", student.id, "student", true, { ...student, passwordHash: "mock_hash" }); // Log with undo data
            recalculateDashboardStats();
            return student as ResponseData;
        }
         if (phpPath === 'teachers/create.php') {
            const newFacultyData = data as unknown as Omit<Faculty, 'id' | 'facultyId' | 'username' | 'lastAccessed'>;
            const nextId = mockFaculty.reduce((max, f) => Math.max(max, f.id), 0) + 1;
            const facultyId = generateTeacherId(); // Uses the new util function
            const department = newFacultyData.department || 'Teaching'; // Default if not provided
            const username = generateTeacherUsername(facultyId, department); // Uses the new util function

            const faculty: Faculty = {
                ...newFacultyData,
                id: nextId,
                facultyId: facultyId,
                username: username,
                lastAccessed: null,
            };
            mockFaculty.push(faculty);
             // If faculty is Administrative, also create/update their admin record
             if (faculty.department === 'Administrative') {
                 const existingAdminIndex = mockApiAdmins.findIndex(a => a.id === faculty.id);
                 const adminEntry: AdminUser = {
                    id: faculty.id,
                    username: faculty.username, // Use faculty username for admin username
                    firstName: faculty.firstName,
                    lastName: faculty.lastName,
                    email: faculty.email,
                    role: 'Sub Admin',
                    isSuperAdmin: false,
                 };
                 if (existingAdminIndex > -1) {
                     mockApiAdmins[existingAdminIndex] = adminEntry;
                 } else {
                     mockApiAdmins.push(adminEntry);
                 }
             }
            logActivity("Added Faculty", `${faculty.firstName} ${faculty.lastName} (${faculty.username})`, "Admin", faculty.id, "faculty", true, { ...faculty, passwordHash: "mock_hash" }); // Log with undo data
            recalculateDashboardStats();
            return faculty as ResponseData;
        }
         if (phpPath === 'programs/create.php') {
             const newProgramData = data as unknown as Program; // Program type already includes courses structure
             // Ensure ID is unique or generate one
             const newProgramId = newProgramData.id || newProgramData.name.toUpperCase().substring(0, 3) + mockApiPrograms.length;
             if (mockApiPrograms.some(p => p.id === newProgramId)) {
                 throw new Error("Program with this ID already exists.");
             }
             const newProgram: ProgramType = {
                 id: newProgramId,
                 name: newProgramData.name,
                 description: newProgramData.description,
                 courses: newProgramData.courses || { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] }, // Initialize courses if not provided
             };
             // Add any new courses from payload to global mockCourses if they don't exist
             Object.values(newProgram.courses).flat().forEach(course => {
                 if (!mockCourses.some(c => c.id === course.id)) {
                     mockCourses.push({ ...course, programId: course.type === 'Major' ? (course.programId || [newProgram.id]) : [] });
                 }
             });
             mockApiPrograms.push(newProgram);
             logActivity("Added Program", newProgram.name, "Admin", newProgram.id, "program");
             // Section creation is now handled when a student enrolls.
             return newProgram as ResponseData;
         }
         if (phpPath === 'courses/create.php') {
             const newCourseData = data as Course;
             const nextIdNumber = mockCourses.reduce((max, c) => {
                const numId = parseInt(c.id.replace(/[^0-9]/g, ''), 10); // Extract numbers
                return isNaN(numId) ? max : Math.max(max, numId);
             }, 0) +1; // Increment from the max numeric part
             const newCourse: Course = {
                 ...newCourseData,
                 id: newCourseData.id || `C${String(nextIdNumber).padStart(3,'0')}`, // Ensure new ID format if generated
                 programId: newCourseData.type === 'Major' ? (newCourseData.programId || []) : [], // Ensure programId is array for Major
             };
             if (mockCourses.some(c => c.id === newCourse.id)) {
                 throw new Error(`Course with ID ${newCourse.id} already exists.`);
             }
             mockCourses.push(newCourse);
             logActivity("Added Course", newCourse.name, "Admin", newCourse.id, "course");
             return newCourse as ResponseData;
         }
          if (phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)) { // Assign course to program/year
              const programId = phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)?.[1];
              const { courseId, yearLevel } = data as { courseId: string, yearLevel: YearLevel }; // Assuming payload is { courseId, yearLevel }
              const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
              const course = mockCourses.find(c => c.id === courseId);

              if (programIndex === -1) throw new Error("Program not found.");
              if (!course) throw new Error("Course not found.");
               // Initialize year level array if it doesn't exist
               if (!mockApiPrograms[programIndex].courses[yearLevel]) {
                  mockApiPrograms[programIndex].courses[yearLevel] = [];
               }
                // Check if course already assigned to this year level in this program
                if (mockApiPrograms[programIndex].courses[yearLevel].some(c => c.id === courseId)) {
                    throw new Error(`Course ${course.name} is already assigned to ${programId} - ${yearLevel}.`);
                }
                // Major course validation: can only be assigned to its own program(s)
                if (course.type === 'Major' && (!course.programId || !course.programId.includes(programId))) {
                     throw new Error(`Major course ${course.name} does not belong to program ${programId} and cannot be assigned.`);
                }
                mockApiPrograms[programIndex].courses[yearLevel].push(course); // Add the full course object
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
                  // Actual password reset logic would be here in a real backend
                  logActivity(`Reset Student Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'teacher') {
                  const facultyMember = mockFaculty.find(f => f.id === userId);
                  if (facultyMember) targetFullname = `${facultyMember.firstName} ${facultyMember.lastName}`;
                  else throw new Error(`Faculty with ID ${userId} not found.`);
                  // Actual password reset logic
                   logActivity(`Reset Faculty Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'admin') {
                  const adminUser = mockApiAdmins.find(a => a.id === userId);
                  if (adminUser) {
                      if(adminUser.isSuperAdmin) throw new Error("Super Admin password must be changed via Settings."); // Prevent Super Admin reset here
                      targetFullname = adminUser.firstName ? `${adminUser.firstName} ${adminUser.lastName}` : adminUser.username;
                      // Actual password reset logic for sub-admins
                      logActivity("Reset Admin Password", `For ${targetFullname} (${adminUser.username})`, "Admin");
                  } else {
                      // Check if it's a faculty admin not in mockApiAdmins explicitly
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
              return { message: `${userType} password reset successfully.` } as ResponseData;
        }
        if (phpPath === 'announcements/create.php') {
            const newAnnData = data as { title: string; content: string; targetAudience: Announcement['targetAudience'], target: any };
            const nextId = `ann${mockAnnouncements.length + 1}`;
            const newAnnouncement: Announcement = {
                id: nextId,
                title: newAnnData.title,
                content: newAnnData.content,
                date: new Date(), // Current date for new announcement
                targetAudience: newAnnData.targetAudience || 'All', // Default to All
                target: newAnnData.target, // Target object from payload
                author: "Admin" // Assuming Admin posts this
            };
            mockAnnouncements.unshift(newAnnouncement); // Add to start of array
            logActivity("Created Announcement", newAnnData.title, "Admin", newAnnData.target.program || newAnnData.target.section || newAnnData.target.yearLevel || 'all', 'announcement');
            return newAnnouncement as ResponseData;
        }
         if (phpPath.match(/^sections\/adviser\/update\.php$/)) { // Endpoint to update adviser for a section
             const { sectionId, adviserId } = data as { sectionId: string, adviserId: number | null };
             const sectionIndex = mockSections.findIndex(s => s.id === sectionId);
             if (sectionIndex > -1) {
                 const adviser = mockFaculty.find(t => t.id === adviserId);
                 mockSections[sectionIndex].adviserId = adviserId ?? undefined; // Set to undefined if null
                 mockSections[sectionIndex].adviserName = adviser ? `${adviser.firstName} ${adviser.lastName}` : undefined;
                 logActivity("Updated Section Adviser", `For section ${mockSections[sectionIndex].sectionCode} to ${adviser ? adviser.firstName + ' ' + adviser.lastName : 'None'}`, "Admin");
                 return { ...mockSections[sectionIndex] } as ResponseData;
             }
             throw new Error("Section not found.");
         }
         if (phpPath === 'sections/assignments/create.php') { // Assign teacher to subject in section
             const { sectionId, subjectId, teacherId } = data as { sectionId: string; subjectId: string; teacherId: number };
             const subject = mockCourses.find(s => s.id === subjectId);
             const facultyMember = mockFaculty.find(t => t.id === teacherId);
             const assignmentId = `${sectionId}-${subjectId}`; // Simple unique ID
              if (mockSectionAssignments.some(a => a.id === assignmentId)) {
                   // If assignment exists, update teacher instead of throwing error
                   const existingAssignmentIndex = mockSectionAssignments.findIndex(a => a.id === assignmentId);
                   mockSectionAssignments[existingAssignmentIndex].teacherId = teacherId;
                   mockSectionAssignments[existingAssignmentIndex].teacherName = facultyMember ? `${facultyMember.firstName} ${facultyMember.lastName}` : undefined;
                   logActivity("Updated Teacher for Course-Section", `${subject?.name} in section ${sectionId} to ${facultyMember?.firstName} ${facultyMember?.lastName}`, "Admin");
                   return { ...mockSectionAssignments[existingAssignmentIndex] } as ResponseData;
              }
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
         if (phpPath === 'assignments/grades/update.php') { // Submit/Update grades
              const gradeData = data as StudentSubjectAssignmentWithGrades; // Expect full structure from form
              const index = mockStudentSubjectAssignmentsWithGrades.findIndex(a => a.assignmentId === gradeData.assignmentId && a.studentId === gradeData.studentId);
              if (index > -1) {
                   // Update existing entry
                   mockStudentSubjectAssignmentsWithGrades[index] = {
                       ...mockStudentSubjectAssignmentsWithGrades[index], // Keep existing fields like studentName, subjectName
                       ...gradeData // Overwrite with new grade values
                   };
                   const updated = mockStudentSubjectAssignmentsWithGrades[index];
                    // Recalculate status
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (updated.prelimGrade !== null || updated.midtermGrade !== null || updated.finalGrade !== null) {
                        status = 'Incomplete';
                    }
                    if (updated.finalGrade !== null) { // Only final grade makes it complete
                        status = 'Complete';
                    }
                    updated.status = status;
                    logActivity("Updated Grades", `For ${updated.studentName} in ${updated.subjectName}`, "Teacher");
                   return updated as ResponseData;
               } else {
                    // Create new entry if it doesn't exist (shouldn't happen if form is based on existing assignment)
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (gradeData.prelimGrade !== null || gradeData.midtermGrade !== null || gradeData.finalGrade !== null) {
                        status = 'Incomplete';
                    }
                    if (gradeData.finalGrade !== null) {
                        status = 'Complete';
                    }
                    const student = mockStudents.find(s => s.id === gradeData.studentId);
                    const subject = mockCourses.find(s => s.id === gradeData.subjectId);
                    const sectionAssignment = mockSectionAssignments.find(sa => sa.id === gradeData.assignmentId.substring(0, gradeData.assignmentId.lastIndexOf('-')));


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
        if (phpPath === 'admin/change_password.php') { logActivity("Changed Admin Password", "Super Admin password updated", "Admin"); return { message: "Admin password updated successfully." } as ResponseData; }
        if (phpPath === 'student/change_password.php') { logActivity("Changed Password", "Student updated their password", "Student"); return { message: "Student password updated successfully." } as ResponseData; }
        if (phpPath === 'teacher/change_password.php') { logActivity("Changed Password", "Faculty updated their password", "Faculty"); return { message: "Faculty password updated successfully." } as ResponseData; }

        if (phpPath === 'admin/activity-log/undo.php') {
            const { logId } = data as { logId: string };
            const logEntryIndex = mockActivityLog.findIndex(entry => entry.id === logId);

            if (logEntryIndex === -1 || !mockActivityLog[logEntryIndex].canUndo) {
                throw new Error("Action cannot be undone or log not found.");
            }
            const logEntry = mockActivityLog[logEntryIndex];
            let undoSuccess = false;

            // Refined Undo Logic
            if (logEntry.action === "Added Student" && logEntry.targetType === "student" && logEntry.originalData) {
                const studentIdToUndo = logEntry.targetId as number;
                const studentDataToUndo = logEntry.originalData as Student;
                mockStudents = mockStudents.filter(s => s.id !== studentIdToUndo);
                const sectionToUpdate = mockSections.find(s => s.id === studentDataToUndo.section);
                if (sectionToUpdate) {
                    sectionToUpdate.studentCount = mockStudents.filter(s => s.section === studentDataToUndo.section).length;
                }
                logActivity("Undid: Added Student", `Reverted addition of ${studentDataToUndo.firstName} ${studentDataToUndo.lastName}`, "Admin");
                undoSuccess = true;
            } else if (logEntry.action === "Deleted Student" && logEntry.targetType === "student" && logEntry.originalData) {
                const studentDataToRestore = logEntry.originalData as Student;
                if (!mockStudents.some(s => s.id === studentDataToRestore.id)) mockStudents.push(studentDataToRestore);
                const sectionToUpdate = mockSections.find(s => s.id === studentDataToRestore.section);
                if (sectionToUpdate) {
                    sectionToUpdate.studentCount = mockStudents.filter(s => s.section === studentDataToRestore.section).length;
                }
                logActivity("Undid: Deleted Student", `Restored ${studentDataToRestore.firstName} ${studentDataToRestore.lastName}`, "Admin");
                undoSuccess = true;
            } else if (logEntry.action === "Added Faculty" && logEntry.targetType === "faculty" && logEntry.originalData) {
                const facultyData = logEntry.originalData as Faculty;
                mockFaculty = mockFaculty.filter(f => f.id !== facultyData.id);
                 if (facultyData.department === 'Administrative') {
                     mockApiAdmins = mockApiAdmins.filter(a => a.id !== facultyData.id);
                 }
                 logActivity("Undid: Added Faculty", `Reverted addition of ${facultyData.firstName} ${facultyData.lastName}`, "Admin");
                 undoSuccess = true;
            } else if (logEntry.action === "Deleted Faculty" && logEntry.targetType === "faculty" && logEntry.originalData) {
                const facultyData = logEntry.originalData as Faculty;
                if (!mockFaculty.some(f => f.id === facultyData.id)) mockFaculty.push(facultyData);
                 if (facultyData.department === 'Administrative') {
                     // Check if admin entry exists before pushing to avoid duplicates if logic changes
                     if(!mockApiAdmins.some(a => a.id === facultyData.id)) {
                        mockApiAdmins.push({
                            id: facultyData.id, username: facultyData.username, firstName: facultyData.firstName,
                            lastName: facultyData.lastName, email: facultyData.email, role: 'Sub Admin', isSuperAdmin: false
                        });
                     }
                 }
                logActivity("Undid: Deleted Faculty", `Restored ${facultyData.firstName} ${facultyData.lastName}`, "Admin");
                undoSuccess = true;
            } else if (logEntry.action === "Removed Admin Role" && logEntry.targetType === "admin" && logEntry.originalData) {
                const adminData = logEntry.originalData as AdminUser; // This is the AdminUser object
                const facultyMember = mockFaculty.find(f => f.id === adminData.id);
                if (facultyMember) { // If it was a faculty-derived admin
                    facultyMember.department = 'Administrative'; // Restore department
                    // Ensure the admin entry is back in mockApiAdmins if it was removed
                    if (!mockApiAdmins.some(a => a.id === adminData.id)) {
                        mockApiAdmins.push(adminData); // Add back the AdminUser object
                    }
                    logActivity("Undid: Removed Admin Role", `Restored admin role for ${adminData.username}`, "Admin");
                    undoSuccess = true;
                } else { // This case might be for non-faculty admins if that was a concept, currently all sub-admins are faculty.
                     console.warn("Cannot undo admin role removal: Corresponding faculty record not found or it was not a faculty-derived admin.");
                     // For now, we won't restore if not faculty based, as the system primarily uses faculty for sub-admins
                }
            } else {
                 throw new Error("Undo for this action type is not fully implemented in mock.");
            }

            if (undoSuccess) {
                recalculateDashboardStats(); // Recalculate stats after undo
                mockActivityLog = mockActivityLog.filter(entry => entry.id !== logId); // Remove the "undo" log itself if it was added, or the original log
                return { success: true, message: "Action undone." } as ResponseData;
            } else {
                throw new Error("Undo operation failed or was not applicable.");
            }
        }
        if (phpPath === 'sections/create.php') { // This endpoint might not be used if sections are auto-created.
            const newSectionData = data as Partial<Section>;
            const { programId, yearLevel, sectionCode: providedSectionCode } = newSectionData;

            if (!programId || !yearLevel) {
                throw new Error("Program ID and Year Level are required to create a section.");
            }

            const sectionCode = providedSectionCode || generateSectionCode(
                programId,
                yearLevel,
                mockSections.filter(s => s.programId === programId && s.yearLevel === yearLevel).length
            );

            if (mockSections.some(s => s.id === sectionCode)) {
                 throw new Error(`Section with code ${sectionCode} already exists.`);
            }

            const newSection: Section = {
                id: sectionCode,
                sectionCode: sectionCode,
                programId: programId,
                yearLevel: yearLevel,
                programName: mockApiPrograms.find(p => p.id === programId)?.name,
                adviserId: newSectionData.adviserId,
                adviserName: newSectionData.adviserId ? mockFaculty.find(f => f.id === newSectionData.adviserId)?.firstName + " " + mockFaculty.find(f => f.id === newSectionData.adviserId)?.lastName : undefined,
                studentCount: 0,
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
         throw error;
    }
};

const mockPutData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
     const phpPath = finalMockPath(path);
    console.log(`MOCK putData to: ${phpPath}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const idStr = phpPath.split('/').pop() || '';

    try {
         if (phpPath.startsWith('students/update.php/')) {
            const id = parseInt(idStr, 10);
            const studentIndex = mockStudents.findIndex(s => s.id === id);
            if (studentIndex > -1) {
                const oldStudentData = { ...mockStudents[studentIndex] };
                const updatedStudentData = data as unknown as Partial<Student>;
                mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...updatedStudentData };
                
                // If section changed due to program/year update, adjust counts
                if (oldStudentData.section !== mockStudents[studentIndex].section) {
                    const oldSectionToUpdate = mockSections.find(s => s.id === oldStudentData.section);
                    if (oldSectionToUpdate) {
                         oldSectionToUpdate.studentCount = mockStudents.filter(s => s.section === oldStudentData.section).length;
                    }
                    const newSectionToUpdate = mockSections.find(s => s.id === mockStudents[studentIndex].section);
                     if (newSectionToUpdate) {
                         newSectionToUpdate.studentCount = mockStudents.filter(s => s.section === mockStudents[studentIndex].section).length;
                    } else { // If new section doesn't exist, create it (should be rare if sectioning logic is robust on create)
                         const progId = mockStudents[studentIndex].program;
                         const yrLvl = mockStudents[studentIndex].year;
                         if (progId && yrLvl) {
                             const newSec: Section = {
                                id: mockStudents[studentIndex].section,
                                sectionCode: mockStudents[studentIndex].section,
                                programId: progId,
                                yearLevel: yrLvl,
                                programName: mockApiPrograms.find(p=>p.id === progId)?.name,
                                studentCount: 1,
                             };
                             mockSections.push(newSec);
                         }
                    }
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

                // Update admin list if department changed
                const adminIndex = mockApiAdmins.findIndex(a => a.id === updatedFaculty.id && !a.isSuperAdmin);
                if (updatedFaculty.department === 'Administrative') {
                    const adminEntry: AdminUser = {
                        id: updatedFaculty.id, username: updatedFaculty.username, firstName: updatedFaculty.firstName,
                        lastName: updatedFaculty.lastName, email: updatedFaculty.email, role: 'Sub Admin', isSuperAdmin: false
                    };
                    if (adminIndex > -1) mockApiAdmins[adminIndex] = adminEntry;
                    else if (!mockApiAdmins.some(a => a.id === updatedFaculty.id)) mockApiAdmins.push(adminEntry);
                } else if (oldDepartment === 'Administrative' && updatedFaculty.department !== 'Administrative') {
                    if (adminIndex > -1) mockApiAdmins.splice(adminIndex, 1);
                }

                logActivity("Updated Faculty", `${updatedFaculty.firstName} ${updatedFaculty.lastName}`, "Admin", id, "faculty");
                recalculateDashboardStats();
                return { ...updatedFaculty } as ResponseData;
            }
            throw new Error("Faculty not found for mock update.");
        }
         if (phpPath === 'student/profile/update.php') {
            const profileData = data as Student; // Assuming payload matches Student structure for editable fields
            const studentUser = mockTestUsers.find(u => u.username === "s1001") // Example student user for mock
            const studentId = studentUser?.userId;
            const index = mockStudents.findIndex(s => s.id === studentId);
            if (index > -1) {
                // Merge editable fields, keep non-editable fields from original
                mockStudents[index] = {
                    ...mockStudents[index], // original data
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
             const profileData = data as Faculty; // Assuming payload matches Faculty structure for editable fields
             const teacherUser = mockTestUsers.find(u => u.username === "t1001"); // Example teacher user
            const teacherId = teacherUser?.userId;
             const index = mockFaculty.findIndex(t => t.id === teacherId);
             if (index > -1) {
                 mockFaculty[index] = { 
                    ...mockFaculty[index], // original data
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    middleName: profileData.middleName,
                    suffix: profileData.suffix,
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
          if (phpPath.startsWith('programs/update.php/')) { // Update program details and its courses
             const programId = idStr;
             const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1) {
                 const updatedData = data as unknown as ProgramType; // Expect full ProgramType structure
                // Update program details
                 mockApiPrograms[programIndex].name = updatedData.name ?? mockApiPrograms[programIndex].name;
                 mockApiPrograms[programIndex].description = updatedData.description ?? mockApiPrograms[programIndex].description;
                // Update courses for each year level
                if (updatedData.courses) {
                    (Object.keys(updatedData.courses) as YearLevel[]).forEach(year => {
                        if (updatedData.courses[year]) {
                            mockApiPrograms[programIndex].courses[year] = updatedData.courses[year].map(c => {
                                // Add/update course in global mockCourses if necessary
                                const globalCourseIndex = mockCourses.findIndex(gc => gc.id === c.id);
                                if (globalCourseIndex > -1) mockCourses[globalCourseIndex] = {...mockCourses[globalCourseIndex], ...c};
                                else mockCourses.push(c);
                                return c;
                            });
                        }
                    });
                }
                 logActivity("Updated Program", mockApiPrograms[programIndex].name, "Admin", programId, "program");
                 return { ...mockApiPrograms[programIndex] } as ResponseData;
             }
             throw new Error("Program not found for mock update.");
          }
          if (phpPath.startsWith('courses/update.php/')) { // Update a system course
              const courseId = idStr;
              const courseIndex = mockCourses.findIndex(c => c.id === courseId);
              if (courseIndex > -1) {
                   const updatedCourseData = data as Partial<Course>;
                   mockCourses[courseIndex] = {
                       ...mockCourses[courseIndex],
                       ...updatedCourseData,
                       // Ensure programId is array if type is Major, empty if Minor
                       programId: updatedCourseData.type === 'Major' ? (updatedCourseData.programId || []) : [],
                    };
                    // Reflect this change in any program that has this course assigned
                    mockApiPrograms.forEach(program => {
                         Object.keys(program.courses).forEach(year => {
                             const yr = year as YearLevel;
                             const assignedIndex = program.courses[yr].findIndex(c => c.id === courseId);
                             if (assignedIndex > -1) {
                                 // Update with the new course details from mockCourses
                                 program.courses[yr][assignedIndex] = { ...mockCourses[courseIndex] };
                             }
                         });
                    });
                    logActivity("Updated Course", mockCourses[courseIndex].name, "Admin", courseId, "course");
                   return { ...mockCourses[courseIndex] } as ResponseData;
              }
              throw new Error("Course not found for mock update.");
          }
          if (phpPath.startsWith('sections/update.php/')) { // Update section's program/year (adviser handled separately)
            const sectionIdToUpdate = idStr;
            const sectionIndex = mockSections.findIndex(s => s.id === sectionIdToUpdate);
            if (sectionIndex > -1) {
                const updatedSectionData = data as Partial<Section>; // Expecting { programId, yearLevel }
                mockSections[sectionIndex] = {
                    ...mockSections[sectionIndex],
                    programId: updatedSectionData.programId ?? mockSections[sectionIndex].programId,
                    yearLevel: updatedSectionData.yearLevel ?? mockSections[sectionIndex].yearLevel,
                    // programName should be updated based on new programId
                    programName: mockApiPrograms.find(p => p.id === (updatedSectionData.programId ?? mockSections[sectionIndex].programId))?.name,
                    // Student count and adviser are not updated here
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
    const idPart = phpPath.split('/').pop() || '';

    try {
         if (phpPath.startsWith('students/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const studentIndex = mockStudents.findIndex(s => s.id === id);
            if (studentIndex === -1) throw new Error("Student not found for mock delete.");
            const deletedStudent = { ...mockStudents[studentIndex] }; // Store for logging
            mockStudents.splice(studentIndex, 1);
            // Adjust student count in section
            const sectionToUpdate = mockSections.find(s => s.id === deletedStudent.section);
            if (sectionToUpdate) {
                 sectionToUpdate.studentCount = mockStudents.filter(s => s.section === deletedStudent.section).length;
                 // Optionally, if section becomes empty and sections are only created if students exist:
                 // if (sectionToUpdate.studentCount === 0) {
                 //     mockSections = mockSections.filter(s => s.id !== sectionToUpdate.id);
                 //     logActivity("Auto-Removed Section", `Section ${sectionToUpdate.sectionCode} removed as it became empty.`, "System");
                 // }
            }
            logActivity("Deleted Student", `${deletedStudent.firstName} ${deletedStudent.lastName} (${deletedStudent.username})`, "Admin", id, "student", true, deletedStudent); // Add undo data
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('teachers/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const facultyIndex = mockFaculty.findIndex(t => t.id === id);
            if (facultyIndex === -1) throw new Error("Faculty not found for mock delete.");
            const deletedFaculty = { ...mockFaculty[facultyIndex] };
            mockFaculty.splice(facultyIndex, 1);
            // If deleted faculty was an admin, remove from admin list
            if (deletedFaculty.department === 'Administrative') {
                 mockApiAdmins = mockApiAdmins.filter(a => a.id !== id || a.isSuperAdmin); // Keep super admin
            }
            // Also remove any section adviser assignments and course-teacher assignments
            mockSections.forEach(sec => { if(sec.adviserId === id) { sec.adviserId = undefined; sec.adviserName = undefined;} });
            mockSectionAssignments = mockSectionAssignments.filter(assign => assign.teacherId !== id);

            logActivity("Deleted Faculty", `${deletedFaculty.firstName} ${deletedFaculty.lastName} (${deletedFaculty.username})`, "Admin", id, "faculty", true, deletedFaculty);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('admins/delete.php/')) { // Delete an admin role
            const adminIdToRemove = parseInt(idPart || '0', 10);
            if (adminIdToRemove === 0) throw new Error("Cannot remove Super Admin role."); // Super admin cannot be deleted

            const adminUser = mockApiAdmins.find(a => a.id === adminIdToRemove);
            if (!adminUser) throw new Error("Admin role not found for mock removal.");

            const facultyMember = mockFaculty.find(f => f.id === adminIdToRemove);
            if (facultyMember && facultyMember.department === 'Administrative') {
                // If it's a faculty member who is an admin, change their department rather than deleting faculty record
                facultyMember.department = 'Teaching'; // or some other default, or prompt admin
                logActivity("Removed Admin Role", `For ${adminUser.username}. Faculty department changed to Teaching.`, "Admin", adminIdToRemove, "admin", true, {...adminUser, originalDepartment: 'Administrative'});
            }
             // Always remove from mockApiAdmins list (if not super admin)
             mockApiAdmins = mockApiAdmins.filter(a => a.id !== adminIdToRemove);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('announcements/delete.php/')) {
             const id = idPart;
             const annIndex = mockAnnouncements.findIndex(a => a.id === id);
             if (annIndex === -1) throw new Error("Announcement not found for mock delete.");
             const deletedAnnouncement = { ...mockAnnouncements[annIndex] };
             mockAnnouncements.splice(annIndex, 1);
             logActivity("Deleted Announcement", deletedAnnouncement.title, "Admin", id, "announcement");
             return;
         }
         if (phpPath.startsWith('assignments/delete.php/')) { // Delete a section-subject-teacher assignment
             const id = idPart; // This ID is sectionId-subjectId
             const assignIndex = mockSectionAssignments.findIndex(a => a.id === id);
             if (assignIndex === -1) throw new Error("Section-Course assignment not found for mock delete.");
             const deletedAssignment = { ...mockSectionAssignments[assignIndex] };
             mockSectionAssignments.splice(assignIndex, 1);
             logActivity("Deleted Section-Course Assignment", `Course ${deletedAssignment.subjectName} from section ${deletedAssignment.sectionId}`, "Admin");
             return;
         }
         if (phpPath.startsWith('programs/delete.php/')) { // Delete a program
             const programId = idPart;
             const progIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (progIndex === -1) throw new Error("Program not found for mock delete.");
             const deletedProgram = { ...mockApiPrograms[progIndex] };
             mockApiPrograms.splice(progIndex, 1);

             // Remove this program from any Major course's programId list
             mockCourses = mockCourses.map(c => {
                 if (c.type === 'Major' && c.programId?.includes(programId)) {
                     const updatedProgramIds = c.programId.filter(pid => pid !== programId);
                     return { ...c, programId: updatedProgramIds };
                 }
                 return c;
             });
             // Remove sections associated with this program
             mockSections = mockSections.filter(s => s.programId !== programId);
             // Remove section-subject assignments related to deleted sections
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

             // Remove this course from all program assignments
             mockApiPrograms.forEach(program => {
                 Object.keys(program.courses).forEach(year => {
                      const yr = year as YearLevel;
                      program.courses[yr] = program.courses[yr].filter(c => c.id !== courseId);
                 });
             });
             // Remove from section-subject assignments
             mockSectionAssignments = mockSectionAssignments.filter(a => a.subjectId !== courseId);
             logActivity("Deleted Course", deletedCourse.name, "Admin", courseId, "course");
             return;
          }
          if (phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/)) { // Remove course from program/year
             const [, programId, yearLevelEncoded, courseId] = phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/) || [];
             const yearLevel = decodeURIComponent(yearLevelEncoded) as YearLevel; // Handle spaces in year level
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
           if (phpPath.startsWith('sections/delete.php/')) { // Delete a section
            const sectionIdToDelete = idPart;
            const sectionIndex = mockSections.findIndex(s => s.id === sectionIdToDelete);
            if (sectionIndex === -1) throw new Error("Section not found for mock delete.");
            const deletedSection = { ...mockSections[sectionIndex] };

            // Check if students are enrolled
            const studentsInSec = mockStudents.filter(s => s.section === sectionIdToDelete).length;
            if (studentsInSec > 0) {
                throw new Error(`Cannot delete section ${deletedSection.sectionCode}. It has ${studentsInSec} student(s). Please reassign students first.`);
            }

            mockSections.splice(sectionIndex, 1);
            // Also remove related section_subject_assignments
            mockSectionAssignments = mockSectionAssignments.filter(sa => sa.sectionId !== sectionIdToDelete);

            logActivity("Deleted Section", `Section ${deletedSection.sectionCode}`, "Admin", sectionIdToDelete, "section");
            return;
        }

        console.warn(`Mock API unhandled DELETE path: ${phpPath}`);
        throw new Error(`Mock DELETE endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
         console.error(`Error in mock deleteData for ${phpPath}:`, error);
         throw error;
    }
};

// Exported API functions
export const fetchData = async <T>(path: string): Promise<T> => {
    if (USE_MOCK_API) return mockFetchData(path);

    const url = getApiUrl(path);
    let response: Response;
    try {
        response = await fetch(url, { method: 'GET' });
    } catch (networkError: any) {
        return handleFetchError(networkError, path, 'GET', true);
    }

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
        let responseBodyText = "";
        try {
            responseBodyText = await response.text();
            console.error("API Error Response Text (fetchData):", responseBodyText);
            try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
            } catch (jsonParseError) {
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
            }
        } catch (readError) {
            console.error("Failed to read error response body (fetchData):", readError);
             errorData = { message: `HTTP error! status: ${response.status}. Failed to read error body.` };
             errorMessage = errorData.message;
        }
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'GET');
    }

    try {
        return await response.json() as T;
    } catch (jsonError: any) {
        console.error("Failed to parse JSON response (fetchData):", jsonError);
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

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
        let responseBodyText = "";
        try {
            responseBodyText = await response.text(); 
            console.error("API Error Response Text (postData):", responseBodyText);
            try {
                 errorData = JSON.parse(responseBodyText); 
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
            } catch (jsonParseError) {
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
            }
        } catch (readError) {
            console.error("Failed to read error response body (postData):", readError);
             errorData = { message: `HTTP error! status: ${response.status}. Failed to read error body.` };
             errorMessage = errorData.message;
        }
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'POST');
    }
    
    if (response.status === 201 || response.status === 200) {
       try {
           const contentType = response.headers.get("content-type");
           if (contentType && contentType.indexOf("application/json") !== -1) {
                return await response.json() as ResponseData;
           } else {
               console.log(`POST to ${url} successful with status ${response.status}, but no JSON body.`);
               return { success: true, message: `Operation successful (Status ${response.status})` } as unknown as ResponseData;
           }
       } catch (jsonError: any) {
           console.error("Failed to parse JSON response on successful POST:", jsonError);
           return { success: true, message: "Operation successful, but response body could not be parsed." } as unknown as ResponseData;
       }
    }

    console.warn(`Unexpected successful status code ${response.status} for POST ${url}`);
    return { success: true, message: `Operation completed with status ${response.status}.` } as unknown as ResponseData;
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

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
        let responseBodyText = "";
         try {
             responseBodyText = await response.text();
             console.error("API Error Response Text (putData):", responseBodyText);
             try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
             } catch (jsonParseError) {
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
             }
         } catch (readError) {
             console.error("Failed to read error response body (putData):", readError);
             errorData = { message: `HTTP error! status: ${response.status}. Failed to read error body.` };
             errorMessage = errorData.message;
         }
         handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'PUT');
    }

     try {
         const contentType = response.headers.get("content-type");
         if (contentType && contentType.indexOf("application/json") !== -1) {
             return await response.json() as ResponseData;
         } else {
             console.log(`PUT to ${url} successful with status ${response.status}, but no JSON body.`);
             return { success: true, message: `Update successful (Status ${response.status})` } as unknown as ResponseData;
         }
     } catch (jsonError: any) {
         console.error("Failed to parse JSON response on successful PUT:", jsonError);
         return { success: true, message: "Update successful, but response body could not be parsed." } as unknown as ResponseData;
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

    if (!response.ok && response.status !== 204) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
        let responseBodyText = "";
         try {
             responseBodyText = await response.text();
             console.error("API Error Response Text (deleteData):", responseBodyText);
             try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
             } catch (jsonParseError) {
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
             }
         } catch (readError) {
             console.error("Failed to read error response body (deleteData):", readError);
             errorData = { message: `HTTP error! status: ${response.status}. Failed to read error body.` };
             errorMessage = errorData.message;
         }
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'DELETE');
    }
    
    if (response.status === 204) {
        console.log(`DELETE ${url} successful with status 204 No Content.`);
        return; 
    }

     try {
         const contentType = response.headers.get("content-type");
         if (contentType && contentType.indexOf("application/json") !== -1) {
             const jsonData = await response.json();
             console.log(`DELETE ${url} successful with status ${response.status}. Response data:`, jsonData);
         } else {
             const text = await response.text();
             console.log(`DELETE ${url} successful with status ${response.status}. Response text:`, text || "(No text body)");
         }
     } catch (error: any) {
         console.error("Failed to process body on successful DELETE:", error);
     }
};

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

export { mockApiPrograms, mockCourses, mockStudents, mockFaculty, mockSections, mockAnnouncements, mockSectionAssignments };

