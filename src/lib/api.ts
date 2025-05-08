
'use client';

import type { Student, Faculty, Section, Subject, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole } from '@/types'; // Renamed Teacher to Faculty, Added DepartmentType
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateAdminUsername, generateTeacherUsername, generateStudentId } from '@/lib/utils'; // Renamed generateTeacherId -> generateFacultyId

// --- MOCK DATA STORE ---
let nextStudentDbId = 3;
let nextFacultyDbId = 3; // Renamed from nextTeacherDbId
let nextAdminDbId = 2;

let mockStudents: Student[] = [
  { id: 1, studentId: "101", username: "s101", firstName: "Alice", lastName: "Smith", course: "Computer Science", status: "Returnee", year: "2nd Year", section: "CS-2A", email: "alice@example.com", phone: "123-456-7890", emergencyContactName: "John Smith", emergencyContactRelationship: "Father", emergencyContactPhone: "111-222-3333", emergencyContactAddress: "123 Main St" },
  { id: 2, studentId: "102", username: "s102", firstName: "Bob", lastName: "Johnson", course: "Information Technology", status: "New", year: "1st Year", section: "IT-1B", email: "bob@example.com", phone: "987-654-3210" },
];

// Renamed mockTeachers to mockFaculty and updated department values
let mockFaculty: Faculty[] = [
  { id: 1, teacherId: "t1001", username: "t1001", firstName: "David", lastName: "Lee", department: "Teaching", email: "david.lee@example.com", phone: "555-1234", employmentType: 'Regular' },
  { id: 2, teacherId: "t1002", username: "t1002", firstName: "Eve", lastName: "Davis", department: "Administrative", email: "eve.davis@example.com", employmentType: 'Part Time' },
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

let mockSections: Section[] = [
    { id: "CS-1A", sectionCode: "CS-1A", programId: "CS", programName: "Computer Science", yearLevel: "1st Year", adviserId: 1, adviserName: "David Lee", studentCount: 0 },
    { id: "CS-2A", sectionCode: "CS-2A", programId: "CS", programName: "Computer Science", yearLevel: "2nd Year", adviserId: 1, adviserName: "David Lee", studentCount: 1 },
    { id: "IT-1B", sectionCode: "IT-1B", programId: "IT", programName: "Information Technology", yearLevel: "1st Year", studentCount: 1 },
];

let mockSubjects: Subject[] = [
  { id: "CS101", name: "Introduction to Programming", description: "Basics of programming", programId: "CS", yearLevel: "1st Year" },
  { id: "IT202", name: "Networking Fundamentals", description: "Understanding computer networks", programId: "IT", yearLevel: "2nd Year" },
  { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills" },
  { id: "CS201", name: "Data Structures", description: "Study of data organization.", programId: "CS", yearLevel: "2nd Year" },
  { id: "IT101", name: "IT Fundamentals", description: "Basics of IT.", programId: "IT", yearLevel: "1st Year" },

];

// Updated teacherName references
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

const getApiUrl = (path: string): string => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const formattedPath = path.startsWith('/') ? path.substring(1) : path;
    return `${baseUrl}/${formattedPath}`;
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
        2. Backend URL: Is the API_BASE_URL (${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}) correct and accessible from your browser?
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

// Helper to get final path without leading slash if needed by mock logic
const finalPath = (path: string) => {
     const formattedPath = path.startsWith('/') ? path.substring(1) : path;
     return formattedPath;
}


// --- MOCK API IMPLEMENTATION ---

const mockFetchData = async <T>(path: string): Promise<T> => {
    const phpPath = finalPath(path); // Path relative to 'src/api'
    console.log(`MOCK fetchData from: ${phpPath}`);
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        if (phpPath === 'students/read.php') return [...mockStudents] as T;
        if (phpPath === 'teachers/read.php') return [...mockFaculty] as T; // Return mockFaculty
        if (phpPath === 'admins/read.php') return [...mockAdmins] as T;
        if (phpPath === 'programs/read.php') return [...mockPrograms] as T;
        if (phpPath === 'sections/read.php') {
             return [...mockSections.map(s => ({
                 ...s,
                 programName: mockPrograms.find(p => p.id === s.programId)?.name || s.programId,
             }))] as T;
        }
        if (phpPath === 'subjects/read.php') return [...mockSubjects] as T;
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
                 subjectName: mockSubjects.find(s => s.id === a.subjectId)?.name || a.subjectId,
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
             return mockSubjects.filter(s => subjectIds.has(s.id)) as T;
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
    const phpPath = finalPath(path);
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
            const teacherIdStr = generateTeacherId(nextId); // Use faculty ID generator
            const username = generateTeacherUsername(teacherIdStr); // Use faculty username generator
            const faculty: Faculty = { // Use Faculty type
                ...newFacultyData,
                id: nextId,
                teacherId: teacherIdStr,
                username: username,
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
             const newProgramData = data as unknown as Omit<Program, 'courses'> & { id: string };
             const newProgram: Program = {
                 ...newProgramData,
                 id: newProgramData.id || newProgramData.name.toUpperCase().substring(0, 3) + Date.now().toString().slice(-3),
                 courses: { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] },
             };
             if (mockPrograms.some(p => p.id === newProgram.id)) {
                 throw new Error("Program with this ID already exists.");
             }
             mockPrograms.push(newProgram);
             return newProgram as ResponseData;
         }
         if (phpPath.match(/^programs\/([^/]+)\/courses\/add$/)) {
              const programId = phpPath.match(/^programs\/([^/]+)\/courses\/add$/)?.[1];
              const courseData = data as Subject;
              const programIndex = mockPrograms.findIndex(p => p.id === programId);
              if (programIndex > -1) {
                 const year = courseData.yearLevel || "1st Year";
                  if (!mockPrograms[programIndex].courses[year]) {
                      mockPrograms[programIndex].courses[year] = [];
                  }
                 const newCourseId = courseData.id || `${programId}-${year.charAt(0)}-${mockPrograms[programIndex].courses[year].length + 1}`;
                  const newCourse: Subject = {
                     ...courseData,
                     id: newCourseId,
                     programId: programId,
                     yearLevel: year,
                  };
                  if (mockPrograms[programIndex].courses[year].some(c => c.id === newCourse.id)) {
                        throw new Error(`Course(subject) with ID ${newCourse.id} already exists in ${programId} - ${year}.`);
                  }
                  mockPrograms[programIndex].courses[year].push(newCourse);
                  return newCourse as ResponseData;
              }
              throw new Error("Program not found.");
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
             const subject = mockSubjects.find(s => s.id === subjectId);
             const faculty = mockFaculty.find(t => t.id === teacherId); // Use mockFaculty
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
    const phpPath = finalPath(path);
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
                 mockPrograms[programIndex] = { ...mockPrograms[programIndex], ...(data as unknown as Partial<Program>) };
                 if (!(data as any).courses) {
                    mockPrograms[programIndex].courses = mockPrograms[programIndex].courses || { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] };
                 }
                 return { ...mockPrograms[programIndex] } as ResponseData;
             }
             throw new Error("Program not found for mock update.");
         }
         if (phpPath.match(/^programs\/([^/]+)\/courses\/update\/([^/]+)\/([^/]+)$/)) {
             const [, programId, yearLevelEncoded, courseId] = phpPath.match(/^programs\/([^/]+)\/courses\/update\/([^/]+)\/([^/]+)$/) || [];
             const yearLevel = decodeURIComponent(yearLevelEncoded);
             const courseData = data as Subject;
             const programIndex = mockPrograms.findIndex(p => p.id === programId);
              if (programIndex > -1 && mockPrograms[programIndex].courses[yearLevel]) {
                  const courseIndex = mockPrograms[programIndex].courses[yearLevel].findIndex(c => c.id === courseId);
                  if (courseIndex > -1) {
                        mockPrograms[programIndex].courses[yearLevel][courseIndex] = {
                            ...mockPrograms[programIndex].courses[yearLevel][courseIndex],
                            ...courseData,
                            programId: programId,
                            yearLevel: yearLevel,
                        };
                        return mockPrograms[programIndex].courses[yearLevel][courseIndex] as ResponseData;
                   }
                   throw new Error("Course(subject) not found in program/year for mock update.");
               }
              throw new Error("Program or year not found for mock course update.");
         }


        console.warn(`Mock API unhandled PUT path: ${phpPath}`);
        throw new Error(`Mock PUT endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
        console.error(`Error in mock putData for ${phpPath}:`, error);
        throw error;
    }
};

const mockDeleteData = async (path: string): Promise<void> => {
    const phpPath = finalPath(path);
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
             if (mockPrograms.length === initialLength) throw new Error("Program not found for mock delete.");
             return;
         }
         if (phpPath.match(/^programs\/([^/]+)\/courses\/delete\/([^/]+)\/([^/]+)$/)) {
             const [, programId, yearLevelEncoded, courseId] = phpPath.match(/^programs\/([^/]+)\/courses\/delete\/([^/]+)\/([^/]+)$/) || [];
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
            const errorBody = await response.json(); // Try parsing JSON first
            errorMessage = errorBody?.message || JSON.stringify(errorBody) || errorMessage;
            errorData = errorBody;
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
         return handleFetchError(networkError, path, 'POST', true);
    }

    if (!response.ok) {
         let errorData: any;
         let errorMessage = `HTTP error! status: ${response.status}`;
         try {
             const errorBody = await response.json();
             errorMessage = errorBody?.message || JSON.stringify(errorBody) || errorMessage;
              errorData = errorBody;
         } catch (parseError) {
            try {
                const errorText = await response.text();
                console.error("API Error Response Text:", errorText);
                errorMessage = errorText || `HTTP error! status: ${response.status}`;
                 errorData = { message: errorMessage };
            } catch (readError) {
                 console.error("Failed to read error response body:", readError);
                 errorData = { message: `HTTP error! status: ${response.status}. Failed to read error body.` };
            }
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
                 return { success: true, message: `Operation successful (Status ${response.status})` } as ResponseData;
            }
        } catch (jsonError: any) {
            console.error("Failed to parse JSON response on successful POST:", jsonError);
             return { success: true, message: "Operation successful, but response body could not be parsed." } as ResponseData;
        }
    }

     console.warn(`Unexpected successful status code ${response.status} for POST ${url}`);
     return { success: true, message: `Operation completed with status ${response.status}.` } as ResponseData;
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
         let errorData: any;
         let errorMessage = `HTTP error! status: ${response.status}`;
         try {
             const errorBody = await response.json();
             errorMessage = errorBody?.message || JSON.stringify(errorBody) || errorMessage;
              errorData = errorBody;
         } catch (parseError) {
            try {
                const errorText = await response.text();
                console.error("API Error Response Text:", errorText);
                errorMessage = errorText || `HTTP error! status: ${response.status}`;
                 errorData = { message: errorMessage };
            } catch (readError) {
                 console.error("Failed to read error response body:", readError);
                 errorData = { message: `HTTP error! status: ${response.status}. Failed to read error body.` };
            }
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

    if (!response.ok && response.status !== 204) {
        let errorData: any;
         let errorMessage = `HTTP error! status: ${response.status}`;
         try {
             const errorBody = await response.json();
             errorMessage = errorBody?.message || JSON.stringify(errorBody) || errorMessage;
              errorData = errorBody;
         } catch (parseError) {
            try {
                const errorText = await response.text();
                console.error("API Error Response Text:", errorText);
                errorMessage = errorText || `HTTP error! status: ${response.status}`;
                 errorData = { message: errorMessage };
            } catch (readError) {
                 console.error("Failed to read error response body:", readError);
                 errorData = { message: `HTTP error! status: ${response.status}. Failed to read error body.` };
            }
         }
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'DELETE');
    }

    if (response.status === 204) {
        return;
    }

     try {
         const contentType = response.headers.get("content-type");
         if (contentType && contentType.indexOf("application/json") !== -1) {
             const data = await response.json();
             console.log("DELETE response data:", data);
         } else {
             console.log(`DELETE ${url} successful with status ${response.status}.`);
         }
     } catch (jsonError: any) {
         console.error("Failed to parse JSON response on successful DELETE:", jsonError);
     }
};


// Helper function for formatting dates (if needed elsewhere)
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

    