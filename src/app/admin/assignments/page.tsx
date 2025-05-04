"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, PlusCircle, Megaphone, BookOpen, Trash2, Loader2 } from "lucide-react"; // Added Loader2

import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import type { Section, Teacher, Announcement, Subject, SectionSubjectAssignment } from "@/types";
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

type AssignAdviserFormValues = z.infer<typeof assignAdviserSchema>;
type AnnouncementFormValues = z.infer<typeof announcementSchema>;

// --- API Helper Functions (Examples - replace with actual API calls) ---

const fetchData = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

const postData = async <T, R>(url: string, data: T): Promise<R> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        // Try to get error message from response body
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            // Ignore if response body is not JSON
        }
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

const deleteData = async (url: string): Promise<void> => {
     const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
     // Check if the response has content before trying to parse JSON
    if (response.status !== 204) { // 204 No Content usually means success for DELETE
        try {
            await response.json(); // Or handle based on expected response
        } catch (e) {
             console.warn("Could not parse JSON response from DELETE request.");
        }
    }
};


// Helper to get distinct values for filtering
const getDistinctValues = (data: any[], key: string): { value: string; label: string }[] => {
    if (!data) return [];
    const distinct = [...new Set(data.map(item => item[key]).filter(Boolean))];
    return distinct.map(value => ({ value, label: value }));
}

export default function AssignmentsAnnouncementsPage() {
  const [sections, setSections] = React.useState<Section[]>([]);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true); // Combined loading state
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = React.useState(false);
  const [isManageSubjectsModalOpen, setIsManageSubjectsModalOpen] = React.useState(false);
  const [selectedSection, setSelectedSection] = React.useState<Section | null>(null);
  const [selectedSectionAssignments, setSelectedSectionAssignments] = React.useState<SectionSubjectAssignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For form submissions

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
      targetCourse: "all",
      targetYearLevel: "all",
      targetSection: "all",
    },
  });

  // Fetch initial data
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [sectionsData, teachersData, subjectsData, announcementsData] = await Promise.all([
          fetchData<Section[]>('/api/sections'), // Replace with actual API endpoint
          fetchData<Teacher[]>('/api/teachers'),   // Replace with actual API endpoint
          fetchData<Subject[]>('/api/subjects'),   // Replace with actual API endpoint
          fetchData<Announcement[]>('/api/announcements'), // Replace with actual API endpoint
        ]);
        setSections(sectionsData || []);
        setTeachers(teachersData || []);
        setSubjects(subjectsData || []);
        setAnnouncements(announcementsData || []);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load page data. Please refresh." });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [toast]);

   // Fetch assignments when Manage Subjects modal opens for a section
    React.useEffect(() => {
        if (isManageSubjectsModalOpen && selectedSection) {
            const fetchAssignments = async () => {
                setIsLoadingAssignments(true);
                try {
                    // Example: /api/sections/{sectionId}/assignments
                    const assignmentsData = await fetchData<SectionSubjectAssignment[]>(`/api/sections/${selectedSection.id}/assignments`);
                    setSelectedSectionAssignments(assignmentsData || []);
                } catch (error) {
                    console.error("Failed to fetch assignments:", error);
                    toast({ variant: "destructive", title: "Error", description: "Failed to load subject assignments." });
                } finally {
                    setIsLoadingAssignments(false);
                }
            };
            fetchAssignments();
        }
    }, [isManageSubjectsModalOpen, selectedSection, toast]);


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

        // Get subject/teacher names locally for optimistic update/toast message
        const subject = subjects.find(s => s.id === subjectId);
        const teacher = teachers.find(t => t.id === teacherId);
        const subjectName = subject?.name || `Subject ${subjectId}`;
        const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : `Teacher ${teacherId}`;

        const newAssignmentPayload = {
            sectionId: sectionId,
            subjectId: subjectId,
            teacherId: teacherId,
        };

        setIsLoadingAssignments(true);
        try {
            // Example: POST /api/sections/{sectionId}/assignments
            const savedAssignment = await postData<typeof newAssignmentPayload, SectionSubjectAssignment>(
                `/api/sections/${sectionId}/assignments`,
                newAssignmentPayload
            );
            // Optimistically update UI or re-fetch
             setSelectedSectionAssignments(prev => [...prev, { ...savedAssignment, subjectName, teacherName }]); // Add local names
            toast({ title: "Assignment Added", description: `${subjectName} assigned to ${teacherName} for ${selectedSection.sectionCode}.` });
        } catch (error: any) {
            console.error("Failed to save assignment:", error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add subject assignment." });
        } finally {
            setIsLoadingAssignments(false);
        }
    };

    const handleDeleteSubjectAssignment = async (assignmentId: string) => {
        if (!selectedSection) return;

        setIsLoadingAssignments(true);
        try {
            // Example: DELETE /api/assignments/{assignmentId}
            await deleteData(`/api/assignments/${assignmentId}`);
            setSelectedSectionAssignments(prev => prev.filter(a => a.id !== assignmentId));
            toast({ title: "Assignment Removed", description: `Subject assignment removed successfully.` });
        } catch (error: any) {
            console.error("Failed to delete assignment:", error);
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to remove subject assignment." });
        } finally {
            setIsLoadingAssignments(false);
        }
    };

  const handleAssignAdviser = async (values: AssignAdviserFormValues) => {
    if (!selectedSection) return;
    setIsSubmitting(true);
    const adviserIdToAssign = values.adviserId === 0 ? null : values.adviserId; // Use null for unassign in API?

    try {
        // Example: PATCH /api/sections/{sectionId}/adviser
         const updatedSection = await postData<{ adviserId: number | null }, Section>(
             `/api/sections/${selectedSection.id}/adviser`,
             { adviserId: adviserIdToAssign }
         );

        // Update local state
        setSections(prev =>
            prev.map(sec =>
                sec.id === selectedSection.id
                ? { ...sec, adviserId: updatedSection.adviserId, adviserName: updatedSection.adviserName }
                : sec
            )
        );
        const adviserName = updatedSection.adviserName || 'N/A';
        toast({ title: "Adviser Assigned", description: `Adviser ${adviserIdToAssign ? 'assigned' : 'unassigned'} successfully ${adviserIdToAssign ? `(${adviserName}) to` : 'from'} ${selectedSection.sectionCode}.` });
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
        course: values.targetCourse === 'all' ? null : values.targetCourse,
        yearLevel: values.targetYearLevel === 'all' ? null : values.targetYearLevel,
        section: values.targetSection === 'all' ? null : values.targetSection,
      }
      // author might be set by the backend based on logged-in user
    };

    try {
        // Example: POST /api/announcements
        const newAnnouncement = await postData<typeof announcementPayload, Announcement>(
            '/api/announcements',
            announcementPayload
        );
        setAnnouncements(prev => [newAnnouncement, ...prev]); // Add to the top
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

  // Get currently assigned adviser IDs to filter the dropdown
  const assignedAdviserIds = React.useMemo(() =>
      sections.map(sec => sec.adviserId).filter((id): id is number => id !== undefined && id !== null),
    [sections]
  );

  // Define columns for the Sections DataTable
  const sectionColumns: ColumnDef<Section>[] = React.useMemo(() => [
    {
      accessorKey: "sectionCode",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Section" />,
    },
    {
      accessorKey: "course",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
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
                 <BookOpen className="mr-2 h-4 w-4" /> Manage Subjects
            </Button>
         </div>
      ),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [assignedAdviserIds]); // Dependency needed if filtering happens here

  // Define columns for the Announcements DataTable
    const announcementColumns: ColumnDef<Announcement>[] = React.useMemo(() => [
        {
            accessorKey: "date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
             cell: ({ row }) => {
                 try {
                     return format(new Date(row.original.date), "PP"); // Format date nicely
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
                 const target = row.original.target || {}; // Handle potential null/undefined target
                 const { course, yearLevel, section } = target;
                 const targetParts = [];
                 if (course && course !== 'all') targetParts.push(`Course: ${course}`);
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
                 <Button
                     variant="ghost"
                     size="sm"
                     className="text-destructive hover:text-destructive hover:bg-destructive/10"
                     onClick={async (e) => {
                        e.stopPropagation(); // Prevent triggering other actions
                        // Add confirmation dialog here if desired
                        setIsSubmitting(true); // Use general submitting state
                        try {
                            // Example DELETE /api/announcements/{announcementId}
                            await deleteData(`/api/announcements/${row.original.id}`);
                            setAnnouncements(prev => prev.filter(a => a.id !== row.original.id));
                            toast({ title: "Deleted", description: "Announcement removed." });
                        } catch (error: any) {
                             toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete announcement." });
                        } finally {
                             setIsSubmitting(false);
                        }
                     }}
                     disabled={isSubmitting}
                 >
                     <Trash2 className="h-4 w-4" />
                 </Button>
             ),
         },
    ], [isSubmitting]); // Added isSubmitting dependency for delete button state

  const courseOptions = React.useMemo(() => [{ value: 'all', label: 'All Courses' }, ...getDistinctValues(sections, 'course')], [sections]);
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
                            name="targetCourse"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Target Course</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || "all"}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {courseOptions.map(option => (
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
                <CardDescription>Assign advisers and manage subjects for class sections.</CardDescription>
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
                Select an adviser for {selectedSection?.course} - {selectedSection?.yearLevel}.
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
                         {isLoading ? ( // Use general loading state here
                            <SelectItem value="loading" disabled>Loading advisers...</SelectItem>
                        ) : (
                            teachers
                                .filter(teacher => !assignedAdviserIds.includes(teacher.id) || teacher.id === selectedSection?.adviserId)
                                .map((teacher) => (
                                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                                        {teacher.firstName} {teacher.lastName} ({teacher.department})
                                    </SelectItem>
                                ))
                        )}
                         {teachers.length > 0 && !isLoading && teachers.filter(teacher => !assignedAdviserIds.includes(teacher.id) || teacher.id === selectedSection?.adviserId).length === 0 && (
                            <SelectItem value="no-available" disabled>No available advisers</SelectItem>
                         )}
                         {teachers.length === 0 && !isLoading && (
                            <SelectItem value="no-teachers" disabled>No teachers found</SelectItem>
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
                subjects={subjects} // Pass all subjects
                teachers={teachers} // Pass all teachers
                assignments={selectedSectionAssignments} // Pass current assignments for the section
                onAddAssignment={handleAddSubjectAssignment}
                onDeleteAssignment={handleDeleteSubjectAssignment}
                isLoadingAssignments={isLoadingAssignments}
                isLoadingSubjects={isLoading} // Reuse main loading state
                isLoadingTeachers={isLoading} // Reuse main loading state
            />
         )}
    </div>
  );
}