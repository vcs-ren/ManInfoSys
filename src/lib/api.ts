
// src/lib/api.ts
'use client';

import type { Student, Faculty, Section, Course, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole, CourseType, YearLevel, ActivityLogEntry, EmploymentType, EnrollmentType, AttendanceStatus, AttendanceRecord, TeacherClassInfo, StudentAttendanceData } from '@/types';
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateTeacherUsername, generateStudentId as generateFrontendStudentId, generateDefaultPasswordDisplay } from '@/lib/utils';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

// --- API CONFIGURATION ---
export const USE_MOCK_API = false; // Set to false to use live API
const API_BASE_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL ? process.env.NEXT_PUBLIC_API_BASE_URL : 'http://localhost:8000';


// --- Helper Functions ---

export const logActivity = (
    action: string,
    description: string,
    user: string = "Admin",
    targetId?: number | string,
    targetType?: ActivityLogEntry['targetType'],
    canUndo: boolean = false, // This flag will now depend on backend providing it or being hardcoded false
    originalData?: any
) => {
    // In a real application, this would send data to a backend logging service.
    // For now, this is a no-op as mockActivityLog is removed.
    console.log(`Activity Logged (no-op): Action: ${action}, Description: ${description}, User: ${user}, TargetID: ${targetId}`);
};


const getApiUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    const formattedPath = path.startsWith('/') ? path.substring(1) : path;
    return `${baseUrl}/${formattedPath}`;
};


const handleFetchError = (error: any, path: string, method: string, isNetworkError: boolean = false): never => {
    const targetUrl = getApiUrl(path);
    let errorMessage = `Failed to ${method.toLowerCase()} data.`;
    let detailedLog = `API Request Details:\n    - Method: ${method}\n    - Path Provided: ${path}\n    - Resolved URL: ${targetUrl}`;

    if (typeof window !== 'undefined') {
        detailedLog += `\n    - Frontend Origin: ${window.location.origin}`;
    }

    if (isNetworkError || error.message === 'Failed to fetch') {
        errorMessage = `Network Error: Could not connect to the API backend at ${targetUrl}.\n\n        Possible Causes & Checks:\n        1. PHP Server Status: Is the PHP server running? Start it using: 'php -S localhost:8000 -t src/api' in your project's root terminal.\n        2. Backend URL: Is the API_BASE_URL (${API_BASE_URL}) correct and accessible from your browser?\n        3. Endpoint Path: Is the API endpoint path "${path.startsWith('/') ? path : '/' + path}" correct relative to the 'src/api' directory? (e.g., /login.php, /students/read.php)\n        4. CORS Policy: Is the PHP backend configured to allow requests from your frontend origin (${typeof window !== 'undefined' ? window.location.origin : 'N/A'})? Check 'Access-Control-Allow-Origin' headers in your PHP files.\n        5. Firewall/Network: Could a firewall or network issue be blocking the connection?\n        6. Browser Console: Check the browser's Network tab for the failed request details and the Console tab for specific CORS error messages.\n        `;
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


// --- Generic Fetch Functions ---
export const fetchData = async <T>(path: string): Promise<T> => {
    if (USE_MOCK_API) {
        // This block should ideally not be reached if USE_MOCK_API is false.
        // If it is, it means there's a configuration issue or a call path missed.
        console.warn(`fetchData called with USE_MOCK_API=true for path: ${path}. This should not happen if mocks are removed.`);
        throw new Error("Mock API called unexpectedly. Ensure USE_MOCK_API is false.");
    }

    const url = getApiUrl(path);
    let response: Response;
    try {
        console.log(`Fetching data from: ${url}`);
        response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json'} });
    } catch (networkError: any) {
        return handleFetchError(networkError, path, 'GET', true);
    }

    let responseBodyText = "";
    try {
        responseBodyText = await response.text();
    } catch (readError) {
        console.warn(`Failed to read response body as text for GET ${url}:`, readError);
         if (!response.ok) {
            handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'GET');
        }
    }

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
        if (responseBodyText) {
            try { errorData = JSON.parse(responseBodyText); errorMessage = errorData?.message || responseBodyText || errorMessage;
            } catch (jsonParseError) { errorMessage = responseBodyText || errorMessage; errorData = { message: errorMessage }; }
        }
        console.error("API Error Response Text (fetchData):", responseBodyText || "(empty body)");
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'GET');
    }

    if (response.status === 204 || !responseBodyText) return {} as T; 

    try {
        return JSON.parse(responseBodyText) as T;
    } catch (jsonError: any) {
        console.error("Failed to parse JSON response (fetchData):", jsonError, "Body was:", responseBodyText);
        handleFetchError({ name: 'JSONError', message: 'Failed to parse JSON response.' }, path, 'GET');
    }
};


export const postData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    if (USE_MOCK_API) {
        console.warn(`postData called with USE_MOCK_API=true for path: ${path}. This should not happen if mocks are removed.`);
        throw new Error("Mock API called unexpectedly. Ensure USE_MOCK_API is false.");
    }

    const url = getApiUrl(path);
    let response;
    try {
        console.log(`Posting data to: ${url}`, data); 
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

    let responseBodyText = "";
    try {
        responseBodyText = await response.text();
    } catch (readError) {
        console.warn(`Failed to read response body as text for POST ${url}:`, readError);
        if (!response.ok) {
            handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'POST');
        }
    }


    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
        if (responseBodyText) {
            try {
                const parsedError = JSON.parse(responseBodyText);
                errorMessage = parsedError?.message || responseBodyText || errorMessage;
                errorData = { ...parsedError, message: errorMessage };
            } catch (jsonParseError) {
                 console.warn("Could not parse error response as JSON. Body:", responseBodyText);
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
            }
        }
        console.error("API Error Response Text (postData):", responseBodyText || "(empty body)");
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'POST');
    }
    
    if (response.status === 204 || (response.status === 201 && !responseBodyText)) { 
        return { success: true, message: `Operation successful (Status ${response.status})` } as unknown as ResponseData;
    }

    try {
        return JSON.parse(responseBodyText) as ResponseData;
    } catch (jsonError: any) {
        console.error("Failed to parse JSON response on successful POST:", jsonError, "Body was:", responseBodyText);
        return { success: true, message: "Operation successful, but response body could not be parsed.", rawResponse: responseBodyText } as unknown as ResponseData;
    }
};

export const putData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
     if (USE_MOCK_API) {
        console.warn(`putData called with USE_MOCK_API=true for path: ${path}. This should not happen if mocks are removed.`);
        throw new Error("Mock API called unexpectedly. Ensure USE_MOCK_API is false.");
     }

    const url = getApiUrl(path);
    let response: Response;
    try {
        console.log(`Putting data to: ${url}`, data);
        response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (networkError: any) {
         return handleFetchError(networkError, path, 'PUT', true);
    }

    let responseBodyText = "";
    try {
        responseBodyText = await response.text();
    } catch (readError) {
        console.warn(`Failed to read response body as text for PUT ${url}:`, readError);
         if (!response.ok) {
            handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'PUT');
        }
    }

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
         if (responseBodyText) {
             try {
                 const parsedError = JSON.parse(responseBodyText);
                 errorMessage = parsedError?.message || responseBodyText || errorMessage;
                 errorData = { ...parsedError, message: errorMessage };
             } catch (jsonParseError) {
                 console.warn("Could not parse error response as JSON. Body:", responseBodyText);
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
             }
         }
         console.error("API Error Response Text (putData):", responseBodyText || "(empty body)");
         handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'PUT');
    }

    if (response.status === 204 || !responseBodyText) { 
        return { success: true, message: `Update successful (Status ${response.status})` } as unknown as ResponseData;
    }

     try {
         return JSON.parse(responseBodyText) as ResponseData;
     } catch (jsonError: any) {
         console.error("Failed to parse JSON response on successful PUT:", jsonError, "Body was:", responseBodyText);
         return { success: true, message: "Update successful, but response body could not be parsed.", rawResponse: responseBodyText } as unknown as ResponseData;
     }
};

export const deleteData = async (path: string): Promise<void> => {
    if (USE_MOCK_API) {
        console.warn(`deleteData called with USE_MOCK_API=true for path: ${path}. This should not happen if mocks are removed.`);
        throw new Error("Mock API called unexpectedly. Ensure USE_MOCK_API is false.");
    }

    const url = getApiUrl(path);
    let response: Response;
    try {
        console.log(`Deleting data at: ${url}`);
        response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json'} 
        });
    } catch (networkError: any) {
        return handleFetchError(networkError, path, 'DELETE', true);
    }

    let responseBodyText = "";
    try {
        responseBodyText = await response.text();
    } catch (readError) {
        console.warn(`Failed to read response body as text for DELETE ${url}:`, readError);
         if (!response.ok && response.status !== 204) {
            handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'DELETE');
        }
    }

    if (!response.ok && response.status !== 204) { 
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
         if (responseBodyText) {
             try {
                 const parsedError = JSON.parse(responseBodyText);
                 errorMessage = parsedError?.message || responseBodyText || errorMessage;
                 errorData = { ...parsedError, message: errorMessage };
             } catch (jsonParseError) {
                 console.warn("Could not parse error response as JSON. Body:", responseBodyText);
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
             }
         }
        console.error("API Error Response Text (deleteData):", responseBodyText || "(empty body)");
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'DELETE');
    }
    
    if (responseBodyText && response.status !== 204) {
        try {
            JSON.parse(responseBodyText); 
        } catch (e) {
            console.log("DELETE response was not JSON or empty (and not 204):", responseBodyText);
        }
    }
};


function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

export { USE_MOCK_API as defaultUSE_MOCK_API };
// Removed mock data exports
// export { mockApiPrograms, mockCourses, mockStudents, mockFaculty, mockSections, mockAnnouncements, mockSectionAssignments, mockApiAdmins };
// export { mockActivityLog, mockDashboardStats, mockStudentSubjectAssignmentsWithGrades, mockTeacherTeachableCourses, mockTeacherClasses, mockAttendanceRecords };

// Export an empty object for mockAdmins if it was previously aliased and might be imported elsewhere, to avoid breaking imports.
// Or better, remove imports of mockAdmins if it's not used. For now, ensure this doesn't break.
export const mockAdmins = []; 
export const mockStudents = [];
export const mockFaculty = [];
export const mockApiAdmins = [];
export const mockAnnouncements = [];
export const mockActivityLog: ActivityLogEntry[] = [];
export const mockDashboardStats = {} as DashboardStats;
export const mockApiPrograms: Program[] = [];
export const mockCourses: Course[] = [];
export const mockSections: Section[] = [];
export const mockSectionAssignments: SectionSubjectAssignment[] = [];
export const mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = [];
export const mockTeacherTeachableCourses: { teacherId: number; courseIds: string[] }[] = [];
export const mockTeacherClasses: TeacherClassInfo[] = [];
export const mockAttendanceRecords: AttendanceRecord[] = [];

// Mock-specific undo functions - these are now effectively dead code if USE_MOCK_API is false
// and will be removed or significantly altered if a backend undo is implemented.
export function executeUndoAddStudent(studentId: number, originalStudentData: Student) {
  console.warn("Mock executeUndoAddStudent called. This function should not be active if not using mock API.");
}
export function executeUndoDeleteStudent(originalStudentData: Student) {
    console.warn("Mock executeUndoDeleteStudent called. This function should not be active if not using mock API.");
}
export function executeUndoAddFaculty(facultyId: number, originalFacultyData: Faculty) {
    console.warn("Mock executeUndoAddFaculty called. This function should not be active if not using mock API.");
}
export function executeUndoDeleteFaculty(originalFacultyData: Faculty) {
    console.warn("Mock executeUndoDeleteFaculty called. This function should not be active if not using mock API.");
}
export function executeUndoRemoveAdminRole(adminData: AdminUser & { originalDepartment?: DepartmentType }): boolean {
    console.warn("Mock executeUndoRemoveAdminRole called. This function should not be active if not using mock API.");
    return false;
}

// Recalculate dashboard stats - now only relevant if it were to ever operate on real fetched data,
// but currently, it was only for mocks.
export const recalculateDashboardStats = () => {
    console.warn("Mock recalculateDashboardStats called. This function relied on mock data.");
};
