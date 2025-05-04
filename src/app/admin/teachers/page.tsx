
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"; // Added Loader2

import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import { UserForm } from "@/components/user-form";
import { teacherSchema } from "@/lib/schemas";
import type { Teacher } from "@/types"; // Import Teacher type
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

// --- API Helper Functions (Assumed - Implement based on your backend) ---
const fetchData = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
};

const postData = async <T, R>(url: string, data: T): Promise<R> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
         let errorData; try { errorData = await response.json(); } catch (e) {}
         throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

const putData = async <T, R>(url: string, data: T): Promise<R> => {
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
     if (!response.ok) {
         let errorData; try { errorData = await response.json(); } catch (e) {}
         throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};


const deleteData = async (url: string): Promise<void> => {
    const response = await fetch(url, { method: 'DELETE' });
     if (!response.ok) {
         let errorData; try { errorData = await response.json(); } catch (e) {}
         throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
};
// --- End API Helpers ---


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
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For delete confirmation
   const { toast } = useToast();


  React.useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
       try {
         // Replace with your actual API endpoint
        const data = await fetchData<{ records: Teacher[] }>('/api/teachers'); // Assuming API returns { records: [] }
        setTeachers(data.records || []);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load teacher data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, [toast]);

  // Add Teacher Function (API Call)
  const handleAddTeacher = async (values: Omit<Teacher, 'id' | 'teacherId'>) => {
     // API should handle ID and teacherId generation, and password hashing
     console.log("Attempting to add teacher:", values);
     try {
        // Replace with your actual POST endpoint
         const newTeacher = await postData<typeof values, Teacher>('/api/teachers', values);
         setTeachers(prev => [...prev, newTeacher]); // Add returned teacher to state
         toast({ title: "Teacher Added", description: `${newTeacher.firstName} ${newTeacher.lastName} has been added.` });
     } catch (error: any) {
         console.error("Failed to add teacher:", error);
         toast({ variant: "destructive", title: "Error Adding Teacher", description: error.message || "Could not add teacher." });
         throw error; // Re-throw for UserForm
     }
  };

   // Edit Teacher Function (API Call)
  const handleEditTeacher = async (values: Teacher) => {
     if (!selectedTeacher) return;

     // Ensure ID is included
     const payload = { ...values, id: selectedTeacher.id };
     console.log("Attempting to edit teacher:", payload);

     try {
         // Replace with your actual PUT/PATCH endpoint (e.g., /api/teachers/{id})
         const updatedTeacher = await putData<typeof payload, Teacher>(`/api/teachers/${selectedTeacher.id}`, payload);
         setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
         toast({ title: "Teacher Updated", description: `${updatedTeacher.firstName} ${updatedTeacher.lastName} has been updated.` });
         closeEditModal();
     } catch (error: any) {
         console.error("Failed to update teacher:", error);
         toast({ variant: "destructive", title: "Error Updating Teacher", description: error.message || "Could not update teacher." });
         throw error; // Re-throw for UserForm
     }
  };

   // Delete Teacher Function (API Call)
  const handleDeleteTeacher = async (teacherId: number) => {
      setIsSubmitting(true);
      try {
          // Replace with your actual DELETE endpoint
          await deleteData(`/api/teachers/${teacherId}`);
          setTeachers(prev => prev.filter(t => t.id !== teacherId));
          toast({ title: "Teacher Deleted", description: `Teacher record has been removed.` });
      } catch (error: any) {
          console.error("Failed to delete teacher:", error);
          toast({ variant: "destructive", title: "Error Deleting Teacher", description: error.message || "Could not remove teacher." });
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

   const closeEditModal = () => {
    setSelectedTeacher(null);
    setIsEditModalOpen(false);
  };

    // Define dynamic department options for filter
    const departmentOptions = React.useMemo(() => {
        const distinctDepartments = [...new Set(teachers.map(t => t.department).filter(Boolean))].sort();
        return distinctDepartments.map(dep => ({ label: dep, value: dep }));
    }, [teachers]);


    // Define columns for the DataTable
    const columns: ColumnDef<Teacher>[] = React.useMemo(() => [
         {
            accessorKey: "teacherId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Teacher ID" />,
            cell: ({ row }) => <div>{row.getValue("teacherId")}</div>,
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
            accessorKey: "department",
             header: ({ column }) => (
                 <DataTableFilterableColumnHeader
                     column={column}
                     title="Department"
                     options={departmentOptions} // Use dynamic options
                 />
             ),
            cell: ({ row }) => <div>{row.getValue("department")}</div>,
             filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
         {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div className="lowercase">{row.getValue("email") || '-'}</div>,
        },
         {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <div>{row.getValue("phone") || '-'}</div>,
        },
    ], [departmentOptions]); // Dependency on dynamic options


      // Function to generate dropdown menu items for each row
    const generateActionMenuItems = (teacher: Teacher) => (
        <>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenEditModal(teacher); }}>
            <Edit className="mr-2 h-4 w-4" />
            Edit / View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
         <AlertDialog>
                <AlertDialogTrigger asChild>
                     <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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
                    <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                         onClick={async (e) => {
                             e.stopPropagation();
                             await handleDeleteTeacher(teacher.id);
                        }}
                         className={buttonVariants({ variant: "destructive" })}
                         disabled={isSubmitting}
                        >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
        <UserForm<Teacher>
          trigger={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
            </Button>
          }
          formSchema={teacherSchema}
          onSubmit={handleAddTeacher}
          title="Add New Teacher"
          description="Fill in the details below. Credentials are generated upon creation."
          formFields={teacherFormFields}
        />
      </div>

      {isLoading ? (
          <div className="flex justify-center items-center py-10">
             <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading teacher data...
         </div>
       ) : teachers.length === 0 ? (
             <p className="text-center text-muted-foreground py-10">No teachers found.</p>
       ) : (
            <DataTable
                columns={columns}
                data={teachers}
                searchPlaceholder="Search by first name..."
                searchColumnId="firstName"
                // Remove onRowClick
                // onRowClick={handleOpenEditModal}
                 actionMenuItems={generateActionMenuItems}
            />
        )}


      {/* Edit Modal - Controlled externally */}
       {selectedTeacher && (
           <UserForm<Teacher>
              isOpen={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              formSchema={teacherSchema}
              onSubmit={handleEditTeacher}
              title={`Edit Teacher: ${selectedTeacher.firstName} ${selectedTeacher.lastName}`}
              description="Update the teacher's information below. Username and password are auto-generated and managed by the system."
              formFields={teacherFormFields.map(f => ({...f, disabled: false }))}
              isEditMode={true}
              initialData={selectedTeacher}
            />
       )}
    </div>
  );
}

    