"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BookOpenCheck, Loader2 } from "lucide-react";

import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import type { StudentTermGrade } from "@/types"; // Using the updated Grade type
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge"; // Import Badge

// Mock Data - Replace with API call to get grades for the logged-in student
// Data should now align with the StudentTermGrade type and use numeric grades
const getStudentGrades = async (): Promise<StudentTermGrade[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  // In real app, fetch from backend: /api/student/grades
  // Remarks could be system-generated (Passed/Failed) or teacher's notes
  // Status is derived based on whether all grades are submitted
  return [
    { id: "MATH101", subjectName: "Mathematics 101", prelimGrade: 92, midtermGrade: 88, finalGrade: 90, status: "Complete", finalRemarks: "Excellent work!" },
    { id: "PHYS202", subjectName: "Physics 202", prelimGrade: 80, midtermGrade: 85, finalGrade: 85, status: "Complete" },
    { id: "ENGL101", subjectName: "English Literature", prelimGrade: 88, midtermGrade: 90, finalGrade: 91, status: "Complete" }, // Assuming B/B+ translates to numeric
    { id: "HIST101", subjectName: "History 101", prelimGrade: 70, midtermGrade: null, finalGrade: null, status: "Incomplete", finalRemarks: "Missing final paper." }, // Example INC (Incomplete)
    { id: "PE101", subjectName: "Physical Education", prelimGrade: 95, midtermGrade: 95, finalGrade: 95, status: "Complete" }, // Assuming P translates to numeric pass
    { id: "CS101", subjectName: "Introduction to Programming", prelimGrade: 72, midtermGrade: 70, finalGrade: 72, status: "Complete", finalRemarks: "Requires Improvement" }, // Example numeric failed grade
    { id: "IT101", subjectName: "Introduction to IT", prelimGrade: 88, midtermGrade: null, finalGrade: null, status: "Incomplete" }, // Missing grades
    { id: "BA101", subjectName: "Introduction to Business", prelimGrade: null, midtermGrade: null, finalGrade: null, status: "Not Submitted" }, // No grades submitted
  ];
};


export default function ViewGradesPage() {
  const [grades, setGrades] = React.useState<StudentTermGrade[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast(); // Use toast for potential errors

  React.useEffect(() => {
    const fetchGrades = async () => {
      setIsLoading(true);
      try {
        const data = await getStudentGrades();
        setGrades(data);
      } catch (error) {
        console.error("Failed to fetch grades:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load grades." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrades();
  }, [toast]);


  // Define columns for the DataTable, similar to teacher's view
  const columns: ColumnDef<StudentTermGrade>[] = React.useMemo(() => [
    {
        accessorKey: "subjectName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue("subjectName")}</div>,
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
        accessorKey: "status", // Use status for internal logic
        header: "Remarks", // Display "Passed"/"Failed" or progress
        cell: ({ row }) => {
            const gradeData = row.original;
            const status = gradeData.status;
            const finalGrade = gradeData.finalGrade;

            // Check if status is 'Complete' and finalGrade is a number
            if (status === 'Complete' && typeof finalGrade === 'number') {

                // Define passing criteria (numeric >= 75)
                const isPassed = finalGrade >= 75;

                return (
                  <div className="flex flex-col items-start">
                     <Badge variant={isPassed ? "default" : "destructive"}>
                       {isPassed ? "Passed" : "Failed"}
                     </Badge>
                    {gradeData.finalRemarks && (
                       <span className="text-xs text-muted-foreground mt-1 italic">"{gradeData.finalRemarks}"</span>
                    )}
                  </div>
                );

            } else if (status === 'Incomplete') {
                return <Badge variant="secondary">In Progress</Badge>;
            } else if (status === 'Not Submitted') {
                return <Badge variant="outline">Not Submitted</Badge>;
            } else {
                // For cases where status is 'Complete' but finalGrade is not a number (should not happen with new schema)
                // or other unexpected states.
                return <span className="text-muted-foreground">-</span>;
            }
         },
          enableSorting: false,
    },
  ], []);


  return (
    <div className="space-y-6">
        <div className="flex items-center space-x-4">
             <BookOpenCheck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Grades</h1>
        </div>


      <Card>
         <CardHeader>
            <CardTitle>Grade Overview</CardTitle>
            <CardDescription>Summary of your grades per term. Final remarks indicate Passed/Failed status based on a grade of 75 or higher.</CardDescription>
        </CardHeader>
         <CardContent>
            {isLoading ? (
                 <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading grades...</span>
                </div>
            ) : grades.length > 0 ? (
                <DataTable columns={columns} data={grades} />
            ) : (
                 <div className="text-center py-10">
                    <p className="text-muted-foreground">No grades have been submitted yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Please check back later or contact your teachers.</p>
                </div>
            )}
         </CardContent>
      </Card>
    </div>
  );
}
