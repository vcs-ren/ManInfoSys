
'use client';

import type { Student, Teacher, Section, Subject, Announcement, ScheduleEntry, StudentSubjectAssignmentWithGrades, StudentTermGrade, SectionSubjectAssignment } from '@/types';
import { generateStudentId, generateTeacherId, generateSectionCode } from '@/lib/utils'; // Assuming these utils exist and are appropriate

// Mock data (can be expanded)
let mockStudents: Student[] = [
  { id: 1, studentId: "s1001", firstName: "Alice", lastName: "Smith", course: "Computer Science", status: "Continuing", year: "2nd Year", section: "CS-2A", email: "alice@example.com", phone: "123-456-7890", emergencyContactName: "John Smith", emergencyContactRelationship: "Father", emergencyContactPhone: "111-222-3333", emergencyContactAddress: "123 Main St" },
  { id: 2, studentId: "s1002", firstName: "Bob", lastName: "Johnson", course: "Information Technology", status: "New", year: "1st Year", section: "IT-1B", email: "bob@example.com", phone: "987-654-3210" },
  { id: 3, studentId: "s1003", firstName: "Charlie", lastName: "Brown", course: "Business Administration", status: "Returnee", year: "3rd Year", section: "BA-3A", email: "charlie@example.com" },
];

let mockTeachers: Teacher[] = [
  { id: 1, teacherId: "t1001", firstName: "David", lastName: "Lee", department: "Computer Science", email: "david.lee@example.com", phone: "555-1234" },
  { id: 2, teacherId: "t1002", firstName: "Eve", lastName: "Davis", department: "Information Technology", email: "eve.davis@example.com" },
  { id: 3, teacherId: "t1003", firstName: "Frank", lastName: "White", department: "Business Administration", email: "frank.white@example.com" },
];

let mockSections: Section[] = [
  { id: "CS-1A", sectionCode: "CS-1A", course: "Computer Science", yearLevel: "1st Year", adviserId: 1, adviserName: "David Lee", studentCount: 1 },
  { id: "IT-2B", sectionCode: "IT-2B", course: "Information Technology", yearLevel: "2nd Year", studentCount: 1 },
  { id: "BA-3A", sectionCode: "BA-3A", course: "Business Administration", yearLevel: "3rd Year", adviserId: 3, adviserName: "Frank White", studentCount: 1 },
];

let mockSubjects: Subject[] = [
  { id: "CS101", name: "Introduction to Programming", description: "Basics of programming" },
  { id: "IT202", name: "Networking Fundamentals", description: "Understanding computer networks" },
  { id: "BA303", name: "Marketing Principles", description: "Core concepts of marketing" },
  { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills" },
];

let mockSectionAssignments: SectionSubjectAssignment[] = [
    { id: "CS-1A-CS101", sectionId: "CS-1A", subjectId: "CS101", subjectName: "Introduction to Programming", teacherId: 1, teacherName: "David Lee" },
    { id: "IT-2B-IT202", sectionId: "IT-2B", subjectId: "IT202", subjectName: "Networking Fundamentals", teacherId: 2, teacherName: "Eve Davis" },
];

let mockAnnouncements: Announcement[] = [
  { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year. Please check your portal for updates.", date: new Date(2024, 7, 15), target: { course: "all" }, author: "Admin" },
  { id: "ann2", title: "CS Department Meeting", content: "All Computer Science faculty are required to attend.", date: new Date(2024, 7, 20), target: { course: "Computer Science" }, author: "David Lee" },
];

let mockStudentSubjectAssignmentsWithGrades: StudentSubjectAssignmentWithGrades[] = [
    { assignmentId: "1-CS101", studentId: 1, studentName: "Alice Smith", subjectId: "CS101", subjectName: "Introduction to Programming", section: "CS-2A", year: "2nd Year", prelimGrade: 85, prelimRemarks: "Good start", midtermGrade: 90, midtermRemarks: "Excellent", finalGrade: 88, finalRemarks: "Very Good", status: "Complete" },
    { assignmentId: "1-GEN001", studentId: 1, studentName: "Alice Smith", subjectId: "GEN001", subjectName: "Purposive Communication", section: "CS-2A", year: "2nd Year", prelimGrade: 78, midtermGrade: null, finalGrade: null, status: "Incomplete" },
    { assignmentId: "2-IT202", studentId: 2, studentName: "Bob Johnson", subjectId: "IT202", subjectName: "Networking Fundamentals", section: "IT-1B", year: "1st Year", prelimGrade: null, midtermGrade: null, finalGrade: null, status: "Not Submitted" },
];

const mockDashboardStats = {
    totalStudents: mockStudents.length,
    totalTeachers: mockTeachers.length,
    upcomingEvents: 2,
};

const mockStudentSchedule: ScheduleEntry[] = [
    { id: "std-sched1", title: "CS101 Lecture", start: new Date(new Date().setDate(new Date().getDate() + 1)), end: new Date(new Date().setDate(new Date().getDate() + 1)), type: 'class', location: 'Room 301', teacher: 'David Lee' },
    { id: "std-sched2", title: "GEN001 Workshop", start: new Date(new Date().setDate(new Date().getDate() + 2)), end: new Date(new Date().setDate(new Date().getDate() + 2)), type: 'class', location: 'Auditorium', teacher: 'System' },
];
const mockTeacherSchedule: ScheduleEntry[] = [
    { id: "tch-sched1", title: "CS101 Lecture - CS-1A", start: new Date(new Date().setDate(new Date().getDate() + 1)), end: new Date(new Date().setDate(new Date().getDate() + 1)), type: 'class', location: 'Room 301', section: 'CS-1A' },
    { id: "tch-sched2", title: "Consultation Hours", start: new Date(new Date().setDate(new Date().getDate() + 1)), end: new Date(new Date().setDate(new Date().getDate() + 1)), type: 'event', location: 'Faculty Room' },
];


// Placeholder API_BASE_URL as it's not used with mock data
const API_BASE_URL = 'mock-api';

const getApiUrl = (path: string): string => `${API_BASE_URL}${path}`;

// Simplified error handler for mock API
const handleFetchError = (error: any, path: string, method: string): never => {
    console.error(`Mock API error during ${method} request to ${path}:`, error);
    throw new Error(error.message || `Mock API failed for ${method} ${path}`);
};

export const fetchData = async <T>(path: string): Promise<T> => {
    console.log(`Mock fetchData from: ${path}`);
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

    try {
        if (path.startsWith('/api/students/read.php')) {
            return { records: [...mockStudents] } as T;
        }
        if (path.startsWith('/api/teachers/read.php')) {
            return { records: [...mockTeachers] } as T;
        }
        if (path.startsWith('/api/sections/read.php')) {
            return [...mockSections] as T;
        }
        if (path.startsWith('/api/subjects/read.php')) {
            return [...mockSubjects] as T;
        }
        if (path.startsWith('/api/announcements/read.php')) {
            return [...mockAnnouncements].sort((a,b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (path.startsWith('/api/admin/dashboard-stats.php')) {
            return { ...mockDashboardStats } as T;
        }
        if (path.startsWith('/api/sections/') && path.endsWith('/assignments/read.php')) {
            const sectionId = path.split('/')[3];
            return mockSectionAssignments.filter(a => a.sectionId === sectionId) as T;
        }
        if (path.startsWith('/api/teacher/assignments/grades/read.php')) {
            // Simulate fetching grades for teacher t1001 (David Lee)
            const teacherAssignments = mockSectionAssignments.filter(sa => sa.teacherId === 1);
            const studentGrades = [];
            for (const ta of teacherAssignments) {
                const studentsInSection = mockStudents.filter(s => s.section === ta.sectionId);
                for (const student of studentsInSection) {
                    const existingGrade = mockStudentSubjectAssignmentsWithGrades.find(g => g.studentId === student.id && g.subjectId === ta.subjectId);
                    if (existingGrade) {
                        studentGrades.push(existingGrade);
                    } else {
                         studentGrades.push({
                            assignmentId: `${student.id}-${ta.subjectId}`,
                            studentId: student.id,
                            studentName: `${student.firstName} ${student.lastName}`,
                            subjectId: ta.subjectId,
                            subjectName: ta.subjectName || mockSubjects.find(s => s.id === ta.subjectId)?.name || 'Unknown Subject',
                            section: student.section,
                            year: student.year || 'N/A',
                            prelimGrade: null, midtermGrade: null, finalGrade: null,
                            status: "Not Submitted"
                        });
                    }
                }
            }
            return studentGrades as T;
        }
        if (path.startsWith('/api/student/grades/read.php')) {
            // Simulate student s1001 grades
            return mockStudentSubjectAssignmentsWithGrades.filter(g => g.studentId === 1)
                .map(g => ({
                    id: g.subjectId,
                    subjectName: g.subjectName,
                    prelimGrade: g.prelimGrade,
                    midtermGrade: g.midtermGrade,
                    finalGrade: g.finalGrade,
                    finalRemarks: g.finalRemarks,
                    status: g.status,
                })) as T;
        }
        if (path.startsWith('/api/student/profile/read.php')) {
            return { ...mockStudents[0] } as T; // Alice Smith
        }
        if (path.startsWith('/api/teacher/profile/read.php')) {
            return { ...mockTeachers[0] } as T; // David Lee
        }
        if (path.startsWith('/api/student/announcements/read.php')) {
             // Filter announcements for student Alice Smith (CS, 2nd Year, CS-2A)
            return mockAnnouncements.filter(a => {
                const target = a.target;
                const courseMatch = !target.course || target.course === "all" || target.course === "Computer Science";
                const yearMatch = !target.yearLevel || target.yearLevel === "all" || target.yearLevel === "2nd Year";
                const sectionMatch = !target.section || target.section === "all" || target.section === "CS-2A";
                return courseMatch && yearMatch && sectionMatch;
            }).sort((a,b) => b.date.getTime() - a.date.getTime()) as T;
        }
         if (path.startsWith('/api/teacher/announcements/read.php')) {
             // Filter announcements for teacher David Lee
            return mockAnnouncements.filter(a => a.author === "Admin" || (a.author === "David Lee")).sort((a,b) => b.date.getTime() - a.date.getTime()) as T;
        }
        if (path.startsWith('/api/student/schedule/read.php')) {
            return [...mockStudentSchedule] as T;
        }
        if (path.startsWith('/api/teacher/schedule/read.php')) {
            return [...mockTeacherSchedule] as T;
        }
        if (path.startsWith('/api/teacher/subjects/read.php')) {
            // Subjects taught by David Lee (t1001)
            const teacherSubjectIds = new Set(mockSectionAssignments.filter(sa => sa.teacherId === 1).map(sa => sa.subjectId));
            return mockSubjects.filter(s => teacherSubjectIds.has(s.id)) as T;
        }
         if (path.startsWith('/api/student/upcoming/read.php')) {
            return [
                { id: "upcoming1", title: "Submit CS101 Assignment", date: new Date(Date.now() + 86400000 * 3).toISOString(), type: "assignment" },
                { id: "upcoming2", title: "GEN001 Presentation", date: new Date(Date.now() + 86400000 * 5).toISOString(), type: "event" },
            ] as T;
        }


        console.warn(`Mock API unhandled GET path: ${path}`);
        return [] as T; // Default empty array for unhandled paths
    } catch (error) {
        handleFetchError(error, path, 'GET');
    }
};

export const postData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    console.log(`Mock postData to: ${path}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
        if (path.startsWith('/api/students/create.php')) {
            const newStudent = data as unknown as Omit<Student, 'id' | 'studentId' | 'section'>;
            const nextId = mockStudents.length > 0 ? Math.max(...mockStudents.map(s => s.id)) + 1 : 1;
            const student: Student = {
                ...newStudent,
                id: nextId,
                studentId: generateStudentId(nextId),
                section: generateSectionCode(newStudent.year || '1st Year'), // Generate section based on year
            };
            mockStudents.push(student);
            return student as ResponseData;
        }
        if (path.startsWith('/api/teachers/create.php')) {
            const newTeacher = data as unknown as Omit<Teacher, 'id' | 'teacherId'>;
            const nextId = mockTeachers.length > 0 ? Math.max(...mockTeachers.map(t => t.id)) + 1 : 1;
            const teacher: Teacher = {
                ...newTeacher,
                id: nextId,
                teacherId: generateTeacherId(nextId),
            };
            mockTeachers.push(teacher);
            return teacher as ResponseData;
        }
        if (path.startsWith('/api/admin/change_password.php') || path.startsWith('/api/student/change_password.php') || path.startsWith('/api/teacher/change_password.php')) {
            return { message: "Password updated successfully." } as ResponseData;
        }
        if (path.startsWith('/api/admin/reset_password.php')) {
            const { userId, userType } = data as { userId: number, userType: string };
            return { message: `${userType} password reset successfully for ID ${userId}.` } as ResponseData;
        }
        if (path.startsWith('/api/sections/adviser/update.php')) {
             const { sectionId, adviserId } = data as { sectionId: string, adviserId: number | null };
             const sectionIndex = mockSections.findIndex(s => s.id === sectionId);
             if (sectionIndex > -1) {
                 mockSections[sectionIndex].adviserId = adviserId ?? undefined;
                 mockSections[sectionIndex].adviserName = adviserId ? mockTeachers.find(t => t.id === adviserId)?.firstName + ' ' + mockTeachers.find(t => t.id === adviserId)?.lastName : undefined;
                 return { ...mockSections[sectionIndex] } as ResponseData;
             }
             throw new Error("Section not found for adviser update.");
        }
        if (path.startsWith('/api/sections/assignments/create.php')) {
            const assignmentData = data as { sectionId: string, subjectId: string, teacherId: number };
            const newAssignment: SectionSubjectAssignment = {
                id: `${assignmentData.sectionId}-${assignmentData.subjectId}`,
                ...assignmentData,
                subjectName: mockSubjects.find(s => s.id === assignmentData.subjectId)?.name,
                teacherName: mockTeachers.find(t => t.id === assignmentData.teacherId)?.firstName + ' ' + mockTeachers.find(t => t.id === assignmentData.teacherId)?.lastName,
            };
            mockSectionAssignments.push(newAssignment);
            return newAssignment as ResponseData;
        }
        if (path.startsWith('/api/announcements/create.php')) {
            const announcementPayload = data as { title: string, content: string, target: any };
            const newAnnouncement: Announcement = {
                id: `ann${mockAnnouncements.length + 1}`,
                title: announcementPayload.title,
                content: announcementPayload.content,
                date: new Date(),
                target: announcementPayload.target,
                author: "Admin", // Assuming admin for mock
            };
            mockAnnouncements.unshift(newAnnouncement);
            return newAnnouncement as ResponseData;
        }
        if (path.startsWith('/api/assignments/grades/update.php')) {
             const gradePayload = data as StudentSubjectAssignmentWithGrades;
             const index = mockStudentSubjectAssignmentsWithGrades.findIndex(
                 item => item.assignmentId === gradePayload.assignmentId && item.studentId === gradePayload.studentId
             );
             if (index !== -1) {
                 mockStudentSubjectAssignmentsWithGrades[index] = {
                     ...mockStudentSubjectAssignmentsWithGrades[index],
                     ...gradePayload,
                     status: gradePayload.finalGrade !== null && gradePayload.finalGrade !== undefined ? 'Complete' : (gradePayload.prelimGrade !== null || gradePayload.midtermGrade !== null ? 'Incomplete' : 'Not Submitted')
                 };
                 return { ...mockStudentSubjectAssignmentsWithGrades[index] } as ResponseData;
             } else {
                 // If not found, create a new entry (simulating upsert)
                 const student = mockStudents.find(s => s.id === gradePayload.studentId);
                 const subject = mockSubjects.find(s => s.id === gradePayload.subjectId);
                 const newGradeEntry: StudentSubjectAssignmentWithGrades = {
                    ...gradePayload,
                    studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
                    subjectName: subject ? subject.name : 'Unknown Subject',
                    section: student?.section || 'N/A',
                    year: student?.year || 'N/A',
                    status: gradePayload.finalGrade !== null && gradePayload.finalGrade !== undefined ? 'Complete' : (gradePayload.prelimGrade !== null || gradePayload.midtermGrade !== null ? 'Incomplete' : 'Not Submitted')
                 };
                 mockStudentSubjectAssignmentsWithGrades.push(newGradeEntry);
                 return newGradeEntry as ResponseData;
             }
        }


        console.warn(`Mock API unhandled POST path: ${path}`);
        throw new Error(`Mock POST endpoint for ${path} not implemented.`);
    } catch (error) {
        handleFetchError(error, path, 'POST');
    }
};

export const putData = async <Payload, ResponseData>(path: string, data: Payload): Promise<ResponseData> => {
    console.log(`Mock putData to: ${path}`, data);
    await new Promise(resolve => setTimeout(resolve, 300));
    const id = parseInt(path.split('/').pop() || '0', 10);

    try {
        if (path.startsWith('/api/students/update.php/')) {
            const studentIndex = mockStudents.findIndex(s => s.id === id);
            if (studentIndex > -1) {
                mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...(data as unknown as Partial<Student>) };
                return { ...mockStudents[studentIndex] } as ResponseData;
            }
            throw new Error("Student not found for update.");
        }
        if (path.startsWith('/api/teachers/update.php/')) {
            const teacherIndex = mockTeachers.findIndex(t => t.id === id);
            if (teacherIndex > -1) {
                mockTeachers[teacherIndex] = { ...mockTeachers[teacherIndex], ...(data as unknown as Partial<Teacher>) };
                return { ...mockTeachers[teacherIndex] } as ResponseData;
            }
            throw new Error("Teacher not found for update.");
        }
        if (path.startsWith('/api/student/profile/update.php')) {
            const studentId = (data as any).id;
            const studentIndex = mockStudents.findIndex(s => s.id === studentId);
             if (studentIndex > -1) {
                mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...(data as unknown as Partial<Student>) };
                return { ...mockStudents[studentIndex] } as ResponseData;
            }
            throw new Error("Student profile not found for update.");
        }
        if (path.startsWith('/api/teacher/profile/update.php')) {
            const teacherId = (data as any).id;
            const teacherIndex = mockTeachers.findIndex(t => t.id === teacherId);
            if (teacherIndex > -1) {
                mockTeachers[teacherIndex] = { ...mockTeachers[teacherIndex], ...(data as unknown as Partial<Teacher>) };
                return { ...mockTeachers[teacherIndex] } as ResponseData;
            }
            throw new Error("Teacher profile not found for update.");
        }


        console.warn(`Mock API unhandled PUT path: ${path}`);
        throw new Error(`Mock PUT endpoint for ${path} not implemented.`);
    } catch (error) {
        handleFetchError(error, path, 'PUT');
    }
};

export const deleteData = async (path: string): Promise<void> => {
    console.log(`Mock deleteData at: ${path}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const idPart = path.split('/').pop();

    try {
        if (path.startsWith('/api/students/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const initialLength = mockStudents.length;
            mockStudents = mockStudents.filter(s => s.id !== id);
            if (mockStudents.length === initialLength) throw new Error("Student not found for deletion.");
            return;
        }
        if (path.startsWith('/api/teachers/delete.php/')) {
            const id = parseInt(idPart || '0', 10);
            const initialLength = mockTeachers.length;
            mockTeachers = mockTeachers.filter(t => t.id !== id);
            if (mockTeachers.length === initialLength) throw new Error("Teacher not found for deletion.");
            return;
        }
        if (path.startsWith('/api/assignments/delete.php/')) {
             const assignmentId = idPart;
             const initialLength = mockSectionAssignments.length;
             mockSectionAssignments = mockSectionAssignments.filter(a => a.id !== assignmentId);
             if (mockSectionAssignments.length === initialLength) throw new Error("Section assignment not found for deletion.");
             return;
        }
        if (path.startsWith('/api/announcements/delete.php/')) {
            const announcementId = idPart;
            const initialLength = mockAnnouncements.length;
            mockAnnouncements = mockAnnouncements.filter(a => a.id !== announcementId);
            if (mockAnnouncements.length === initialLength) throw new Error("Announcement not found for deletion.");
            return;
        }

        console.warn(`Mock API unhandled DELETE path: ${path}`);
        throw new Error(`Mock DELETE endpoint for ${path} not implemented.`);
    } catch (error) {
        handleFetchError(error, path, 'DELETE');
    }
};
