
'use client';

import type { Student, Faculty, Section, Course, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole, CourseType, YearLevel, ActivityLogEntry, EmploymentType } from '@/types';
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateAdminUsername, generateTeacherUsername, generateStudentId } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';


// --- MOCK DATA STORE ---
let nextStudentDbId = 3;
let nextFacultyDbId = 3;
let nextProgramDbId = 3; // For new program IDs if not specified
let nextCourseDbId = 10; // For new course IDs if not specified
let nextActivityLogId = 1;

let mockCourses: Course[] = [
    { id: "CS101", name: "Introduction to Programming", description: "Fundamentals of programming.", type: "Major", programId: "CS", yearLevel: "1st Year" },
    { id: "IT101", name: "IT Fundamentals", description: "Basics of IT.", type: "Major", programId: "IT", yearLevel: "1st Year" },
    { id: "CS201", name: "Data Structures", description: "Study of data organization.", type: "Major", programId: "CS", yearLevel: "2nd Year" },
    { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills", type: "Minor" },
    { id: "MATH101", name: "Calculus I", description: "Differential Calculus", type: "Minor"},
];

let mockPrograms: Program[] = [
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
  { id: 1, studentId: "101", username: "s101", firstName: "Alice", lastName: "Smith", course: "Computer Science", status: "Returnee", year: "2nd Year", section: "CS-2A", email: "alice@example.com", phone: "123-456-7890", emergencyContactName: "John Smith", emergencyContactRelationship: "Father", emergencyContactPhone: "111-222-3333", emergencyContactAddress: "123 Main St", lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, studentId: "102", username: "s102", firstName: "Bob", lastName: "Johnson", course: "Information Technology", status: "New", year: "1st Year", section: "IT-1B", email: "bob@example.com", phone: "987-654-3210", lastAccessed: null },
];

let mockFaculty: Faculty[] = [
  { id: 1, teacherId: "1001", username: "t1001", firstName: "David", lastName: "Lee", department: "Teaching", email: "david.lee@example.com", phone: "555-1234", employmentType: 'Regular', lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, teacherId: "1002", username: "a1002", firstName: "Eve", lastName: "Davis", department: "Administrative", email: "eve.davis@example.com", phone: "555-5678", employmentType: 'Part Time', lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, teacherId: "1003", username: "t1003", firstName: "Carol", lastName: "White", department: "Teaching", email: "carol.white@example.com", phone: "555-9012", employmentType: 'Regular', lastAccessed: null },
];

let mockSections: Section[] = [
    { id: "CS-1A", sectionCode: "CS-1A", programId: "CS", programName: "Computer Science", yearLevel: "1st Year", adviserId: 1, adviserName: "David Lee", studentCount: 0 },
    { id: "CS-2A", sectionCode: "CS-2A", programId: "CS", programName: "Computer Science", yearLevel: "2nd Year", adviserId: 1, adviserName: "David Lee", studentCount: 1 },
    { id: "IT-1B", sectionCode: "IT-1B", programId: "IT", programName: "Information Technology", yearLevel: "1st Year", studentCount: 1 },
];

let mockSectionAssignments: SectionSubjectAssignment[] = [
    { id: "CS-2A-CS201", sectionId: "CS-2A", subjectId: "CS201", subjectName: "Data Structures", teacherId: 1, teacherName: "David Lee" },
    { id: "IT-1B-IT101", sectionId: "IT-1B", subjectId: "IT101", subjectName: "IT Fundamentals", teacherId: 2, teacherName: "Eve Davis" },
];

let mockAnnouncements: Announcement[] = [
  { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year.", date: new Date(2024, 7, 15), target: { course: "all" }, author: "Admin" },
];

let mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = [
    { assignmentId: "1-CS201", studentId: 1, studentName: "Alice Smith", subjectId: "CS201", subjectName: "Data Structures", section: "CS-2A", year: "2nd Year", prelimGrade: 85, prelimRemarks: "Good start", midtermGrade: 90, midtermRemarks: "Excellent", finalGrade: 88, finalRemarks: "Very Good", status: "Complete" },
    { assignmentId: "2-IT101", studentId: 2, studentName: "Bob Johnson", subjectId: "IT101", subjectName: "IT Fundamentals", section: "IT-1B", year: "1st Year", prelimGrade: null, prelimRemarks: "", midtermGrade: null, midtermRemarks: "", finalGrade: null, finalRemarks: "", status: "Not Submitted" },
];

let mockAdmins: AdminUser[] = [
    { id: 0, username: "admin", firstName: "Super", lastName: "Admin", email: "superadmin@example.com", role: "Super Admin", isSuperAdmin: true },
    { id: 2, username: "a1002", firstName: "Eve", lastName: "Davis", email: "eve.davis@example.com", role: "Sub Admin", isSuperAdmin: false }, // Faculty member Eve Davis is now also a Sub Admin
    { id: 1001, username: "a1001", firstName: "Test", lastName: "SubAdmin", email: "test.sub@example.com", role: "Sub Admin", isSuperAdmin: false },
];

let mockActivityLog: ActivityLogEntry[] = [
    { id: `log${nextActivityLogId++}`, timestamp: new Date(Date.now() - 1000 * 60 * 5), user: "System", action: "System Startup", description: "System initialized successfully.", canUndo: false }
];

// Function to log an activity
const logActivity = (
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
    mockActivityLog.unshift(newLogEntry); // Add to the beginning of the array
    if (mockActivityLog.length > 50) { // Keep only last 50 logs
        mockActivityLog.pop();
    }
};

// Declare mockDashboardStats before recalculateDashboardStats
let mockDashboardStats: DashboardStats;

// Function to recalculate dashboard stats from current mock data
const recalculateDashboardStats = () => {
    const teachingStaffCount = mockFaculty.filter(f => f.department === 'Teaching').length;
    const adminStaffCount = mockFaculty.filter(f => f.department === 'Administrative').length;
     // Sub Admins are faculty with 'Administrative' department OR explicitly added non-faculty Sub Admins
     // Ensure not to double count faculty who are also in mockAdmins list
    const facultyAdminIds = new Set(mockFaculty.filter(f => f.department === 'Administrative').map(f => f.id));
    const nonFacultySubAdmins = mockAdmins.filter(a => a.id !== 0 && !facultyAdminIds.has(a.id)).length;


    mockDashboardStats = {
        totalStudents: mockStudents.length,
        totalTeachers: teachingStaffCount,
        totalAdmins: adminStaffCount + nonFacultySubAdmins, // Sum of faculty admins and distinct non-faculty sub-admins
        upcomingEvents: 1, // Keep upcoming events static for now
    };
};
// Initial calculation after mock data declarations
recalculateDashboardStats();


let mockTestUsers = [
    { username: "admin", password: "defadmin", role: "Admin" as const, userId: 0 },
    { username: "s101", password: "password", role: "Student" as const, userId: 1 },
    { username: "s102", password: "password", role: "Student" as const, userId: 2 },
    { username: "t1001", password: "password", role: "Teacher" as const, userId: 1 },
    { username: "a1002", password: "password", role: "Teacher" as const, userId: 2 }, // Eve Davis is also a Sub Admin
    { username: "a1001", password: "password", role: "Admin" as const, userId: 1001 }, // Test SubAdmin
];


// --- API CONFIGURATION ---
const USE_MOCK_API = true; // Set to false to try hitting the PHP backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const getApiUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${formattedPath}`;
};

// --- ERROR HANDLING ---
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
            // Super Admin (id=0)
            const superAdmin = mockAdmins.find(a => a.isSuperAdmin && a.id === 0);
            // Sub Admins are derived from faculty with 'Administrative' department
            const facultyAdmins: AdminUser[] = mockFaculty
                .filter(f => f.department === 'Administrative')
                .map(f => ({
                    id: f.id, // Use faculty ID as the admin ID for consistency
                    username: f.username,
                    firstName: f.firstName,
                    lastName: f.lastName,
                    email: f.email,
                    role: 'Sub Admin',
                    isSuperAdmin: false,
                }));

             // Include explicitly added non-faculty Sub Admins, excluding those already covered by faculty
            const facultyAdminIds = new Set(facultyAdmins.map(fa => fa.id));
            const explicitSubAdmins = mockAdmins.filter(a => !a.isSuperAdmin && !facultyAdminIds.has(a.id));


            const allAdmins = superAdmin ? [superAdmin, ...facultyAdmins, ...explicitSubAdmins] : [...facultyAdmins, ...explicitSubAdmins];
            return allAdmins as T;
        }
        if (phpPath === 'programs/read.php') return [...mockPrograms] as T;
        if (phpPath === 'courses/read.php') return [...mockCourses] as T;
        if (phpPath === 'sections/read.php') {
             return [...mockSections.map(s => ({
                 ...s,
                 programName: mockPrograms.find(p => p.id === s.programId)?.name || s.programId,
             }))] as T;
        }
        if (phpPath === 'announcements/read.php' || phpPath === 'student/announcements/read.php' || phpPath === 'teacher/announcements/read.php') {
            return [...mockAnnouncements].sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'admin/dashboard-stats.php') {
            recalculateDashboardStats(); // Ensure stats are up-to-date
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
                .filter(g => g.studentId === 1) // Assuming student ID 1 for mock
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
                 return assignment?.teacherId === 1; // Assuming teacher ID 1 for mock
             }) as T;
         }
         if (phpPath === 'student/profile/read.php') {
             const student = mockStudents.find(s => s.id === 1); // Assuming student ID 1 for mock
             if (student) return { ...student } as T;
             throw new Error("Mock student profile not found.");
        }
        if (phpPath === 'teacher/profile/read.php') {
             const faculty = mockFaculty.find(t => t.id === 1); // Assuming teacher ID 1 for mock
             if (faculty) return { ...faculty } as T;
             throw new Error("Mock faculty profile not found.");
        }
         if (phpPath === 'student/schedule/read.php') {
            const studentSection = mockStudents.find(s => s.id === 1)?.section; // Assuming student ID 1
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
                .filter(a => a.teacherId === 1) // Assuming teacher ID 1 for mock
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
             const subjectIds = new Set(mockSectionAssignments.filter(a => a.teacherId === 1).map(a => a.subjectId)); // Assuming teacher ID 1
             return mockCourses.filter(s => subjectIds.has(s.id)) as T;
         }
          if (phpPath === 'student/upcoming/read.php') {
             const upcoming: UpcomingItem[] = [];
              const studentSchedule = mockSectionAssignments
                .filter(a => a.sectionId === mockStudents.find(s => s.id === 1)?.section) // Assuming student ID 1
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
            return [...mockActivityLog].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10) as T; // Return last 10 activities, newest first
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
                // Update lastAccessed for student/teacher
                if (user.role === 'Student') {
                    const studentIndex = mockStudents.findIndex(s => s.id === user.userId);
                    if (studentIndex > -1) mockStudents[studentIndex].lastAccessed = new Date().toISOString();
                } else if (user.role === 'Teacher') {
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
            const nextId = nextStudentDbId++;
            const studentIdStr = generateStudentId(nextId);
            const username = generateStudentUsername(studentIdStr);
            const section = generateSectionCode(newStudentData.year || '1st Year'); // Ensure year is considered
            const student: Student = {
                ...newStudentData,
                id: nextId,
                studentId: studentIdStr,
                username: username,
                section: section,
                lastAccessed: null, // New students haven't accessed yet
            };
            mockStudents.push(student);
            logActivity("Added Student", `${student.firstName} ${student.lastName} (${student.username})`, "Admin", student.id, "student", true, { ...student, passwordHash: "mock_hash" }); // Add canUndo and originalData
            recalculateDashboardStats();
            return student as ResponseData;
        }
         if (phpPath === 'teachers/create.php') {
            const newFacultyData = data as unknown as Omit<Faculty, 'id' | 'teacherId' | 'username' | 'lastAccessed'>;
            const nextId = nextFacultyDbId++;
            const teacherIdStr = generateTeacherId(nextId); // Uses numeric ID
            const department = newFacultyData.department || 'Teaching';
            const username = generateTeacherUsername(teacherIdStr, department); // Corrected username generation

            const faculty: Faculty = {
                ...newFacultyData,
                id: nextId,
                teacherId: teacherIdStr, // Store numeric string ID
                username: username,
                lastAccessed: null, // New faculty haven't accessed yet
            };
            mockFaculty.push(faculty);
             // If faculty is Administrative, add to mockAdmins as Sub Admin
            if (faculty.department === 'Administrative') {
                const existingAdmin = mockAdmins.find(a => a.id === faculty.id);
                if (!existingAdmin) {
                     mockAdmins.push({
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
             const newProgramData = data as unknown as Program; // No need for Omit
             const newProgram: Program = {
                 id: newProgramData.id || newProgramData.name.toUpperCase().substring(0, 3) + Date.now().toString().slice(-3),
                 name: newProgramData.name,
                 description: newProgramData.description,
                 courses: newProgramData.courses || { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] },
             };
             if (mockPrograms.some(p => p.id === newProgram.id)) {
                 throw new Error("Program with this ID already exists.");
             }
             // Ensure courses added via program creation are also in the global mockCourses list if new
             Object.values(newProgram.courses).flat().forEach(course => {
                 if (!mockCourses.some(c => c.id === course.id)) {
                     mockCourses.push({ ...course, programId: newProgram.id }); // Ensure programId is set
                 }
             });
             mockPrograms.push(newProgram);
             logActivity("Added Program", newProgram.name, "Admin", newProgram.id, "program");
             return newProgram as ResponseData;
         }
         if (phpPath === 'courses/create.php') {
             const newCourseData = data as Course;
             const newCourse: Course = {
                 ...newCourseData,
                 id: newCourseData.id || `C${nextCourseDbId++}`,
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
              const programIndex = mockPrograms.findIndex(p => p.id === programId);
              const course = mockCourses.find(c => c.id === courseId);

              if (programIndex === -1) throw new Error("Program not found.");
              if (!course) throw new Error("Course not found.");
               if (!mockPrograms[programIndex].courses[yearLevel]) {
                  mockPrograms[programIndex].courses[yearLevel] = [];
               }
                if (mockPrograms[programIndex].courses[yearLevel].some(c => c.id === courseId)) {
                    throw new Error(`Course ${course.name} is already assigned to ${programId} - ${yearLevel}.`);
                }
                if (course.type === 'Major' && course.programId && course.programId !== programId) {
                     throw new Error(`Major course ${course.name} belongs to program ${course.programId} and cannot be assigned to ${programId}.`);
                }
                mockPrograms[programIndex].courses[yearLevel].push(course);
                logActivity("Assigned Course to Program", `${course.name} to ${mockPrograms[programIndex].name} (${yearLevel})`, "Admin");
                return { ...mockPrograms[programIndex] } as ResponseData; // Return the updated program

         }

         if (phpPath === 'admin/reset_password.php') {
              const { userId, userType, lastName } = data as { userId: number; userType: string; lastName: string };
              let targetUsername: string | undefined;
              let targetFullname: string = `ID ${userId}`;

              if (userType === 'student') {
                  const student = mockStudents.find(s => s.id === userId);
                  if (student) targetFullname = `${student.firstName} ${student.lastName}`;
                  else throw new Error(`Student with ID ${userId} not found.`);
                  logActivity(`Reset Student Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'teacher') { // This covers both Teaching and Administrative faculty
                  const facultyMember = mockFaculty.find(f => f.id === userId);
                  if (facultyMember) targetFullname = `${facultyMember.firstName} ${facultyMember.lastName}`;
                  else throw new Error(`Faculty with ID ${userId} not found.`);
                   logActivity(`Reset Faculty Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'admin') { // Specifically for the core "admin" user (ID 0) or other non-faculty admins if any
                  const adminUser = mockAdmins.find(a => a.id === userId);
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
            const newAnnData = data as { title: string; content: string; target: any };
            const nextId = `ann${mockAnnouncements.length + 1}`;
            const newAnnouncement: Announcement = {
                id: nextId,
                title: newAnnData.title,
                content: newAnnData.content,
                date: new Date(),
                target: newAnnData.target,
                author: "Admin" // Mock author
            };
            mockAnnouncements.unshift(newAnnouncement);
            logActivity("Created Announcement", newAnnData.title, "Admin", newAnnData.target.programId || newAnnData.target.section || newAnnData.target.yearLevel || 'all', 'announcement');
            return newAnnouncement as ResponseData;
        }
         if (phpPath.match(/^sections\/([^/]+)\/adviser\/update\.php$/)) {
             const sectionId = phpPath.match(/^sections\/([^/]+)\/adviser\/update\.php$/)?.[1];
             const { adviserId } = data as { adviserId: number | null };
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
                    logActivity("Updated Grades", `For ${updated.studentName} in ${updated.subjectName}`, "Teacher"); // Assuming a teacher does this
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
                 if (logEntry.originalData.department === 'Administrative') { // If they were an admin, remove from mockAdmins too
                     mockAdmins = mockAdmins.filter(a => a.id !== logEntry.targetId);
                 }
                 logActivity("Undid: Added Faculty", `Reverted addition of ${logEntry.originalData.firstName} ${logEntry.originalData.lastName}`, "Admin");
                 undoSuccess = true;
            } else if (logEntry.action === "Deleted Faculty" && logEntry.targetType === "faculty" && logEntry.originalData) {
                mockFaculty.push(logEntry.originalData as Faculty);
                 if (logEntry.originalData.department === 'Administrative') { // If they were an admin, add back to mockAdmins
                     const facultyMember = logEntry.originalData as Faculty;
                     mockAdmins.push({
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
                // This implies restoring a sub-admin role, typically by ensuring their faculty record exists and dept is Administrative
                // For mock, if originalData contains admin details (faculty based), re-add to mockAdmins if not present
                // And ensure their faculty record department is Administrative
                const adminData = logEntry.originalData as AdminUser;
                const facultyMember = mockFaculty.find(f => f.id === adminData.id);
                if (facultyMember) {
                    facultyMember.department = 'Administrative'; // Ensure department is correct
                    if (!mockAdmins.some(a => a.id === adminData.id)) {
                        mockAdmins.push(adminData);
                    }
                    logActivity("Undid: Removed Admin Role", `Restored admin role for ${adminData.username}`, "Admin");
                    undoSuccess = true;
                } else if (mockAdmins.find(a => a.id === adminData.id && !a.isSuperAdmin)){ // Check if it was an explicitly added sub-admin
                     mockAdmins.push(adminData);
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
                // Remove the original log entry that was undone
                mockActivityLog = mockActivityLog.filter(entry => entry.id !== logId);
                return { success: true, message: "Action undone." } as ResponseData;
            } else {
                throw new Error("Undo operation failed or was not applicable.");
            }
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

                // Handle Sub Admin role based on department change
                if (updatedFaculty.department === 'Administrative' && oldDepartment !== 'Administrative') {
                    // Add to mockAdmins if not already there
                    if (!mockAdmins.some(a => a.id === updatedFaculty.id)) {
                        mockAdmins.push({
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
                    // Remove from mockAdmins if department changed from Administrative
                    mockAdmins = mockAdmins.filter(a => a.id !== updatedFaculty.id || a.isSuperAdmin); // Keep super admin
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
             const programIndex = mockPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1) {
                 const updatedData = data as unknown as Partial<Program>;
                 mockPrograms[programIndex] = {
                     ...mockPrograms[programIndex],
                     name: updatedData.name ?? mockPrograms[programIndex].name,
                     description: updatedData.description ?? mockPrograms[programIndex].description,
                     // Courses are managed separately via assign/remove endpoints
                 };
                 logActivity("Updated Program", mockPrograms[programIndex].name, "Admin", programId, "program");
                 return { ...mockPrograms[programIndex] } as ResponseData;
             }
             throw new Error("Program not found for mock update.");
         }
          if (phpPath.startsWith('courses/update.php/')) {
              const courseId = idStr;
              const courseIndex = mockCourses.findIndex(c => c.id === courseId);
              if (courseIndex > -1) {
                   const updatedCourseData = data as Partial<Course>;
                   mockCourses[courseIndex] = { ...mockCourses[courseIndex], ...updatedCourseData };
                    // Update course details in programs as well
                    mockPrograms.forEach(program => {
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
            const deletedStudent = { ...mockStudents[studentIndex] }; // Store for undo
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
             // If the deleted faculty was a Sub Admin, remove from mockAdmins
            if (deletedFaculty.department === 'Administrative') {
                 mockAdmins = mockAdmins.filter(a => a.id !== id || a.isSuperAdmin); // Keep super admin
            }
            logActivity("Deleted Faculty", `${deletedFaculty.firstName} ${deletedFaculty.lastName} (${deletedFaculty.username})`, "Admin", id, "faculty", true, deletedFaculty);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('admins/delete.php/')) {
            const adminIdToRemove = parseInt(idPart || '0', 10);
            if (adminIdToRemove === 0) throw new Error("Cannot remove Super Admin role.");

            const adminUser = mockAdmins.find(a => a.id === adminIdToRemove);
            if (!adminUser) throw new Error("Admin role not found for mock removal.");

            // Check if this admin is tied to a faculty member
            const facultyMember = mockFaculty.find(f => f.id === adminIdToRemove);
            if (facultyMember && facultyMember.department === 'Administrative') {
                // This means their admin role is derived. To "remove admin role", change their department.
                // Or, if the intent is to fully delete the faculty member, that's a different operation handled by 'teachers/delete.php'.
                // For this mock, we'll assume "Remove Admin Role" means changing their department if they are faculty.
                // However, the UI for "Manage Admins" delete should ideally delete the faculty record if that's the desired UX.
                // For simplicity in mock: if they are faculty, this action is more about changing their department or deleting faculty.
                // We will log the action but not change faculty department here as it might be confusing.
                // The actual deletion of a faculty member (which would remove their admin role) is handled by DELETE teachers/delete.php
                logActivity("Removed Admin Role", `For ${adminUser.username}. (If faculty-based, department change or faculty deletion required for full effect)`, "Admin", adminIdToRemove, "admin", true, { ...adminUser });
                // To simulate removal from admin view, remove from mockAdmins list
                mockAdmins = mockAdmins.filter(a => a.id !== adminIdToRemove);

            } else if (!facultyMember && !adminUser.isSuperAdmin) { // A standalone sub-admin entry (legacy or different setup)
                const deletedAdmin = { ...adminUser };
                mockAdmins = mockAdmins.filter(a => a.id !== adminIdToRemove);
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
             const progIndex = mockPrograms.findIndex(p => p.id === programId);
             if (progIndex === -1) throw new Error("Program not found for mock delete.");
             const deletedProgram = { ...mockPrograms[progIndex] };
             mockPrograms.splice(progIndex, 1);
             // Also remove associated courses (Majors) and section assignments
             mockCourses = mockCourses.filter(c => c.programId !== programId || c.type !== 'Major');
             mockSections = mockSections.filter(s => s.programId !== programId);
             mockSectionAssignments = mockSectionAssignments.filter(a => !mockSections.some(s => s.id === a.sectionId && s.programId === programId)); // Cascade delete
             logActivity("Deleted Program", deletedProgram.name, "Admin", programId, "program");
             return;
          }
          if (phpPath.startsWith('courses/delete.php/')) {
             const courseId = idPart;
             const courseIndex = mockCourses.findIndex(c => c.id === courseId);
             if (courseIndex === -1) throw new Error("Course not found for mock delete.");
             const deletedCourse = { ...mockCourses[courseIndex] };
             mockCourses.splice(courseIndex, 1);
             // Also remove from any program's course list and section assignments
             mockPrograms.forEach(program => {
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
             const programIndex = mockPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1 && mockPrograms[programIndex].courses[yearLevel]) {
                 const courseIndex = mockPrograms[programIndex].courses[yearLevel].findIndex(c => c.id === courseId);
                 if (courseIndex === -1) throw new Error("Course assignment not found in program/year for mock removal.");
                 const removedCourse = mockPrograms[programIndex].courses[yearLevel][courseIndex];
                 mockPrograms[programIndex].courses[yearLevel].splice(courseIndex, 1);
                 logActivity("Removed Course from Program", `${removedCourse.name} from ${mockPrograms[programIndex].name} (${yearLevel})`, "Admin");
                 return;
             }
             throw new Error("Program or year level not found for removing course assignment.");
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
        let responseBodyText = "";
        try {
            responseBodyText = await response.text();
            try {
                errorData = JSON.parse(responseBodyText); // Try parsing the text
                errorMessage = errorData?.message || responseBodyText || errorMessage;
            } catch (parseError) {
                 // If not JSON, use the text as error
                 console.error("API Error Response Text (fetchData):", responseBodyText);
                 errorMessage = responseBodyText || `HTTP error! status: ${response.status}`;
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
                // Add any other necessary headers like Authorization
            },
            body: JSON.stringify(data),
        });
    } catch (networkError: any) {
         handleFetchError(networkError, path, 'POST', true);
    }

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
        let responseBodyText = "";
        try {
            responseBodyText = await response.text(); // Read body once as text
            console.error("API Error Response Text (postData):", responseBodyText);
            try {
                 errorData = JSON.parse(responseBodyText); // Try parsing the text
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
            } catch (jsonParseError) {
                 // If JSON.parse fails, use the raw text as the error message
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
            }
        } catch (readError) {
            console.error("Failed to read error response body (postData):", readError);
             // If reading the body fails, use a generic error message
             errorData = { message: `HTTP error! status: ${response.status}. Failed to read error body.` };
             errorMessage = errorData.message;
        }
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'POST');
    }

    // Handle successful responses (200, 201)
    if (response.status === 201 || response.status === 200) {
       try {
           const contentType = response.headers.get("content-type");
           if (contentType && contentType.indexOf("application/json") !== -1) {
                return await response.json() as ResponseData;
           } else {
               // Handle non-JSON success responses if necessary
               console.log(`POST to ${url} successful with status ${response.status}, but no JSON body.`);
               // You might want to return a generic success object or void depending on expectations
               return { success: true, message: `Operation successful (Status ${response.status})` } as unknown as ResponseData;
           }
       } catch (jsonError: any) {
           // This case means the server said it was successful, but the JSON was malformed
           console.error("Failed to parse JSON response on successful POST:", jsonError);
           // Return a generic success object as the operation might have completed on the server
           return { success: true, message: "Operation successful, but response body could not be parsed." } as unknown as ResponseData;
       }
    }

    // Fallback for other successful (but not 200/201) status codes if needed
    console.warn(`Unexpected successful status code ${response.status} for POST ${url}`);
    return { success: true, message: `Operation completed with status ${response.status}.` } as unknown as ResponseData; // Or handle as an error
};

export const putData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
     if (USE_MOCK_API) return mockPutData(path, data);

    const url = getApiUrl(path);
    let response: Response;
    try {
        response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
        response = await fetch(url, { method: 'DELETE' });
    } catch (networkError: any) {
         handleFetchError(networkError, path, 'DELETE', true);
    }

    if (!response.ok && response.status !== 204) { // 204 No Content is a success for DELETE
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

    // If response.ok or status is 204, the delete was successful
    // No need to parse body for DELETE unless your API specifically returns one.
    if (response.status === 204) {
        console.log(`DELETE ${url} successful with status 204 No Content.`);
        return; // Explicitly return void for 204
    }

     // Handle cases where server might return 200 OK with a body for DELETE
     try {
         const contentType = response.headers.get("content-type");
         if (contentType && contentType.indexOf("application/json") !== -1) {
             const data = await response.json(); // If there's a JSON body
             console.log(`DELETE ${url} successful with status ${response.status}. Response data:`, data);
         } else {
             const text = await response.text(); // If there's a text body
             console.log(`DELETE ${url} successful with status ${response.status}. Response text:`, text || "(No text body)");
         }
     } catch (error: any) {
         // This might happen if there's no body or it's not parseable, but the status was OK.
         console.error("Failed to process body on successful DELETE:", error);
     }
};


// Helper function for formatting dates (e.g., YYYYMMDD)
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Export mock data for potential use in other parts of the app if needed during development
export { USE_MOCK_API, mockPrograms, mockCourses, mockActivityLog, logActivity, mockFaculty, mockStudents, mockSections, mockAnnouncements, mockSectionAssignments };
