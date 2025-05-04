
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BookOpenCheck, Loader2 } from "lucide-react";

import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import type { Grade } from "@/types"; // Using the updated Grade type
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Mock Data - Replace with API call to get grades for the logged-in student
// Data should now align with the Grade type (subject, grade, remarks)
const getStudentGrades = async (): Promise<Grade[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  // In real app, fetch from backend: /api/student/grades
  // Remarks could be system-generated (Passed/Failed/INC) or teacher's notes
  return [
    { subject: "Mathematics 101", grade: "A-", remarks: "Passed - Excellent work!" },
    { subject: "Physics 202", grade: 85, remarks: "Passed - Good understanding of concepts." },
    { subject: "English Literature", grade: "B+", remarks: "Passed" },
    { subject: "History 101", grade: "INC", remarks: "Failed - Missing final paper." }, // INC is a failing grade here
    { subject: "Physical Education", grade: "P", remarks: "Passed" },
    { subject: "Introduction to Programming", grade: 72, remarks: "Failed - Requires Improvement" }, // Example numeric failed grade
  ];
};


export default function ViewGradesPage() {
  const [grades, setGrades] = React.useState<Grade[]>([]);
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


  // Define columns for the DataTable
  const columns: ColumnDef<Grade>[] = React.useMemo(() => [
    {
        accessorKey: "subject",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Subject" />;
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue("subject")}</div>,
    },
    {
        accessorKey: "grade",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Grade" />;
        },
        cell: ({ row }) => <div className="text-center font-semibold">{String(row.getValue("grade"))}</div>, // Ensure grade is string for display
    },
    {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => <div>{row.getValue("remarks") || <span className="text-muted-foreground italic">No remarks</span>}</div>,
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
            <CardTitle>Grade Summary</CardTitle>
            <CardDescription>Overview of your academic performance. Remarks indicate the final status.</CardDescription>
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

      {/* Maybe add GPA calculation section later */}
        <Card>
             <CardHeader>
                 <CardTitle>GPA (Placeholder)</CardTitle>
                 <CardDescription>Your calculated Grade Point Average.</CardDescription>
             </CardHeader>
             <CardContent>
                 <p className="text-lg font-semibold text-primary">N/A</p>
                 <p className="text-xs text-muted-foreground mt-1">GPA calculation is not yet implemented.</p>
             </CardContent>
        </Card>
    </div>
  );
}
