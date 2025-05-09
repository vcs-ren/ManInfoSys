
'use client';

import type { Student, Faculty, Section, Course, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole, CourseType, YearLevel, ActivityLogEntry } from '@/types';
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateAdminUsername, generateTeacherUsername, generateStudentId } from '@/lib/utils';

// --- MOCK DATA STORE ---
let nextStudentDbId = 3;
let nextFacultyDbId = 3;
let nextProgramDbId = 3;
let nextCourseDbId = 10;
let nextActivityLogId = 1;

let mockStudents: Student[] = [
  { id: 1, studentId: "101", username: "s101", firstName: "Alice", lastName: "Smith", program: "Computer Science", status: "Returnee", year: "2nd Year", section: "CS-2A", email: "alice@example.com", phone: "123-456-7890", emergencyContactName: "John Smith", emergencyContactRelationship: "Father", emergencyContactPhone: "111-222-3333", emergencyContactAddress: "123 Main St" },
  { id: 2, studentId: "102", username: "s102", firstName: "Bob", lastName: "Johnson", program: "Information Technology", status: "New", year: "1st Year", section: "IT-1B", email: "bob@example.com", phone: "987-654-3210" },
];

let mockFaculty: Faculty[] = [
  { id: 1, teacherId: "1001", username: "t1001", firstName: "David", lastName: "Lee", department: "Teaching", email: "david.lee@example.com", phone: "555-1234", employmentType: 'Regular' },
  { id: 2, teacherId: "1002", username: "a1002", firstName: "Eve", lastName: "Davis", department: "Administrative", email: "eve.davis@example.com", employmentType: 'Part Time' },
];

let mockCourses: Course[] = [
    { id: "CS101", name: "Introduction to Programming", description: "Fundamentals of programming.", type: "Major", programId: "CS", yearLevel: "1st Year" },
    { id: "IT101", name: "IT Fundamentals", description: "Basics of IT.", type: "Major", programId: "IT", yearLevel: "1st Year" },
    { id: "CS201", name: "Data Structures", description: "Study of data organization.", type: "Major", programId: "CS", yearLevel: "2nd Year" },
    { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills", type: "Minor" },
];

let mockPrograms: Program[] = [
    {
        id: "CS", name: "Computer Science", description: "Focuses on algorithms, data structures, and software development.",
        courses: { "1st Year": [mockCourses[0]], "2nd Year": [mockCourses[2]], "3rd Year": [], "4th Year": [] },
    },
    {
        id: "IT", name: "Information Technology", description: "Focuses on network administration, system management, and web technologies.",
        courses: { "1st Year": [mockCourses[1]], "2nd Year": [], "3rd Year": [], "4th Year": [] },
    },
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
  { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year.", date: new Date(2024, 7, 15), target: { programId: "all" }, author: "Admin" },
];

let mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = [
    { assignmentId: "1-CS201", studentId: 1, studentName: "Alice Smith", subjectId: "CS201", subjectName: "Data Structures", section: "CS-2A", year: "2nd Year", prelimGrade: 85, prelimRemarks: "Good start", midtermGrade: 90, midtermRemarks: "Excellent", finalGrade: 88, finalRemarks: "Very Good", status: "Complete" },
    { assignmentId: "2-IT101", studentId: 2, studentName: "Bob Johnson", subjectId: "IT101", subjectName: "IT Fundamentals", section: "IT-1B", year: "1st Year", prelimGrade: null, prelimRemarks: "", midtermGrade: null, midtermRemarks: "", finalGrade: null, finalRemarks: "", status: "Not Submitted" },
];

let mockAdmins: AdminUser[] = [
    { id: 0, username: "admin", firstName: "Super", lastName: "Admin", email: "superadmin@example.com", role: "Super Admin", isSuperAdmin: true },
    { id: 1, username: "a1001", firstName: "Sub", lastName: "AdminOne", email: "subadmin1@example.com", role: "Sub Admin", isSuperAdmin: false },
];

let mockActivityLog: ActivityLogEntry[] = [
    { id: "log0", timestamp: new Date(Date.now() - 1000 * 60 * 5), user: "System", action: "System Startup", description: "System initialized successfully.", canUndo: false }
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


let mockDashboardStats: DashboardStats;

// Function to recalculate dashboard stats from current mock data
const recalculateDashboardStats = () => {
    const teachingStaffCount = mockFaculty.filter(f => f.department === 'Teaching').length;
    const adminStaffFacultyCount = mockFaculty.filter(f => f.department === 'Administrative').length;

    // Total Admins = Super Admin (1) + Faculty members with 'Administrative' department
    const totalAdminsCount = 1 + adminStaffFacultyCount;

    mockDashboardStats = {
        totalStudents: mockStudents.length,
        totalTeachers: teachingStaffCount,
        totalAdmins: totalAdminsCount,
        upcomingEvents: 1, // Keep upcoming events static for now
    };
};
// Initial calculation after mock data declarations
recalculateDashboardStats();


let mockTestUsers = [
    { username: "admin", password: "defadmin", role: "Admin" as const, userId: 0 },
    { username: "s101", password: "password", role: "Student" as const, userId: 1 },
    { username: "t1001", password: "password", role: "Teacher" as const, userId: 1 },
    { username: "a1002", password: "password", role: "Teacher" as const, userId: 2 },
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
            const superAdmin = mockAdmins.find(a => a.isSuperAdmin);
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
            const allAdmins = superAdmin ? [superAdmin, ...facultyAdmins] : facultyAdmins;
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
            recalculateDashboardStats();
            return { ...mockDashboardStats } as T;
        }
         if (phpPath.match(/^sections\/([^/]+)\/assignments\/read\.php$/)) { // Updated regex to match new structure
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
                .filter(a => a.teacherId === 1) // Assuming teacher ID 1
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
            return [...mockActivityLog].slice(0, 10) as T; // Return last 10 activities
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
                logActivity("User Login", `${user.username} logged in.`, user.username, user.userId, user.role.toLowerCase() as ActivityLogEntry['targetType']);
                return { success: true, role: user.role as any, redirectPath: redirectPath, userId: user.userId } as ResponseData;
             }
             throw new Error("Invalid mock credentials.");
        }
         if (phpPath === 'students/create.php') {
            const newStudentData = data as unknown as Omit<Student, 'id' | 'studentId' | 'section' | 'username'>;
            const nextId = nextStudentDbId++;
            const studentIdStr = generateStudentId(nextId);
            const username = generateStudentUsername(studentIdStr);
            const section = generateSectionCode(newStudentData.year || '1st Year');
            const student: Student = {
                ...newStudentData,
                id: nextId,
                studentId: studentIdStr,
                username: username,
                section: section
            };
            mockStudents.push(student);
            logActivity("Added Student", `${student.firstName} ${student.lastName} (${student.username})`, "Admin", student.id, "student", true, { ...student, passwordHash: "mock_hash" }); // Add canUndo and originalData
            recalculateDashboardStats();
            return student as ResponseData;
        }
         if (phpPath === 'teachers/create.php') {
            const newFacultyData = data as unknown as Omit<Faculty, 'id' | 'teacherId' | 'username'>;
            const nextId = nextFacultyDbId++;
            const teacherIdStr = generateTeacherId(nextId);
            const department = newFacultyData.department || 'Teaching';
            const username = generateTeacherUsername(teacherIdStr, department);

            const faculty: Faculty = {
                ...newFacultyData,
                id: nextId,
                teacherId: teacherIdStr,
                username: username,
            };
            mockFaculty.push(faculty);
            logActivity("Added Faculty", `${faculty.firstName} ${faculty.lastName} (${faculty.username})`, "Admin", faculty.id, "faculty", true, { ...faculty, passwordHash: "mock_hash" });
            recalculateDashboardStats();
            return faculty as ResponseData;
        }
         if (phpPath === 'programs/create.php') {
             const newProgramData = data as unknown as Program;
             const newProgram: Program = {
                 id: newProgramData.id || newProgramData.name.toUpperCase().substring(0, 3) + Date.now().toString().slice(-3),
                 name: newProgramData.name,
                 description: newProgramData.description,
                 courses: newProgramData.courses || { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] },
             };
             if (mockPrograms.some(p => p.id === newProgram.id)) {
                 throw new Error("Program with this ID already exists.");
             }
             Object.values(newProgram.courses).flat().forEach(course => {
                 if (!mockCourses.some(c => c.id === course.id)) {
                     mockCourses.push({ ...course, programId: newProgram.id });
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
                return { success: true, program: mockPrograms[programIndex] } as ResponseData;

         }

         if (phpPath === 'admin/reset_password.php') {
              const { userId, userType, lastName } = data as { userId: number; userType: string; lastName: string };
              let targetArray: (Student | Faculty | AdminUser)[];
              let targetUsername: string | undefined;
              let targetFullname: string = `ID ${userId}`;

              if (userType === 'student') {
                  targetArray = mockStudents;
                  const student = mockStudents.find(s => s.id === userId);
                  if (student) targetFullname = `${student.firstName} ${student.lastName}`;
              } else if (userType === 'teacher') {
                  targetArray = mockFaculty;
                  const facultyMember = mockFaculty.find(f => f.id === userId);
                   if (facultyMember) targetFullname = `${facultyMember.firstName} ${facultyMember.lastName}`;
              } else if (userType === 'admin') {
                  const facultyAdmin = mockFaculty.find(f => f.id === userId && f.department === 'Administrative');
                  if (facultyAdmin) {
                      targetUsername = facultyAdmin.username;
                      targetFullname = `${facultyAdmin.firstName} ${facultyAdmin.lastName}`;
                  } else {
                      const coreAdmin = mockAdmins.find(a => a.id === userId);
                      if (coreAdmin?.isSuperAdmin) throw new Error("Cannot reset super admin password this way.");
                      targetUsername = coreAdmin?.username;
                      if(coreAdmin) targetFullname = `${coreAdmin.firstName} ${coreAdmin.lastName}`;
                  }
                  console.log(`Mock password reset for admin ${targetFullname} (username: ${targetUsername}) using lastName: ${lastName}`);
                  logActivity("Reset Admin Password", `For ${targetFullname} (${targetUsername})`, "Admin");
                  return { message: `Admin password reset successfully.` } as ResponseData;
              } else {
                  throw new Error(`Invalid user type for password reset: ${userType}`);
              }

              const userIndex = targetArray.findIndex(u => u.id === userId);
              if (userIndex > -1) {
                  console.log(`Mock password reset for ${userType} ${targetFullname} using lastName: ${lastName}`);
                  logActivity(`Reset ${userType.charAt(0).toUpperCase() + userType.slice(1)} Password`, `For ${targetFullname}`, "Admin");
                  return { message: `${userType} password reset successfully.` } as ResponseData;
              }
             throw new Error(`${userType} with ID ${userId} not found.`);
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
            if (logEntry.action === "Added Student" && logEntry.targetType === "student" && logEntry.originalData) {
                mockStudents = mockStudents.filter(s => s.id !== logEntry.targetId);
                logActivity("Undid: Added Student", `Reverted addition of ${logEntry.originalData.firstName} ${logEntry.originalData.lastName}`, "Admin");
            } else if (logEntry.action === "Deleted Student" && logEntry.targetType === "student" && logEntry.originalData) {
                mockStudents.push(logEntry.originalData as Student);
                logActivity("Undid: Deleted Student", `Restored ${logEntry.originalData.firstName} ${logEntry.originalData.lastName}`, "Admin");
            } else if (logEntry.action === "Added Faculty" && logEntry.targetType === "faculty" && logEntry.originalData) {
                mockFaculty = mockFaculty.filter(f => f.id !== logEntry.targetId);
                 logActivity("Undid: Added Faculty", `Reverted addition of ${logEntry.originalData.firstName} ${logEntry.originalData.lastName}`, "Admin");
            } else if (logEntry.action === "Deleted Faculty" && logEntry.targetType === "faculty" && logEntry.originalData) {
                mockFaculty.push(logEntry.originalData as Faculty);
                logActivity("Undid: Deleted Faculty", `Restored ${logEntry.originalData.firstName} ${logEntry.originalData.lastName}`, "Admin");
            } else {
                 throw new Error("Undo for this action type is not fully implemented in mock.");
            }
            recalculateDashboardStats();
            mockActivityLog.splice(logEntryIndex, 1); // Remove the "undone" log itself
            return { success: true, message: "Action undone." } as ResponseData;
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
                mockFaculty[facultyIndex] = { ...mockFaculty[facultyIndex], ...(data as unknown as Partial<Faculty>) };
                logActivity("Updated Faculty", `${mockFaculty[facultyIndex].firstName} ${mockFaculty[facultyIndex].lastName}`, "Admin", id, "faculty");
                recalculateDashboardStats();
                return { ...mockFaculty[facultyIndex] } as ResponseData;
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
                     courses: mockPrograms[programIndex].courses,
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
            logActivity("Deleted Faculty", `${deletedFaculty.firstName} ${deletedFaculty.lastName} (${deletedFaculty.username})`, "Admin", id, "faculty", true, deletedFaculty);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('admins/delete.php/')) {
            const adminIdToRemove = parseInt(idPart || '0', 10);
            if (adminIdToRemove === 0) throw new Error("Cannot remove Super Admin role.");
            const adminIndex = mockAdmins.findIndex(a => a.id === adminIdToRemove);
            if (adminIndex > -1) { // If it was a non-faculty admin (legacy)
                const deletedAdmin = { ...mockAdmins[adminIndex] };
                mockAdmins.splice(adminIndex, 1);
                logActivity("Removed Admin Role", `For ${deletedAdmin.username}`, "Admin", adminIdToRemove, "admin");
            } else {
                // If it was a faculty-derived admin, their faculty record needs deletion,
                // or department change, which handles the admin role implicitly.
                // This path mainly handles the case where an Admin User entry exists separately.
                 const facultyAdmin = mockFaculty.find(f => f.id === adminIdToRemove && f.department === "Administrative");
                 if (facultyAdmin) {
                      // To truly remove their admin role, one would delete the faculty or change their dept.
                      // Here, we just log it, assuming deletion happens at faculty level.
                      logActivity("Admin Role (Faculty) Deletion Attempted", `Faculty ${facultyAdmin.firstName} ${facultyAdmin.lastName} admin role removal would occur if faculty is deleted or department changed.`, "Admin");
                 } else {
                     throw new Error("Admin role not found for mock removal.");
                 }
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
             mockCourses = mockCourses.filter(c => c.programId !== programId || c.type !== 'Major');
             mockSections = mockSections.filter(s => s.programId !== programId);
             mockSectionAssignments = mockSectionAssignments.filter(a => !mockSections.find(s => s.id === a.sectionId && s.programId === programId));
             logActivity("Deleted Program", deletedProgram.name, "Admin", programId, "program");
             return;
          }
          if (phpPath.startsWith('courses/delete.php/')) {
             const courseId = idPart;
             const courseIndex = mockCourses.findIndex(c => c.id === courseId);
             if (courseIndex === -1) throw new Error("Course not found for mock delete.");
             const deletedCourse = { ...mockCourses[courseIndex] };
             mockCourses.splice(courseIndex, 1);
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
export const fetchData = USE_MOCK_API ? mockFetchData : async <T>(path: string): Promise<T> => {
    const url = getApiUrl(path);
    let response: Response;
    try {
        response = await fetch(url, { method: 'GET' });
    } catch (networkError: any) {
        return handleFetchError(networkError, path, 'GET', true);
    }

    if (!response.ok) {
        let errorData: any;
        let errorMessage = `HTTP error! status: ${response.status}`;
        let responseBodyText = "";
        try {
            responseBodyText = await response.text();
            try {
                errorData = JSON.parse(responseBodyText);
                errorMessage = errorData?.message || responseBodyText || errorMessage;
            } catch (parseError) {
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

export const postData = USE_MOCK_API ? mockPostData : async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const url = getApiUrl(path);
    let response;
     console.log(`Posting data to: ${url}`, data);
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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

export const putData = USE_MOCK_API ? mockPutData : async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
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

export const deleteData = USE_MOCK_API ? mockDeleteData : async (path: string): Promise<void> => {
    const url = getApiUrl(path);
    let response: Response;
    try {
        response = await fetch(url, { method: 'DELETE' });
    } catch (networkError: any) {
         handleFetchError(networkError, path, 'DELETE', true);
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


// Helper function for formatting dates
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

export { USE_MOCK_API, mockPrograms, mockCourses, mockActivityLog, logActivity };
