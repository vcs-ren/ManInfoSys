"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { Label } from "@/components/ui/label"; // Import Label
import { useToast } from "@/hooks/use-toast";
import type { Faculty, Course, SectionSubjectAssignment } from "@/types";
import { fetchData, postData, deleteData, USE_MOCK_API, mockFaculty, mockCourses, mockSectionAssignments, logActivity, mockTeacherTeachableCourses as apiMockTeacherTeachableCourses } from "@/lib/api";
import { Loader2, PlusCircle, Trash2, User, BookOpen, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// New type for the form within the "Manage Teachable Courses" modal
interface ManageTeachableCoursesFormValues {
    selectedCourseIds: string[];
}

export default function TeacherCourseAssignmentsPage() {
    const [teachers, setTeachers] = React.useState<Faculty[]>([]);
    const [allCourses, setAllCourses] = React.useState<Course[]>([]);
    const [allAssignments, setAllAssignments] = React.useState<SectionSubjectAssignment[]>([]);
    const [teacherTeachableCourses, setTeacherTeachableCourses] = React.useState<{ teacherId: number; courseIds: string[] }[]>(apiMockTeacherTeachableCourses);

    const [isLoading, setIsLoading] = React.useState(true);
    const [isManageModalOpen, setIsManageModalOpen] = React.useState(false);
    const [selectedTeacherForManagement, setSelectedTeacherForManagement] = React.useState<Faculty | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [currentTeachableCourseIds, setCurrentTeachableCourseIds] = React.useState<string[]>([]);


    const { toast } = useToast();

    const loadData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            if (USE_MOCK_API) {
                await new Promise(resolve => setTimeout(resolve, 300));
                setTeachers(mockFaculty.filter(f => f.department === 'Teaching'));
                setAllCourses(mockCourses);
                setAllAssignments(mockSectionAssignments.map(as => ({
                    ...as,
                    subjectName: mockCourses.find(c => c.id === as.subjectId)?.name || as.subjectId,
                    teacherName: mockFaculty.find(f => f.id === as.teacherId)?.firstName + " " + mockFaculty.find(f => f.id === as.teacherId)?.lastName
                })));
                setTeacherTeachableCourses(apiMockTeacherTeachableCourses);
            } else {
                const [facultyData, coursesData, assignmentsData, teachableCoursesData] = await Promise.all([
                    fetchData<Faculty[]>('teachers/read.php'),
                    fetchData<Course[]>('courses/read.php'),
                    fetchData<SectionSubjectAssignment[]>('sections/assignments/read.php?all=true'), // Assuming an endpoint to fetch all assignments
                    fetchData<{ teacherId: number; courseIds: string[] }[]>('teacher/teachable-courses/read.php') // New endpoint needed
                ]);
                setTeachers((facultyData || []).filter(f => f.department === 'Teaching'));
                setAllCourses(coursesData || []);
                setAllAssignments((assignmentsData || []).map(as => ({
                    ...as,
                    subjectName: coursesData?.find(c => c.id === as.subjectId)?.name || as.subjectId,
                    teacherName: facultyData?.find(f => f.id === as.teacherId)?.firstName + " " + facultyData?.find(f => f.id === as.teacherId)?.lastName
                })));
                setTeacherTeachableCourses(teachableCoursesData || []);
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

    const handleOpenManageModal = (teacher: Faculty) => {
        setSelectedTeacherForManagement(teacher);
        const currentCourses = teacherTeachableCourses.find(ttc => ttc.teacherId === teacher.id)?.courseIds || [];
        setCurrentTeachableCourseIds(currentCourses);
        setIsManageModalOpen(true);
    };

    const handleSaveTeachableCourses = async () => {
        if (!selectedTeacherForManagement) return;
        setIsSubmitting(true);
        const teacherId = selectedTeacherForManagement.id;

        try {
            if (USE_MOCK_API) {
                const updatedTeachable = [...teacherTeachableCourses];
                const existingIndex = updatedTeachable.findIndex(ttc => ttc.teacherId === teacherId);
                if (existingIndex > -1) {
                    updatedTeachable[existingIndex].courseIds = [...currentTeachableCourseIds];
                } else {
                    updatedTeachable.push({ teacherId, courseIds: [...currentTeachableCourseIds] });
                }
                setTeacherTeachableCourses(updatedTeachable);
                // Persist to apiMockTeacherTeachableCourses if necessary for mock persistence across loads
                const apiMockIndex = apiMockTeacherTeachableCourses.findIndex(ttc => ttc.teacherId === teacherId);
                 if (apiMockIndex > -1) {
                    apiMockTeacherTeachableCourses[apiMockIndex].courseIds = [...currentTeachableCourseIds];
                 } else {
                    apiMockTeacherTeachableCourses.push({ teacherId, courseIds: [...currentTeachableCourseIds] });
                 }

            } else {
                // API call to save teachable courses
                await postData(`teacher/teachable-courses/update.php`, { teacherId, courseIds: currentTeachableCourseIds });
            }
            toast({ title: "Teachable Courses Updated", description: `Successfully updated courses for ${selectedTeacherForManagement.firstName} ${selectedTeacherForManagement.lastName}.` });
            logActivity("Updated Teachable Courses", `For ${selectedTeacherForManagement.firstName} ${selectedTeacherForManagement.lastName}`, "Admin");
            setIsManageModalOpen(false);
            // No need to call loadData() if local mock state is managed correctly, or if API call implies a refresh elsewhere.
            // For mock, local state update is enough.
        } catch (error: any) {
            toast({ variant: "destructive", title: "Update Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleRemoveAssignment = async (assignmentId: string) => {
        setIsSubmitting(true);
        try {
            if (USE_MOCK_API) {
                 const index = mockSectionAssignments.findIndex(a => a.id === assignmentId);
                 if (index > -1) mockSectionAssignments.splice(index, 1);
            } else {
                await deleteData(`assignments/delete.php/${assignmentId}`);
            }
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
                <h1 className="text-3xl font-bold">Teacher Course Assignments</h1>
                 <Button variant="outline" asChild>
                    <Link href="/admin/assignments">Back to Schedule & Announcements</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Teacher Assignments</CardTitle>
                    <CardDescription>
                        View current teaching assignments and manage which courses each teacher is qualified to teach.
                        Actual assignment to sections happens on the "Schedule & Announcements" page or section details page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {teachers.length === 0 ? (
                        <p className="text-muted-foreground">No teaching faculty found. Please add faculty with 'Teaching' department.</p>
                    ) : (
                        <Accordion type="multiple" className="w-full space-y-2">
                            {teachers.map(teacher => {
                                const teacherAssignments = allAssignments.filter(a => a.teacherId === teacher.id);
                                const teachable = teacherTeachableCourses.find(t => t.teacherId === teacher.id)?.courseIds || [];
                                return (
                                    <AccordionItem value={String(teacher.id)} key={teacher.id} className="border rounded-md shadow-sm">
                                        <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 rounded-t-md">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-5 w-5 text-primary"/>
                                                    <span>{teacher.firstName} {teacher.lastName} ({teacher.facultyId})</span>
                                                    <Badge variant="outline">Teaches: {teachable.length} course(s)</Badge>
                                                    <Badge variant="secondary">Assignments: {teacherAssignments.length}</Badge>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 border-t space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-sm mb-2">Currently Assigned to Sections:</h4>
                                                {teacherAssignments.length > 0 ? (
                                                    <ul className="space-y-1 max-h-40 overflow-y-auto text-xs">
                                                        {teacherAssignments.map(assign => (
                                                            <li key={assign.id} className="flex justify-between items-center p-1.5 bg-muted rounded-sm">
                                                                <span>{assign.subjectName} - {assign.sectionId}</span>
                                                                <Button variant="ghost" size="sm" className="text-destructive h-6 px-1.5" onClick={() => handleRemoveAssignment(assign.id)} disabled={isSubmitting}>
                                                                    <Trash2 className="h-3 w-3"/>
                                                                </Button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : <p className="text-xs text-muted-foreground">No active section assignments.</p>}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm mb-2">Teachable Courses:</h4>
                                                {teachable.length > 0 ? (
                                                    <ul className="space-y-1 text-xs max-h-40 overflow-y-auto">
                                                        {teachable.map(courseId => {
                                                            const course = allCourses.find(c => c.id === courseId);
                                                            return <li key={courseId} className="p-1.5 bg-secondary rounded-sm">{course?.name || courseId}</li>;
                                                        })}
                                                    </ul>
                                                ) : <p className="text-xs text-muted-foreground">No specific teachable courses set. Can be assigned any course matching their expertise.</p>}
                                            </div>

                                            <Button size="sm" variant="outline" onClick={() => handleOpenManageModal(teacher)}>
                                                <Settings className="mr-2 h-4 w-4" /> Manage Teachable Courses
                                            </Button>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Teachable Courses for {selectedTeacherForManagement?.firstName} {selectedTeacherForManagement?.lastName}</DialogTitle>
                        <DialogDescription>Select the courses this teacher is qualified to teach.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] p-1 pr-2">
                        <div className="space-y-2 py-4">
                            {allCourses.map(course => (
                                <div key={course.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-accent/50">
                                    <Checkbox
                                        id={`course-${course.id}-${selectedTeacherForManagement?.id}`}
                                        checked={currentTeachableCourseIds.includes(course.id)}
                                        onCheckedChange={(checked) => {
                                            setCurrentTeachableCourseIds(prev =>
                                                checked
                                                    ? [...prev, course.id]
                                                    : prev.filter(id => id !== course.id)
                                            );
                                        }}
                                        disabled={isSubmitting}
                                    />
                                    <Label htmlFor={`course-${course.id}-${selectedTeacherForManagement?.id}`} className="text-sm font-normal flex-1 cursor-pointer">
                                        {course.name} ({course.id}) - <span className="text-xs italic text-muted-foreground">{course.type}</span>
                                    </Label>
                                </div>
                            ))}
                             {allCourses.length === 0 && <p className="text-sm text-muted-foreground text-center">No system courses available.</p>}
                        </div>
                    </ScrollArea>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsManageModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleSaveTeachableCourses} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

