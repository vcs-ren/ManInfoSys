
"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { assignSubjectSchema } from "@/lib/schemas"; // Assuming this schema fits: { subjectId, teacherId } might need sectionId too.
import type { Faculty, Course, Section, SectionSubjectAssignment } from "@/types";
import { fetchData, postData, deleteData, USE_MOCK_API, mockFaculty, mockCourses, mockSections, mockSectionAssignments, logActivity } from "@/lib/api";
import { Loader2, PlusCircle, Trash2, User, BookOpen, Users as UsersIcon } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";


type AssignCourseToTeacherFormValues = z.infer<typeof assignSubjectSchema> & { sectionId: string };

const assignCourseToTeacherFullSchema = assignSubjectSchema.extend({
    sectionId: z.string().min(1, "Section selection is required."),
});


export default function TeacherCourseAssignmentsPage() {
    const [teachers, setTeachers] = React.useState<Faculty[]>([]);
    const [allCourses, setAllCourses] = React.useState<Course[]>([]);
    const [allSections, setAllSections] = React.useState<Section[]>([]);
    const [allAssignments, setAllAssignments] = React.useState<SectionSubjectAssignment[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedTeacherForAssignment, setSelectedTeacherForAssignment] = React.useState<Faculty | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const { toast } = useToast();

    const form = useForm<AssignCourseToTeacherFormValues>({
        resolver: zodResolver(assignCourseToTeacherFullSchema),
    });

    const loadData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            if (USE_MOCK_API) {
                await new Promise(resolve => setTimeout(resolve, 300));
                setTeachers(mockFaculty.filter(f => f.department === 'Teaching'));
                setAllCourses(mockCourses);
                setAllSections(mockSections);
                setAllAssignments(mockSectionAssignments.map(as => ({
                    ...as,
                    subjectName: mockCourses.find(c => c.id === as.subjectId)?.name || as.subjectId,
                    teacherName: mockFaculty.find(f => f.id === as.teacherId)?.firstName + " " + mockFaculty.find(f => f.id === as.teacherId)?.lastName
                })));
            } else {
                const [facultyData, coursesData, sectionsData, assignmentsData] = await Promise.all([
                    fetchData<Faculty[]>('teachers/read.php'),
                    fetchData<Course[]>('courses/read.php'),
                    fetchData<Section[]>('sections/read.php'),
                    fetchData<SectionSubjectAssignment[]>('sections/assignments/read.php?all=true') // Assuming an endpoint to fetch all
                ]);
                setTeachers((facultyData || []).filter(f => f.department === 'Teaching'));
                setAllCourses(coursesData || []);
                setAllSections(sectionsData || []);
                setAllAssignments((assignmentsData || []).map(as => ({
                    ...as,
                    subjectName: coursesData?.find(c => c.id === as.subjectId)?.name || as.subjectId,
                    teacherName: facultyData?.find(f => f.id === as.teacherId)?.firstName + " " + facultyData?.find(f => f.id === as.teacherId)?.lastName
                })));
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error loading data", description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenModal = (teacher: Faculty) => {
        setSelectedTeacherForAssignment(teacher);
        form.reset({ teacherId: teacher.id, subjectId: "", sectionId: "" });
        setIsModalOpen(true);
    };

    const handleAssignCourse = async (values: AssignCourseToTeacherFormValues) => {
        if (!selectedTeacherForAssignment) return;
        setIsSubmitting(true);
        const payload = {
            teacherId: selectedTeacherForAssignment.id,
            subjectId: values.subjectId,
            sectionId: values.sectionId,
        };

        try {
            const newAssignment = await postData<typeof payload, SectionSubjectAssignment>('sections/assignments/create.php', payload);
            toast({ title: "Assignment Successful", description: `${allCourses.find(c=>c.id === values.subjectId)?.name} in section ${values.sectionId} assigned to ${selectedTeacherForAssignment.firstName} ${selectedTeacherForAssignment.lastName}.` });
            logActivity("Assigned Teacher to Course-Section", `${selectedTeacherForAssignment.firstName} ${selectedTeacherForAssignment.lastName} to ${values.subjectId} in ${values.sectionId}`, "Admin");
            setIsModalOpen(false);
            loadData(); // Refresh assignments
        } catch (error: any) {
            toast({ variant: "destructive", title: "Assignment Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveAssignment = async (assignmentId: string) => {
        setIsSubmitting(true);
        try {
            await deleteData(`assignments/delete.php/${assignmentId}`);
            toast({ title: "Assignment Removed", description: "Teacher unassigned from course-section." });
            const removedAssignment = allAssignments.find(a => a.id === assignmentId);
            if(removedAssignment) {
                logActivity("Unassigned Teacher from Course-Section", `${removedAssignment.teacherName} from ${removedAssignment.subjectName} in ${removedAssignment.sectionId}`, "Admin");
            }
            loadData(); // Refresh assignments
        } catch (error: any) {
            toast({ variant: "destructive", title: "Removal Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Teacher Course-Section Assignments</h1>
                 <Button variant="outline" asChild>
                    <Link href="/admin/assignments">Back to Schedule & Announcements</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Assign Teachers to Courses in Sections</CardTitle>
                    <CardDescription>Manage which teacher handles specific courses within class sections. Only teaching staff are listed.</CardDescription>
                </CardHeader>
                <CardContent>
                    {teachers.length === 0 ? (
                        <p className="text-muted-foreground">No teaching faculty found. Please add faculty with 'Teaching' department.</p>
                    ) : (
                        <Accordion type="multiple" className="w-full space-y-2">
                            {teachers.map(teacher => {
                                const teacherAssignments = allAssignments.filter(a => a.teacherId === teacher.id);
                                return (
                                    <AccordionItem value={String(teacher.id)} key={teacher.id} className="border rounded-md shadow-sm">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 rounded-t-md">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-5 w-5 text-primary"/>
                                                    <span>{teacher.firstName} {teacher.lastName} ({teacher.facultyId})</span>
                                                    <Badge variant="secondary">{teacherAssignments.length} assignment(s)</Badge>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 border-t">
                                            {teacherAssignments.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="font-semibold text-sm mb-2">Current Assignments:</h4>
                                                    <ul className="space-y-1 max-h-48 overflow-y-auto">
                                                        {teacherAssignments.map(assign => (
                                                            <li key={assign.id} className="text-xs flex justify-between items-center p-1.5 bg-muted rounded-sm">
                                                                <span>{assign.subjectName} - {assign.sectionId}</span>
                                                                <Button variant="ghost" size="sm" className="text-destructive h-6 px-1.5" onClick={() => handleRemoveAssignment(assign.id)} disabled={isSubmitting}>
                                                                    <Trash2 className="h-3 w-3"/>
                                                                </Button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <Button size="sm" variant="outline" onClick={() => handleOpenModal(teacher)}>
                                                <PlusCircle className="mr-2 h-4 w-4" /> Assign Course to Section
                                            </Button>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Course to {selectedTeacherForAssignment?.firstName} {selectedTeacherForAssignment?.lastName}</DialogTitle>
                        <DialogDescription>Select a course and section to assign to this teacher.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] p-1 pr-2">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAssignCourse)} className="space-y-4 py-2">
                                <FormField
                                    control={form.control}
                                    name="subjectId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course (Subject)</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || isSubmitting}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {allCourses.map(course => (
                                                        <SelectItem key={course.id} value={course.id}>{course.name} ({course.type})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sectionId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Section</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || isSubmitting}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {allSections.map(section => (
                                                        <SelectItem key={section.id} value={section.id}>{section.sectionCode} ({section.programName} - {section.yearLevel})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                                    <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Assign
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
