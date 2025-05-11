
'use client';

import type { Student, Faculty, Section, Course, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole, CourseType, YearLevel, ActivityLogEntry, EmploymentType, EnrollmentType } from '@/types';
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateAdminUsername, generateTeacherUsername, generateStudentId as generateFrontendStudentId } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

let nextStudentDbId = 3;
let nextFacultyDbId = 4;
let nextProgramDbId = 3;
let nextCourseDbId = 10;
let nextActivityLogId = 1;

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
    { id: mockFaculty[1].id, username: mockFaculty[1].username, firstName: mockFaculty[1].firstName, lastName: mockFaculty[1].lastName, email: mockFaculty[1].email, role: "Sub Admin", isSuperAdmin: false },
    { id: 1001, username: generateAdminUsername(generateTeacherId()), firstName: "Test", lastName: "SubAdmin", email: "test.sub@example.com", role: "Sub Admin", isSuperAdmin: false },
];

let mockActivityLog: ActivityLogEntry[] = [
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
        id: `log${nextActivityLogId++}`,
        timestamp: new Date(),
        user,
        action,
        description,
        targetId,
        targetType,
        canUndo,
        originalData
    };
    mockActivityLog.unshift(newLogEntry);
    if (mockActivityLog.length > 50) {
        mockActivityLog.pop();
    }
};

let mockDashboardStatsGlobal: DashboardStats = {} as DashboardStats;

const recalculateDashboardStats = () => {
    const teachingStaffCount = mockFaculty.filter(f => f.department === 'Teaching').length;
    const adminStaffCount = mockFaculty.filter(f => f.department === 'Administrative').length;
    const explicitSubAdminCount = mockApiAdmins.filter(a => a.id !== 0 && !mockFaculty.some(f => f.id === a.id && f.department === 'Administrative')).length;


    mockDashboardStatsGlobal = {
        totalStudents: mockStudents.length,
        totalFaculty: mockFaculty.length, 
        totalAdmins: adminStaffCount + explicitSubAdminCount, 
        upcomingEvents: mockAnnouncements.filter(a => a.date > new Date()).length,
    };
};
recalculateDashboardStats();

let mockTestUsers = [
    { username: "admin", password: "defadmin", role: "Admin" as const, userId: 0 },
    { username: mockStudents[0].username, password: "password", role: "Student" as const, userId: mockStudents[0].id },
    { username: mockStudents[1].username, password: "password", role: "Student" as const, userId: mockStudents[1].id },
    { username: mockFaculty[0].username, password: "password", role: "Teacher" as const, userId: mockFaculty[0].id },
    { username: mockFaculty[1].username, password: "password", role: "Teacher" as const, userId: mockFaculty[1].id },
    { username: mockApiAdmins.find(a=> a.id === 1001)!.username, password: "password", role: "Admin" as const, userId: 1001 },
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
                    username: f.username,
                    firstName: f.firstName,
                    lastName: f.lastName,
                    email: f.email,
                    role: 'Sub Admin',
                    isSuperAdmin: false,
                }));

            let allAdmins: AdminUser[] = [];
            if(superAdmin) allAdmins.push(superAdmin);
            allAdmins = [...allAdmins, ...facultyAdmins];

            mockApiAdmins.forEach(explicitAdmin => {
                if (!explicitAdmin.isSuperAdmin && !facultyAdmins.some(fa => fa.id === explicitAdmin.id)) {
                    allAdmins.push(explicitAdmin);
                }
            });

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
                     return [singleSection] as unknown as T; // Return as array for consistency if API does
                 }
                 return [] as unknown as T; // Or throw error if not found
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
                (ann.author_type === 'Teacher' && ann.author === String(teacherId))
            ).sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'admin/dashboard-stats.php') {
            recalculateDashboardStats();
            return { ...mockDashboardStatsGlobal } as T;
        }
         if (phpPath.startsWith('sections/assignments/read.php')) {
            const sectionIdMatch = phpPath.match(/sectionId=([^&]+)/);
            const allMatch = phpPath.match(/all=true/);

            if (allMatch) {
                 return mockSectionAssignments.map(a => ({
                    ...a,
                    subjectName: mockCourses.find(s => s.id === a.subjectId)?.name || a.subjectId,
                    teacherName: mockFaculty.find(t => t.id === a.teacherId)?.firstName + ' ' + mockFaculty.find(t => t.id === a.teacherId)?.lastName || `Faculty ID ${a.teacherId}`,
                })) as T;
            } else if (sectionIdMatch) {
                const sectionId = sectionIdMatch[1];
                 return mockSectionAssignments.filter(a => a.sectionId === sectionId).map(a => ({
                    ...a,
                    subjectName: mockCourses.find(s => s.id === a.subjectId)?.name || a.subjectId,
                    teacherName: mockFaculty.find(t => t.id === a.teacherId)?.firstName + ' ' + mockFaculty.find(t => t.id === a.teacherId)?.lastName || `Faculty ID ${a.teacherId}`,
                })) as T;
            }
             return mockSectionAssignments.map(a => ({
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
                    id: g.subjectId,
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
            const teacherUser = mockTestUsers.find(u => u.username === "t1001");
            const teacherId = teacherUser?.userId;

             return mockStudentSubjectAssignmentsWithGrades.filter(g => {
                 const assignment = mockSectionAssignments.find(a => a.subjectId === g.subjectId && g.section === a.sectionId);
                 return assignment?.teacherId === teacherId;
             }) as T;
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
                        teacher: assign.teacherName
                     });
                });
             return schedule as T;
        }
         if (phpPath === 'teacher/schedule/read.php') {
            const teacherUser = mockTestUsers.find(u => u.username === "t1001");
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
         if (phpPath === 'teacher/subjects/read.php') {
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
            }
             upcoming.push({ id: "assign-mock1", title: "Submit CS101 Homework", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), type: "assignment" });
             upcoming.push({ id: "event-mock1", title: "Department Meeting", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), type: "event" });

             return upcoming.slice(0, 5) as T;
         }
         if (phpPath === 'admin/activity-log/read.php') {
            return [...mockActivityLog].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10) as T;
        }
         if (phpPath.startsWith('sections/read.php/')) {
            const sectionId = phpPath.split('/').pop();
            const section = mockSections.find(s => s.id === sectionId);
             if (section) {
                 const program = mockApiPrograms.find(p => p.id === section.programId);
                 const adviser = mockFaculty.find(f => f.id === section.adviserId);
                 return {
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
             const { username, password } = data as any;
            let user = mockTestUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

            if (!user && (username.toLowerCase() === "admin" || username.toLowerCase() === "s1001" || username.toLowerCase() === "t1001")) {
                 if (username.toLowerCase() === "admin") user = { username: "admin", password: "defadmin", role: "Admin", userId: 0 };
                 else if (username.toLowerCase() === "s1001") user = { username: "s1001", password: "password", role: "Student", userId: 1 };
                 else if (username.toLowerCase() === "t1001") user = { username: "t1001", password: "password", role: "Teacher", userId: 1 };
            }

             if (user && user.password === password) { // Password check
                const redirectPath = user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Student' ? '/student/dashboard' : '/teacher/dashboard';
                if (typeof window !== 'undefined') {
                    localStorage.setItem('userRole', user.role);
                    localStorage.setItem('userId', String(user.userId));
                }
                if (user.role === 'Student') {
                    const studentIndex = mockStudents.findIndex(s => s.id === user.userId);
                    if (studentIndex > -1) mockStudents[studentIndex].lastAccessed = new Date().toISOString();
                } else if (user.role === 'Teacher') {
                    const facultyIndex = mockFaculty.findIndex(f => f.id === user.userId);
                    if (facultyIndex > -1) mockFaculty[facultyIndex].lastAccessed = new Date().toISOString();
                } else if (user.role === 'Admin' && user.userId !== 0) {
                    const facultyAdmin = mockFaculty.find(f => f.id === user.userId && f.department === 'Administrative');
                    if (facultyAdmin) {
                         const facultyIndex = mockFaculty.findIndex(f => f.id === user.userId);
                         if (facultyIndex > -1) mockFaculty[facultyIndex].lastAccessed = new Date().toISOString();
                    }
                }

                logActivity("User Login", `${user.username} logged in.`, user.username, user.userId, user.role.toLowerCase() as ActivityLogEntry['targetType']);
                return { success: true, role: user.role as any, redirectPath: redirectPath, userId: user.userId } as ResponseData;
             }
             throw new Error("Invalid mock credentials.");
        }
         if (phpPath === 'students/create.php') {
            const newStudentData = data as unknown as Omit<Student, 'id' | 'studentId' | 'section' | 'username' | 'lastAccessed'>;

            const studentProgramId = newStudentData.program;
            const studentEnrollmentType = newStudentData.enrollmentType;
            let studentYearLevel = newStudentData.year;

            if (studentEnrollmentType === 'New') {
                studentYearLevel = '1st Year';
            } else if (!studentYearLevel && (studentEnrollmentType === 'Transferee' || studentEnrollmentType === 'Returnee')) {
                 throw new Error("Year level is required for Transferee or Returnee enrollment type.");
            }
            if (!studentProgramId || !studentYearLevel) {
                throw new Error("Program and Year Level are required to assign a section.");
            }

            let assignedSectionCode: string | undefined = undefined;
            let relevantSections = mockSections
                .filter(s => s.programId === studentProgramId && s.yearLevel === studentYearLevel)
                .sort((a, b) => a.sectionCode.localeCompare(b.sectionCode));

            for (const section of relevantSections) {
                const count = mockStudents.filter(st => st.section === section.id).length;
                if (count < 30) {
                    assignedSectionCode = section.id;
                    break;
                }
            }

            if (!assignedSectionCode) {
                const existingSectionCountForProgramAndYear = relevantSections.length;
                assignedSectionCode = generateSectionCode(studentProgramId, studentYearLevel, existingSectionCountForProgramAndYear);

                if (!mockSections.some(s => s.id === assignedSectionCode)) {
                    const program = mockApiPrograms.find(p => p.id === studentProgramId);
                    const newSection: Section = {
                        id: assignedSectionCode,
                        sectionCode: assignedSectionCode,
                        programId: studentProgramId,
                        programName: program?.name || studentProgramId,
                        yearLevel: studentYearLevel,
                        studentCount: 0,
                    };
                    mockSections.push(newSection);
                    logActivity("Auto-Added Section", `Section ${assignedSectionCode} for ${studentProgramId} - ${studentYearLevel} due to enrollment.`, "System", assignedSectionCode, "section");
                }
            }

            const nextId = nextStudentDbId++;
            const studentId = generateFrontendStudentId();
            const username = generateStudentUsername(studentId);

            const student: Student = {
                ...newStudentData,
                id: nextId,
                studentId: studentId,
                username: username,
                section: assignedSectionCode,
                year: studentYearLevel,
                lastAccessed: null,
            };
            mockStudents.push(student);

            const sectionToUpdate = mockSections.find(s => s.id === assignedSectionCode);
            if (sectionToUpdate) {
                sectionToUpdate.studentCount = (sectionToUpdate.studentCount || 0) + 1;
            }

            logActivity("Added Student", `${student.firstName} ${student.lastName} (${student.username})`, "Admin", student.id, "student", true, { ...student, passwordHash: "mock_hash" });
            recalculateDashboardStats();
            return student as ResponseData;
        }
         if (phpPath === 'teachers/create.php') {
            const newFacultyData = data as unknown as Omit<Faculty, 'id' | 'facultyId' | 'username' | 'lastAccessed'>;
            const nextId = nextFacultyDbId++;
            const facultyId = generateTeacherId();
            const department = newFacultyData.department || 'Teaching';
            const username = generateTeacherUsername(facultyId, department);

            const faculty: Faculty = {
                ...newFacultyData,
                id: nextId,
                facultyId: facultyId,
                username: username,
                lastAccessed: null,
            };
            mockFaculty.push(faculty);
            if (faculty.department === 'Administrative') {
                const existingAdmin = mockApiAdmins.find(a => a.id === faculty.id);
                if (!existingAdmin) {
                     mockApiAdmins.push({
                        id: faculty.id,
                        username: faculty.username,
                        firstName: faculty.firstName,
                        lastName: faculty.lastName,
                        email: faculty.email,
                        role: 'Sub Admin',
                        isSuperAdmin: false,
                    });
                }
            }
            logActivity("Added Faculty", `${faculty.firstName} ${faculty.lastName} (${faculty.username})`, "Admin", faculty.id, "faculty", true, { ...faculty, passwordHash: "mock_hash" });
            recalculateDashboardStats();
            return faculty as ResponseData;
        }
         if (phpPath === 'programs/create.php') {
             const newProgramData = data as unknown as Program;
             const newProgram: ProgramType = {
                 id: newProgramData.id || newProgramData.name.toUpperCase().substring(0, 3) + Date.now().toString().slice(-3),
                 name: newProgramData.name,
                 description: newProgramData.description,
                 courses: newProgramData.courses || { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] },
             };
             if (mockApiPrograms.some(p => p.id === newProgram.id)) {
                 throw new Error("Program with this ID already exists.");
             }
             Object.values(newProgram.courses).flat().forEach(course => {
                 if (!mockCourses.some(c => c.id === course.id)) {
                     mockCourses.push({ ...course, programId: course.type === 'Major' ? (course.programId || [newProgram.id]) : [] });
                 }
             });
             mockApiPrograms.push(newProgram);
             logActivity("Added Program", newProgram.name, "Admin", newProgram.id, "program");

                const firstYearSections = mockSections.filter(s => s.programId === newProgram.id && s.yearLevel === "1st Year");
                if (firstYearSections.length === 0) {
                    const sectionCode = generateSectionCode(newProgram.id, "1st Year", 0);
                    const autoSection: Section = {
                        id: sectionCode,
                        sectionCode: sectionCode,
                        programId: newProgram.id,
                        programName: newProgram.name,
                        yearLevel: "1st Year",
                        studentCount: 0,
                    };
                    mockSections.push(autoSection);
                    logActivity("Auto-Added Section", `Section ${sectionCode} for new program ${newProgram.name} - 1st Year.`, "System", sectionCode, "section");
                }

             return newProgram as ResponseData;
         }
         if (phpPath === 'courses/create.php') {
             const newCourseData = data as Course;
             const newCourse: Course = {
                 ...newCourseData,
                 id: newCourseData.id || `C${nextCourseDbId++}`,
                 programId: newCourseData.type === 'Major' ? (newCourseData.programId || []) : [],
             };
             if (mockCourses.some(c => c.id === newCourse.id)) {
                 throw new Error(`Course with ID ${newCourse.id} already exists.`);
             }
             mockCourses.push(newCourse);
             logActivity("Added Course", newCourse.name, "Admin", newCourse.id, "course");
             return newCourse as ResponseData;
         }
          if (phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)) {
              const programId = phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)?.[1];
              const { courseId, yearLevel } = data as { courseId: string, yearLevel: YearLevel };
              const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
              const course = mockCourses.find(c => c.id === courseId);

              if (programIndex === -1) throw new Error("Program not found.");
              if (!course) throw new Error("Course not found.");
               if (!mockApiPrograms[programIndex].courses[yearLevel]) {
                  mockApiPrograms[programIndex].courses[yearLevel] = [];
               }
                if (mockApiPrograms[programIndex].courses[yearLevel].some(c => c.id === courseId)) {
                    throw new Error(`Course ${course.name} is already assigned to ${programId} - ${yearLevel}.`);
                }
                if (course.type === 'Major' && (!course.programId || !course.programId.includes(programId))) {
                     throw new Error(`Major course ${course.name} does not belong to program ${programId} and cannot be assigned.`);
                }
                mockApiPrograms[programIndex].courses[yearLevel].push(course);
                logActivity("Assigned Course to Program", `${course.name} to ${mockApiPrograms[programIndex].name} (${yearLevel})`, "Admin");
                return { ...mockApiPrograms[programIndex] } as ResponseData;
         }

         if (phpPath === 'admin/reset_password.php') {
              const { userId, userType, lastName } = data as { userId: number; userType: string; lastName: string };
              let targetFullname: string = `ID ${userId}`;

              if (userType === 'student') {
                  const student = mockStudents.find(s => s.id === userId);
                  if (student) targetFullname = `${student.firstName} ${student.lastName}`;
                  else throw new Error(`Student with ID ${userId} not found.`);
                  logActivity(`Reset Student Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'teacher') {
                  const facultyMember = mockFaculty.find(f => f.id === userId);
                  if (facultyMember) targetFullname = `${facultyMember.firstName} ${facultyMember.lastName}`;
                  else throw new Error(`Faculty with ID ${userId} not found.`);
                   logActivity(`Reset Faculty Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'admin') {
                  const adminUser = mockApiAdmins.find(a => a.id === userId);
                  if (adminUser) {
                      if(adminUser.isSuperAdmin) throw new Error("Super Admin password must be changed via Settings.");
                      targetFullname = adminUser.firstName ? `${adminUser.firstName} ${adminUser.lastName}` : adminUser.username;
                      logActivity("Reset Admin Password", `For ${targetFullname} (${adminUser.username})`, "Admin");
                  } else {
                      throw new Error(`Admin user with ID ${userId} not found.`);
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
                date: new Date(),
                targetAudience: newAnnData.targetAudience || 'All',
                target: newAnnData.target,
                author: "Admin"
            };
            mockAnnouncements.unshift(newAnnouncement);
            logActivity("Created Announcement", newAnnData.title, "Admin", newAnnData.target.program || newAnnData.target.section || newAnnData.target.yearLevel || 'all', 'announcement');
            return newAnnouncement as ResponseData;
        }
         if (phpPath.match(/^sections\/adviser\/update\.php$/)) {
             const { sectionId, adviserId } = data as { sectionId: string, adviserId: number | null };
             const sectionIndex = mockSections.findIndex(s => s.id === sectionId);
             if (sectionIndex > -1) {
                 const adviser = mockFaculty.find(t => t.id === adviserId);
                 mockSections[sectionIndex].adviserId = adviserId ?? undefined;
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
             const assignmentId = `${sectionId}-${subjectId}`;
              if (mockSectionAssignments.some(a => a.id === assignmentId)) {
                   throw new Error("This course is already assigned to this section.");
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
         if (phpPath === 'assignments/grades/update.php') {
              const gradeData = data as StudentSubjectAssignmentWithGrades;
              const index = mockStudentSubjectAssignmentsWithGrades.findIndex(a => a.assignmentId === gradeData.assignmentId && a.studentId === gradeData.studentId);
              if (index > -1) {
                   mockStudentSubjectAssignmentsWithGrades[index] = {
                       ...mockStudentSubjectAssignmentsWithGrades[index],
                       ...gradeData
                   };
                   const updated = mockStudentSubjectAssignmentsWithGrades[index];
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (updated.prelimGrade !== null || updated.midtermGrade !== null || updated.finalGrade !== null) {
                        status = 'Incomplete';
                    }
                    if (updated.finalGrade !== null) {
                        status = 'Complete';
                    }
                    updated.status = status;
                    logActivity("Updated Grades", `For ${updated.studentName} in ${updated.subjectName}`, "Teacher");
                   return updated as ResponseData;
               } else {
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (gradeData.prelimGrade !== null || gradeData.midtermGrade !== null || gradeData.finalGrade !== null) {
                        status = 'Incomplete';
                    }
                    if (gradeData.finalGrade !== null) {
                        status = 'Complete';
                    }
                    const student = mockStudents.find(s => s.id === gradeData.studentId);
                    const subject = mockCourses.find(s => s.id === gradeData.subjectId);
                    const newEntry: StudentSubjectAssignmentWithGrades = {
                        ...gradeData,
                        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
                        subjectName: subject ? subject.name : 'Unknown',
                        section: mockStudents.find(s => s.id === gradeData.studentId)?.section || 'N/A',
                         year: mockStudents.find(s => s.id === gradeData.studentId)?.year || 'N/A',
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

            if (logEntry.action === "Added Student" && logEntry.targetType === "student" && logEntry.originalData) {
                const studentIdToUndo = logEntry.targetId as number;
                const studentDataToUndo = logEntry.originalData as Student;
                mockStudents = mockStudents.filter(s => s.id !== studentIdToUndo);
                const sectionToUpdate = mockSections.find(s => s.id === studentDataToUndo.section);
                if (sectionToUpdate && sectionToUpdate.studentCount && sectionToUpdate.studentCount > 0) {
                    sectionToUpdate.studentCount -= 1;
                }
                logActivity("Undid: Added Student", `Reverted addition of ${studentDataToUndo.firstName} ${studentDataToUndo.lastName}`, "Admin");
                undoSuccess = true;
            } else if (logEntry.action === "Deleted Student" && logEntry.targetType === "student" && logEntry.originalData) {
                const studentDataToRestore = logEntry.originalData as Student;
                mockStudents.push(studentDataToRestore);
                const sectionToUpdate = mockSections.find(s => s.id === studentDataToRestore.section);
                if (sectionToUpdate) {
                    sectionToUpdate.studentCount = (sectionToUpdate.studentCount || 0) + 1;
                }
                logActivity("Undid: Deleted Student", `Restored ${studentDataToRestore.firstName} ${studentDataToRestore.lastName}`, "Admin");
                undoSuccess = true;
            } else if (logEntry.action === "Added Faculty" && logEntry.targetType === "faculty" && logEntry.originalData) {
                mockFaculty = mockFaculty.filter(f => f.id !== logEntry.targetId);
                 if (logEntry.originalData.department === 'Administrative') {
                     mockApiAdmins = mockApiAdmins.filter(a => a.id !== logEntry.targetId);
                 }
                 logActivity("Undid: Added Faculty", `Reverted addition of ${logEntry.originalData.firstName} ${logEntry.originalData.lastName}`, "Admin");
                 undoSuccess = true;
            } else if (logEntry.action === "Deleted Faculty" && logEntry.targetType === "faculty" && logEntry.originalData) {
                mockFaculty.push(logEntry.originalData as Faculty);
                 if (logEntry.originalData.department === 'Administrative') {
                     const facultyMember = logEntry.originalData as Faculty;
                     mockApiAdmins.push({
                        id: facultyMember.id,
                        username: facultyMember.username,
                        firstName: facultyMember.firstName,
                        lastName: facultyMember.lastName,
                        email: facultyMember.email,
                        role: 'Sub Admin',
                        isSuperAdmin: false,
                    });
                 }
                logActivity("Undid: Deleted Faculty", `Restored ${logEntry.originalData.firstName} ${logEntry.originalData.lastName}`, "Admin");
                undoSuccess = true;
            } else if (logEntry.action === "Removed Admin Role" && logEntry.targetType === "admin" && logEntry.originalData) {
                const adminData = logEntry.originalData as AdminUser;
                const facultyMember = mockFaculty.find(f => f.id === adminData.id);
                if (facultyMember) {
                    facultyMember.department = 'Administrative';
                    if (!mockApiAdmins.some(a => a.id === adminData.id)) {
                        mockApiAdmins.push(adminData);
                    }
                    logActivity("Undid: Removed Admin Role", `Restored admin role for ${adminData.username}`, "Admin");
                    undoSuccess = true;
                } else if (mockApiAdmins.find(a => a.id === adminData.id && !a.isSuperAdmin)){
                     mockApiAdmins.push(adminData);
                     logActivity("Undid: Removed Admin Role", `Restored admin role for ${adminData.username}`, "Admin");
                     undoSuccess = true;
                } else {
                     console.warn("Cannot undo admin role removal: Corresponding faculty record not found or originalData incomplete for faculty-admin, or it was a super-admin which is not undoable this way.");
                }

            } else {
                 throw new Error("Undo for this action type is not fully implemented in mock.");
            }

            if (undoSuccess) {
                recalculateDashboardStats();
                mockActivityLog = mockActivityLog.filter(entry => entry.id !== logId);
                return { success: true, message: "Action undone." } as ResponseData;
            } else {
                throw new Error("Undo operation failed or was not applicable.");
            }
        }
        if (phpPath === 'sections/create.php') {
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
                const oldSection = mockStudents[studentIndex].section;
                const updatedStudentData = data as unknown as Partial<Student>;
                mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...updatedStudentData };
                const newSection = mockStudents[studentIndex].section;

                if (oldSection !== newSection) {
                    const oldSectionToUpdate = mockSections.find(s => s.id === oldSection);
                    if (oldSectionToUpdate && oldSectionToUpdate.studentCount && oldSectionToUpdate.studentCount > 0) {
                        oldSectionToUpdate.studentCount -= 1;
                    }
                    const newSectionToUpdate = mockSections.find(s => s.id === newSection);
                     if (newSectionToUpdate) {
                        newSectionToUpdate.studentCount = (newSectionToUpdate.studentCount || 0) + 1;
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

                if (updatedFaculty.department === 'Administrative' && oldDepartment !== 'Administrative') {
                    if (!mockApiAdmins.some(a => a.id === updatedFaculty.id)) {
                        mockApiAdmins.push({
                            id: updatedFaculty.id,
                            username: updatedFaculty.username,
                            firstName: updatedFaculty.firstName,
                            lastName: updatedFaculty.lastName,
                            email: updatedFaculty.email,
                            role: 'Sub Admin',
                            isSuperAdmin: false,
                        });
                    }
                } else if (updatedFaculty.department !== 'Administrative' && oldDepartment === 'Administrative') {
                    mockApiAdmins = mockApiAdmins.filter(a => a.id !== updatedFaculty.id || a.isSuperAdmin);
                }

                logActivity("Updated Faculty", `${updatedFaculty.firstName} ${updatedFaculty.lastName}`, "Admin", id, "faculty");
                recalculateDashboardStats();
                return { ...updatedFaculty } as ResponseData;
            }
            throw new Error("Faculty not found for mock update.");
        }
         if (phpPath === 'student/profile/update.php') {
            const profileData = data as Student;
            const studentUser = mockTestUsers.find(u => u.username === "s1001")
            const studentId = studentUser?.userId;
            const index = mockStudents.findIndex(s => s.id === studentId);
            if (index > -1) {
                mockStudents[index] = { ...mockStudents[index], ...profileData };
                logActivity("Updated Profile", `Student ${profileData.firstName} ${profileData.lastName} updated their profile.`, "Student", profileData.id, "student");
                return { ...mockStudents[index] } as ResponseData;
            }
            throw new Error("Mock student profile not found for update.");
        }
         if (phpPath === 'teacher/profile/update.php') {
             const profileData = data as Faculty;
             const teacherUser = mockTestUsers.find(u => u.username === "t1001");
            const teacherId = teacherUser?.userId;
             const index = mockFaculty.findIndex(t => t.id === teacherId);
             if (index > -1) {
                 mockFaculty[index] = { ...mockFaculty[index], ...profileData };
                 logActivity("Updated Profile", `Faculty ${profileData.firstName} ${profileData.lastName} updated their profile.`, "Faculty", profileData.id, "faculty");
                 return { ...mockFaculty[index] } as ResponseData;
             }
             throw new Error("Mock faculty profile not found for update.");
         }
          if (phpPath.startsWith('programs/update.php/')) {
             const programId = idStr;
             const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1) {
                 const updatedData = data as unknown as Partial<ProgramType>;
                if (updatedData.courses && typeof updatedData.courses === 'object') {
                     mockApiPrograms[programIndex] = {
                         ...mockApiPrograms[programIndex],
                         ...updatedData,
                     };
                } else {
                     mockApiPrograms[programIndex] = {
                        ...mockApiPrograms[programIndex],
                        name: updatedData.name ?? mockApiPrograms[programIndex].name,
                        description: updatedData.description ?? mockApiPrograms[programIndex].description,
                    };
                }
                 logActivity("Updated Program", mockApiPrograms[programIndex].name, "Admin", programId, "program");
                 return { ...mockApiPrograms[programIndex] } as ResponseData;
             }
             throw new Error("Program not found for mock update.");
          }
          if (phpPath.startsWith('courses/update.php/')) {
              const courseId = idStr;
              const courseIndex = mockCourses.findIndex(c => c.id === courseId);
              if (courseIndex > -1) {
                   const updatedCourseData = data as Partial<Course>;
                   mockCourses[courseIndex] = {
                       ...mockCourses[courseIndex],
                       ...updatedCourseData,
                       programId: updatedCourseData.type === 'Major' ? (updatedCourseData.programId || []) : [],
                    };
                    mockApiPrograms.forEach(program => {
                         Object.keys(program.courses).forEach(year => {
                             const yr = year as YearLevel;
                             const assignedIndex = program.courses[yr].findIndex(c => c.id === courseId);
                             if (assignedIndex > -1) {
                                 program.courses[yr][assignedIndex] = { ...mockCourses[courseIndex] };
                             }
                         });
                    });
                    logActivity("Updated Course", mockCourses[courseIndex].name, "Admin", courseId, "course");
                   return { ...mockCourses[courseIndex] } as ResponseData;
              }
              throw new Error("Course not found for mock update.");
          }
          if (phpPath.startsWith('sections/update.php/')) {
            const sectionIdToUpdate = idStr;
            const sectionIndex = mockSections.findIndex(s => s.id === sectionIdToUpdate);
            if (sectionIndex > -1) {
                const updatedSectionData = data as Partial<Section>;
                mockSections[sectionIndex] = {
                    ...mockSections[sectionIndex],
                    programId: updatedSectionData.programId ?? mockSections[sectionIndex].programId,
                    yearLevel: updatedSectionData.yearLevel ?? mockSections[sectionIndex].yearLevel,
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
            const deletedStudent = { ...mockStudents[studentIndex] };
            mockStudents.splice(studentIndex, 1);
            const sectionToUpdate = mockSections.find(s => s.id === deletedStudent.section);
            if (sectionToUpdate && sectionToUpdate.studentCount && sectionToUpdate.studentCount > 0) {
                sectionToUpdate.studentCount -= 1;
            }
            logActivity("Deleted Student", `${deletedStudent.firstName} ${deletedStudent.lastName} (${deletedStudent.username})`, "Admin", id, "student", true, deletedStudent);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('teachers/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const facultyIndex = mockFaculty.findIndex(t => t.id === id);
            if (facultyIndex === -1) throw new Error("Faculty not found for mock delete.");
            const deletedFaculty = { ...mockFaculty[facultyIndex] };
            mockFaculty.splice(facultyIndex, 1);
            if (deletedFaculty.department === 'Administrative') {
                 mockApiAdmins = mockApiAdmins.filter(a => a.id !== id || a.isSuperAdmin);
            }
            logActivity("Deleted Faculty", `${deletedFaculty.firstName} ${deletedFaculty.lastName} (${deletedFaculty.username})`, "Admin", id, "faculty", true, deletedFaculty);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('admins/delete.php/')) {
            const adminIdToRemove = parseInt(idPart || '0', 10);
            if (adminIdToRemove === 0) throw new Error("Cannot remove Super Admin role.");

            const adminUser = mockApiAdmins.find(a => a.id === adminIdToRemove);
            if (!adminUser) throw new Error("Admin role not found for mock removal.");

            const facultyMember = mockFaculty.find(f => f.id === adminIdToRemove);
            if (facultyMember && facultyMember.department === 'Administrative') {
                logActivity("Removed Admin Role", `For ${adminUser.username}. Faculty record remains.`, "Admin", adminIdToRemove, "admin", true, { ...adminUser });
                mockApiAdmins = mockApiAdmins.filter(a => a.id !== adminIdToRemove);

            } else if (!facultyMember && !adminUser.isSuperAdmin) {
                const deletedAdmin = { ...adminUser };
                mockApiAdmins = mockApiAdmins.filter(a => a.id !== adminIdToRemove);
                logActivity("Removed Admin Role", `For ${deletedAdmin.username}`, "Admin", adminIdToRemove, "admin", true, deletedAdmin);
            } else {
                 throw new Error("Cannot remove this admin or admin role not found as expected.");
            }
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
         if (phpPath.startsWith('assignments/delete.php/')) {
             const id = idPart;
             const assignIndex = mockSectionAssignments.findIndex(a => a.id === id);
             if (assignIndex === -1) throw new Error("Section-Course assignment not found for mock delete.");
             const deletedAssignment = { ...mockSectionAssignments[assignIndex] };
             mockSectionAssignments.splice(assignIndex, 1);
             logActivity("Deleted Section-Course Assignment", `Course ${deletedAssignment.subjectName} from section ${deletedAssignment.sectionId}`, "Admin");
             return;
         }
         if (phpPath.startsWith('programs/delete.php/')) {
             const programId = idPart;
             const progIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (progIndex === -1) throw new Error("Program not found for mock delete.");
             const deletedProgram = { ...mockApiPrograms[progIndex] };
             mockApiPrograms.splice(progIndex, 1);

             mockCourses = mockCourses.map(c => {
                 if (c.type === 'Major' && c.programId?.includes(programId)) {
                     const updatedProgramIds = c.programId.filter(pid => pid !== programId);
                     return { ...c, programId: updatedProgramIds };
                 }
                 return c;
             });

             mockSections = mockSections.filter(s => s.programId !== programId);

             mockSectionAssignments = mockSectionAssignments.filter(a => !mockSections.some(s => s.id === a.sectionId && s.programId === programId));
             logActivity("Deleted Program", deletedProgram.name, "Admin", programId, "program");
             return;
          }
          if (phpPath.startsWith('courses/delete.php/')) {
             const courseId = idPart;
             const courseIndex = mockCourses.findIndex(c => c.id === courseId);
             if (courseIndex === -1) throw new Error("Course not found for mock delete.");
             const deletedCourse = { ...mockCourses[courseIndex] };
             mockCourses.splice(courseIndex, 1);

             mockApiPrograms.forEach(program => {
                 Object.keys(program.courses).forEach(year => {
                      const yr = year as YearLevel;
                      program.courses[yr] = program.courses[yr].filter(c => c.id !== courseId);
                 });
             });

             mockSectionAssignments = mockSectionAssignments.filter(a => a.subjectId !== courseId);
             logActivity("Deleted Course", deletedCourse.name, "Admin", courseId, "course");
             return;
          }
          if (phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/)) {
             const [, programId, yearLevelEncoded, courseId] = phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/) || [];
             const yearLevel = decodeURIComponent(yearLevelEncoded) as YearLevel;
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

            const studentsInSec = mockStudents.filter(s => s.section === sectionIdToDelete).length;
            if (studentsInSec > 0) {
                throw new Error(`Cannot delete section ${deletedSection.sectionCode}. It has ${studentsInSec} student(s). Please reassign students first.`);
            }

            mockSections.splice(sectionIndex, 1);
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
            responseBodyText = await response.text(); // Read body once as text
            console.error("API Error Response Text (fetchData):", responseBodyText);
            try {
                 errorData = JSON.parse(responseBodyText); // Try parsing the text
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
            } catch (jsonParseError) {
                 // If parsing fails, use the raw text as the error message
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
    let response;
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
    let response;
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
    let response;
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

