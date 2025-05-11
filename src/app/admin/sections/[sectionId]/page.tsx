
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
import { format, addHours, setHours, setMinutes, setSeconds, nextMonday, isMonday } from 'date-fns';
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
import { useForm, useWatch } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";


type AssignSubjectFormValues = z.infer<typeof assignSubjectSchema>;

const generateScheduleForSection = (sectionId: string, assignments: SectionSubjectAssignment[]): ScheduleEntry[] => {
    const schedule: ScheduleEntry[] = [];
    const today = new Date();
    let currentDay = isMonday(today) ? today : nextMonday(today); 

    const timeSlots = [
        { hour: 8, minute: 0 }, { hour: 9, minute: 0 }, { hour: 10, minute: 0 },
        { hour: 11, minute: 0 }, { hour: 13, minute: 0 }, { hour: 14, minute: 0 },
        { hour: 15, minute: 0 }, { hour: 16, minute: 0 }
    ];
    let dayIndex = 0; 
    let timeSlotIndex = 0;

    assignments.forEach((assign, idx) => {
        if (timeSlotIndex >= timeSlots.length) {
            timeSlotIndex = 0;
            dayIndex++;
            if (dayIndex >= 5) { 
                dayIndex = 0;
                currentDay = nextMonday(addHours(currentDay, 24 * 5));
            }
        }

        const classDateWithDayOffset = addHours(currentDay, 24 * dayIndex);
        const startDateTime = setSeconds(setMinutes(setHours(classDateWithDayOffset, timeSlots[timeSlotIndex].hour), timeSlots[timeSlotIndex].minute),0);
        const endDateTime = addHours(startDateTime, 1);

        schedule.push({
            id: `${assign.id}-${format(startDateTime, "yyyyMMddHHmm")}`,
            title: `${assign.subjectName || assign.subjectId}`,
            start: startDateTime,
            end: endDateTime,
            type: 'class',
            location: `Room ${101 + (idx % 10)}`, 
            teacher: assign.teacherName,
            section: sectionId,
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
  const [assignedSubjects, setAssignedSubjects] = React.useState<SectionSubjectAssignment[]>([]);
  const [schedule, setSchedule] = React.useState<ScheduleEntry[]>([]);
  const [allCourses, setAllCourses] = React.useState<Course[]>([]); // All system courses
  const [programsList, setProgramsList] = React.useState<Program[]>([]); // All programs
  const [teachingFaculty, setTeachingFaculty] = React.useState<Faculty[]>([]);
  const [teacherTeachableCourses, setTeacherTeachableCourses] = React.useState<{ teacherId: number; courseIds: string[] }[]>([]);


  const [isLoading, setIsLoading] = React.useState(true);
  const [isAssignSubjectModalOpen, setIsAssignSubjectModalOpen] = React.useState(false);
  const [selectedAssignmentToEdit, setSelectedAssignmentToEdit] = React.useState<SectionSubjectAssignment | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);


  const assignSubjectForm = useForm<AssignSubjectFormValues>({
    resolver: zodResolver(assignSubjectSchema),
  });
  
  const watchedSubjectIdInModal = useWatch({
    control: assignSubjectForm.control,
    name: 'subjectId',
  });

  const loadSectionData = React.useCallback(async () => {
    if (!sectionId) return;
    setIsLoading(true);
    try {
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const foundSection = mockSections.find(s => s.id === sectionId);
            setSection(foundSection || null);

            const sectionStudents = mockStudents.filter(st => st.section === sectionId);
            setStudents(sectionStudents);

            const assignmentsForSection = mockSectionAssignments
                .filter(as => as.sectionId === sectionId)
                .map(as => ({
                    ...as,
                    subjectName: mockCourses.find(c => c.id === as.subjectId)?.name || as.subjectId,
                    teacherName: mockFaculty.find(f => f.id === as.teacherId)?.firstName + " " + mockFaculty.find(f => f.id === as.teacherId)?.lastName
                }));
            setAssignedSubjects(assignmentsForSection);

            setSchedule(generateScheduleForSection(sectionId, assignmentsForSection));
            setAllCourses(mockCourses);
            setProgramsList(mockApiPrograms); 
            setTeachingFaculty(mockFaculty.filter(f => f.department === 'Teaching'));
            setTeacherTeachableCourses(mockTeacherTeachableCourses);
        } else {
            const [sectionDataArr, studentsData, assignmentsData, coursesData, facultyData, programsData, teachableCoursesData] = await Promise.all([
                fetchData<Section[]>(`sections/read.php?id=${sectionId}`), 
                fetchData<Student[]>(`students/read.php?section=${sectionId}`), 
                fetchData<SectionSubjectAssignment[]>(`sections/assignments/read.php?sectionId=${sectionId}`),
                fetchData<Course[]>('courses/read.php'),
                fetchData<Faculty[]>('teachers/read.php'),
                fetchData<Program[]>('programs/read.php'),
                fetchData<{ teacherId: number; courseIds: string[] }[]>('teacher/teachable-courses/read.php')
            ]);
            const sectionData = sectionDataArr && sectionDataArr.length > 0 ? sectionDataArr[0] : null;
            setSection(sectionData);
            setStudents(studentsData || []);
            const populatedAssignments = (assignmentsData || []).map(as => ({
                ...as,
                subjectName: coursesData?.find(c => c.id === as.subjectId)?.name || as.subjectId,
                teacherName: facultyData?.find(f => f.id === as.teacherId)?.firstName + " " + facultyData?.find(f => f.id === as.teacherId)?.lastName
            }));
            setAssignedSubjects(populatedAssignments);
            setSchedule(generateScheduleForSection(sectionId, populatedAssignments));
            setAllCourses(coursesData || []);
            setProgramsList(programsData || []);
            setTeachingFaculty((facultyData || []).filter(f => f.department === 'Teaching'));
            setTeacherTeachableCourses(teachableCoursesData || []);
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


  const handleOpenAssignSubjectModal = (assignment?: SectionSubjectAssignment) => {
    if (assignment) {
        setSelectedAssignmentToEdit(assignment);
        assignSubjectForm.reset({ subjectId: assignment.subjectId, teacherId: assignment.teacherId });
    } else {
        setSelectedAssignmentToEdit(null);
        assignSubjectForm.reset({ subjectId: "", teacherId: 0 });
    }
    setIsAssignSubjectModalOpen(true);
  };

  const handleSaveSubjectAssignment = async (values: AssignSubjectFormValues) => {
    if (!section) return;
    setIsSubmitting(true);
    const payload = {
        sectionId: section.id,
        subjectId: values.subjectId,
        teacherId: values.teacherId,
    };

    try {
        let responseData: SectionSubjectAssignment;
        if (selectedAssignmentToEdit) { 
            // Assuming create.php handles upsert by unique ID (sectionId-subjectId)
            // or a dedicated update endpoint if available.
            responseData = await postData<typeof payload, SectionSubjectAssignment>(`sections/assignments/create.php`, payload); 
            toast({ title: "Course Assignment Updated", description: "Teacher assignment updated." });
            logActivity("Updated Section Assignment", `Teacher for ${values.subjectId} in section ${section.id}`, "Admin");

        } else {
            responseData = await postData<typeof payload, SectionSubjectAssignment>(`sections/assignments/create.php`, payload);
            toast({ title: "Course Assigned", description: "Course and teacher assigned to section." });
            logActivity("Assigned Course to Section", `${values.subjectId} to section ${section.id}`, "Admin");
        }
        setIsAssignSubjectModalOpen(false);
        await loadSectionData(); 
    } catch (error: any) {
        console.error("Failed to assign/update subject:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save assignment."});
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteSubjectAssignment = async (assignmentId: string) => {
    if (!section) return;
    setIsSubmitting(true);
    try {
        await deleteData(`assignments/delete.php/${assignmentId}`); 
        toast({ title: "Course Unassigned", description: "Course removed from this section."});
        const deletedAssignment = assignedSubjects.find(a => a.id === assignmentId);
        if (deletedAssignment) {
            logActivity("Unassigned Course from Section", `${deletedAssignment.subjectName} from section ${section.id}`, "Admin");
        }
        await loadSectionData(); 
    } catch (error: any) {
        console.error("Failed to unassign subject:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to remove assignment."});
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

  const subjectAssignmentColumns: ColumnDef<SectionSubjectAssignment>[] = [
    { accessorKey: "subjectName", header: "Course (Subject)" },
    { accessorKey: "teacherName", header: "Assigned Teacher" },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenAssignSubjectModal(row.original)} disabled={isSubmitting}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit Teacher
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="sm" disabled={isSubmitting}>
                            <Trash2 className="mr-2 h-4 w-4" /> Unassign
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Unassign Course?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to remove "{row.original.subjectName}" from this section?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleDeleteSubjectAssignment(row.original.id)}
                                className={buttonVariants({variant: "destructive"})}
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Yes, Unassign
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
            </div>
        ),
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
  const coursesForThisSectionProgramAndYear = programDetails?.courses[section.yearLevel] || [];

  const availableCoursesForModal = coursesForThisSectionProgramAndYear.filter(course => {
    // If editing, allow the current subject. Otherwise, don't show already assigned subjects.
    if (selectedAssignmentToEdit && selectedAssignmentToEdit.subjectId === course.id) return true;
    return !assignedSubjects.some(as => as.subjectId === course.id);
  });
  
  const availableTeachersForModal = teachingFaculty.filter(faculty => {
      if (!watchedSubjectIdInModal) return true; // Show all if no subject selected yet
      const teachableInfo = teacherTeachableCourses.find(ttc => ttc.teacherId === faculty.id);
      if (!teachableInfo || teachableInfo.courseIds.length === 0) return true; // Assume can teach any if not specified
      return teachableInfo.courseIds.includes(watchedSubjectIdInModal);
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Section: {section.sectionCode}</h1>
            <p className="text-muted-foreground">{programDetails?.name || section.programId} - {section.yearLevel}</p>
             <p className="text-sm text-muted-foreground">Adviser: {section.adviserName || 'Not Assigned'}</p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sections
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary" /> Assigned Courses & Teachers</CardTitle>
          </div>
          <CardDescription>Manage teachers for courses automatically assigned to this section based on its program curriculum ({programDetails?.name} - {section.yearLevel}).</CardDescription>
        </CardHeader>
        <CardContent>
          {assignedSubjects.length > 0 ? (
            <DataTable columns={subjectAssignmentColumns} data={assignedSubjects} />
          ) : (
            <p className="text-muted-foreground">No courses are currently assigned to this section, or no teachers have been assigned to the program's courses for this year level.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarClock className="mr-2 h-5 w-5 text-primary" /> Class Schedule</CardTitle>
          <CardDescription>Generated class schedule based on assigned courses. (Mock: Mon-Fri, 8AM-5PM, 1hr slots)</CardDescription>
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
            <p className="text-muted-foreground">No schedule generated. Assign courses and teachers to see the schedule.</p>
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
            <DataTable columns={studentColumns} data={students} searchPlaceholder="Search students..." searchColumnId="lastName"/>
          ) : (
            <p className="text-muted-foreground">No students currently enrolled in this section.</p>
          )}
        </CardContent>
      </Card>

       <Dialog open={isAssignSubjectModalOpen} onOpenChange={setIsAssignSubjectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAssignmentToEdit ? 'Edit Teacher Assignment' : 'Assign Teacher to Course'}</DialogTitle>
            <DialogDescription>
              {selectedAssignmentToEdit ? `Update teacher for ${selectedAssignmentToEdit.subjectName} in section ${section.sectionCode}.` : `Assign a teacher to a course in section ${section.sectionCode}.`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-1 pr-4">
            <Form {...assignSubjectForm}>
                <form onSubmit={assignSubjectForm.handleSubmit(handleSaveSubjectAssignment)} className="space-y-4 py-4">
                <FormField
                    control={assignSubjectForm.control}
                    name="subjectId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Course (Subject)</FormLabel>
                        <Select 
                            onValueChange={(value) => {
                                field.onChange(value);
                                assignSubjectForm.setValue('teacherId', 0); // Reset teacher when subject changes
                            }} 
                            value={field.value} 
                            disabled={isLoading || isSubmitting || !!selectedAssignmentToEdit}
                        >
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {availableCoursesForModal.map(course => (
                            <SelectItem key={course.id} value={course.id}>{course.name} ({course.id})</SelectItem>
                            ))}
                            {selectedAssignmentToEdit && 
                                !availableCoursesForModal.some(c => c.id === selectedAssignmentToEdit.subjectId) && 
                                <SelectItem value={selectedAssignmentToEdit.subjectId}>{selectedAssignmentToEdit.subjectName}</SelectItem> 
                            }
                            {availableCoursesForModal.length === 0 && !selectedAssignmentToEdit && <SelectItem value="none" disabled>No available courses for this section/year.</SelectItem>}
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
                            disabled={isLoading || isSubmitting || !watchedSubjectIdInModal}
                        >
                        <FormControl><SelectTrigger><SelectValue placeholder={!watchedSubjectIdInModal ? "Select a course first" : "Select a teacher"} /></SelectTrigger></FormControl>
                        <SelectContent>
                            {availableTeachersForModal.map(faculty => (
                            <SelectItem key={faculty.id} value={String(faculty.id)}>{faculty.firstName} {faculty.lastName}</SelectItem>
                            ))}
                            {watchedSubjectIdInModal && availableTeachersForModal.length === 0 && <SelectItem value="none" disabled>No qualified teachers for this course.</SelectItem>}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <DialogFooter className="mt-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsAssignSubjectModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting || !watchedSubjectIdInModal}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {selectedAssignmentToEdit ? 'Save Changes' : 'Assign Teacher'}
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

    
