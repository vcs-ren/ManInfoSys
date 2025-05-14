
// src/lib/api.ts
'use client';

import type { Student, Faculty, Section, Course, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole, CourseType, YearLevel, ActivityLogEntry, EmploymentType, EnrollmentType, AttendanceStatus, AttendanceRecord, TeacherClassInfo, StudentAttendanceData } from '@/types';
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateTeacherUsername, generateStudentId as generateFrontendStudentId, generateDefaultPasswordDisplay } from '@/lib/utils';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

// --- Mock Data Initialization ---
let nextStudentDbId = 3;
let nextFacultyDbId = 4;
let nextActivityLogId = 1;
let nextAttendanceRecordId = 1;


export let mockCourses: Course[] = [
    { id: "CS101", name: "Introduction to Programming", description: "Fundamentals of programming.", type: "Major", programId: ["CS"], yearLevel: "1st Year" },
    { id: "IT101", name: "IT Fundamentals", description: "Basics of IT.", type: "Major", programId: ["IT"], yearLevel: "1st Year" },
    { id: "CS201", name: "Data Structures", description: "Study of data organization.", type: "Major", programId: ["CS"], yearLevel: "2nd Year" },
    { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills", type: "Minor", programId: [] },
    { id: "MATH101", name: "Calculus I", description: "Differential Calculus", type: "Minor", programId: []},
    { id: "ENG101", name: "College English", description: "Reading and Writing", type: "Minor", programId: []},
];

export let mockApiPrograms: Program[] = [
    {
        id: "CS", name: "Computer Science", description: "Focuses on algorithms, data structures, and software development.",
        courses: { "1st Year": [mockCourses[0], mockCourses[4], mockCourses[3]], "2nd Year": [mockCourses[2]], "3rd Year": [], "4th Year": [] },
    },
    {
        id: "IT", name: "Information Technology", description: "Focuses on network administration, system management, and web technologies.",
        courses: { "1st Year": [mockCourses[1], mockCourses[5], mockCourses[3]], "2nd Year": [], "3rd Year": [], "4th Year": [] },
    },
];

export let mockStudents: Student[] = [];
// Initialize mock students with passwords
const initialMockStudents: Omit<Student, 'id' | 'studentId' | 'username' | 'section' | 'lastAccessed' | 'password'>[] = [
  { firstName: "Alice", lastName: "Smith", program: "CS", enrollmentType: "Returnee", year: "2nd Year", email: "alice@example.com", phone: "123-456-7890", emergencyContactName: "John Smith", emergencyContactRelationship: "Father", emergencyContactPhone: "111-222-3333", emergencyContactAddress: "123 Main St" },
  { firstName: "Bob", lastName: "Johnson", program: "IT", enrollmentType: "New", year: "1st Year", email: "bob@example.com", phone: "987-654-3210" },
];

initialMockStudents.forEach((stud, index) => {
    const id = index + 1;
    const studentId = generateFrontendStudentId();
    const username = generateStudentUsername(studentId);
    const password = generateDefaultPasswordDisplay(stud.lastName); // Use the correct function name
    const section = generateSectionCode(stud.program, stud.year || '1st Year', 0); // Simplified section generation for mock
    mockStudents.push({ ...stud, id, studentId, username, password, section, lastAccessed: null });
});


export let mockFaculty: Faculty[] = [];
const initialMockFaculty: Omit<Faculty, 'id' | 'facultyId' | 'username' | 'lastAccessed' | 'password'>[] = [
  { firstName: "David", lastName: "Lee", department: "Teaching", email: "david.lee@example.com", phone: "555-1234", employmentType: 'Regular' },
  { firstName: "Eve", lastName: "Davis", department: "Administrative", email: "eve.davis@example.com", phone: "555-5678", employmentType: 'Part Time'},
  { firstName: "Carol", lastName: "White", department: "Teaching", email: "carol.white@example.com", phone: "555-9012", employmentType: 'Regular'},
];

initialMockFaculty.forEach((fac, index) => {
    const id = index + 1;
    const facultyId = generateTeacherId();
    const username = generateTeacherUsername(facultyId, fac.department);
    const password = generateDefaultPasswordDisplay(fac.lastName); // Use the correct function name
    mockFaculty.push({ ...fac, id, facultyId, username, password, lastAccessed: null });
});


export let mockAnnouncements: Announcement[] = [
  { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year.", date: new Date(2024, 7, 15), targetAudience: "All", target: { programId: "all" }, author: "Admin" },
];

export let mockApiAdmins: AdminUser[] = [
    { id: 0, username: "admin", firstName: "Super", lastName: "Admin", email: "superadmin@example.com", role: "Super Admin", isSuperAdmin: true, password: "defadmin" },
];
// Automatically add Administrative faculty to mockApiAdmins as Sub Admins
mockFaculty.forEach(f => {
    if (f.department === 'Administrative' && !mockApiAdmins.some(a => a.id === f.id)) {
        mockApiAdmins.push({
            id: f.id,
            username: f.username,
            firstName: f.firstName,
            lastName: f.lastName,
            email: f.email,
            role: 'Sub Admin',
            isSuperAdmin: false,
            password: generateDefaultPasswordDisplay(f.lastName) // Use the correct function name
        });
    }
});


export let mockActivityLog: ActivityLogEntry[] = [];

export let mockTeacherTeachableCourses: { teacherId: number; courseIds: string[] }[] = [
    { teacherId: 1, courseIds: ["CS101", "CS201", "IT101", "ENG101"] },
    { teacherId: 3, courseIds: ["GEN001", "MATH101", "ENG101"] },
];

export let mockSections: Section[] = [];
export let mockSectionAssignments: SectionSubjectAssignment[] = [];
export let mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = [];
export let mockAttendanceRecords: AttendanceRecord[] = [
    { id: `att-${nextAttendanceRecordId++}`, studentId: 1, subjectId: "CS201", subjectName: "Data Structures", sectionId: "CS2A", date: format(new Date(2024, 8, 2), 'yyyy-MM-dd'), status: 'Present', teacherId: 1 },
    { id: `att-${nextAttendanceRecordId++}`, studentId: 1, subjectId: "CS201", subjectName: "Data Structures", sectionId: "CS2A", date: format(new Date(2024, 8, 3), 'yyyy-MM-dd'), status: 'Present', teacherId: 1 },
    { id: `att-${nextAttendanceRecordId++}`, studentId: 1, subjectId: "CS201", subjectName: "Data Structures", sectionId: "CS2A", date: format(new Date(2024, 8, 4), 'yyyy-MM-dd'), status: 'Absent', remarks: "Notified", teacherId: 1 },
    { id: `att-${nextAttendanceRecordId++}`, studentId: 2, subjectId: "IT101", subjectName: "IT Fundamentals", sectionId: "IT1A", date: format(new Date(2024, 8, 2), 'yyyy-MM-dd'), status: 'Present', teacherId: 1 },
    { id: `att-${nextAttendanceRecordId++}`, studentId: 2, subjectId: "IT101", subjectName: "IT Fundamentals", sectionId: "IT1A", date: format(new Date(2024, 8, 3), 'yyyy-MM-dd'), status: 'Late', remarks: "Arrived 15 mins late", teacherId: 1 },
];


export let mockTeacherClasses: TeacherClassInfo[] = [];


// --- Helper Functions for Mock Data Management ---

export const logActivity = (
    action: string,
    description: string,
    user: string = "Admin",
    targetId?: number | string,
    targetType?: ActivityLogEntry['targetType'],
    canUndo: boolean = false,
    originalData?: any
) => {
    const now = new Date();
    // Do not log "Section Processed" or "User Login" or section adding/updating logs to avoid clutter
    if (action.includes("Login") || action === "System Startup") {
        if (action === "System Startup" && !mockActivityLog.some(log => log.action === "System Startup")) {
            // Allow only one "System Startup" log
        } else if (action !== "System Startup") {
            return;
        }
    }
    
    const newLogEntry: ActivityLogEntry = {
        id: `log-${nextActivityLogId++}-${now.getTime()}`,
        timestamp: now,
        user,
        action,
        description,
        targetId,
        targetType,
        canUndo,
        originalData
    };
    
    // Remove any existing log entry that this new entry might be undoing or making redundant
    if (action.startsWith("Undone Action:")) {
        const originalActionDesc = description
            .replace("Reverted addition of ", "Added ")
            .replace("Reverted deletion of ", "Deleted ")
            .replace("Restored ", "Deleted ");
        const oldLogIndex = mockActivityLog.findIndex(log => log.description.startsWith(originalActionDesc.split(" (")[0]) && log.targetId === targetId && log.action !== "Undone Action:");
        if (oldLogIndex > -1) {
            mockActivityLog.splice(oldLogIndex, 1);
        }
    }


    mockActivityLog.unshift(newLogEntry); 
    mockActivityLog = mockActivityLog.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());


    if (mockActivityLog.length > 50) {
        mockActivityLog.pop();
    }
};

export let mockDashboardStats: DashboardStats = {} as DashboardStats;

const recalculateMockSectionCounts = () => {
    mockSections.forEach(section => {
        section.studentCount = mockStudents.filter(student => student.section === section.id).length;
    });
};


export const recalculateDashboardStats = () => {
    const teachingStaffCount = mockFaculty.filter(f => f.department === 'Teaching').length;
    const adminStaffCount = mockFaculty.filter(f => f.department === 'Administrative').length;
    const totalEventsAnnouncementsCount = mockAnnouncements.length;

    mockDashboardStats = {
        totalStudents: mockStudents.length,
        totalTeachingStaff: teachingStaffCount,
        totalAdministrativeStaff: adminStaffCount,
        totalEventsAnnouncements: totalEventsAnnouncementsCount,
    };
};


const updateMockSections = () => {
    const newSectionsMap = new Map<string, Section>();

    mockStudents.forEach(student => {
        if (student.section && student.section !== "UNASSIGNED" && student.program && student.year) {
            if (!newSectionsMap.has(student.section)) {
                const programDetails = mockApiPrograms.find(p => p.id === student.program);
                const existingMockSection = mockSections.find(sec => sec.id === student.section);
                const adviserDetails = mockFaculty.find(f => f.id === existingMockSection?.adviserId);
                
                newSectionsMap.set(student.section, {
                    id: student.section,
                    sectionCode: student.section,
                    programId: student.program,
                    programName: programDetails?.name || student.program,
                    yearLevel: student.year!,
                    adviserId: adviserDetails?.id,
                    adviserName: adviserDetails ? `${adviserDetails.firstName} ${adviserDetails.lastName}` : undefined,
                    studentCount: 0,
                });
            }
             const section = newSectionsMap.get(student.section)!;
             section.studentCount = (section.studentCount || 0) + 1;
        }
    });
    mockSections.forEach(existingSec => {
        if (!newSectionsMap.has(existingSec.id)) {
            newSectionsMap.set(existingSec.id, {
                ...existingSec,
                studentCount: 0 
            });
        }
    });
    mockSections = Array.from(newSectionsMap.values());
};


const updateMockSectionAssignments = () => {
    const newAssignments: SectionSubjectAssignment[] = [];
    mockSections.forEach(section => {
        const program = mockApiPrograms.find(p => p.id === section.programId);
        if (program && program.courses && section.yearLevel && program.courses[section.yearLevel]) {
            const coursesForYear = program.courses[section.yearLevel] || [];
            coursesForYear.forEach(course => {
                const existingAssignment = mockSectionAssignments.find(sa => sa.sectionId === section.id && sa.subjectId === course.id);
                
                let assignedTeacher: Faculty | undefined = undefined;
                if (existingAssignment?.teacherId && existingAssignment.teacherId !== 0) {
                    assignedTeacher = mockFaculty.find(f => f.id === existingAssignment.teacherId);
                } else { 
                    const teachableTeachers = mockTeacherTeachableCourses
                        .filter(ttc => ttc.courseIds.includes(course.id))
                        .map(ttc => mockFaculty.find(f => f.id === ttc.teacherId && f.department === 'Teaching'))
                        .filter(Boolean) as Faculty[];
                    
                    if (teachableTeachers.length > 0) {
                        const teacherLoad = teachableTeachers.map(t => ({
                            teacher: t,
                            load: newAssignments.filter(sa => sa.teacherId === t.id).length 
                        })).sort((a,b) => a.load - b.load);

                        if(teacherLoad.length > 0){
                            assignedTeacher = teacherLoad[0].teacher;
                        }
                    }
                }

                newAssignments.push({
                    id: `${section.id}-${course.id}`,
                    sectionId: section.id,
                    subjectId: course.id,
                    subjectName: course.name,
                    teacherId: assignedTeacher?.id || 0, 
                    teacherName: assignedTeacher ? `${assignedTeacher.firstName} ${assignedTeacher.lastName}` : "To Be Assigned"
                });
            });
        }
    });
    mockSectionAssignments = newAssignments;
};

const updateMockTeacherClasses = () => {
    mockTeacherClasses = [];
    mockFaculty.filter(f => f.department === 'Teaching').forEach(teacher => {
        mockSectionAssignments.filter(sa => sa.teacherId === teacher.id).forEach(assignment => {
            const section = mockSections.find(s => s.id === assignment.sectionId);
            if (section && !mockTeacherClasses.some(tc => tc.id === assignment.id)) { 
                mockTeacherClasses.push({
                    id: assignment.id, 
                    subjectName: assignment.subjectName || "Unknown Subject",
                    subjectId: assignment.subjectId,
                    sectionCode: section.sectionCode,
                    sectionId: section.id,
                    yearLevel: section.yearLevel,
                });
            }
        });
    });
};


const updateMockStudentGrades = () => {
    mockStudentSubjectAssignmentsWithGrades = [];
    mockStudents.forEach(student => {
        mockSectionAssignments
            .filter(sa => sa.sectionId === student.section)
            .forEach(sa => {
                const existingGradeEntry = mockStudentSubjectAssignmentsWithGrades.find(
                    g => g.studentId === student.id && g.subjectId === sa.subjectId && g.section === student.section
                );

                let prelim = existingGradeEntry?.prelimGrade ?? null;
                let midterm = existingGradeEntry?.midtermGrade ?? null;
                let final = existingGradeEntry?.finalGrade ?? null;
                let prelimRemarks = existingGradeEntry?.prelimRemarks ?? "";
                let midtermRemarks = existingGradeEntry?.midtermRemarks ?? "";
                let finalRemarks = existingGradeEntry?.finalRemarks ?? "";
                let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                
                if (prelim !== null || midterm !== null || final !== null) {
                    status = 'Incomplete';
                }
                if (final !== null) {
                    status = 'Complete';
                }

                mockStudentSubjectAssignmentsWithGrades.push({
                    assignmentId: `${sa.id}-${student.id}`,
                    studentId: student.id,
                    studentName: `${student.firstName} ${student.lastName}`,
                    subjectId: sa.subjectId,
                    subjectName: sa.subjectName || "Unknown Course",
                    section: student.section,
                    year: student.year!,
                    prelimGrade: prelim,
                    prelimRemarks: prelimRemarks,
                    midtermGrade: midterm,
                    midtermRemarks: midtermRemarks,
                    finalGrade: final,
                    finalRemarks: finalRemarks,
                    status: status,
                });
            });
    });
};

// Initial data population calls
updateMockSections();
updateMockSectionAssignments();
updateMockTeacherClasses();
updateMockStudentGrades();
recalculateDashboardStats();
logActivity("System Startup", "System initialized successfully.", "System");


// --- Undo Logic ---
export function executeUndoAddStudent(studentId: number, originalStudentData: Student) {
  const studentIndex = mockStudents.findIndex(s => s.id === studentId);
  if (studentIndex > -1) {
    mockStudents.splice(studentIndex, 1);
    updateMockSections();
    updateMockSectionAssignments();
    updateMockStudentGrades();
    logActivity("Undone Action: Add Student", `Reverted addition of ${originalStudentData.firstName} ${originalStudentData.lastName}`, "System", studentId, "student");
    recalculateDashboardStats();
  }
}

export function executeUndoDeleteStudent(originalStudentData: Student) {
  if (!mockStudents.some(s => s.id === originalStudentData.id)) {
    mockStudents.push(originalStudentData);
    mockStudents.sort((a,b) => b.id - a.id); 
    updateMockSections();
    updateMockSectionAssignments();
    updateMockStudentGrades();
    logActivity("Undone Action: Delete Student", `Restored student ${originalStudentData.firstName} ${originalStudentData.lastName}`, "System", originalStudentData.id, "student");
    recalculateDashboardStats();
  }
}

export function executeUndoAddFaculty(facultyId: number, originalFacultyData: Faculty) {
    const facultyIndex = mockFaculty.findIndex(f => f.id === facultyId);
    if (facultyIndex > -1) {
        mockFaculty.splice(facultyIndex, 1);
        if (originalFacultyData.department === 'Administrative') {
             mockApiAdmins = mockApiAdmins.filter(a => a.id !== facultyId || a.isSuperAdmin);
        }
        updateMockTeacherClasses(); 
        logActivity("Undone Action: Add Faculty", `Reverted addition of ${originalFacultyData.firstName} ${originalFacultyData.lastName}`, "System", facultyId, "faculty");
        recalculateDashboardStats();
    }
}

export function executeUndoDeleteFaculty(originalFacultyData: Faculty) {
    if (!mockFaculty.some(f => f.id === originalFacultyData.id)) {
        mockFaculty.push(originalFacultyData);
        mockFaculty.sort((a,b) => b.id - a.id); 
        if (originalFacultyData.department === 'Administrative') {
             if (!mockApiAdmins.some(a => a.id === originalFacultyData.id)) {
                mockApiAdmins.push({
                    id: originalFacultyData.id, username: originalFacultyData.username,
                    firstName: originalFacultyData.firstName, lastName: originalFacultyData.lastName,
                    email: originalFacultyData.email, role: 'Sub Admin', isSuperAdmin: false, password: originalFacultyData.password
                });
            }
        }
        updateMockTeacherClasses();
        logActivity("Undone Action: Delete Faculty", `Restored faculty ${originalFacultyData.firstName} ${originalFacultyData.lastName}`, "System", originalFacultyData.id, "faculty");
        recalculateDashboardStats();
    }
}

export function executeUndoRemoveAdminRole(adminData: AdminUser & { originalDepartment?: DepartmentType }): boolean {
    const facultyMember = mockFaculty.find(f => f.id === adminData.id);
    if (facultyMember) {
        facultyMember.department = adminData.originalDepartment || 'Administrative'; 
        if (facultyMember.department === 'Administrative' && !mockApiAdmins.some(a => a.id === adminData.id)) {
             mockApiAdmins.push({ 
                id: adminData.id, username: adminData.username, firstName: adminData.firstName,
                lastName: adminData.lastName, email: adminData.email, role: 'Sub Admin', isSuperAdmin: false, password: facultyMember.password
            });
        } else if (facultyMember.department !== 'Administrative' && mockApiAdmins.some(a => a.id === adminData.id && !a.isSuperAdmin)) {
            mockApiAdmins = mockApiAdmins.filter(a => a.id !== adminData.id || a.isSuperAdmin);
        }
        logActivity("Undone Action: Remove Admin Role", `Restored admin role (via faculty department) for ${adminData.username}`, "System", adminData.id, "admin");
        recalculateDashboardStats();
        return true;
    }
    if (!facultyMember && !mockApiAdmins.some(a => a.id === adminData.id) && adminData.role !== 'Super Admin') {
        mockApiAdmins.push(adminData); 
        logActivity("Undone Action: Remove Admin Role", `Restored explicit admin role for ${adminData.username}`, "System", adminData.id, "admin");
        recalculateDashboardStats();
        return true;
    }
    console.warn("Could not fully undo admin role removal for ID:", adminData.id, "Faculty member not found or scenario not covered.");
    return false;
}

export const getMockStudentsForClass = (sectionId: string): Student[] => {
    return mockStudents.filter(student => student.section === sectionId);
};

export const saveMockAttendance = (
    teacherId: number,
    classInfo: TeacherClassInfo,
    date: Date,
    studentAttendances: StudentAttendanceData[]
): void => {
    const dateString = format(date, 'yyyy-MM-dd');
    studentAttendances.forEach(sa => {
        const existingRecordIndex = mockAttendanceRecords.findIndex(
            r => r.studentId === sa.studentId && r.subjectId === classInfo.subjectId && r.sectionId === classInfo.sectionId && r.date === dateString
        );
        const student = mockStudents.find(s => s.id === sa.studentId);

        if (existingRecordIndex > -1) {
            mockAttendanceRecords[existingRecordIndex].status = sa.status;
            mockAttendanceRecords[existingRecordIndex].remarks = sa.remarks;
            mockAttendanceRecords[existingRecordIndex].teacherId = teacherId;
        } else {
            mockAttendanceRecords.push({
                id: `att-${nextAttendanceRecordId++}`,
                studentId: sa.studentId,
                studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
                subjectId: classInfo.subjectId,
                subjectName: classInfo.subjectName,
                sectionId: classInfo.sectionId,
                date: dateString,
                status: sa.status,
                remarks: sa.remarks,
                teacherId: teacherId,
            });
        }
    });
    logActivity("Saved Attendance", `For ${classInfo.subjectName} - ${classInfo.sectionCode} on ${dateString}`, "Teacher", classInfo.id, "attendance");
};

export const getMockStudentAttendance = (studentId: number): AttendanceRecord[] => {
    return mockAttendanceRecords.filter(r => r.studentId === studentId).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
};


// --- API CONFIGURATION ---
export const USE_MOCK_API = true; 
const API_BASE_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL ? process.env.NEXT_PUBLIC_API_BASE_URL : 'http://localhost:8000';


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

const finalMockPath = (path: string): string => {
    let formattedPath = path;
    if (formattedPath.startsWith('/api/')) {
        formattedPath = formattedPath.substring(5);
    } else if (formattedPath.startsWith('/')) {
        formattedPath = formattedPath.substring(1);
    }
    return formattedPath;
};


// --- MOCK API IMPLEMENTATIONS ---
const mockFetchData = async <T>(path: string): Promise<T> => {
    const phpPath = finalMockPath(path);
    console.log(`MOCK fetchData from: ${phpPath}`);
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        if (phpPath === 'students/read.php') return [...mockStudents].sort((a,b) => b.id - a.id) as T;
        if (phpPath === 'teachers/read.php') return [...mockFaculty].sort((a,b) => b.id - a.id) as T;
        if (phpPath === 'admins/read.php') {
            const facultyAdmins: AdminUser[] = mockFaculty
                .filter(f => f.department === 'Administrative')
                .map(f => ({
                    id: f.id, username: f.username, firstName: f.firstName,
                    lastName: f.lastName, email: f.email, role: 'Sub Admin' as AdminRole, isSuperAdmin: false, password: f.password
                }));
            const explicitSubAdmins = mockApiAdmins.filter(a => !a.isSuperAdmin && !facultyAdmins.some(fa => fa.id === a.id));
            let allAdmins: AdminUser[] = [];
            const superAdmin = mockApiAdmins.find(a => a.isSuperAdmin && a.id === 0);
            if(superAdmin) allAdmins.push(superAdmin);
            allAdmins = [...allAdmins, ...facultyAdmins, ...explicitSubAdmins];
            const uniqueAdmins = Array.from(new Map(allAdmins.map(admin => [admin.id, admin])).values());
            return uniqueAdmins as T;
        }
        if (phpPath === 'programs/read.php') return [...mockApiPrograms] as T;
        if (phpPath === 'courses/read.php') return [...mockCourses] as T;

        if (phpPath.startsWith('sections/read.php')) {
            updateMockSections();
            const urlParams = new URLSearchParams(phpPath.split('?')[1] || '');
            const sectionIdParam = urlParams.get('id');
            if (sectionIdParam) {
                const section = mockSections.find(s => s.id === sectionIdParam);
                 if (section) {
                     section.studentCount = mockStudents.filter(st => st.section === section.id).length;
                     return [section] as unknown as T;
                 }
                 return [] as unknown as T;
            } else {
                mockSections.forEach(sec => { sec.studentCount = mockStudents.filter(st => st.section === sec.id).length; });
                return [...mockSections] as T;
            }
        }

        if (phpPath === 'announcements/read.php') {
            return [...mockAnnouncements].sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'student/announcements/read.php') {
            const studentDetails = mockStudents.find(s => s.id === (Number(localStorage.getItem('userId')) || 1) ); 
            if (!studentDetails) return [] as T;
            return mockAnnouncements.filter(ann =>
                (ann.targetAudience === 'All' || ann.targetAudience === 'Student') &&
                (ann.target.programId === 'all' || ann.target.programId === studentDetails.program || !ann.target.programId) &&
                (ann.target.yearLevel === 'all' || ann.target.yearLevel === studentDetails.year || !ann.target.yearLevel) &&
                (ann.target.section === 'all' || ann.target.section === studentDetails.section || !ann.target.section)
            ).sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'teacher/announcements/read.php') {
            const teacherId = Number(localStorage.getItem('userId')) || 1; 
             return mockAnnouncements.filter(ann =>
                (ann.author_type === 'Admin' && (ann.targetAudience === 'All' || ann.targetAudience === 'Faculty')) ||
                (ann.author_type === 'Teacher' && ann.author_id === teacherId ) 
            ).sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }

        if (phpPath === 'admin/dashboard-stats.php') {
            recalculateDashboardStats();
            return { ...mockDashboardStats } as T;
        }
         if (phpPath.startsWith('sections/assignments/read.php')) {
            updateMockSectionAssignments();
            const url = new URL(`http://localhost?${phpPath.split('?')[1] || ''}`);
            const sectionIdParam = url.searchParams.get('sectionId');
            const allParam = url.searchParams.get('all');
            let assignmentsToReturn = mockSectionAssignments;
            if (sectionIdParam && allParam !== 'true') {
                 assignmentsToReturn = mockSectionAssignments.filter(a => a.sectionId === sectionIdParam);
            }
             return assignmentsToReturn as T;
        }
         if (phpPath === 'student/grades/read.php') {
             updateMockStudentGrades();
             const studentId = Number(localStorage.getItem('userId')) || 1;
             return mockStudentSubjectAssignmentsWithGrades
                .filter(g => g.studentId === studentId)
                .map(g => ({
                    id: g.subjectId, subjectName: g.subjectName, prelimGrade: g.prelimGrade,
                    midtermGrade: g.midtermGrade, finalGrade: g.finalGrade, finalRemarks: g.finalRemarks, status: g.status
                })) as T;
        }
         if (phpPath === 'teacher/assignments/grades/read.php') {
            updateMockStudentGrades();
            const teacherId = Number(localStorage.getItem('userId')) || 1;
            const teacherAssignedSubjectIds = new Set( mockSectionAssignments.filter(sa => sa.teacherId === teacherId).map(sa => sa.subjectId) );
            return mockStudentSubjectAssignmentsWithGrades.filter(gradeEntry =>
                    teacherAssignedSubjectIds.has(gradeEntry.subjectId) &&
                    mockSectionAssignments.some(sa => sa.sectionId === gradeEntry.section && sa.subjectId === gradeEntry.subjectId && sa.teacherId === teacherId)
                ) as T;
         }
         if (phpPath === 'student/profile/read.php') {
             const student = mockStudents.find(s => s.id === (Number(localStorage.getItem('userId')) || 1));
             if (student) return { ...student } as T;
             throw new Error("Mock student profile not found.");
        }
        if (phpPath === 'teacher/profile/read.php') {
             const faculty = mockFaculty.find(t => t.id === (Number(localStorage.getItem('userId')) || 1));
             if (faculty) return { ...faculty } as T;
             throw new Error("Mock faculty profile not found.");
        }
         if (phpPath === 'teacher/classes/read.php') { 
            updateMockTeacherClasses(); 
            const teacherId = Number(localStorage.getItem('userId')) || 1; 
            return mockTeacherClasses.filter(tc => mockSectionAssignments.some(sa => sa.id === tc.id && sa.teacherId === teacherId)) as T;
        }
        if (phpPath.startsWith('attendance/class/students')) { 
            const urlParams = new URLSearchParams(phpPath.split('?')[1] || '');
            const sectionId = urlParams.get('sectionId');
            if (!sectionId) throw new Error("Missing sectionId for fetching students.");
            return getMockStudentsForClass(sectionId) as T;
        }
        if (phpPath.startsWith('attendance/class/records')) { 
            const urlParams = new URLSearchParams(phpPath.split('?')[1] || '');
            const classId = urlParams.get('classId'); 
            const date = urlParams.get('date'); 
            const assignment = mockSectionAssignments.find(sa => sa.id === classId);
            if (!assignment || !date) throw new Error("Missing classId or date for fetching attendance records.");
            return mockAttendanceRecords.filter(
                r => r.subjectId === assignment.subjectId && r.sectionId === assignment.sectionId && r.date === date
            ) as T;
        }
        if (phpPath === 'student/attendance/read.php') {
             const studentId = Number(localStorage.getItem('userId')) || 1;
             return getMockStudentAttendance(studentId) as T;
        }
         if (phpPath === 'student/schedule/read.php') {
            const studentDetails = mockStudents.find(s => s.id === (Number(localStorage.getItem('userId')) || 1));
            if (!studentDetails) return [] as T;
            const studentSection = studentDetails.section;
            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments.filter(a => a.sectionId === studentSection).forEach((assign, index) => {
                     const dayOffset = index % 5;
                     const startTime = new Date();
                     startTime.setDate(startTime.getDate() + (dayOffset - startTime.getDay() + 1 + (dayOffset < startTime.getDay() -1 ? 7 : 0) ));
                     startTime.setHours(8 + (index % 4), 0, 0, 0);
                     const endTime = new Date(startTime);
                     endTime.setHours(startTime.getHours() + 1);
                     schedule.push({
                        id: `${assign.id}-${formatDate(startTime)}`, title: `${assign.subjectName || assign.subjectId}`,
                        start: startTime, end: endTime, type: 'class', location: `Room ${101 + (index % 10)}`,
                        teacher: assign.teacherName, section: assign.sectionId
                     });
                });
             return schedule as T;
        }
         if (phpPath === 'teacher/schedule/read.php') {
            const teacherId = Number(localStorage.getItem('userId')) || 1;
            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments.filter(a => a.teacherId === teacherId).forEach((assign, index) => {
                     const dayOffset = index % 5;
                     const startTime = new Date();
                     startTime.setDate(startTime.getDate() + (dayOffset - startTime.getDay() + 1 + (dayOffset < startTime.getDay() -1 ? 7 : 0) ));
                     startTime.setHours(8 + (index % 4), 0, 0, 0);
                     const endTime = new Date(startTime);
                     endTime.setHours(startTime.getHours() + 1);
                     schedule.push({
                         id: `${assign.id}-${formatDate(startTime)}`, title: `${assign.subjectName || assign.subjectId} - ${assign.sectionId}`,
                        start: startTime, end: endTime, type: 'class', location: `Room ${201 + (index % 5)}`,
                        section: assign.sectionId
                     });
                });
             return schedule as T;
        }
         if (phpPath === 'teacher/subjects/read.php') {
             const teacherId = Number(localStorage.getItem('userId')) || 1;
             const subjectIds = new Set(mockSectionAssignments.filter(a => a.teacherId === teacherId).map(a => a.subjectId));
             return mockCourses.filter(s => subjectIds.has(s.id)) as T;
         }
         if (phpPath === 'teacher/teachable-courses/read.php') {
            return [...mockTeacherTeachableCourses] as T;
        }
          if (phpPath === 'student/upcoming/read.php') {
             const upcoming: UpcomingItem[] = [];
              const studentDetails = mockStudents.find(s => s.id === (Number(localStorage.getItem('userId')) || 1));
              if (!studentDetails) return [] as T;
              const studentSchedule = mockSectionAssignments.filter(a => a.sectionId === studentDetails.section).map((assign, index) => {
                     const dayOffset = index % 5;
                     const startTime = new Date();
                     startTime.setDate(startTime.getDate() + (dayOffset - startTime.getDay() + 1 + (dayOffset < startTime.getDay() - 1 ? 7 : 0)));
                     startTime.setHours(8 + index, 0, 0, 0);
                     return { id: `${assign.id}-${formatDate(startTime)}`, title: `${assign.subjectName || assign.subjectId} Class`, date: startTime.toISOString(), type: 'class', };
                });
            if (studentSchedule.length > 0) upcoming.push(studentSchedule[0]);
             upcoming.push({ id: "assign-mock1", title: "Submit CS101 Homework", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), type: "assignment" });
             upcoming.push({ id: "event-mock1", title: "Department Meeting", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), type: "event" });
             return upcoming.slice(0, 5) as T;
         }
         if (phpPath === 'admin/activity-log/read.php') {
            const uniqueLogs = Array.from(new Map(mockActivityLog.map(log => [log.id, log])).values());
            return uniqueLogs.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10) as T;
        }
         if (phpPath.startsWith('sections/read.php/')) {
            updateMockSections();
            const sectionId = phpPath.split('/').pop();
            const section = mockSections.find(s => s.id === sectionId);
             if (section) {
                 section.studentCount = mockStudents.filter(st => st.section === section.id).length;
                 return section as T;
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
            const superAdmin = mockApiAdmins.find(a => a.username.toLowerCase() === username.toLowerCase() && a.isSuperAdmin);
            if (superAdmin && password === superAdmin.password) {
                if (typeof window !== 'undefined') { localStorage.setItem('userRole', "Super Admin"); localStorage.setItem('userId', String(superAdmin.id)); localStorage.setItem('username', superAdmin.username); }
                return { success: true, role: "Super Admin", redirectPath: "/admin/dashboard", userId: superAdmin.id } as ResponseData;
            }
            const studentUser = mockStudents.find(s => s.username === username);
            if (studentUser && password === studentUser.password) {
                 if (typeof window !== 'undefined') { localStorage.setItem('userRole', "Student"); localStorage.setItem('userId', String(studentUser.id)); localStorage.setItem('username', studentUser.username); }
                studentUser.lastAccessed = new Date().toISOString();
                return { success: true, role: "Student", redirectPath: "/student/dashboard", userId: studentUser.id } as ResponseData;
            }
            const facultyUser = mockFaculty.find(f => f.username === username);
            if (facultyUser && password === facultyUser.password) {
                let role: AdminRole | 'Teacher' = facultyUser.department === 'Administrative' ? 'Sub Admin' : 'Teacher';
                let redirectPath = facultyUser.department === 'Administrative' ? "/admin/dashboard" : "/teacher/dashboard";
                 if (typeof window !== 'undefined') { localStorage.setItem('userRole', role); localStorage.setItem('userId', String(facultyUser.id)); localStorage.setItem('username', facultyUser.username); }
                facultyUser.lastAccessed = new Date().toISOString();
                return { success: true, role: role, redirectPath: redirectPath, userId: facultyUser.id } as ResponseData;
            }
            const explicitSubAdmin = mockApiAdmins.find(a => a.username === username && !a.isSuperAdmin && !mockFaculty.some(f => f.id === a.id));
            if (explicitSubAdmin && password === explicitSubAdmin.password){
                 if (typeof window !== 'undefined') { localStorage.setItem('userRole', "Sub Admin"); localStorage.setItem('userId', String(explicitSubAdmin.id)); localStorage.setItem('username', explicitSubAdmin.username); }
                return { success: true, role: "Sub Admin", redirectPath: "/admin/dashboard", userId: explicitSubAdmin.id } as ResponseData;
            }
             throw new Error("Invalid username or password.");
        }
         if (phpPath === 'students/create.php') {
            const newStudentData = data as unknown as Omit<Student, 'id' | 'studentId' | 'section' | 'username' | 'lastAccessed' | 'password'>;
            const studentProgramId = newStudentData.program;
            let studentYearLevel = newStudentData.year;
            if (newStudentData.enrollmentType === 'New') studentYearLevel = '1st Year';
            else if (!studentYearLevel && (newStudentData.enrollmentType === 'Transferee' || newStudentData.enrollmentType === 'Returnee')) throw new Error("Year level is required for Transferee or Returnee enrollment type.");
            if (!studentProgramId || !studentYearLevel) throw new Error("Program and Year Level are required to determine section.");

            let assignedSectionCode: string | undefined = undefined;
            const existingSectionsForProgramYear = mockSections.filter(s => s.programId === studentProgramId && s.yearLevel === studentYearLevel).sort((a, b) => a.sectionCode.localeCompare(b.sectionCode));
            for (const section of existingSectionsForProgramYear) {
                if ((section.studentCount || 0) < 30) { assignedSectionCode = section.id; break; }
            }
            if (!assignedSectionCode) {
                assignedSectionCode = generateSectionCode(studentProgramId, studentYearLevel, existingSectionsForProgramYear.length);
                if (!mockSections.some(s => s.id === assignedSectionCode)) {
                    const programDetails = mockApiPrograms.find(p => p.id === studentProgramId);
                    mockSections.push({
                        id: assignedSectionCode, sectionCode: assignedSectionCode, programId: studentProgramId, programName: programDetails?.name || studentProgramId,
                        yearLevel: studentYearLevel, studentCount: 0 
                    });
                }
            }

            const nextId = mockStudents.reduce((max, s) => Math.max(max, s.id), 0) + 1;
            const studentId = generateFrontendStudentId();
            const username = generateStudentUsername(studentId);
            const password = generateDefaultPasswordDisplay(newStudentData.lastName); // Use correct function
            const student: Student = {
                ...(newStudentData as Omit<Student, 'id' | 'studentId' | 'username' | 'section' | 'year' | 'lastAccessed' | 'password'>),
                id: nextId, studentId: studentId, username: username, section: assignedSectionCode, year: studentYearLevel, lastAccessed: null, password: password
            };
            mockStudents.push(student);
            mockStudents.sort((a,b) => b.id - a.id);
            updateMockSections(); updateMockSectionAssignments(); updateMockStudentGrades();
            logActivity("Added Student", `${student.firstName} ${student.lastName} (${student.username})`, "Admin", student.id, "student", true, { ...student});
            recalculateDashboardStats();
            return student as ResponseData;
        }
         if (phpPath === 'teachers/create.php') {
            const newFacultyData = data as unknown as Omit<Faculty, 'id' | 'facultyId' | 'username' | 'lastAccessed' | 'password'>;
            const nextId = mockFaculty.reduce((max, f) => Math.max(max, f.id), 0) + 1;
            const facultyId = generateTeacherId();
            const department = newFacultyData.department || 'Teaching';
            const username = generateTeacherUsername(facultyId, department);
            const password = generateDefaultPasswordDisplay(newFacultyData.lastName); // Use correct function
            const faculty: Faculty = { ...newFacultyData, id: nextId, facultyId: facultyId, username: username, department: department, lastAccessed: null, password: password };
            mockFaculty.push(faculty);
            mockFaculty.sort((a,b) => b.id - a.id);
             if (faculty.department === 'Administrative') {
                 const existingAdminIndex = mockApiAdmins.findIndex(a => a.id === faculty.id);
                 const adminEntry: AdminUser = { id: faculty.id, username: faculty.username, firstName: faculty.firstName, lastName: faculty.lastName, email: faculty.email, role: 'Sub Admin', isSuperAdmin: false, password: faculty.password };
                 if (existingAdminIndex > -1) mockApiAdmins[existingAdminIndex] = adminEntry;
                 else mockApiAdmins.push(adminEntry);
             }
            updateMockTeacherClasses();
            logActivity("Added Faculty", `${faculty.firstName} ${faculty.lastName} (${faculty.username})`, "Admin", faculty.id, "faculty", true, { ...faculty });
            recalculateDashboardStats();
            return faculty as ResponseData;
        }
         if (phpPath === 'programs/create.php') {
             const newProgramData = data as unknown as Program;
             const newProgramId = newProgramData.id || newProgramData.name.toUpperCase().substring(0, 3) + mockApiPrograms.length;
             if (mockApiPrograms.some(p => p.id === newProgramId)) throw new Error("Program with this ID already exists.");
             const newProgram: Program = { id: newProgramId, name: newProgramData.name, description: newProgramData.description, courses: newProgramData.courses || { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] }, };
             Object.values(newProgram.courses).flat().forEach(courseInProgram => {
                 const globalCourseIndex = mockCourses.findIndex(c => c.id === courseInProgram.id);
                 if (globalCourseIndex > -1) {
                     if (mockCourses[globalCourseIndex].type === 'Major') {
                         if (!mockCourses[globalCourseIndex].programId) mockCourses[globalCourseIndex].programId = [];
                         if (!mockCourses[globalCourseIndex].programId!.includes(newProgram.id)) mockCourses[globalCourseIndex].programId!.push(newProgram.id);
                     }
                 } else { mockCourses.push({ ...courseInProgram, programId: courseInProgram.type === 'Major' ? [newProgram.id] : [] }); }
             });
             mockApiPrograms.push(newProgram);
             logActivity("Added Program", newProgram.name, "Admin", newProgram.id, "program");
             return newProgram as ResponseData;
         }
         if (phpPath === 'courses/create.php') {
             const newCourseData = data as Course;
             const nextIdNumber = mockCourses.reduce((max, c) => { const numId = parseInt(c.id.replace(/[^0-9]/g, ''), 10); return isNaN(numId) ? max : Math.max(max, numId); }, 0) +1;
             const newCourse: Course = { ...newCourseData, id: newCourseData.id || `C${String(nextIdNumber).padStart(3,'0')}`, programId: newCourseData.type === 'Major' ? (Array.isArray(newCourseData.programId) ? newCourseData.programId : (newCourseData.programId ? [newCourseData.programId as unknown as string] : [])) : [], };
             if (mockCourses.some(c => c.id === newCourse.id)) throw new Error(`Course with ID ${newCourse.id} already exists.`);
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
               if (!mockApiPrograms[programIndex].courses[yearLevel]) mockApiPrograms[programIndex].courses[yearLevel] = [];
                if (mockApiPrograms[programIndex].courses[yearLevel].some(c => c.id === courseId)) throw new Error(`Course ${course.name} is already assigned to ${programId} - ${yearLevel}.`);
                if (course.type === 'Major' && (!course.programId || !course.programId.includes(programId))) throw new Error(`Major course ${course.name} does not belong to program ${programId} and cannot be assigned.`);
                for (const yr in mockApiPrograms[programIndex].courses) { if (mockApiPrograms[programIndex].courses[yr as YearLevel].some(c => c.id === courseId) && yr !== yearLevel) throw new Error(`Course ${course.name} is already assigned to ${yr} in this program.`); }
                mockApiPrograms[programIndex].courses[yearLevel].push(course);
                updateMockSectionAssignments(); updateMockStudentGrades();
                logActivity("Assigned Course to Program", `${course.name} to ${mockApiPrograms[programIndex].name} (${yearLevel})`, "Admin");
                return { ...mockApiPrograms[programIndex] } as ResponseData;
         }
         if (phpPath === 'admin/reset_password.php') {
              const { userId, userType, lastName } = data as { userId: number; userType: string; lastName: string };
              let targetFullname: string = `ID ${userId}`; let newPassword = "";
              if (userType === 'student') {
                  const student = mockStudents.find(s => s.id === userId);
                  if (student) {targetFullname = `${student.firstName} ${student.lastName}`; newPassword = generateDefaultPasswordDisplay(lastName); student.password = newPassword; } else throw new Error(`Student with ID ${userId} not found.`);
                  logActivity(`Reset Student Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'teacher') {
                  const facultyMember = mockFaculty.find(f => f.id === userId);
                  if (facultyMember) {targetFullname = `${facultyMember.firstName} ${facultyMember.lastName}`; newPassword = generateDefaultPasswordDisplay(lastName); facultyMember.password = newPassword;} else throw new Error(`Faculty with ID ${userId} not found.`);
                   logActivity(`Reset Faculty Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'admin') {
                  const adminUser = mockApiAdmins.find(a => a.id === userId);
                  if (adminUser) { if(adminUser.isSuperAdmin) throw new Error("Super Admin password must be changed via Settings."); targetFullname = adminUser.firstName ? `${adminUser.firstName} ${adminUser.lastName}` : adminUser.username; newPassword = generateDefaultPasswordDisplay(lastName); adminUser.password = newPassword; logActivity("Reset Admin Password", `For ${targetFullname} (${adminUser.username})`, "Admin");
                  } else throw new Error(`Admin user with ID ${userId} not found.`);
              } else throw new Error(`Invalid user type for password reset: ${userType}`);
              console.log(`Mock password reset for ${userType} ${targetFullname}. Default: ${newPassword}`);
              return { message: `${userType} password reset successfully. Default: ${newPassword}` } as ResponseData;
        }
        if (phpPath === 'announcements/create.php') {
            const newAnnData = data as { title: string; content: string; targetAudience: Announcement['targetAudience'], target: any };
            const nextId = `ann${mockAnnouncements.length + 1}`;
            const newAnnouncement: Announcement = { id: nextId, title: newAnnData.title, content: newAnnData.content, date: new Date(), targetAudience: newAnnData.targetAudience || 'All', target: newAnnData.target, author: "Admin" };
            mockAnnouncements.unshift(newAnnouncement);
            logActivity("Created Announcement", newAnnData.title, "Admin", newAnnData.target.programId || newAnnData.target.section || newAnnData.target.yearLevel || 'all', 'announcement');
            recalculateDashboardStats();
            return newAnnouncement as ResponseData;
        }
         if (phpPath.match(/^sections\/adviser\/update\.php$/)) {
             const { sectionId, adviserId } = data as { sectionId: string, adviserId: number | null };
             const sectionIndex = mockSections.findIndex(s => s.id === sectionId);
             if (sectionIndex > -1) {
                 const adviser = mockFaculty.find(t => t.id === adviserId && t.department === 'Teaching');
                 if (adviserId !== null && !adviser) throw new Error("Selected adviser is not a teaching staff member or does not exist.");
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
             const facultyMember = mockFaculty.find(t => t.id === teacherId && t.department === 'Teaching');
             const section = mockSections.find(sec => sec.id === sectionId);
             if (!section) throw new Error(`Section ${sectionId} not found.`);
             if (!subject) throw new Error(`Course(subject) ${subjectId} not found.`);
             if (teacherId !== 0 && !facultyMember) throw new Error(`Teacher with ID ${teacherId} not found or is not teaching staff.`);
             const teachableEntry = mockTeacherTeachableCourses.find(ttc => ttc.teacherId === teacherId);
             if (teacherId !== 0 && teachableEntry && teachableEntry.courseIds.length > 0 && !teachableEntry.courseIds.includes(subjectId)) throw new Error(`Teacher ${facultyMember?.firstName} ${facultyMember?.lastName} is not assigned to teach ${subject.name}. Manage teachable courses first.`);
             const assignmentId = `${sectionId}-${subjectId}`;
              const existingAssignmentIndex = mockSectionAssignments.findIndex(a => a.id === assignmentId);
              if (existingAssignmentIndex > -1) {
                   mockSectionAssignments[existingAssignmentIndex].teacherId = teacherId === 0 ? 0 : teacherId;
                   mockSectionAssignments[existingAssignmentIndex].teacherName = teacherId === 0 ? "To Be Assigned" : (facultyMember ? `${facultyMember.firstName} ${facultyMember.lastName}` : "To Be Assigned");
                   logActivity("Updated Teacher for Course-Section", `${subject?.name} in section ${sectionId} to ${teacherId === 0 ? 'To Be Assigned' : (facultyMember?.firstName + ' ' + facultyMember?.lastName)}`, "Admin");
                   updateMockStudentGrades(); updateMockTeacherClasses();
                   return { ...mockSectionAssignments[existingAssignmentIndex] } as ResponseData;
              } else if (teacherId !== 0) {
                 const newAssignment: SectionSubjectAssignment = { id: assignmentId, sectionId, subjectId, subjectName: subject?.name, teacherId, teacherName: facultyMember ? `${facultyMember.firstName} ${facultyMember.lastName}` : "To Be Assigned" };
                 mockSectionAssignments.push(newAssignment);
                 logActivity("Assigned Course to Section", `${subject?.name} to section ${sectionId} with ${facultyMember?.firstName} ${facultyMember?.lastName}`, "Admin");
                 updateMockStudentGrades(); updateMockTeacherClasses();
                 return newAssignment as ResponseData;
              } else throw new Error("Cannot create a new assignment without a teacher. To unassign, update an existing assignment.");
         }
         if (phpPath === 'attendance/save.php') { 
            const { teacherId, classInfo, date, studentAttendances } = data as { teacherId: number, classInfo: TeacherClassInfo, date: string, studentAttendances: StudentAttendanceData[] };
            const dateObj = parseISO(date); 
            saveMockAttendance(teacherId, classInfo, dateObj, studentAttendances);
            return { success: true, message: "Attendance saved successfully." } as ResponseData;
        }
         if (phpPath === 'assignments/grades/update.php') {
              const gradeData = data as StudentSubjectAssignmentWithGrades;
              const index = mockStudentSubjectAssignmentsWithGrades.findIndex(a => a.assignmentId === gradeData.assignmentId && a.studentId === gradeData.studentId);
              if (index > -1) {
                   mockStudentSubjectAssignmentsWithGrades[index] = { ...mockStudentSubjectAssignmentsWithGrades[index], prelimGrade: gradeData.prelimGrade, prelimRemarks: gradeData.prelimRemarks, midtermGrade: gradeData.midtermGrade, midtermRemarks: gradeData.midtermRemarks, finalGrade: gradeData.finalGrade, finalRemarks: gradeData.finalRemarks, };
                   const updated = mockStudentSubjectAssignmentsWithGrades[index];
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (updated.prelimGrade !== null || updated.midtermGrade !== null || updated.finalGrade !== null) status = 'Incomplete';
                    if (updated.finalGrade !== null) status = 'Complete';
                    updated.status = status;
                    logActivity("Updated Grades", `For ${updated.studentName} in ${updated.subjectName}`, "Teacher");
                   return updated as ResponseData;
               } else {
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (gradeData.prelimGrade !== null || gradeData.midtermGrade !== null || gradeData.finalGrade !== null) status = 'Incomplete';
                    if (gradeData.finalGrade !== null) status = 'Complete';
                    const student = mockStudents.find(s => s.id === gradeData.studentId);
                    const subject = mockCourses.find(s => s.id === gradeData.subjectId);
                    const sectionAssignment = mockSectionAssignments.find(sa => sa.id === gradeData.assignmentId.substring(0, gradeData.assignmentId.lastIndexOf('-')));
                    const newEntry: StudentSubjectAssignmentWithGrades = { ...gradeData, studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student', subjectName: subject ? subject.name : 'Unknown Subject', section: sectionAssignment?.sectionId || 'N/A', year: student?.year || 'N/A', status: status, };
                    mockStudentSubjectAssignmentsWithGrades.push(newEntry);
                    logActivity("Submitted Grades", `For ${newEntry.studentName} in ${newEntry.subjectName}`, "Teacher");
                    return newEntry as ResponseData;
               }
         }
        if (phpPath === 'admin/change_password.php') {
            const {currentPassword, newPassword} = data as any;
            const admin = mockApiAdmins.find(a => a.id === 0); // Super Admin
            if (!admin) throw new Error("Super admin not found.");
            if (admin.password !== currentPassword) throw new Error("Incorrect current password.");
            admin.password = newPassword;
            logActivity("Changed Admin Password", "Super Admin password updated", "Admin"); return { message: "Admin password updated successfully." } as ResponseData;
        }
        if (phpPath === 'student/change_password.php') {
            const {currentPassword, newPassword} = data as any;
            const studentId = Number(localStorage.getItem('userId'));
            const student = mockStudents.find(s => s.id === studentId);
            if (!student) throw new Error("Student not found.");
            if (student.password !== currentPassword) throw new Error("Incorrect current password.");
            student.password = newPassword;
            logActivity("Changed Password", "Student updated their password", String(studentId)); return { message: "Student password updated successfully." } as ResponseData;
        }
        if (phpPath === 'teacher/change_password.php') {
            const {currentPassword, newPassword} = data as any;
            const teacherId = Number(localStorage.getItem('userId'));
            let userToUpdate: Faculty | AdminUser | undefined = mockFaculty.find(t => t.id === teacherId);
            if (!userToUpdate) userToUpdate = mockApiAdmins.find(a => a.id === teacherId); 

            if (!userToUpdate) throw new Error("Faculty/Admin not found.");
            if (userToUpdate.password !== currentPassword) throw new Error("Incorrect current password.");
            userToUpdate.password = newPassword;
            logActivity("Changed Password", "Faculty/Admin updated their password", String(teacherId)); return { message: "Faculty/Admin password updated successfully." } as ResponseData;
        }
        if (phpPath === 'admin/activity-log/undo.php') {
            const { logId } = data as { logId: string };
            const logEntryIndex = mockActivityLog.findIndex(entry => entry.id === logId);
            if (logEntryIndex === -1) throw new Error("Action cannot be undone: Log entry not found.");
            const logEntry = mockActivityLog[logEntryIndex];
            if (!logEntry.canUndo) throw new Error("This action cannot be undone.");
            let undoSuccess = false; let specificUndoMessage: string | undefined;
            if (logEntry.action === "Added Student" && logEntry.targetType === "student" && logEntry.originalData && logEntry.targetId) { executeUndoAddStudent(logEntry.targetId as number, logEntry.originalData as Student); undoSuccess = true;
            } else if (logEntry.action === "Deleted Student" && logEntry.targetType === "student" && logEntry.originalData) { executeUndoDeleteStudent(logEntry.originalData as Student); undoSuccess = true;
            } else if (logEntry.action === "Added Faculty" && logEntry.targetType === "faculty" && logEntry.originalData && logEntry.targetId) { executeUndoAddFaculty(logEntry.targetId as number, logEntry.originalData as Faculty); undoSuccess = true;
            } else if (logEntry.action === "Deleted Faculty" && logEntry.targetType === "faculty" && logEntry.originalData) { executeUndoDeleteFaculty(logEntry.originalData as Faculty); undoSuccess = true;
            } else if (logEntry.action === "Removed Admin Role" && logEntry.targetType === "admin" && logEntry.originalData) { undoSuccess = executeUndoRemoveAdminRole(logEntry.originalData as AdminUser & { originalDepartment?: DepartmentType }); if (!undoSuccess) specificUndoMessage = "Could not fully undo admin role removal.";
            } else throw new Error(`Undo for action type "${logEntry.action}" is not implemented in mock or data missing.`);
            if (undoSuccess) { recalculateDashboardStats(); mockActivityLog.splice(logEntryIndex, 1); return { success: true, message: "Action undone." } as ResponseData; }
            else throw new Error(specificUndoMessage || "Undo operation failed or was not applicable.");
        }
        if (phpPath === 'sections/create.php') {
            const newSectionData = data as Partial<Section>;
            const { programId, yearLevel, sectionCode: providedSectionCode } = newSectionData;
            if (!programId || !yearLevel) throw new Error("Program ID and Year Level are required to create a section.");
            const sectionCode = providedSectionCode || generateSectionCode( programId, yearLevel, mockSections.filter(s => s.programId === programId && s.yearLevel === yearLevel).length );
            if (mockSections.some(s => s.id === sectionCode)) throw new Error(`Section with code ${sectionCode} already exists.`);
            const newSection: Section = { id: sectionCode, sectionCode: sectionCode, programId: programId, yearLevel: yearLevel, programName: mockApiPrograms.find(p => p.id === programId)?.name, adviserId: newSectionData.adviserId, adviserName: newSectionData.adviserId ? mockFaculty.find(f => f.id === newSectionData.adviserId)?.firstName + " " + mockFaculty.find(f => f.id === newSectionData.adviserId)?.lastName : undefined, studentCount: 0, };
            mockSections.push(newSection);
            return newSection as ResponseData;
        }
        if (phpPath === 'teacher/teachable-courses/update.php') {
            const { teacherId, courseIds } = data as { teacherId: number, courseIds: string[] };
            const index = mockTeacherTeachableCourses.findIndex(ttc => ttc.teacherId === teacherId);
            if (index > -1) mockTeacherTeachableCourses[index].courseIds = courseIds;
            else mockTeacherTeachableCourses.push({ teacherId, courseIds });
            const teacher = mockFaculty.find(f => f.id === teacherId);
            logActivity("Updated Teachable Courses", `For ${teacher?.firstName} ${teacher?.lastName}`, "Admin");
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
                const oldStudentData = { ...mockStudents[studentIndex] };
                const updatedStudentData = data as unknown as Partial<Student>;
                mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...updatedStudentData };
                if (oldStudentData.section !== mockStudents[studentIndex].section || oldStudentData.program !== mockStudents[studentIndex].program || oldStudentData.year !== mockStudents[studentIndex].year) {
                    updateMockSections(); updateMockSectionAssignments(); updateMockStudentGrades();
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
                const adminIndex = mockApiAdmins.findIndex(a => a.id === updatedFaculty.id && !a.isSuperAdmin);
                if (updatedFaculty.department === 'Administrative') {
                    const adminEntry: AdminUser = { id: updatedFaculty.id, username: updatedFaculty.username, firstName: updatedFaculty.firstName, lastName: updatedFaculty.lastName, email: updatedFaculty.email, role: 'Sub Admin', isSuperAdmin: false, password: updatedFaculty.password };
                    if (adminIndex > -1) mockApiAdmins[adminIndex] = adminEntry;
                    else if (!mockApiAdmins.some(a => a.id === updatedFaculty.id)) mockApiAdmins.push(adminEntry);
                } else if (oldDepartment === 'Administrative' && updatedFaculty.department !== 'Administrative') {
                    if (adminIndex > -1) mockApiAdmins.splice(adminIndex, 1);
                }
                updateMockTeacherClasses();
                logActivity("Updated Faculty", `${updatedFaculty.firstName} ${updatedFaculty.lastName}`, "Admin", id, "faculty");
                recalculateDashboardStats();
                return { ...updatedFaculty } as ResponseData;
            }
            throw new Error("Faculty not found for mock update.");
        }
         if (phpPath === 'student/profile/update.php') {
            const profileData = data as Student;
            const studentId = profileData.id;
            const index = mockStudents.findIndex(s => s.id === studentId);
            if (index > -1) {
                mockStudents[index] = { ...mockStudents[index], firstName: profileData.firstName, lastName: profileData.lastName, middleName: profileData.middleName, suffix: profileData.suffix, gender: profileData.gender, birthday: profileData.birthday, email: profileData.email, phone: profileData.phone, emergencyContactName: profileData.emergencyContactName, emergencyContactRelationship: profileData.emergencyContactRelationship, emergencyContactPhone: profileData.emergencyContactPhone, emergencyContactAddress: profileData.emergencyContactAddress, };
                logActivity("Updated Profile", `Student ${mockStudents[index].firstName} ${mockStudents[index].lastName} updated their profile.`, String(localStorage.getItem('userId')), mockStudents[index].id, "student");
                return { ...mockStudents[index] } as ResponseData;
            }
            throw new Error("Mock student profile not found for update.");
        }
         if (phpPath === 'teacher/profile/update.php') {
             const profileData = data as Faculty;
             const teacherId = profileData.id;
             const index = mockFaculty.findIndex(t => t.id === teacherId);
             if (index > -1) {
                 mockFaculty[index] = { ...mockFaculty[index], firstName: profileData.firstName, lastName: profileData.lastName, middleName: profileData.middleName, suffix: profileData.suffix, birthday: profileData.birthday, address: profileData.address, email: profileData.email, phone: profileData.phone, emergencyContactName: profileData.emergencyContactName, emergencyContactRelationship: profileData.emergencyContactRelationship, emergencyContactPhone: profileData.emergencyContactPhone, emergencyContactAddress: profileData.emergencyContactAddress, };
                 logActivity("Updated Profile", `Faculty ${mockFaculty[index].firstName} ${mockFaculty[index].lastName} updated their profile.`, String(localStorage.getItem('userId')), mockFaculty[index].id, "faculty");
                 return { ...mockFaculty[index] } as ResponseData;
             }
             throw new Error("Mock faculty profile not found for update.");
         }
          if (phpPath.startsWith('programs/update.php/')) {
             const programId = idStr;
             const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1) {
                 const updatedData = data as unknown as Program;
                 mockApiPrograms[programIndex].name = updatedData.name ?? mockApiPrograms[programIndex].name;
                 mockApiPrograms[programIndex].description = updatedData.description ?? mockApiPrograms[programIndex].description;
                if (updatedData.courses) {
                    (Object.keys(updatedData.courses) as YearLevel[]).forEach(year => {
                        if (updatedData.courses[year]) {
                            mockApiPrograms[programIndex].courses[year] = updatedData.courses[year].map(courseInPayload => {
                                const globalCourseIndex = mockCourses.findIndex(gc => gc.id === courseInPayload.id);
                                if (globalCourseIndex > -1) {
                                    mockCourses[globalCourseIndex] = {...mockCourses[globalCourseIndex], ...courseInPayload};
                                    if (mockCourses[globalCourseIndex].type === 'Major') {
                                        if (!mockCourses[globalCourseIndex].programId) mockCourses[globalCourseIndex].programId = [];
                                        if (!mockCourses[globalCourseIndex].programId!.includes(programId)) mockCourses[globalCourseIndex].programId!.push(programId);
                                    }
                                } else { mockCourses.push({ ...courseInPayload, programId: courseInPayload.type === 'Major' ? [programId] : [] }); }
                                return courseInPayload;
                            });
                        }
                    });
                }
                updateMockSectionAssignments(); updateMockStudentGrades(); updateMockTeacherClasses();
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
                   mockCourses[courseIndex] = { ...mockCourses[courseIndex], ...updatedCourseData, programId: updatedCourseData.type === 'Major' ? (Array.isArray(updatedCourseData.programId) ? updatedCourseData.programId : (updatedCourseData.programId ? [updatedCourseData.programId as unknown as string] : [])) : [], };
                    mockApiPrograms.forEach(program => { Object.keys(program.courses).forEach(year => { const yr = year as YearLevel; const assignedIndex = program.courses[yr].findIndex(c => c.id === courseId); if (assignedIndex > -1) program.courses[yr][assignedIndex] = { ...mockCourses[courseIndex] }; }); });
                    updateMockSectionAssignments(); updateMockStudentGrades(); updateMockTeacherClasses();
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
                mockSections[sectionIndex] = { ...mockSections[sectionIndex], programId: updatedSectionData.programId ?? mockSections[sectionIndex].programId, yearLevel: updatedSectionData.yearLevel ?? mockSections[sectionIndex].yearLevel, programName: mockApiPrograms.find(p => p.id === (updatedSectionData.programId ?? mockSections[sectionIndex].programId))?.name, };
                updateMockSectionAssignments(); updateMockStudentGrades(); updateMockTeacherClasses();
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
            updateMockSections(); updateMockSectionAssignments(); updateMockStudentGrades();
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
            if (deletedFaculty.department === 'Administrative') { mockApiAdmins = mockApiAdmins.filter(a => a.id !== id || a.isSuperAdmin); }
            mockSections.forEach(sec => { if(sec.adviserId === id) { sec.adviserId = undefined; sec.adviserName = undefined;} });
            mockSectionAssignments = mockSectionAssignments.filter(assign => assign.teacherId !== id);
            mockTeacherTeachableCourses = mockTeacherTeachableCourses.filter(ttc => ttc.teacherId !== id);
            updateMockSectionAssignments(); updateMockStudentGrades(); updateMockTeacherClasses();
            logActivity("Deleted Faculty", `${deletedFaculty.firstName} ${deletedFaculty.lastName} (${deletedFaculty.username})`, "Admin", id, "faculty", true, deletedFaculty);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('admins/delete.php/')) {
            const adminIdToRemove = parseInt(idPart || '0', 10);
            if (adminIdToRemove === 0) throw new Error("Cannot remove Super Admin role.");
            const adminUser = mockApiAdmins.find(a => a.id === adminIdToRemove);
            if (!adminUser) throw new Error("Admin role not found for mock removal.");
            const originalAdminData = {...adminUser}; let originalDepartment: DepartmentType | undefined = undefined;
            const facultyMember = mockFaculty.find(f => f.id === adminIdToRemove);
            if (facultyMember && facultyMember.department === 'Administrative') { originalDepartment = facultyMember.department; facultyMember.department = 'Teaching'; logActivity("Removed Admin Role", `For ${adminUser.username}. Faculty department changed to Teaching.`, "Admin", adminIdToRemove, "admin", true, {...originalAdminData, originalDepartment});
            } else { logActivity("Removed Admin Role", `Explicit admin ${adminUser.username} removed.`, "Admin", adminIdToRemove, "admin", true, originalAdminData); }
             mockApiAdmins = mockApiAdmins.filter(a => a.id !== adminIdToRemove);
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
             recalculateDashboardStats();
             return;
         }
         if (phpPath.startsWith('assignments/delete.php/')) {
             const id = idPart;
             const assignIndex = mockSectionAssignments.findIndex(a => a.id === id);
             if (assignIndex === -1) throw new Error("Section-Course assignment not found for mock delete.");
             const deletedAssignment = { ...mockSectionAssignments[assignIndex] };
             mockSectionAssignments.splice(assignIndex, 1);
             updateMockStudentGrades(); updateMockTeacherClasses();
             logActivity("Deleted Section-Course Assignment", `Course ${deletedAssignment.subjectName} from section ${deletedAssignment.sectionId}`, "Admin");
             return;
         }
         if (phpPath.startsWith('programs/delete.php/')) {
             const programId = idPart;
             const progIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (progIndex === -1) throw new Error("Program not found for mock delete.");
             const deletedProgram = { ...mockApiPrograms[progIndex] };
             mockApiPrograms.splice(progIndex, 1);
             mockCourses = mockCourses.map(c => { if (c.type === 'Major' && c.programId?.includes(programId)) { const updatedProgramIds = c.programId.filter(pid => pid !== programId); return { ...c, programId: updatedProgramIds }; } return c; });
             const sectionsToDelete = mockSections.filter(s => s.programId === programId).map(s => s.id);
             mockSections = mockSections.filter(s => s.programId !== programId);
             mockSectionAssignments = mockSectionAssignments.filter(a => !sectionsToDelete.includes(a.sectionId));
             mockStudents.forEach(student => { if (sectionsToDelete.includes(student.section)) student.section = "UNASSIGNED"; });
             updateMockSections(); updateMockSectionAssignments(); updateMockStudentGrades(); updateMockTeacherClasses();
             logActivity("Deleted Program", deletedProgram.name, "Admin", programId, "program");
             return;
          }
          if (phpPath.startsWith('courses/delete.php/')) {
             const courseId = idPart;
             const courseIndex = mockCourses.findIndex(c => c.id === courseId);
             if (courseIndex === -1) throw new Error("Course not found for mock delete.");
             const deletedCourse = { ...mockCourses[courseIndex] };
             mockCourses.splice(courseIndex, 1);
             mockApiPrograms.forEach(program => { Object.keys(program.courses).forEach(year => { const yr = year as YearLevel; program.courses[yr] = program.courses[yr].filter(c => c.id !== courseId); }); });
             mockSectionAssignments = mockSectionAssignments.filter(a => a.subjectId !== courseId);
             mockTeacherTeachableCourses.forEach(ttc => { ttc.courseIds = ttc.courseIds.filter(cid => cid !== courseId); });
             updateMockSectionAssignments(); updateMockStudentGrades(); updateMockTeacherClasses();
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
                updateMockSectionAssignments(); updateMockStudentGrades(); updateMockTeacherClasses();
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
            if (studentsInSec > 0) { console.warn(`Attempting to delete section ${deletedSection.sectionCode} which has ${studentsInSec} student(s). For mock, students will be disassociated.`); mockStudents = mockStudents.map(s => s.section === sectionIdToDelete ? { ...s, section: 'UNASSIGNED' } : s); }
            mockSections.splice(sectionIndex, 1);
            mockSectionAssignments = mockSectionAssignments.filter(sa => sa.sectionId !== sectionIdToDelete);
            updateMockSections(); updateMockSectionAssignments(); updateMockStudentGrades(); updateMockTeacherClasses();
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


// --- Generic Fetch Functions ---
export const fetchData = async <T>(path: string): Promise<T> => {
    if (USE_MOCK_API) return mockFetchData(path);

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
    if (USE_MOCK_API) return mockPostData(path, data);

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
     if (USE_MOCK_API) return mockPutData(path, data);

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
    if (USE_MOCK_API) return mockDeleteData(path);

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
export { mockApiPrograms, mockCourses, mockStudents, mockFaculty, mockSections, mockAnnouncements, mockSectionAssignments, mockApiAdmins };
export { mockActivityLog, mockDashboardStats, mockStudentSubjectAssignmentsWithGrades, mockTeacherTeachableCourses, mockTeacherClasses, mockAttendanceRecords };
