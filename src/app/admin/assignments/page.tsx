"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, Megaphone, BookOpen, Loader2, CalendarX, Settings2, Filter, Users, Briefcase, PlusCircle, Eye } from "lucide-react"; // Added Eye

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import type { Section, Faculty, Announcement, Subject, SectionSubjectAssignment, Program as ProgramType, YearLevel, Course } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assignAdviserSchema, announcementSchema, assignCoursesToProgramSchema, sectionSchema } from "@/lib/schemas"; // Added assignCoursesToProgramSchema
import { format } from 'date-fns';
import { z } from 'zod';
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
import { fetchData, postData, deleteData, putData, USE_MOCK_API, mockApiPrograms, mockCourses, mockFaculty, mockSections, mockAnnouncements, logActivity } from "@/lib/api"; // Added putData
import Link from "next/link";
import { useRouter } from 'next/navigation'; // Import useRouter
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";


type AssignAdviserFormValues = z.infer<typeof assignAdviserSchema>;
type AnnouncementFormValues = z.infer<typeof announcementSchema>;
type AssignCoursesToProgramFormValues = z.infer<typeof assignCoursesToProgramSchema>;

const yearLevelOptions: { value: YearLevel; label: string }[] = ["1st Year", "2nd Year", "3rd Year", "4th Year"].map(y => ({ value: y, label: y }));
const announcementAudienceOptions = [
    { value: 'All', label: 'All Users' },
    { value: 'Student', label: 'Students Only' },
    { value: 'Faculty', label: 'Faculty Only' },
];

// Helper to get distinct values for filtering
const getDistinctValues = (data: any[], key: string): { value: string; label: string }[] => {
    if (!data) return [];
    const distinct = [...new Set(data.map(item => item[key]).filter(Boolean))];
    return distinct.map(value => ({ value, label: value }));
}

export default function ScheduleAnnouncementsPage() {
  const [sections, setSections] = React.useState<Section[]>([]);
  const [faculty, setFaculty] = React.useState<Faculty[]>([]);
  const [subjects, setSubjects] = React.useState<Course[]>([]);
  const [programsList, setProgramsList] = React.useState<ProgramType[]>([]);
  const [allCourses, setAllCourses] = React.useState<Course[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = React.useState(false);
  const [isAssignProgramCoursesModalOpen, setIsAssignProgramCoursesModalOpen] = React.useState(false); // New state for assign courses modal

  const [selectedSection, setSelectedSection] = React.useState<Section | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  const assignAdviserForm = useForm<AssignAdviserFormValues>({
    resolver: zodResolver(assignAdviserSchema),
    defaultValues: { adviserId: 0 },
  });

  const announcementForm = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      targetAudience: "All",
      targetProgramId: "all",
      targetYearLevel: "all",
      targetSection: "all",
    },
  });

  const watchedTargetAudience = useWatch({
    control: announcementForm.control,
    name: 'targetAudience',
    defaultValue: "All"
  });

  // Form for assigning courses to program/year
  const assignProgramCoursesForm = useForm<AssignCoursesToProgramFormValues>({
    resolver: zodResolver(assignCoursesToProgramSchema),
    defaultValues: {
      programId: "",
      yearLevel: "1st Year",
      courseIds: [],
    },
  });

  const watchedProgramIdForCourseAssignment = useWatch({
    control: assignProgramCoursesForm.control,
    name: 'programId',
  });
  const watchedYearLevelForCourseAssignment = useWatch({
    control: assignProgramCoursesForm.control,
    name: 'yearLevel',
  });


  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (USE_MOCK_API) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setSections(mockSections.map(s => ({...s, programName: mockApiPrograms.find(p => p.id === s.programId)?.name || s.programId })));
          setFaculty(mockFaculty);
          setSubjects(mockCourses);
          setAnnouncements(mockAnnouncements);
          setProgramsList(mockApiPrograms);
          setAllCourses(mockCourses); // Ensure allCourses is populated for the modal
      } else {
          const [sectionsData, facultyData, subjectsData, announcementsData, programsData, allCoursesData] = await Promise.all([
            fetchData<Section[]>('sections/read.php'),
            fetchData<Faculty[]>('teachers/read.php'),
            fetchData<Course[]>('courses/read.php'), // This might be all system courses
            fetchData<Announcement[]>('announcements/read.php'),
            fetchData<ProgramType[]>('programs/read.php'),
            fetchData<Course[]>('courses/read.php') // Fetch all courses for the new modal
          ]);
          setSections(sectionsData || []);
          setFaculty(facultyData || []);
          setSubjects(subjectsData || []);
          setAnnouncements(announcementsData || []);
          setProgramsList(programsData || []);
          setAllCourses(allCoursesData || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch initial data:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load page data. Please refresh." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Effect to update course checkboxes when program/year changes in assign courses modal
  React.useEffect(() => {
    if (watchedProgramIdForCourseAssignment && watchedYearLevelForCourseAssignment) {
      const selectedProgram = programsList.find(p => p.id === watchedProgramIdForCourseAssignment);
      if (selectedProgram && selectedProgram.courses && selectedProgram.courses[watchedYearLevelForCourseAssignment]) {
        const assignedCourseIds = selectedProgram.courses[watchedYearLevelForCourseAssignment].map(c => c.id) || [];
        assignProgramCoursesForm.setValue('courseIds', assignedCourseIds);
      } else {
        assignProgramCoursesForm.setValue('courseIds', []);
      }
    }
  }, [watchedProgramIdForCourseAssignment, watchedYearLevelForCourseAssignment, programsList, assignProgramCoursesForm]);


  const handleOpenAssignModal = (section: Section) => {
    setSelectedSection(section);
    assignAdviserForm.reset({ adviserId: section.adviserId ?? 0 });
    setIsAssignModalOpen(true);
  };

  const handleNavigateToSectionDetails = (sectionId: string) => {
    router.push(`/admin/sections/${sectionId}`);
  };


  const handleAssignAdviser = async (values: AssignAdviserFormValues) => {
    if (!selectedSection) return;
    setIsSubmitting(true);
    const adviserIdToAssign = values.adviserId === 0 ? null : values.adviserId;

    try {
        const updatedSectionData = await postData<{ sectionId: string, adviserId: number | null }, Section>(
            `sections/adviser/update.php`,
            { sectionId: selectedSection.id, adviserId: adviserIdToAssign }
        );

        setSections(prev =>
            prev.map(sec =>
                sec.id === selectedSection.id
                ? {...updatedSectionData, programName: programsList.find(p => p.id === updatedSectionData.programId)?.name }
                : sec
            )
        );
        toast({ title: "Adviser Assigned", description: `Adviser ${adviserIdToAssign ? 'assigned' : 'unassigned'} successfully ${adviserIdToAssign ? `(${updatedSectionData.adviserName}) to` : 'from'} ${selectedSection.sectionCode}.` });
        setIsAssignModalOpen(false);
    } catch (error: any) {
        console.error("Failed to assign adviser:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update adviser assignment." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCreateAnnouncement = async (values: AnnouncementFormValues) => {
     setIsSubmitting(true);
    const announcementPayload = {
      title: values.title,
      content: values.content,
      targetAudience: values.targetAudience,
      target: {
        course: values.targetProgramId === 'all' ? null : values.targetProgramId,
        yearLevel: values.targetYearLevel === 'all' ? null : values.targetYearLevel,
        section: values.targetSection === 'all' ? null : values.targetSection,
      }
    };

    try {
        const newAnnouncement = await postData<typeof announcementPayload, Announcement>('announcements/create.php', announcementPayload);
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        toast({ title: "Announcement Posted", description: "Announcement created successfully." });
        setIsAnnounceModalOpen(false);
        announcementForm.reset();
    } catch (error: any) {
         console.error("Failed to create announcement:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to post announcement." });
    } finally {
         setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
        setIsSubmitting(true);
        try {
            await deleteData(`announcements/delete.php/${announcementId}`);
            setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
            toast({ title: "Deleted", description: "Announcement removed." });
        } catch (error: any) {
                toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete announcement." });
        } finally {
                setIsSubmitting(false);
        }
  };

  const handleAssignCoursesToProgram = async (values: AssignCoursesToProgramFormValues) => {
    setIsSubmitting(true);
    const targetProgram = programsList.find(p => p.id === values.programId);
    if (!targetProgram) {
      toast({ variant: "destructive", title: "Error", description: "Selected program not found." });
      setIsSubmitting(false);
      return;
    }

    const updatedCoursesForYear = allCourses.filter(course => values.courseIds.includes(course.id));

    const updatedProgramData: ProgramType = {
      ...targetProgram,
      courses: {
        ...targetProgram.courses,
        [values.yearLevel]: updatedCoursesForYear,
      },
    };

    try {
      await putData<ProgramType, ProgramType>(`programs/update.php/${values.programId}`, updatedProgramData);
      toast({ title: "Courses Assigned", description: `Courses assigned to ${targetProgram.name} - ${values.yearLevel} successfully.` });
      setIsAssignProgramCoursesModalOpen(false);
      await loadData(); // Refresh programsList to reflect changes
    } catch (error: any) {
      console.error("Failed to assign courses:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to assign courses." });
    } finally {
      setIsSubmitting(false);
    }
  };


  const assignedAdviserIds = React.useMemo(() =>
      sections.map(sec => sec.adviserId).filter((id): id is number => id !== undefined && id !== null),
    [sections]
  );

  const teachingFaculty = React.useMemo(() => faculty.filter(f => f.department === 'Teaching'), [faculty]);

  const sectionColumns: ColumnDef<Section>[] = React.useMemo(() => [
    {
      accessorKey: "sectionCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Section Code" />,
    },
    {
      accessorKey: "programName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Program" />,
      filterFn: (row, id, value) => {
        const program = programsList.find(p => p.id === row.original.programId);
        return program ? value.includes(program.id) : false;
      },
    },
    {
      accessorKey: "yearLevel",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Year Level" />,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "adviserName",
      header: "Assigned Adviser",
      cell: ({ row }) => row.original.adviserName || <span className="text-muted-foreground italic">Not Assigned</span>,
    },
     {
      accessorKey: "studentCount",
      header: "Students",
      cell: ({ row }) => row.original.studentCount ?? 0,
    },
    {
      id: "actions",
      cell: ({ row }) => (
         <div className="flex gap-2">
             <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAssignModal(row.original)}
                >
                <UserCheck className="mr-2 h-4 w-4" /> Assign Adviser
            </Button>
             <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigateToSectionDetails(row.original.id)}
                className="text-primary hover:bg-primary/10"
            >
                <Eye className="mr-2 h-4 w-4" /> View Details
            </Button>
         </div>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [assignedAdviserIds, teachingFaculty, isSubmitting, programsList, router]);

  const announcementColumns: ColumnDef<Announcement>[] = React.useMemo(() => [
        {
            accessorKey: "date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
             cell: ({ row }) => {
                 try {
                     const dateValue = row.original.date instanceof Date ? row.original.date : new Date(row.original.date);
                     return format(dateValue, "PPpp");
                 } catch (e) {
                     return "Invalid Date";
                 }
             },
        },
        {
            accessorKey: "title",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        },
        {
            accessorKey: "content",
            header: "Content",
            cell: ({ row }) => <p className="max-w-xs truncate">{row.original.content}</p>,
        },
         {
            accessorKey: "target",
            header: "Target Audience",
            cell: ({ row }) => {
                 const target = row.original.target || {};
                 const audience = row.original.targetAudience || 'All';
                 const { course: programId, yearLevel, section } = target;
                 const programName = programsList.find(p => p.id === programId)?.name;

                 let targetParts = [`Audience: ${audience}`];
                 if (audience === 'Student' || audience === 'All') {
                    if (programId && programId !== 'all') targetParts.push(`Program: ${programName || programId}`);
                    if (yearLevel && yearLevel !== 'all') targetParts.push(`Year: ${yearLevel}`);
                    if (section && section !== 'all') targetParts.push(`Section: ${section}`);
                 }
                 if (targetParts.length === 1 && audience === 'All' && (!programId || programId === 'all') && (!yearLevel || yearLevel === 'all') && (!section || section === 'all')) {
                     return 'All Users';
                 }
                 return targetParts.join('; ');
            },
             filterFn: (row, id, value) => {
                const target = row.original.target || {};
                const audience = row.original.targetAudience || 'All';
                const programId = target.course;
                const yearLevel = target.yearLevel;
                const section = target.section;

                if (value.includes('All Users')) return audience === 'All';
                if (value.includes('Students Only')) return audience === 'Student';
                if (value.includes('Faculty Only')) return audience === 'Faculty';

                if (programId && value.includes(programId)) return true;
                if (yearLevel && value.includes(yearLevel)) return true;
                if (section && value.includes(section)) return true;
                return false;
            }
        },
         {
            accessorKey: "author",
            header: "Author",
             cell: ({ row }) => row.original.author || 'System',
        },
         {
             id: 'delete_announcement',
             cell: ({ row }) => (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button
                             variant="ghost"
                             size="sm"
                             className="text-destructive hover:text-destructive hover:bg-destructive/10"
                             disabled={isSubmitting}
                         >
                             <CalendarX className="h-4 w-4" />
                         </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                         <AlertDialogHeader>
                             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                             <AlertDialogDescription>
                                 This action cannot be undone. This will permanently delete the announcement: "{row.original.title}".
                             </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                             <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                             <AlertDialogAction
                                 onClick={() => handleDeleteAnnouncement(row.original.id)}
                                 className={buttonVariants({ variant: "destructive" })}
                                 disabled={isSubmitting}
                             >
                                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                 Yes, delete
                             </AlertDialogAction>
                         </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
             ),
         },
    ], [isSubmitting, programsList]);

  const programOptionsForTargeting = React.useMemo(() => [{ value: 'all', label: 'All Programs' }, ...programsList.map(p => ({ value: p.id, label: p.name }))], [programsList]);
  const yearLevelOptionsForTargeting = React.useMemo(() => [{ value: 'all', label: 'All Year Levels' }, ...getDistinctValues(sections, 'yearLevel')], [sections]);
  const sectionOptionsForTargeting = React.useMemo(() => [{ value: 'all', label: 'All Sections' }, ...getDistinctValues(sections, 'sectionCode')], [sections]);

  const programFilterOptions = React.useMemo(() => programsList.map(p => ({ value: p.id, label: p.name })), [programsList]);
  const yearFilterOptions = React.useMemo(() => yearLevelOptions, []);

  // Filter available courses for the "Assign Courses to Program/Year" modal
  const availableCoursesForAssignment = React.useMemo(() => {
    if (!watchedProgramIdForCourseAssignment || !watchedYearLevelForCourseAssignment) return [];
    const selectedProgramObject = programsList.find(p => p.id === watchedProgramIdForCourseAssignment);
    if (!selectedProgramObject) return [];

    return allCourses.filter(course => {
      // Basic type filtering
      if (course.type === 'Major' && !(course.programId?.includes(selectedProgramObject.id))) {
          return false;
      }

      // Check if the course is already assigned to a *different* year level in the *current* program
      for (const [year, assignedCoursesInYear] of Object.entries(selectedProgramObject.courses || {})) {
        if (year as YearLevel !== watchedYearLevelForCourseAssignment) { // Don't check against the year level currently being edited
          if (assignedCoursesInYear.some(assignedCourse => assignedCourse.id === course.id)) {
            return false; // Course found in another year level of this program, exclude it
          }
        }
      }
      return true; // Course is available for assignment to the current year level
    });
  }, [watchedProgramIdForCourseAssignment, watchedYearLevelForCourseAssignment, allCourses, programsList]);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Schedule &amp; Announcements</h1>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Class Sections</CardTitle>
                    <CardDescription>
                        Manage sections and assign advisers. Courses are automatically assigned based on the program's curriculum.
                    </CardDescription>
                </div>
                <Button onClick={() => setIsAssignProgramCoursesModalOpen(true)} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" /> Assign Courses to Program/Year
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                         <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" /> Loading sections...
                    </div>
                ) : sections.length > 0 ? (
                    <DataTable
                        columns={sectionColumns}
                        data={sections}
                        searchColumnId="sectionCode"
                        searchPlaceholder="Search by section code..."
                        filterableColumnHeaders={[
                             { columnId: 'programName', title: 'Program', options: programFilterOptions },
                             { columnId: 'yearLevel', title: 'Year Level', options: yearFilterOptions },
                        ]}
                    />
                ) : (
                    <p className="text-center text-muted-foreground py-4">No sections found. Sections are generated when students are added.</p>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>Announcements</CardTitle>
                    <CardDescription>Create, view, and manage announcements for students and faculty.</CardDescription>
                </div>
                 <Dialog open={isAnnounceModalOpen} onOpenChange={setIsAnnounceModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                        <Megaphone className="mr-2 h-4 w-4" /> Create Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                        <DialogTitle>Create New Announcement</DialogTitle>
                        <DialogDescription>Compose and target your announcement.</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[70vh] p-1 pr-4">
                            <Form {...announcementForm}>
                            <form onSubmit={announcementForm.handleSubmit(handleCreateAnnouncement)} className="space-y-4 py-4">
                                <FormField
                                    control={announcementForm.control}
                                    name="title"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Enter announcement title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={announcementForm.control}
                                    name="content"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content</FormLabel>
                                        <FormControl>
                                        <Textarea placeholder="Enter announcement content..." {...field} rows={5} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={announcementForm.control}
                                    name="targetAudience"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Target Audience</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || "All"}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Audience" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {announcementAudienceOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {(watchedTargetAudience === 'Student' || watchedTargetAudience === 'All') && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t mt-4">
                                    <FormField
                                        control={announcementForm.control}
                                        name="targetProgramId"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Target Program (Students)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || "all"}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Program" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                {programOptionsForTargeting.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                    <FormField
                                        control={announcementForm.control}
                                        name="targetYearLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Target Year Level (Students)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || "all"}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Year Level" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                {yearLevelOptionsForTargeting.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                    <FormField
                                        control={announcementForm.control}
                                        name="targetSection"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Target Section (Students)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value || "all"}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Section" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                {sectionOptionsForTargeting.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                    </div>
                                )}
                                {watchedTargetAudience === 'Faculty' && (
                                    <p className="text-sm text-muted-foreground pt-2 border-t mt-4">This announcement will be visible to all faculty members.</p>
                                )}

                                <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAnnounceModalOpen(false)} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Posting...</> : 'Post Announcement'}
                                </Button>
                                </DialogFooter>
                            </form>
                            </Form>
                        </ScrollArea>
                    </DialogContent>
                 </Dialog>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" /> Loading announcements...
                    </div>
                ) : announcements.length > 0 ? (
                    <DataTable
                        columns={announcementColumns}
                        data={announcements}
                        searchColumnId="title"
                        searchPlaceholder="Search by title..."
                        filterableColumnHeaders={[
                            { columnId: 'target', title: 'Audience Filter', options: [
                                {value: 'All Users', label: 'All Users'},
                                {value: 'Students Only', label: 'Students Only'},
                                {value: 'Faculty Only', label: 'Faculty Only'},
                                ...programOptionsForTargeting.filter(o => o.value !== 'all'),
                                ...yearLevelOptionsForTargeting.filter(o => o.value !== 'all'),
                                ...sectionOptionsForTargeting.filter(o => o.value !== 'all'),
                            ] },
                        ]}
                    />
                ) : (
                     <p className="text-center text-muted-foreground py-4">No announcements found.</p>
                )}
            </CardContent>
        </Card>

      {/* Assign Adviser Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Adviser to {selectedSection?.sectionCode}</DialogTitle>
            <DialogDescription>
                Select an adviser for {selectedSection?.programName} - {selectedSection?.yearLevel}.
                Current: {selectedSection?.adviserName || 'None'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1 pr-4">
            <Form {...assignAdviserForm}>
                <form onSubmit={assignAdviserForm.handleSubmit(handleAssignAdviser)} className="space-y-4 py-4">
                <FormField
                    control={assignAdviserForm.control}
                    name="adviserId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Select Adviser (Teaching Staff Only)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value || '0', 10))} value={field.value ? String(field.value) : "0"}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select an adviser..." />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value={"0"}>--- Unassign Adviser ---</SelectItem>
                            {isLoading ? (
                                <SelectItem value="loading" disabled>Loading faculty...</SelectItem>
                            ) : (
                                teachingFaculty
                                    .filter(facultyMember => !assignedAdviserIds.includes(facultyMember.id) || facultyMember.id === selectedSection?.adviserId)
                                    .map((facultyMember) => (
                                        <SelectItem key={facultyMember.id} value={String(facultyMember.id)}>
                                            {facultyMember.firstName} {facultyMember.lastName}
                                        </SelectItem>
                                    ))
                            )}
                            {teachingFaculty.length > 0 && !isLoading && teachingFaculty.filter(facultyMember => !assignedAdviserIds.includes(facultyMember.id) || facultyMember.id === selectedSection?.adviserId).length === 0 && (
                                <SelectItem value="no-available" disabled>No available teaching staff</SelectItem>
                            )}
                            {teachingFaculty.length === 0 && !isLoading && (
                                <SelectItem value="no-faculty" disabled>No teaching staff found</SelectItem>
                            )}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)} disabled={isSubmitting}>
                    Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Assigning...</> : 'Assign Adviser'}
                    </Button>
                </DialogFooter>
                </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Assign Courses to Program/Year Modal */}
      <Dialog open={isAssignProgramCoursesModalOpen} onOpenChange={setIsAssignProgramCoursesModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Courses to Program/Year</DialogTitle>
            <DialogDescription>Select a program and year level, then choose the courses to assign.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1 pr-4">
            <Form {...assignProgramCoursesForm}>
                <form onSubmit={assignProgramCoursesForm.handleSubmit(handleAssignCoursesToProgram)} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={assignProgramCoursesForm.control}
                    name="programId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Program</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger></FormControl>
                            <SelectContent>
                            {programsList.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.id})</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={assignProgramCoursesForm.control}
                    name="yearLevel"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Year Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select Year Level" /></SelectTrigger></FormControl>
                            <SelectContent>
                            {yearLevelOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                {watchedProgramIdForCourseAssignment && watchedYearLevelForCourseAssignment && (
                    <FormItem>
                    <FormLabel className="text-base font-medium">Available Courses for {programsList.find(p=>p.id === watchedProgramIdForCourseAssignment)?.name} - {watchedYearLevelForCourseAssignment}</FormLabel>
                    <p className="text-xs text-muted-foreground">Minor courses are available to all programs. Major courses are specific to the selected program. Courses assigned to other year levels in this program are not shown.</p>
                    <ScrollArea className="h-60 w-full rounded-md border p-4 mt-2">
                        <div className="space-y-2">
                        {availableCoursesForAssignment.length > 0 ? availableCoursesForAssignment.map(course => (
                            <FormField
                            key={course.id}
                            control={assignProgramCoursesForm.control}
                            name="courseIds"
                            render={({ field }) => {
                                return (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(course.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...(field.value || []), course.id])
                                            : field.onChange(
                                            (field.value || []).filter(
                                                (value) => value !== course.id
                                            )
                                            )
                                        }}
                                        disabled={isSubmitting}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm">
                                    {course.name} ({course.id}) - <span className="text-xs italic text-muted-foreground">{course.type}</span>
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        )) : <p className="text-sm text-muted-foreground text-center">No courses available for assignment based on selection, or no courses in the system.</p>}
                        </div>
                    </ScrollArea>
                    <FormMessage>{assignProgramCoursesForm.formState.errors.courseIds?.message}</FormMessage>
                    </FormItem>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAssignProgramCoursesModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting || !watchedProgramIdForCourseAssignment || !watchedYearLevelForCourseAssignment}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Save Course Assignments
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

