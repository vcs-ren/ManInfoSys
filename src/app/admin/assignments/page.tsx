
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCheck, PlusCircle, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import type { Section, Teacher, Announcement } from "@/types";
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
import { assignTeacherSchema, announcementSchema } from "@/lib/schemas";

type AssignTeacherFormValues = z.infer<typeof assignTeacherSchema>;
type AnnouncementFormValues = z.infer<typeof announcementSchema>;

// Mock Data - Replace with API calls
const getSections = async (): Promise<Section[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Fetch all sections, potentially with teacher info joined
  return [
    { id: "CS-10A", sectionCode: "10A", course: "Computer Science", yearLevel: "1st Year", teacherId: 1, teacherName: "Alice Johnson" },
    { id: "IT-10B", sectionCode: "10B", course: "Information Technology", yearLevel: "1st Year" },
    { id: "CS-20A", sectionCode: "20A", course: "Computer Science", yearLevel: "2nd Year" },
    { id: "BA-30C", sectionCode: "30C", course: "Business Administration", yearLevel: "3rd Year", teacherId: 4, teacherName: "Diana Miller" },
    { id: "IT-20B", sectionCode: "20B", course: "Information Technology", yearLevel: "2nd Year", teacherId: 2, teacherName: "Bob Williams" },
  ];
};

const getTeachers = async (): Promise<Teacher[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 1, teacherId: "t1001", firstName: "Alice", lastName: "Johnson", department: "Mathematics" },
    { id: 2, teacherId: "t1002", firstName: "Bob", lastName: "Williams", department: "Science" },
    { id: 3, teacherId: "t1003", firstName: "Charlie", lastName: "Davis", department: "English" },
    { id: 4, teacherId: "t1004", firstName: "Diana", lastName: "Miller", department: "Science" },
  ];
};

const getAnnouncements = async (): Promise<Announcement[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
        { id: "ann1", title: "Midterm Schedule Update", content: "The midterm exam schedule has been updated. Please check the portal.", date: new Date("2024-07-25"), target: { course: 'all', yearLevel: 'all', section: 'all' }, author: "Admin" },
        { id: "ann2", title: "CS Department Meeting", content: "Mandatory meeting for all Computer Science students on Friday.", date: new Date("2024-07-28"), target: { course: 'Computer Science', yearLevel: 'all', section: 'all' }, author: "Admin" },
    ];
}

// Helper to get distinct values for filtering
const getDistinctValues = (data: any[], key: string): { value: string; label: string }[] => {
    const distinct = [...new Set(data.map(item => item[key]).filter(Boolean))];
    return distinct.map(value => ({ value, label: value }));
}

export default function AssignmentsAnnouncementsPage() {
  const [sections, setSections] = React.useState<Section[]>([]);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [isLoadingSections, setIsLoadingSections] = React.useState(true);
  const [isLoadingTeachers, setIsLoadingTeachers] = React.useState(true);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = React.useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = React.useState(false);
  const [selectedSection, setSelectedSection] = React.useState<Section | null>(null);
  const { toast } = useToast();

  const assignTeacherForm = useForm<AssignTeacherFormValues>({
    resolver: zodResolver(assignTeacherSchema),
    defaultValues: { teacherId: undefined },
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
      setIsLoadingAnnouncements(true);
      try {
        const [sectionsData, teachersData, announcementsData] = await Promise.all([
          getSections(),
          getTeachers(),
          getAnnouncements(),
        ]);
        setSections(sectionsData);
        setTeachers(teachersData);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load page data." });
      } finally {
        setIsLoadingSections(false);
        setIsLoadingTeachers(false);
        setIsLoadingAnnouncements(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleOpenAssignModal = (section: Section) => {
    setSelectedSection(section);
    assignTeacherForm.reset({ teacherId: section.teacherId }); // Pre-fill if already assigned
    setIsAssignModalOpen(true);
  };

  const handleAssignTeacher = async (values: AssignTeacherFormValues) => {
    if (!selectedSection) return;
    console.log(`Assigning Teacher ID: ${values.teacherId} to Section: ${selectedSection.sectionCode}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const assignedTeacher = teachers.find(t => t.id === values.teacherId);
    setSections(prev =>
      prev.map(sec =>
        sec.id === selectedSection.id
          ? { ...sec, teacherId: values.teacherId, teacherName: assignedTeacher ? `${assignedTeacher.firstName} ${assignedTeacher.lastName}` : 'N/A' }
          : sec
      )
    );
    toast({ title: "Teacher Assigned", description: `Teacher assigned successfully to ${selectedSection.sectionCode}.` });
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
      accessorKey: "teacherName",
      header: "Assigned Teacher",
      cell: ({ row }) => row.original.teacherName || <span className="text-muted-foreground italic">Not Assigned</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenAssignModal(row.original)}
        >
          <UserCheck className="mr-2 h-4 w-4" /> Assign Teacher
        </Button>
      ),
    },
  ], [handleOpenAssignModal]);

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
        <h1 className="text-3xl font-bold">Assignments & Announcements</h1>
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
                <CardDescription>Assign teachers to class sections.</CardDescription>
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


      {/* Assign Teacher Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Teacher to {selectedSection?.sectionCode}</DialogTitle>
            <DialogDescription>
                Select a teacher for {selectedSection?.course} - {selectedSection?.yearLevel}.
                Current: {selectedSection?.teacherName || 'None'}
            </DialogDescription>
          </DialogHeader>
          <Form {...assignTeacherForm}>
            <form onSubmit={assignTeacherForm.handleSubmit(handleAssignTeacher)} className="space-y-4 py-4">
              <FormField
                control={assignTeacherForm.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Teacher</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a teacher..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingTeachers ? (
                            <SelectItem value="loading" disabled>Loading teachers...</SelectItem>
                        ) : (
                            teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={String(teacher.id)}>
                                    {teacher.firstName} {teacher.lastName} ({teacher.department})
                                </SelectItem>
                             ))
                        )}
                         {/* Option to unassign */}
                         <SelectItem value={"0"}>--- Unassign Teacher ---</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)} disabled={assignTeacherForm.formState.isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={assignTeacherForm.formState.isSubmitting}>
                  {assignTeacherForm.formState.isSubmitting ? 'Assigning...' : 'Assign Teacher'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to format date (consider moving to utils)
function format(date: Date | string, formatString: string): string {
    // Basic date formatting, consider using date-fns for more robust formatting
    const d = typeof date === 'string' ? new Date(date) : date;
    if (formatString === 'PP') {
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    // Add more formats as needed
    return d.toISOString();
}
