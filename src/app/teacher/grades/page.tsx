
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import { SubmitGradesModal } from "@/components/submit-grades-modal"; // Import the new grade form modal
import type { StudentSubjectAssignmentWithGrades, Subject, Term } from "@/types"; // Use the new type
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
import { Badge } from "@/components/ui/badge"; // Import Badge


// Mock Data - Replace with API calls based on teacher's assigned subjects/students
// This function should fetch student assignments for the logged-in teacher, including grade placeholders
const getTeacherStudentAssignments = async (): Promise<StudentSubjectAssignmentWithGrades[]> => {
  console.log(`Fetching student assignments for teacher...`);
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate fetch delay

  // In real app, fetch from backend: /api/teacher/assignments/grades
  // Data should include student info, subject info, and potentially existing grades
  return [
    // Student 1 - Subject A
    { assignmentId: "ssa-1-CS101", studentId: 1, studentName: "John Doe", subjectId: "CS101", subjectName: "Intro to Programming", section: "10A", year: "1st Year", prelimGrade: 85, midtermGrade: 88, finalGrade: 90, status: "Complete" },
    // Student 1 - Subject B
    { assignmentId: "ssa-1-MATH101", studentId: 1, studentName: "John Doe", subjectId: "MATH101", subjectName: "Mathematics 101", section: "10A", year: "1st Year", prelimGrade: 92, midtermGrade: null, finalGrade: null, status: "Incomplete", prelimRemarks: "Excellent start!" }, // Missing midterm/final
    // Student 2 - Subject A
    { assignmentId: "ssa-2-CS101", studentId: 3, studentName: "Peter Jones", subjectId: "CS101", subjectName: "Intro to Programming", section: "10A", year: "1st Year", prelimGrade: 78, midtermGrade: 82, finalGrade: 80, status: "Complete" },
    // Student 3 - Subject C (Different Year/Section)
    { assignmentId: "ssa-3-IT202", studentId: 5, studentName: "David Wilson", subjectId: "IT202", subjectName: "Networking Fundamentals", section: "20B", year: "2nd Year", prelimGrade: null, midtermGrade: null, finalGrade: null, status: "Not Submitted" }, // No grades submitted
     // Student 4 - Subject C
    { assignmentId: "ssa-4-IT202", studentId: 2, studentName: "Jane Smith", subjectId: "IT202", subjectName: "Networking Fundamentals", section: "20B", year: "2nd Year", prelimGrade: "A-", midtermGrade: "B+", finalGrade: "B", status: "Complete" }, // Letter grades
    { assignmentId: "ssa-5-BA301", studentId: 4, studentName: "Mary Brown", subjectId: "BA301", subjectName: "Marketing Principles", section: "30C", year: "3rd Year", prelimGrade: "INC", midtermGrade: 80, finalGrade: null, status: "Incomplete", prelimRemarks: "Missing Prelim Paper" }, // INC grade
    { assignmentId: "ssa-6-CS101", studentId: 1, studentName: "John Doe", subjectId: "CS101", subjectName: "Intro to Programming", section: "10A", year: "1st Year", prelimGrade: 70, midtermGrade: 65, finalGrade: 72, status: "Complete" }, // Example Failed
  ];
};

// Mock subjects taught by the teacher
const getTeacherSubjects = async (): Promise<Subject[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
        { id: "CS101", name: "Intro to Programming" },
        { id: "MATH101", name: "Mathematics 101" },
        { id: "IT202", name: "Networking Fundamentals" },
        { id: "BA301", name: "Marketing Principles" },
    ];
};

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
    const distinct = [...new Set(data.map(item => item[key]).filter(Boolean))];
    return distinct.map(value => ({ value, label: value }));
}


export default function SubmitGradesPage() {
  const [allAssignments, setAllAssignments] = React.useState<StudentSubjectAssignmentWithGrades[]>([]);
  const [filteredAssignments, setFilteredAssignments] = React.useState<StudentSubjectAssignmentWithGrades[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>("all");
  const [selectedYearLevel, setSelectedYearLevel] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGradeModalOpen, setIsGradeModalOpen] = React.useState(false);
  const [selectedAssignment, setSelectedAssignment] = React.useState<StudentSubjectAssignmentWithGrades | null>(null);
  const { toast } = useToast();

  // Fetch initial data (all assignments and subjects for the teacher)
  React.useEffect(() => {
      const fetchData = async () => {
          setIsLoading(true);
          try {
              const [assignmentsData, subjectsData] = await Promise.all([
                  getTeacherStudentAssignments(),
                  getTeacherSubjects(),
              ]);
              setAllAssignments(assignmentsData);
              setFilteredAssignments(assignmentsData); // Initially show all
              setSubjects([{ id: "all", name: "All Subjects" }, ...subjectsData]); // Add "all" option
          } catch (error) {
              console.error("Failed to fetch grading data:", error);
              toast({ variant: "destructive", title: "Error", description: "Could not load necessary data." });
          } finally {
              setIsLoading(false);
          }
      };
      fetchData();
  }, [toast]);

  // Filter assignments based on selected subject and year level
  React.useEffect(() => {
      let filtered = allAssignments;

      if (selectedSubjectId !== "all") {
          filtered = filtered.filter(a => a.subjectId === selectedSubjectId);
      }

      if (selectedYearLevel !== "all") {
          filtered = filtered.filter(a => a.year === selectedYearLevel);
      }

      setFilteredAssignments(filtered);
  }, [selectedSubjectId, selectedYearLevel, allAssignments]);


  // Handle opening the grade input modal
  const handleGradeInputClick = (assignment: StudentSubjectAssignmentWithGrades) => {
    setSelectedAssignment(assignment);
    setIsGradeModalOpen(true);
  };

  // Mock Submit Grade Function (called from SubmitGradesModal)
  const handleGradeSubmit = async (values: Omit<StudentSubjectAssignmentWithGrades, 'studentName' | 'subjectName' | 'section' | 'year' | 'status'>) => {
    if (!selectedAssignment) return;
    console.log(`Submitting grades for assignment: ${values.assignmentId}`, values);
    // Simulate API call to save the grades for all terms
    await new Promise(resolve => setTimeout(resolve, 600));

    // Update the local state to reflect the submitted grades
    const updateAssignment = (prev: StudentSubjectAssignmentWithGrades[]) =>
        prev.map(assign =>
            assign.assignmentId === values.assignmentId
            ? {
                ...assign,
                prelimGrade: values.prelimGrade,
                prelimRemarks: values.prelimRemarks,
                midtermGrade: values.midtermGrade,
                midtermRemarks: values.midtermRemarks,
                finalGrade: values.finalGrade,
                finalRemarks: values.finalRemarks,
                // Recalculate status based on submitted grades
                status: (values.prelimGrade !== null && values.midtermGrade !== null && values.finalGrade !== null)
                        ? 'Complete'
                        : (values.prelimGrade !== null || values.midtermGrade !== null || values.finalGrade !== null)
                            ? 'Incomplete'
                            : 'Not Submitted' as 'Complete' | 'Incomplete' | 'Not Submitted'
              }
            : assign
        );

     setAllAssignments(updateAssignment);
    // The useEffect for filtering will update filteredAssignments automatically

    toast({ title: "Grades Submitted", description: `Grades for ${selectedAssignment.subjectName} submitted for ${selectedAssignment.studentName}.` });
    // Modal is closed by the modal component itself on success
  };


  // Define columns for the student assignments DataTable
  const columns: ColumnDef<StudentSubjectAssignmentWithGrades>[] = React.useMemo(() => [
    {
        accessorKey: "studentName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student Name" />,
    },
    {
        accessorKey: "subjectName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
    },
     {
        accessorKey: "year",
         header: "Year", // Keep simple header for display
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
        accessorKey: "status", // Keep accessorKey as status for data access
        header: "Remarks", // Change header label
         cell: ({ row }) => {
            const assignment = row.original;
            const status = assignment.status;
            const finalGrade = assignment.finalGrade;

            if (status === 'Complete') {
                let numericGrade: number | null = null;
                let isLetterPassed = false;
                let isLetterFailed = false;

                if (typeof finalGrade === 'number') {
                    numericGrade = finalGrade;
                } else if (typeof finalGrade === 'string') {
                    const upperGrade = finalGrade.toUpperCase();
                    // Define passing letter grades
                    if (['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'P'].includes(upperGrade)) {
                        isLetterPassed = true;
                    }
                     // Define failing letter grades explicitly
                    else if (['F', 'INC', 'DRP'].includes(upperGrade)) {
                         isLetterFailed = true;
                    }
                    // Handle other potential string grades if necessary
                }

                // Define passing criteria (numeric >= 75 OR passing letter grade)
                const isPassed = (numericGrade !== null && numericGrade >= 75) || isLetterPassed;

                if (isPassed) {
                    return <Badge variant="default">Passed</Badge>;
                } else {
                    // Includes numeric fail, F, INC, DRP, or unhandled letter grades
                    return <Badge variant="destructive">Failed</Badge>;
                }

            } else {
                // If status is not 'Complete', show the status itself
                let variant: "secondary" | "outline" = "secondary";
                if (status === 'Incomplete') variant = 'outline';
                return <Badge variant={variant}>{status}</Badge>;
            }
         },
          enableSorting: false, // Disable sorting for this complex cell
         enableHiding: false, // Keep visible
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
  ], []); // Empty dependency array


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Submit Student Grades</h1>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Filter Students</CardTitle>
                <CardDescription>Select Subject and Year Level to filter the list of students.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
                 {/* Subject Filter */}
                 <div className="flex-1 space-y-1">
                    <Label htmlFor="subject-filter">Subject</Label>
                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                        <SelectTrigger id="subject-filter">
                            <SelectValue placeholder="Select subject..." />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                            </SelectItem>
                            ))}
                            {subjects.length === 0 && <SelectItem value="loading" disabled>Loading subjects...</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
                 {/* Year Level Filter */}
                 <div className="flex-1 space-y-1">
                    <Label htmlFor="year-filter">Year Level</Label>
                    <Select value={selectedYearLevel} onValueChange={setSelectedYearLevel}>
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
            </CardContent>
        </Card>


         <Card>
            <CardHeader>
                <CardTitle>Student Grades Overview</CardTitle>
                 <CardDescription>
                     View student list based on filters. Click 'Input Grades' to enter Prelim, Midterm, and Final grades.
                     {selectedSubjectId !== 'all' && ` Currently showing: ${subjects.find(s => s.id === selectedSubjectId)?.name}`}
                     {selectedYearLevel !== 'all' && ` | ${selectedYearLevel}`}
                 </CardDescription>
            </CardHeader>
             <CardContent>
                {isLoading ? (
                    <p>Loading student assignments...</p>
                ) : (
                     <DataTable
                        columns={columns}
                        data={filteredAssignments}
                        searchPlaceholder="Search by student name..."
                        searchColumnId="studentName"
                         // Removed filterableColumnHeaders for the status/remarks column
                     />
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
