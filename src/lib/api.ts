
'use client';

import type { Student, Teacher, Section, Subject, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem } from '@/types';
import { generateStudentId, generateTeacherId, generateSectionCode, generateAdminUsername } from '@/lib/utils';

// --- MOCK DATA STORE ---
let mockStudents: Student[] = [
  { id: 1, studentId: "s1001", firstName: "Alice", lastName: "Smith", course: "Computer Science", status: "Continuing", year: "2nd Year", section: "CS-2A", email: "alice@example.com", phone: "123-456-7890", emergencyContactName: "John Smith", emergencyContactRelationship: "Father", emergencyContactPhone: "111-222-3333", emergencyContactAddress: "123 Main St" },
  { id: 2, studentId: "s1002", firstName: "Bob", lastName: "Johnson", course: "Information Technology", status: "New", year: "1st Year", section: "IT-1B", email: "bob@example.com", phone: "987-654-3210" },
];

let mockTeachers: Teacher[] = [
  { id: 1, teacherId: "t1001", firstName: "David", lastName: "Lee", department: "Computer Science", email: "david.lee@example.com", phone: "555-1234" },
  { id: 2, teacherId: "t1002", firstName: "Eve", lastName: "Davis", department: "Information Technology", email: "eve.davis@example.com" },
];

let mockSections: Section[] = [
    { id: "CS-1A", sectionCode: "CS-1A", course: "Computer Science", yearLevel: "1st Year", adviserId: 1, adviserName: "David Lee", studentCount: 0 }, // Updated student count
    { id: "CS-2A", sectionCode: "CS-2A", course: "Computer Science", yearLevel: "2nd Year", adviserId: 1, adviserName: "David Lee", studentCount: 1 }, // Added CS-2A for Alice
    { id: "IT-1B", sectionCode: "IT-1B", course: "Information Technology", yearLevel: "1st Year", studentCount: 1 },
];

let mockSubjects: Subject[] = [
  { id: "CS101", name: "Introduction to Programming", description: "Basics of programming" },
  { id: "IT202", name: "Networking Fundamentals", description: "Understanding computer networks" },
  { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills" },
];

let mockSectionAssignments: SectionSubjectAssignment[] = [
    { id: "CS-2A-CS101", sectionId: "CS-2A", subjectId: "CS101", subjectName: "Introduction to Programming", teacherId: 1, teacherName: "David Lee" },
    { id: "IT-1B-IT202", sectionId: "IT-1B", subjectId: "IT202", subjectName: "Networking Fundamentals", teacherId: 2, teacherName: "Eve Davis" },
];

let mockAnnouncements: Announcement[] = [
  { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year.", date: new Date(2024, 7, 15), target: { course: "all" }, author: "Admin" },
];

let mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = [
    // Alice's grades (Student ID 1, Section CS-2A)
    { assignmentId: "1-CS101", studentId: 1, studentName: "Alice Smith", subjectId: "CS101", subjectName: "Introduction to Programming", section: "CS-2A", year: "2nd Year", prelimGrade: 85, prelimRemarks: "Good start", midtermGrade: 90, midtermRemarks: "Excellent", finalGrade: 88, finalRemarks: "Very Good", status: "Complete" },
    // Bob's grades (Student ID 2, Section IT-1B) - Example, maybe no grades yet
    { assignmentId: "2-IT202", studentId: 2, studentName: "Bob Johnson", subjectId: "IT202", subjectName: "Networking Fundamentals", section: "IT-1B", year: "1st Year", prelimGrade: null, prelimRemarks: "", midtermGrade: null, midtermRemarks: "", finalGrade: null, finalRemarks: "", status: "Not Submitted" },
];

let mockAdmins: AdminUser[] = [
    { id: 0, username: "admin", firstName: "Super", lastName: "Admin", email: "superadmin@example.com", isSuperAdmin: true },
    { id: 1, username: "a1001", firstName: "Sub", lastName: "AdminOne", email: "subadmin1@example.com", isSuperAdmin: false }
];

let mockDashboardStats: DashboardStats = {
    totalStudents: mockStudents.length,
    totalTeachers: mockTeachers.length,
    totalAdmins: mockAdmins.length,
    upcomingEvents: 1,
};

// Re-add mock test users for login
let mockTestUsers = [
    { username: "admin", role: "Admin", userId: 0 },
    { username: "s1001", role: "Student", userId: 1 },
    { username: "t1001", role: "Teacher", userId: 1 },
];


// --- API CONFIGURATION ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Fallback for client-side

const getApiUrl = (path: string): string => {
    // Ensure the base URL doesn't have a trailing slash
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    // Ensure the path starts with a slash
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    // Remove '/api' prefix if it exists, as PHP paths are relative to src/api
    const finalPath = formattedPath.startsWith('/api/') ? formattedPath.substring(4) : formattedPath;
    return `${baseUrl}${finalPath}`;
};

// --- ERROR HANDLING ---
const handleFetchError = (error: any, path: string, method: string, isNetworkError: boolean = false): never => {
    const targetUrl = getApiUrl(path); // Calculate the target URL
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
        3. Endpoint Path: Is the API endpoint path "${path}" correct relative to the 'src/api' directory? (e.g., /login.php, /students/read.php)
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
    // Re-throw a new error with the processed, more user-friendly message
    throw new Error(errorMessage);
};


// --- API HELPER FUNCTIONS ---
export const fetchData = async <T>(path: string): Promise<T> => {
    const url = getApiUrl(path);
    let response;
    console.log(`MOCK fetchData from: ${path}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
        // Mock implementation remains the same as previous version
        if (path.includes('students/read.php')) return [...mockStudents] as T;
        if (path.includes('teachers/read.php')) return [...mockTeachers] as T;
        if (path.includes('admins/read.php')) return [...mockAdmins] as T;
        if (path.includes('sections/read.php')) return [...mockSections] as T;
        if (path.includes('subjects/read.php')) return [...mockSubjects] as T;
        if (path.includes('announcements/read.php') || path.includes('student/announcements/read.php') || path.includes('teacher/announcements/read.php')) {
            return [...mockAnnouncements].sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (path.includes('admin/dashboard-stats.php')) {
            mockDashboardStats.totalStudents = mockStudents.length;
            mockDashboardStats.totalTeachers = mockTeachers.length;
            mockDashboardStats.totalAdmins = mockAdmins.length;
            return { ...mockDashboardStats } as T;
        }
         if (path.match(/sections\/([^/]+)\/assignments\/read\.php/)) {
            const sectionId = path.match(/sections\/([^/]+)\/assignments\/read\.php$/)?.[1];
            return mockSectionAssignments.filter(a => a.sectionId === sectionId) as T;
        }
         if (path.includes('student/grades/read.php')) {
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
         if (path.includes('teacher/assignments/grades/read.php')) {
             return mockStudentSubjectAssignmentsWithGrades.filter(g => {
                 const assignment = mockSectionAssignments.find(a => a.subjectId === g.subjectId && g.section === a.sectionId);
                 return assignment?.teacherId === 1;
             }) as T;
         }
         if (path.includes('student/profile/read.php')) {
             const student = mockStudents.find(s => s.id === 1);
             if (student) return student as T;
             throw new Error("Mock student profile not found.");
        }
        if (path.includes('teacher/profile/read.php')) {
             const teacher = mockTeachers.find(t => t.id === 1);
             if (teacher) return teacher as T;
             throw new Error("Mock teacher profile not found.");
        }
         if (path.includes('student/schedule/read.php')) {
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
                        title: `${assign.subjectName} - ${assign.sectionId}`,
                        start: startTime,
                        end: endTime,
                        type: 'class',
                        location: `Room ${101 + index}`,
                        teacher: assign.teacherName
                     });
                });
             return schedule as T;
        }
         if (path.includes('teacher/schedule/read.php')) {
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
                        title: `${assign.subjectName} - ${assign.sectionId}`,
                        start: startTime,
                        end: endTime,
                        type: 'class',
                        location: `Room ${101 + index}`,
                        section: assign.sectionId
                     });
                });
             return schedule as T;
        }
         if (path.includes('teacher/subjects/read.php')) {
             const subjectIds = new Set(mockSectionAssignments.filter(a => a.teacherId === 1).map(a => a.subjectId));
             return mockSubjects.filter(s => subjectIds.has(s.id)) as T;
         }
          if (path.includes('student/upcoming/read.php')) {
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
                         title: `${assign.subjectName} Class`,
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

        console.warn(`Mock API unhandled GET path: ${path}`);
        return [] as T;
    } catch (error: any) {
        handleFetchError(error, path, 'GET');
    }
};

export const postData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const url = getApiUrl(path);
    let response;
    console.log(`MOCK postData to: ${path}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
         if (path.includes('login.php')) {
             const { username } = data as any;
             const user = mockTestUsers.find(u => u.username === username);
             if (user) {
                const redirectPath = user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Student' ? '/student/dashboard' : '/teacher/dashboard';
                return { success: true, role: user.role, redirectPath: redirectPath, userId: user.userId } as ResponseData;
             }
             throw new Error("Invalid mock credentials.");
        }
         if (path.includes('students/create.php')) {
            const newStudent = data as unknown as Omit<Student, 'id' | 'studentId' | 'section'>;
            const nextId = mockStudents.length > 0 ? Math.max(...mockStudents.map(s => s.id)) + 1 : 1;
            const student: Student = { ...newStudent, id: nextId, studentId: generateStudentId(nextId), section: generateSectionCode(newStudent.year || '1st Year') };
            mockStudents.push(student);
            return student as ResponseData;
        }
         if (path.includes('teachers/create.php')) {
            const newTeacher = data as unknown as Omit<Teacher, 'id' | 'teacherId'>;
            const nextId = mockTeachers.length > 0 ? Math.max(...mockTeachers.map(t => t.id)) + 1 : 1;
            const teacher: Teacher = { ...newTeacher, id: nextId, teacherId: generateTeacherId(nextId) };
            mockTeachers.push(teacher);
            return teacher as ResponseData;
        }
         if (path.includes('admins/create.php')) {
             // Mock creating an admin user - only uses email
            const newAdminData = data as unknown as Pick<AdminUser, 'email'>;
            const nextId = mockAdmins.length > 0 ? Math.max(...mockAdmins.map(a => a.id)) + 1 : 1;
            const adminUser: AdminUser = {
                id: nextId,
                username: generateAdminUsername(nextId),
                email: newAdminData.email,
                firstName: 'Admin', // Placeholder
                lastName: `User ${nextId}`, // Placeholder
                isSuperAdmin: false,
            };
            mockAdmins.push(adminUser);
            return adminUser as ResponseData;
        }
         if (path.includes('admin/reset_password.php')) {
             const { userId, userType, lastName } = data as { userId: number, userType: string, lastName?: string };
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
        if (path.includes('announcements/create.php')) {
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
         if (path.includes('sections/adviser/update.php')) {
             const urlParts = path.split('/');
             const sectionId = urlParts[urlParts.length - 2];
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
         if (path.includes('sections/assignments/create.php')) {
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
         if (path.includes('assignments/grades/update.php')) {
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
        if (path.includes('admin/change_password.php')) return { message: "Admin password updated successfully." } as ResponseData;
        if (path.includes('student/change_password.php')) return { message: "Student password updated successfully." } as ResponseData;
        if (path.includes('teacher/change_password.php')) return { message: "Teacher password updated successfully." } as ResponseData;

        console.warn(`Mock API unhandled POST path: ${path}`);
         throw new Error(`Mock POST endpoint for ${path} not implemented.`);
    } catch (error: any) {
         handleFetchError(error, path, 'POST');
    }
};

export const putData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const url = getApiUrl(path);
    let response;
    console.log(`MOCK putData to: ${path}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const idStr = path.split('/').pop() || '';
    const id = parseInt(idStr, 10);
    try {
         if (path.includes('students/update.php/')) {
            const studentIndex = mockStudents.findIndex(s => s.id === id);
            if (studentIndex > -1) { mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...(data as unknown as Partial<Student>) }; return { ...mockStudents[studentIndex] } as ResponseData; }
            throw new Error("Student not found for mock update.");
        }
         if (path.includes('teachers/update.php/')) {
            const teacherIndex = mockTeachers.findIndex(t => t.id === id);
            if (teacherIndex > -1) { mockTeachers[teacherIndex] = { ...mockTeachers[teacherIndex], ...(data as unknown as Partial<Teacher>) }; return { ...mockTeachers[teacherIndex] } as ResponseData; }
            throw new Error("Teacher not found for mock update.");
        }
          if (path.includes('student/profile/update.php')) {
            const profileData = data as Student;
            const index = mockStudents.findIndex(s => s.id === profileData.id);
            if (index > -1) {
                mockStudents[index] = { ...mockStudents[index], ...profileData };
                return mockStudents[index] as ResponseData;
            }
            throw new Error("Mock student profile not found for update.");
        }
         if (path.includes('teacher/profile/update.php')) {
             const profileData = data as Teacher;
             const index = mockTeachers.findIndex(t => t.id === profileData.id);
             if (index > -1) {
                 mockTeachers[index] = { ...mockTeachers[index], ...profileData };
                 return mockTeachers[index] as ResponseData;
             }
             throw new Error("Mock teacher profile not found for update.");
         }

        console.warn(`Mock API unhandled PUT path: ${path}`);
        throw new Error(`Mock PUT endpoint for ${path} not implemented.`);
    } catch (error: any) {
        handleFetchError(error, path, 'PUT');
    }
};

export const deleteData = async (path: string): Promise<void> => {
    const url = getApiUrl(path);
    let response;
    console.log(`MOCK deleteData at: ${path}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const idPart = path.split('/').pop();
    try {
         if (path.includes('students/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const initialLength = mockStudents.length;
            mockStudents = mockStudents.filter(s => s.id !== id);
            if (mockStudents.length === initialLength) throw new Error("Student not found for mock delete.");
            return;
        }
         if (path.includes('teachers/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const initialLength = mockTeachers.length;
            mockTeachers = mockTeachers.filter(t => t.id !== id);
             if (mockTeachers.length === initialLength) throw new Error("Teacher not found for mock delete.");
            return;
        }
         if (path.includes('admins/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const adminToDelete = mockAdmins.find(a => a.id === id);
            if (!adminToDelete) throw new Error("Admin not found for mock delete.");
            if (adminToDelete.isSuperAdmin) throw new Error("Cannot delete super admin.");
            mockAdmins = mockAdmins.filter(a => a.id !== id); return;
        }
         if (path.includes('announcements/delete.php/')) {
             const id = idPart;
             const initialLength = mockAnnouncements.length;
             mockAnnouncements = mockAnnouncements.filter(a => a.id !== id);
              if (mockAnnouncements.length === initialLength) throw new Error("Announcement not found for mock delete.");
             return;
         }
         if (path.includes('assignments/delete.php/')) {
             const id = idPart;
             const initialLength = mockSectionAssignments.length;
             mockSectionAssignments = mockSectionAssignments.filter(a => a.id !== id);
             if (mockSectionAssignments.length === initialLength) throw new Error("Assignment not found for mock delete.");
             return;
         }

        console.warn(`Mock API unhandled DELETE path: ${path}`);
        throw new Error(`Mock DELETE endpoint for ${path} not implemented.`);
    } catch (error: any) {
        handleFetchError(error, path, 'DELETE');
    }
};

// Helper function for formatting dates (adjust format as needed)
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}
