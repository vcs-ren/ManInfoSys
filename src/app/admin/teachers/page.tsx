
"use client";

import * as React from "react";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2, Loader2, RotateCcw, Info } from "lucide-react"; // Added RotateCcw, Info

import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import { UserForm, type FormFieldConfig } from "@/components/user-form"; // Import FormFieldConfig
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
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchData, postData, putData, deleteData } from "@/lib/api"; // Import API helpers

// Refactored form fields for Teacher
const teacherFormFields: FormFieldConfig<Teacher>[] = [
  // Personal Information Section (Conceptual Grouping)
  { name: "firstName", label: "First Name", placeholder: "Enter first name", required: true },
  { name: "lastName", label: "Last Name", placeholder: "Enter last name", required: true },
  { name: "middleName", label: "Middle Name", placeholder: "Enter middle name (optional)" },
  { name: "suffix", label: "Suffix", placeholder: "e.g., Jr., Sr., III (optional)" },
  { name: "birthday", label: "Birthday", placeholder: "YYYY-MM-DD (optional)", type: "date" }, // Use date type for input
  { name: "address", label: "Address", placeholder: "Enter full address (optional)", type: "textarea" },
  { name: "phone", label: "Contact Number", placeholder: "Enter contact number (optional)", type: "tel" },
  { name: "email", label: "Email", placeholder: "Enter email (optional)", type: "email" },
  // Work Information Section (Conceptual Grouping)
  { name: "department", label: "Department", placeholder: "Enter department", required: true },
  // Emergency Contact Section (Conceptual Grouping)
  { name: "emergencyContactName", label: "Emergency Contact Name", placeholder: "Parent/Guardian/Spouse Name (optional)", type: "text" },
  { name: "emergencyContactRelationship", label: "Relationship", placeholder: "e.g., Mother, Father, Spouse (optional)", type: "text" },
  { name: "emergencyContactPhone", label: "Emergency Contact Phone", placeholder: "Contact Number (optional)", type: "tel" },
  { name: "emergencyContactAddress", label: "Emergency Contact Address", placeholder: "Full Address (optional)", type: "textarea" },
];


export default function ManageTeachersPage() {
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false); // Combined state for Add/Edit modal
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For delete/reset password confirmation
   const { toast } = useToast();
   const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
      // Hide new optional fields by default
     middleName: false,
     suffix: false,
     birthday: false,
     address: false, // Hide new address field
     email: false,
     phone: false,
     emergencyContactName: false,
     emergencyContactRelationship: false,
     emergencyContactPhone: false,
     emergencyContactAddress: false,
   });


  React.useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
       try {
        const data = await fetchData<Teacher[]>('/api/teachers/read.php'); // Changed: Expect array directly
        setTeachers(data || []); // Use fetched data directly
      } catch (error: any) {
        console.error("Failed to fetch teachers:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load teacher data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, [toast]);

  // Add or Edit Teacher Function (using helpers)
  const handleSaveTeacher = async (values: Teacher) => {
     const payload = { ...values, id: isEditMode ? selectedTeacher?.id : undefined };
     console.log(`Attempting to ${isEditMode ? 'edit' : 'add'} teacher:`, payload);
     try {
         let savedTeacher: Teacher;
         if (isEditMode && payload.id) {
             savedTeacher = await putData<typeof payload, Teacher>(`/api/teachers/update.php/${payload.id}`, payload);
             setTeachers(prev => prev.map(t => t.id === savedTeacher.id ? savedTeacher : t));
             toast({ title: "Teacher Updated", description: `${savedTeacher.firstName} ${savedTeacher.lastName} has been updated.` });
         } else {
             savedTeacher = await postData<Omit<typeof payload, 'id'>, Teacher>('/api/teachers/create.php', payload);
             setTeachers(prev => [...prev, savedTeacher]);
             toast({ title: "Teacher Added", description: `${savedTeacher.firstName} ${savedTeacher.lastName} has been added.` });
         }
         closeModal();
     } catch (error: any) {
         console.error(`Failed to ${isEditMode ? 'update' : 'add'} teacher:`, error);
         toast({ variant: "destructive", title: `Error ${isEditMode ? 'Updating' : 'Adding'} Teacher`, description: error.message || `Could not ${isEditMode ? 'update' : 'add'} teacher.` });
         throw error; // Re-throw to keep modal open
     }
  };

   // Delete Teacher Function (using helper)
  const handleDeleteTeacher = async (teacherId: number) => {
      setIsSubmitting(true);
      try {
          await deleteData(`/api/teachers/delete.php/${teacherId}`); // Ensure correct endpoint with ID
          setTeachers(prev => prev.filter(t => t.id !== teacherId)); // Update state on success
          toast({ title: "Teacher Deleted", description: `Teacher record has been removed.` });
      } catch (error: any) {
          console.error("Failed to delete teacher:", error);
          toast({ variant: "destructive", title: "Error Deleting Teacher", description: error.message || "Could not remove teacher." });
      } finally {
          setIsSubmitting(false);
      }
  };

    // --- Reset Password Function (using helper) ---
    const handleResetPassword = async (userId: number, lastName: string) => {
        setIsSubmitting(true);
        try {
             await postData('/api/admin/reset_password.php', { userId, userType: 'teacher', lastName }); // Pass lastName
             const defaultPassword = `${lastName.substring(0, 2).toLowerCase()}1000`;
             toast({
                  title: "Password Reset Successful",
                  description: `Password for teacher ID ${userId} has been reset. Default password: ${defaultPassword}`,
             });
        } catch (error: any) {
             console.error("Failed to reset password:", error);
             toast({
                  variant: "destructive",
                  title: "Password Reset Failed",
                  description: error.message || "Could not reset teacher password.",
             });
        } finally {
             setIsSubmitting(false);
        }
    };

   const openAddModal = () => {
    setIsEditMode(false);
    setSelectedTeacher(null);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setIsEditMode(true);
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

   const closeModal = () => {
    setIsModalOpen(false);
  };

    // Define dynamic department options for filter
    const departmentOptions = React.useMemo(() => {
        if (!teachers) return []; // Handle case where teachers might be null/undefined initially
        const distinctDepartments = [...new Set(teachers.map(t => t.department).filter(Boolean))].sort();
        return distinctDepartments.map(dep => ({ label: dep, value: dep }));
    }, [teachers]);


    // Define columns for the DataTable - Updated
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
             filterFn: (row, id, value) => String(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase()),
        },
         {
            accessorKey: "middleName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Middle Name" />,
            cell: ({ row }) => <div className="capitalize">{row.original.middleName || '-'}</div>,
             enableHiding: true,
             filterFn: (row, id, value) => String(row.getValue(id) || '').toLowerCase().includes(String(value).toLowerCase()),
        },
        {
            accessorKey: "lastName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
            cell: ({ row }) => <div className="capitalize">{row.getValue("lastName")}</div>,
             filterFn: (row, id, value) => String(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase()),
        },
         {
            accessorKey: "suffix",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Suffix" />,
            cell: ({ row }) => <div className="capitalize">{row.original.suffix || '-'}</div>,
             enableHiding: true,
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
             accessorKey: "birthday",
             header: "Birthday",
             cell: ({ row }) => <div>{row.original.birthday || '-'}</div>,
             enableHiding: true,
         },
          {
             accessorKey: "address",
             header: "Address",
             cell: ({ row }) => <div className="max-w-xs truncate">{row.original.address || '-'}</div>,
             enableHiding: true,
         },
         {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div className="lowercase">{row.original.email || '-'}</div>,
             enableHiding: true,
        },
         {
            accessorKey: "phone", // Renamed from contact number
            header: "Phone",
            cell: ({ row }) => <div>{row.original.phone || '-'}</div>,
             enableHiding: true,
        },
         // Emergency Contact Columns (Hidden by default)
        { accessorKey: "emergencyContactName", header: "Emergency Contact Name", cell: ({ row }) => row.original.emergencyContactName || '-', enableHiding: true },
        { accessorKey: "emergencyContactRelationship", header: "Relationship", cell: ({ row }) => row.original.emergencyContactRelationship || '-', enableHiding: true },
        { accessorKey: "emergencyContactPhone", header: "Emergency Phone", cell: ({ row }) => row.original.emergencyContactPhone || '-', enableHiding: true },
        { accessorKey: "emergencyContactAddress", header: "Emergency Address", cell: ({ row }) => <div className="max-w-xs truncate">{row.original.emergencyContactAddress || '-'}</div>, enableHiding: true },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [departmentOptions]);


      // Function to generate dropdown menu items for each row
    const generateActionMenuItems = (teacher: Teacher) => (
        <>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(teacher); }}>
            <Info className="mr-2 h-4 w-4" /> {/* Use Info icon */}
            View / Edit Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
          {/* Reset Password Action */}
         <AlertDialog>
             <AlertDialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-600 focus:text-orange-600 focus:bg-orange-100">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset Password
                 </DropdownMenuItem>
             </AlertDialogTrigger>
             <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                 <AlertDialogHeader>
                     <AlertDialogTitle>Reset Password?</AlertDialogTitle>
                     <AlertDialogDescription>
                          This will reset the password for {teacher.firstName} {teacher.lastName} to the default format (first 2 letters of last name + 1000). Are you sure?
                     </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                     <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                     <AlertDialogAction
                          onClick={async (e) => {
                              e.stopPropagation();
                              await handleResetPassword(teacher.id, teacher.lastName);
                         }}
                          className={cn(buttonVariants({ variant: "destructive" }))}
                          disabled={isSubmitting}
                     >
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Yes, reset password
                     </AlertDialogAction>
                 </AlertDialogFooter>
             </AlertDialogContent>
         </AlertDialog>
         {/* Delete Action */}
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
                          await handleDeleteTeacher(teacher.id); // Use the correct delete handler
                     }}
                      className={cn(buttonVariants({ variant: "destructive" }))}
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
         <Button onClick={openAddModal}> {/* Button to open Add modal */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
        </Button>
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
                searchPlaceholder="Search by name..."
                searchColumnId="firstName" // Can filter by first name
                 actionMenuItems={generateActionMenuItems}
                 columnVisibility={columnVisibility}
                 setColumnVisibility={setColumnVisibility}
            />
        )}


      {/* Add/Edit Modal using UserForm */}
        <UserForm<Teacher>
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          formSchema={teacherSchema}
          onSubmit={handleSaveTeacher}
          title={isEditMode ? `Edit Teacher: ${selectedTeacher?.firstName} ${selectedTeacher?.lastName}` : 'Add New Teacher'}
          description={isEditMode ? "Update the teacher's information below. Username and password are managed by the system." : "Fill in the details below. Credentials are generated upon creation."}
          formFields={teacherFormFields} // Use the refactored form fields
          isEditMode={isEditMode}
          initialData={isEditMode ? selectedTeacher : undefined}
        />
    </div>
  );
}
