
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, PlusCircle, Megaphone, BookOpen, Trash2, Loader2, Info } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import type { Section, Faculty, Announcement, Subject, SectionSubjectAssignment, Program as ProgramType } from "@/types";
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
import { ManageSubjectsModal } from "@/components/manage-subjects-modal";
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
import { fetchData, postData, deleteData, USE_MOCK_API, mockApiPrograms, mockCourses, mockFaculty, mockSections, mockAnnouncements, mockSectionAssignments } from "@/lib/api"; // Added mock imports for initial data

type AssignAdviserFormValues = z.infer<typeof assignAdviserSchema>;
type AnnouncementFormValues = z.infer<typeof announcementSchema>;

// Helper to get distinct values for filtering
const getDistinctValues = (data: any[], key: string): { value: string; label: string }[] => {
    if (!data) return [];
    const distinct = [...new Set(data.map(item => item[key]).filter(Boolean))];
    return distinct.map(value => ({ value, label: value }));
}

export default function AssignmentsAnnouncementsPage() {
  const [sections, setSections] = React.useState<Section[]>([]);
  const [faculty, setFaculty] = React.useState<Faculty[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [programsList, setProgramsList] = React.useState<ProgramType[]>([]); // State for programs
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = React.useState(false);
  const [isManageSubjectsModalOpen, setIsManageSubjectsModalOpen] = React.useState(false);
  const [selectedSection, setSelectedSection] = React.useState<Section | null>(null);
  const [selectedSectionAssignments, setSelectedSectionAssignments] = React.useState<SectionSubjectAssignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = React.useState(false);
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

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 300));
            setSections(mockSections.map(s => ({...s, programName: mockApiPrograms.find(p => p.id === s.programId)?.name || s.programId })));
            setFaculty(mockFaculty);
            setSubjects(mockCourses); // Assuming mockCourses are the subjects
            setAnnouncements(mockAnnouncements);
            setProgramsList(mockApiPrograms); // Set programs list from mock
        } else {
            const [sectionsData, facultyData, subjectsData, announcementsData, programsData] = await Promise.all([
            fetchData<Section[]>('sections/read.php'),
            fetchData<Faculty[]>('teachers/read.php'),
            fetchData<Subject[]>('subjects/read.php'), // Endpoint for subjects
            fetchData<Announcement[]>('announcements/read.php'),
            fetchData<ProgramType[]>('programs/read.php') // Fetch programs
            ]);
            setSections(sectionsData || []);
            setFaculty(facultyData || []);
            setSubjects(subjectsData || []);
            setAnnouncements(announcementsData || []);
            setProgramsList(programsData || []); // Set programs list from API
        }
      } catch (error: any) {
        console.error("Failed to fetch initial data:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load page data. Please refresh." });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [toast]);

    React.useEffect(() => {
        if (isManageSubjectsModalOpen && selectedSection) {
            const fetchAssignments = async () => {
                setIsLoadingAssignments(true);
                try {
                    if (USE_MOCK_API) {
                        const sectionAssignments = mockSectionAssignments.filter(a => a.sectionId === selectedSection.id)
                            .map(a => ({
                                ...a,
                                subjectName: subjects.find(s => s.id === a.subjectId)?.name || a.subjectId,
                                teacherName: faculty.find(t => t.id === a.teacherId)?.firstName + ' ' + faculty.find(t => t.id === a.teacherId)?.lastName || `Faculty ID ${a.teacherId}`,
                            }));
                        setSelectedSectionAssignments(sectionAssignments);
                    } else {
                        const assignmentsData = await fetchData<SectionSubjectAssignment[]>(`sections/${selectedSection.id}/assignments/read.php`);
                        setSelectedSectionAssignments(assignmentsData || []);
                    }
                } catch (error: any) {
                    console.error("Failed to fetch assignments:", error);
                     toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load subject assignments." });
                } finally {
                    setIsLoadingAssignments(false);
                }
            };
            fetchAssignments();
        }
    }, [isManageSubjectsModalOpen, selectedSection, toast, subjects, faculty]);


  const handleOpenAssignModal = (section: Section) => {
    setSelectedSection(section);
    assignAdviserForm.reset({ adviserId: section.adviserId ?? 0 });
    setIsAssignModalOpen(true);
  };

    const handleOpenManageSubjectsModal = (section: Section) => {
        setSelectedSection(section);
        setIsManageSubjectsModalOpen(true);
    };

    const handleAddSubjectAssignment = async (sectionId: string, subjectId: string, teacherId: number) => {
        if (!selectedSection) return;

        setIsLoadingAssignments(true);
        try {
            const newAssignment = await postData<any, SectionSubjectAssignment>('sections/assignments/create.php', { sectionId, subjectId, teacherId });
             const subject = subjects.find(s => s.id === subjectId);
             const facultyMember = faculty.find(t => t.id === teacherId);
             newAssignment.subjectName = subject?.name || `Subject ${subjectId}`;
             newAssignment.teacherName = facultyMember ? `${facultyMember.firstName} ${facultyMember.lastName}` : `Faculty ID ${teacherId}`;

            setSelectedSectionAssignments(prev => [...prev, newAssignment]);
            toast({ title: "Assignment Added", description: `${newAssignment.subjectName} assigned to ${newAssignment.teacherName} for ${selectedSection.sectionCode}.` });
        } catch (error: any) {
            console.error("Failed to save assignment:", error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add subject assignment." });
             throw error;
        } finally {
            setIsLoadingAssignments(false);
        }
    };

    const handleDeleteSubjectAssignment = async (assignmentId: string) => {
        if (!selectedSection) return;

        setIsLoadingAssignments(true);
        try {
            await deleteData(`assignments/delete.php/${assignmentId}`);
            setSelectedSectionAssignments(prev => prev.filter(a => a.id !== assignmentId));
            toast({ title: "Assignment Removed", description: `Subject assignment removed successfully.` });
        } catch (error: any) {
            console.error("Failed to delete assignment:", error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to remove subject assignment." });
             throw error;
        } finally {
            setIsLoadingAssignments(false);
        }
    };

  const handleAssignAdviser = async (values: AssignAdviserFormValues) => {
    if (!selectedSection) return;
    setIsSubmitting(true);
    const adviserIdToAssign = values.adviserId === 0 ? null : values.adviserId;

    try {
        const updatedSectionData = await postData<{ adviserId: number | null }, Section>(
            `sections/${selectedSection.id}/adviser/update.php`,
            { adviserId: adviserIdToAssign }
        );

        setSections(prev =>
            prev.map(sec =>
                sec.id === selectedSection.id
                ? updatedSectionData
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


  const assignedAdviserIds = React.useMemo(() =>
      sections.map(sec => sec.adviserId).filter((id): id is number => id !== undefined && id !== null),
    [sections]
  );

  const sectionColumns: ColumnDef<Section>[] = React.useMemo(() => [
    {
      accessorKey: "sectionCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Section" />,
    },
    {
      accessorKey: "programName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Program" />,
    },
    {
      accessorKey: "yearLevel",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Year Level" />,
    },
    {
      accessorKey: "adviserName",
      header: "Assigned Adviser",
      cell: ({ row }) => row.original.adviserName || <span className="text-muted-foreground italic">Not Assigned</span>,
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
                onClick={() => handleOpenManageSubjectsModal(row.original)}
                >
                 <BookOpen className="mr-2 h-4 w-4" /> Manage Courses(subjects)
            </Button>
         </div>
      ),
    },
  ], [assignedAdviserIds, faculty]);

    const announcementColumns: ColumnDef<Announcement>[] = React.useMemo(() => [
        {
            accessorKey: "date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
             cell: ({ row }) => {
                 try {
                     const dateValue = row.original.date instanceof Date ? row.original.date : new Date(row.original.date);
                     return format(dateValue, "PP");
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
                 const { course: programId, yearLevel, section } = target; // 'course' key for programId
                 const programName = programsList.find(p => p.id === programId)?.name;
                 const targetParts = [];
                 if (programId && programId !== 'all') targetParts.push(`Program: ${programName || programId}`);
                 if (yearLevel && yearLevel !== 'all') targetParts.push(`Year: ${yearLevel}`);
                 if (section && section !== 'all') targetParts.push(`Section: ${section}`);
                 return targetParts.length > 0 ? targetParts.join(', ') : 'All';
            },
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
    ], [isSubmitting, programsList]); // Added programsList dependency

  const programOptions = React.useMemo(() => [{ value: 'all', label: 'All Programs' }, ...programsList.map(p => ({ value: p.id, label: p.name }))], [programsList]);
  const yearLevelOptions = React.useMemo(() => [{ value: 'all', label: 'All Year Levels' }, ...getDistinctValues(sections, 'yearLevel')], [sections]);
  const sectionOptions = React.useMemo(() => [{ value: 'all', label: 'All Sections' }, ...getDistinctValues(sections, 'sectionCode')], [sections]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Section Management & Announcements</h1>
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
                                    {programOptions.map(option => (
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
                                    {yearLevelOptions.map(option => (
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
                                    {sectionOptions.map(option => (
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
      </div>

        <Card>
            <CardHeader>
                <CardTitle>Section Assignments</CardTitle>
                <CardDescription>Assign advisers and manage courses for class sections.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                         <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" /> Loading sections...
                    </div>
                ) : sections.length > 0 ? (
                    <DataTable columns={sectionColumns} data={sections} />
                ) : (
                    <p className="text-center text-muted-foreground py-4">No sections found.</p>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                 <CardDescription>View and manage previously posted announcements.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" /> Loading announcements...
                    </div>
                ) : announcements.length > 0 ? (
                    <DataTable columns={announcementColumns} data={announcements} />
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
                    <FormLabel>Select Adviser</FormLabel>
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
                             faculty
                                .filter(facultyMember => !assignedAdviserIds.includes(facultyMember.id) || facultyMember.id === selectedSection?.adviserId)
                                .map((facultyMember) => (
                                    <SelectItem key={facultyMember.id} value={String(facultyMember.id)}>
                                        {facultyMember.firstName} {facultyMember.lastName} ({facultyMember.department})
                                    </SelectItem>
                                ))
                        )}
                         {faculty.length > 0 && !isLoading && faculty.filter(facultyMember => !assignedAdviserIds.includes(facultyMember.id) || facultyMember.id === selectedSection?.adviserId).length === 0 && (
                            <SelectItem value="no-available" disabled>No available faculty</SelectItem>
                         )}
                         {faculty.length === 0 && !isLoading && (
                            <SelectItem value="no-faculty" disabled>No faculty found</SelectItem>
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

        {/* Manage Subjects Modal */}
         {selectedSection && (
            <ManageSubjectsModal
                isOpen={isManageSubjectsModalOpen}
                onOpenChange={setIsManageSubjectsModalOpen}
                section={selectedSection}
                subjects={subjects}
                teachers={faculty}
                assignments={selectedSectionAssignments}
                onAddAssignment={handleAddSubjectAssignment}
                onDeleteAssignment={handleDeleteSubjectAssignment}
                isLoadingAssignments={isLoadingAssignments}
                isLoadingSubjects={isLoading}
                isLoadingTeachers={isLoading}
            />
         )}
    </div>
  );
}
