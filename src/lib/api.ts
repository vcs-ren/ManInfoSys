
'use client';

import type { Student, Teacher, Section, Subject, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, AdminRole } from '@/types'; // Added Program, AdminRole
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateAdminUsername, generateTeacherUsername } from '@/lib/utils';

// --- MOCK DATA STORE ---
let nextStudentDbId = 3;
let nextTeacherDbId = 3;
let nextAdminDbId = 2; // Start after initial mocks

let mockStudents: Student[] = [
  { id: 1, studentId: "101", username: "s101", firstName: "Alice", lastName: "Smith", course: "Computer Science", status: "Returnee", year: "2nd Year", section: "CS-2A", email: "alice@example.com", phone: "123-456-7890", emergencyContactName: "John Smith", emergencyContactRelationship: "Father", emergencyContactPhone: "111-222-3333", emergencyContactAddress: "123 Main St" },
  { id: 2, studentId: "102", username: "s102", firstName: "Bob", lastName: "Johnson", course: "Information Technology", status: "New", year: "1st Year", section: "IT-1B", email: "bob@example.com", phone: "987-654-3210" },
];

let mockTeachers: Teacher[] = [
  { id: 1, teacherId: "t1001", username: "t1001", firstName: "David", lastName: "Lee", department: "Computer Science", email: "david.lee@example.com", phone: "555-1234", employmentType: 'Regular' },
  { id: 2, teacherId: "t1002", username: "t1002", firstName: "Eve", lastName: "Davis", department: "Information Technology", email: "eve.davis@example.com", employmentType: 'Part Time' },
];

let mockPrograms: Program[] = [
    { id: "CS", name: "Computer Science", description: "Focuses on algorithms, data structures, and software development.", courses: {
        "1st Year": [{ id: "CS101", name: "Introduction to Programming", description: "Fundamentals of programming.", programId: "CS", yearLevel: "1st Year" }],
        "2nd Year": [{ id: "CS201", name: "Data Structures", description: "Study of data organization.", programId: "CS", yearLevel: "2nd Year" }],
        "3rd Year": [],
        "4th Year": [],
    }},
    { id: "IT", name: "Information Technology", description: "Focuses on network administration, system management, and web technologies.", courses: {
        "1st Year": [{ id: "IT101", name: "IT Fundamentals", description: "Basics of IT.", programId: "IT", yearLevel: "1st Year" }],
        "2nd Year": [],
        "3rd Year": [],
        "4th Year": [],
    }},
];

// Update mockSections to use programId
let mockSections: Section[] = [
    { id: "CS-1A", sectionCode: "CS-1A", programId: "CS", programName: "Computer Science", yearLevel: "1st Year", adviserId: 1, adviserName: "David Lee", studentCount: 0 },
    { id: "CS-2A", sectionCode: "CS-2A", programId: "CS", programName: "Computer Science", yearLevel: "2nd Year", adviserId: 1, adviserName: "David Lee", studentCount: 1 },
    { id: "IT-1B", sectionCode: "IT-1B", programId: "IT", programName: "Information Technology", yearLevel: "1st Year", studentCount: 1 },
];

// Add programId and yearLevel to mockSubjects
let mockSubjects: Subject[] = [
  { id: "CS101", name: "Introduction to Programming", description: "Basics of programming", programId: "CS", yearLevel: "1st Year" },
  { id: "IT202", name: "Networking Fundamentals", description: "Understanding computer networks", programId: "IT", yearLevel: "2nd Year" }, // Example, might be IT
  { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills" }, // General subject, no specific program/year
  { id: "CS201", name: "Data Structures", description: "Study of data organization.", programId: "CS", yearLevel: "2nd Year" },
  { id: "IT101", name: "IT Fundamentals", description: "Basics of IT.", programId: "IT", yearLevel: "1st Year" },

];

let mockSectionAssignments: SectionSubjectAssignment[] = [
    { id: "CS-2A-CS201", sectionId: "CS-2A", subjectId: "CS201", subjectName: "Data Structures", teacherId: 1, teacherName: "David Lee" },
    { id: "IT-1B-IT101", sectionId: "IT-1B", subjectId: "IT101", subjectName: "IT Fundamentals", teacherId: 2, teacherName: "Eve Davis" },
];

// Update mockAnnouncements target to use programId
let mockAnnouncements: Announcement[] = [
  { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year.", date: new Date(2024, 7, 15), target: { programId: "all" }, author: "Admin" },
];

let mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = [
    { assignmentId: "1-CS201", studentId: 1, studentName: "Alice Smith", subjectId: "CS201", subjectName: "Data Structures", section: "CS-2A", year: "2nd Year", prelimGrade: 85, prelimRemarks: "Good start", midtermGrade: 90, midtermRemarks: "Excellent", finalGrade: 88, finalRemarks: "Very Good", status: "Complete" },
    { assignmentId: "2-IT101", studentId: 2, studentName: "Bob Johnson", subjectId: "IT101", subjectName: "IT Fundamentals", section: "IT-1B", year: "1st Year", prelimGrade: null, prelimRemarks: "", midtermGrade: null, midtermRemarks: "", finalGrade: null, finalRemarks: "", status: "Not Submitted" },
];

// Update mockAdmins to remove names and add role
let mockAdmins: AdminUser[] = [
    { id: 0, username: "admin", email: "superadmin@example.com", role: "Super Admin", isSuperAdmin: true },
    { id: 1, username: "a1001", email: "subadmin1@example.com", role: "Sub Admin", isSuperAdmin: false }
];

let mockDashboardStats: DashboardStats = {
    totalStudents: mockStudents.length,
    totalTeachers: mockTeachers.length,
    totalAdmins: mockAdmins.length,
    upcomingEvents: 1,
};

// Update mockTestUsers for login (no password check anymore)
let mockTestUsers = [
    { username: "admin", role: "Admin", userId: 0 },
    { username: "s101", role: "Student", userId: 1 },
    { username: "t1001", role: "Teacher", userId: 1 },
    { username: "a1001", role: "Admin", userId: 1 }, // Add Sub Admin test user
];

// --- API CONFIGURATION ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Use localhost:8000 for PHP backend

const getApiUrl = (path: string): string => {
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    // REMOVE /api prefix for PHP calls
    const finalPath = formattedPath.startsWith('/api/') ? formattedPath.substring(4) : formattedPath;
    return `${baseUrl}${finalPath}`;
};

// --- ERROR HANDLING ---
const handleFetchError = (error: any, path: string, method: string, isNetworkError: boolean = false): never => {
    const targetUrl = getApiUrl(path);
    let errorMessage = `Failed to ${method.toLowerCase()} data from ${targetUrl}.`;
    let detailedLog = `API Request Details:\n    - Method: ${method}\n    - URL: ${targetUrl}`;

    if (typeof window !== 'undefined') {
        detailedLog += `\n    - Frontend Origin: ${window.location.origin}`;
    }

    if (isNetworkError || error.message === 'Failed to fetch') {
        errorMessage = `Network Error: Could not connect to the API backend at ${targetUrl}.

        Possible Causes & Checks:
        1. PHP Server Status: Is the PHP server running? Start it using: 'php -S localhost:8000 -t src/api' in your project's root terminal.
        2. Backend URL: Is the API_BASE_URL (${API_BASE_URL}) correct and accessible from your browser?
        3. Endpoint Path: Is the API endpoint path "${finalPath(path)}" correct relative to the 'src/api' directory? (e.g., /login.php, /students/read.php)
        4. CORS Policy: Is the PHP backend configured to allow requests from your frontend origin (${typeof window !== 'undefined' ? window.location.origin : 'N/A'})? Check 'Access-Control-Allow-Origin' headers in your PHP files.
        5. Firewall/Network: Could a firewall or network issue be blocking the connection?
        6. Browser Console: Check the browser's Network tab for the failed request details and the Console tab for specific CORS error messages.
        `;
        detailedLog += `\n    - Error Type: NetworkError (Failed to fetch)`;
    } else {
        errorMessage = error.message || `An unexpected error occurred during the ${method} request.`;
        detailedLog += `\n    - Error Type: ${error.name || 'UnknownError'}`;
        detailedLog += `\n    - Error Message: ${error.message}`;
    }
    detailedLog += `\n    \n        Troubleshooting Tips:\n        - Ensure the PHP server is running and listening on the correct port (8000 in this case).\n        - Check the PHP server's console output for any startup errors or errors during the request.\n        - Verify the 'Access-Control-Allow-Origin' header in the failing PHP endpoint matches your frontend origin or is '*'.\n        - Temporarily simplify the PHP endpoint to just return headers and a basic JSON to isolate the issue.\n        `;


    console.error("Detailed Fetch Error Log:", detailedLog);
    throw new Error(errorMessage);
};

// Helper to get final path without /api/
const finalPath = (path: string) => {
     const formattedPath = path.startsWith('/') ? path : `/${path}`;
     return formattedPath.startsWith('/api/') ? formattedPath.substring(4) : formattedPath;
}

// --- API HELPER FUNCTIONS ---
export const fetchData = async <T>(path: string): Promise<T> => {
    const phpPath = finalPath(path); // Use the final path for mock logic matching
    console.log(`MOCK fetchData from: ${phpPath}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
        if (phpPath === '/students/read.php') return [...mockStudents] as T;
        if (phpPath === '/teachers/read.php') return [...mockTeachers] as T;
        if (phpPath === '/admins/read.php') return [...mockAdmins] as T;
        if (phpPath === '/programs/read.php') return [...mockPrograms] as T; // Added programs endpoint
        if (phpPath === '/sections/read.php') {
             return [...mockSections.map(s => ({
                 ...s,
                 programName: mockPrograms.find(p => p.id === s.programId)?.name || s.programId, // Add programName
             }))] as T;
        }
        if (phpPath === '/subjects/read.php') return [...mockSubjects] as T;
        if (phpPath === '/announcements/read.php' || phpPath === '/student/announcements/read.php' || phpPath === '/teacher/announcements/read.php') {
            return [...mockAnnouncements].sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === '/admin/dashboard-stats.php') {
            mockDashboardStats.totalStudents = mockStudents.length;
            mockDashboardStats.totalTeachers = mockTeachers.length;
            mockDashboardStats.totalAdmins = mockAdmins.length;
            return { ...mockDashboardStats } as T;
        }
         if (phpPath.match(/^\/sections\/([^/]+)\/assignments$/)) { // Adjusted regex
            const sectionId = phpPath.match(/^\/sections\/([^/]+)\/assignments$/)?.[1];
             return mockSectionAssignments.filter(a => a.sectionId === sectionId).map(a => ({
                 ...a,
                 subjectName: mockSubjects.find(s => s.id === a.subjectId)?.name || a.subjectId, // Add subjectName
                 teacherName: mockTeachers.find(t => t.id === a.teacherId)?.firstName + ' ' + mockTeachers.find(t => t.id === a.teacherId)?.lastName || `Teacher ID ${a.teacherId}`, // Add teacherName
             })) as T;
        }
         if (phpPath === '/student/grades/read.php') {
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
         if (phpPath === '/teacher/assignments/grades/read.php') {
             return mockStudentSubjectAssignmentsWithGrades.filter(g => {
                 const assignment = mockSectionAssignments.find(a => a.subjectId === g.subjectId && g.section === a.sectionId);
                 return assignment?.teacherId === 1; // Assuming teacher ID 1
             }) as T;
         }
         if (phpPath === '/student/profile/read.php') {
             const student = mockStudents.find(s => s.id === 1); // Assuming student ID 1
             if (student) return { ...student } as T;
             throw new Error("Mock student profile not found.");
        }
        if (phpPath === '/teacher/profile/read.php') {
             const teacher = mockTeachers.find(t => t.id === 1); // Assuming teacher ID 1
             if (teacher) return { ...teacher } as T;
             throw new Error("Mock teacher profile not found.");
        }
         if (phpPath === '/student/schedule/read.php') {
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
         if (phpPath === '/teacher/schedule/read.php') {
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
         if (phpPath === '/teacher/subjects/read.php') {
             const subjectIds = new Set(mockSectionAssignments.filter(a => a.teacherId === 1).map(a => a.subjectId)); // Assuming teacher ID 1
             return mockSubjects.filter(s => subjectIds.has(s.id)) as T;
         }
          if (phpPath === '/student/upcoming/read.php') {
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

        console.warn(`Mock API unhandled GET path: ${phpPath}`);
        return [] as T;
    } catch (error: any) {
        console.error(`Error in mock fetchData for ${phpPath}:`, error);
        throw error; // Re-throw original error for now
    }
};

export const postData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const phpPath = finalPath(path);
    console.log(`MOCK postData to: ${phpPath}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
         if (phpPath === '/login.php') {
             const { username } = data as any;
             const user = mockTestUsers.find(u => u.username === username);
             if (user) {
                const redirectPath = user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Student' ? '/student/dashboard' : '/teacher/dashboard';
                return { success: true, role: user.role, redirectPath: redirectPath, userId: user.userId } as ResponseData;
             }
             throw new Error("Invalid mock credentials.");
        }
         if (phpPath === '/students/create.php') {
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
            return student as ResponseData;
        }
         if (phpPath === '/teachers/create.php') {
            const newTeacherData = data as unknown as Omit<Teacher, 'id' | 'teacherId' | 'username'>;
            const nextId = nextTeacherDbId++;
            const teacherIdStr = generateTeacherId(nextId);
            const username = generateTeacherUsername(teacherIdStr);
            const teacher: Teacher = {
                ...newTeacherData,
                id: nextId,
                teacherId: teacherIdStr,
                username: username,
            };
            mockTeachers.push(teacher);
            return teacher as ResponseData;
        }
         if (phpPath === '/admins/create.php') {
            const newAdminData = data as unknown as Pick<AdminUser, 'email' | 'role'>;
            const nextId = nextAdminDbId++;
            const adminUser: AdminUser = {
                id: nextId,
                username: generateAdminUsername(nextId),
                email: newAdminData.email,
                role: newAdminData.role,
                isSuperAdmin: newAdminData.role === 'Super Admin', // Set based on role
            };
            mockAdmins.push(adminUser);
            return adminUser as ResponseData;
        }
        if (phpPath === '/programs/create.php') {
            const newProgramData = data as unknown as Omit<Program, 'courses'> & { id: string };
            const newProgram: Program = {
                ...newProgramData,
                courses: { // Initialize with empty courses
                    "1st Year": [],
                    "2nd Year": [],
                    "3rd Year": [],
                    "4th Year": [],
                },
            };
             if (mockPrograms.some(p => p.id === newProgram.id)) {
                throw new Error("Program with this ID already exists.");
            }
            mockPrograms.push(newProgram);
            return newProgram as ResponseData;
        }
        if (phpPath.match(/^\/programs\/([^/]+)\/courses\/add$/)) {
             const programId = phpPath.match(/^\/programs\/([^/]+)\/courses\/add$/)?.[1];
             const courseData = data as Subject;
             const programIndex = mockPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1) {
                const year = courseData.yearLevel || "1st Year"; // Default to 1st year if not specified
                 if (!mockPrograms[programIndex].courses[year]) {
                     mockPrograms[programIndex].courses[year] = [];
                 }
                // Ensure unique course ID within the program/year? (Or globally?)
                const newCourseId = courseData.id || `${programId}-${year.charAt(0)}-${mockPrograms[programIndex].courses[year].length + 1}`;
                 const newCourse: Subject = {
                    ...courseData,
                    id: newCourseId,
                    programId: programId,
                    yearLevel: year,
                 };
                 mockPrograms[programIndex].courses[year].push(newCourse);
                 return newCourse as ResponseData;
             }
             throw new Error("Program not found.");
        }
         if (phpPath === '/admin/reset_password.php') {
             const { userId, userType } = data as { userId: number, userType: string }; // Removed lastName
              const userArray = userType === 'student' ? mockStudents : userType === 'teacher' ? mockTeachers : mockAdmins;
              const userIndex = userArray.findIndex(u => u.id === userId);

              if (userIndex > -1) {
                    if (userType === 'admin' && (userArray[userIndex] as AdminUser).isSuperAdmin) {
                         throw new Error("Cannot reset super admin password.");
                    }
                    console.log(`Mock password reset for ${userType} ID ${userId}`);
                    return { message: `${userType} password reset successfully.` } as ResponseData;
               }
             throw new Error(`${userType} with ID ${userId} not found.`);
        }
        if (phpPath === '/announcements/create.php') {
            const newAnnData = data as { title: string; content: string; target: any };
            const nextId = `ann${mockAnnouncements.length + 1}`;
            const newAnnouncement: Announcement = {
                id: nextId,
                title: newAnnData.title,
                content: newAnnData.content,
                date: new Date(),
                target: newAnnData.target, // Includes programId now
                author: "Admin"
            };
            mockAnnouncements.unshift(newAnnouncement);
            return newAnnouncement as ResponseData;
        }
         if (phpPath.match(/^\/sections\/([^/]+)\/adviser$/)) { // Adjusted regex
             const sectionId = phpPath.match(/^\/sections\/([^/]+)\/adviser$/)?.[1];
             const { adviserId } = data as { adviserId: number | null };
             const sectionIndex = mockSections.findIndex(s => s.id === sectionId);
             if (sectionIndex > -1) {
                 const adviser = mockTeachers.find(t => t.id === adviserId);
                 mockSections[sectionIndex].adviserId = adviserId ?? undefined;
                 mockSections[sectionIndex].adviserName = adviser ? `${adviser.firstName} ${adviser.lastName}` : undefined;
                 return { ...mockSections[sectionIndex] } as ResponseData;
             }
             throw new Error("Section not found.");
         }
         if (phpPath === '/sections/assignments/create.php') {
             const { sectionId, subjectId, teacherId } = data as { sectionId: string; subjectId: string; teacherId: number };
             const subject = mockSubjects.find(s => s.id === subjectId);
             const teacher = mockTeachers.find(t => t.id === teacherId);
             const assignmentId = `${sectionId}-${subjectId}`;
              if (mockSectionAssignments.some(a => a.id === assignmentId)) {
                   throw new Error("This subject is already assigned to this section.");
              }
             const newAssignment: SectionSubjectAssignment = {
                 id: assignmentId,
                 sectionId,
                 subjectId,
                 subjectName: subject?.name,
                 teacherId,
                 teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : undefined
             };
             mockSectionAssignments.push(newAssignment);
             return newAssignment as ResponseData;
         }
         if (phpPath === '/assignments/grades/update.php') {
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
                    const subject = mockSubjects.find(s => s.id === gradeData.subjectId);
                    const newEntry: StudentSubjectAssignmentWithGrades = {
                        ...gradeData,
                        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
                        subjectName: subject ? subject.name : 'Unknown',
                        section: mockStudents.find(s => s.id === gradeData.studentId)?.section || 'N/A',
                         year: mockStudents.find(s => s.id === gradeData.studentId)?.year || 'N/A',
                        status: status,
                    };
                    mockStudentSubjectAssignmentsWithGrades.push(newEntry);
                    return newEntry as ResponseData;
               }
         }
        if (phpPath === '/admin/change_password.php') return { message: "Admin password updated successfully." } as ResponseData;
        if (phpPath === '/student/change_password.php') return { message: "Student password updated successfully." } as ResponseData;
        if (phpPath === '/teacher/change_password.php') return { message: "Teacher password updated successfully." } as ResponseData;

        console.warn(`Mock API unhandled POST path: ${phpPath}`);
         throw new Error(`Mock POST endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
         console.error(`Error in mock postData for ${phpPath}:`, error);
         throw error; // Re-throw original error
    }
};

export const putData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const phpPath = finalPath(path);
    console.log(`MOCK putData to: ${phpPath}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const idStr = phpPath.split('/').pop() || '';

    try {
         if (phpPath.startsWith('/students/update.php/')) {
            const id = parseInt(idStr, 10);
            const studentIndex = mockStudents.findIndex(s => s.id === id);
            if (studentIndex > -1) {
                mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...(data as unknown as Partial<Student>) };
                return { ...mockStudents[studentIndex] } as ResponseData;
            }
            throw new Error("Student not found for mock update.");
        }
         if (phpPath.startsWith('/teachers/update.php/')) {
            const id = parseInt(idStr, 10);
            const teacherIndex = mockTeachers.findIndex(t => t.id === id);
             if (teacherIndex > -1) {
                mockTeachers[teacherIndex] = { ...mockTeachers[teacherIndex], ...(data as unknown as Partial<Teacher>) };
                return { ...mockTeachers[teacherIndex] } as ResponseData;
            }
            throw new Error("Teacher not found for mock update.");
        }
         if (phpPath === '/student/profile/update.php') {
            const profileData = data as Student;
            const index = mockStudents.findIndex(s => s.id === profileData.id);
            if (index > -1) {
                mockStudents[index] = { ...mockStudents[index], ...profileData };
                return { ...mockStudents[index] } as ResponseData;
            }
            throw new Error("Mock student profile not found for update.");
        }
         if (phpPath === '/teacher/profile/update.php') {
             const profileData = data as Teacher;
             const index = mockTeachers.findIndex(t => t.id === profileData.id);
             if (index > -1) {
                 mockTeachers[index] = { ...mockTeachers[index], ...profileData };
                 return { ...mockTeachers[index] } as ResponseData;
             }
             throw new Error("Mock teacher profile not found for update.");
         }
          if (phpPath.startsWith('/programs/update.php/')) {
             const programId = idStr;
             const programIndex = mockPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1) {
                 mockPrograms[programIndex] = { ...mockPrograms[programIndex], ...(data as unknown as Partial<Program>) };
                 // Ensure courses structure is preserved if not updated
                 if (!(data as any).courses) {
                    mockPrograms[programIndex].courses = mockPrograms[programIndex].courses || { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] };
                 }
                 return { ...mockPrograms[programIndex] } as ResponseData;
             }
             throw new Error("Program not found for mock update.");
         }


        console.warn(`Mock API unhandled PUT path: ${phpPath}`);
        throw new Error(`Mock PUT endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
        console.error(`Error in mock putData for ${phpPath}:`, error);
        throw error; // Re-throw original error
    }
};

export const deleteData = async (path: string): Promise<void> => {
    const phpPath = finalPath(path);
    console.log(`MOCK deleteData at: ${phpPath}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const idPart = phpPath.split('/').pop() || '';
    const parts = phpPath.split('/');

    try {
         if (phpPath.startsWith('/students/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const initialLength = mockStudents.length;
            mockStudents = mockStudents.filter(s => s.id !== id);
            if (mockStudents.length === initialLength) throw new Error("Student not found for mock delete.");
            return;
        }
         if (phpPath.startsWith('/teachers/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const initialLength = mockTeachers.length;
            mockTeachers = mockTeachers.filter(t => t.id !== id);
             if (mockTeachers.length === initialLength) throw new Error("Teacher not found for mock delete.");
            return;
        }
         if (phpPath.startsWith('/admins/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const adminToDelete = mockAdmins.find(a => a.id === id);
            if (!adminToDelete) throw new Error("Admin not found for mock delete.");
            if (adminToDelete.isSuperAdmin) throw new Error("Cannot delete super admin.");
            mockAdmins = mockAdmins.filter(a => a.id !== id); return;
        }
         if (phpPath.startsWith('/announcements/delete.php/')) {
             const id = idPart;
             const initialLength = mockAnnouncements.length;
             mockAnnouncements = mockAnnouncements.filter(a => a.id !== id);
              if (mockAnnouncements.length === initialLength) throw new Error("Announcement not found for mock delete.");
             return;
         }
         if (phpPath.startsWith('/assignments/delete.php/')) {
             const id = idPart;
             const initialLength = mockSectionAssignments.length;
             mockSectionAssignments = mockSectionAssignments.filter(a => a.id !== id);
             if (mockSectionAssignments.length === initialLength) throw new Error("Assignment not found for mock delete.");
             return;
         }
         if (phpPath.startsWith('/programs/delete.php/')) {
             const programId = idPart;
             const initialLength = mockPrograms.length;
             mockPrograms = mockPrograms.filter(p => p.id !== programId);
             if (mockPrograms.length === initialLength) throw new Error("Program not found for mock delete.");
             // Also remove related sections, subjects, assignments? Depends on cascade rules.
             // mockSections = mockSections.filter(s => s.programId !== programId);
             // mockSubjects = mockSubjects.filter(s => s.programId !== programId);
             // mockSectionAssignments = mockSectionAssignments.filter(a => !a.id.startsWith(`${programId}-`)); // Crude way, assumes ID format
             return;
         }
         if (phpPath.match(/^\/programs\/([^/]+)\/courses\/delete\/([^/]+)\/([^/]+)$/)) { // programs/{programId}/courses/delete/{yearLevel}/{courseId}
             const [, programId, yearLevelEncoded, courseId] = phpPath.match(/^\/programs\/([^/]+)\/courses\/delete\/([^/]+)\/([^/]+)$/) || [];
             const yearLevel = decodeURIComponent(yearLevelEncoded);
             const programIndex = mockPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1 && mockPrograms[programIndex].courses[yearLevel]) {
                const initialLength = mockPrograms[programIndex].courses[yearLevel].length;
                mockPrograms[programIndex].courses[yearLevel] = mockPrograms[programIndex].courses[yearLevel].filter(c => c.id !== courseId);
                if (mockPrograms[programIndex].courses[yearLevel].length === initialLength) throw new Error("Course not found in program/year for mock delete.");
                return;
             }
             throw new Error("Program or year level not found for deleting course.");
         }


        console.warn(`Mock API unhandled DELETE path: ${phpPath}`);
        throw new Error(`Mock DELETE endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
         console.error(`Error in mock deleteData for ${phpPath}:`, error);
         throw error; // Re-throw original error
    }
};

// Helper function for formatting dates
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}
