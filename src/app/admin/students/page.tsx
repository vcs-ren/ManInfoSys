
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import { UserForm, type FormFieldConfig } from "@/components/user-form"; // Import FormFieldConfig type
import { studentSchema } from "@/lib/schemas";
import type { Student, StudentStatus } from "@/types"; // Import Student and StudentStatus types
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
} from "@/components/ui/alert-dialog"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


// Mock Data - Replace with API call
const getStudents = async (): Promise<Student[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 1, studentId: "s1001", firstName: "John", lastName: "Doe", course: "Computer Science", status: "Continuing", section: "A", email: "john.doe@example.com", phone: "111-222-3333", emergencyContact: "999-888-7777" },
    { id: 2, studentId: "s1002", firstName: "Jane", lastName: "Smith", course: "Information Technology", status: "New", section: "B", email: "jane.smith@example.com" },
    { id: 3, studentId: "s1003", firstName: "Peter", lastName: "Jones", course: "Computer Science", status: "Continuing", section: "A", emergencyContact: "123-123-1234" },
    { id: 4, studentId: "s1004", firstName: "Mary", lastName: "Brown", course: "Business Administration", status: "Transferee", section: "C", email: "mary.brown@example.com", phone: "444-555-6666" },
    { id: 5, studentId: "s1005", firstName: "David", lastName: "Wilson", course: "Information Technology", status: "Returnee", section: "B" },
  ];
};

// Define course options for dropdown
const courseOptions = [
  { value: "Computer Science", label: "Computer Science" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Business Administration", label: "Business Administration" },
  // Add more courses as needed
];

// Define status options for dropdown
const statusOptions: { value: StudentStatus; label: string }[] = [
    { value: "New", label: "New" },
    { value: "Transferee", label: "Transferee" },
    { value: "Continuing", label: "Continuing" },
    { value: "Returnee", label: "Returnee" },
];


// Define form fields for the UserForm component
const studentFormFields: FormFieldConfig<Student>[] = [
  { name: "firstName", label: "First Name", placeholder: "Enter first name", required: true },
  { name: "lastName", label: "Last Name", placeholder: "Enter last name", required: true },
  { name: "course", label: "Course", type: "select", options: courseOptions, placeholder: "Select a course", required: true }, // Use select type
  { name: "status", label: "Status", type: "select", options: statusOptions, placeholder: "Select status", required: true }, // Use select type for status
  // Section field removed - will be assigned randomly
  { name: "email", label: "Email", placeholder: "Enter email (optional)", type: "email" },
  { name: "phone", label: "Phone", placeholder: "Enter phone (optional)", type: "tel" },
  { name: "emergencyContact", label: "Emergency Contact", placeholder: "Enter emergency contact # (optional)", type: "tel" }, // Added emergency contact
];


export default function ManageStudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const { toast } = useToast();


  React.useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const data = await getStudents();
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
         toast({ variant: "destructive", title: "Error", description: "Failed to load student data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [toast]); // Add toast as dependency

  // Mock Add Student Function
  const handleAddStudent = async (values: Omit<Student, 'id' | 'studentId' | 'section'>) => {
    console.log("Adding student:", values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const newId = Math.max(0, ...students.map(s => s.id)) + 1;
    const newStudentId = `s100${newId}`; // Simulate ID generation
    const randomSection = ['A', 'B', 'C'][Math.floor(Math.random() * 3)]; // Assign random section
    const newStudent: Student = {
        ...values,
        id: newId,
        studentId: newStudentId,
        section: randomSection, // Add the generated section
        status: values.status, // Ensure status is included
        emergencyContact: values.emergencyContact // Include emergency contact
    };
    setStudents(prev => [...prev, newStudent]);
    // In real app: POST to PHP backend, get back the full student object with ID/studentId/section
     toast({ title: "Student Added", description: `${values.firstName} ${values.lastName} (Section ${randomSection}) has been added.` });
  };

   // Mock Edit Student Function
  const handleEditStudent = async (values: Student) => {
    console.log("Editing student:", values);
     if (!selectedStudent) return;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
     // Note: In this mock, we don't re-assign section on edit, keeping the original.
     // If section *should* change on edit based on some logic, implement here.
     const updatedStudent = {
         ...selectedStudent, // Start with original data
         ...values, // Apply form changes
         status: values.status, // Ensure status is included
         emergencyContact: values.emergencyContact, // Include emergency contact update
         // section: selectedStudent.section // Keep original section (or re-assign if needed)
     }
    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s));
     toast({ title: "Student Updated", description: `${values.firstName} ${values.lastName} has been updated.` });
    closeEditModal(); // Close modal after successful edit
  };

   // Mock Delete Student Function
  const handleDeleteStudent = async (studentId: number) => {
      console.log("Deleting student with ID:", studentId);
        // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setStudents(prev => prev.filter(s => s.id !== studentId));
      toast({ title: "Student Deleted", description: `Student record has been removed.` });
  };

  const handleRowClick = (student: Student) => {
     console.log("Row clicked:", student);
    setSelectedStudent(student);
    setIsEditModalOpen(true); // Open the edit modal on row click
  };

   const closeEditModal = () => {
    setSelectedStudent(null);
    setIsEditModalOpen(false);
  };


    // Define columns for the DataTable
    const columns: ColumnDef<Student>[] = React.useMemo(() => [
         {
            accessorKey: "studentId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Student ID" />,
            cell: ({ row }) => <div>{row.getValue("studentId")}</div>,
        },
        {
            accessorKey: "firstName",
             header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" />,
            cell: ({ row }) => <div className="capitalize">{row.getValue("firstName")}</div>,
        },
        {
            accessorKey: "lastName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
            cell: ({ row }) => <div className="capitalize">{row.getValue("lastName")}</div>,
        },
         {
            accessorKey: "course",
             header: ({ column }) => { // Use explicit return
                 return (
                     <DataTableFilterableColumnHeader
                         column={column} // Pass column object
                         title="Course"
                         options={courseOptions} // Use defined course options
                     />
                 );
             },
            cell: ({ row }) => <div>{row.getValue("course")}</div>,
             filterFn: (row, id, value) => {
                 return value.includes(row.getValue(id))
             },
        },
         {
            accessorKey: "status",
             header: ({ column }) => ( // Use implicit return with parentheses
                     <DataTableFilterableColumnHeader
                         column={column} // Pass column object
                         title="Status"
                         options={statusOptions} // Use defined status options
                     />
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("status")}</div>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "section",
            header: ({ column }) => { // Use explicit return
                 return (
                    <DataTableFilterableColumnHeader
                        column={column} // Pass column object
                        title="Section"
                        options={[ // Should be dynamic based on available sections
                            { label: "A", value: "A" },
                            { label: "B", value: "B" },
                            { label: "C", value: "C" },
                        ]}
                    />
                 );
            },
            cell: ({ row }) => <div className="text-center">{row.getValue("section")}</div>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
         {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div className="lowercase">{row.getValue("email") || '-'}</div>, // Handle missing email
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <div>{row.getValue("phone") || '-'}</div>,
        },
         {
            accessorKey: "emergencyContact",
            header: "Emergency Contact",
            cell: ({ row }) => <div>{row.getValue("emergencyContact") || '-'}</div>,
        },
        // Actions column is added dynamically in the DataTable component
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], []); // Empty dependency array as columns don't depend on component state here


      // Function to generate dropdown menu items for each row
    const generateActionMenuItems = (student: Student) => (
        <>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowClick(student); }}>
            <Edit className="mr-2 h-4 w-4" />
            Edit / View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
         <AlertDialog>
                <AlertDialogTrigger asChild>
                     {/* Prevent dialog trigger from triggering row click */}
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                         <Trash2 className="mr-2 h-4 w-4" />
                         Delete
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the student
                        record for {student.firstName} {student.lastName}.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => handleDeleteStudent(student.id)}
                        className={buttonVariants({ variant: "destructive" })} // Use buttonVariants
                        >
                        Yes, delete student
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Students</h1>
        {/* Add Student Form - Trigger controls its visibility */}
        <UserForm<Student>
          trigger={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Student
            </Button>
          }
          formSchema={studentSchema}
          // Adjust onSubmit type to match the form values (without section)
          onSubmit={handleAddStudent as any}
          title="Add New Student"
          description="Fill in the details below to add a new student. Section will be assigned automatically."
          formFields={studentFormFields} // Pass the updated fields
        />
      </div>

      {isLoading ? (
         <p>Loading student data...</p> // Replace with Skeleton loader if desired
       ) : (
            <DataTable
                columns={columns}
                data={students}
                searchPlaceholder="Search by first name..."
                searchColumnId="firstName"
                onRowClick={handleRowClick}
                actionMenuItems={generateActionMenuItems}
            />
        )}


      {/* Edit Modal - Controlled externally */}
      {selectedStudent && (
           <UserForm<Student>
              // Use React state to control the dialog's open state
              isOpen={isEditModalOpen}
              onOpenChange={setIsEditModalOpen} // Pass the state setter
              formSchema={studentSchema}
              onSubmit={handleEditStudent}
              title={`Edit Student: ${selectedStudent.firstName} ${selectedStudent.lastName}`}
              description="Update the student's information below. Username, password, and section are managed by the system."
              formFields={studentFormFields.map(f => ({...f, disabled: false }))} // Ensure fields are initially enabled
              isEditMode={true}
              initialData={selectedStudent} // Pass current data
            />
      )}
    </div>
  );
}
