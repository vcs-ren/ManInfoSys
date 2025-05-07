
'use client';

import type { Student, Teacher, Section, Subject, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser } from '@/types';
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
  { id: "CS-1A", sectionCode: "CS-1A", course: "Computer Science", yearLevel: "1st Year", adviserId: 1, adviserName: "David Lee", studentCount: 1 },
  { id: "IT-1B", sectionCode: "IT-1B", course: "Information Technology", yearLevel: "1st Year", studentCount: 1 },
];

let mockSubjects: Subject[] = [
  { id: "CS101", name: "Introduction to Programming", description: "Basics of programming" },
  { id: "IT202", name: "Networking Fundamentals", description: "Understanding computer networks" },
  { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills" },
];

let mockSectionAssignments: SectionSubjectAssignment[] = [
    { id: "CS-1A-CS101", sectionId: "CS-1A", subjectId: "CS101", subjectName: "Introduction to Programming", teacherId: 1, teacherName: "David Lee" },
];

let mockAnnouncements: Announcement[] = [
  { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year.", date: new Date(2024, 7, 15), target: { course: "all" }, author: "Admin" },
];

let mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = [
    { assignmentId: "1-CS101", studentId: 1, studentName: "Alice Smith", subjectId: "CS101", subjectName: "Introduction to Programming", section: "CS-2A", year: "2nd Year", prelimGrade: 85, prelimRemarks: "Good start", midtermGrade: 90, midtermRemarks: "Excellent", finalGrade: 88, finalRemarks: "Very Good", status: "Complete" },
];

let mockAdmins: AdminUser[] = [
    { id: 0, username: "admin", firstName: "Super", lastName: "Admin", email: "superadmin@example.com", isSuperAdmin: true },
    { id: 1, username: "a1001", firstName: "Sub", lastName: "AdminOne", email: "subadmin1@example.com", isSuperAdmin: false },
];

let mockDashboardStats: DashboardStats = {
    totalStudents: mockStudents.length,
    totalTeachers: mockTeachers.length,
    totalAdmins: mockAdmins.length,
    upcomingEvents: 1,
};

// --- API CONFIGURATION ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Fallback for client-side

const getApiUrl = (path: string): string => `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;


// --- ERROR HANDLING ---
const handleFetchError = (error: any, path: string, method: string, isNetworkError: boolean = false): never => {
    let errorMessage = `Failed to ${method.toLowerCase()} data from ${path}.`;
    let detailedLog = `API Request Details:\n    - Method: ${method}\n    - URL: ${getApiUrl(path)}`;

    if (typeof window !== 'undefined') {
        detailedLog += `\n    - Frontend Origin: ${window.location.origin}`;
    }

    if (isNetworkError || error.message === 'Failed to fetch') {
        errorMessage = `Network Error: Could not connect to the API backend at ${getApiUrl(path)}.

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
    console.log(`Fetching data from: ${url}`);

    // MOCK IMPLEMENTATION
    if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
        console.log(`MOCK fetchData from: ${path}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        try {
            if (path.includes('/api/students/read.php') || path.includes('students/read.php')) return { records: [...mockStudents] } as T;
            if (path.includes('/api/teachers/read.php') || path.includes('teachers/read.php')) return { records: [...mockTeachers] } as T;
            if (path.includes('/api/admins/read.php') || path.includes('admins/read.php')) return { records: [...mockAdmins] } as T; // Mock for admins
            if (path.includes('/api/sections/read.php')|| path.includes('sections/read.php')) return [...mockSections] as T;
            if (path.includes('/api/subjects/read.php') || path.includes('subjects/read.php')) return [...mockSubjects] as T;
            if (path.includes('/api/announcements/read.php') || path.includes('announcements/read.php')) return [...mockAnnouncements].sort((a,b) => b.date.getTime() - a.date.getTime()) as T;
            if (path.includes('/api/admin/dashboard-stats.php') || path.includes('admin/dashboard-stats.php')) {
                mockDashboardStats.totalStudents = mockStudents.length;
                mockDashboardStats.totalTeachers = mockTeachers.length;
                mockDashboardStats.totalAdmins = mockAdmins.length;
                return { ...mockDashboardStats } as T;
            }
            if (path.match(/\/api\/sections\/([^/]+)\/assignments\/read\.php/) || path.match(/\/sections\/([^/]+)\/assignments\/read\.php/)) {
                const sectionId = path.match(/\/api\/sections\/([^/]+)\/assignments\/read\.php$/)?.[1] || path.match(/\/sections\/([^/]+)\/assignments\/read\.php$/)?.[1];
                return mockSectionAssignments.filter(a => a.sectionId === sectionId) as T;
            }
            // ... (other mock GET endpoints)
             console.warn(`Mock API unhandled GET path: ${path}`);
             return [] as T;
        } catch (error) {
            handleFetchError(error, path, 'GET');
        }
    }
    // END MOCK

    try {
        response = await fetch(url);
    } catch (networkError: any) {
        handleFetchError(networkError, path, 'GET', true);
    }

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (parseError) {
             // If not JSON, read as text
             const errorText = await response.text(); // Read body once as text
             console.error("API Error Response Text:", errorText);
             try {
                  const errorDataParsed = JSON.parse(errorText); // Try parsing the text
                  errorData = { message: errorDataParsed?.message || errorText || `HTTP error! status: ${response.status}` };
             } catch (innerParseError) {
                  errorData = { message: errorText || `HTTP error! status: ${response.status}` };
             }
        }
        const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
        console.error(`API Error (${response.status}) for GET ${url}:`, errorMessage, errorData);
        throw new Error(errorMessage);
    }

    try {
        return await response.json() as T;
    } catch (e) {
        console.error(`Failed to parse JSON response from GET ${url}:`, e);
        throw new Error(`Invalid JSON response from server for GET ${url}.`);
    }
};


export const postData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const url = getApiUrl(path);
    let response;
    console.log(`Posting data to: ${url}`, data);

     // MOCK IMPLEMENTATION
    if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
        console.log(`MOCK postData to: ${path}`, data);
        await new Promise(resolve => setTimeout(resolve, 300));
        try {
            if (path.includes('/api/login.php') || path.includes('login.php')) {
                const { username } = data as any;
                if (username === 'admin') return { success: true, role: 'Admin', redirectPath: '/admin/dashboard', userId: 0 } as ResponseData;
                if (username === 's1001') return { success: true, role: 'Student', redirectPath: '/student/dashboard', userId: 1 } as ResponseData;
                if (username === 't1001') return { success: true, role: 'Teacher', redirectPath: '/teacher/dashboard', userId: 1 } as ResponseData;
                throw new Error("Invalid mock credentials.");
            }
            if (path.includes('/api/students/create.php') || path.includes('students/create.php')) {
                const newStudent = data as unknown as Omit<Student, 'id' | 'studentId' | 'section'>;
                const nextId = mockStudents.length > 0 ? Math.max(...mockStudents.map(s => s.id)) + 1 : 1;
                const student: Student = { ...newStudent, id: nextId, studentId: generateStudentId(nextId), section: generateSectionCode(newStudent.year || '1st Year') };
                mockStudents.push(student);
                return student as ResponseData;
            }
            if (path.includes('/api/teachers/create.php') || path.includes('teachers/create.php')) {
                const newTeacher = data as unknown as Omit<Teacher, 'id' | 'teacherId'>;
                const nextId = mockTeachers.length > 0 ? Math.max(...mockTeachers.map(t => t.id)) + 1 : 1;
                const teacher: Teacher = { ...newTeacher, id: nextId, teacherId: generateTeacherId(nextId) };
                mockTeachers.push(teacher);
                return teacher as ResponseData;
            }
            if (path.includes('/api/admins/create.php') || path.includes('admins/create.php')) {
                const newAdminData = data as unknown as Omit<AdminUser, 'id' | 'username' | 'isSuperAdmin'>;
                const nextId = mockAdmins.length > 0 ? Math.max(...mockAdmins.map(a => a.id)) + 1 : 1;
                const adminUser: AdminUser = {
                    ...newAdminData,
                    id: nextId,
                    username: generateAdminUsername(nextId),
                    isSuperAdmin: false,
                };
                mockAdmins.push(adminUser);
                return adminUser as ResponseData;
            }
            if (path.includes('/api/admin/reset_password.php') || path.includes('admin/reset_password.php')) {
                 const { userId, userType, lastName } = data as { userId: number, userType: string, lastName?: string };
                 if (userType === 'admin') {
                    const adminIndex = mockAdmins.findIndex(a => a.id === userId && !a.isSuperAdmin);
                    if (adminIndex > -1) { /* mock password reset */ return { message: `Admin password reset successfully for ID ${userId}.` } as ResponseData; }
                    throw new Error("Admin not found or cannot reset super admin password.");
                 }
                 // Existing student/teacher logic...
                 return { message: `${userType} password reset successfully for ID ${userId}.` } as ResponseData;
            }
            // ... (other mock POST endpoints)
             console.warn(`Mock API unhandled POST path: ${path}`);
             throw new Error(`Mock POST endpoint for ${path} not implemented.`);
        } catch (error) {
             handleFetchError(error, path, 'POST');
        }
    }
    // END MOCK

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
         handleFetchError(networkError, path, 'POST', true);
    }

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (parseError) {
             const errorText = await response.text();
             console.error("API Error Response Text (POST):", errorText);
             try {
                  const errorDataParsed = JSON.parse(errorText);
                  errorData = { message: errorDataParsed?.message || errorText || `HTTP error! status: ${response.status}` };
             } catch (innerParseError) {
                  errorData = { message: errorText || `HTTP error! status: ${response.status}` };
             }
        }
        const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
        console.error(`API Error (${response.status}) for POST ${url}:`, errorMessage, errorData);
        throw new Error(errorMessage);
    }
     try {
        // Handle cases where backend might return empty response for 200/201 on POST
        const textResponse = await response.text();
        if (!textResponse) {
            return {} as ResponseData; // Or handle as appropriate for your app
        }
        return JSON.parse(textResponse) as ResponseData;
    } catch (e) {
        console.error(`Failed to parse JSON response from POST ${url}:`, e);
        throw new Error(`Invalid JSON response from server for POST ${url}.`);
    }
};


export const putData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const url = getApiUrl(path);
    let response;
    console.log(`Putting data to: ${url}`, data);

     // MOCK IMPLEMENTATION
    if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
        console.log(`MOCK putData to: ${path}`, data);
        await new Promise(resolve => setTimeout(resolve, 300));
        const id = parseInt(path.split('/').pop() || '0', 10);
        try {
            if (path.startsWith('/api/students/update.php/') || path.startsWith('students/update.php/')) {
                const studentIndex = mockStudents.findIndex(s => s.id === id);
                if (studentIndex > -1) { mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...(data as unknown as Partial<Student>) }; return { ...mockStudents[studentIndex] } as ResponseData; }
                throw new Error("Student not found for mock update.");
            }
            // ... (other mock PUT endpoints)
            console.warn(`Mock API unhandled PUT path: ${path}`);
            throw new Error(`Mock PUT endpoint for ${path} not implemented.`);
        } catch (error) {
            handleFetchError(error, path, 'PUT');
        }
    }
    // END MOCK

    try {
        response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (networkError: any) {
        handleFetchError(networkError, path, 'PUT', true);
    }

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (parseError) {
             const errorText = await response.text();
             console.error("API Error Response Text (PUT):", errorText);
             try {
                  const errorDataParsed = JSON.parse(errorText);
                  errorData = { message: errorDataParsed?.message || errorText || `HTTP error! status: ${response.status}` };
             } catch (innerParseError) {
                  errorData = { message: errorText || `HTTP error! status: ${response.status}` };
             }
        }
        const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
        console.error(`API Error (${response.status}) for PUT ${url}:`, errorMessage, errorData);
        throw new Error(errorMessage);
    }
     try {
        const textResponse = await response.text();
        if (!textResponse) return {} as ResponseData;
        return JSON.parse(textResponse) as ResponseData;
    } catch (e) {
        console.error(`Failed to parse JSON response from PUT ${url}:`, e);
        throw new Error(`Invalid JSON response from server for PUT ${url}.`);
    }
};


export const deleteData = async (path: string): Promise<void> => {
    const url = getApiUrl(path);
    let response;
    console.log(`Deleting data at: ${url}`);

     // MOCK IMPLEMENTATION
    if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
        console.log(`MOCK deleteData at: ${path}`);
        await new Promise(resolve => setTimeout(resolve, 300));
        const idPart = path.split('/').pop();
        try {
            if (path.startsWith('/api/students/delete.php/') || path.startsWith('students/delete.php/')) {
                const id = parseInt(idPart || '0', 10);
                mockStudents = mockStudents.filter(s => s.id !== id); return;
            }
             if (path.startsWith('/api/teachers/delete.php/') || path.startsWith('teachers/delete.php/')) {
                const id = parseInt(idPart || '0', 10);
                mockTeachers = mockTeachers.filter(t => t.id !== id); return;
            }
            if (path.startsWith('/api/admins/delete.php/') || path.startsWith('admins/delete.php/')) {
                const id = parseInt(idPart || '0', 10);
                const adminToDelete = mockAdmins.find(a => a.id === id);
                if (adminToDelete && adminToDelete.isSuperAdmin) throw new Error("Cannot delete super admin.");
                mockAdmins = mockAdmins.filter(a => a.id !== id); return;
            }
            // ... (other mock DELETE endpoints)
            console.warn(`Mock API unhandled DELETE path: ${path}`);
            throw new Error(`Mock DELETE endpoint for ${path} not implemented.`);
        } catch (error) {
            handleFetchError(error, path, 'DELETE');
        }
    }
    // END MOCK

    try {
        response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (networkError: any) {
        handleFetchError(networkError, path, 'DELETE', true);
    }

    if (!response.ok) { // Status codes like 204 No Content are also "ok"
        let errorData;
        try {
            // If there's a body, try to parse it
            if (response.status !== 204) {
                errorData = await response.json();
            } else {
                 // For 204, there's no body to parse.
                 // If we reach here for 204, it means an earlier check failed,
                 // but it's unusual for !response.ok to be true for 204.
                 // This block is more for other error statuses that might have JSON.
                errorData = { message: `Operation failed with status: ${response.status}` };
            }
        } catch (parseError) {
             const errorText = await response.text();
             console.error("API Error Response Text (DELETE):", errorText);
             try {
                  const errorDataParsed = JSON.parse(errorText);
                  errorData = { message: errorDataParsed?.message || errorText || `HTTP error! status: ${response.status}` };
             } catch (innerParseError) {
                  errorData = { message: errorText || `HTTP error! status: ${response.status}` };
             }
        }
        const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
        console.error(`API Error (${response.status}) for DELETE ${url}:`, errorMessage, errorData);
        throw new Error(errorMessage);
    }
    // For DELETE requests, a 204 No Content response is common and doesn't have a body
    if (response.status === 204) {
        return;
    }
    // If there's other successful response with a body (e.g., 200 OK with a confirmation message)
    try {
        // Check if there's a response body before trying to parse
        const textResponse = await response.text();
        if (!textResponse) {
             return; // No content to parse, successfully deleted.
        }
        JSON.parse(textResponse); // This is just to check if it's valid JSON, result not used.
    } catch (e) {
        // If it's not JSON, but still 2xx, we assume success but log it.
        console.warn(`Non-JSON success response from DELETE ${url}:`, e);
    }
};
