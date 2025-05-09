
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2, Loader2, BookOpen, ChevronDown, ChevronRight, Library, PackagePlus, XCircle, Edit3, AlertCircle } from "lucide-react";
import { z } from "zod";

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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { programSchema, courseSchema } from "@/lib/schemas"; // Import schemas
import type { Program, Course, CourseType, YearLevel } from "@/types"; // Updated types
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchData, postData, putData, deleteData } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";


type ProgramFormValues = z.infer<typeof programSchema>;
type CourseFormValues = z.infer<typeof courseSchema>;

const yearLevels: YearLevel[] = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const courseTypes: CourseType[] = ["Major", "Minor"];

export default function ProgramsCoursesPage() {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [allCourses, setAllCourses] = React.useState<Course[]>([]); // For global course management
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  // Modal States
  const [isProgramModalOpen, setIsProgramModalOpen] = React.useState(false);
  const [isEditProgramMode, setIsEditProgramMode] = React.useState(false);
  const [selectedProgram, setSelectedProgram] = React.useState<Program | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = React.useState(false);
  const [isEditCourseMode, setIsEditCourseMode] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [courseModalContext, setCourseModalContext] = React.useState<{ programId?: string; yearLevel?: YearLevel } | null>(null);


  const programForm = useForm<ProgramFormValues>({ resolver: zodResolver(programSchema) });
  const courseForm = useForm<CourseFormValues>({ resolver: zodResolver(courseSchema) });
  const addCourseToProgramForm = useForm<{ courseId: string; yearLevel: YearLevel }>({ resolver: zodResolver(z.object({ courseId: z.string().min(1, "Please select a course."), yearLevel: z.enum(yearLevels) })) });


  // Fetch initial data
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [programsData, coursesData] = await Promise.all([
        fetchData<Program[]>('programs/read.php'),
        fetchData<Course[]>('courses/read.php')
      ]);
      setPrograms(programsData || []);
      setAllCourses(coursesData || []);
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


  // Program Handlers
  const handleOpenProgramModal = (program?: Program) => {
    if (program) {
      setSelectedProgram(program);
      setIsEditProgramMode(true);
      programForm.reset(program);
    } else {
      setSelectedProgram(null);
      setIsEditProgramMode(false);
      programForm.reset({ id: "", name: "", description: "", courses: { "1st Year": [], "2nd Year": [], "3rd Year": [], "4th Year": [] } });
    }
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (values: ProgramFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditProgramMode && selectedProgram) {
        const updatedProgram = await putData<ProgramFormValues, Program>(`programs/update.php/${selectedProgram.id}`, values);
        setPrograms(prev => prev.map(p => p.id === updatedProgram.id ? updatedProgram : p));
        toast({ title: "Program Updated", description: `${updatedProgram.name} updated successfully.` });
      } else {
        const newProgram = await postData<ProgramFormValues, Program>('programs/create.php', values);
        setPrograms(prev => [...prev, newProgram]);
        toast({ title: "Program Added", description: `${newProgram.name} added successfully.` });
      }
      setIsProgramModalOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save program." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    setIsSubmitting(true);
    try {
      await deleteData(`programs/delete.php/${programId}`);
      setPrograms(prev => prev.filter(p => p.id !== programId));
      toast({ title: "Program Deleted", description: "Program and its major course assignments removed." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete program." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Course Handlers (Global Courses)
  const handleOpenCourseModal = (course?: Course, context?: { programId?: string; yearLevel?: YearLevel }) => {
    setCourseModalContext(context || null);
    if (course) {
      setSelectedCourse(course);
      setIsEditCourseMode(true);
      courseForm.reset(course);
    } else {
      setSelectedCourse(null);
      setIsEditCourseMode(false);
      courseForm.reset({ id: "", name: "", description: "", type: "Minor", programId: context?.programId || "" });
    }
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (values: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      let savedCourse: Course;
      if (isEditCourseMode && selectedCourse) {
        savedCourse = await putData<CourseFormValues, Course>(`courses/update.php/${selectedCourse.id}`, values);
        setAllCourses(prev => prev.map(c => c.id === savedCourse.id ? savedCourse : c));
        // Also update in programs if it was assigned
        setPrograms(prevProgs => prevProgs.map(prog => ({
            ...prog,
            courses: Object.fromEntries(
                Object.entries(prog.courses).map(([year, courses]) => [
                    year,
                    courses.map(c => c.id === savedCourse.id ? savedCourse : c)
                ])
            ) as Program['courses']
        })));
        toast({ title: "Course Updated", description: `${savedCourse.name} updated successfully.` });
      } else {
        // When creating a new course globally, if it's Major, ensure programId is set.
        // If creating directly from "Add Course to Program" year level, programId is pre-filled.
        savedCourse = await postData<CourseFormValues, Course>('courses/create.php', values);
        setAllCourses(prev => [...prev, savedCourse]);
        toast({ title: "Course Added", description: `${savedCourse.name} added to system courses.` });

        // If this modal was opened from a specific program/year context, try to assign it directly
        if (courseModalContext?.programId && courseModalContext?.yearLevel) {
            await handleAssignCourseToProgram(courseModalContext.programId, savedCourse.id, courseModalContext.yearLevel);
        }
      }
      setIsCourseModalOpen(false);
      setCourseModalContext(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save course." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    setIsSubmitting(true);
    try {
      await deleteData(`courses/delete.php/${courseId}`);
      setAllCourses(prev => prev.filter(c => c.id !== courseId));
      // Remove from all program assignments
      setPrograms(prevProgs => prevProgs.map(prog => ({
          ...prog,
          courses: Object.fromEntries(
              Object.entries(prog.courses).map(([year, courses]) => [
                  year,
                  courses.filter(c => c.id !== courseId)
              ])
          ) as Program['courses']
      })));
      toast({ title: "Course Deleted", description: "Course removed from system and all program assignments." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete course." });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Assign/Remove Course To/From Program Year Level
  const handleAssignCourseToProgram = async (programId: string, courseId: string, yearLevel: YearLevel) => {
    setIsSubmitting(true);
    try {
      const updatedProgram = await postData<any, Program>(`programs/${programId}/courses/assign`, { courseId, yearLevel });
      setPrograms(prev => prev.map(p => p.id === updatedProgram.id ? updatedProgram : p));
      toast({ title: "Course Assigned", description: `Course assigned to ${programId} - ${yearLevel}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to assign course." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCourseFromProgram = async (programId: string, courseId: string, yearLevel: YearLevel) => {
    setIsSubmitting(true);
    try {
      // The API endpoint includes the yearLevel for specificity, adjust if your backend is different
      await deleteData(`programs/${programId}/courses/remove/${yearLevel}/${courseId}`);
      setPrograms(prev => prev.map(p => {
        if (p.id === programId) {
          const updatedCourses = { ...p.courses };
          updatedCourses[yearLevel] = updatedCourses[yearLevel].filter(c => c.id !== courseId);
          return { ...p, courses: updatedCourses };
        }
        return p;
      }));
      toast({ title: "Course Removed", description: `Course removed from ${programId} - ${yearLevel}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to remove course." });
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
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenProgramModal(program)}><Edit3 className="mr-2 h-4 w-4" />Edit</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isSubmitting}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete Program?</AlertDialogTitle><AlertDialogDescription>This will delete "{program.name}" and all its major course assignments. Minor courses assigned will remain in other programs. Are you sure?</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteProgram(program.id)} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ], [isSubmitting]);


  const courseColumns: ColumnDef<Course>[] = React.useMemo(() => [
    { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="Course ID" /> },
    { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Course Name" /> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant={row.original.type === "Major" ? "default" : "secondary"}>{row.original.type}</Badge> },
    { accessorKey: "programId", header: "Program (Majors)", cell: ({ row }) => row.original.programId || <span className="text-muted-foreground">-</span> },
    { accessorKey: "description", header: "Description", cell: ({ row }) => <p className="truncate max-w-xs">{row.original.description || "-"}</p> },
    {
      id: "actions",
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={() => handleOpenCourseModal(course)}><Edit3 className="mr-2 h-4 w-4" />Edit</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isSubmitting}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete Course?</AlertDialogTitle><AlertDialogDescription>This will delete "{course.name}" from the system and all program assignments. Are you sure?</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteCourse(course.id)} disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ], [isSubmitting]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Programs & Courses</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleOpenProgramModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Program</Button>
          <Button variant="outline" onClick={() => handleOpenCourseModal()}><PackagePlus className="mr-2 h-4 w-4" /> Add Global Course</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-8">
          {/* Programs List */}
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-4 flex items-center"><Library className="mr-2 h-6 w-6 text-primary" /> Academic Programs</h2>
            {programs.length > 0 ? (
              <DataTable columns={programColumns} data={programs} searchColumnId="name" searchPlaceholder="Search programs..." />
            ) : (
              <p className="text-muted-foreground">No programs found. Add a program to get started.</p>
            )}
          </div>

          {/* Global Courses List */}
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-4 flex items-center"><BookOpen className="mr-2 h-6 w-6 text-primary" /> System Courses (Subjects)</h2>
            {allCourses.length > 0 ? (
              <DataTable columns={courseColumns} data={allCourses} searchColumnId="name" searchPlaceholder="Search courses..." />
            ) : (
              <p className="text-muted-foreground">No global courses found. Add courses to assign them to programs.</p>
            )}
          </div>


           {/* Program Details & Course Assignment */}
          {programs.map(program => (
            <Accordion key={program.id} type="single" collapsible className="w-full border rounded-lg p-4 shadow-md">
              <AccordionItem value={program.id}>
                <AccordionTrigger className="text-xl font-semibold hover:bg-accent/50 p-3 rounded-md">
                  <div className="flex items-center justify-between w-full">
                    <span>{program.name} ({program.id})</span>
                     <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleOpenProgramModal(program); }}
                            className="text-xs"
                        >
                            <Edit3 className="mr-1 h-3 w-3" /> Edit Program
                        </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  <p className="text-sm text-muted-foreground">{program.description || "No description."}</p>
                  <div className="space-y-3">
                    {yearLevels.map(year => {
                      const assignedCourses = program.courses?.[year] || [];
                      const availableCoursesForAssignment = allCourses.filter(course => {
                        // Rule 1: Not already assigned to this year level in this program
                        if (assignedCourses.some(ac => ac.id === course.id)) return false;
                        // Rule 2: If Major, programId must match or be unassigned (for new Majors to this program)
                        if (course.type === 'Major' && course.programId && course.programId !== program.id) return false;
                        return true;
                      });

                      return (
                        <div key={year} className="border p-3 rounded-md bg-background shadow-sm">
                          <h4 className="font-medium text-md mb-2 flex items-center justify-between">
                            {year} Courses
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/10">
                                        <PlusCircle className="mr-1 h-3 w-3" /> Assign/Add Course
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Assign/Add Course to {program.name} - {year}</DialogTitle>
                                        <DialogDescription>Select an existing course or create a new one for this year level.</DialogDescription>
                                    </DialogHeader>
                                    <Form {...addCourseToProgramForm}>
                                    <form onSubmit={addCourseToProgramForm.handleSubmit(data => handleAssignCourseToProgram(program.id, data.courseId, year))} className="space-y-3 py-2">
                                        <FormField
                                            control={addCourseToProgramForm.control}
                                            name="courseId"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Select Existing Course</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Choose a course..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {availableCoursesForAssignment.length > 0 ?
                                                            availableCoursesForAssignment.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.id}) - <Badge variant={c.type === 'Major' ? 'default' : 'secondary'}>{c.type}</Badge></SelectItem>) :
                                                            <SelectItem value="none" disabled>No suitable courses available</SelectItem>
                                                        }
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" disabled={isSubmitting || availableCoursesForAssignment.length === 0}>Assign Selected Course</Button>
                                    </form>
                                    </Form>
                                    <div className="my-2 text-center text-sm text-muted-foreground">OR</div>
                                    <Button variant="outline" className="w-full" onClick={() => handleOpenCourseModal(undefined, { programId: program.id, yearLevel: year })}>
                                        <PackagePlus className="mr-2 h-4 w-4" /> Create New Course for this Program/Year
                                    </Button>
                                </DialogContent>
                            </Dialog>
                          </h4>
                          {assignedCourses.length > 0 ? (
                            <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                              {assignedCourses.map(course => (
                                <li key={course.id} className="flex justify-between items-center p-1.5 rounded hover:bg-muted/50">
                                  <span>{course.name} ({course.id}) - <Badge variant={course.type === 'Major' ? 'default' : 'secondary'} className="text-xs">{course.type}</Badge></span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive/70 hover:text-destructive"
                                    onClick={() => handleRemoveCourseFromProgram(program.id, course.id, year)}
                                    disabled={isSubmitting}
                                    aria-label={`Remove ${course.name}`}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-muted-foreground">No courses assigned for this year.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      )}

      {/* Program Add/Edit Modal */}
      <Dialog open={isProgramModalOpen} onOpenChange={setIsProgramModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditProgramMode ? "Edit Program" : "Add New Program"}</DialogTitle>
            <DialogDescription>{isEditProgramMode ? "Update the program details." : "Enter details for the new program."}</DialogDescription>
          </DialogHeader>
          <Form {...programForm}>
            <form onSubmit={programForm.handleSubmit(handleSaveProgram)} className="space-y-4 py-4">
              <FormField control={programForm.control} name="id" render={({ field }) => (<FormItem><FormLabel>Program ID (e.g., CS, IT)</FormLabel><FormControl><Input placeholder="Unique Program ID" {...field} disabled={isEditProgramMode} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={programForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Program Name</FormLabel><FormControl><Input placeholder="e.g., Bachelor of Science in Computer Science" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={programForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Brief description of the program" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsProgramModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditProgramMode ? "Save Changes" : "Add Program"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Course Add/Edit Modal (Global Courses) */}
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditCourseMode ? "Edit Course" : "Add New Global Course"}</DialogTitle>
            <DialogDescription>{isEditCourseMode ? "Update the course details." : "Enter details for a new system-wide course."}</DialogDescription>
          </DialogHeader>
          <Form {...courseForm}>
            <form onSubmit={courseForm.handleSubmit(handleSaveCourse)} className="space-y-4 py-4">
              <FormField control={courseForm.control} name="id" render={({ field }) => (<FormItem><FormLabel>Course ID (e.g., CS101, GEN001)</FormLabel><FormControl><Input placeholder="Unique Course ID" {...field} disabled={isEditCourseMode} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={courseForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Course Name</FormLabel><FormControl><Input placeholder="e.g., Introduction to Programming" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={courseForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Brief description of the course" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField
                control={courseForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={courseModalContext?.programId && isEditCourseMode && selectedCourse?.programId === courseModalContext.programId /* Prevent changing type if it's a major linked to context program */}>
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
                  render={({ field }) => (
                    <FormField
                        name="programId" // Keep the name for react-hook-form
                        render={() => ( // We use render directly to access watched value
                             <FormItem style={{ display: courseForm.watch("type") === 'Major' ? 'block' : 'none' }}>
                                <FormLabel>Assign to Program (if Major)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isEditCourseMode && !!selectedCourse?.programId /* Lock program if already set for a major */}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select program for this Major course" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.id})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                  )}
                />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {setIsCourseModalOpen(false); setCourseModalContext(null);}} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditCourseMode ? "Save Changes" : "Add Course"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
