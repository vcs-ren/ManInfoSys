
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { GradeInputForm } from "@/components/grade-input-form"; // Import the grade form
import type { Student, Grade } from "@/types";
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


// Mock Data - Replace with API calls based on selected section
const getStudentsBySection = async (section: string): Promise<Student[]> => {
  console.log(`Fetching students for section: ${section}`);
  await new Promise(resolve => setTimeout(resolve, 400)); // Simulate fetch delay
  // In real app, fetch from backend: /api/students?section=section
  if (section === "Section A") {
    return [
      { id: 1, studentId: "s1001", firstName: "John", lastName: "Doe", course: "Computer Science", status: "Continuing", section: "A" },
      { id: 3, studentId: "s1003", firstName: "Peter", lastName: "Jones", course: "Computer Science", status: "Continuing", section: "A" },
    ];
  } else if (section === "Section B") {
     return [
      { id: 2, studentId: "s1002", firstName: "Jane", lastName: "Smith", course: "Information Technology", status: "New", section: "B" },
      { id: 5, studentId: "s1005", firstName: "David", lastName: "Wilson", course: "Information Technology", status: "Returnee", section: "B" },
    ];
  }
  return []; // Return empty if section not found or no students
};

// Mock sections assigned to the teacher
const getTeacherSections = async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return ["Section A", "Section B", "Section C"]; // Example sections
};


export default function SubmitGradesPage() {
  const [sections, setSections] = React.useState<string[]>([]);
  const [selectedSection, setSelectedSection] = React.useState<string>("");
  const [students, setStudents] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGradeFormOpen, setIsGradeFormOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const { toast } = useToast();


  // Fetch available sections for the teacher on mount
  React.useEffect(() => {
      const fetchSections = async () => {
          try {
              const data = await getTeacherSections();
              setSections(data);
              if (data.length > 0) {
                  // Optionally select the first section by default
                  // setSelectedSection(data[0]);
              }
          } catch (error) {
              console.error("Failed to fetch sections:", error);
              toast({ variant: "destructive", title: "Error", description: "Could not load sections." });
          }
      };
      fetchSections();
  }, [toast]);


  // Fetch students when selectedSection changes
  React.useEffect(() => {
    if (selectedSection) {
      const fetchStudents = async () => {
        setIsLoading(true);
        setStudents([]); // Clear previous students
        try {
          const data = await getStudentsBySection(selectedSection);
          setStudents(data);
        } catch (error) {
          console.error("Failed to fetch students:", error);
           toast({ variant: "destructive", title: "Error", description: `Failed to load students for ${selectedSection}.` });
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudents();
    } else {
        setStudents([]); // Clear students if no section is selected
    }
  }, [selectedSection, toast]); // Rerun when selectedSection or toast changes


  // Handle opening the grade input form
  const handleGradeInputClick = (student: Student) => {
    setSelectedStudent(student);
    setIsGradeFormOpen(true);
  };

  // Mock Submit Grade Function (called from GradeInputForm)
  const handleGradeSubmit = async (values: Grade) => {
    if (!selectedStudent) return;
    console.log(`Submitting grade for ${selectedStudent.studentId}`, values);
    // Simulate API call to save the grade
    await new Promise(resolve => setTimeout(resolve, 600));
    // Here you might want to update the UI to show the submitted grade in the table,
    // or refetch grades for the student/section. For simplicity, we just log it.
    toast({ title: "Grade Submitted", description: `Grade for ${values.subject} submitted for ${selectedStudent.firstName}.` });
    // No need to close the modal here, GradeInputForm handles it on success
  };

  // Define columns for the student list DataTable
  const columns: ColumnDef<Student>[] = React.useMemo(() => [
    {
        accessorKey: "studentId",
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} title="Student ID" />;
        },
    },
    {
        accessorKey: "firstName",
        header: "First Name",
    },
    {
        accessorKey: "lastName",
         header: "Last Name",
    },
    {
        accessorKey: "status", // Added status column
         header: "Status",
    },
    // Potentially add a column to show existing grade status if available
    // {
    //     accessorKey: "gradeStatus", // This key needs data mapping
    //     header: "Grade Status",
    //     cell: ({ row }) => <span>Not Submitted</span> // Example placeholder
    // },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleGradeInputClick(row.original)}
        >
          <Edit className="mr-2 h-4 w-4" /> Input Grade
        </Button>
      ),
    },
  ], []); // Empty dependency array

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Submit Grades</h1>

        <Card>
            <CardHeader>
                <CardTitle>Select Section</CardTitle>
                <CardDescription>Choose the section to view students and submit grades.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="max-w-xs">
                    <Label htmlFor="section-select">Section</Label>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger id="section-select">
                            <SelectValue placeholder="Select a section..." />
                        </SelectTrigger>
                        <SelectContent>
                            {sections.map((sec) => (
                            <SelectItem key={sec} value={sec}>
                                {sec}
                            </SelectItem>
                            ))}
                            {sections.length === 0 && <SelectItem value="loading" disabled>Loading sections...</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>


      {selectedSection && (
         <Card>
            <CardHeader>
                <CardTitle>Student List - {selectedSection}</CardTitle>
                 <CardDescription>Click 'Input Grade' to submit grades for a student.</CardDescription>
            </CardHeader>
             <CardContent>
                {isLoading ? (
                    <p>Loading students...</p>
                ) : students.length > 0 ? (
                    <DataTable columns={columns} data={students} />
                ) : (
                    <p>No students found in this section.</p>
                )}
             </CardContent>
         </Card>
      )}


      {/* Grade Input Modal */}
      {selectedStudent && (
        <GradeInputForm
          isOpen={isGradeFormOpen}
          onOpenChange={setIsGradeFormOpen}
          student={selectedStudent}
          onSubmit={handleGradeSubmit}
           // Optionally pre-fill subject or load existing grade data here
          // subject="Default Subject Name"
          // initialGradeData={ /* fetch existing grade if editing */ }
        />
      )}
    </div>
  );
}

