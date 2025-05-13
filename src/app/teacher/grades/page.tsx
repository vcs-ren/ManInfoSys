
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Filter, Loader2 } from "lucide-react"; // Added Loader2

import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { SubmitGradesModal } from "@/components/submit-grades-modal";
import type { StudentSubjectAssignmentWithGrades, Subject } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { fetchData, postData } from "@/lib/api"; // Import API helpers

// Define valid year levels for filtering
const yearLevelOptions = [
    { value: "all", label: "All Year Levels" },
    { value: "1st Year", label: "1st Year" },
    { value: "2nd Year", label: "2nd Year" },
    { value: "3rd Year", label: "3rd Year" },
    { value: "4th Year", label: "4th Year" },
];

// Helper to get distinct values for filtering
const getDistinctValues = (data: any[], key: keyof any): { value: string; label: string }[] => {
    if (!data) return [];
    const distinct = [...new Set(data.map(item => item[key]).filter(Boolean))];
    distinct.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
    });
    return distinct.map(value => ({ value, label: value }));
}


export default function SubmitGradesPage() {
  const [allAssignments, setAllAssignments] = React.useState<StudentSubjectAssignmentWithGrades[]>([]);
  const [filteredAssignments, setFilteredAssignments] = React.useState<StudentSubjectAssignmentWithGrades[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>("all");
  const [selectedYearLevel, setSelectedYearLevel] = React.useState<string>("all");
  const [selectedSection, setSelectedSection] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGradeModalOpen, setIsGradeModalOpen] = React.useState(false);
  const [selectedAssignment, setSelectedAssignment] = React.useState<StudentSubjectAssignmentWithGrades | null>(null);
  const { toast } = useToast();

  // Fetch initial data using helpers
  React.useEffect(() => {
      const fetchDataAndSubjects = async () => {
          setIsLoading(true);
          try {
            // Mock data for assignments and subjects
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

            const mockAssignmentsData: StudentSubjectAssignmentWithGrades[] = [
                { assignmentId: "1-CS101", studentId: 1, studentName: "Alice Smith", subjectId: "CS101", subjectName: "Introduction to Programming", section: "CS-2A", year: "2nd Year", prelimGrade: 85, prelimRemarks: "Good start", midtermGrade: 90, midtermRemarks: "Excellent", finalGrade: 88, finalRemarks: "Very Good", status: "Complete" },
                { assignmentId: "2-IT202", studentId: 2, studentName: "Bob Johnson", subjectId: "IT202", subjectName: "Networking Fundamentals", section: "IT-1B", year: "1st Year", prelimGrade: null, prelimRemarks: "", midtermGrade: null, midtermRemarks: "", finalGrade: null, finalRemarks: "", status: "Not Submitted" },
                // Add more mock assignment/grade data if needed
            ];

            const mockSubjectsData: Subject[] = [
                { id: "CS101", name: "Introduction to Programming", description: "Basics of programming" },
                { id: "IT202", name: "Networking Fundamentals", description: "Understanding computer networks" },
                { id: "GEN001", name: "Purposive Communication", description: "Effective communication skills" },
            ];


              setAllAssignments(mockAssignmentsData || []);
              setFilteredAssignments(mockAssignmentsData || []);
              setSubjects([{ id: "all", name: "All Courses(subjects)" }, ...(mockSubjectsData || [])]); // Adjusted "All Subjects" label
          } catch (error: any) {
              console.error("Failed to fetch grading data:", error);
              toast({ variant: "destructive", title: "Error", description: error.message || "Could not load grading data. Please refresh." });
          } finally {
              setIsLoading(false);
          }
      };
      fetchDataAndSubjects();
  }, [toast]);

  // Filter assignments based on selections
  React.useEffect(() => {
      let filtered = allAssignments;
      if (selectedSubjectId !== "all") filtered = filtered.filter(a => a.subjectId === selectedSubjectId);
      if (selectedYearLevel !== "all") filtered = filtered.filter(a => a.year === selectedYearLevel);
      if (selectedSection !== "all") filtered = filtered.filter(a => a.section === selectedSection);
      setFilteredAssignments(filtered);
  }, [selectedSubjectId, selectedYearLevel, selectedSection, allAssignments]);


  // Handle opening the grade input modal
  const handleGradeInputClick = (assignment: StudentSubjectAssignmentWithGrades) => {
    setSelectedAssignment(assignment);
    setIsGradeModalOpen(true);
  };

  // Submit Grade Function (API Call using helper)
  const handleGradeSubmit = async (values: Omit<StudentSubjectAssignmentWithGrades, 'studentName' | 'subjectName' | 'section' | 'year' | 'status'>) => {
    if (!selectedAssignment) return;

    const payload = {
        ...values,
        prelimGrade: values.prelimGrade === "" || values.prelimGrade === null ? null : Number(values.prelimGrade),
        midtermGrade: values.midtermGrade === "" || values.midtermGrade === null ? null : Number(values.midtermGrade),
        finalGrade: values.finalGrade === "" || values.finalGrade === null ? null : Number(values.finalGrade),
    };
     console.log(`Submitting grades for assignment: ${values.assignmentId}`, payload);

    try {
        // Simulate POST request
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log("Mock submitting grades:", payload);

        const updatedAssignmentData = {
            ...selectedAssignment,
            ...payload
        };

         // Recalculate status based on submitted grades
        let status: 'Not Submitted' | 'Incomplete' | 'Complete' = 'Not Submitted';
        if (updatedAssignmentData.prelimGrade !== null || updatedAssignmentData.midtermGrade !== null || updatedAssignmentData.finalGrade !== null) {
            status = 'Incomplete';
        }
        if (updatedAssignmentData.finalGrade !== null) {
            status = 'Complete';
        }
        updatedAssignmentData.status = status;

         const updateState = (prev: StudentSubjectAssignmentWithGrades[]) =>
            prev.map(assign =>
                assign.assignmentId === updatedAssignmentData.assignmentId && assign.studentId === updatedAssignmentData.studentId
                ? updatedAssignmentData
                : assign
            );

        setAllAssignments(updateState);
        // Filtered list will update automatically

        toast({ title: "Grades Submitted", description: `Grades for ${selectedAssignment.subjectName} submitted for ${selectedAssignment.studentName}.` });
    } catch (error: any) {
        console.error("Grade submission error:", error);
        toast({
            variant: "destructive",
            title: "Error Submitting Grades",
            description: error.message || `Failed to submit grades. Please try again.`,
        });
         throw error;
    }
  };


  // Define columns for the student assignments DataTable
  const columns: ColumnDef<StudentSubjectAssignmentWithGrades>[] = React.useMemo(() => [
    {
        accessorKey: "studentName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student Name" />,
    },
    ...(selectedSubjectId === 'all' ? [{
        accessorKey: "subjectName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Course(subject)" />, // Changed label
    } as ColumnDef<StudentSubjectAssignmentWithGrades>] : []),
     {
        accessorKey: "year",
         header: "Year",
         cell: ({ row }) => row.original.year,
    },
    {
        accessorKey: "section",
        header: "Section",
        cell: ({ row }) => row.original.section,
    },
     {
        accessorKey: "prelimGrade",
        header: "Prelim",
         cell: ({ row }) => row.original.prelimGrade ?? <span className="text-muted-foreground">-</span>,
    },
     {
        accessorKey: "midtermGrade",
        header: "Midterm",
         cell: ({ row }) => row.original.midtermGrade ?? <span className="text-muted-foreground">-</span>,
    },
     {
        accessorKey: "finalGrade",
        header: "Final",
         cell: ({ row }) => row.original.finalGrade ?? <span className="text-muted-foreground">-</span>,
    },
    {
        accessorKey: "status",
        header: "Remarks",
         cell: ({ row }) => {
            const assignment = row.original;
            const status = assignment.status;
            const finalGrade = assignment.finalGrade;

            if (status === 'Complete' && typeof finalGrade === 'number') {
                const isPassed = finalGrade >= 75; // Assuming 75 is passing
                return (
                     <Badge variant={isPassed ? "default" : "destructive"}>
                        {isPassed ? "Passed" : "Failed"}
                    </Badge>
                );
            } else if (status === 'Incomplete') {
                 return <Badge variant="secondary">In Progress</Badge>;
            } else if (status === 'Not Submitted') {
                 return <Badge variant="outline">Not Submitted</Badge>;
            } else {
                 return <span className="text-muted-foreground">-</span>;
            }
         },
          enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleGradeInputClick(row.original)}
        >
          <Edit className="mr-2 h-4 w-4" /> Input Grades
        </Button>
      ),
    },
  ], [selectedSubjectId]);

   // Calculate section options dynamically based on filtered assignments
    const sectionOptions = React.useMemo(() => {
         let relevantAssignments = allAssignments;
         if (selectedSubjectId !== "all") {
             relevantAssignments = relevantAssignments.filter(a => a.subjectId === selectedSubjectId);
         }
          if (selectedYearLevel !== "all") {
             relevantAssignments = relevantAssignments.filter(a => a.year === selectedYearLevel);
         }
        return [
            { value: 'all', label: 'All Sections' },
            ...getDistinctValues(relevantAssignments, 'section')
        ];
    }, [allAssignments, selectedSubjectId, selectedYearLevel]);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Submit Student Grades</h1>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Filter Students</CardTitle>
                <CardDescription>Select Course(subject), Year Level, and Section to filter the list.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
                 {/* Subject Filter */}
                 <div className="flex-1 space-y-1">
                    <Label htmlFor="subject-filter">Course(subject)</Label>
                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={isLoading}>
                        <SelectTrigger id="subject-filter">
                            <SelectValue placeholder="Select course..." />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                            </SelectItem>
                            ))}
                            {isLoading && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
                 {/* Year Level Filter */}
                 <div className="flex-1 space-y-1">
                    <Label htmlFor="year-filter">Year Level</Label>
                    <Select value={selectedYearLevel} onValueChange={setSelectedYearLevel} disabled={isLoading}>
                        <SelectTrigger id="year-filter">
                            <SelectValue placeholder="Select year level..." />
                        </SelectTrigger>
                        <SelectContent>
                            {yearLevelOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                  {/* Section Filter */}
                 <div className="flex-1 space-y-1">
                    <Label htmlFor="section-filter">Section</Label>
                    <Select value={selectedSection} onValueChange={setSelectedSection} disabled={isLoading}>
                        <SelectTrigger id="section-filter">
                            <SelectValue placeholder="Select section..." />
                        </SelectTrigger>
                        <SelectContent>
                            {sectionOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                            ))}
                             {isLoading && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                             {!isLoading && sectionOptions.length <= 1 && <SelectItem value="no-sections" disabled>No sections found</SelectItem>}
                        </SelectContent>
                    </Select>
                 </div>
            </CardContent>
        </Card>


         <Card>
            <CardHeader>
                <CardTitle>Student Grades Overview</CardTitle>
                 <CardDescription>
                     View student list based on filters. Click 'Input Grades' to enter Prelim, Midterm, and Final grades (0-100).
                     {selectedSubjectId !== 'all' && ` Currently showing: ${subjects.find(s => s.id === selectedSubjectId)?.name}`}
                     {selectedYearLevel !== 'all' && ` | ${selectedYearLevel}`}
                     {selectedSection !== 'all' && ` | Section ${selectedSection}`}
                 </CardDescription>
            </CardHeader>
             <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                         <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading assignments...
                    </div>
                ) : filteredAssignments.length > 0 ? (
                     <DataTable
                        columns={columns}
                        data={filteredAssignments}
                        searchPlaceholder="Search students by ID, name..."
                     />
                ) : (
                    <p className="text-center text-muted-foreground py-10">No students found matching the selected filters.</p>
                )}
             </CardContent>
         </Card>


      {/* Grade Input Modal */}
      {selectedAssignment && (
        <SubmitGradesModal
          isOpen={isGradeModalOpen}
          onOpenChange={setIsGradeModalOpen}
          assignment={selectedAssignment}
          onSubmit={handleGradeSubmit}
        />
      )}
    </div>
  );
}
