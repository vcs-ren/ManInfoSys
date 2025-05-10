
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2, Loader2, BookOpen, Library, PackagePlus, XCircle, Edit3, AlertCircle, MoreHorizontal } from "lucide-react";
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
import { programSchema, courseSchema } from "@/lib/schemas";
import type { Program, Course, CourseType, YearLevel } from "@/types";
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
import { fetchData, postData, putData, deleteData, USE_MOCK_API, mockApiPrograms, mockCourses } from "@/lib/api";
import { cn } from "@/lib/utils";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Accordion removed
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";


type ProgramFormValues = z.infer<typeof programSchema>;
type CourseFormValues = z.infer<typeof courseSchema>;

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
  const [selectedProgram, setSelectedProgram] = React.useState<Program | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = React.useState(false);
  const [isEditCourseMode, setIsEditCourseMode] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);


  const programForm = useForm<ProgramFormValues>({ resolver: zodResolver(programSchema) });
  const courseForm = useForm<CourseFormValues>({ resolver: zodResolver(courseSchema), defaultValues: { programId: [] } });


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
        await putData<ProgramFormValues, Program>(`programs/update.php/${selectedProgram.id}`, values);
        toast({ title: "Program Updated", description: `${values.name} updated successfully.` });
      } else {
        const savedProgram = await postData<ProgramFormValues, Program>('programs/create.php', values);
        toast({ title: "Program Added", description: `${savedProgram.name} added successfully.` });
      }
      setIsProgramModalOpen(false);
      await loadData();
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
      toast({ title: "Program Deleted", description: "Program and its major course assignments removed." });
      await loadData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete program." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCourseModal = (course?: Course) => {
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
    setIsSubmitting(true);
    try {
      const payload = { ...values, programId: values.type === 'Major' ? (values.programId || []) : [] };

      if (isEditCourseMode && selectedCourse) {
        await putData<typeof payload, Course>(`courses/update.php/${selectedCourse.id}`, payload);
        toast({ title: "Course Updated", description: `${values.name} updated successfully.` });
      } else {
        const savedCourse = await postData<typeof payload, Course>('courses/create.php', payload);
        toast({ title: "Course Added", description: `${savedCourse.name} added to system courses.` });
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
    setIsSubmitting(true);
    try {
      await deleteData(`courses/delete.php/${courseId}`);
      toast({ title: "Course Deleted", description: "Course removed from system and all program assignments." });
      await loadData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete course." });
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
        );
      },
    },
  ], [isSubmitting, programs]);


  const courseColumns: ColumnDef<Course>[] = React.useMemo(() => [
    { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="Course ID" /> },
    { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Course Name" /> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant={row.original.type === "Major" ? "default" : "secondary"}>{row.original.type}</Badge> },
    { accessorKey: "programId", header: "Assigned Program(s) (Majors)", cell: ({ row }) => {
        if (row.original.type === 'Major') {
            if (row.original.programId && row.original.programId.length > 0) {
                return row.original.programId.map(pid => programs.find(p => p.id === pid)?.name || pid).join(', ');
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
        return (
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
        );
      },
    },
  ], [isSubmitting, programs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Programs & Courses</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleOpenProgramModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Program</Button>
          <Button variant="outline" onClick={() => handleOpenCourseModal()}><PackagePlus className="mr-2 h-4 w-4" /> Add System Course</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-8">
          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-4 flex items-center"><Library className="mr-2 h-6 w-6 text-primary" /> Academic Programs</h2>
            {programs.length > 0 ? (
              <DataTable columns={programColumns} data={programs} searchColumnId="name" searchPlaceholder="Search programs..." />
            ) : (
              <p className="text-muted-foreground">No programs found. Add a program to get started.</p>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-semibold mb-4 flex items-center"><BookOpen className="mr-2 h-6 w-6 text-primary" /> System Courses (Subjects)</h2>
            {allCourses.length > 0 ? (
              <DataTable columns={courseColumns} data={allCourses} searchColumnId="name" searchPlaceholder="Search courses..." />
            ) : (
              <p className="text-muted-foreground">No system courses found. Add courses to assign them to programs.</p>
            )}
          </div>
        </div>
      )}

      <Dialog open={isProgramModalOpen} onOpenChange={setIsProgramModalOpen}>
        <DialogContent>
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
                {!isEditProgramMode && (
                    <div className="space-y-2 border-t pt-4">
                        <Label className="text-sm font-medium">Initial Courses (Optional)</Label>
                        <p className="text-xs text-muted-foreground">You can add more courses per year level after creating the program.</p>
                    </div>
                )}
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsProgramModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditProgramMode ? "Save Changes" : "Add Program"}</Button>
                </DialogFooter>
                </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isCourseModalOpen} onOpenChange={(open) => { setIsCourseModalOpen(open);}}>
        <DialogContent>
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
                                </div>
                            </ScrollArea>
                            {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
                            <p className="text-xs text-muted-foreground">A Major course must be assigned to at least one program.</p>
                        </FormItem>
                    )}
                    />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {setIsCourseModalOpen(false);}} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditCourseMode ? "Save Changes" : "Add Course"}</Button>
                </DialogFooter>
                </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
