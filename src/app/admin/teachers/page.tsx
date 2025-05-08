
"use client";

import * as React from "react";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2, Loader2, RotateCcw, Info, Pencil } from "lucide-react"; // Added Pencil

import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import { UserForm, type FormFieldConfig } from "@/components/user-form"; // Import FormFieldConfig
import { teacherSchema } from "@/lib/schemas";
import type { Teacher, EmploymentType } from "@/types"; // Import Teacher type and EmploymentType
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

// Define department options (consider fetching these from API if dynamic)
// Mock departments for now
const departmentOptions = [
    { value: "Computer Science", label: "Computer Science" },
    { value: "Information Technology", label: "Information Technology" },
    { value: "Business Administration", label: "Business Administration" },
    { value: "Education", label: "Education" },
    { value: "Engineering", label: "Engineering" },
];

const employmentTypeOptions: { value: EmploymentType; label: string }[] = [
    { value: "Regular", label: "Regular" },
    { value: "Part Time", label: "Part Time" },
];

const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
];


// Refactored form fields for Teacher with new sections
const teacherFormFields: FormFieldConfig<Teacher>[] = [
  // Personal Information Section
  { name: "firstName", label: "First Name", placeholder: "Enter first name", required: true, section: 'personal' },
  { name: "lastName", label: "Last Name", placeholder: "Enter last name", required: true, section: 'personal' },
  { name: "middleName", label: "Middle Name", placeholder: "Enter middle name (optional)", section: 'personal' },
  { name: "suffix", label: "Suffix", placeholder: "e.g., Jr., Sr., III (optional)", section: 'personal' },
  { name: "gender", label: "Gender", type: "select", options: genderOptions, placeholder: "Select gender (optional)", section: 'personal' }, // Added Gender
  { name: "birthday", label: "Birthday", placeholder: "YYYY-MM-DD (optional)", type: "date", section: 'personal' },
  { name: "address", label: "Address", placeholder: "Enter full address (optional)", type: "textarea", section: 'personal' },
  // Employee Information Section (renamed from Enrollment)
  { name: "employmentType", label: "Employment Type", type: "select", options: employmentTypeOptions, placeholder: "Select employment type", required: true, section: 'employee' }, // Added Employment Type
  { name: "department", label: "Department", type: "select", options: departmentOptions, placeholder: "Select department", required: true, section: 'employee' }, // Changed to dropdown
  // Contact / Account Details
  { name: "phone", label: "Contact Number", placeholder: "Enter contact number (optional)", type: "tel", section: 'contact' },
  { name: "email", label: "Email", placeholder: "Enter email (optional)", type: "email", section: 'contact' },
  // Emergency Contact Section
  { name: "emergencyContactName", label: "Contact Name", placeholder: "Parent/Guardian/Spouse Name (optional)", type: "text", section: 'emergency' },
  { name: "emergencyContactRelationship", label: "Relationship", placeholder: "e.g., Mother, Father, Spouse (optional)", type: "text", section: 'emergency' },
  { name: "emergencyContactPhone", label: "Contact Phone", placeholder: "Contact Number (optional)", type: "tel", section: 'emergency' },
  { name: "emergencyContactAddress", label: "Contact Address", placeholder: "Full Address (optional)", type: "textarea", section: 'emergency' },
];


export default function ManageTeachersPage() {
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTeacher, setSelectedTeacher] = React.useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
   const { toast } = useToast();
   const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
     middleName: false,
     suffix: false,
     birthday: false,
     address: false,
     email: false,
     phone: false,
     gender: false, // Hide new gender field by default
     employmentType: false, // Hide new employment type field by default
     emergencyContactName: false,
     emergencyContactRelationship: false,
     emergencyContactPhone: false,
     emergencyContactAddress: false,
   });


  React.useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
       try {
        // Use mock data for now
        // const data = await fetchData<Teacher[]>('teachers/read.php');
        // setTeachers(data || []);
         await new Promise(resolve => setTimeout(resolve, 500)); // Simulate fetch delay
         const mockData = [ // Replace with your actual mock data import if needed
            { id: 1, teacherId: "t1001", username: "t1001", firstName: "David", lastName: "Lee", department: "Computer Science", email: "david.lee@example.com", phone: "555-1234", employmentType: 'Regular' as EmploymentType },
            { id: 2, teacherId: "t1002", username: "t1002", firstName: "Eve", lastName: "Davis", department: "Information Technology", email: "eve.davis@example.com", employmentType: 'Part Time' as EmploymentType },
         ];
         setTeachers(mockData);
      } catch (error: any) {
        console.error("Failed to fetch teachers:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load teacher data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, [toast]);

  const handleSaveTeacher = async (values: Teacher) => {
     // Check for duplicate name only when *adding* a new teacher
     if (!isEditMode) {
         const nameExists = teachers.some(
             (t) => t.firstName.toLowerCase() === values.firstName.toLowerCase() &&
                    t.lastName.toLowerCase() === values.lastName.toLowerCase()
         );
         if (nameExists) {
              toast({ variant: "destructive", title: "Duplicate Name", description: `A teacher named ${values.firstName} ${values.lastName} already exists.` });
              throw new Error("Duplicate name"); // Prevent submission
         }
     }

     const payload = { ...values, id: isEditMode ? selectedTeacher?.id : undefined };
     console.log(`Attempting to ${isEditMode ? 'edit' : 'add'} teacher:`, payload);
     try {
         let savedTeacher: Teacher;
         if (isEditMode && payload.id) {
             // Simulate PUT request
             await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
             const index = teachers.findIndex(t => t.id === payload.id);
             if (index > -1) {
                // Generate username if not present (though it should be from initial fetch)
                const username = teachers[index].username || `t${teachers[index].teacherId}`;
                 savedTeacher = { ...teachers[index], ...payload, username };
                 setTeachers(prev => prev.map(t => t.id === savedTeacher.id ? savedTeacher : t));
             } else {
                 throw new Error("Teacher not found for update.");
             }
             toast({ title: "Teacher Updated", description: `${savedTeacher.firstName} ${savedTeacher.lastName} has been updated.` });
         } else {
             // Simulate POST request
             await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
             const nextId = Math.max(0, ...teachers.map(t => t.id)) + 1;
             const teacherId = `t${1000 + nextId}`;
             const username = teacherId; // Username is same as teacherId for teachers
             savedTeacher = { ...payload, id: nextId, teacherId: teacherId, username: username };
             setTeachers(prev => [...prev, savedTeacher]);
             toast({ title: "Teacher Added", description: `${savedTeacher.firstName} ${savedTeacher.lastName} (${savedTeacher.teacherId}) has been added.` });
         }
         closeModal();
     } catch (error: any) {
        // Avoid double-toasting if it was a duplicate name error
        if (error.message !== "Duplicate name") {
             console.error(`Failed to ${isEditMode ? 'update' : 'add'} teacher:`, error);
             toast({ variant: "destructive", title: `Error ${isEditMode ? 'Updating' : 'Adding'} Teacher`, description: error.message || `Could not ${isEditMode ? 'update' : 'add'} teacher.` });
        }
         throw error; // Re-throw to stop further execution in the form component
     }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
      setIsSubmitting(true);
      try {
            // Simulate DELETE request
             await new Promise(resolve => setTimeout(resolve, 300));
             const initialLength = teachers.length;
             setTeachers(prev => {
                 const newTeachers = prev.filter(t => t.id !== teacherId);
                 if (newTeachers.length === initialLength) {
                      throw new Error("Teacher not found for delete.");
                 }
                 return newTeachers;
             });
            toast({ title: "Teacher Deleted", description: `Teacher record has been removed.` });
      } catch (error: any) {
          console.error("Failed to delete teacher:", error);
          toast({ variant: "destructive", title: "Error Deleting Teacher", description: error.message || "Could not remove teacher." });
      } finally {
          setIsSubmitting(false);
      }
  };

    const handleResetPassword = async (userId: number, lastName: string) => {
        setIsSubmitting(true);
        try {
            // Simulate POST request
             await new Promise(resolve => setTimeout(resolve, 300));
             console.log(`Simulating password reset for teacher ID ${userId}`);
             // const response = await postData('admin/reset_password.php', { userId, userType: 'teacher', lastName });
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
        // Add a slight delay before clearing the selected student
        // to allow the modal close animation to finish smoothly
        setTimeout(() => {
            setSelectedTeacher(null);
            setIsEditMode(false);
        }, 150);
   };

    // Use mock department options for now
    const currentDepartmentOptions = React.useMemo(() => departmentOptions, []);

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
                     options={currentDepartmentOptions} // Use dynamic options
                 />
             ),
            cell: ({ row }) => <div>{row.getValue("department")}</div>,
             filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        { // Added Gender column
            accessorKey: "gender",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
            cell: ({ row }) => <div className="capitalize">{row.original.gender || '-'}</div>,
            enableHiding: true,
        },
        { // Added Employment Type column
            accessorKey: "employmentType",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Employment Type" />,
            cell: ({ row }) => <div className="capitalize">{row.original.employmentType || '-'}</div>,
            enableHiding: true,
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
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <div>{row.original.phone || '-'}</div>,
             enableHiding: true,
        },
        { accessorKey: "emergencyContactName", header: "Emergency Contact Name", cell: ({ row }) => row.original.emergencyContactName || '-', enableHiding: true },
        { accessorKey: "emergencyContactRelationship", header: "Relationship", cell: ({ row }) => row.original.emergencyContactRelationship || '-', enableHiding: true },
        { accessorKey: "emergencyContactPhone", header: "Emergency Phone", cell: ({ row }) => row.original.emergencyContactPhone || '-', enableHiding: true },
        { accessorKey: "emergencyContactAddress", header: "Emergency Address", cell: ({ row }) => <div className="max-w-xs truncate">{row.original.emergencyContactAddress || '-'}</div>, enableHiding: true },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [currentDepartmentOptions]); // Updated dependency

    const generateActionMenuItems = (teacher: Teacher) => (
        <>
        {/* Update this item to open the modal in edit mode */}
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(teacher); }}>
            <Info className="mr-2 h-4 w-4" />
            View / Edit Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
         <AlertDialog>
             <AlertDialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-600 focus:text-orange-600 focus:bg-orange-100" disabled={isSubmitting}>
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
         <AlertDialog>
             <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled={isSubmitting}>
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
         <Button onClick={openAddModal}>
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
                searchColumnId="firstName"
                 actionMenuItems={generateActionMenuItems}
                 columnVisibility={columnVisibility}
                 setColumnVisibility={setColumnVisibility}
            />
        )}

        <UserForm<Teacher>
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen} // Pass setter directly
          formSchema={teacherSchema}
          onSubmit={handleSaveTeacher}
          title={isEditMode ? `Teacher Details: ${selectedTeacher?.firstName} ${selectedTeacher?.lastName}` : 'Add New Teacher'}
          description={isEditMode ? "View or update the teacher's information." : "Fill in the details below. Credentials are generated upon creation."}
          formFields={teacherFormFields} // Pass the updated form fields
          isEditMode={isEditMode}
          initialData={isEditMode ? selectedTeacher : undefined}
          startReadOnly={isEditMode} // Start in read-only mode when editing
        />
    </div>
  );
}
