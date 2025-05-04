
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, PlusCircle, Megaphone, Edit, BookOpen, Trash2 } from "lucide-react"; // Added BookOpen and Trash2

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
import { assignAdviserSchema, announcementSchema } from "@/lib/schemas"; // Updated schema import
import { format } from 'date-fns'; // Import date-fns format
import { z } from 'zod'; // Import z from zod
import { ManageSubjectsModal } from "@/components/manage-subjects-modal"; // Import the new modal

type AssignAdviserFormValues = z.infer<typeof assignAdviserSchema>; // Renamed form values type
type AnnouncementFormValues = z.infer<typeof announcementSchema>;

// Mock Data - Replace with API calls
const getSections = async (): Promise<Section[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Fetch all sections, potentially with adviser info joined
  return [
    { id: "CS-10A", sectionCode: "10A", course: "Computer Science", yearLevel: "1st Year", adviserId: 1, adviserName: "Alice Johnson" },
    { id: "IT-10B", sectionCode: "10B", course: "Information Technology", yearLevel: "1st Year" },
    { id: "CS-20A", sectionCode: "20A", course: "Computer Science", yearLevel: "2nd Year" },
    { id: "BA-30C", sectionCode: "30C", course: "Business Administration", yearLevel: "3rd Year", adviserId: 4, adviserName: "Diana Miller" },
    { id: "IT-20B", sectionCode: "20B", course: "Information Technology", yearLevel: "2nd Year", adviserId: 2, adviserName: "Bob Williams" },
  ];
};

const getTeachers = async (): Promise<Teacher[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 1, teacherId: "t1001", firstName: "Alice", lastName: "Johnson", department: "Mathematics" },
    { id: 2, teacherId: "t1002", firstName: "Bob", lastName: "Williams", department: "Science" },
    { id: 3, teacherId: "t1003", firstName: "Charlie", lastName: "Davis", department: "English" },
    { id: 4, teacherId: "t1004", firstName: "Diana", lastName: "Miller", department: "Science" },
    { id: 5, teacherId: "t1005", firstName: "Ethan", lastName: "Brown", department: "Mathematics" }, // Added more teachers for filtering demo
  ];
};

const getAnnouncements = async (): Promise<Announcement[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
        { id: "ann1", title: "Midterm Schedule Update", content: "The midterm exam schedule has been updated. Please check the portal.", date: new Date("2024-07-25"), target: { course: 'all', yearLevel: 'all', section: 'all' }, author: "Admin" },
        { id: "ann2", title: "CS Department Meeting", content: "Mandatory meeting for all Computer Science students on Friday.", date: new Date("2024-07-28"), target: { course: 'Computer Science', yearLevel: 'all', section: 'all' }, author: "Admin" },
    ];
}

// Mock: Get all available subjects
const getSubjects = async (): Promise<Subject[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
        { id: "MATH101", name: "Mathematics 101", description: "Introductory Algebra" },
        { id: "PHYS202", name: "Physics 202", description: "Mechanics" },
        { id: "ENGL101", name: "English Literature 101", description: "Introduction to Literature" },
        { id: "HIST101", name: "History 101", description: "World History" },
        { id: "CS101", name: "Introduction to Programming", description: "Fundamentals of programming" },
        { id: "IT101", name: "Introduction to IT", description: "Basic IT Concepts" },
        { id: "BA101", name: "Introduction to Business", description: "Fundamentals of Business" },
    ];
}

// Mock: Get subject assignments for a specific section
const getSectionAssignments = async (sectionId: string): Promise<SectionSubjectAssignment[]> => {
    await new Promise(resolve => setTimeout(resolve, 350));
    // In a real app, filter based on sectionId
    const allAssignments = [
        { id: "ssa1", sectionId: "CS-10A", subjectId: "CS101", teacherId: 3, subjectName: "Intro to Programming", teacherName: "Charlie Davis" },
        { id: "ssa2", sectionId: "CS-10A", subjectId: "MATH101", teacherId: 1, subjectName: "Mathematics 101", teacherName: "Alice Johnson" },
        { id: "ssa3", sectionId: "IT-10B", subjectId: "IT101", teacherId: 2, subjectName: "Intro to IT", teacherName: "Bob Williams" },
        { id: "ssa4", sectionId: "IT-10B", subjectId: "MATH101", teacherId: 5, subjectName: "Mathematics 101", teacherName: "Ethan Brown" },
        { id: "ssa5", sectionId: "BA-30C", subjectId: "BA101", teacherId: 4, subjectName: "Intro to Business", teacherName: "Diana Miller" },
    ];
    return allAssignments.filter(a => a.sectionId === sectionId);
}

// Mock: Save a new assignment
const saveSectionAssignment = async (assignment: Omit<SectionSubjectAssignment, 'id'>): Promise<SectionSubjectAssignment> => {
    console.log("Saving new assignment:", assignment);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newId = `ssa${Date.now()}`; // Simple unique ID
    const fullAssignment = { ...assignment, id: newId };
    // In a real app, update the data source
    return fullAssignment;
}

// Mock: Delete an assignment
const deleteSectionAssignment = async (assignmentId: string): Promise<void> => {
    console.log("Deleting assignment:", assignmentId);
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app, delete from the data source
    return;
}


// Helper to get distinct values for filtering
const getDistinctValues = (data: any[], key: string): { value: string; label: string }[] => {
    const distinct = [...new Set(data.map(item => item[key]).filter(Boolean))];
    return distinct.map(value => ({ value, label: value }));
}

export default function AssignmentsAnnouncementsPage() {
  const [sections, setSections] = React.useState<Section[]>([]);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]); // State for subjects
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [isLoadingSections, setIsLoadingSections] = React.useState(true);
  const [isLoadingTeachers, setIsLoadingTeachers] = React.useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = React.useState(true); // Loading state for subjects
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = React.useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = React.useState(false);
  const [isManageSubjectsModalOpen, setIsManageSubjectsModalOpen] = React.useState(false); // State for Manage Subjects modal
  const [selectedSection, setSelectedSection] = React.useState<Section | null>(null);
  const [selectedSectionAssignments, setSelectedSectionAssignments] = React.useState<SectionSubjectAssignment[]>([]); // Assignments for modal
  const [isLoadingAssignments, setIsLoadingAssignments] = React.useState(false); // Loading state for assignments
  const { toast } = useToast();

  // Renamed form and schema
  const assignAdviserForm = useForm<AssignAdviserFormValues>({
    resolver: zodResolver(assignAdviserSchema),
    defaultValues: { adviserId: 0 }, // Default to 0 (unassign) or undefined
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


  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingSections(true);
      setIsLoadingTeachers(true);
      setIsLoadingSubjects(true);
      setIsLoadingAnnouncements(true);
      try {
        const [sectionsData, teachersData, subjectsData, announcementsData] = await Promise.all([
          getSections(),
          getTeachers(),
          getSubjects(), // Fetch subjects
          getAnnouncements(),
        ]);
        setSections(sectionsData);
        setTeachers(teachersData);
        setSubjects(subjectsData); // Set subjects state
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load page data." });
      } finally {
        setIsLoadingSections(false);
        setIsLoadingTeachers(false);
        setIsLoadingSubjects(false); // Update loading state
        setIsLoadingAnnouncements(false);
      }
    };
    fetchData();
  }, [toast]);

   // Fetch assignments when Manage Subjects modal opens for a section
    React.useEffect(() => {
        if (isManageSubjectsModalOpen && selectedSection) {
            const fetchAssignments = async () => {
                setIsLoadingAssignments(true);
                try {
                    const assignmentsData = await getSectionAssignments(selectedSection.id);
                    setSelectedSectionAssignments(assignmentsData);
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
    // Reset form with current adviserId or 0 if unassigned
    assignAdviserForm.reset({ adviserId: section.adviserId ?? 0 });
    setIsAssignModalOpen(true);
  };

  // Handler to open Manage Subjects modal
    const handleOpenManageSubjectsModal = (section: Section) => {
        setSelectedSection(section);
        setIsManageSubjectsModalOpen(true);
        // Fetch assignments inside the useEffect triggered by modal open state
    };

     // Handler for adding a new subject assignment
    const handleAddSubjectAssignment = async (sectionId: string, subjectId: string, teacherId: number) => {
        if (!selectedSection) return;
        const subject = subjects.find(s => s.id === subjectId);
        const teacher = teachers.find(t => t.id === teacherId);

        if (!subject || !teacher) {
            toast({ variant: "destructive", title: "Error", description: "Selected subject or teacher not found." });
            return;
        }

         // Prevent assigning the same subject multiple times to the same section
        if (selectedSectionAssignments.some(a => a.subjectId === subjectId)) {
            toast({ variant: "warning", title: "Already Assigned", description: `${subject.name} is already assigned to this section.` });
            return;
        }


        const newAssignmentBase: Omit<SectionSubjectAssignment, 'id'> = {
            sectionId: sectionId,
            subjectId: subjectId,
            teacherId: teacherId,
            subjectName: subject.name,
            teacherName: `${teacher.firstName} ${teacher.lastName}`,
        };

        setIsLoadingAssignments(true); // Indicate loading while saving
        try {
            const savedAssignment = await saveSectionAssignment(newAssignmentBase);
            setSelectedSectionAssignments(prev => [...prev, savedAssignment]);
            toast({ title: "Assignment Added", description: `${subject.name} assigned to ${teacher.firstName} ${teacher.lastName} for ${selectedSection.sectionCode}.` });
        } catch (error) {
            console.error("Failed to save assignment:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to add subject assignment." });
        } finally {
            setIsLoadingAssignments(false);
        }
    };

     // Handler for deleting a subject assignment
    const handleDeleteSubjectAssignment = async (assignmentId: string) => {
        if (!selectedSection) return;
        const assignmentToDelete = selectedSectionAssignments.find(a => a.id === assignmentId);
        if (!assignmentToDelete) return;

        setIsLoadingAssignments(true); // Indicate loading while deleting
        try {
            await deleteSectionAssignment(assignmentId);
            setSelectedSectionAssignments(prev => prev.filter(a => a.id !== assignmentId));
            toast({ title: "Assignment Removed", description: `Subject assignment removed successfully.` });
        } catch (error) {
            console.error("Failed to delete assignment:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to remove subject assignment." });
        } finally {
            setIsLoadingAssignments(false);
        }
    };

  const handleAssignAdviser = async (values: AssignAdviserFormValues) => {
    if (!selectedSection) return;
    const adviserIdToAssign = values.adviserId === 0 ? undefined : values.adviserId; // Handle unassign (0)
    const adviser = adviserIdToAssign ? teachers.find(t => t.id === adviserIdToAssign) : undefined;
    const adviserFullName = adviser ? `${adviser.firstName} ${adviser.lastName}` : 'N/A';

    console.log(`Assigning Adviser ID: ${adviserIdToAssign ?? 'None'} to Section: ${selectedSection.sectionCode}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setSections(prev =>
      prev.map(sec =>
        sec.id === selectedSection.id
          ? { ...sec, adviserId: adviserIdToAssign, adviserName: adviserFullName }
          : sec
      )
    );
    toast({ title: "Adviser Assigned", description: `Adviser ${adviserIdToAssign ? 'assigned' : 'unassigned'} successfully ${adviserIdToAssign ? `(${adviserFullName}) to` : 'from'} ${selectedSection.sectionCode}.` });
    setIsAssignModalOpen(false);
  };

  const handleCreateAnnouncement = async (values: AnnouncementFormValues) => {
    console.log("Creating announcement:", values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const newAnnouncement: Announcement = {
      id: `ann${announcements.length + 1}`,
      title: values.title,
      content: values.content,
      date: new Date(),
      target: {
        course: values.targetCourse || 'all',
        yearLevel: values.targetYearLevel || 'all',
        section: values.targetSection || 'all',
      },
      author: "Admin", // Assuming admin is posting
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]); // Add to the top
    toast({ title: "Announcement Posted", description: "Announcement created successfully." });
    setIsAnnounceModalOpen(false);
    announcementForm.reset(); // Reset form
  };

  // Get currently assigned adviser IDs to filter the dropdown
  const assignedAdviserIds = React.useMemo(() =>
      sections.map(sec => sec.adviserId).filter((id): id is number => id !== undefined), // Use type predicate
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
      accessorKey: "adviserName", // Changed accessor key
      header: "Assigned Adviser", // Changed header title
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
             {/* Updated Button for Managing Subjects */}
             <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenManageSubjectsModal(row.original)} // Updated onClick handler
                >
                 <BookOpen className="mr-2 h-4 w-4" /> Manage Subjects
            </Button>
         </div>
      ),
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [assignedAdviserIds]); // Add assignedAdviserIds as dependency if filtering logic is inside

  // Define columns for the Announcements DataTable
    const announcementColumns: ColumnDef<Announcement>[] = React.useMemo(() => [
        {
            accessorKey: "date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
            cell: ({ row }) => format(row.original.date, "PP"), // Format date nicely
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
                const { course, yearLevel, section } = row.original.target;
                const targetParts = [];
                if (course !== 'all') targetParts.push(`Course: ${course}`);
                if (yearLevel !== 'all') targetParts.push(`Year: ${yearLevel}`);
                if (section !== 'all') targetParts.push(`Section: ${section}`);
                return targetParts.length > 0 ? targetParts.join(', ') : 'All';
            },
        },
         {
            accessorKey: "author",
            header: "Author",
             cell: ({ row }) => row.original.author || 'System',
        },
        // Add delete/edit actions if needed
    ], []);


  const courseOptions = React.useMemo(() => [{ value: 'all', label: 'All Courses' }, ...getDistinctValues(sections, 'course')], [sections]);
  const yearLevelOptions = React.useMemo(() => [{ value: 'all', label: 'All Year Levels' }, ...getDistinctValues(sections, 'yearLevel')], [sections]);
  const sectionOptions = React.useMemo(() => [{ value: 'all', label: 'All Sections' }, ...getDistinctValues(sections, 'sectionCode')], [sections]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Section Management & Announcements</h1> {/* Updated Title */}
        {/* Add Announcement Button */}
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Button type="button" variant="outline" onClick={() => setIsAnnounceModalOpen(false)} disabled={announcementForm.formState.isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={announcementForm.formState.isSubmitting}>
                        {announcementForm.formState.isSubmitting ? 'Posting...' : 'Post Announcement'}
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
                {isLoadingSections ? (
                    <p>Loading sections...</p>
                ) : (
                    <DataTable columns={sectionColumns} data={sections} />
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Recent Announcements</CardTitle>
                 <CardDescription>View previously posted announcements.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoadingAnnouncements ? (
                    <p>Loading announcements...</p>
                ) : (
                    <DataTable columns={announcementColumns} data={announcements} />
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
                        {/* Option to unassign */}
                        <SelectItem value={"0"}>--- Unassign Adviser ---</SelectItem>
                        {isLoadingTeachers ? (
                            <SelectItem value="loading" disabled>Loading advisers...</SelectItem>
                        ) : (
                            teachers
                                // Filter out teachers already assigned to other sections (excluding the current one)
                                .filter(teacher => !assignedAdviserIds.includes(teacher.id) || teacher.id === selectedSection?.adviserId)
                                .map((teacher) => (
                                    <SelectItem key={teacher.id} value={String(teacher.id)}>
                                        {teacher.firstName} {teacher.lastName} ({teacher.department})
                                    </SelectItem>
                                ))
                        )}
                         {teachers.length > 0 && !isLoadingTeachers && teachers.filter(teacher => !assignedAdviserIds.includes(teacher.id) || teacher.id === selectedSection?.adviserId).length === 0 && (
                            <SelectItem value="no-available" disabled>No available advisers</SelectItem>
                         )}

                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)} disabled={assignAdviserForm.formState.isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={assignAdviserForm.formState.isSubmitting}>
                  {assignAdviserForm.formState.isSubmitting ? 'Assigning...' : 'Assign Adviser'}
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
                teachers={teachers}
                assignments={selectedSectionAssignments}
                onAddAssignment={handleAddSubjectAssignment}
                onDeleteAssignment={handleDeleteSubjectAssignment}
                isLoadingAssignments={isLoadingAssignments}
                isLoadingSubjects={isLoadingSubjects}
                isLoadingTeachers={isLoadingTeachers}
            />
         )}
    </div>
  );
}
