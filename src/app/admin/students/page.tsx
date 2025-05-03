
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import { UserForm } from "@/components/user-form";
import { studentSchema } from "@/lib/schemas";
import type { Student } from "@/types";
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


// Mock Data - Replace with API call
const getStudents = async (): Promise<Student[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 1, studentId: "s1001", firstName: "John", lastName: "Doe", course: "Computer Science", year: 3, section: "A", email: "john.doe@example.com" },
    { id: 2, studentId: "s1002", firstName: "Jane", lastName: "Smith", course: "Information Technology", year: 2, section: "B", email: "jane.smith@example.com" },
    { id: 3, studentId: "s1003", firstName: "Peter", lastName: "Jones", course: "Computer Science", year: 3, section: "A" },
    { id: 4, studentId: "s1004", firstName: "Mary", lastName: "Brown", course: "Business Administration", year: 4, section: "C", email: "mary.brown@example.com" },
    { id: 5, studentId: "s1005", firstName: "David", lastName: "Wilson", course: "Information Technology", year: 2, section: "B" },
  ];
};

// Define form fields for the UserForm component
const studentFormFields = [
  { name: "firstName" as const, label: "First Name", placeholder: "Enter first name", required: true },
  { name: "lastName" as const, label: "Last Name", placeholder: "Enter last name", required: true },
  { name: "course" as const, label: "Course", placeholder: "Enter course", required: true },
  { name: "year" as const, label: "Year Level", placeholder: "e.g., 3", type: "number", required: true },
  { name: "section" as const, label: "Section", placeholder: "Enter section", required: true },
  { name: "email" as const, label: "Email", placeholder: "Enter email (optional)", type: "email" },
  { name: "phone" as const, label: "Phone", placeholder: "Enter phone (optional)", type: "tel" },
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
  const handleAddStudent = async (values: Student) => {
    console.log("Adding student:", values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const newId = Math.max(0, ...students.map(s => s.id)) + 1;
    const newStudentId = `s100${newId}`; // Simulate ID generation
    const newStudent: Student = { ...values, id: newId, studentId: newStudentId };
    setStudents(prev => [...prev, newStudent]);
    // In real app: POST to PHP backend, get back the full student object with ID/studentId
     toast({ title: "Student Added", description: `${values.firstName} ${values.lastName} has been added.` });
  };

   // Mock Edit Student Function
  const handleEditStudent = async (values: Student) => {
    console.log("Editing student:", values);
     if (!selectedStudent) return;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, ...values } : s));
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
            header: ({ column }) => <DataTableColumnHeader column={column.id} title="Student ID" />,
            cell: ({ row }) => <div>{row.getValue("studentId")}</div>,
        },
        {
            accessorKey: "firstName",
            header: ({ column }) => <DataTableColumnHeader column={column.id} title="First Name" />,
            cell: ({ row }) => <div className="capitalize">{row.getValue("firstName")}</div>,
        },
        {
            accessorKey: "lastName",
            header: ({ column }) => <DataTableColumnHeader column={column.id} title="Last Name" />,
            cell: ({ row }) => <div className="capitalize">{row.getValue("lastName")}</div>,
        },
         {
            accessorKey: "course",
            header: ({ column }) => (
                <DataTableFilterableColumnHeader
                columnId="course"
                title="Course"
                options={[ // Example options - fetch dynamically if needed
                    { label: "Computer Science", value: "Computer Science" },
                    { label: "Information Technology", value: "Information Technology" },
                    { label: "Business Administration", value: "Business Administration" },
                ]}
                />
            ),
            cell: ({ row }) => <div>{row.getValue("course")}</div>,
             filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "year",
            header: ({ column }) => (
                 <DataTableFilterableColumnHeader
                    columnId="year"
                    title="Year"
                    options={[
                        { label: "1", value: "1" },
                        { label: "2", value: "2" },
                        { label: "3", value: "3" },
                        { label: "4", value: "4" },
                        // Add more years if applicable
                    ]}
                />
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("year")}</div>,
            filterFn: (row, id, value) => {
                 // Ensure comparison happens correctly (value is array, cell is number)
                 const yearValue = row.getValue(id);
                 return value.includes(String(yearValue));
            },
        },
        {
            accessorKey: "section",
            header: ({ column }) => (
                 <DataTableFilterableColumnHeader
                    columnId="section"
                    title="Section"
                    options={[ // Should be dynamic based on available sections
                        { label: "A", value: "A" },
                        { label: "B", value: "B" },
                        { label: "C", value: "C" },
                    ]}
                />
            ),
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
        // Actions column is added dynamically in the DataTable component
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
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                         <span className="text-destructive hover:text-destructive flex items-center w-full">
                             <Trash2 className="mr-2 h-4 w-4" />
                             Delete
                         </span>
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
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
        <UserForm
          trigger={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Student
            </Button>
          }
          formSchema={studentSchema}
          onSubmit={handleAddStudent}
          title="Add New Student"
          description="Fill in the details below to add a new student."
          formFields={studentFormFields} // Pass the defined fields
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


      {/* Edit Modal */}
      {selectedStudent && (
           <UserForm
              // Use React state to control the dialog's open state
              trigger={<></>} // No visible trigger, controlled by state
              isOpen={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              formSchema={studentSchema}
              onSubmit={handleEditStudent}
              title={`Edit Student: ${selectedStudent.firstName} ${selectedStudent.lastName}`}
              description="Update the student's information below. Username and password are auto-generated and cannot be changed here."
              formFields={studentFormFields.map(f => ({...f, disabled: false }))} // Ensure fields are initially enabled
              isEditMode={true}
              initialData={selectedStudent} // Pass current data
            />
      )}
    </div>
  );
}

// Helper component for Edit modal trigger within dropdown - If needed later
const EditModalTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>((props, ref) => (
    <Button ref={ref} variant="ghost" size="sm" {...props} className="w-full justify-start">
         <Edit className="mr-2 h-4 w-4" /> Edit / View Details
    </Button>
));
EditModalTrigger.displayName = "EditModalTrigger";


// Helper to make UserForm controllable externally
type ControllableUserFormProps<T extends Student | Teacher> = Omit<React.ComponentProps<typeof UserForm<T>>, 'trigger' | 'isOpen' | 'onOpenChange'> & {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    trigger?: React.ReactNode; // Make trigger optional
};

const ControllableUserForm = <T extends Student | Teacher>({ isOpen, onOpenChange, trigger, ...props }: ControllableUserFormProps<T>) => {
     const [internalOpen, setInternalOpen] = React.useState(isOpen);

    React.useEffect(() => {
        setInternalOpen(isOpen);
    }, [isOpen]);

    const handleOpenChange = (open: boolean) => {
        setInternalOpen(open);
        onOpenChange(open); // Notify parent about the change
    };


     // Need to re-render the UserForm with internal state for Dialog
     const ActualUserForm = UserForm as React.FC<any>; // Type assertion

    return (
        <ActualUserForm
            {...props}
            trigger={trigger || <span />} // Use provided trigger or an empty span
            isOpen={internalOpen} // Control dialog internally
            onOpenChange={handleOpenChange}
        />
    );
};

// Make UserForm controllable:
UserForm = ControllableUserForm as any; // Re-assign with the controllable version

