
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, Megaphone, BookOpen, Trash2, Loader2, CalendarX, Settings2, Filter } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import type { Section, Faculty, Announcement, Subject, SectionSubjectAssignment, Program as ProgramType, YearLevel } from "@/types";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assignAdviserSchema, announcementSchema } from "@/lib/schemas";
import { format } from 'date-fns';
import { z } from 'zod';
// ManageSubjectsModal is no longer needed as course assignment is now program-level
// import { ManageSubjectsModal } from "@/components/manage-subjects-modal";
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
import { fetchData, postData, deleteData, USE_MOCK_API, mockApiPrograms, mockCourses, mockFaculty, mockSections, mockAnnouncements, logActivity } from "@/lib/api";
import Link from "next/link";


type AssignAdviserFormValues = z.infer<typeof assignAdviserSchema>;
type AnnouncementFormValues = z.infer<typeof announcementSchema>;

const yearLevelOptions: { value: YearLevel; label: string }[] = ["1st Year", "2nd Year", "3rd Year", "4th Year"].map(y => ({ value: y, label: y }));

// Helper to get distinct values for filtering
const getDistinctValues = (data: any[], key: string): { value: string; label: string }[] => {
    if (!data) return [];
    const distinct = [...new Set(data.map(item => item[key]).filter(Boolean))];
    return distinct.map(value => ({ value, label: value }));
}

export default function ScheduleAnnouncementsPage() {
  const [sections, setSections] = React.useState<Section[]>([]);
  const [faculty, setFaculty] = React.useState<Faculty[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]); // Still needed for announcement targeting
  const [programsList, setProgramsList] = React.useState<ProgramType[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = React.useState(false);

  const [selectedSection, setSelectedSection] = React.useState<Section | null>(null);
  // No longer managing selectedSectionAssignments here directly, as it's program-level.
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { toast } = useToast();

  const assignAdviserForm = useForm<AssignAdviserFormValues>({
    resolver: zodResolver(assignAdviserSchema),
    defaultValues: { adviserId: 0 },
  });

  const announcementForm = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      targetProgramId: "all",
      targetYearLevel: "all",
      targetSection: "all",
    },
  });

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (USE_MOCK_API) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setSections(mockSections.map(s => ({...s, programName: mockApiPrograms.find(p => p.id === s.programId)?.name || s.programId })));
          setFaculty(mockFaculty);
          setSubjects(mockCourses); // Keep for announcement targeting
          setAnnouncements(mockAnnouncements);
          setProgramsList(mockApiPrograms);
      } else {
          const [sectionsData, facultyData, subjectsData, announcementsData, programsData] = await Promise.all([
          fetchData<Section[]>('sections/read.php'),
          fetchData<Faculty[]>('teachers/read.php'),
          fetchData<Subject[]>('courses/read.php'),
          fetchData<Announcement[]>('announcements/read.php'),
          fetchData<ProgramType[]>('programs/read.php')
          ]);
          setSections(sectionsData || []);
          setFaculty(facultyData || []);
          setSubjects(subjectsData || []); // Keep for announcement targeting
          setAnnouncements(announcementsData || []);
          setProgramsList(programsData || []);
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

  const handleOpenAssignModal = (section: Section) => {
    setSelectedSection(section);
    assignAdviserForm.reset({ adviserId: section.adviserId ?? 0 });
    setIsAssignModalOpen(true);
  };

  const handleDeleteSection = async (sectionId: string, sectionCode: string) => {
        setIsSubmitting(true);
        try {
            await deleteData(`sections/delete.php/${sectionId}`);
            setSections(prev => prev.filter(s => s.id !== sectionId));
            toast({ title: "Section Deleted", description: `Section ${sectionCode} deleted.` });
            logActivity("Deleted Section", `Section ${sectionCode} removed.`, "Admin", sectionId, "section");
        } catch (error: any) {
             toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete section." });
        } finally {
            setIsSubmitting(false);
        }
    };

  const handleAssignAdviser = async (values: AssignAdviserFormValues) => {
    if (!selectedSection) return;
    setIsSubmitting(true);
    const adviserIdToAssign = values.adviserId === 0 ? null : values.adviserId;

    try {
        const updatedSectionData = await postData<{ adviserId: number | null }, Section>(
            `sections/adviser/update.php`, // Backend should parse sectionId from payload or URL
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
      target: {
        course: values.targetProgramId === 'all' ? null : values.targetProgramId, // Keep key as 'course'
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
            {/* Manage Courses(subjects) button removed from here */}
             <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={isSubmitting}>
                             <Trash2 className="h-4 w-4" /> {/* Changed icon */}
                         </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                         <AlertDialogHeader>
                             <AlertDialogTitle>Delete Section {row.original.sectionCode}?</AlertDialogTitle>
                             <AlertDialogDescription>
                                 This action cannot be undone. All student enrollments for this section will be affected. Assigned courses will remain in the program.
                             </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                             <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                             <AlertDialogAction
                                 onClick={() => handleDeleteSection(row.original.id, row.original.sectionCode)}
                                 className={buttonVariants({ variant: "destructive" })}
                                 disabled={isSubmitting}
                             >
                                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                 Yes, delete section
                             </AlertDialogAction>
                         </AlertDialogFooter>
                    </AlertDialogContent>
            </AlertDialog>
         </div>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [assignedAdviserIds, teachingFaculty, isSubmitting, programsList]);

  const announcementColumns: ColumnDef<Announcement>[] = React.useMemo(() => [
        {
            accessorKey: "date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
             cell: ({ row }) => {
                 try {
                     const dateValue = row.original.date instanceof Date ? row.original.date : new Date(row.original.date);
                     return format(dateValue, "PPpp"); // Added time
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
                 const { course: programId, yearLevel, section } = target; // 'course' is programId from backend
                 const programName = programsList.find(p => p.id === programId)?.name;
                 const targetParts = [];
                 if (programId && programId !== 'all') targetParts.push(`Program: ${programName || programId}`);
                 if (yearLevel && yearLevel !== 'all') targetParts.push(`Year: ${yearLevel}`);
                 if (section && section !== 'all') targetParts.push(`Section: ${section}`);
                 return targetParts.length > 0 ? targetParts.join(', ') : 'All';
            },
             filterFn: (row, id, value) => { // Add filter for target
                const target = row.original.target || {};
                const programId = target.course;
                const yearLevel = target.yearLevel;
                const section = target.section;
                if (value.includes('all')) return true;
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
                             <Trash2 className="h-4 w-4" />
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


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Schedule &amp; Announcements</h1>

        <Card>
            <CardHeader>
                <CardTitle>Class Sections</CardTitle>
                <CardDescription>
                    Manage sections and assign advisers. Sections are auto-generated based on student enrollment.
                    Courses(subjects) are automatically assigned to sections based on the program's curriculum defined in <Link href="/admin/programs" className="text-primary hover:underline">Programs & Courses</Link>.
                </CardDescription>
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
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                        <DialogTitle>Create New Announcement</DialogTitle>
                        <DialogDescription>Compose and target your announcement.</DialogDescription>
                        </DialogHeader>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={announcementForm.control}
                                    name="targetProgramId"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Target Program</FormLabel>
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
                                        <FormLabel>Target Year Level</FormLabel>
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
                                        <FormLabel>Target Section</FormLabel>
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
                             { columnId: 'target', title: 'Target Audience', options: [...programOptionsForTargeting, ...yearLevelOptionsForTargeting, ...sectionOptionsForTargeting, {value: 'all', label: 'All'}] },
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
