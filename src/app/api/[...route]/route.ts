// src/app/api/[...route]/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * EXAMPLE CATCH-ALL API ROUTE HANDLER
 *
 * This is a very basic example showing how you might structure API routes.
 * In a real application, you would:
 * 1.  Use a more robust routing mechanism (potentially a framework like Express within Next.js API routes, or dedicated API files per resource).
 * 2.  Implement proper authentication and authorization for each endpoint.
 * 3.  Connect to a real database (MySQL, PostgreSQL, etc.) using an ORM (like Prisma, TypeORM) or a database driver (like `mysql2`, `pg`).
 * 4.  Implement controllers and services/models to separate concerns.
 * 5.  Add comprehensive error handling and logging.
 * 6.  Validate request bodies and parameters rigorously.
 *
 * THIS IS NOT PRODUCTION-READY CODE. It's purely illustrative.
 */

// --- Mock Database (Replace with actual DB connection) ---
let mockStudents = [
    { id: 1, studentId: "s1001", firstName: "John", lastName: "Doe", course: "Computer Science", status: "Continuing", year: "2nd Year", section: "20A", email: "john.doe@example.com", phone: "111-222-3333", emergencyContactPhone: "999-888-7777", emergencyContactName: "Jane Doe", emergencyContactRelationship: "Mother" },
    { id: 2, studentId: "s1002", firstName: "Jane", lastName: "Smith", course: "Information Technology", status: "New", year: "1st Year", section: "10B", email: "jane.smith@example.com" },
];
let mockTeachers = [
     { id: 1, teacherId: "t1001", firstName: "Alice", lastName: "Johnson", department: "Mathematics", email: "alice.j@example.com" },
     { id: 2, teacherId: "t1002", firstName: "Bob", lastName: "Williams", department: "Science", email: "bob.w@example.com" },
];
let mockSections = [
    { id: "CS-10A", sectionCode: "10A", course: "Computer Science", yearLevel: "1st Year", adviserId: 1, adviserName: "Alice Johnson" },
    { id: "IT-10B", sectionCode: "10B", course: "Information Technology", yearLevel: "1st Year" },
];
let mockSubjects = [
     { id: "MATH101", name: "Mathematics 101", description: "Introductory Algebra" },
     { id: "CS101", name: "Introduction to Programming", description: "Fundamentals of programming" },
];
let mockAnnouncements = [
    { id: "ann1", title: "Midterm Schedule Update", content: "The midterm exam schedule has been updated.", date: new Date("2024-07-25"), target: { course: 'all', yearLevel: 'all', section: 'all' }, author: "Admin" },
];
let mockAssignments: any[] = [
     { id: "ssa1", sectionId: "CS-10A", subjectId: "CS101", teacherId: 1, subjectName: "Intro to Programming", teacherName: "Alice Johnson" },
];
let mockGrades: any = {}; // Store grades like { assignmentId: { prelimGrade: 90, ... } }
let nextStudentId = 3;
let nextTeacherId = 3;
let nextAnnouncementId = 3;
let nextAssignmentId = 2;

// Helper to generate section (simple random version)
const generateSection = (year: string | undefined): string => {
    const yearPrefixMap: { [key: string]: string } = {
        "1st Year": "10", "2nd Year": "20", "3rd Year": "30", "4th Year": "40",
    };
    const prefix = year ? yearPrefixMap[year] : "10";
    const randomLetter = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
    return `${prefix}${randomLetter}`;
};
// --- End Mock Database ---


// --- Request Handlers ---

async function handleGet(req: NextRequest, pathSegments: string[]) {
    console.log(`GET /api/${pathSegments.join('/')}`);
    // IMPORTANT: Add authentication/authorization checks here

    const resource = pathSegments[0];
    const id = pathSegments[1];
    const subResource = pathSegments[2];

    switch (resource) {
        case 'students':
            if (id) { // GET /api/students/{id}
                const student = mockStudents.find(s => s.id === parseInt(id));
                return student ? NextResponse.json(student) : NextResponse.json({ message: "Student not found" }, { status: 404 });
            } else { // GET /api/students
                return NextResponse.json({ records: mockStudents });
            }
        case 'teachers': // GET /api/teachers
             return NextResponse.json({ records: mockTeachers });
         case 'sections': // GET /api/sections
             if (id && subResource === 'assignments') { // GET /api/sections/{id}/assignments
                 const sectionAssignments = mockAssignments.filter(a => a.sectionId === id);
                 return NextResponse.json(sectionAssignments);
             }
             return NextResponse.json(mockSections);
         case 'subjects': // GET /api/subjects
             return NextResponse.json(mockSubjects);
         case 'announcements': // GET /api/announcements (admin view - all)
             // TODO: Add filtering for student/teacher views based on role/target
             return NextResponse.json(mockAnnouncements.sort((a, b) => b.date.getTime() - a.date.getTime()));
        case 'teacher': // Teacher specific endpoints
            if (pathSegments[1] === 'assignments' && pathSegments[2] === 'grades') { // GET /api/teacher/assignments/grades
                 // Simulate fetching assignments with grades for the logged-in teacher
                 // In real app, filter by teacher ID from session/token
                const assignmentsWithGrades = mockAssignments.map(assign => {
                     const student = mockStudents.find(s => s.id === assign.studentId); // Need student data
                    const gradeData = mockGrades[assign.id] || {};
                    const status = (gradeData.prelimGrade !== undefined && gradeData.midtermGrade !== undefined && gradeData.finalGrade !== undefined)
                                     ? 'Complete'
                                     : (gradeData.prelimGrade !== undefined || gradeData.midtermGrade !== undefined || gradeData.finalGrade !== undefined)
                                         ? 'Incomplete'
                                         : 'Not Submitted';
                    return {
                        ...assign,
                        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
                        section: student?.section || 'N/A', // Get section from student
                        year: student?.year || 'N/A',     // Get year from student
                        prelimGrade: gradeData.prelimGrade ?? null,
                        prelimRemarks: gradeData.prelimRemarks ?? '',
                        midtermGrade: gradeData.midtermGrade ?? null,
                        midtermRemarks: gradeData.midtermRemarks ?? '',
                        finalGrade: gradeData.finalGrade ?? null,
                        finalRemarks: gradeData.finalRemarks ?? '',
                        status: status
                    };
                });
                 return NextResponse.json(assignmentsWithGrades);
            }
             if (pathSegments[1] === 'subjects') { // GET /api/teacher/subjects
                 // Simulate fetching subjects assigned to the logged-in teacher
                 return NextResponse.json(mockSubjects); // Return all for now
             }
              if (pathSegments[1] === 'profile') { // GET /api/teacher/profile
                 // Simulate fetching logged-in teacher's profile (use mock t1001)
                 const profile = mockTeachers.find(t => t.teacherId === 't1001');
                 return profile ? NextResponse.json(profile) : NextResponse.json({ message: "Profile not found" }, { status: 404 });
             }
              if (pathSegments[1] === 'schedule') { // GET /api/teacher/schedule
                  // Simulate fetching schedule for teacher t1001
                 const teacherSchedule: ScheduleEntry[] = [ // Example data
                      { id: "tcl1", title: "Math 101 - Section A", start: new Date(new Date().setHours(9, 0, 0, 0)), end: new Date(new Date().setHours(10, 30, 0, 0)), type: "class", location: "Room 101", section: "A" },
                      { id: "ev1", title: "Faculty Meeting", start: new Date(new Date().setDate(new Date().getDate() + 1)), end: new Date(new Date().setDate(new Date().getDate() + 1)), type: "event", location: "Conference Hall" },
                 ];
                 return NextResponse.json(teacherSchedule);
             }
             // GET /api/teacher/announcements
             if (pathSegments[1] === 'announcements') {
                 // Simulate fetching announcements visible to teachers (e.g., all admin ones)
                 return NextResponse.json(mockAnnouncements.filter(a => a.author === 'Admin')); // Example filter
             }
             break;
         case 'student': // Student specific endpoints
             if (pathSegments[1] === 'profile') { // GET /api/student/profile
                 // Simulate fetching logged-in student's profile (use mock s1001)
                 const profile = mockStudents.find(s => s.studentId === 's1001');
                 return profile ? NextResponse.json(profile) : NextResponse.json({ message: "Profile not found" }, { status: 404 });
             }
              if (pathSegments[1] === 'grades') { // GET /api/student/grades
                 // Simulate fetching grades for student s1001
                 const studentAssignments = mockAssignments; // Assume student is in all assignments for mock
                 const studentGrades = studentAssignments.map(assign => {
                     const gradeData = mockGrades[assign.id] || {};
                     const status = (gradeData.prelimGrade !== undefined && gradeData.midtermGrade !== undefined && gradeData.finalGrade !== undefined)
                                      ? 'Complete'
                                      : (gradeData.prelimGrade !== undefined || gradeData.midtermGrade !== undefined || gradeData.finalGrade !== undefined)
                                          ? 'Incomplete'
                                          : 'Not Submitted';
                     return {
                         id: assign.subjectId, // Use subjectId as unique key for display
                         subjectName: mockSubjects.find(s => s.id === assign.subjectId)?.name || 'Unknown Subject',
                         prelimGrade: gradeData.prelimGrade ?? null,
                         midtermGrade: gradeData.midtermGrade ?? null,
                         finalGrade: gradeData.finalGrade ?? null,
                         finalRemarks: gradeData.finalRemarks ?? '',
                         status: status
                     };
                 });
                 return NextResponse.json(studentGrades);
             }
              if (pathSegments[1] === 'schedule') { // GET /api/student/schedule
                 // Simulate fetching schedule for student s1001
                 const studentSchedule: ScheduleEntry[] = [ // Example data
                      { id: "scl1", title: "Math 101", start: new Date(new Date().setHours(9, 0, 0, 0)), end: new Date(new Date().setHours(10, 30, 0, 0)), type: "class", location: "Room 101", teacher: "Alice Johnson" },
                      { id: "ev_camp1", title: "Campus Event: Tech Fest 2024", start: new Date(new Date().setDate(new Date().getDate() + 8)), end: new Date(new Date().setDate(new Date().getDate() + 8)), type: "event", location: "Main Hall" },
                 ];
                 return NextResponse.json(studentSchedule);
             }
              if (pathSegments[1] === 'announcements') { // GET /api/student/announcements
                  // Simulate fetching announcements visible to student s1001 (e.g., general + course/year/section specific)
                 return NextResponse.json(mockAnnouncements); // Return all for now
             }
             break;
        case 'admin':
             if (pathSegments[1] === 'dashboard-stats') { // GET /api/admin/dashboard-stats
                 const stats = {
                     totalStudents: mockStudents.length,
                     totalTeachers: mockTeachers.length,
                     upcomingEvents: 1, // Example
                 };
                 return NextResponse.json(stats);
             }
             break;

        default:
            return NextResponse.json({ message: "Resource not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
}

async function handlePost(req: NextRequest, pathSegments: string[]) {
    console.log(`POST /api/${pathSegments.join('/')}`);
    // IMPORTANT: Add authentication/authorization checks here
    let body;
    try {
        body = await req.json();
    } catch (error) {
        return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const resource = pathSegments[0];
    const id = pathSegments[1];
    const subResource = pathSegments[2];

     switch (resource) {
         case 'students': // POST /api/students
             const newStudent = {
                 ...body,
                 id: nextStudentId,
                 studentId: `s100${nextStudentId}`,
                 // Generate section based on year (ensure year is passed correctly)
                 section: generateSection(body.year),
                 // Password should be handled securely (hashed) on backend
             };
             mockStudents.push(newStudent);
             nextStudentId++;
             return NextResponse.json(newStudent, { status: 201 });

         case 'teachers': // POST /api/teachers
             const newTeacher = {
                 ...body,
                 id: nextTeacherId,
                 teacherId: `t100${nextTeacherId}`,
                 // Password should be handled securely (hashed) on backend
             };
             mockTeachers.push(newTeacher);
             nextTeacherId++;
             return NextResponse.json(newTeacher, { status: 201 });

        case 'sections':
             if (id && subResource === 'assignments') { // POST /api/sections/{id}/assignments
                 const newAssignment = {
                     ...body, // should contain subjectId, teacherId
                     id: `ssa${nextAssignmentId++}`,
                     sectionId: id,
                     // Add subjectName, teacherName from mocks for response consistency
                     subjectName: mockSubjects.find(s => s.id === body.subjectId)?.name || 'Unknown Subject',
                     teacherName: mockTeachers.find(t => t.id === body.teacherId)
                                   ? `${mockTeachers.find(t => t.id === body.teacherId)?.firstName} ${mockTeachers.find(t => t.id === body.teacherId)?.lastName}`
                                   : 'Unknown Teacher',
                 };
                 mockAssignments.push(newAssignment);
                 return NextResponse.json(newAssignment, { status: 201 });
             }
              if (id && subResource === 'adviser') { // POST /api/sections/{id}/adviser (Treat as PATCH/PUT conceptually)
                 const sectionIndex = mockSections.findIndex(s => s.id === id);
                 if (sectionIndex !== -1) {
                     const adviser = mockTeachers.find(t => t.id === body.adviserId);
                     mockSections[sectionIndex].adviserId = body.adviserId ?? undefined;
                     mockSections[sectionIndex].adviserName = body.adviserId ? `${adviser?.firstName} ${adviser?.lastName}` : undefined;
                     return NextResponse.json(mockSections[sectionIndex]);
                 } else {
                     return NextResponse.json({ message: "Section not found" }, { status: 404 });
                 }
             }
             break;

         case 'announcements': // POST /api/announcements
             const newAnnouncement = {
                 ...body, // title, content, target
                 id: `ann${nextAnnouncementId++}`,
                 date: new Date(),
                 author: "Admin", // Assume admin author for now
             };
             mockAnnouncements.push(newAnnouncement);
             return NextResponse.json(newAnnouncement, { status: 201 });

        case 'grades': // POST /api/grades (Alternative: PUT /api/assignments/{id}/grades)
             // This assumes the body contains the full grade update for an assignment
             const assignmentIdForGrade = body.assignmentId;
             if (!assignmentIdForGrade) {
                 return NextResponse.json({ message: "Missing assignmentId" }, { status: 400 });
             }
             mockGrades[assignmentIdForGrade] = {
                 prelimGrade: body.prelimGrade,
                 prelimRemarks: body.prelimRemarks,
                 midtermGrade: body.midtermGrade,
                 midtermRemarks: body.midtermRemarks,
                 finalGrade: body.finalGrade,
                 finalRemarks: body.finalRemarks,
             };
              // Recalculate status after update
             const updatedAssignment = mockAssignments.find(a => a.id === assignmentIdForGrade);
             if (updatedAssignment) {
                 const gradeData = mockGrades[assignmentIdForGrade];
                  const student = mockStudents.find(s => s.id === updatedAssignment.studentId);
                  const status = (gradeData.prelimGrade !== null && gradeData.midtermGrade !== null && gradeData.finalGrade !== null)
                                 ? 'Complete'
                                 : (gradeData.prelimGrade !== null || gradeData.midtermGrade !== null || gradeData.finalGrade !== null)
                                     ? 'Incomplete'
                                     : 'Not Submitted';
                  // Return the assignment with updated grades and status
                 const responseAssignment = {
                     ...updatedAssignment,
                      studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
                     section: student?.section || 'N/A',
                     year: student?.year || 'N/A',
                     prelimGrade: gradeData.prelimGrade ?? null,
                     prelimRemarks: gradeData.prelimRemarks ?? '',
                     midtermGrade: gradeData.midtermGrade ?? null,
                     midtermRemarks: gradeData.midtermRemarks ?? '',
                     finalGrade: gradeData.finalGrade ?? null,
                     finalRemarks: gradeData.finalRemarks ?? '',
                     status: status
                 };
                return NextResponse.json(responseAssignment);
             } else {
                  return NextResponse.json({ message: "Assignment not found for grade update" }, { status: 404 });
             }

        case 'assignments':
             // Example: POST /api/assignments/{assignmentId}/grades
             if (id && subResource === 'grades') {
                 const assignmentIdForGrade = id;
                 mockGrades[assignmentIdForGrade] = {
                     prelimGrade: body.prelimGrade,
                     prelimRemarks: body.prelimRemarks,
                     midtermGrade: body.midtermGrade,
                     midtermRemarks: body.midtermRemarks,
                     finalGrade: body.finalGrade,
                     finalRemarks: body.finalRemarks,
                 };
                  const updatedAssignment = mockAssignments.find(a => a.id === assignmentIdForGrade);
                  if (updatedAssignment) {
                       const gradeData = mockGrades[assignmentIdForGrade];
                       const student = mockStudents.find(s => s.id === updatedAssignment.studentId);
                       const status = (gradeData.prelimGrade !== null && gradeData.midtermGrade !== null && gradeData.finalGrade !== null)
                                 ? 'Complete'
                                 : (gradeData.prelimGrade !== null || gradeData.midtermGrade !== null || gradeData.finalGrade !== null)
                                     ? 'Incomplete'
                                     : 'Not Submitted';
                       const responseAssignment = {
                          ...updatedAssignment,
                            studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
                            section: student?.section || 'N/A',
                            year: student?.year || 'N/A',
                            prelimGrade: gradeData.prelimGrade ?? null,
                            prelimRemarks: gradeData.prelimRemarks ?? '',
                            midtermGrade: gradeData.midtermGrade ?? null,
                            midtermRemarks: gradeData.midtermRemarks ?? '',
                            finalGrade: gradeData.finalGrade ?? null,
                            finalRemarks: gradeData.finalRemarks ?? '',
                            status: status
                        };
                        return NextResponse.json(responseAssignment);
                  } else {
                        return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
                  }
             }
             break;

         case 'auth': // POST /api/auth/login
             if (pathSegments[1] === 'login') {
                 const { username, password } = body;
                 // --- VERY BASIC MOCK AUTH ---
                 if (username === 'admin' && password) {
                     return NextResponse.json({ success: true, role: 'Admin', redirectPath: '/admin/dashboard' });
                 } else if (username === 'student' && password) { // Generic student login
                      return NextResponse.json({ success: true, role: 'Student', redirectPath: '/student/dashboard' });
                 } else if (username === 'teacher' && password) { // Generic teacher login
                     return NextResponse.json({ success: true, role: 'Teacher', redirectPath: '/teacher/dashboard' });
                 } else if (mockStudents.some(s => s.studentId === username) && password) { // Specific student ID
                     return NextResponse.json({ success: true, role: 'Student', redirectPath: '/student/dashboard' });
                 } else if (mockTeachers.some(t => t.teacherId === username) && password) { // Specific teacher ID
                      return NextResponse.json({ success: true, role: 'Teacher', redirectPath: '/teacher/dashboard' });
                 }
                 // --- End Mock Auth ---
                 return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
             }
             break;

         // Password Change Endpoints (highly simplified mocks)
         case 'admin':
              if (pathSegments[1] === 'change-password') { // POST /api/admin/change-password
                  // Simulate password change for admin
                  console.log("Admin password change attempt:", body);
                   // In real app: verify body.currentPassword against hash, then update hash
                  return NextResponse.json({ message: "Password changed successfully" });
              }
              break;
          case 'teacher':
              if (pathSegments[1] === 'change-password') { // POST /api/teacher/change-password
                  console.log("Teacher password change attempt:", body);
                  // In real app: verify body.currentPassword against hash for logged-in teacher
                   return NextResponse.json({ message: "Password changed successfully" });
              }
              break;
          case 'student':
              if (pathSegments[1] === 'change-password') { // POST /api/student/change-password
                  console.log("Student password change attempt:", body);
                   // In real app: verify body.currentPassword against hash for logged-in student
                  return NextResponse.json({ message: "Password changed successfully" });
              }
              break;

        default:
            return NextResponse.json({ message: "Resource not found or method not allowed" }, { status: 404 });
    }
     return NextResponse.json({ message: "Invalid POST request" }, { status: 400 });
}

async function handlePut(req: NextRequest, pathSegments: string[]) {
     console.log(`PUT /api/${pathSegments.join('/')}`);
     // IMPORTANT: Add authentication/authorization checks here
     let body;
     try {
         body = await req.json();
     } catch (error) {
         return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
     }

     const resource = pathSegments[0];
     const id = pathSegments[1]; // Expecting ID in the path for PUT

     if (!id) {
         return NextResponse.json({ message: "Missing ID for PUT request" }, { status: 400 });
     }

     switch (resource) {
         case 'students': // PUT /api/students/{id}
             const studentIndex = mockStudents.findIndex(s => s.id === parseInt(id));
             if (studentIndex !== -1) {
                 // Update existing student, retain generated fields if not provided in body
                 const originalStudent = mockStudents[studentIndex];
                 mockStudents[studentIndex] = {
                     ...originalStudent, // Keep original ID, studentId, section etc.
                     ...body,           // Apply updates from body
                     id: originalStudent.id, // Ensure ID is not overwritten
                      // Optionally regenerate section if year changes, or handle in model
                      // section: body.year !== originalStudent.year ? generateSection(body.year) : originalStudent.section,
                 };
                 return NextResponse.json(mockStudents[studentIndex]);
             } else {
                 return NextResponse.json({ message: "Student not found" }, { status: 404 });
             }

         case 'teachers': // PUT /api/teachers/{id}
             const teacherIndex = mockTeachers.findIndex(t => t.id === parseInt(id));
             if (teacherIndex !== -1) {
                 const originalTeacher = mockTeachers[teacherIndex];
                 mockTeachers[teacherIndex] = {
                      ...originalTeacher,
                      ...body,
                      id: originalTeacher.id, // Ensure ID not overwritten
                 };
                 return NextResponse.json(mockTeachers[teacherIndex]);
             } else {
                 return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
             }

         case 'student': // PUT /api/student/profile
             if (pathSegments[1] === 'profile') {
                  // Simulate updating logged-in student's profile (s1001)
                 const studentProfileIndex = mockStudents.findIndex(s => s.studentId === 's1001');
                 if (studentProfileIndex !== -1) {
                      const originalProfile = mockStudents[studentProfileIndex];
                       mockStudents[studentProfileIndex] = {
                           ...originalProfile,
                           ...body, // Apply changes from form
                           // Ensure non-editable fields are preserved
                           id: originalProfile.id,
                           studentId: originalProfile.studentId,
                           course: originalProfile.course,
                           status: originalProfile.status,
                           year: originalProfile.year,
                           section: originalProfile.section,
                       };
                      return NextResponse.json(mockStudents[studentProfileIndex]);
                 } else {
                      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
                 }
             }
             break;
          case 'teacher': // PUT /api/teacher/profile
             if (pathSegments[1] === 'profile') {
                  // Simulate updating logged-in teacher's profile (t1001)
                 const teacherProfileIndex = mockTeachers.findIndex(t => t.teacherId === 't1001');
                  if (teacherProfileIndex !== -1) {
                      const originalProfile = mockTeachers[teacherProfileIndex];
                       mockTeachers[teacherProfileIndex] = {
                           ...originalProfile,
                           ...body, // Apply changes
                           // Ensure non-editable fields are preserved
                           id: originalProfile.id,
                           teacherId: originalProfile.teacherId,
                           department: originalProfile.department,
                       };
                      return NextResponse.json(mockTeachers[teacherProfileIndex]);
                 } else {
                      return NextResponse.json({ message: "Teacher profile not found" }, { status: 404 });
                 }
             }
             break;

         default:
             return NextResponse.json({ message: "Resource not found or method not allowed for PUT" }, { status: 404 });
     }
      return NextResponse.json({ message: "Invalid PUT request" }, { status: 400 });
 }

 async function handleDelete(req: NextRequest, pathSegments: string[]) {
    console.log(`DELETE /api/${pathSegments.join('/')}`);
    // IMPORTANT: Add authentication/authorization checks here

    const resource = pathSegments[0];
    const id = pathSegments[1]; // Expecting ID in the path

     if (!id) {
         return NextResponse.json({ message: "Missing ID for DELETE request" }, { status: 400 });
     }

     switch (resource) {
         case 'students': // DELETE /api/students/{id}
             const initialLengthStudents = mockStudents.length;
             mockStudents = mockStudents.filter(s => s.id !== parseInt(id));
             if (mockStudents.length < initialLengthStudents) {
                 return new NextResponse(null, { status: 204 }); // No Content
             } else {
                 return NextResponse.json({ message: "Student not found" }, { status: 404 });
             }

         case 'teachers': // DELETE /api/teachers/{id}
             const initialLengthTeachers = mockTeachers.length;
             mockTeachers = mockTeachers.filter(t => t.id !== parseInt(id));
              if (mockTeachers.length < initialLengthTeachers) {
                 return new NextResponse(null, { status: 204 }); // No Content
             } else {
                 return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
             }
         case 'assignments': // DELETE /api/assignments/{assignmentId}
             const initialLengthAssignments = mockAssignments.length;
             mockAssignments = mockAssignments.filter(a => a.id !== id);
             if (mockAssignments.length < initialLengthAssignments) {
                  // Also remove associated grades (optional, depends on requirements)
                 delete mockGrades[id];
                 return new NextResponse(null, { status: 204 }); // No Content
             } else {
                 return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
             }
          case 'announcements': // DELETE /api/announcements/{announcementId}
             const initialLengthAnnouncements = mockAnnouncements.length;
             mockAnnouncements = mockAnnouncements.filter(a => a.id !== id);
             if (mockAnnouncements.length < initialLengthAnnouncements) {
                 return new NextResponse(null, { status: 204 }); // No Content
             } else {
                 return NextResponse.json({ message: "Announcement not found" }, { status: 404 });
             }

         default:
             return NextResponse.json({ message: "Resource not found or method not allowed for DELETE" }, { status: 404 });
     }
      return NextResponse.json({ message: "Invalid DELETE request" }, { status: 400 });
 }


// --- Main Route Handlers ---

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }) {
    const pathSegments = params.route || [];
    return handleGet(req, pathSegments);
}

export async function POST(req: NextRequest, { params }: { params: { route: string[] } }) {
     const pathSegments = params.route || [];
     return handlePost(req, pathSegments);
}

export async function PUT(req: NextRequest, { params }: { params: { route: string[] } }) {
     const pathSegments = params.route || [];
     return handlePut(req, pathSegments);
}

export async function DELETE(req: NextRequest, { params }: { params: { route: string[] } }) {
    const pathSegments = params.route || [];
    return handleDelete(req, pathSegments);
}

// Add PATCH, OPTIONS etc. if needed
