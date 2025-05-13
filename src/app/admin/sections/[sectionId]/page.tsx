
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { Loader2, ArrowLeft, Users, CalendarClock, BookOpen, Edit2, Trash2 } from "lucide-react";
import type { Section, Student, Course, SectionSubjectAssignment, ScheduleEntry, Faculty, Program, YearLevel } from "@/types";
import { fetchData, postData, deleteData, USE_MOCK_API, mockSections, mockStudents, mockCourses, mockSectionAssignments, mockFaculty, mockApiPrograms, logActivity, mockTeacherTeachableCourses } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format, addHours, setHours, setMinutes, setSeconds, nextMonday, isMonday, addDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignSubjectSchema } from "@/lib/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";


type AssignSubjectFormValues = z.infer<typeof assignSubjectSchema>;

interface DisplayableCourseAssignment {
    courseId: string;
    courseName?: string;
    teacherId?: number | null;
    teacherName?: string | null;
    assignmentId?: string | null; 
    isAssigned: boolean;
}

// Type for information needed to generate a schedule entry
interface ScheduleCourseInfo {
    courseId: string;
    courseName?: string;
    teacherName?: string | null;
    sectionId: string;
}


const generateScheduleForSection = (coursesForSchedule: ScheduleCourseInfo[]): ScheduleEntry[] => {
    const schedule: ScheduleEntry[] = [];
    const today = new Date();
    
    const timeSlots = [ 
        { hour: 8, minute: 0 }, { hour: 9, minute: 0 }, { hour: 10, minute: 0 }, { hour: 11, minute: 0 },
        { hour: 13, minute: 0 }, { hour: 14, minute: 0 }, { hour: 15, minute: 0 }, { hour: 16, minute: 0 }
    ];
    
    let timeSlotIndex = 0;

    coursesForSchedule.forEach((courseInfo, idx) => {
        const dayOffset = Math.floor(idx / timeSlots.length) % 5; 
        
        let firstDayOfWeek = nextMonday(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
        if (isMonday(today)) { 
            firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        }
        
        const currentDayDate = addDays(firstDayOfWeek, dayOffset + Math.floor(idx / (timeSlots.length * 5)) * 7);

        const slot = timeSlots[timeSlotIndex % timeSlots.length];
        
        const startDateTime = setSeconds(setMinutes(setHours(currentDayDate, slot.hour), slot.minute),0);
        const endDateTime = addHours(startDateTime, 1);

        schedule.push({
            id: `${courseInfo.sectionId}-${courseInfo.courseId}-${format(startDateTime, "yyyyMMddHHmm")}`, 
            title: `${courseInfo.courseName || courseInfo.courseId}`,
            start: startDateTime,
            end: endDateTime,
            type: 'class',
            location: `Room ${101 + (idx % 10)}`, 
            teacher: courseInfo.teacherName || "Pending Assignment", // Use teacherName or fallback
            section: courseInfo.sectionId,
        });

        timeSlotIndex++;
    });
    return schedule.sort((a,b) => a.start.getTime() - b.start.getTime());
};


export default function SectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sectionId = typeof params.sectionId === 'string' ? params.sectionId : undefined;

  const [section, setSection] = React.useState<Section | null>(null);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [displayedCourses, setDisplayedCourses] = React.useState<DisplayableCourseAssignment[]>([]); 
  const [schedule, setSchedule] = React.useState<ScheduleEntry[]>([]);
  
  const [programsList, setProgramsList] = React.useState<Program[]>([]); 
  const [teachingFaculty, setTeachingFaculty] = React.useState<Faculty[]>([]);
  const [teacherTeachableCourses, setTeacherTeachableCourses] = React.useState<{ teacherId: number; courseIds: string[] }[]>([]);


  const [isLoading, setIsLoading] = React.useState(true);
  const [isAssignSubjectModalOpen, setIsAssignSubjectModalOpen] = React.useState(false);
  const [selectedCourseForAssignment, setSelectedCourseForAssignment] = React.useState<DisplayableCourseAssignment | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);


  const assignSubjectForm = useForm<AssignSubjectFormValues>({
    resolver: zodResolver(assignSubjectSchema),
  });
  

  const loadSectionData = React.useCallback(async () => {
    if (!sectionId) return;
    setIsLoading(true);
    try {
        let fetchedSection: Section | null = null;
        let fetchedStudents: Student[] = [];
        let fetchedAssignments: SectionSubjectAssignment[] = [];
        let fetchedSystemCourses: Course[] = [];
        let fetchedPrograms: Program[] = [];
        let fetchedFaculty: Faculty[] = [];
        let fetchedTeachableCoursesData: { teacherId: number; courseIds: string[] }[] = [];

        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 300));
            fetchedSection = mockSections.find(s => s.id === sectionId) || null;
            fetchedStudents = mockStudents.filter(st => st.section === sectionId);
            fetchedAssignments = mockSectionAssignments
                .filter(as => as.sectionId === sectionId)
                .map(as => ({
                    ...as,
                    subjectName: mockCourses.find(c => c.id === as.subjectId)?.name || as.subjectId,
                    teacherName: mockFaculty.find(f => f.id === as.teacherId)?.firstName + " " + mockFaculty.find(f => f.id === as.teacherId)?.lastName
                }));
            fetchedSystemCourses = mockCourses;
            fetchedPrograms = mockApiPrograms; 
            fetchedFaculty = mockFaculty.filter(f => f.department === 'Teaching');
            fetchedTeachableCoursesData = mockTeacherTeachableCourses;
        } else {
            const sectionDataArr = await fetchData<Section[]>(`sections/read.php?id=${sectionId}`); 
            fetchedSection = sectionDataArr && sectionDataArr.length > 0 ? sectionDataArr[0] : null;
            
            if (fetchedSection) {
                const allStudents = await fetchData<Student[]>(`students/read.php`);
                fetchedStudents = (allStudents || []).filter(st => st.section === sectionId);
                fetchedAssignments = await fetchData<SectionSubjectAssignment[]>(`sections/assignments/read.php?sectionId=${sectionId}`);
            }
            fetchedSystemCourses = await fetchData<Course[]>('courses/read.php');
            fetchedPrograms = await fetchData<Program[]>('programs/read.php');
            const allFaculty = await fetchData<Faculty[]>('teachers/read.php');
            fetchedFaculty = (allFaculty || []).filter(f => f.department === 'Teaching');
            fetchedTeachableCoursesData = await fetchData<{ teacherId: number; courseIds: string[] }[]>('teacher/teachable-courses/read.php');
        }

        setSection(fetchedSection);
        setStudents(fetchedStudents || []);
        setProgramsList(fetchedPrograms || []);
        setTeachingFaculty(fetchedFaculty || []);
        setTeacherTeachableCourses(fetchedTeachableCoursesData || []);

        if (fetchedSection && fetchedPrograms.length > 0 && fetchedSystemCourses.length > 0) {
            const programDetails = fetchedPrograms.find(p => p.id === fetchedSection!.programId);
            const curriculumCourses: Course[] = programDetails?.courses[fetchedSection!.yearLevel] || [];
            
            const displayableAssignmentsForTable: DisplayableCourseAssignment[] = curriculumCourses.map(course => {
                const existingAssignment = (fetchedAssignments || []).find(a => a.subjectId === course.id && a.sectionId === sectionId);
                return {
                    courseId: course.id,
                    courseName: course.name,
                    teacherId: existingAssignment?.teacherId,
                    teacherName: existingAssignment?.teacherName,
                    assignmentId: existingAssignment?.id,
                    isAssigned: !!existingAssignment,
                };
            });
            setDisplayedCourses(displayableAssignmentsForTable);

            const coursesForScheduleGeneration: ScheduleCourseInfo[] = curriculumCourses.map(course => {
                 const existingAssignment = (fetchedAssignments || []).find(a => a.subjectId === course.id && a.sectionId === sectionId);
                 return {
                    courseId: course.id,
                    courseName: course.name,
                    teacherName: existingAssignment?.teacherName, 
                    sectionId: sectionId,
                };
            });
            setSchedule(generateScheduleForSection(coursesForScheduleGeneration));

        } else {
            setDisplayedCourses([]);
            setSchedule([]);
        }

    } catch (error: any) {
      console.error("Failed to load section details:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load section data." });
    } finally {
      setIsLoading(false);
    }
  }, [sectionId, toast]);

  React.useEffect(() => {
    loadSectionData();
  }, [loadSectionData]);


  const handleOpenAssignTeacherModal = (courseAssignment: DisplayableCourseAssignment) => {
    setSelectedCourseForAssignment(courseAssignment);
    assignSubjectForm.reset({ 
        subjectId: courseAssignment.courseId, 
        teacherId: courseAssignment.teacherId || 0 
    });
    setIsAssignSubjectModalOpen(true);
  };

  const handleSaveTeacherAssignment = async (values: AssignSubjectFormValues) => {
    if (!section || !selectedCourseForAssignment) return;
    setIsSubmitting(true);
    
    const payload = {
        sectionId: section.id,
        subjectId: selectedCourseForAssignment.courseId, 
        teacherId: values.teacherId,
    };

    try {
        
        const responseData = await postData<typeof payload, SectionSubjectAssignment>(`sections/assignments/create.php`, payload); 
        
        if (selectedCourseForAssignment.isAssigned && values.teacherId !== selectedCourseForAssignment.teacherId) { 
            toast({ title: "Teacher Assignment Updated", description: `Teacher for ${selectedCourseForAssignment.courseName} updated.` });
            logActivity("Updated Section Teacher Assignment", `Teacher for ${selectedCourseForAssignment.courseName} in section ${section.id}`, "Admin");
        } else if (!selectedCourseForAssignment.isAssigned && values.teacherId !== 0) {
            toast({ title: "Teacher Assigned", description: `Teacher assigned to ${selectedCourseForAssignment.courseName}.` });
            logActivity("Assigned Teacher to Course in Section", `${selectedCourseForAssignment.courseName} to section ${section.id}`, "Admin");
        } else if (selectedCourseForAssignment.isAssigned && values.teacherId === 0) {
            await handleUnassignTeacher(selectedCourseForAssignment); 
            setIsSubmitting(false); 
            setIsAssignSubjectModalOpen(false);
            return;
        }
        
        setIsAssignSubjectModalOpen(false);
        await loadSectionData(); 
    } catch (error: any) {
        console.error("Failed to assign/update teacher:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save teacher assignment."});
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleUnassignTeacher = async (courseAssignment: DisplayableCourseAssignment) => {
    if (!section || !courseAssignment.assignmentId) return;
    setIsSubmitting(true);
    try {
        await deleteData(`assignments/delete.php/${courseAssignment.assignmentId}`); 
        toast({ title: "Teacher Unassigned", description: `Teacher unassigned from ${courseAssignment.courseName}.`});
        logActivity("Unassigned Teacher from Course in Section", `${courseAssignment.courseName} from section ${section.id}`, "Admin");
        await loadSectionData(); 
    } catch (error: any) {
        console.error("Failed to unassign teacher:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to remove teacher assignment."});
    } finally {
        setIsSubmitting(false);
    }
  };


  const studentColumns: ColumnDef<Student>[] = [
    { accessorKey: "studentId", header: "Student ID" },
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "lastName", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
  ];

  
  const courseAssignmentColumns: ColumnDef<DisplayableCourseAssignment>[] = [
    { 
        accessorKey: "courseName", 
        header: "Course (Subject)",
        cell: ({ row }) => row.original.courseName || row.original.courseId,
    },
    { 
        accessorKey: "teacherName", 
        header: "Assigned Teacher",
        cell: ({row}) => row.original.teacherName || <span className="italic text-muted-foreground">Pending Assignment</span>
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const courseItem = row.original;
            return (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenAssignTeacherModal(courseItem)} disabled={isSubmitting}>
                        <Edit2 className="mr-2 h-4 w-4" /> {courseItem.isAssigned ? "Edit Teacher" : "Assign Teacher"}
                    </Button>
                    {courseItem.isAssigned && courseItem.assignmentId && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={isSubmitting}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Unassign
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Unassign Teacher?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to unassign {courseItem.teacherName} from "{courseItem.courseName}"?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleUnassignTeacher(courseItem)}
                                        className={buttonVariants({variant: "destructive"})}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Yes, Unassign
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            );
        }
    }
  ];


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">Section not found.</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const programDetails = programsList.find(p => p.id === section.programId);
  
  const availableTeachersForModal = teachingFaculty.filter(faculty => {
      if (!selectedCourseForAssignment?.courseId) return true; 
      const teachableInfo = teacherTeachableCourses.find(ttc => ttc.teacherId === faculty.id);
      if (!teachableInfo || teachableInfo.courseIds.length === 0) return true; 
      return teachableInfo.courseIds.includes(selectedCourseForAssignment.courseId);
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Section: {section.sectionCode}</h1>
            <p className="text-muted-foreground">{programDetails?.name || section.programId} - {section.yearLevel}</p>
             <p className="text-sm text-muted-foreground">Adviser: {section.adviserName || 'Not Assigned'}</p>
        </div>
        <Button onClick={() => router.push('/admin/assignments')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedule & Announcements
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary" /> Curriculum Courses & Teachers</CardTitle>
          </div>
          <CardDescription>
            Courses for this section are based on the curriculum for {programDetails?.name || section.programId} - {section.yearLevel}. 
            Assign qualified teachers to each course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayedCourses.length > 0 ? (
            <DataTable columns={courseAssignmentColumns} data={displayedCourses} />
          ) : (
            <p className="text-muted-foreground">No curriculum courses defined for this program and year level, or an error occurred.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarClock className="mr-2 h-5 w-5 text-primary" /> Class Schedule</CardTitle>
          <CardDescription>Generated class schedule based on assigned courses and teachers. (Mock: Mon-Fri, 8AM-5PM, 1hr slots)</CardDescription>
        </CardHeader>
        <CardContent>
          {schedule.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {schedule.map(entry => (
                <div key={entry.id} className="p-3 border rounded-md bg-secondary/50 shadow-sm">
                  <p className="font-semibold text-sm text-primary">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(entry.start, "EEE, MMM d, p")} - {format(entry.end, "p")}
                  </p>
                  <p className="text-xs text-muted-foreground">Room: {entry.location}</p>
                  <p className="text-xs text-muted-foreground">Teacher: {entry.teacher}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No schedule generated. Assign teachers to curriculum courses to see the schedule.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Enrolled Students ({students.length})</CardTitle>
          <CardDescription>List of students enrolled in this section.</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <DataTable columns={studentColumns} data={students} searchPlaceholder="Search students..." />
          ) : (
            <p className="text-muted-foreground">No students currently enrolled in this section.</p>
          )}
        </CardContent>
      </Card>

       <Dialog open={isAssignSubjectModalOpen} onOpenChange={setIsAssignSubjectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCourseForAssignment?.isAssigned ? 'Edit Teacher Assignment' : 'Assign Teacher to Course'}</DialogTitle>
            <DialogDescription>
              Assign a teacher for: <span className="font-semibold">{selectedCourseForAssignment?.courseName}</span> in section {section.sectionCode}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1 pr-4">
            <Form {...assignSubjectForm}>
                <form onSubmit={assignSubjectForm.handleSubmit(handleSaveTeacherAssignment)} className="space-y-4 py-4">
                <FormField
                    control={assignSubjectForm.control}
                    name="subjectId" 
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Course (Subject)</FormLabel>
                        <Select 
                            onValueChange={field.onChange} 
                            value={field.value} 
                            disabled={true} 
                        >
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                           {selectedCourseForAssignment && <SelectItem value={selectedCourseForAssignment.courseId}>{selectedCourseForAssignment.courseName}</SelectItem>}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={assignSubjectForm.control}
                    name="teacherId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Teacher</FormLabel>
                        <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            value={field.value ? String(field.value) : ""} 
                            disabled={isLoading || isSubmitting || !selectedCourseForAssignment?.courseId}
                        >
                        <FormControl><SelectTrigger><SelectValue placeholder={!selectedCourseForAssignment?.courseId ? "Course not selected" : "Select a teacher"} /></SelectTrigger></FormControl>
                        <SelectContent>
                             <SelectItem value={"0"}>--- Unassign Teacher ---</SelectItem>
                            {availableTeachersForModal.map(faculty => (
                            <SelectItem key={faculty.id} value={String(faculty.id)}>{faculty.firstName} {faculty.lastName}</SelectItem>
                            ))}
                            {selectedCourseForAssignment?.courseId && availableTeachersForModal.length === 0 && 
                                <SelectItem value="none" disabled>No qualified teachers for this course.</SelectItem>
                            }
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <DialogFooter className="mt-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsAssignSubjectModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting || !selectedCourseForAssignment?.courseId}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {selectedCourseForAssignment?.isAssigned ? 'Update Teacher' : 'Assign Teacher'}
                    </Button>
                </DialogFooter>
                </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </div>
  );
}
    
