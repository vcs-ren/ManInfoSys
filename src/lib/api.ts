// src/lib/api.ts
'use client';

import type { Student, Faculty, Section, Course, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment, DashboardStats, AdminUser, UpcomingItem, Program, DepartmentType, AdminRole, CourseType, YearLevel, ActivityLogEntry, EmploymentType, EnrollmentType } from '@/types';
import { generateStudentUsername, generateTeacherId, generateSectionCode, generateTeacherUsername, generateStudentId as generateFrontendStudentId } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// --- Mock Data Initialization ---
let nextStudentDbId = 3; // Start after existing mock students
let nextFacultyDbId = 4;   // Start after existing mock faculty
// nextProgramDbId, nextCourseDbId are not used as IDs are strings now.
let nextActivityLogId = 1; // Initial value for activity log IDs


export let mockCourses: Course[] = [
    { id: "CS101", name: "Introduction to Programming", description: "Fundamentals of programming.", type: "Major", programId: ["CS"], yearLevel: "1st Year" },
    { id: "IT101", name: "IT Fundamentals", description: "Basics of IT.", type: "Major", programId: ["IT"], yearLevel: "1st Year" },
    { id: "CS201", name: "Data Structures", description: "Study of data organization.", type: "Major", programId: ["CS"], yearLevel: "2nd Year" },
    { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills", type: "Minor", programId: [] }, // Minor courses have empty programId array
    { id: "MATH101", name: "Calculus I", description: "Differential Calculus", type: "Minor", programId: []},
];

export let mockApiPrograms: Program[] = [
    {
        id: "CS", name: "Computer Science", description: "Focuses on algorithms, data structures, and software development.",
        courses: { "1st Year": [mockCourses[0], mockCourses[4]], "2nd Year": [mockCourses[2]], "3rd Year": [], "4th Year": [] },
    },
    {
        id: "IT", name: "Information Technology", description: "Focuses on network administration, system management, and web technologies.",
        courses: { "1st Year": [mockCourses[1], mockCourses[3]], "2nd Year": [], "3rd Year": [], "4th Year": [] },
    },
];

export let mockStudents: Student[] = [
  { id: 1, studentId: generateFrontendStudentId(), username: "", firstName: "Alice", lastName: "Smith", program: "CS", enrollmentType: "Returnee", year: "2nd Year", section: "CS2A", email: "alice@example.com", phone: "123-456-7890", emergencyContactName: "John Smith", emergencyContactRelationship: "Father", emergencyContactPhone: "111-222-3333", emergencyContactAddress: "123 Main St", lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, studentId: generateFrontendStudentId(), username: "", firstName: "Bob", lastName: "Johnson", program: "IT", enrollmentType: "New", year: "1st Year", section: "IT1A", email: "bob@example.com", phone: "987-654-3210", lastAccessed: null },
];
mockStudents[0].username = generateStudentUsername(mockStudents[0].studentId);
mockStudents[1].username = generateStudentUsername(mockStudents[1].studentId);

export let mockFaculty: Faculty[] = [
  { id: 1, facultyId: generateTeacherId(), username: "", firstName: "David", lastName: "Lee", department: "Teaching", email: "david.lee@example.com", phone: "555-1234", employmentType: 'Regular', lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, facultyId: generateTeacherId(), username: "", firstName: "Eve", lastName: "Davis", department: "Administrative", email: "eve.davis@example.com", phone: "555-5678", employmentType: 'Part Time', lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, facultyId: generateTeacherId(), username: "", firstName: "Carol", lastName: "White", department: "Teaching", email: "carol.white@example.com", phone: "555-9012", employmentType: 'Regular', lastAccessed: null },
];
mockFaculty[0].username = generateTeacherUsername(mockFaculty[0].facultyId, mockFaculty[0].department);
mockFaculty[1].username = generateTeacherUsername(mockFaculty[1].facultyId, mockFaculty[1].department);
mockFaculty[2].username = generateTeacherUsername(mockFaculty[2].facultyId, mockFaculty[2].department);

export let mockAnnouncements: Announcement[] = [
  { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year.", date: new Date(2024, 7, 15), targetAudience: "All", target: { programId: "all" }, author: "Admin" },
];

export let mockApiAdmins: AdminUser[] = [
    { id: 0, username: "admin", firstName: "Super", lastName: "Admin", email: "superadmin@example.com", role: "Super Admin", isSuperAdmin: true },
    { id: mockFaculty.find(f=>f.department === 'Administrative')!.id, username: mockFaculty.find(f=>f.department === 'Administrative')!.username, firstName: mockFaculty.find(f=>f.department === 'Administrative')!.firstName, lastName: mockFaculty.find(f=>f.department === 'Administrative')!.lastName, email: mockFaculty.find(f=>f.department === 'Administrative')!.email, role: "Sub Admin", isSuperAdmin: false },
    { id: 1001, username: "a1001", firstName: "Test", lastName: "SubAdmin", email: "subadmin.test@example.com", role: "Sub Admin", isSuperAdmin: false },
];

export let mockActivityLog: ActivityLogEntry[] = [
    { id: `log-${nextActivityLogId++}-${Date.now()}`, timestamp: new Date(Date.now() - 1000 * 60 * 5), user: "System", action: "System Startup", description: "System initialized successfully.", canUndo: false, targetType: 'system' }
];

// Moved definition up
export let mockTeacherTeachableCourses: { teacherId: number; courseIds: string[] }[] = [
    { teacherId: 1, courseIds: ["CS101", "CS201", "IT101"] }, 
    { teacherId: 3, courseIds: ["GEN001", "MATH101"] }, 
];

export let mockSections: Section[] = [];
export let mockSectionAssignments: SectionSubjectAssignment[] = [];
export let mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = []; 

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
    
    // Basic duplicate check based on action, description, and very recent timestamp to avoid flood
    const isRecentDuplicate = mockActivityLog.some(
        log => log.action === action &&
               log.description === description &&
               log.user === user &&
               log.targetId === targetId &&
               log.targetType === targetType &&
               (now.getTime() - new Date(log.timestamp).getTime() < 2000) // 2-second window
    );

    if (action === "Section Processed" || isRecentDuplicate) { // Skip logging for "Section Processed" or if it's a very recent duplicate
        // console.warn("Skipped logging for:", action, description);
        return;
    }
    
    mockActivityLog.unshift(newLogEntry); 
    if (mockActivityLog.length > 50) { // Keep only the last 50 logs
        mockActivityLog.pop();
    }

    // Recalculate stats if relevant data changed
    if (targetType === 'student' || targetType === 'faculty' || targetType === 'admin' || targetType === 'announcement') {
        recalculateDashboardStats();
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
    // Sub Admin count excludes the Super Admin (ID 0)
    const subAdminCount = mockApiAdmins.filter(a => !a.isSuperAdmin).length;


    mockDashboardStats = {
        totalStudents: mockStudents.length,
        totalTeachingStaff: teachingStaffCount,
        totalAdministrativeStaff: adminStaffCount, 
        totalEventsAnnouncements: totalEventsAnnouncementsCount,
        totalAdmins: subAdminCount, // Only sub-admins
    };
};


const updateMockSections = () => {
    const newSectionsMap = new Map<string, Section>();

    mockStudents.forEach(student => {
        if (student.section) {
            if (!newSectionsMap.has(student.section)) {
                const programDetails = mockApiPrograms.find(p => p.id === student.program);
                // Try to find existing adviser info if section was already in mockSections
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
    // Add sections that might exist due to program creation but have no students yet
    mockApiPrograms.forEach(program => {
        (Object.keys(program.courses) as YearLevel[]).forEach(year => {
            // Simplistic: assume one section 'A' if courses exist for that year but no students yet
            if ((program.courses[year]?.length || 0) > 0) {
                 const potentialSectionCode = generateSectionCode(program.id, year, 0);
                 if (!newSectionsMap.has(potentialSectionCode) && !mockStudents.some(s => s.section === potentialSectionCode)) {
                     // Only add if no students are already creating this section and it doesn't already exist
                     // Check if this section code already exists from a previous manual mockSections entry or student addition
                     const existingSection = mockSections.find(s => s.id === potentialSectionCode);
                     if(!existingSection) {
                        // console.log(`Auto-creating section ${potentialSectionCode} due to program curriculum (no students yet).`);
                        // newSectionsMap.set(potentialSectionCode, {
                        //     id: potentialSectionCode,
                        //     sectionCode: potentialSectionCode,
                        //     programId: program.id,
                        //     programName: program.name,
                        //     yearLevel: year,
                        //     studentCount: 0
                        // });
                     }
                 }
            }
        });
    });

    mockSections = Array.from(newSectionsMap.values());
    // Do not log "Section Processed" here to avoid clutter.
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
                if (existingAssignment?.teacherId) {
                    assignedTeacher = mockFaculty.find(f => f.id === existingAssignment.teacherId);
                } else {
                    const teachableTeachers = mockTeacherTeachableCourses
                        .filter(ttc => ttc.courseIds.includes(course.id))
                        .map(ttc => mockFaculty.find(f => f.id === ttc.teacherId && f.department === 'Teaching'))
                        .filter(Boolean) as Faculty[];
                    
                    if (teachableTeachers.length > 0) {
                        const teacherLoad = teachableTeachers.map(t => ({
                            teacher: t,
                            load: mockSectionAssignments.filter(sa => sa.teacherId === t.id).length
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


const updateMockStudentGrades = () => {
    mockStudentSubjectAssignmentsWithGrades = []; // Reset before repopulating
    mockStudents.forEach(student => {
        mockSectionAssignments
            .filter(sa => sa.sectionId === student.section)
            .forEach(sa => {
                 let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                 let prelim: number | null = null;
                 let midterm: number | null = null;
                 let final: number | null = null;

                 if (student.id === 1 && sa.subjectId === "CS201") { // Example hardcoded grade
                    prelim = 85; midterm = 90; final = 88; status = 'Complete';
                 }

                mockStudentSubjectAssignmentsWithGrades.push({
                    assignmentId: `${sa.id}-${student.id}`, // Unique ID for student's specific assignment
                    studentId: student.id,
                    studentName: `${student.firstName} ${student.lastName}`,
                    subjectId: sa.subjectId,
                    subjectName: sa.subjectName || "Unknown Course",
                    section: student.section, // Section from student record
                    year: student.year!,     // Year from student record
                    prelimGrade: prelim,
                    midtermGrade: midterm,
                    finalGrade: final,
                    status: status,
                });
            });
    });
};

// Initial data population calls
updateMockSections();
updateMockSectionAssignments();
updateMockStudentGrades();
recalculateDashboardStats(); 


// --- Undo Logic ---
export function executeUndoAddStudent(studentId: number, originalStudentData: Student) {
  const studentIndex = mockStudents.findIndex(s => s.id === studentId);
  if (studentIndex > -1) {
    mockStudents.splice(studentIndex, 1);
    updateMockSections(); // Sections might be removed if they become empty
    updateMockSectionAssignments(); // Assignments might change if sections are removed
    updateMockStudentGrades();
    logActivity("Undone Action: Add Student", `Reverted addition of ${originalStudentData.firstName} ${originalStudentData.lastName}`, "System", studentId, "student");
    recalculateDashboardStats();
  }
}

export function executeUndoDeleteStudent(originalStudentData: Student) {
  if (!mockStudents.some(s => s.id === originalStudentData.id)) {
    mockStudents.push(originalStudentData);
    updateMockSections(); // Student's section might be re-created or count updated
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
        // If the faculty was an admin, remove their admin entry as well
        if (originalFacultyData.department === 'Administrative') {
             const adminIndex = mockApiAdmins.findIndex(a => a.id === facultyId && !a.isSuperAdmin);
             if (adminIndex > -1) {
                mockApiAdmins.splice(adminIndex, 1);
             }
        }
        logActivity("Undone Action: Add Faculty", `Reverted addition of ${originalFacultyData.firstName} ${originalFacultyData.lastName}`, "System", facultyId, "faculty");
        recalculateDashboardStats();
    }
}

export function executeUndoDeleteFaculty(originalFacultyData: Faculty) {
    if (!mockFaculty.some(f => f.id === originalFacultyData.id)) {
        mockFaculty.push(originalFacultyData);
        // If they were an admin, re-add their admin entry
        if (originalFacultyData.department === 'Administrative') {
             if (!mockApiAdmins.some(a => a.id === originalFacultyData.id)) { // Check to avoid duplicates if not properly removed
                mockApiAdmins.push({
                    id: originalFacultyData.id, username: originalFacultyData.username,
                    firstName: originalFacultyData.firstName, lastName: originalFacultyData.lastName,
                    email: originalFacultyData.email, role: 'Sub Admin', isSuperAdmin: false
                });
            }
        }
        logActivity("Undone Action: Delete Faculty", `Restored faculty ${originalFacultyData.firstName} ${originalFacultyData.lastName}`, "System", originalFacultyData.id, "faculty");
        recalculateDashboardStats();
    }
}

export function executeUndoRemoveAdminRole(adminData: AdminUser & { originalDepartment?: DepartmentType }): boolean {
    const facultyMember = mockFaculty.find(f => f.id === adminData.id);
    if (facultyMember) {
        // If it was a faculty-derived admin, restore their department
        facultyMember.department = adminData.originalDepartment || 'Administrative'; // Default back to Admin if original not stored
        // Ensure admin entry exists if department is Administrative
        if (facultyMember.department === 'Administrative' && !mockApiAdmins.some(a => a.id === adminData.id)) {
             mockApiAdmins.push({
                id: adminData.id, username: adminData.username, firstName: adminData.firstName,
                lastName: adminData.lastName, email: adminData.email, role: 'Sub Admin', isSuperAdmin: false
            });
        } else if (facultyMember.department !== 'Administrative' && mockApiAdmins.some(a => a.id === adminData.id && !a.isSuperAdmin)) {
            // If department changed away from Administrative, ensure sub-admin role is removed if it was faculty-derived
            const adminIndex = mockApiAdmins.findIndex(a => a.id === adminData.id && !a.isSuperAdmin);
            if(adminIndex > -1 && !adminData.isSuperAdmin) mockApiAdmins.splice(adminIndex, 1);
        }
        logActivity("Undone Action: Remove Admin Role", `Restored admin role (via faculty department) for ${adminData.username}`, "System", adminData.id, "admin");
        recalculateDashboardStats();
        return true;
    }
    // If it was an explicit sub-admin (not tied to faculty)
    if (!facultyMember && !mockApiAdmins.some(a => a.id === adminData.id) && adminData.role !== 'Super Admin') {
        mockApiAdmins.push(adminData); // Re-add the explicit admin role
        logActivity("Undone Action: Remove Admin Role", `Restored explicit admin role for ${adminData.username}`, "System", adminData.id, "admin");
        recalculateDashboardStats();
        return true;
    }
    console.warn("Could not fully undo admin role removal: No corresponding faculty or explicit admin found for ID:", adminData.id);
    return false;
}


// --- API CONFIGURATION ---
export const USE_MOCK_API = true; 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const getApiUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    // Ensure no double slashes if API_BASE_URL ends with / and path starts with /
    const baseUrl = API_BASE_URL.replace(/\/$/, ''); 
    const formattedPath = path.startsWith('/') ? path.substring(1) : path; // Ensure no leading slash after base
    return `${baseUrl}/${formattedPath}`;
};


const handleFetchError = (error: any, path: string, method: string, isNetworkError: boolean = false): never => {
    const targetUrl = getApiUrl(path); // Use getApiUrl to show the fully resolved URL
    let errorMessage = `Failed to ${method.toLowerCase()} data.`;
    let detailedLog = `API Request Details:\n    - Method: ${method}\n    - Path Provided: ${path}\n    - Resolved URL: ${targetUrl}`;

    if (typeof window !== 'undefined') { // Check if running in browser context
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
    // Re-throw a new error with the processed, more user-friendly message
    throw new Error(errorMessage);
};

// Utility to ensure path is relative to src/api for mock handling
const finalMockPath = (path: string): string => {
    let formattedPath = path;
    // Remove /api/ prefix if it exists, as mock paths are relative to src/api
    if (formattedPath.startsWith('/api/')) {
        formattedPath = formattedPath.substring(5);
    }
    // Remove leading slash if present after /api/ removal
    if (formattedPath.startsWith('/')) {
        formattedPath = formattedPath.substring(1);
    }
    return formattedPath;
};


// --- MOCK API IMPLEMENTATIONS ---
const mockFetchData = async <T>(path: string): Promise<T> => {
    const phpPath = finalMockPath(path); // Use finalMockPath
    console.log(`MOCK fetchData from: ${phpPath}`);
    await new Promise(resolve => setTimeout(resolve, 150)); // Simulate network delay

    try {
        if (phpPath === 'students/read.php') return [...mockStudents] as T;
        if (phpPath === 'teachers/read.php') return [...mockFaculty] as T;
        if (phpPath === 'admins/read.php') { // Simulates fetching all admin users
            const superAdmin = mockApiAdmins.find(a => a.isSuperAdmin && a.id === 0);
            // Derive sub-admins from faculty list for consistency
            const facultyAdmins: AdminUser[] = mockFaculty
                .filter(f => f.department === 'Administrative')
                .map(f => ({
                    id: f.id, 
                    username: f.username, 
                    firstName: f.firstName,
                    lastName: f.lastName,
                    email: f.email,
                    role: 'Sub Admin' as AdminRole, // Assuming admin role is set this way
                    isSuperAdmin: false,
                }));
            
            // Include explicit sub-admins not derived from faculty
            const explicitSubAdmins = mockApiAdmins.filter(a => !a.isSuperAdmin && !facultyAdmins.some(fa => fa.id === a.id));

            let allAdmins: AdminUser[] = [];
            if(superAdmin) allAdmins.push(superAdmin);
            allAdmins = [...allAdmins, ...facultyAdmins, ...explicitSubAdmins];
            
            // Ensure uniqueness if there's any overlap (e.g. an admin explicitly added who is also faculty)
            const uniqueAdmins = Array.from(new Map(allAdmins.map(admin => [admin.id, admin])).values());
            return uniqueAdmins as T;
        }
        if (phpPath === 'programs/read.php') return [...mockApiPrograms] as T;
        if (phpPath === 'courses/read.php') return [...mockCourses] as T;

        if (phpPath.startsWith('sections/read.php')) {
            updateMockSections(); // Ensure sections are up-to-date based on students
            const urlParams = new URLSearchParams(phpPath.split('?')[1] || '');
            const sectionIdParam = urlParams.get('id');

            if (sectionIdParam) {
                const section = mockSections.find(s => s.id === sectionIdParam);
                 if (section) {
                     // If fetching a single section, ensure its studentCount is current
                     section.studentCount = mockStudents.filter(st => st.section === section.id).length;
                     return [section] as unknown as T; // API might return array even for single ID
                 }
                 return [] as unknown as T; // Or throw 404 error simulation
            } else {
                // For all sections, ensure student counts are current
                mockSections.forEach(sec => {
                    sec.studentCount = mockStudents.filter(st => st.section === sec.id).length;
                });
                return [...mockSections] as T;
            }
        }

        if (phpPath === 'announcements/read.php') {
            // Return a copy sorted by date descending
            return [...mockAnnouncements].sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'student/announcements/read.php') {
            // Simulate student-specific announcements (e.g., Alice Smith, ID 1)
            const studentDetails = mockStudents.find(s => s.id === 1); // Assuming student Alice (id=1)
            if (!studentDetails) return [] as T;
            const studentProgram = studentDetails.program;
            const studentYear = studentDetails.year;
            const studentSection = studentDetails.section;
             return mockAnnouncements.filter(ann =>
                (ann.targetAudience === 'All' || ann.targetAudience === 'Student') &&
                (ann.target.programId === 'all' || ann.target.programId === studentProgram || !ann.target.programId) &&
                (ann.target.yearLevel === 'all' || ann.target.yearLevel === studentYear || !ann.target.yearLevel) &&
                (ann.target.section === 'all' || ann.target.section === studentSection || !ann.target.section)
            ).sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (phpPath === 'teacher/announcements/read.php') {
            const teacherId = 1; // Assuming teacher David Lee (id=1)
             return mockAnnouncements.filter(ann =>
                (ann.author_type === 'Admin' && (ann.targetAudience === 'All' || ann.targetAudience === 'Faculty')) ||
                (ann.author_type === 'Teacher' && ann.author === String(teacherId)) // Assuming author stores ID for teachers
            ).sort((a, b) => b.date.getTime() - a.date.getTime()) as T;
        }

        if (phpPath === 'admin/dashboard-stats.php') {
            recalculateDashboardStats(); // Ensure stats are current
            return { ...mockDashboardStats } as T;
        }
         if (phpPath.startsWith('sections/assignments/read.php')) {
            updateMockSectionAssignments(); // Ensure assignments are up-to-date
            const url = new URL(`http://localhost?${phpPath.split('?')[1] || ''}`); // Dummy base for URL parsing
            const sectionIdParam = url.searchParams.get('sectionId');
            const allParam = url.searchParams.get('all');

            let assignmentsToReturn = mockSectionAssignments;
            if (sectionIdParam && allParam !== 'true') { // If sectionId is specified AND not asking for all
                 assignmentsToReturn = mockSectionAssignments.filter(a => a.sectionId === sectionIdParam);
            }
            // if allParam is true, or no sectionIdParam, return all.
             return assignmentsToReturn as T;
        }
         if (phpPath === 'student/grades/read.php') {
             updateMockStudentGrades(); // Ensure student grades are current
             const studentId = 1; // Assuming Alice (id=1) for mock
             return mockStudentSubjectAssignmentsWithGrades
                .filter(g => g.studentId === studentId)
                .map(g => ({ // Transform to StudentTermGrade structure
                    id: g.subjectId, // Use subjectId as the 'id' for the grades table row
                    subjectName: g.subjectName,
                    prelimGrade: g.prelimGrade,
                    midtermGrade: g.midtermGrade,
                    finalGrade: g.finalGrade,
                    finalRemarks: g.finalRemarks, // Assuming finalRemarks is available in this type
                    status: g.status
                })) as T;
        }
         if (phpPath === 'teacher/assignments/grades/read.php') {
            updateMockStudentGrades(); // Ensures the base data is fresh
            const teacherId = 1; // Assuming David Lee (id=1) for mock
            // Get all subject IDs this teacher is assigned to across any section
             const teacherAssignedSubjectIds = new Set(
                mockSectionAssignments
                    .filter(sa => sa.teacherId === teacherId)
                    .map(sa => sa.subjectId)
            );

            // Filter student grades:
            // 1. The subject must be one the teacher is assigned to.
            // 2. The student must be in a section where this teacher teaches that specific subject.
            return mockStudentSubjectAssignmentsWithGrades
                .filter(gradeEntry => 
                    teacherAssignedSubjectIds.has(gradeEntry.subjectId) && // Teacher is assigned to this subject
                    mockSectionAssignments.some(sa => sa.sectionId === gradeEntry.section && sa.subjectId === gradeEntry.subjectId && sa.teacherId === teacherId) // Teacher teaches this subject in this student's section
                ) as T;
         }
         if (phpPath === 'student/profile/read.php') {
             const student = mockStudents.find(s => s.id === 1); // Alice
             if (student) return { ...student } as T; // Return a copy
             throw new Error("Mock student profile not found.");
        }
        if (phpPath === 'teacher/profile/read.php') {
             const faculty = mockFaculty.find(t => t.id === 1); // David Lee
             if (faculty) return { ...faculty } as T; // Return a copy
             throw new Error("Mock faculty profile not found.");
        }
         if (phpPath === 'student/schedule/read.php') {
            const studentDetails = mockStudents.find(s => s.id === 1); // Alice
            if (!studentDetails) return [] as T;
            const studentSection = studentDetails.section;
            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments
                .filter(a => a.sectionId === studentSection) 
                .forEach((assign, index) => {
                     // Simple schedule generation: Mon-Fri, 1 hour slots
                     const dayOffset = index % 5; // 0 for Mon, 1 for Tue, etc.
                     const startTime = new Date();
                     startTime.setDate(startTime.getDate() + (dayOffset - startTime.getDay() + 1 + (dayOffset < startTime.getDay() -1 ? 7 : 0) )); // Find next occurrence of that weekday
                     startTime.setHours(8 + (index % 4), 0, 0, 0); // Example: 8am, 9am, 10am, 11am slots
                     const endTime = new Date(startTime);
                     endTime.setHours(startTime.getHours() + 1);

                     schedule.push({
                        id: `${assign.id}-${formatDate(startTime)}`, // Make ID unique per day for demo
                        title: `${assign.subjectName || assign.subjectId}`, // Use subjectName
                        start: startTime,
                        end: endTime,
                        type: 'class',
                        location: `Room ${101 + (index % 10)}`, // Example room
                        teacher: assign.teacherName,
                        section: assign.sectionId
                     });
                });
             return schedule as T;
        }
         if (phpPath === 'teacher/schedule/read.php') {
            const teacherId = 1; // David Lee
            const schedule: ScheduleEntry[] = [];
            mockSectionAssignments
                .filter(a => a.teacherId === teacherId) 
                .forEach((assign, index) => {
                     const dayOffset = index % 5;
                     const startTime = new Date();
                     startTime.setDate(startTime.getDate() + (dayOffset - startTime.getDay() + 1 + (dayOffset < startTime.getDay() -1 ? 7 : 0) ));
                     startTime.setHours(8 + (index % 4), 0, 0, 0); // Example: 8am, 9am, 10am, 11am
                     const endTime = new Date(startTime);
                     endTime.setHours(startTime.getHours() + 1);
                     schedule.push({
                         id: `${assign.id}-${formatDate(startTime)}`,
                         title: `${assign.subjectName || assign.subjectId} - ${assign.sectionId}`,
                        start: startTime,
                        end: endTime,
                        type: 'class',
                        location: `Room ${201 + (index % 5)}`, // Different room series for teacher
                        section: assign.sectionId // Include section for teacher's view
                     });
                });
             return schedule as T;
        }
         if (phpPath === 'teacher/subjects/read.php') {
             const teacherId = 1; // David Lee
             const subjectIds = new Set(mockSectionAssignments.filter(a => a.teacherId === teacherId).map(a => a.subjectId));
             return mockCourses.filter(s => subjectIds.has(s.id)) as T;
         }
         if (phpPath === 'teacher/teachable-courses/read.php') {
            return [...mockTeacherTeachableCourses] as T;
        }
          if (phpPath === 'student/upcoming/read.php') {
             // Provide some mock upcoming items
             const upcoming: UpcomingItem[] = [];
              const studentDetails = mockStudents.find(s => s.id === 1); // Alice
              if (!studentDetails) return [] as T;
              // Add one class from their schedule
              const studentSchedule = mockSectionAssignments
                .filter(a => a.sectionId === studentDetails.section)
                .map((assign, index) => {
                     const dayOffset = index % 5;
                     const startTime = new Date();
                     startTime.setDate(startTime.getDate() + (dayOffset - startTime.getDay() + 1 + (dayOffset < startTime.getDay() - 1 ? 7 : 0)));
                     startTime.setHours(8 + index, 0, 0, 0); // Just an example time
                     return {
                         id: `${assign.id}-${formatDate(startTime)}`,
                         title: `${assign.subjectName || assign.subjectId} Class`,
                         date: startTime.toISOString(),
                         type: 'class',
                     };
                });
            if (studentSchedule.length > 0) {
                upcoming.push(studentSchedule[0]); // Add first class as an example
            }
            // Add a mock assignment and event
             upcoming.push({ id: "assign-mock1", title: "Submit CS101 Homework", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), type: "assignment" });
             upcoming.push({ id: "event-mock1", title: "Department Meeting", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), type: "event" });
             return upcoming.slice(0, 5) as T;
         }
         if (phpPath === 'admin/activity-log/read.php') {
            // Make sure to return a unique set of logs, sorted
            const uniqueLogs = Array.from(new Map(mockActivityLog.map(log => [log.id, log])).values());
            return uniqueLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10) as T;
        }
        // Mock fetching a single section by ID (if path includes sectionId)
         if (phpPath.startsWith('sections/read.php/')) { 
            updateMockSections(); // Ensure sections are up-to-date
            const sectionId = phpPath.split('/').pop(); 
            const section = mockSections.find(s => s.id === sectionId);
             if (section) {
                 section.studentCount = mockStudents.filter(st => st.section === section.id).length;
                 return section as T; // For single section, often API returns object, not array
             }
            throw new Error(`Mock section with ID ${sectionId} not found.`);
        }
        console.warn(`Mock API unhandled GET path: ${phpPath}`);
        throw new Error(`Mock GET endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
        console.error(`Error in mock fetchData for ${phpPath}:`, error);
        throw error; // Re-throw to be caught by the caller
    }
};

const mockPostData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    const phpPath = finalMockPath(path); // Use finalMockPath
    console.log(`MOCK postData to: ${phpPath}`, data);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    try {
         if (phpPath === 'login.php') {
             const { username, password } = data as any; // Assuming data has username and password
            // Super Admin
            if (username.toLowerCase() === "admin" && password === "defadmin") {
                 if (typeof window !== 'undefined') { // Store role for client-side use
                    localStorage.setItem('userRole', "Super Admin");
                    localStorage.setItem('userId', String(0)); // Super admin ID
                 }
                logActivity("User Login", `Super Admin logged in.`, "admin", 0, "admin");
                return { success: true, role: "Super Admin", redirectPath: "/admin/dashboard", userId: 0 } as ResponseData;
            }
            // Student Login
            const studentUser = mockStudents.find(s => s.username === username);
            if (studentUser && password === `@${studentUser.lastName.substring(0, 2).toUpperCase()}1001`) {
                 if (typeof window !== 'undefined') {
                    localStorage.setItem('userRole', "Student");
                    localStorage.setItem('userId', String(studentUser.id));
                 }
                studentUser.lastAccessed = new Date().toISOString(); // Update last accessed time
                logActivity("User Login", `Student ${studentUser.username} logged in.`, studentUser.username, studentUser.id, "student");
                return { success: true, role: "Student", redirectPath: "/student/dashboard", userId: studentUser.id } as ResponseData;
            }
            // Faculty Login (Teacher or Sub Admin)
            const facultyUser = mockFaculty.find(f => f.username === username);
            if (facultyUser && password === `@${facultyUser.lastName.substring(0, 2).toUpperCase()}1001`) {
                let role: AdminRole | 'Teacher' = 'Teacher';
                let redirectPath = "/teacher/dashboard";
                if (facultyUser.department === 'Administrative') {
                    role = 'Sub Admin';
                    redirectPath = "/admin/dashboard"; // Sub Admins go to admin dashboard
                }
                 if (typeof window !== 'undefined') {
                    localStorage.setItem('userRole', role);
                    localStorage.setItem('userId', String(facultyUser.id));
                 }
                facultyUser.lastAccessed = new Date().toISOString(); // Update last accessed
                logActivity("User Login", `Faculty ${facultyUser.username} logged in as ${role}.`, facultyUser.username, facultyUser.id, role.toLowerCase().replace(' ', '_') as ActivityLogEntry['targetType']);
                return { success: true, role: role, redirectPath: redirectPath, userId: facultyUser.id } as ResponseData;
            }
             throw new Error("Invalid username or password.");
        }
         if (phpPath === 'students/create.php') {
            const newStudentData = data as unknown as Omit<Student, 'id' | 'studentId' | 'section' | 'username' | 'lastAccessed'>;
            const studentProgramId = newStudentData.program;
            let studentYearLevel = newStudentData.year; // Year is now optional initially
            if (newStudentData.enrollmentType === 'New') {
                studentYearLevel = '1st Year'; // Automatically set for New students
            } else if (!studentYearLevel && (newStudentData.enrollmentType === 'Transferee' || newStudentData.enrollmentType === 'Returnee')) {
                 // This validation should ideally be in the form schema, but good to have a backend check too
                 throw new Error("Year level is required for Transferee or Returnee enrollment type.");
            }

            if (!studentProgramId || !studentYearLevel) {
                // This should not happen if validation above is correct
                throw new Error("Program and Year Level are required to determine section.");
            }

            // Section assignment logic:
            let assignedSectionCode: string | undefined = undefined;
            const existingSectionsForProgramYear = mockSections
                .filter(s => s.programId === studentProgramId && s.yearLevel === studentYearLevel)
                .sort((a, b) => a.sectionCode.localeCompare(b.sectionCode)); // Sort to get sections A, B, C in order

            // Try to fit student into an existing section if not full (max 30)
            for (const section of existingSectionsForProgramYear) {
                const studentCountInSection = mockStudents.filter(st => st.section === section.id).length;
                if (studentCountInSection < 30) { // Max 30 students per section
                    assignedSectionCode = section.id;
                    break;
                }
            }

            // If no existing section can accommodate, create a new one
            if (!assignedSectionCode) {
                const newSectionLetterSuffixIndex = existingSectionsForProgramYear.length; // e.g., if 0 sections exist, index is 0 (for 'A')
                assignedSectionCode = generateSectionCode(studentProgramId, studentYearLevel, newSectionLetterSuffixIndex);
                 // No need to explicitly add to mockSections here, updateMockSections will handle it if students are in it
            }

            // Generate new student ID and username
            const nextId = mockStudents.reduce((max, s) => Math.max(max, s.id), 0) + 1;
            const studentId = generateFrontendStudentId(); // Uses 100+random4
            const username = generateStudentUsername(studentId); // s+studentId
            
            const student: Student = {
                ...(newStudentData as Omit<Student, 'id' | 'studentId' | 'username' | 'section' | 'year' | 'lastAccessed'>), // Cast to exclude generated fields
                id: nextId,
                studentId: studentId, 
                username: username,     
                section: assignedSectionCode, // Assign the determined/created section
                year: studentYearLevel, // Ensure year is set
                lastAccessed: null, // New students haven't accessed
            };
            mockStudents.push(student);
            updateMockSections(); // This will create or update section counts, including new ones if needed
            updateMockSectionAssignments(); // Update course assignments if sections changed
            updateMockStudentGrades();
            logActivity("Added Student", `${student.firstName} ${student.lastName} (${student.username})`, "Admin", student.id, "student", true, { ...student, passwordHash: "mock_hash" }); // Store original for undo
            recalculateDashboardStats();
            return student as ResponseData;
        }
         if (phpPath === 'teachers/create.php') {
            const newFacultyData = data as unknown as Omit<Faculty, 'id' | 'facultyId' | 'username' | 'lastAccessed'>;
            const nextId = mockFaculty.reduce((max, f) => Math.max(max, f.id), 0) + 1;
            const facultyId = generateTeacherId(); // Uses 1000+random4
            const department = newFacultyData.department || 'Teaching'; // Default to teaching if not specified
            const username = generateTeacherUsername(facultyId, department); // t+facultyId or a+facultyId

            const faculty: Faculty = {
                ...newFacultyData,
                id: nextId,
                facultyId: facultyId, 
                username: username,     
                department: department,
                lastAccessed: null,
            };
            mockFaculty.push(faculty);
             // If administrative staff, also add/update them in mockApiAdmins
             if (faculty.department === 'Administrative') {
                 const existingAdminIndex = mockApiAdmins.findIndex(a => a.id === faculty.id);
                 const adminEntry: AdminUser = {
                    id: faculty.id,
                    username: faculty.username, // Use faculty username
                    firstName: faculty.firstName,
                    lastName: faculty.lastName,
                    email: faculty.email,
                    role: 'Sub Admin', // Auto-assign Sub Admin role
                    isSuperAdmin: false,
                 };
                 if (existingAdminIndex > -1) {
                     mockApiAdmins[existingAdminIndex] = adminEntry; // Update if somehow exists
                 } else {
                     mockApiAdmins.push(adminEntry);
                 }
             }
            logActivity("Added Faculty", `${faculty.firstName} ${faculty.lastName} (${faculty.username})`, "Admin", faculty.id, "faculty", true, { ...faculty, passwordHash: "mock_hash" }); // Store original for undo
            recalculateDashboardStats();
            return faculty as ResponseData;
        }
         if (phpPath === 'programs/create.php') {
             const newProgramData = data as unknown as Program; // Assume payload matches Program type
             // Ensure ID is unique, e.g., by taking first 2-3 chars of name + count, or require ID from user
             const newProgramId = newProgramData.id || newProgramData.name.toUpperCase().substring(0, 3) + mockApiPrograms.length;
             if (mockApiPrograms.some(p => p.id === newProgramId)) {
                 throw new Error("Program with this ID already exists.");
             }
             const newProgram: Program = {
                 id: newProgramId,
                 name: newProgramData.name,
                 description: newProgramData.description,
                 courses: newProgramData.courses || { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] }, // Default empty courses per year
             };
             // If courses are provided in the payload and they are new, add them to global mockCourses
             // This part might need refinement based on how courses are managed (globally or per program only)
             Object.values(newProgram.courses).flat().forEach(courseInProgram => {
                 const globalCourseIndex = mockCourses.findIndex(c => c.id === courseInProgram.id);
                 if (globalCourseIndex > -1) {
                     // If course exists globally and is Major, ensure this programId is added
                     if (mockCourses[globalCourseIndex].type === 'Major') {
                         if (!mockCourses[globalCourseIndex].programId) {
                             mockCourses[globalCourseIndex].programId = [];
                         }
                         if (!mockCourses[globalCourseIndex].programId!.includes(newProgram.id)) {
                             mockCourses[globalCourseIndex].programId!.push(newProgram.id);
                         }
                     }
                 } else {
                     // If course doesn't exist globally, add it
                     mockCourses.push({ 
                        ...courseInProgram, 
                        programId: courseInProgram.type === 'Major' ? [newProgram.id] : [] 
                    });
                 }
             });
             mockApiPrograms.push(newProgram);
             logActivity("Added Program", newProgram.name, "Admin", newProgram.id, "program");
             return newProgram as ResponseData;
         }
         if (phpPath === 'courses/create.php') {
             const newCourseData = data as Course; // Assume payload is a Course object
             // Auto-generate ID if not provided (simple example, ensure uniqueness)
             const nextIdNumber = mockCourses.reduce((max, c) => {
                const numId = parseInt(c.id.replace(/[^0-9]/g, ''), 10); // Extract numbers from ID
                return isNaN(numId) ? max : Math.max(max, numId);
             }, 0) +1; 

             const newCourse: Course = {
                 ...newCourseData,
                 id: newCourseData.id || `C${String(nextIdNumber).padStart(3,'0')}`, // e.g., C010
                 programId: newCourseData.type === 'Major' ? (Array.isArray(newCourseData.programId) ? newCourseData.programId : (newCourseData.programId ? [newCourseData.programId as unknown as string] : [])) : [],
             };
             if (mockCourses.some(c => c.id === newCourse.id)) {
                 throw new Error(`Course with ID ${newCourse.id} already exists.`);
             }
             mockCourses.push(newCourse);
             logActivity("Added Course", newCourse.name, "Admin", newCourse.id, "course");
             return newCourse as ResponseData;
         }
          if (phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)) { // Example path for assigning a course to a program/year
              const programId = phpPath.match(/^programs\/([^/]+)\/courses\/assign$/)?.[1];
              const { courseId, yearLevel } = data as { courseId: string, yearLevel: YearLevel }; 
              
              const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
              const course = mockCourses.find(c => c.id === courseId);

              if (programIndex === -1) throw new Error("Program not found.");
              if (!course) throw new Error("Course not found.");
              
              // Ensure the year level exists in the program's courses structure
               if (!mockApiPrograms[programIndex].courses[yearLevel]) {
                  mockApiPrograms[programIndex].courses[yearLevel] = [];
               }

                // Prevent adding the same course more than once per year in a program
                if (mockApiPrograms[programIndex].courses[yearLevel].some(c => c.id === courseId)) {
                    throw new Error(`Course ${course.name} is already assigned to ${programId} - ${yearLevel}.`);
                }

                // Major courses can only be assigned to the specific program they belong to.
                if (course.type === 'Major' && (!course.programId || !course.programId.includes(programId))) {
                     // This implies the major course being added doesn't list this program in its allowed programIds
                     throw new Error(`Major course ${course.name} does not belong to program ${programId} and cannot be assigned.`);
                }

                // Prevent assigning a course to a year level if it's already in another year level for THIS program
                for (const yr in mockApiPrograms[programIndex].courses) {
                    if (mockApiPrograms[programIndex].courses[yr as YearLevel].some(c => c.id === courseId) && yr !== yearLevel) {
                        throw new Error(`Course ${course.name} is already assigned to ${yr} in this program.`);
                    }
                }


                mockApiPrograms[programIndex].courses[yearLevel].push(course);
                updateMockSectionAssignments(); // Update section assignments after curriculum change
                updateMockStudentGrades(); // Update student grades context if needed
                logActivity("Assigned Course to Program", `${course.name} to ${mockApiPrograms[programIndex].name} (${yearLevel})`, "Admin");
                return { ...mockApiPrograms[programIndex] } as ResponseData; // Return updated program
         }
         if (phpPath === 'admin/reset_password.php') {
              const { userId, userType, lastName } = data as { userId: number; userType: string; lastName: string };
              let targetFullname: string = `ID ${userId}`;
              let defaultPassword = ""; // Will be set based on user type
              if (userType === 'student') {
                  const student = mockStudents.find(s => s.id === userId);
                  if (student) {targetFullname = `${student.firstName} ${student.lastName}`; defaultPassword = `@${student.lastName.substring(0,2).toUpperCase()}1001`;}
                  else throw new Error(`Student with ID ${userId} not found.`);
                  logActivity(`Reset Student Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'teacher') { // Covers both Teaching and Administrative faculty
                  const facultyMember = mockFaculty.find(f => f.id === userId);
                  if (facultyMember) {targetFullname = `${facultyMember.firstName} ${facultyMember.lastName}`; defaultPassword = `@${facultyMember.lastName.substring(0,2).toUpperCase()}1001`;}
                  else throw new Error(`Faculty with ID ${userId} not found.`);
                   logActivity(`Reset Faculty Password`, `For ${targetFullname}`, "Admin");
              } else if (userType === 'admin') { // Explicit sub-admin (not faculty-derived for password reset here)
                  const adminUser = mockApiAdmins.find(a => a.id === userId);
                  if (adminUser) {
                      if(adminUser.isSuperAdmin) throw new Error("Super Admin password must be changed via Settings.");
                      targetFullname = adminUser.firstName ? `${adminUser.firstName} ${adminUser.lastName}` : adminUser.username;
                      defaultPassword = `@${adminUser.lastName?.substring(0,2).toUpperCase() || "AD"}1001`; // Fallback for admin without lastname
                      logActivity("Reset Admin Password", `For ${targetFullname} (${adminUser.username})`, "Admin");
                  } else {
                      throw new Error(`Admin user with ID ${userId} not found.`);
                  }
              } else {
                  throw new Error(`Invalid user type for password reset: ${userType}`);
              }
              console.log(`Mock password reset for ${userType} ${targetFullname}. Default: ${defaultPassword}`);
              return { message: `${userType} password reset successfully. Default: ${defaultPassword}` } as ResponseData;
        }
        if (phpPath === 'announcements/create.php') {
            const newAnnData = data as { title: string; content: string; targetAudience: Announcement['targetAudience'], target: any }; // Assuming target is an object
            const nextId = `ann${mockAnnouncements.length + 1}`;
            const newAnnouncement: Announcement = {
                id: nextId,
                title: newAnnData.title,
                content: newAnnData.content,
                date: new Date(),
                targetAudience: newAnnData.targetAudience || 'All', // Default to All if not specified
                target: newAnnData.target, // Store the target object
                author: "Admin" // Assuming admin posts announcements for now
            };
            mockAnnouncements.unshift(newAnnouncement); // Add to the beginning for newest first
            logActivity("Created Announcement", newAnnData.title, "Admin", newAnnData.target.programId || newAnnData.target.section || newAnnData.target.yearLevel || 'all', 'announcement');
            recalculateDashboardStats(); // Update stats if announcements count towards it
            return newAnnouncement as ResponseData;
        }
         if (phpPath.match(/^sections\/adviser\/update\.php$/)) { // Path to assign adviser
             const { sectionId, adviserId } = data as { sectionId: string, adviserId: number | null };
             const sectionIndex = mockSections.findIndex(s => s.id === sectionId);
             if (sectionIndex > -1) {
                 // Ensure adviser is a teaching staff if assigning
                 const adviser = mockFaculty.find(t => t.id === adviserId && t.department === 'Teaching'); 
                 if (adviserId !== null && !adviser) {
                     throw new Error("Selected adviser is not a teaching staff member or does not exist.");
                 }
                 mockSections[sectionIndex].adviserId = adviserId ?? undefined; // Store null as undefined for optional field
                 mockSections[sectionIndex].adviserName = adviser ? `${adviser.firstName} ${adviser.lastName}` : undefined;
                 logActivity("Updated Section Adviser", `For section ${mockSections[sectionIndex].sectionCode} to ${adviser ? adviser.firstName + ' ' + adviser.lastName : 'None'}`, "Admin");
                 return { ...mockSections[sectionIndex] } as ResponseData; // Return updated section
             }
             throw new Error("Section not found.");
         }
         if (phpPath === 'sections/assignments/create.php') { // Assign teacher to subject in a section
             const { sectionId, subjectId, teacherId } = data as { sectionId: string; subjectId: string; teacherId: number };
             
             const subject = mockCourses.find(s => s.id === subjectId);
             const facultyMember = mockFaculty.find(t => t.id === teacherId && t.department === 'Teaching'); // Ensure teacher is from Teaching dept
             const section = mockSections.find(sec => sec.id === sectionId);

             if (!section) throw new Error(`Section ${sectionId} not found.`);
             if (!subject) throw new Error(`Course(subject) ${subjectId} not found.`);
             if (teacherId !== 0 && !facultyMember) throw new Error(`Teacher with ID ${teacherId} not found or is not teaching staff.`); // Allow unassigning with teacherId 0

             // Check if teacher is qualified for this course (using mockTeacherTeachableCourses)
             const teachableEntry = mockTeacherTeachableCourses.find(ttc => ttc.teacherId === teacherId);
             if (teacherId !== 0 && teachableEntry && teachableEntry.courseIds.length > 0 && !teachableEntry.courseIds.includes(subjectId)) {
                throw new Error(`Teacher ${facultyMember?.firstName} ${facultyMember?.lastName} is not assigned to teach ${subject.name}. Manage teachable courses first.`);
             }

             const assignmentId = `${sectionId}-${subjectId}`; // Unique ID for this section-subject pair
              const existingAssignmentIndex = mockSectionAssignments.findIndex(a => a.id === assignmentId);

              if (existingAssignmentIndex > -1) {
                   // Update existing assignment (e.g., change teacher)
                   mockSectionAssignments[existingAssignmentIndex].teacherId = teacherId === 0 ? undefined : teacherId; // Handle unassigning
                   mockSectionAssignments[existingAssignmentIndex].teacherName = teacherId === 0 ? "To Be Assigned" : (facultyMember ? `${facultyMember.firstName} ${facultyMember.lastName}` : undefined);
                   logActivity("Updated Teacher for Course-Section", `${subject?.name} in section ${sectionId} to ${teacherId === 0 ? 'To Be Assigned' : (facultyMember?.firstName + ' ' + facultyMember?.lastName)}`, "Admin");
                   updateMockStudentGrades();
                   return { ...mockSectionAssignments[existingAssignmentIndex] } as ResponseData;
              } else if (teacherId !== 0) { // Only create new if a teacher is actually assigned
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
                 updateMockStudentGrades(); // Student grades context might need update
                 return newAssignment as ResponseData;
              } else { // Trying to create a new assignment with no teacher (teacherId === 0)
                  // This case might not be typical for "create" but handled defensively
                  throw new Error("Cannot create a new assignment without a teacher. To unassign, update an existing assignment.");
              }
         }
         if (phpPath === 'assignments/grades/update.php') { // Endpoint for submitting/updating grades
              const gradeData = data as StudentSubjectAssignmentWithGrades; // Full payload expected
              // Find the specific student-subject assignment record to update
              const index = mockStudentSubjectAssignmentsWithGrades.findIndex(a => a.assignmentId === gradeData.assignmentId && a.studentId === gradeData.studentId);
              
              if (index > -1) {
                  // Update existing grades
                   mockStudentSubjectAssignmentsWithGrades[index] = {
                       ...mockStudentSubjectAssignmentsWithGrades[index], // Preserve other details
                       prelimGrade: gradeData.prelimGrade,
                       prelimRemarks: gradeData.prelimRemarks,
                       midtermGrade: gradeData.midtermGrade,
                       midtermRemarks: gradeData.midtermRemarks,
                       finalGrade: gradeData.finalGrade,
                       finalRemarks: gradeData.finalRemarks,
                       // Status will be recalculated based on new grades
                   };
                   const updated = mockStudentSubjectAssignmentsWithGrades[index];
                    // Recalculate status
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (updated.prelimGrade !== null || updated.midtermGrade !== null || updated.finalGrade !== null) {
                        status = 'Incomplete';
                    }
                    if (updated.finalGrade !== null) { // Assuming final grade means completion
                        status = 'Complete';
                    }
                    updated.status = status;
                    logActivity("Updated Grades", `For ${updated.studentName} in ${updated.subjectName}`, "Teacher"); // Or "Admin" if admin can submit
                   return updated as ResponseData;
               } else {
                    // If no existing record, create one (though 'update' endpoint might imply existence)
                    // This logic might be better suited for a 'create grade' endpoint if one existed
                    let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
                    if (gradeData.prelimGrade !== null || gradeData.midtermGrade !== null || gradeData.finalGrade !== null) {
                        status = 'Incomplete';
                    }
                    if (gradeData.finalGrade !== null) {
                        status = 'Complete';
                    }
                    const student = mockStudents.find(s => s.id === gradeData.studentId);
                    const subject = mockCourses.find(s => s.id === gradeData.subjectId);
                    // Find the base section-subject assignment to get section and year for context
                    const sectionAssignment = mockSectionAssignments.find(sa => sa.id === gradeData.assignmentId.substring(0, gradeData.assignmentId.lastIndexOf('-'))); // Remove studentId part

                    const newEntry: StudentSubjectAssignmentWithGrades = {
                        ...gradeData, // Use all provided data
                        // Populate names and contextual info if missing from payload
                        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
                        subjectName: subject ? subject.name : 'Unknown Subject',
                        section: sectionAssignment?.sectionId || 'N/A', // Derive from base assignment
                         year: student?.year || 'N/A', // Student's year
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
            if (logEntryIndex === -1) {
                console.error(`Undo failed: Log entry with ID ${logId} not found.`);
                throw new Error("Action cannot be undone: Log entry not found.");
            }
            const logEntry = mockActivityLog[logEntryIndex];
            if (!logEntry.canUndo) {
                 console.error(`Undo failed: Action "${logEntry.action}" for log ID ${logId} is not undoable.`);
                throw new Error("This action cannot be undone.");
            }

            let undoSuccess = false;
            let specificUndoMessage: string | undefined;

            if (logEntry.action === "Added Student" && logEntry.targetType === "student" && logEntry.originalData && logEntry.targetId) {
                executeUndoAddStudent(logEntry.targetId as number, logEntry.originalData as Student);
                undoSuccess = true;
            } else if (logEntry.action === "Deleted Student" && logEntry.targetType === "student" && logEntry.originalData) {
                executeUndoDeleteStudent(logEntry.originalData as Student);
                undoSuccess = true;
            } else if (logEntry.action === "Added Faculty" && logEntry.targetType === "faculty" && logEntry.originalData && logEntry.targetId) {
                executeUndoAddFaculty(logEntry.targetId as number, logEntry.originalData as Faculty);
                undoSuccess = true;
            } else if (logEntry.action === "Deleted Faculty" && logEntry.targetType === "faculty" && logEntry.originalData) {
                executeUndoDeleteFaculty(logEntry.originalData as Faculty);
                undoSuccess = true;
            } else if (logEntry.action === "Removed Admin Role" && logEntry.targetType === "admin" && logEntry.originalData) {
                undoSuccess = executeUndoRemoveAdminRole(logEntry.originalData as AdminUser & { originalDepartment?: DepartmentType });
                 if (!undoSuccess) {
                    specificUndoMessage = "Could not fully undo admin role removal: Corresponding faculty record might not exist or was not a faculty-derived admin.";
                }
            } else {
                 console.error(`Undo failed: Undo logic for action type "${logEntry.action}" is not implemented or data missing for log ID ${logId}.`);
                 throw new Error(`Undo for action type "${logEntry.action}" is not implemented in mock or data missing.`);
            }

            if (undoSuccess) {
                recalculateDashboardStats(); // Recalculate stats after successful undo
                mockActivityLog.splice(logEntryIndex, 1); // Remove the undone log entry
                return { success: true, message: "Action undone." } as ResponseData;
            } else {
                throw new Error(specificUndoMessage || "Undo operation failed or was not applicable.");
            }
        }
        if (phpPath === 'sections/create.php') { // Path for creating a new section
            const newSectionData = data as Partial<Section>; // programId, yearLevel, sectionCode (optional)
            const { programId, yearLevel, sectionCode: providedSectionCode } = newSectionData;
            if (!programId || !yearLevel) {
                throw new Error("Program ID and Year Level are required to create a section.");
            }
            // Auto-generate section code if not provided, based on program, year, and existing sections
            const sectionCode = providedSectionCode || generateSectionCode(
                programId,
                yearLevel,
                mockSections.filter(s => s.programId === programId && s.yearLevel === yearLevel).length // Count existing for this combo
            );

            if (mockSections.some(s => s.id === sectionCode)) {
                 throw new Error(`Section with code ${sectionCode} already exists.`);
            }
            const newSection: Section = {
                id: sectionCode,
                sectionCode: sectionCode,
                programId: programId,
                yearLevel: yearLevel,
                programName: mockApiPrograms.find(p => p.id === programId)?.name, // Add program name for display
                adviserId: newSectionData.adviserId, // Optional
                adviserName: newSectionData.adviserId ? mockFaculty.find(f => f.id === newSectionData.adviserId)?.firstName + " " + mockFaculty.find(f => f.id === newSectionData.adviserId)?.lastName : undefined,
                studentCount: 0, // New sections start with 0 students
            };
            mockSections.push(newSection);
            // No logActivity here for sections, handled by student addition implicitly creating/updating sections
            return newSection as ResponseData;
        }
        if (phpPath === 'teacher/teachable-courses/update.php') { // Manage which courses a teacher can teach
            const { teacherId, courseIds } = data as { teacherId: number, courseIds: string[] };
            const index = mockTeacherTeachableCourses.findIndex(ttc => ttc.teacherId === teacherId);
            if (index > -1) {
                mockTeacherTeachableCourses[index].courseIds = courseIds;
            } else {
                mockTeacherTeachableCourses.push({ teacherId, courseIds });
            }
            const teacher = mockFaculty.find(f => f.id === teacherId);
            logActivity("Updated Teachable Courses", `For ${teacher?.firstName} ${teacher?.lastName}`, "Admin");
            return { success: true, message: "Teachable courses updated." } as ResponseData;
        }
        console.warn(`Mock API unhandled POST path: ${phpPath}`);
         throw new Error(`Mock POST endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
         console.error(`Error in mock postData for ${phpPath}:`, error);
         throw error; // Re-throw to be caught by the caller
    }
};

const mockPutData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
     const phpPath = finalMockPath(path); // Use finalMockPath
    console.log(`MOCK putData to: ${phpPath}`, data);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    const idStr = phpPath.split('/').pop() || ''; // Get ID from path if present

    try {
         if (phpPath.startsWith('students/update.php/')) {
            const id = parseInt(idStr, 10); // Ensure ID is number if path based
            const studentIndex = mockStudents.findIndex(s => s.id === id);
            if (studentIndex > -1) {
                const oldStudentData = { ...mockStudents[studentIndex] }; // For checking if section changed
                const updatedStudentData = data as unknown as Partial<Student>;
                // Merge, ensuring type safety for enrollmentType and year
                mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...updatedStudentData };
                // If section, program, or year changed, update sections and assignments
                if (oldStudentData.section !== mockStudents[studentIndex].section || oldStudentData.program !== mockStudents[studentIndex].program || oldStudentData.year !== mockStudents[studentIndex].year) {
                    updateMockSections();
                    updateMockSectionAssignments();
                    updateMockStudentGrades();
                }
                logActivity("Updated Student", `${mockStudents[studentIndex].firstName} ${mockStudents[studentIndex].lastName}`, "Admin", id, "student");
                recalculateDashboardStats();
                return { ...mockStudents[studentIndex] } as ResponseData;
            }
            throw new Error("Student not found for mock update.");
        }
         if (phpPath.startsWith('teachers/update.php/')) { // Update faculty
            const id = parseInt(idStr, 10);
            const facultyIndex = mockFaculty.findIndex(t => t.id === id);
             if (facultyIndex > -1) {
                const oldDepartment = mockFaculty[facultyIndex].department;
                mockFaculty[facultyIndex] = { ...mockFaculty[facultyIndex], ...(data as unknown as Partial<Faculty>) };
                const updatedFaculty = mockFaculty[facultyIndex];

                // Sync with mockApiAdmins if department changed to/from Administrative
                const adminIndex = mockApiAdmins.findIndex(a => a.id === updatedFaculty.id && !a.isSuperAdmin);

                if (updatedFaculty.department === 'Administrative') {
                    const adminEntry: AdminUser = {
                        id: updatedFaculty.id,
                        username: updatedFaculty.username, // Use faculty username
                        firstName: updatedFaculty.firstName,
                        lastName: updatedFaculty.lastName,
                        email: updatedFaculty.email,
                        role: 'Sub Admin',
                        isSuperAdmin: false
                    };
                    if (adminIndex > -1) {
                        mockApiAdmins[adminIndex] = adminEntry;
                    } else if (!mockApiAdmins.some(a => a.id === updatedFaculty.id)) { // Add if not already admin
                        mockApiAdmins.push(adminEntry);
                    }
                } else if (oldDepartment === 'Administrative' && updatedFaculty.department !== 'Administrative') {
                    // If changed from Administrative to Teaching, remove from sub-admins
                    if (adminIndex > -1) {
                        mockApiAdmins.splice(adminIndex, 1);
                    }
                }
                logActivity("Updated Faculty", `${updatedFaculty.firstName} ${updatedFaculty.lastName}`, "Admin", id, "faculty");
                recalculateDashboardStats();
                return { ...updatedFaculty } as ResponseData;
            }
            throw new Error("Faculty not found for mock update.");
        }
         if (phpPath === 'student/profile/update.php') { // Update student's own profile
            const profileData = data as Student; // Assuming payload includes student's ID
            const studentId = profileData.id; // Get ID from payload
            const index = mockStudents.findIndex(s => s.id === studentId);
            if (index > -1) {
                // Only allow students to update certain fields
                mockStudents[index] = {
                    ...mockStudents[index], // Keep non-editable fields
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    middleName: profileData.middleName,
                    suffix: profileData.suffix,
                    gender: profileData.gender,
                    birthday: profileData.birthday,
                    email: profileData.email,
                    phone: profileData.phone,
                    emergencyContactName: profileData.emergencyContactName,
                    emergencyContactRelationship: profileData.emergencyContactRelationship,
                    emergencyContactPhone: profileData.emergencyContactPhone,
                    emergencyContactAddress: profileData.emergencyContactAddress,
                 };
                logActivity("Updated Profile", `Student ${mockStudents[index].firstName} ${mockStudents[index].lastName} updated their profile.`, "Student", mockStudents[index].id, "student");
                return { ...mockStudents[index] } as ResponseData;
            }
            throw new Error("Mock student profile not found for update.");
        }
         if (phpPath === 'teacher/profile/update.php') { // Update teacher's own profile
             const profileData = data as Faculty; // Assuming payload includes teacher's ID
             const teacherId = profileData.id; // Get ID from payload
             const index = mockFaculty.findIndex(t => t.id === teacherId);
             if (index > -1) {
                 // Only allow teachers to update certain fields
                 mockFaculty[index] = {
                    ...mockFaculty[index], // Keep non-editable fields
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    middleName: profileData.middleName,
                    suffix: profileData.suffix,
                    gender: profileData.gender, // Optional update
                    birthday: profileData.birthday,
                    address: profileData.address, // Teacher can update address
                    email: profileData.email,
                    phone: profileData.phone,
                    emergencyContactName: profileData.emergencyContactName,
                    emergencyContactRelationship: profileData.emergencyContactRelationship,
                    emergencyContactPhone: profileData.emergencyContactAddress,
                  };
                 logActivity("Updated Profile", `Faculty ${mockFaculty[index].firstName} ${mockFaculty[index].lastName} updated their profile.`, "Faculty", mockFaculty[index].id, "faculty");
                 return { ...mockFaculty[index] } as ResponseData;
             }
             throw new Error("Mock faculty profile not found for update.");
         }
          if (phpPath.startsWith('programs/update.php/')) { // Update program details and its courses
             const programId = idStr; // ID from path
             const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1) {
                 const updatedData = data as unknown as Program; // Payload contains new program data
                 // Update program details
                 mockApiPrograms[programIndex].name = updatedData.name ?? mockApiPrograms[programIndex].name;
                 mockApiPrograms[programIndex].description = updatedData.description ?? mockApiPrograms[programIndex].description;
                
                // Update courses assigned to this program
                if (updatedData.courses) {
                    (Object.keys(updatedData.courses) as YearLevel[]).forEach(year => {
                        if (updatedData.courses[year]) { // If this year level's courses are in the payload
                            mockApiPrograms[programIndex].courses[year] = updatedData.courses[year].map(courseInPayload => {
                                // Update global mockCourses if this course is being added or modified
                                const globalCourseIndex = mockCourses.findIndex(gc => gc.id === courseInPayload.id);
                                if (globalCourseIndex > -1) {
                                    // Update existing global course
                                    mockCourses[globalCourseIndex] = {...mockCourses[globalCourseIndex], ...courseInPayload};
                                    // If it's a Major course, ensure this programId is linked
                                    if (mockCourses[globalCourseIndex].type === 'Major') {
                                        if (!mockCourses[globalCourseIndex].programId) mockCourses[globalCourseIndex].programId = [];
                                        if (!mockCourses[globalCourseIndex].programId!.includes(programId)) {
                                            mockCourses[globalCourseIndex].programId!.push(programId);
                                        }
                                    }
                                } else {
                                    // If it's a new course to the system, add it
                                    mockCourses.push({
                                        ...courseInPayload, 
                                        programId: courseInPayload.type === 'Major' ? [programId] : [] // Link if Major
                                    });
                                }
                                return courseInPayload; // Return the course for this program's year level
                            });
                        }
                    });
                }
                updateMockSectionAssignments(); // Update assignments as curriculum might change
                updateMockStudentGrades();
                 logActivity("Updated Program", mockApiPrograms[programIndex].name, "Admin", programId, "program");
                 return { ...mockApiPrograms[programIndex] } as ResponseData;
             }
             throw new Error("Program not found for mock update.");
          }
          if (phpPath.startsWith('courses/update.php/')) { // Update a global course
              const courseId = idStr; // ID from path
              const courseIndex = mockCourses.findIndex(c => c.id === courseId);
              if (courseIndex > -1) {
                   const updatedCourseData = data as Partial<Course>;
                   // Update global course
                   mockCourses[courseIndex] = {
                       ...mockCourses[courseIndex],
                       ...updatedCourseData,
                       // Ensure programId is an array for Majors, empty for Minors if type changes
                       programId: updatedCourseData.type === 'Major' ? (Array.isArray(updatedCourseData.programId) ? updatedCourseData.programId : (updatedCourseData.programId ? [updatedCourseData.programId as unknown as string] : [])) : [],
                    };
                    // Also update this course in any program it's assigned to
                    mockApiPrograms.forEach(program => {
                         Object.keys(program.courses).forEach(year => {
                             const yr = year as YearLevel;
                             const assignedIndex = program.courses[yr].findIndex(c => c.id === courseId);
                             if (assignedIndex > -1) {
                                 program.courses[yr][assignedIndex] = { ...mockCourses[courseIndex] };
                             }
                         });
                    });
                    updateMockSectionAssignments(); // Update section assignments as course details might change
                    updateMockStudentGrades();
                    logActivity("Updated Course", mockCourses[courseIndex].name, "Admin", courseId, "course");
                   return { ...mockCourses[courseIndex] } as ResponseData;
              }
              throw new Error("Course not found for mock update.");
          }
          if (phpPath.startsWith('sections/update.php/')) { // Update basic section details (e.g., program, year)
            const sectionIdToUpdate = idStr;
            const sectionIndex = mockSections.findIndex(s => s.id === sectionIdToUpdate);
            if (sectionIndex > -1) {
                const updatedSectionData = data as Partial<Section>; // Payload with new programId, yearLevel
                // Update only allowed fields (programId, yearLevel). Adviser is handled separately.
                mockSections[sectionIndex] = {
                    ...mockSections[sectionIndex],
                    programId: updatedSectionData.programId ?? mockSections[sectionIndex].programId,
                    yearLevel: updatedSectionData.yearLevel ?? mockSections[sectionIndex].yearLevel,
                    // programName should update if programId changes
                    programName: mockApiPrograms.find(p => p.id === (updatedSectionData.programId ?? mockSections[sectionIndex].programId))?.name,
                };
                // If program/year changed, section assignments and student grades might need to be re-evaluated
                updateMockSectionAssignments(); // Teacher assignments might need update if section changes program/year
                updateMockStudentGrades();
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
    const phpPath = finalMockPath(path); // Use finalMockPath
    console.log(`MOCK deleteData at: ${phpPath}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    const idPart = phpPath.split('/').pop() || ''; // Get ID from path if present (e.g., students/delete.php/123)

    try {
         if (phpPath.startsWith('students/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const studentIndex = mockStudents.findIndex(s => s.id === id);
            if (studentIndex === -1) throw new Error("Student not found for mock delete.");
            const deletedStudent = { ...mockStudents[studentIndex] }; // Store for logging undo
            mockStudents.splice(studentIndex, 1);
            updateMockSections(); // Update section counts or remove empty sections
            updateMockSectionAssignments(); // Assignments might change if sections are removed
            updateMockStudentGrades();
            logActivity("Deleted Student", `${deletedStudent.firstName} ${deletedStudent.lastName} (${deletedStudent.username})`, "Admin", id, "student", true, deletedStudent);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('teachers/delete.php/')) { // Delete faculty
            const id = parseInt(idPart || '0', 10);
            const facultyIndex = mockFaculty.findIndex(t => t.id === id);
            if (facultyIndex === -1) throw new Error("Faculty not found for mock delete.");
            const deletedFaculty = { ...mockFaculty[facultyIndex] }; // For undo log
            
            mockFaculty.splice(facultyIndex, 1); // Remove from main faculty list
            
            // If faculty was an admin, remove their admin entry
            if (deletedFaculty.department === 'Administrative') {
                 mockApiAdmins = mockApiAdmins.filter(a => a.id !== id || a.isSuperAdmin); // Keep super admin
            }
            // Remove from section adviser roles
            mockSections.forEach(sec => { if(sec.adviserId === id) { sec.adviserId = undefined; sec.adviserName = undefined;} });
            // Unassign from all section-subject assignments
            mockSectionAssignments = mockSectionAssignments.filter(assign => assign.teacherId !== id);
            // Remove from teachable courses list
            mockTeacherTeachableCourses = mockTeacherTeachableCourses.filter(ttc => ttc.teacherId !== id);
            updateMockSectionAssignments(); // Refresh assignments as a teacher is deleted
            updateMockStudentGrades();


            logActivity("Deleted Faculty", `${deletedFaculty.firstName} ${deletedFaculty.lastName} (${deletedFaculty.username})`, "Admin", id, "faculty", true, deletedFaculty);
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('admins/delete.php/')) { // Remove admin role
            const adminIdToRemove = parseInt(idPart || '0', 10);
            if (adminIdToRemove === 0) throw new Error("Cannot remove Super Admin role."); // Prevent deleting super admin

            const adminUser = mockApiAdmins.find(a => a.id === adminIdToRemove);
            if (!adminUser) throw new Error("Admin role not found for mock removal.");

            const originalAdminData = {...adminUser}; // For undo log
            let originalDepartment: DepartmentType | undefined = undefined;

            // If this admin was derived from a faculty member, change their department to 'Teaching'
            const facultyMember = mockFaculty.find(f => f.id === adminIdToRemove);
            if (facultyMember && facultyMember.department === 'Administrative') {
                originalDepartment = facultyMember.department;
                facultyMember.department = 'Teaching'; // Revert to teaching staff
                logActivity("Removed Admin Role", `For ${adminUser.username}. Faculty department changed to Teaching.`, "Admin", adminIdToRemove, "admin", true, {...originalAdminData, originalDepartment});
            } else {
                 // If it was an explicit sub-admin not linked to faculty, just remove their admin role
                 logActivity("Removed Admin Role", `Explicit admin ${adminUser.username} removed.`, "Admin", adminIdToRemove, "admin", true, originalAdminData);
            }
             mockApiAdmins = mockApiAdmins.filter(a => a.id !== adminIdToRemove); // Remove from admin list
            recalculateDashboardStats();
            return;
        }
         if (phpPath.startsWith('announcements/delete.php/')) {
             const id = idPart; // Announcement ID is string
             const annIndex = mockAnnouncements.findIndex(a => a.id === id);
             if (annIndex === -1) throw new Error("Announcement not found for mock delete.");
             const deletedAnnouncement = { ...mockAnnouncements[annIndex] }; // For undo log
             mockAnnouncements.splice(annIndex, 1);
             logActivity("Deleted Announcement", deletedAnnouncement.title, "Admin", id, "announcement");
             recalculateDashboardStats(); // Update stats if announcements are counted
             return;
         }
         if (phpPath.startsWith('assignments/delete.php/')) { // Unassign teacher from section-course
             const id = idPart; // Assignment ID e.g., "CS1A-CS101"
             const assignIndex = mockSectionAssignments.findIndex(a => a.id === id);
             if (assignIndex === -1) throw new Error("Section-Course assignment not found for mock delete.");
             const deletedAssignment = { ...mockSectionAssignments[assignIndex] }; // For logging
             mockSectionAssignments.splice(assignIndex, 1);
             // Student grades might need re-evaluation if they were based on this assignment, but usually grades stay.
             updateMockStudentGrades(); // Refresh student grades as an assignment is removed
             logActivity("Deleted Section-Course Assignment", `Course ${deletedAssignment.subjectName} from section ${deletedAssignment.sectionId}`, "Admin");
             return;
         }
         if (phpPath.startsWith('programs/delete.php/')) { // Delete a whole program
             const programId = idPart;
             const progIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (progIndex === -1) throw new Error("Program not found for mock delete.");
             const deletedProgram = { ...mockApiPrograms[progIndex] };
             
             mockApiPrograms.splice(progIndex, 1); // Remove program

             // Remove this programId from Major courses
             mockCourses = mockCourses.map(c => {
                 if (c.type === 'Major' && c.programId?.includes(programId)) {
                     const updatedProgramIds = c.programId.filter(pid => pid !== programId);
                     return { ...c, programId: updatedProgramIds };
                 }
                 return c;
             });
            
             // Handle sections, assignments, and students related to the deleted program
             const sectionsToDelete = mockSections.filter(s => s.programId === programId).map(s => s.id);
             mockSections = mockSections.filter(s => s.programId !== programId);
             mockSectionAssignments = mockSectionAssignments.filter(a => !sectionsToDelete.includes(a.sectionId));
             // Optionally, reassign students or mark them as 'program unassigned'
             mockStudents.forEach(student => {
                if (sectionsToDelete.includes(student.section)) {
                    // Decide how to handle students: unassign section, or change program, etc.
                    student.section = "UNASSIGNED"; // Example: Mark section as unassigned
                    // student.program = "UNASSIGNED_PROGRAM"; // Or handle program change
                }
             });
             updateMockSections(); // Update sections list (empty sections might disappear)
             updateMockSectionAssignments();
             updateMockStudentGrades();

             logActivity("Deleted Program", deletedProgram.name, "Admin", programId, "program");
             return;
          }
          if (phpPath.startsWith('courses/delete.php/')) { // Delete a global course
             const courseId = idPart;
             const courseIndex = mockCourses.findIndex(c => c.id === courseId);
             if (courseIndex === -1) throw new Error("Course not found for mock delete.");
             const deletedCourse = { ...mockCourses[courseIndex] };
             
             mockCourses.splice(courseIndex, 1); // Remove from global courses

             // Remove from all program curricula
             mockApiPrograms.forEach(program => {
                 Object.keys(program.courses).forEach(year => {
                      const yr = year as YearLevel;
                      program.courses[yr] = program.courses[yr].filter(c => c.id !== courseId);
                 });
             });
             // Remove from section-subject assignments
             mockSectionAssignments = mockSectionAssignments.filter(a => a.subjectId !== courseId);
             // Remove from teacher teachable courses
             mockTeacherTeachableCourses.forEach(ttc => {
                ttc.courseIds = ttc.courseIds.filter(cid => cid !== courseId);
             });
             updateMockSectionAssignments(); // Refresh assignments as course is deleted
             updateMockStudentGrades();

             logActivity("Deleted Course", deletedCourse.name, "Admin", courseId, "course");
             return;
          }
          // Mock for removing a specific course from a specific program's year level
          if (phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/)) { // e.g., programs/CS/courses/remove/1st%20Year/CS101
             const [, programId, yearLevelEncoded, courseId] = phpPath.match(/^programs\/([^/]+)\/courses\/remove\/([^/]+)\/([^/]+)$/) || [];
             const yearLevel = decodeURIComponent(yearLevelEncoded) as YearLevel; // Decode URL encoded year level

             const programIndex = mockApiPrograms.findIndex(p => p.id === programId);
             if (programIndex > -1 && mockApiPrograms[programIndex].courses[yearLevel]) {
                 const courseIndexInProgram = mockApiPrograms[programIndex].courses[yearLevel].findIndex(c => c.id === courseId);
                 if (courseIndexInProgram === -1) throw new Error("Course assignment not found in program/year for mock removal.");
                 
                 const removedCourse = mockApiPrograms[programIndex].courses[yearLevel][courseIndexInProgram];
                 mockApiPrograms[programIndex].courses[yearLevel].splice(courseIndexInProgram, 1);
                 
                 // If it was a Major course and this was its only program assignment, consider changing its type or handling orphans
                 // For simplicity, we just remove it from this program's curriculum.
                
                updateMockSectionAssignments(); // Update section assignments as curriculum changed
                updateMockStudentGrades();

                 logActivity("Removed Course from Program", `${removedCourse.name} from ${mockApiPrograms[programIndex].name} (${yearLevel})`, "Admin");
                 return;
             }
             throw new Error("Program or year level not found for removing course assignment.");
          }
           if (phpPath.startsWith('sections/delete.php/')) { // Delete a section
            const sectionIdToDelete = idPart;
            const sectionIndex = mockSections.findIndex(s => s.id === sectionIdToDelete);
            if (sectionIndex === -1) throw new Error("Section not found for mock delete.");

            const deletedSection = { ...mockSections[sectionIndex] };
            const studentsInSec = mockStudents.filter(s => s.section === sectionIdToDelete).length;
            if (studentsInSec > 0) {
                // Instead of error, disassociate students
                console.warn(`Attempting to delete section ${deletedSection.sectionCode} which has ${studentsInSec} student(s). For mock, students will be disassociated.`);
                mockStudents = mockStudents.map(s => {
                    if (s.section === sectionIdToDelete) {
                        return { ...s, section: 'UNASSIGNED' }; // Or null, depends on how you handle it
                    }
                    return s;
                });
            }
            mockSections.splice(sectionIndex, 1); // Remove section from list
            // Also remove related section-subject assignments
            mockSectionAssignments = mockSectionAssignments.filter(sa => sa.sectionId !== sectionIdToDelete);
            updateMockSections(); // Recalculate counts and ensure consistency
            updateMockSectionAssignments();
            updateMockStudentGrades();
            logActivity("Deleted Section", `Section ${deletedSection.sectionCode}`, "Admin", sectionIdToDelete, "section");
            return;
        }
        console.warn(`Mock API unhandled DELETE path: ${phpPath}`);
        throw new Error(`Mock DELETE endpoint for ${phpPath} not implemented.`);
    } catch (error: any) {
         console.error(`Error in mock deleteData for ${phpPath}:`, error);
         throw error; // Re-throw to be caught by the caller
    }
};


// --- Generic Fetch Functions ---
export const fetchData = async <T>(path: string): Promise<T> => {
    if (USE_MOCK_API) return mockFetchData(path);

    const url = getApiUrl(path);
    let response: Response;
    try {
        response = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json'} });
    } catch (networkError: any) {
        return handleFetchError(networkError, path, 'GET', true);
    }

    // Read the body as text first to handle non-JSON error responses better
    let responseBodyText = "";
    try {
        responseBodyText = await response.text(); // Read body once
    } catch (readError) {
        console.warn(`Failed to read response body as text for GET ${url}:`, readError);
        // If reading fails and response was not ok, still treat as fetch error
         if (!response.ok) { 
            handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'GET');
        }
        // If response was ok but body couldn't be read, this might be an issue or intended (e.g. 204)
    }

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;

        if (responseBodyText) { // If body was read successfully
            try {
                 errorData = JSON.parse(responseBodyText); // Try parsing the text
                 errorMessage = errorData?.message || responseBodyText || errorMessage; // Use parsed message, or full text, or default
            } catch (jsonParseError) {
                 // If parsing fails, use the raw text as the message
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage }; // Update errorData with the text
            }
        }
        console.error("API Error Response Text (fetchData):", responseBodyText || "(empty body)");
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'GET');
    }

    // Handle 204 No Content or empty body successfully
    if (response.status === 204 || !responseBodyText) { 
        return {} as T; // Or null, depending on expected behavior for no content
    }

    // If response was OK and body was read, try to parse as JSON
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
    let response: Response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json', // Important for PHP to know we expect JSON back
            },
            body: JSON.stringify(data),
        });
    } catch (networkError: any) {
         // Handle network errors (server down, DNS issues, etc.)
         return handleFetchError(networkError, path, 'POST', true);
    }

    let responseBodyText = "";
    try {
        responseBodyText = await response.text();
    } catch (readError) {
        console.warn(`Failed to read response body as text for POST ${url}:`, readError);
        if (!response.ok) { // If response was not ok and body couldn't be read
             handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'POST');
        }
        // If response was ok but body read failed, this is unusual. Proceed cautiously or error.
    }

    if (!response.ok) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
        if (responseBodyText) {
            try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
            } catch (jsonParseError) {
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
            }
        }
        console.error("API Error Response Text (postData):", responseBodyText || "(empty body)");
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'POST');
    }

    // Handle 204 No Content or successful (e.g., 201 Created) with empty body
    if (response.status === 204 || (response.status === 201 && !responseBodyText)) { 
        return { success: true, message: `Operation successful (Status ${response.status})` } as unknown as ResponseData; // Adjust mock success response if needed
    }

    // If response was OK and body was read, try to parse
    try {
        return JSON.parse(responseBodyText) as ResponseData;
    } catch (jsonError: any) {
        console.error("Failed to parse JSON response on successful POST:", jsonError, "Body was:", responseBodyText);
        // Return a success-like object but indicate parsing issue if appropriate
        return { success: true, message: "Operation successful, but response body could not be parsed.", rawResponse: responseBodyText } as unknown as ResponseData;
    }
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
         if (responseBodyText) { // If body was read
             try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
             } catch (jsonParseError) {
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
             }
         }
         console.error("API Error Response Text (putData):", responseBodyText || "(empty body)");
         handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'PUT');
    }
    // Handle 204 No Content or empty body on success
    if (response.status === 204 || !responseBodyText) { 
        return { success: true, message: `Update successful (Status ${response.status})` } as unknown as ResponseData;
    }
     // If response was OK and body was read, try to parse
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
        response = await fetch(url, { method: 'DELETE', headers: { 'Accept': 'application/json'} });
    } catch (networkError: any) {
         // Network errors
         return handleFetchError(networkError, path, 'DELETE', true);
    }

    let responseBodyText = "";
    try {
        responseBodyText = await response.text();
    } catch (readError) {
        console.warn(`Failed to read response body as text for DELETE ${url}:`, readError);
        // If not OK and not 204 (No Content), treat as error
         if (!response.ok && response.status !== 204) {
            handleFetchError({ name: 'ReadError', message: `HTTP error! status: ${response.status}. Failed to read response body.` }, path, 'DELETE');
        }
    }

    // Check if the response was not successful (e.g., 4xx, 5xx errors)
    // 204 No Content is a successful deletion, so exclude it from error handling here
    if (!response.ok && response.status !== 204) {
        let errorData: any = { message: `HTTP error! status: ${response.status}` };
        let errorMessage = errorData.message;
         if (responseBodyText) { // If body was read
             try {
                 errorData = JSON.parse(responseBodyText);
                 errorMessage = errorData?.message || responseBodyText || errorMessage;
             } catch (jsonParseError) {
                 errorMessage = responseBodyText || errorMessage;
                 errorData = { message: errorMessage };
             }
         }
        console.error("API Error Response Text (deleteData):", responseBodyText || "(empty body)");
        handleFetchError({ ...errorData, name: 'HTTPError', message: errorMessage }, path, 'DELETE');
    }
    // If deletion was successful (200 OK with body, or 204 No Content),
    // and there's a body, try to parse it (though typically delete might not return a body)
    if (responseBodyText && response.status !== 204) { // Don't try to parse if 204
        try {
            JSON.parse(responseBodyText); // Or handle the parsed data if needed
        } catch (e) {
            // Log if there's a body but it's not JSON (and not a 204)
            console.log("DELETE response was not JSON or empty (and not 204):", responseBodyText);
        }
    }
    // If we reach here, it's either 204 No Content or 200 OK (possibly with a body that was handled or ignored)
};

// Helper function for date formatting if needed elsewhere
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}


// Export mock data for potential direct use in testing or specific scenarios
// if USE_MOCK_API is true. This helps avoid "not defined" errors if other
// files try to import them directly when USE_MOCK_API is the main control.
export { USE_MOCK_API as defaultUSE_MOCK_API };
export { mockApiPrograms, mockCourses, mockStudents, mockFaculty, mockSections, mockAnnouncements, mockSectionAssignments, mockApiAdmins as mockAdmins }; // Export mockAdmins from mockApiAdmins
export { mockActivityLog, mockDashboardStats, mockStudentSubjectAssignmentsWithGrades, mockTeacherTeachableCourses };
    
    