
'use client';

import type { Student, Faculty, Section, Subject, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole, Course, CourseType, YearLevel } from '@/types'; // Renamed Teacher to Faculty, Added DepartmentType, Program, Course, CourseType
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateAdminUsername, generateTeacherUsername, generateStudentId } from '@/lib/utils'; // Renamed generateTeacherId -> generateFacultyId

// --- MOCK DATA STORE ---
let nextStudentDbId = 3;
let nextFacultyDbId = 3; // Renamed from nextTeacherDbId
let nextAdminDbId = 2;
let nextProgramDbId = 3; // For mock programs
let nextCourseDbId = 10; // For mock courses


let mockStudents: Student[] = [
  { id: 1, studentId: "101", username: "s101", firstName: "Alice", lastName: "Smith", course: "Computer Science", status: "Returnee", year: "2nd Year", section: "CS-2A", email: "alice@example.com", phone: "123-456-7890", emergencyContactName: "John Smith", emergencyContactRelationship: "Father", emergencyContactPhone: "111-222-3333", emergencyContactAddress: "123 Main St" },
  { id: 2, studentId: "102", username: "s102", firstName: "Bob", lastName: "Johnson", course: "Information Technology", status: "New", year: "1st Year", section: "IT-1B", email: "bob@example.com", phone: "987-654-3210" },
];

// Renamed mockTeachers to mockFaculty and updated department values
// Updated Faculty ID (numeric) and Username (department-prefixed) formats
let mockFaculty: Faculty[] = [
  { id: 1, teacherId: "1001", username: "t1001", firstName: "David", lastName: "Lee", department: "Teaching", email: "david.lee@example.com", phone: "555-1234", employmentType: 'Regular' },
  { id: 2, teacherId: "1002", username: "a1002", firstName: "Eve", lastName: "Davis", department: "Administrative", email: "eve.davis@example.com", employmentType: 'Part Time' },
];

// Initial mock courses, assuming Subject type is used for Courses for now
let mockCourses: Course[] = [
    { id: "CS101", name: "Introduction to Programming", description: "Fundamentals of programming.", type: "Major", programId: "CS", yearLevel: "1st Year" },
    { id: "IT101", name: "IT Fundamentals", description: "Basics of IT.", type: "Major", programId: "IT", yearLevel: "1st Year" },
    { id: "CS201", name: "Data Structures", description: "Study of data organization.", type: "Major", programId: "CS", yearLevel: "2nd Year" },
    { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills", type: "Minor" }, // Example Minor course
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

// Updated teacherName references and Course/Subject naming
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
    { id: 0, username: "admin", email: "superadmin@example.com", role: "Super Admin", isSuperAdmin: true },
    { id: 1, username: "a1001", email: "subadmin1@example.com", role: "Sub Admin", isSuperAdmin: false }
];

let mockDashboardStats: DashboardStats = {
    totalStudents: mockStudents.length,
    totalTeachers: mockFaculty.length, // Use mockFaculty length
    totalAdmins: mockAdmins.length,
    upcomingEvents: 1,
};

let mockTestUsers = [
    { username: "admin", role: "Admin", userId: 0 },
    { username: "s101", role: "Student", userId: 1 },
    { username: "t1001", role: "Teacher", userId: 1 }, // Keep 'Teacher' role for login logic consistency
    { username: "a1001", role: "Admin", userId: 1 },
];


// --- API CONFIGURATION ---
const USE_MOCK_API = true; // Set to false to try hitting the PHP backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Ensure no /api suffix

const getApiUrl = (path: string): string => {
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const formattedPath = path.startsWith('/') ? path : `/${path}`; // Ensure path starts with /
    return `${baseUrl}${formattedPath}`;
};

// --- ERROR HANDLING ---
const handleFetchError = (error: any, path: string, method: string, isNetworkError: boolean = false): never => {
    const targetUrl = getApiUrl(path); // This should now correctly form the URL
    let errorMessage = `Failed to ${method.toLowerCase()} data.`;
    let detailedLog = `API Request Details:\n    - Method: ${method}\n    - Path Provided: ${path}\n    - Resolved URL: ${targetUrl}`;

    if (typeof window !== 'undefined') {
        detailedLog += `\n    - Frontend Origin: ${window.location.origin}`;
    }

    if (isNetworkError || error.message === 'Failed to fetch') {
        errorMessage = `Network Error: Could not connect to the API backend at ${targetUrl}.

        Possible Causes & Checks:
        1. PHP Server Status: Is the PHP server running? Start it using: 'php -S localhost:8000 -t src/api' in your project's root terminal.
        2. Backend URL: Is the API_BASE_URL (${API_BASE_URL}) correct and accessible from your browser?
        3. Endpoint Path: Does the PHP file exist at 'src/api${path}' (e.g., src/api/login.php, src/api/students/read.php)?
        4. CORS Policy: Is the PHP backend configured to allow requests from your frontend origin (${typeof window !== 'undefined' ? window.location.origin : 'N/A'})? Check 'Access-Control-Allow-Origin' headers in your PHP files.
        5. Firewall/Network: Could a firewall or network issue be blocking the connection?
        6. Browser Console: Check the browser's Network tab for the failed request details (like 404 status) and the Console tab for specific CORS error messages.
        `;
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

// Helper to get final path *without* leading slash if needed by mock logic structure
const finalMockPath = (path: string) => {
     const formattedPath = path.startsWith('/') ? path.substring(1) : path;
     return formattedPath;
}


// --- MOCK API IMPLEMENTATION ---

const mockFetchData = async <T>(path: string): Promise<T> => {
    const phpPath = finalMockPath(path); // Path relative to 'src/api'
    console.log(`MOCK fetchData from: ${phpPath}`);
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        if (phpPath === 'students/read.php') return [...mockStudents] as T;
        if (phpPath === 'teachers/read.php') return [...mockFaculty] as T; // Return mockFaculty
        if (phpPath === 'admins/read.php') return [...mockAdmins] as T;
        if (phpPath === 'programs/read.php') return [...mockPrograms] as T;
        if (phpPath === 'courses/read.php') return [...mockCourses] as T; // Endpoint for all courses
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
            mockDashboardStats.totalStudents = mockStudents.length;
            mockDashboardStats.totalTeachers = mockFaculty.length; // Use mockFaculty length
            mockDashboardStats.totalAdmins = mockAdmins.length;
            return { ...mockDashboardStats } as T;
        }
         if (phpPath.match(/^sections\/([^/]+)\/assignments$/)) {
            const sectionId = phpPath.match(/^sections\/([^/]+)\/assignments$/)?.[1];
             return mockSectionAssignments.filter(a => a.sectionId === sectionId).map(a => ({
                 ...a,
                 subjectName: mockCourses.find(s => s.id === a.subjectId)?.name || a.subjectId,
                 teacherName: mockFaculty.find(t => t.id === a.teacherId)?.firstName + ' ' + mockFaculty.find(t => t.id === a.teacherId)?.lastName || `Faculty ID ${a.teacherId}`, // Use mockFaculty
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
                 return assignment?.teacherId === 1; // Assuming faculty ID 1
             }) as T;
         }
         if (phpPath === 'student/profile/read.php') {
             const student = mockStudents.find(s => s.id === 1);
             if (student) return { ...student } as T;
             throw new Error("Mock student profile not found.");
        }
        if (phpPath === 'teacher/profile/read.php') { // Endpoint name remains teacher for consistency
             const faculty = mockFaculty.find(t => t.id === 1); // Use mockFaculty
             if (faculty) return { ...faculty } as T;
             throw new Error("Mock faculty profile not found."); // Updated message
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
         if (phpPath === 'teacher/schedule/read.php') { // Endpoint name remains teacher
            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments
                .filter(a => a.teacherId === 1) // Assuming faculty ID 1
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
         if (phpPath === 'teacher/subjects/read.php') { // Endpoint name remains teacher
             const subjectIds = new Set(mockSectionAssignments.filter(a => a.teacherId === 1).map(a => a.subjectId)); // Assuming faculty ID 1
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
             const { username } = data as any;
             const user = mockTestUsers.find(u => u.username === username);
             if (user) {
                const redirectPath = user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Student' ? '/student/dashboard' : '/teacher/dashboard';
                return { success: true, role: user.role, redirectPath: redirectPath, userId: user.userId } as ResponseData;
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
            return student as ResponseData;
        }
         if (phpPath === 'teachers/create.php') { // Endpoint name remains teachers
            const newFacultyData = data as unknown as Omit<Faculty, 'id' | 'teacherId' | 'username'>;
            const nextId = nextFacultyDbId++; // Use faculty counter
            const teacherIdStr = generateTeacherId(nextId); // Use numeric faculty ID generator
            // Ensure department is present and valid before generating username
            const department = newFacultyData.department || 'Teaching'; // Default or handle error
            const username = generateTeacherUsername(teacherIdStr, department); // Use faculty username generator

            const faculty: Faculty = { // Use Faculty type
                ...newFacultyData,
                id: nextId,
                teacherId: teacherIdStr, // Store numeric ID
                username: username, // Store department-prefixed username
            };
            mockFaculty.push(faculty); // Add to mockFaculty
            return faculty as ResponseData;
        }
         if (phpPath === 'admins/create.php') {
            const newAdminData = data as unknown as Pick<AdminUser, 'email' | 'role'>;
            const nextId = nextAdminDbId++;
            const adminUser: AdminUser = {
                id: nextId,
                username: generateAdminUsername(nextId),
                email: newAdminData.email,
                role: newAdminData.role,
                isSuperAdmin: newAdminData.role === 'Super Admin',
            };
            mockAdmins.push(adminUser);
            return adminUser as ResponseData;
        }
        if (phpPath === 'programs/create.php') {
             const newProgramData = data as unknown as Program; // Expect full Program structure now
             const newProgram: Program = {
                 id: newProgramData.id || newProgramData.name.toUpperCase().substring(0, 3) + Date.now().toString().slice(-3),
                 name: newProgramData.name,
                 description: newProgramData.description,
                 courses: newProgramData.courses || { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] },
             };
             if (mockPrograms.some(p => p.id === newProgram.id)) {
                 throw new Error("Program with this ID already exists.");
             }
              // Also add any new courses defined within the payload to the global mockCourses list
             Object.values(newProgram.courses).flat().forEach(course => {
                 if (!mockCourses.some(c => c.id === course.id)) {
                     mockCourses.push({ ...course, programId: newProgram.id }); // Ensure programId is set
                 }
             });
             mockPrograms.push(newProgram);
             return newProgram as ResponseData;
         }
         if (phpPath === 'courses/create.php') { // New endpoint for creating courses globally
             const newCourseData = data as Course;
             const newCourse: Course = {
                 ...newCourseData,
                 id: newCourseData.id || `C${nextCourseDbId++}`, // Generate ID if not provided
                 // programId might be set later or be null for Minor
             };
             if (mockCourses.some(c => c.id === newCourse.id)) {
                 throw new Error(`Course with ID ${newCourse.id} already exists.`);
             }
             mockCourses.push(newCourse);
             return newCourse as ResponseData;
         }
          if (phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)) { // New endpoint to assign EXISTING course
              const programId = phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)?.[1];
              const { courseId, yearLevel } = data as { courseId: string, yearLevel: YearLevel };
              const programIndex = mockPrograms.findIndex(p => p.id === programId);
              const course = mockCourses.find(c => c.id === courseId);

              if (programIndex === -1) throw new Error("Program not found.");
              if (!course) throw new Error("Course not found.");
               if (!mockPrograms[programIndex].courses[yearLevel]) {
                  mockPrograms[programIndex].courses[yearLevel] = [];
               }
                // Check if course already assigned to this year level in this program
                if (mockPrograms[programIndex].courses[yearLevel].some(c => c.id === courseId)) {
                    throw new Error(`Course ${course.name} is already assigned to ${programId} - ${yearLevel}.`);
                }
                // Check type constraint: Major courses can only be assigned to their designated program
                if (course.type === 'Major' && course.programId && course.programId !== programId) {
                     throw new Error(`Major course ${course.name} belongs to program ${course.programId} and cannot be assigned to ${programId}.`);
                }

                // Assign the course (add a reference, not a full copy if already exists)
                mockPrograms[programIndex].courses[yearLevel].push(course);
                return { success: true, program: mockPrograms[programIndex] } as ResponseData;

         }

         if (phpPath === 'admin/reset_password.php') {
              const { userId, userType } = data as { userId: number; userType: string; lastName: string };
              const userArray = userType === 'student' ? mockStudents : userType === 'teacher' ? mockFaculty : mockAdmins; // Use mockFaculty
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
        if (phpPath === 'announcements/create.php') {
            const newAnnData = data as { title: string; content: string; target: any };
            const nextId = `ann${mockAnnouncements.length + 1}`;
            const newAnnouncement: Announcement = {
                id: nextId,
                title: newAnnData.title,
                content: newAnnData.content,
                date: new Date(),
                target: newAnnData.target,
                author: "Admin"
            };
            mockAnnouncements.unshift(newAnnouncement);
            return newAnnouncement as ResponseData;
        }
         if (phpPath.match(/^sections\/([^/]+)\/adviser$/)) {
             const sectionId = phpPath.match(/^sections\/([^/]+)\/adviser$/)?.[1];
             const { adviserId } = data as { adviserId: number | null };
             const sectionIndex = mockSections.findIndex(s => s.id === sectionId);
             if (sectionIndex > -1) {
                 const adviser = mockFaculty.find(t => t.id === adviserId); // Use mockFaculty
                 mockSections[sectionIndex].adviserId = adviserId ?? undefined;
                 mockSections[sectionIndex].adviserName = adviser ? `${adviser.firstName} ${adviser.lastName}` : undefined;
                 return { ...mockSections[sectionIndex] } as ResponseData;
             }
             throw new Error("Section not found.");
         }
         if (phpPath === 'sections/assignments/create.php') {
             const { sectionId, subjectId, teacherId } = data as { sectionId: string; subjectId: string; teacherId: number };
             const subject = mockCourses.find(s => s.id === subjectId); // Check mockCourses now
             const faculty = mockFaculty.find(t => t.id === teacherId); // Use mockFaculty
             const assignmentId = `${sectionId}-${subjectId}`;
              if (mockSectionAssignments.some(a => a.id === assignmentId)) {
                   throw new Error("This course is already assigned to this section."); // Updated message
              }
             const newAssignment: SectionSubjectAssignment = {
                 id: assignmentId,
                 sectionId,
                 subjectId,
                 subjectName: subject?.name,
                 teacherId,
                 teacherName: faculty ? `${faculty.firstName} ${faculty.lastName}` : undefined // Use faculty name
             };
             mockSectionAssignments.push(newAssignment);
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
                    const subject = mockCourses.find(s => s.id === gradeData.subjectId); // Check mockCourses
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
        if (phpPath === 'admin/change_password.php') return { message: "Admin password updated successfully." } as ResponseData;
        if (phpPath === 'student/change_password.php') return { message: "Student password updated successfully." } as ResponseData;
        if (phpPath === 'teacher/change_password.php') return { message: "Faculty password updated successfully." } as ResponseData; // Endpoint name remains teacher

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
                return { ...mockStudents[studentIndex] } as ResponseData;
            }
            throw new Error("Student not found for mock update.");
        }
         if (phpPath.startsWith('teachers/update.php/')) { // Endpoint name remains teachers
            const id = parseInt(idStr, 10);
            const facultyIndex = mockFaculty.findIndex(t => t.id === id); // Use mockFaculty
             if (facultyIndex > -1) {
                mockFaculty[facultyIndex] = { ...mockFaculty[facultyIndex], ...(data as unknown as Partial<Faculty>) }; // Use Faculty type
                return { ...mockFaculty[facultyIndex] } as ResponseData;
            }
            throw new Error("Faculty not found for mock update."); // Updated message
        }
         if (phpPath === 'student/profile/update.php') {
            const profileData = data as Student;
            const index = mockStudents.findIndex(s => s.id === profileData.id);
            if (index > -1) {
                mockStudents[index] = { ...mockStudents[index], ...profileData };
                return { ...mockStudents[index] } as ResponseData;
            }
            throw new Error("Mock student profile not found for update.");
        }
         if (phpPath === 'teacher/profile/update.php') { // Endpoint name remains teacher
             const profileData = data as Faculty; // Use Faculty type
             const index = mockFaculty.findIndex(t => t.id === profileData.id); // Use mockFaculty
             if (index > -1) {
                 mockFaculty[index] = { ...mockFaculty[index], ...profileData };
                 return { ...mockFaculty[index] } as ResponseData;
             }
             throw new Error("Mock faculty profile not found for update."); // Updated message
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
                     // DO NOT update courses here, handle via assign/remove endpoints
                     courses: mockPrograms[programIndex].courses, // Keep existing courses
                 };
                 return { ...mockPrograms[programIndex] } as ResponseData;
             }
             throw new Error("Program not found for mock update.");
         }
          if (phpPath.startsWith('courses/update.php/')) { // New endpoint to update a course globally
              const courseId = idStr;
              const courseIndex = mockCourses.findIndex(c => c.id === courseId);
              if (courseIndex > -1) {
                   const updatedCourseData = data as Partial<Course>;
                   mockCourses[courseIndex] = { ...mockCourses[courseIndex], ...updatedCourseData };
                   // Update the course in any program it's assigned to
                    mockPrograms.forEach(program => {
                         Object.keys(program.courses).forEach(year => {
                             const yr = year as YearLevel;
                             const assignedIndex = program.courses[yr].findIndex(c => c.id === courseId);
                             if (assignedIndex > -1) {
                                 program.courses[yr][assignedIndex] = { ...mockCourses[courseIndex] };
                             }
                         });
                    });
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
    const parts = phpPath.split('/');

    try {
         if (phpPath.startsWith('students/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const initialLength = mockStudents.length;
            mockStudents = mockStudents.filter(s => s.id !== id);
            if (mockStudents.length === initialLength) throw new Error("Student not found for mock delete.");
            return;
        }
         if (phpPath.startsWith('teachers/delete.php/')) { // Endpoint name remains teachers
            const id = parseInt(idPart || '0', 10);
            const initialLength = mockFaculty.length; // Use mockFaculty
            mockFaculty = mockFaculty.filter(t => t.id !== id); // Use mockFaculty
             if (mockFaculty.length === initialLength) throw new Error("Faculty not found for mock delete."); // Updated message
            return;
        }
         if (phpPath.startsWith('admins/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const adminToDelete = mockAdmins.find(a => a.id === id);
            if (!adminToDelete) throw new Error("Admin not found for mock delete.");
            if (adminToDelete.isSuperAdmin) throw new Error("Cannot delete super admin.");
            mockAdmins = mockAdmins.filter(a => a.id !== id); return;
        }
         if (phpPath.startsWith('announcements/delete.php/')) {
             const id = idPart;
             const initialLength = mockAnnouncements.length;
             mockAnnouncements = mockAnnouncements.filter(a => a.id !== id);
              if (mockAnnouncements.length === initialLength) throw new Error("Announcement not found for mock delete.");
             return;
         }
         if (phpPath.startsWith('assignments/delete.php/')) {
             const id = idPart;
             const initialLength = mockSectionAssignments.length;
             mockSectionAssignments = mockSectionAssignments.filter(a => a.id !== id);
             if (mockSectionAssignments.length === initialLength) throw new Error("Assignment not found for mock delete.");
             return;
         }
         if (phpPath.startsWith('programs/delete.php/')) {
             const programId = idPart;
             const initialLength = mockPrograms.length;
             mockPrograms = mockPrograms.filter(p => p.id !== programId);
             // Also remove associated assignments (optional cleanup)
             mockSectionAssignments = mockSectionAssignments.filter(a => {
                const section = mockSections.find(s => s.id === a.sectionId);
                return section?.programId !== programId;
             });
             if (mockPrograms.length === initialLength) throw new Error("Program not found for mock delete.");
             return;
         }
          if (phpPath.startsWith('courses/delete.php/')) { // New endpoint to delete course globally
             const courseId = idPart;
             const initialLength = mockCourses.length;
             mockCourses = mockCourses.filter(c => c.id !== courseId);
              // Also remove from programs and assignments
             mockPrograms.forEach(program => {
                 Object.keys(program.courses).forEach(year => {
                      const yr = year as YearLevel;
                      program.courses[yr] = program.courses[yr].filter(c => c.id !== courseId);
                 });
             });
             mockSectionAssignments = mockSectionAssignments.filter(a => a.subjectId !== courseId);
             if (mockCourses.length === initialLength) throw new Error("Course not found for mock delete.");
             return;
          }
          if (phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/)) { // New endpoint to remove course assignment
             const [, programId, yearLevelEncoded, courseId] = phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/) || [];
             const yearLevel = decodeURIComponent(yearLevelEncoded) as YearLevel;
             const programIndex = mockPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1 && mockPrograms[programIndex].courses[yearLevel]) {
                 const initialLength = mockPrograms[programIndex].courses[yearLevel].length;
                 mockPrograms[programIndex].courses[yearLevel] = mockPrograms[programIndex].courses[yearLevel].filter(c => c.id !== courseId);
                 if (mockPrograms[programIndex].courses[yearLevel].length === initialLength) {
                    throw new Error("Course assignment not found in program/year for mock removal.");
                 }
                 // Also remove associated section assignments (optional cleanup)
                 mockSectionAssignments = mockSectionAssignments.filter(a => !(a.subjectId === courseId && mockSections.find(s => s.id === a.sectionId)?.programId === programId && mockSections.find(s => s.id === a.sectionId)?.yearLevel === yearLevel));
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
    let response;
    try {
        response = await fetch(url, { method: 'GET' });
    } catch (networkError: any) {
        return handleFetchError(networkError, path, 'GET', true);
    }

    if (!response.ok) {
        let errorData: any;
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            errorData = await response.json(); // Try parsing JSON first
            errorMessage = errorData?.message || JSON.stringify(errorData) || errorMessage;
        } catch (parseError) {
            try {
                const errorText = await response.text(); // Read body once as text
                console.error("API Error Response Text:", errorText);
                errorMessage = errorText || `HTTP error! status: ${response.status}`;
                 errorData = { message: errorMessage }; // Create a basic error object
             } catch (readError) {
                 console.error("Failed to read error response body:", readError);
                 errorData = { message: `HTTP error! status: ${response.status}. Failed to read error body.` };
             }
        }
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'GET');
    }

    try {
        return await response.json() as T;
    } catch (jsonError: any) {
        console.error("Failed to parse JSON response:", jsonError);
        handleFetchError(jsonError, path, 'GET');
    }
};

export const postData = USE_MOCK_API ? mockPostData : async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const url = getApiUrl(path);
    let response;
    console.log(`Posting data to: ${url}`, data); // Log the URL and data
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other headers like Authorization if needed
            },
            body: JSON.stringify(data),
        });
    } catch (networkError: any) {
        // Network errors (server down, DNS issues, CORS blocked by browser PREFLIGHT failure)
         handleFetchError(networkError, path, 'POST', true);
    }

    // Handle HTTP errors (like 404, 500, 400, 401, 403, etc.)
    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` }; // Default error
        let errorMessage = errorData.message;
        try {
            const errorBody = await response.text(); // Read body once as text
            console.error("API Error Response Text:", errorBody); // Log the raw text
            try {
                 // Attempt to parse as JSON, but use the text if it fails
                 errorData = JSON.parse(errorBody);
                 errorMessage = errorData?.message || errorBody || errorMessage;
            } catch (jsonParseError) {
                 errorMessage = errorBody || errorMessage; // Use text if not JSON
                 errorData = { message: errorMessage }; // Update errorData with text message
            }
        } catch (readError) {
            console.error("Failed to read error response body:", readError);
             errorData = { message: `HTTP error! status: ${response.status}. Failed to read error body.` };
             errorMessage = errorData.message;
        }
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'POST');
    }

    // Handle successful responses (e.g., 200 OK, 201 Created)
    if (response.status === 201 || response.status === 200) {
       try {
           const contentType = response.headers.get("content-type");
           if (contentType && contentType.indexOf("application/json") !== -1) {
               // Only parse JSON if the content type is correct
                return await response.json() as ResponseData;
           } else {
               // Handle non-JSON success responses (e.g., just a success message)
               console.log(`POST to ${url} successful with status ${response.status}, but no JSON body.`);
               return { success: true, message: `Operation successful (Status ${response.status})` } as ResponseData; // Or handle appropriately
           }
       } catch (jsonError: any) {
           console.error("Failed to parse JSON response on successful POST:", jsonError);
           // Decide how to handle: maybe return a success indicator anyway?
           return { success: true, message: "Operation successful, but response body could not be parsed." } as ResponseData;
       }
    }

    // Handle other unexpected successful status codes if necessary
    console.warn(`Unexpected successful status code ${response.status} for POST ${url}`);
    return { success: true, message: `Operation completed with status ${response.status}.` } as ResponseData; // Adjust as needed
};

export const putData = USE_MOCK_API ? mockPutData : async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const url = getApiUrl(path);
    let response;
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
         try {
             const errorBody = await response.text();
             console.error("API Error Response Text:", errorBody);
             try {
                 errorData = JSON.parse(errorBody);
                 errorMessage = errorData?.message || errorBody || errorMessage;
             } catch (jsonParseError) {
                 errorMessage = errorBody || errorMessage;
                 errorData = { message: errorMessage };
             }
         } catch (readError) {
             console.error("Failed to read error response body:", readError);
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
             return { success: true, message: `Update successful (Status ${response.status})` } as ResponseData;
         }
     } catch (jsonError: any) {
         console.error("Failed to parse JSON response on successful PUT:", jsonError);
         return { success: true, message: "Update successful, but response body could not be parsed." } as ResponseData;
     }
};

export const deleteData = USE_MOCK_API ? mockDeleteData : async (path: string): Promise<void> => {
    const url = getApiUrl(path);
    let response;
    try {
        response = await fetch(url, { method: 'DELETE' });
    } catch (networkError: any) {
         handleFetchError(networkError, path, 'DELETE', true);
    }

    // Allow 204 No Content as success for DELETE
    if (!response.ok && response.status !== 204) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
         try {
             const errorBody = await response.text();
             console.error("API Error Response Text:", errorBody);
             try {
                 errorData = JSON.parse(errorBody);
                 errorMessage = errorData?.message || errorBody || errorMessage;
             } catch (jsonParseError) {
                 errorMessage = errorBody || errorMessage;
                 errorData = { message: errorMessage };
             }
         } catch (readError) {
             console.error("Failed to read error response body:", readError);
             errorData = { message: `HTTP error! status: ${response.status}. Failed to read error body.` };
             errorMessage = errorData.message;
         }
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'DELETE');
    }

    // If status is 204 or another successful code, attempt to process body if present
    if (response.status === 204) {
        console.log(`DELETE ${url} successful with status 204 No Content.`);
        return; // No body expected for 204
    }

     // For other success codes (like 200 OK with a body)
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
         // Still resolve successfully as the DELETE operation itself was likely okay
     }
};


// Helper function for formatting dates (if needed elsewhere)
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

