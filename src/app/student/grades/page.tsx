"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BookOpenCheck, Loader2 } from "lucide-react";

import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import type { StudentTermGrade } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// --- API Helper ---
const fetchData = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
};
// --- End API Helper ---


export default function ViewGradesPage() {
  const [grades, setGrades] = React.useState<StudentTermGrade[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchGrades = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual API endpoint for fetching student grades
        const data = await fetchData<StudentTermGrade[]>('/api/student/grades');
        setGrades(data || []);
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
        accessorKey: "status",
        header: "Remarks",
        cell: ({ row }) => {
            const gradeData = row.original;
            const status = gradeData.status;
            const finalGrade = gradeData.finalGrade;

            if (status === 'Complete' && typeof finalGrade === 'number') {
                const isPassed = finalGrade >= 75; // Assuming 75 is passing grade
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