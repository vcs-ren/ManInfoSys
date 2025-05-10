
'use client';

import type { Student, Faculty, Section, Course, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole, CourseType, YearLevel, ActivityLogEntry, EmploymentType, StudentStatus } from '@/types';
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateAdminUsername, generateTeacherUsername, generateStudentId } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';


// --- MOCK DATA STORE ---
let nextStudentDbId = 3;
let nextFacultyDbId = 4;
let nextProgramDbId = 3;
let nextCourseDbId = 10;
let nextActivityLogId = 1;


let mockCourses: Course[] = [
    { id: "CS101", name: "Introduction to Programming", description: "Fundamentals of programming.", type: "Major", programId: ["CS"], yearLevel: "1st Year" },
    { id: "IT101", name: "IT Fundamentals", description: "Basics of IT.", type: "Major", programId: ["IT"], yearLevel: "1st Year" },
    { id: "CS201", name: "Data Structures", description: "Study of data organization.", type: "Major", programId: ["CS"], yearLevel: "2nd Year" },
    { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills", type: "Minor", programId: [] },
    { id: "MATH101", name: "Calculus I", description: "Differential Calculus", type: "Minor", programId: []},
];

let mockApiPrograms: ProgramType[] = [
    {
        id: "CS", name: "Computer Science", description: "Focuses on algorithms, data structures, and software development.",
        courses: { "1st Year": [mockCourses[0], mockCourses[4]], "2nd Year": [mockCourses[2]], "3rd Year": [], "4th Year": [] },
    },
    {
        id: "IT", name: "Information Technology", description: "Focuses on network administration, system management, and web technologies.",
        courses: { "1st Year": [mockCourses[1], mockCourses[3]], "2nd Year": [], "3rd Year": [], "4th Year": [] },
    },
];

let mockStudents: Student[] = [
  { id: 1, studentId: "101", username: "s101", firstName: "Alice", lastName: "Smith", course: "CS", status: "Returnee", year: "2nd Year", section: "CS2A", email: "alice@example.com", phone: "123-456-7890", emergencyContactName: "John Smith", emergencyContactRelationship: "Father", emergencyContactPhone: "111-222-3333", emergencyContactAddress: "123 Main St", lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, studentId: "102", username: "s102", firstName: "Bob", lastName: "Johnson", course: "IT", status: "New", year: "1st Year", section: "IT1A", email: "bob@example.com", phone: "987-654-3210", lastAccessed: null },
];

let mockFaculty: Faculty[] = [
  { id: 1, teacherId: "1001", username: "t1001", firstName: "David", lastName: "Lee", department: "Teaching", email: "david.lee@example.com", phone: "555-1234", employmentType: 'Regular', lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, teacherId: "1002", username: "a1002", firstName: "Eve", lastName: "Davis", department: "Administrative", email: "eve.davis@example.com", phone: "555-5678", employmentType: 'Part Time', lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, teacherId: "1003", username: "t1003", firstName: "Carol", lastName: "White", department: "Teaching", email: "carol.white@example.com", phone: "555-9012", employmentType: 'Regular', lastAccessed: null },
];

let mockSections: Section[] = [
    { id: "CS1A", sectionCode: "CS1A", programId: "CS", programName: "Computer Science", yearLevel: "1st Year", adviserId: 1, adviserName: "David Lee", studentCount: 0 },
    { id: "CS2A", sectionCode: "CS2A", programId: "CS", programName: "Computer Science", yearLevel: "2nd Year", adviserId: 1, adviserName: "David Lee", studentCount: 1 },
    { id: "IT1A", sectionCode: "IT1A", programId: "IT", programName: "Information Technology", yearLevel: "1st Year", studentCount: 1 }, 
];

let mockSectionAssignments: SectionSubjectAssignment[] = [
    { id: "CS2A-CS201", sectionId: "CS2A", subjectId: "CS201", subjectName: "Data Structures", teacherId: 1, teacherName: "David Lee" },
    { id: "IT1A-IT101", sectionId: "IT1A", subjectId: "IT101", subjectName: "IT Fundamentals", teacherId: 1, teacherName: "David Lee" }, 
];

let mockAnnouncements: Announcement[] = [
  { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year.", date: new Date(2024, 7, 15), targetAudience: "All", target: { course: "all" }, author: "Admin" },
];

let mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = [
    { assignmentId: "CS2A-CS201-1", studentId: 1, studentName: "Alice Smith", subjectId: "CS201", subjectName: "Data Structures", section: "CS2A", year: "2nd Year", prelimGrade: 85, prelimRemarks: "Good start", midtermGrade: 90, midtermRemarks: "Excellent", finalGrade: 88, finalRemarks: "Very Good", status: "Complete" },
    { assignmentId: "IT1A-IT101-2", studentId: 2, studentName: "Bob Johnson", subjectId: "IT101", subjectName: "IT Fundamentals", section: "IT1A", year: "1st Year", prelimGrade: null, prelimRemarks: "", midtermGrade: null, midtermRemarks: "", finalGrade: null, finalRemarks: "", status: "Not Submitted" },
];

let mockApiAdmins: AdminUser[] = [
    { id: 0, username: "admin", firstName: "Super", lastName: "Admin", email: "superadmin@example.com", role: "Super Admin", isSuperAdmin: true },
    { id: 2, username: "a1002", firstName: "Eve", lastName: "Davis", email: "eve.davis@example.com", role: "Sub Admin", isSuperAdmin: false }, 
    { id: 1001, username: "a1001", firstName: "Test", lastName: "SubAdmin", email: "test.sub@example.com", role: "Sub Admin", isSuperAdmin: false }, 
];

let mockActivityLog: ActivityLogEntry[] = [
    { id: `log${nextActivityLogId++}`, timestamp: new Date(Date.now() - 1000 * 60 * 5), user: "System", action: "System Startup", description: "System initialized successfully.", canUndo: false }
];

// Function to log an activity
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

let mockDashboardStats: DashboardStats;

const recalculateDashboardStats = () => {
    const teachingStaffCount = mockFaculty.filter(f => f.department === 'Teaching').length;
    const adminStaffCount = mockFaculty.filter(f => f.department === 'Administrative' && f.id !== 0).length;

    mockDashboardStats = {
        totalStudents: mockStudents.length,
        totalTeachers: teachingStaffCount,
        totalAdmins: adminStaffCount, 
        upcomingEvents: mockAnnouncements.filter(a => a.date > new Date()).length, 
        totalFaculty: mockFaculty.length,
    };
};
recalculateDashboardStats();


let mockTestUsers = [
    { username: "admin", password: "defadmin", role: "Admin" as const, userId: 0 },
    { username: "s101", password: "password", role: "Student" as const, userId: 1 },
    { username: "s102", password: "password", role: "Student" as const, userId: 2 },
    { username: "t1001", password: "password", role: "Teacher" as const, userId: 1 },
    { username: "a1002", password: "password", role: "Teacher" as const, userId: 2 }, 
    { username: "a1001", password: "password", role: "Admin" as const, userId: 1001 }, 
];


// --- API CONFIGURATION ---
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


// --- MOCK API IMPLEMENTATION ---

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
            const facultyAdminIds = new Set(facultyAdmins.map(fa => fa.id));
            const explicitSubAdmins = mockApiAdmins.filter(a => !a.isSuperAdmin && !facultyAdminIds.has(a.id));
            const allAdmins = superAdmin ? [superAdmin, ...facultyAdmins, ...explicitSubAdmins] : [...facultyAdmins, ...explicitSubAdmins];
            return allAdmins as T;
        }
        if (phpPath === 'programs/read.php') return [...mockApiPrograms] as T;
        if (phpPath === 'courses/read.php') return [...mockCourses] as T;
        if (phpPath === 'sections/read.php') {
            const sectionsWithCounts = mockSections.map(section => {
                const count = mockStudents.filter(student => student.section === section.id).length;
                return {
                    ...section,
                    studentCount: count,
                    programName: mockApiPrograms.find(p => p.id === section.programId)?.name || section.programId,
                    adviserName: section.adviserId ? mockFaculty.find(f=>f.id === section.adviserId)?.firstName + " " + mockFaculty.find(f=>f.id === section.adviserId)?.lastName : undefined,
                };
            });
            
            const activeSections = sectionsWithCounts.filter(section => section.studentCount > 0);
            return activeSections as T;
        }
        if (phpPath === 'announcements/read.php') {
            return [...mockAnnouncements].sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'student/announcements/read.php') {
            const studentProgram = mockStudents.find(s => s.id === 1)?.course; 
            const studentYear = mockStudents.find(s => s.id === 1)?.year;
            const studentSection = mockStudents.find(s => s.id === 1)?.section;
             return mockAnnouncements.filter(ann => 
                (ann.targetAudience === 'All' || ann.targetAudience === 'Student') &&
                (ann.target.course === 'all' || ann.target.course === studentProgram || !ann.target.course) &&
                (ann.target.yearLevel === 'all' || ann.target.yearLevel === studentYear || !ann.target.yearLevel) &&
                (ann.target.section === 'all' || ann.target.section === studentSection || !ann.target.section)
            ).sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'teacher/announcements/read.php') {
            return mockAnnouncements.filter(ann => ann.targetAudience === 'All' || ann.targetAudience === 'Faculty')
                .sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'admin/dashboard-stats.php') {
            recalculateDashboardStats();
            return { ...mockDashboardStats } as T;
        }
         if (phpPath.match(/^sections\/([^/]+)\/assignments\/read\.php$/)) {
            const sectionId = phpPath.match(/^sections\/([^/]+)\/assignments\/read\.php$/)?.[1];
             return mockSectionAssignments.filter(a => a.sectionId === sectionId).map(a => ({
                 ...a,
                 subjectName: mockCourses.find(s => s.id === a.subjectId)?.name || a.subjectId,
                 teacherName: mockFaculty.find(t => t.id === a.teacherId)?.firstName + ' ' + mockFaculty.find(t => t.id === a.teacherId)?.lastName || `Faculty ID ${a.teacherId}`,
             })) as T;
        }
         if (phpPath === 'student/grades/read.php') {
             const studentGrades = mockStudentSubjectAssignmentsWithGrades
                .filter(g => g.studentId === 1) 
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
             return mockStudentSubjectAssignmentsWithGrades.filter(g => {
                 const assignment = mockSectionAssignments.find(a => a.subjectId === g.subjectId && g.section === a.sectionId);
                 return assignment?.teacherId === 1; 
             }) as T;
         }
         if (phpPath === 'student/profile/read.php') { 
             const student = mockStudents.find(s => s.id === 1);
             if (student) return { ...student } as T;
             throw new Error("Mock student profile not found.");
        }
        if (phpPath === 'teacher/profile/read.php') { 
             const faculty = mockFaculty.find(t => t.id === 1);
             if (faculty) return { ...faculty } as T;
             throw new Error("Mock faculty profile not found.");
        }
         if (phpPath === 'student/schedule/read.php') {
            const studentSection = mockStudents.find(s => s.id === 1)?.section;
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
            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments
                .filter(a => a.teacherId === 1) 
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
             const subjectIds = new Set(mockSectionAssignments.filter(a => a.teacherId === 1).map(a => a.subjectId));
             return mockCourses.filter(s => subjectIds.has(s.id)) as T;
         }
          if (phpPath === 'student/upcoming/read.php') {
             const upcoming: UpcomingItem[] = [];
              const studentSchedule = mockSectionAssignments
                .filter(a => a.sectionId === mockStudents.find(s => s.id === 1)?.section)
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
             const user = mockTestUsers.find(u => u.username === username && u.password === password);
             if (user) {
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
                    const facultyIndex = mockFaculty.findIndex(f => f.id === user.userId);
                    if (facultyIndex > -1) mockFaculty[facultyIndex].lastAccessed = new Date().toISOString();
                }


                logActivity("User Login", `${user.username} logged in.`, user.username, user.userId, user.role.toLowerCase() as ActivityLogEntry['targetType']);
                return { success: true, role: user.role as any, redirectPath: redirectPath, userId: user.userId } as ResponseData;
             }
             throw new Error("Invalid mock credentials.");
        }
         if (phpPath === 'students/create.php') {
            const newStudentData = data as unknown as Omit<Student, 'id' | 'studentId' | 'section' | 'username' | 'lastAccessed'>;
            
            const studentProgramId = newStudentData.course; 
            const studentStatus = newStudentData.status;
            let studentYearLevel = newStudentData.year;

            if (studentStatus === 'New') {
                studentYearLevel = '1st Year';
            } else if (!studentYearLevel && (studentStatus === 'Transferee' || studentStatus === 'Returnee')) {
                 throw new Error("Year level is required for Transferee or Returnee status.");
            }
            if (!studentProgramId || !studentYearLevel) {
                throw new Error("Program and Year Level are required to assign a section.");
            }
            
            let assignedSectionCode: string | undefined = undefined;
            const relevantSections = mockSections
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
                    mockSections.push({
                        id: assignedSectionCode,
                        sectionCode: assignedSectionCode,
                        programId: studentProgramId,
                        programName: program?.name || studentProgramId,
                        yearLevel: studentYearLevel,
                        studentCount: 0, 
                    });
                    logActivity("Auto-Added Section", `Section ${assignedSectionCode} for ${studentProgramId} - ${studentYearLevel} due to enrollment.`, "System", assignedSectionCode, "section");
                }
            }

            const nextId = nextStudentDbId++;
            const studentIdStr = generateStudentId(nextId);
            const username = generateStudentUsername(studentIdStr);
            const student: Student = {
                ...newStudentData,
                id: nextId,
                studentId: studentIdStr,
                username: username,
                section: assignedSectionCode,
                year: studentYearLevel, 
                lastAccessed: null,
            };
            mockStudents.push(student);
            logActivity("Added Student", `${student.firstName} ${student.lastName} (${student.username})`, "Admin", student.id, "student", true, { ...student, passwordHash: "mock_hash" });
            recalculateDashboardStats();
            return student as ResponseData;
        }
         if (phpPath === 'teachers/create.php') {
            const newFacultyData = data as unknown as Omit<Faculty, 'id' | 'teacherId' | 'username' | 'lastAccessed'>;
            const nextId = nextFacultyDbId++;
            const teacherIdStr = generateTeacherId(nextId);
            const department = newFacultyData.department || 'Teaching';
            const username = generateTeacherUsername(teacherIdStr, department);

            const faculty: Faculty = {
                ...newFacultyData,
                id: nextId,
                teacherId: teacherIdStr,
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
            logActivity("Created Announcement", newAnnData.title, "Admin", newAnnData.target.programId || newAnnData.target.section || newAnnData.target.yearLevel || 'all', 'announcement');
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
             logActivity("Assigned Course to Section", `${subject?.name} to section ${sectionId} with ${facultyMember?.firstName} ${facultyMember.lastName}`, "Admin");
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
                mockStudents = mockStudents.filter(s => s.id !== logEntry.targetId);
                logActivity("Undid: Added Student", `Reverted addition of ${logEntry.originalData.firstName} ${logEntry.originalData.lastName}`, "Admin");
                undoSuccess = true;
            } else if (logEntry.action === "Deleted Student" && logEntry.targetType === "student" && logEntry.originalData) {
                mockStudents.push(logEntry.originalData as Student);
                logActivity("Undid: Deleted Student", `Restored ${logEntry.originalData.firstName} ${logEntry.originalData.lastName}`, "Admin");
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
                mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...(data as unknown as Partial<Student>) };
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
            const index = mockStudents.findIndex(s => s.id === profileData.id);
            if (index > -1) {
                mockStudents[index] = { ...mockStudents[index], ...profileData };
                logActivity("Updated Profile", `Student ${profileData.firstName} ${profileData.lastName} updated their profile.`, "Student", profileData.id, "student");
                return { ...mockStudents[index] } as ResponseData;
            }
            throw new Error("Mock student profile not found for update.");
        }
         if (phpPath === 'teacher/profile/update.php') {
             const profileData = data as Faculty;
             const index = mockFaculty.findIndex(t => t.id === profileData.id);
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
                 const updatedData = data as unknown as Partial<ProgramType>; // Use ProgramType
                 // If courses are being updated (e.g., from assign courses modal)
                if (updatedData.courses && typeof updatedData.courses === 'object') {
                     mockApiPrograms[programIndex] = {
                         ...mockApiPrograms[programIndex],
                         ...updatedData, // This will overwrite the entire courses object if present in updatedData
                     };
                } else { // Handle simple name/description update
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
                    ...updatedSectionData,
                    programName: mockApiPrograms.find(p => p.id === updatedSectionData.programId)?.name,
                };
                logActivity("Updated Section", `Section ${mockSections[sectionIndex].sectionCode} details updated.`, "Admin", sectionIdToUpdate, "section");
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
             if (assignIndex === -1) throw new Error("Assignment not found for mock delete.");
             const deletedAssignment = { ...mockSectionAssignments[assignIndex] };
             mockSectionAssignments.splice(assignIndex, 1);
             logActivity("Deleted Section Assignment", `Course ${deletedAssignment.subjectName} from section ${deletedAssignment.sectionId}`, "Admin");
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
            mockSections.splice(sectionIndex, 1);
            mockSectionAssignments = mockSectionAssignments.filter(sa => sa.sectionId !== sectionIdToDelete);
            mockStudents = mockStudents.map(s => s.section === sectionIdToDelete ? { ...s, section: '' } : s);
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


// --- API HELPER FUNCTIONS (Selector) ---
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
        try {
            const errorBody = await response.text(); 
            console.error("API Error Response Text (fetchData):", errorBody); 
            try {
                 errorData = JSON.parse(errorBody); 
                 errorMessage = errorData?.message || errorBody || errorMessage;
            } catch (parseError) {
                 errorMessage = errorBody || errorMessage;
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
        try {
            const errorBody = await response.text(); 
            console.error("API Error Response Text (postData):", errorBody); 
            try {
                 errorData = JSON.parse(errorBody); 
                 errorMessage = errorData?.message || errorBody || errorMessage;
            } catch (jsonParseError) {
                 errorMessage = errorBody || errorMessage;
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
         try {
             const errorBody = await response.text(); 
             console.error("API Error Response Text (putData):", errorBody); 
             try {
                 errorData = JSON.parse(errorBody); 
                 errorMessage = errorData?.message || errorBody || errorMessage;
             } catch (jsonParseError) {
                 errorMessage = errorBody || errorMessage;
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
         try {
             const errorBody = await response.text(); 
             console.error("API Error Response Text (deleteData):", errorBody); 
             try {
                 errorData = JSON.parse(errorBody); 
                 errorMessage = errorData?.message || errorBody || errorMessage;
             } catch (jsonParseError) {
                 errorMessage = errorBody || errorMessage;
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
             const data = await response.json();
             console.log(`DELETE ${url} successful with status ${response.status}. Response data:`, data);
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

