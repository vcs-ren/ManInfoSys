
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2, Loader2, BookOpen, Library, PackagePlus, XCircle, Edit3, AlertCircle, MoreHorizontal, Settings, CheckSquare } from "lucide-react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { zodResolver } from "@hookform/resolvers/zod";
import { programSchema, courseSchema, assignCoursesToProgramSchema as pageAssignCoursesToProgramSchema } from "@/lib/schemas";
import type { Program, Course, CourseType, YearLevel, AdminRole } from "@/types";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchData, postData, putData, deleteData, USE_MOCK_API, mockApiPrograms, mockCourses, logActivity } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


type ProgramFormValues = z.infer<typeof programSchema>;
type CourseFormValues = z.infer<typeof courseSchema>;
type AssignCoursesToProgramFormValues = z.infer<typeof pageAssignCoursesToProgramSchema>;


const yearLevels: YearLevel[] = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const courseTypes: CourseType[] = ["Major", "Minor"];

export default function ProgramsCoursesPage() {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [allCourses, setAllCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const [isProgramModalOpen, setIsProgramModalOpen] = React.useState(false);
  const [isEditProgramMode, setIsEditProgramMode] = React.useState(false);
  const [selectedProgramForEdit, setSelectedProgramForEdit] = React.useState<Program | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = React.useState(false);
  const [isEditCourseMode, setIsEditCourseMode] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);

  const [isAssignCoursesModalOpen, setIsAssignCoursesModalOpen] = React.useState(false);
  const [selectedProgramForCourseAssignment, setSelectedProgramForCourseAssignment] = React.useState<Program | null>(null);
  const [selectedYearForCourseAssignment, setSelectedYearForCourseAssignment] = React.useState<YearLevel | null>(null);

  const [isCurrentUserSuperAdmin, setIsCurrentUserSuperAdmin] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      const storedUserRole = localStorage.getItem('userRole') as AdminRole | null;
      const parsedUserId = storedUserId ? parseInt(storedUserId, 10) : null;
      setCurrentUserId(parsedUserId);
      setIsCurrentUserSuperAdmin(parsedUserId === 0 && storedUserRole === 'Super Admin');
    }
  }, []);


  const programForm = useForm<ProgramFormValues>({ resolver: zodResolver(programSchema) });
  const courseForm = useForm<CourseFormValues>({ resolver: zodResolver(courseSchema), defaultValues: { programId: [] } });
  const assignCoursesToProgramForm = useForm<AssignCoursesToProgramFormValues>({
    resolver: zodResolver(pageAssignCoursesToProgramSchema),
    defaultValues: { programId: "", yearLevel: "1st Year", courseIds: [] },
  });


  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (USE_MOCK_API) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setPrograms(mockApiPrograms || []);
        setAllCourses(mockCourses || []);
      } else {
        const [programsData, coursesData] = await Promise.all([
          fetchData<Program[]>('programs/read.php'),
          fetchData<Course[]>('courses/read.php')
        ]);
        setPrograms(programsData || []);
        setAllCourses(coursesData || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load data." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Program Modal Handlers
  const handleOpenProgramModal = (program?: Program) => {
    if (!isCurrentUserSuperAdmin) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can manage programs." });
      return;
    }
    if (program) {
      setSelectedProgramForEdit(program);
      setIsEditProgramMode(true);
      programForm.reset({
        id: program.id,
        name: program.name,
        description: program.description || "",
        courses: program.courses,
      });
    } else {
      setSelectedProgramForEdit(null);
      setIsEditProgramMode(false);
      programForm.reset({ id: "", name: "", description: "", courses: { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] } });
    }
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (values: ProgramFormValues) => {
    if (!isCurrentUserSuperAdmin) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can save programs." });
      return;
    }
    setIsSubmitting(true);
    try {
      let savedProgram: Program;
      if (isEditProgramMode && selectedProgramForEdit) {
        savedProgram = await putData<ProgramFormValues, Program>(`programs/update.php/${selectedProgramForEdit.id}`, values);
        toast({ title: "Program Updated", description: `${values.name} updated successfully.` });
        logActivity("Updated Program", values.name, "Admin", values.id, "program");
      } else {
        savedProgram = await postData<ProgramFormValues, Program>('programs/create.php', values);
        toast({ title: "Program Added", description: `${savedProgram.name} added successfully.` });
        logActivity("Added Program", savedProgram.name, "Admin", savedProgram.id, "program");
      }
      setIsProgramModalOpen(false);
      await loadData(); // Refresh data
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save program." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!isCurrentUserSuperAdmin) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can delete programs." });
      return;
    }
    setIsSubmitting(true);
    try {
      await deleteData(`programs/delete.php/${programId}`);
      toast({ title: "Program Deleted", description: "Program and its course assignments removed." });
      logActivity("Deleted Program", `ID: ${programId}`, "Admin", programId, "program");
      await loadData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete program." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Course Modal Handlers
  const handleOpenCourseModal = (course?: Course) => {
    if (!isCurrentUserSuperAdmin) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can manage courses." });
      return;
    }
    if (course) {
      setSelectedCourse(course);
      setIsEditCourseMode(true);
      const programIdArray = Array.isArray(course.programId) ? course.programId : (course.programId ? [String(course.programId)] : []);
      courseForm.reset({...course, programId: programIdArray });
    } else {
      setSelectedCourse(null);
      setIsEditCourseMode(false);
      courseForm.reset({ id: "", name: "", description: "", type: "Minor", programId: []});
    }
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (values: CourseFormValues) => {
     if (!isCurrentUserSuperAdmin) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can save courses." });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...values, programId: values.type === 'Major' ? (values.programId || []) : [] };
      let savedCourse: Course;
      if (isEditCourseMode && selectedCourse) {
        savedCourse = await putData<typeof payload, Course>(`courses/update.php/${selectedCourse.id}`, payload);
        toast({ title: "Course Updated", description: `${values.name} updated successfully.` });
        logActivity("Updated Course", values.name, "Admin", values.id, "course");
      } else {
        savedCourse = await postData<typeof payload, Course>('courses/create.php', payload);
        toast({ title: "Course Added", description: `${savedCourse.name} added to system courses.` });
        logActivity("Added Course", savedCourse.name, "Admin", savedCourse.id, "course");
      }
      setIsCourseModalOpen(false);
      await loadData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save course." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
     if (!isCurrentUserSuperAdmin) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can delete courses." });
      return;
    }
    setIsSubmitting(true);
    try {
      await deleteData(`courses/delete.php/${courseId}`);
      toast({ title: "Course Deleted", description: "Course removed from system and all program assignments." });
      logActivity("Deleted Course", `ID: ${courseId}`, "Admin", courseId, "course");
      await loadData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete course." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign Courses to Program Modal Handlers
  const handleOpenAssignCoursesModal = (program: Program, year: YearLevel) => {
     if (!isCurrentUserSuperAdmin) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can assign courses." });
      return;
    }
    setSelectedProgramForCourseAssignment(program);
    setSelectedYearForCourseAssignment(year);
    const currentCourseIds = program.courses[year]?.map(c => c.id) || [];
    assignCoursesToProgramForm.reset({
      programId: program.id,
      yearLevel: year,
      courseIds: currentCourseIds,
    });
    setIsAssignCoursesModalOpen(true);
  };

  const handleAssignCoursesToProgramSubmit = async (values: AssignCoursesToProgramFormValues) => {
    if (!selectedProgramForCourseAssignment || !selectedYearForCourseAssignment) return;
     if (!isCurrentUserSuperAdmin) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can assign courses." });
      return;
    }
    setIsSubmitting(true);
    try {
      const programToUpdate = programs.find(p => p.id === values.programId);
      if (!programToUpdate) throw new Error("Program not found.");

      const updatedProgram: Program = {
        ...programToUpdate,
        courses: {
          ...programToUpdate.courses,
          [values.yearLevel]: allCourses.filter(course => values.courseIds.includes(course.id))
        }
      };

      await putData<Program, Program>(`programs/update.php/${values.programId}`, updatedProgram);
      toast({ title: "Courses Updated", description: `Courses for ${programToUpdate.name} - ${values.yearLevel} updated.` });
      logActivity("Updated Program Courses", `${programToUpdate.name} - ${values.yearLevel}`, "Admin", values.programId, "program");
      setIsAssignCoursesModalOpen(false);
      await loadData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to assign courses." });
    } finally {
      setIsSubmitting(false);
    }
  };


  const programColumns: ColumnDef<Program>[] = React.useMemo(() => [
    { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="ID" /> },
    { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Program Name" /> },
    { accessorKey: "description", header: "Description", cell: ({ row }) => <p className="truncate max-w-xs">{row.original.description || "-"}</p> },
    {
      id: "actions",
      cell: ({ row }) => {
        const program = row.original;
        return isCurrentUserSuperAdmin ? (
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleOpenProgramModal(program)}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Program Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            disabled={isSubmitting}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Program
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Program?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will delete "{program.name}" and all its major course assignments. Minor courses assigned will remain in other programs. Are you sure?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProgram(program.id)} disabled={isSubmitting} className={buttonVariants({variant: "destructive"})}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
           </DropdownMenu>
        ) : <span className="text-xs text-muted-foreground italic">N/A</span>;
      },
    },
  ], [isSubmitting, programs, isCurrentUserSuperAdmin]);


  const courseColumns: ColumnDef<Course>[] = React.useMemo(() => [
    { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="Course ID" /> },
    { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Course Name" /> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant={row.original.type === "Major" ? "default" : "secondary"}>{row.original.type}</Badge> },
    { accessorKey: "programId", header: "Assigned Program(s) (Majors)", cell: ({ row }) => {
        if (row.original.type === 'Major') {
            if (row.original.programId && row.original.programId.length > 0) {
                return row.original.programId.map(pid => programs.find(p => p.id === pid)?.id || pid).join(', ');
            }
            return <AlertCircle className="h-4 w-4 text-destructive" titleAccess="Major course needs program ID(s)" />;
        }
        return <span className="text-muted-foreground">-</span>;
      }
    },
    { accessorKey: "description", header: "Description", cell: ({ row }) => <p className="truncate max-w-xs">{row.original.description || "-"}</p> },
    {
      id: "actions",
      cell: ({ row }) => {
        const course = row.original;
        return isCurrentUserSuperAdmin ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleOpenCourseModal(course)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                disabled={isSubmitting}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete Course?</AlertDialogTitle><AlertDialogDescription>This will delete "{course.name}" from the system and all program assignments. Are you sure?</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCourse(course.id)} disabled={isSubmitting} className={buttonVariants({variant: "destructive"})}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        ) : <span className="text-xs text-muted-foreground italic">N/A</span>;
      },
    },
  ], [isSubmitting, programs, isCurrentUserSuperAdmin]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Programs & Courses</h1>
        {isCurrentUserSuperAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => handleOpenProgramModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Program</Button>
            <Button variant="outline" onClick={() => handleOpenCourseModal()}><PackagePlus className="mr-2 h-4 w-4" /> Add System Course</Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center"><Library className="mr-3 h-6 w-6 text-primary" /> Academic Programs</CardTitle>
                 <CardDescription>Manage academic programs offered. Courses are assigned per year level.</CardDescription>
            </CardHeader>
            <CardContent>
              {programs.length > 0 ? (
                <Accordion type="multiple" className="w-full space-y-3">
                  {programs.map(program => (
                    <AccordionItem value={program.id} key={program.id} className="border rounded-lg shadow-sm">
                      <AccordionTrigger className="text-xl font-semibold hover:bg-accent/50 p-4 rounded-t-md">
                        <div className="flex items-center justify-between w-full">
                          <span>{program.name} ({program.id})</span>
                           {isCurrentUserSuperAdmin && (
                            <div className="flex gap-2 items-center">
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenProgramModal(program); }} className="h-7 px-2 py-1 text-xs hover:bg-primary/10">
                                    <Edit3 className="mr-1 h-3 w-3" /> Edit Program
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation();}} className="h-7 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive">
                                            <Trash2 className="mr-1 h-3 w-3" /> Delete Program
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Program "{program.name}"?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone and will remove all associated course assignments.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteProgram(program.id)} className={buttonVariants({variant: "destructive"})} disabled={isSubmitting}>
                                                {isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin"/>}Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                           )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 border-t">
                        <p className="text-sm text-muted-foreground mb-3">{program.description || "No description."}</p>
                        <div className="space-y-3">
                          {yearLevels.map(year => {
                            const coursesForYear = program.courses[year] || [];
                            return (
                              <div key={year} className="border p-3 rounded-md bg-secondary/30">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium text-primary">{year} Courses ({coursesForYear.length})</h4>
                                   {isCurrentUserSuperAdmin && (
                                    <Button variant="outline" size="sm" onClick={() => handleOpenAssignCoursesModal(program, year)} className="h-7 px-2 py-1 text-xs">
                                      <Settings className="mr-1 h-3 w-3" /> Assign Courses
                                    </Button>
                                   )}
                                </div>
                                {coursesForYear.length > 0 ? (
                                  <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                                    {coursesForYear.map(course => (
                                      <li key={course.id} className="flex justify-between items-center group">
                                        <span>{course.name} ({course.id}) - <Badge variant={course.type === 'Major' ? 'default' : 'secondary'} className="text-xs">{course.type}</Badge></span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">No courses assigned for this year.</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground text-center py-4">No programs found. Add a program to get started.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center"><BookOpen className="mr-3 h-6 w-6 text-primary" /> System Courses (Subjects)</CardTitle>
                <CardDescription>Manage all available courses in the system. Assign them to programs above.</CardDescription>
            </CardHeader>
            <CardContent>
              {allCourses.length > 0 ? (
                <DataTable columns={courseColumns} data={allCourses} searchPlaceholder="Search courses by ID or name..." />
              ) : (
                <p className="text-muted-foreground text-center py-4">No system courses found. Add courses to assign them to programs.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Program Modal */}
      <Dialog open={isProgramModalOpen} onOpenChange={setIsProgramModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditProgramMode ? "Edit Program" : "Add New Program"}</DialogTitle>
            <DialogDescription>{isEditProgramMode ? "Update the program details." : "Enter details for the new program."}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1 pr-4">
            <Form {...programForm}>
                <form onSubmit={programForm.handleSubmit(handleSaveProgram)} className="space-y-4 py-4">
                <FormField control={programForm.control} name="id" render={({ field }) => (<FormItem><FormLabel>Program ID (e.g., CS, IT)</FormLabel><FormControl><Input placeholder="Unique Program ID" {...field} disabled={isEditProgramMode || isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={programForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Program Name</FormLabel><FormControl><Input placeholder="e.g., Bachelor of Science in Computer Science" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={programForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Brief description of the program" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                {/* Initial courses can be added via "Assign Courses" button after creation for better UX */}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsProgramModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditProgramMode ? "Save Changes" : "Add Program"}</Button>
                </DialogFooter>
                </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Course Modal */}
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditCourseMode ? "Edit Course" : "Add New System Course"}</DialogTitle>
            <DialogDescription>{isEditCourseMode ? "Update the course details." : "Enter details for a new course."}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1 pr-4">
            <Form {...courseForm}>
                <form onSubmit={courseForm.handleSubmit(handleSaveCourse)} className="space-y-4 py-4">
                <FormField control={courseForm.control} name="id" render={({ field }) => (<FormItem><FormLabel>Course ID (e.g., CS101, GEN001)</FormLabel><FormControl><Input placeholder="Unique Course ID" {...field} disabled={isEditCourseMode || isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={courseForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Course Name</FormLabel><FormControl><Input placeholder="e.g., Introduction to Programming" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={courseForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Brief description of the course" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                <FormField
                    control={courseForm.control}
                    name="type"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Course Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={(isEditCourseMode && !!selectedCourse?.programId && selectedCourse.programId.length > 0) || isSubmitting}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select course type" /></SelectTrigger></FormControl>
                        <SelectContent>{courseTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Controller
                    control={courseForm.control}
                    name="programId"
                    render={({ field, fieldState }) => (
                        <FormItem style={{ display: courseForm.watch("type") === 'Major' ? 'block' : 'none' }}>
                            <FormLabel>Assign to Program(s) (Required for Major)</FormLabel>
                            <ScrollArea className="max-h-32 overflow-y-auto border p-2 rounded-md">
                                <div className="space-y-2">
                                    {programs.map(p => (
                                        <FormField
                                            key={p.id}
                                            control={courseForm.control}
                                            name="programId"
                                            render={() => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={(field.value || []).includes(p.id)}
                                                            onCheckedChange={(checked) => {
                                                                const currentProgramIds = field.value || [];
                                                                if (checked) {
                                                                    field.onChange([...currentProgramIds, p.id]);
                                                                } else {
                                                                    field.onChange(currentProgramIds.filter((id) => id !== p.id));
                                                                }
                                                            }}
                                                            disabled={isSubmitting}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-sm">{p.name} ({p.id})</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                     {programs.length === 0 && <p className="text-xs text-muted-foreground">No programs available. Add programs first to assign major courses.</p>}
                                </div>
                            </ScrollArea>
                            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                            <p className="text-xs text-muted-foreground">A Major course must be assigned to at least one program.</p>
                        </FormItem>
                    )}
                    />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCourseModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditCourseMode ? "Save Changes" : "Add Course"}</Button>
                </DialogFooter>
                </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

        {/* Assign Courses to Program/Year Modal */}
        <Dialog open={isAssignCoursesModalOpen} onOpenChange={setIsAssignCoursesModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Assign Courses to {selectedProgramForCourseAssignment?.name} - {selectedYearForCourseAssignment}</DialogTitle>
                    <DialogDescription>Select courses for this program and year level. Only unassigned or minor courses are shown.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] p-1 pr-4">
                    <Form {...assignCoursesToProgramForm}>
                        <form onSubmit={assignCoursesToProgramForm.handleSubmit(handleAssignCoursesToProgramSubmit)} className="space-y-4 py-4">
                             <FormField
                                control={assignCoursesToProgramForm.control}
                                name="courseIds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Available Courses</FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                            Select courses to assign. Major courses specific to other programs or courses already assigned to different year levels in *this* program are not listed.
                                        </p>
                                        <ScrollArea className="h-60 w-full rounded-md border p-4 mt-2">
                                            <div className="space-y-2">
                                                {allCourses
                                                    .filter(course => {
                                                        // Filter 1: Exclude Major courses not belonging to the selected program
                                                        if (course.type === 'Major' && selectedProgramForCourseAssignment && (!course.programId || !course.programId.includes(selectedProgramForCourseAssignment.id))) {
                                                            return false;
                                                        }
                                                        // Filter 2: Exclude courses already assigned to a *different* year level *within this program*
                                                        if (selectedProgramForCourseAssignment) {
                                                            for (const yearKey in selectedProgramForCourseAssignment.courses) {
                                                                if (yearKey as YearLevel !== selectedYearForCourseAssignment) {
                                                                    if (selectedProgramForCourseAssignment.courses[yearKey as YearLevel].some(c => c.id === course.id)) {
                                                                        return false;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        return true;
                                                    })
                                                    .map(course => (
                                                        <FormField
                                                            key={course.id}
                                                            control={assignCoursesToProgramForm.control}
                                                            name="courseIds"
                                                            render={() => (
                                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={field.value?.includes(course.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                field.onChange(
                                                                                    checked
                                                                                        ? [...(field.value || []), course.id]
                                                                                        : (field.value || []).filter(id => id !== course.id)
                                                                                );
                                                                            }}
                                                                            disabled={isSubmitting}
                                                                        />
                                                                    </FormControl>
                                                                    <Label className="font-normal text-sm cursor-pointer flex-1">
                                                                        {course.name} ({course.id}) <Badge variant={course.type === 'Major' ? 'default' : 'secondary'} className="ml-1 text-xs">{course.type}</Badge>
                                                                    </Label>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                {allCourses.filter(course => {
                                                    if (course.type === 'Major' && selectedProgramForCourseAssignment && (!course.programId || !course.programId.includes(selectedProgramForCourseAssignment.id))) return false;
                                                    if (selectedProgramForCourseAssignment) {
                                                        for (const yearKey in selectedProgramForCourseAssignment.courses) {
                                                            if (yearKey as YearLevel !== selectedYearForCourseAssignment) {
                                                                if (selectedProgramForCourseAssignment.courses[yearKey as YearLevel].some(c => c.id === course.id)) return false;
                                                            }
                                                        }
                                                    }
                                                    return true;
                                                }).length === 0 && <p className="text-sm text-muted-foreground text-center">No eligible courses to assign.</p>}
                                            </div>
                                        </ScrollArea>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAssignCoursesModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Course Assignments
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
