
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import { UserForm } from "@/components/user-form";
import { teacherSchema } from "@/lib/schemas";
import type { Teacher } from "@/types";
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
const getTeachers = async (): Promise<Teacher[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 1, teacherId: "t1001", firstName: "Alice", lastName: "Johnson", department: "Mathematics", email: "alice.j@example.com" },
    { id: 2, teacherId: "t1002", firstName: "Bob", lastName: "Williams", department: "Science", email: "bob.w@example.com" },
    { id: 3, teacherId: "t1003", firstName: "Charlie", lastName: "Davis", department: "English" },
    { id: 4, teacherId: "t1004", firstName: "Diana", lastName: "Miller", department: "Science", email: "diana.m@example.com" },
  ];
};

// Define form fields for the UserForm component
const teacherFormFields = [
  { name: "firstName" as const, label: "First Name", placeholder: "Enter first name", required: true },
  { name: "lastName" as const, label: "Last Name", placeholder: "Enter last name", required: true },
  { name: "department" as const, label: "Department", placeholder: "Enter department", required: true },
  { name: "email" as const, label: "Email", placeholder: "Enter email (optional)", type: "email" },
  { name: "phone" as const, label: "Phone", placeholder: "Enter phone (optional)", type: "tel" },
];


export default function ManageTeachersPage() {
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
   const { toast } = useToast();


  React.useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
       try {
        const data = await getTeachers();
        setTeachers(data);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load teacher data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, [toast]);

  // Mock Add Teacher Function
  const handleAddTeacher = async (values: Teacher) => {
    console.log("Adding teacher:", values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const newId = Math.max(0, ...teachers.map(t => t.id)) + 1;
    const newTeacherId = `t100${newId}`; // Simulate ID generation
    const newTeacher: Teacher = { ...values, id: newId, teacherId: newTeacherId };
    setTeachers(prev => [...prev, newTeacher]);
     toast({ title: "Teacher Added", description: `${values.firstName} ${values.lastName} has been added.` });
  };

   // Mock Edit Teacher Function
  const handleEditTeacher = async (values: Teacher) => {
    console.log("Editing teacher:", values);
     if (!selectedTeacher) return;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setTeachers(prev => prev.map(t => t.id === selectedTeacher.id ? { ...t, ...values } : t));
     toast({ title: "Teacher Updated", description: `${values.firstName} ${values.lastName} has been updated.` });
    closeEditModal(); // Close modal after successful edit
  };

   // Mock Delete Teacher Function
  const handleDeleteTeacher = async (teacherId: number) => {
      console.log("Deleting teacher with ID:", teacherId);
        // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setTeachers(prev => prev.filter(t => t.id !== teacherId));
      toast({ title: "Teacher Deleted", description: `Teacher record has been removed.` });
  };

  const handleRowClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true); // Open the edit modal on row click
  };

   const closeEditModal = () => {
    setSelectedTeacher(null);
    setIsEditModalOpen(false);
  };


    // Define columns for the DataTable
    const columns: ColumnDef<Teacher>[] = React.useMemo(() => [
         {
            accessorKey: "teacherId",
            header: ({ column }) => <DataTableColumnHeader column={column.id} title="Teacher ID" />,
            cell: ({ row }) => <div>{row.getValue("teacherId")}</div>,
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
            accessorKey: "department",
            header: ({ column }) => (
                <DataTableFilterableColumnHeader
                columnId="department"
                title="Department"
                options={[ // Example options - fetch dynamically if needed
                    { label: "Mathematics", value: "Mathematics" },
                    { label: "Science", value: "Science" },
                    { label: "English", value: "English" },
                ]}
                />
            ),
            cell: ({ row }) => <div>{row.getValue("department")}</div>,
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
    ], []); // Empty dependency array


      // Function to generate dropdown menu items for each row
    const generateActionMenuItems = (teacher: Teacher) => (
        <>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowClick(teacher); }}>
            <Edit className="mr-2 h-4 w-4" />
            Edit / View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
         <AlertDialog>
                <AlertDialogTrigger asChild>
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
                        This action cannot be undone. This will permanently delete the teacher
                        record for {teacher.firstName} {teacher.lastName}.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => handleDeleteTeacher(teacher.id)}
                         className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                        Yes, delete teacher
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Teachers</h1>
        <UserForm
          trigger={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
            </Button>
          }
          formSchema={teacherSchema}
          onSubmit={handleAddTeacher}
          title="Add New Teacher"
          description="Fill in the details below to add a new teacher."
          formFields={teacherFormFields} // Pass the defined fields
        />
      </div>

      {isLoading ? (
         <p>Loading teacher data...</p> // Replace with Skeleton loader if desired
       ) : (
            <DataTable
                columns={columns}
                data={teachers}
                searchPlaceholder="Search by first name..."
                searchColumnId="firstName"
                onRowClick={handleRowClick}
                 actionMenuItems={generateActionMenuItems}
            />
        )}


      {/* Edit Modal */}
       {selectedTeacher && (
           <UserForm
              trigger={<></>} // Controlled externally
              isOpen={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              formSchema={teacherSchema}
              onSubmit={handleEditTeacher}
              title={`Edit Teacher: ${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
              description="Update the teacher's information below. Username and password are auto-generated and cannot be changed here."
              formFields={teacherFormFields.map(f => ({...f, disabled: false }))} // Ensure fields are enabled
              isEditMode={true}
              initialData={selectedTeacher}
            />
       )}
    </div>
  );
}

// Make UserForm controllable: (Copy from students page if needed, ensures consistency)
type ControllableUserFormProps<T extends Teacher | Student> = Omit<React.ComponentProps<typeof UserForm<T>>, 'trigger' | 'isOpen' | 'onOpenChange'> & {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    trigger?: React.ReactNode; // Make trigger optional
};

const ControllableUserForm = <T extends Teacher | Student>({ isOpen, onOpenChange, trigger, ...props }: ControllableUserFormProps<T>) => {
     const [internalOpen, setInternalOpen] = React.useState(isOpen);

    React.useEffect(() => {
        setInternalOpen(isOpen);
    }, [isOpen]);

    const handleOpenChange = (open: boolean) => {
        setInternalOpen(open);
        onOpenChange(open); // Notify parent about the change
    };

     const ActualUserForm = UserForm as React.FC<any>; // Type assertion needed

    return (
        <ActualUserForm
            {...props}
            trigger={trigger || <span />} // Use provided trigger or an empty span
            isOpen={internalOpen} // Control dialog internally
            onOpenChange={handleOpenChange}
        />
    );
};

UserForm = ControllableUserForm as any;
