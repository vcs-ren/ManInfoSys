
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, PlusCircle, Megaphone, BookOpen, Trash2, Loader2, Info } from "lucide-react"; // Added Loader2, Info

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
} from "@/components/ui/alert-dialog"; // Import AlertDialog components
import { fetchData, postData, deleteData } from "@/lib/api"; // Import API helpers

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
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For form submissions and delete actions

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
      targetCourse: "all", // Keep backend name, change label later
      targetYearLevel: "all",
      targetSection: "all",
    },
  });

  // Fetch initial data using API helpers
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        setSections([
            { id: "CS-1A", sectionCode: "CS-1A", course: "Computer Science", yearLevel: "1st Year", adviserId: 1, adviserName: "David Lee", studentCount: 0 },
            { id: "CS-2A", sectionCode: "CS-2A", course: "Computer Science", yearLevel: "2nd Year", adviserId: 1, adviserName: "David Lee", studentCount: 1 },
            { id: "IT-1B", sectionCode: "IT-1B", course: "Information Technology", yearLevel: "1st Year", studentCount: 1 },
        ]);
         setTeachers([
            { id: 1, teacherId: "t1001", username: "t1001", firstName: "David", lastName: "Lee", department: "Computer Science", email: "david.lee@example.com", phone: "555-1234" },
            { id: 2, teacherId: "t1002", username: "t1002", firstName: "Eve", lastName: "Davis", department: "Information Technology", email: "eve.davis@example.com" },
        ]);
         setSubjects([
            { id: "CS101", name: "Introduction to Programming", description: "Basics of programming" },
            { id: "IT202", name: "Networking Fundamentals", description: "Understanding computer networks" },
            { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills" },
        ]);
         setAnnouncements([
            { id: "ann1", title: "Welcome Back Students!", content: "Welcome to the new academic year.", date: new Date(2024, 7, 15), target: { course: "all" }, author: "Admin" },
        ]);
      } catch (error: any) {
        console.error("Failed to fetch initial data:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load page data. Please refresh." });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [toast]);

   // Fetch assignments when Manage Subjects modal opens for a section using helper
    React.useEffect(() => {
        if (isManageSubjectsModalOpen && selectedSection) {
            const fetchAssignments = async () => {
                setIsLoadingAssignments(true);
                try {
                    // Simulate fetching assignments
                    await new Promise(resolve => setTimeout(resolve, 300));
                    const mockAssignments: SectionSubjectAssignment[] = [
                         { id: "CS-2A-CS101", sectionId: "CS-2A", subjectId: "CS101", subjectName: "Introduction to Programming", teacherId: 1, teacherName: "David Lee" },
                         { id: "IT-1B-IT202", sectionId: "IT-1B", subjectId: "IT202", subjectName: "Networking Fundamentals", teacherId: 2, teacherName: "Eve Davis" },
                    ];
                    setSelectedSectionAssignments(mockAssignments.filter(a => a.sectionId === selectedSection.id));
                } catch (error: any) {
                    console.error("Failed to fetch assignments:", error);
                     toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load subject assignments." });
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

        const subject = subjects.find(s => s.id === subjectId);
        const teacher = teachers.find(t => t.id === teacherId);
        const subjectName = subject?.name || `Subject ${subjectId}`;
        const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : `Teacher ${teacherId}`;
        const assignmentId = `${sectionId}-${subjectId}`; // Generate ID client-side for mock

        const newAssignment: SectionSubjectAssignment = {
            id: assignmentId,
            sectionId: sectionId,
            subjectId: subjectId,
            teacherId: teacherId,
            subjectName: subjectName, // Include names for immediate display
            teacherName: teacherName,
        };

        setIsLoadingAssignments(true);
        try {
            // Simulate POST request
             await new Promise(resolve => setTimeout(resolve, 300));
            console.log("Mock adding assignment:", newAssignment);
            setSelectedSectionAssignments(prev => [...prev, newAssignment]);
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
             // Simulate DELETE request
             await new Promise(resolve => setTimeout(resolve, 300));
             console.log("Mock deleting assignment:", assignmentId);
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
    const adviserIdToAssign = values.adviserId === 0 ? null : values.adviserId;
    const adviser = teachers.find(t => t.id === adviserIdToAssign);
    const adviserName = adviser ? `${adviser.firstName} ${adviser.lastName}` : undefined;

    try {
        // Simulate POST request
         await new Promise(resolve => setTimeout(resolve, 300));
         console.log(`Mock assigning adviser ${adviserIdToAssign} to section ${selectedSection.id}`);

         const updatedSectionData: Section = {
             ...selectedSection,
             adviserId: adviserIdToAssign ?? undefined,
             adviserName: adviserName
         };

        setSections(prev =>
            prev.map(sec =>
                sec.id === selectedSection.id
                ? updatedSectionData
                : sec
            )
        );
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
        course: values.targetCourse === 'all' ? null : values.targetCourse, // Keep 'course' for backend
        yearLevel: values.targetYearLevel === 'all' ? null : values.targetYearLevel,
        section: values.targetSection === 'all' ? null : values.targetSection,
      }
    };

    try {
        // Simulate POST request
        await new Promise(resolve => setTimeout(resolve, 300));
        const nextId = `ann${announcements.length + 1}`;
        const newAnnouncement: Announcement = {
            id: nextId,
            title: announcementPayload.title,
            content: announcementPayload.content,
            date: new Date(),
            target: announcementPayload.target,
            author: "Admin", // Assume admin creates
            author_type: 'Admin'
        };
         console.log("Mock creating announcement:", newAnnouncement);
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

    // --- Delete Announcement Function (using helper) ---
    const handleDeleteAnnouncement = async (announcementId: string) => {
        setIsSubmitting(true);
        try {
            // Simulate DELETE request
            await new Promise(resolve => setTimeout(resolve, 300));
            console.log("Mock deleting announcement:", announcementId);
            setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
            toast({ title: "Deleted", description: "Announcement removed." });
        } catch (error: any) {
                toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete announcement." });
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
      accessorKey: "course", // Keep backend key
      header: ({ column }) => <DataTableColumnHeader column={column} title="Program" />, // Change display label
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
  ], [assignedAdviserIds, teachers]); // Added teachers dependency for dropdown

  // Define columns for the Announcements DataTable
    const announcementColumns: ColumnDef<Announcement>[] = React.useMemo(() => [
        {
            accessorKey: "date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
             cell: ({ row }) => {
                 try {
                     return format(new Date(row.original.date), "PP");
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
                 const { course, yearLevel, section } = target;
                 const targetParts = [];
                 if (course && course !== 'all') targetParts.push(`Program: ${course}`); // Changed label
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
    ], [isSubmitting]);

  // Options for announcement form dropdowns
  const programOptions = React.useMemo(() => [{ value: 'all', label: 'All Programs' }, ...getDistinctValues(sections, 'course')], [sections]);
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
                            name="targetCourse" // Keep name as 'targetCourse'
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Target Program</FormLabel> {/* Changed label */}
                                <Select onValueChange={field.onChange} defaultValue={field.value || "all"}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Program" /> {/* Changed placeholder */}
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {programOptions.map(option => ( // Use programOptions
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
                Select an adviser for {selectedSection?.course} - {selectedSection?.yearLevel}. {/* Keep 'course' here as it's from data */}
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
                teachers={teachers}
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
