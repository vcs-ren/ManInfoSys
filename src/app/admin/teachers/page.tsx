
"use client";

import * as React from "react";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2, Loader2, RotateCcw, Info, Pencil } from "lucide-react"; // Added Pencil

import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import { UserForm, type FormFieldConfig } from "@/components/user-form"; // Import FormFieldConfig
import { teacherSchema } from "@/lib/schemas";
import type { Faculty, EmploymentType } from "@/types"; // Renamed Teacher to Faculty
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

// Updated department options
const departmentOptions = [
    { value: "Teaching", label: "Teaching" },
    { value: "Administrative", label: "Administrative" },
    // Add more roles if needed
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


// Refactored form fields for Faculty with updated sections and department options
const facultyFormFields: FormFieldConfig<Faculty>[] = [
  // Personal Information Section
  { name: "firstName", label: "First Name", placeholder: "Enter first name", required: true, section: 'personal' },
  { name: "lastName", label: "Last Name", placeholder: "Enter last name", required: true, section: 'personal' },
  { name: "middleName", label: "Middle Name", placeholder: "Enter middle name (optional)", section: 'personal' },
  { name: "suffix", label: "Suffix", placeholder: "e.g., Jr., Sr., III (optional)", section: 'personal' },
  { name: "gender", label: "Gender", type: "select", options: genderOptions, placeholder: "Select gender (optional)", section: 'personal' },
  { name: "birthday", label: "Birthday", placeholder: "YYYY-MM-DD (optional)", type: "date", section: 'personal' },
  { name: "address", label: "Address", placeholder: "Enter full address (optional)", type: "textarea", section: 'personal' },
  // Employee Information Section
  { name: "employmentType", label: "Employment Type", type: "select", options: employmentTypeOptions, placeholder: "Select employment type", required: true, section: 'employee' },
  { name: "department", label: "Department", type: "select", options: departmentOptions, placeholder: "Select department", required: true, section: 'employee' }, // Use updated options
  // Contact / Account Details
  { name: "phone", label: "Contact Number", placeholder: "Enter contact number (optional)", type: "tel", section: 'contact' },
  { name: "email", label: "Email", placeholder: "Enter email (optional)", type: "email", section: 'contact' },
  // Emergency Contact Section
  { name: "emergencyContactName", label: "Contact Name", placeholder: "Parent/Guardian/Spouse Name (optional)", type: "text", section: 'emergency' },
  { name: "emergencyContactRelationship", label: "Relationship", placeholder: "e.g., Mother, Father, Spouse (optional)", type: "text", section: 'emergency' },
  { name: "emergencyContactPhone", label: "Contact Phone", placeholder: "Contact Number (optional)", type: "tel", section: 'emergency' },
  { name: "emergencyContactAddress", label: "Contact Address", placeholder: "Full Address (optional)", type: "textarea", section: 'emergency' },
];


export default function ManageFacultyPage() { // Renamed component
  const [faculty, setFaculty] = React.useState<Faculty[]>([]); // Renamed state variable
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedFaculty, setSelectedFaculty] = React.useState<Faculty | null>(null); // Renamed state variable
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
     username: false, // Hide username by default
   });


  React.useEffect(() => {
    const fetchFaculty = async () => { // Renamed function
      setIsLoading(true);
       try {
        // Use fetchData with the correct endpoint (still /teachers/read.php)
        const data = await fetchData<Faculty[]>('teachers/read.php');
        setFaculty(data || []); // Update state with fetched data
      } catch (error: any) {
        console.error("Failed to fetch faculty:", error); // Updated log message
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load faculty data." }); // Updated toast message
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaculty(); // Call the renamed function
  }, [toast]);

  const handleSaveFaculty = async (values: Faculty) => { // Renamed function and type
     // Check for duplicate name only when *adding* a new faculty member
     if (!isEditMode) {
         const nameExists = faculty.some( // Use renamed state variable
             (t) => t.firstName.toLowerCase() === values.firstName.toLowerCase() &&
                    t.lastName.toLowerCase() === values.lastName.toLowerCase()
         );
         if (nameExists) {
              toast({ variant: "destructive", title: "Duplicate Name", description: `A faculty member named ${values.firstName} ${values.lastName} already exists.` }); // Updated message
              throw new Error("Duplicate name"); // Prevent submission
         }
     }

     const payload = { ...values, id: isEditMode ? selectedFaculty?.id : undefined };
     console.log(`Attempting to ${isEditMode ? 'edit' : 'add'} faculty:`, payload); // Updated log message
     try {
         let savedFaculty: Faculty; // Renamed variable
         if (isEditMode && payload.id) {
             // Use putData with the correct endpoint (still /teachers/update.php/)
              savedFaculty = await putData<typeof payload, Faculty>(`teachers/update.php/${payload.id}`, payload);
             setFaculty(prev => prev.map(t => t.id === savedFaculty.id ? savedFaculty : t)); // Update faculty state
             toast({ title: "Faculty Updated", description: `${savedFaculty.firstName} ${savedFaculty.lastName} has been updated.` }); // Updated message
         } else {
             // Use postData with the correct endpoint (still /teachers/create.php)
              savedFaculty = await postData<Omit<typeof payload, 'id'>, Faculty>('teachers/create.php', payload);
             setFaculty(prev => [...prev, savedFaculty]); // Update faculty state
             toast({ title: "Faculty Added", description: `${savedFaculty.firstName} ${savedFaculty.lastName} (${savedFaculty.teacherId}) has been added.` }); // Updated message
         }
         closeModal();
     } catch (error: any) {
        // Avoid double-toasting if it was a duplicate name error
        if (error.message !== "Duplicate name") {
             console.error(`Failed to ${isEditMode ? 'update' : 'add'} faculty:`, error); // Updated log message
             toast({ variant: "destructive", title: `Error ${isEditMode ? 'Updating' : 'Adding'} Faculty`, description: error.message || `Could not ${isEditMode ? 'update' : 'add'} faculty.` }); // Updated message
        }
         throw error; // Re-throw to stop further execution in the form component
     }
  };

  const handleDeleteFaculty = async (facultyId: number) => { // Renamed function and parameter
      setIsSubmitting(true);
      try {
            // Use deleteData with the correct endpoint (still /teachers/delete.php/)
             await deleteData(`teachers/delete.php/${facultyId}`);
            setFaculty(prev => prev.filter(t => t.id !== facultyId)); // Update faculty state
            toast({ title: "Faculty Deleted", description: `Faculty record has been removed.` }); // Updated message
      } catch (error: any) {
          console.error("Failed to delete faculty:", error); // Updated log message
          toast({ variant: "destructive", title: "Error Deleting Faculty", description: error.message || "Could not remove faculty record." }); // Updated message
      } finally {
          setIsSubmitting(false);
      }
  };

    const handleResetPassword = async (userId: number, lastName: string) => {
        setIsSubmitting(true);
        try {
            // Use postData with the correct endpoint (still /admin/reset_password.php)
             await postData('admin/reset_password.php', { userId, userType: 'teacher', lastName }); // userType remains 'teacher' for backend
             const defaultPassword = `${lastName.substring(0, 2).toLowerCase()}1000`;
             toast({
                  title: "Password Reset Successful",
                  description: `Password for faculty ID ${userId} has been reset. Default password: ${defaultPassword}`, // Updated message
             });
        } catch (error: any) {
             console.error("Failed to reset password:", error);
             toast({
                  variant: "destructive",
                  title: "Password Reset Failed",
                  description: error.message || "Could not reset faculty password.", // Updated message
             });
        } finally {
             setIsSubmitting(false);
        }
    };

   const openAddModal = () => {
    setIsEditMode(false);
    setSelectedFaculty(null); // Use renamed state variable
    setIsModalOpen(true);
  };

  const openEditModal = (facultyMember: Faculty) => { // Renamed parameter
    setIsEditMode(true);
    setSelectedFaculty(facultyMember); // Use renamed state variable
    setIsModalOpen(true);
  };

   const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedFaculty(null); // Use renamed state variable
            setIsEditMode(false);
        }, 150);
   };

    const currentDepartmentOptions = React.useMemo(() => departmentOptions, []);

    const columns: ColumnDef<Faculty>[] = React.useMemo(() => [ // Use Faculty type
         {
            accessorKey: "teacherId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Faculty ID" />, // Updated title
            cell: ({ row }) => <div>{row.getValue("teacherId")}</div>,
        },
         {
            accessorKey: "username",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
             cell: ({ row }) => <div>{row.original.username}</div>,
             enableHiding: true, // Hide by default
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
                     options={currentDepartmentOptions} // Use updated options
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

    const generateActionMenuItems = (facultyMember: Faculty) => ( // Renamed parameter
        <>
        {/* Update this item to open the modal in edit mode */}
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(facultyMember); }}>
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
                          This will reset the password for {facultyMember.firstName} {facultyMember.lastName} to the default format (first 2 letters of last name + 1000). Are you sure?
                     </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                     <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                     <AlertDialogAction
                          onClick={async (e) => {
                              e.stopPropagation();
                              await handleResetPassword(facultyMember.id, facultyMember.lastName); // Use facultyMember
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
                     This action cannot be undone. This will permanently delete the faculty
                     record for {facultyMember.firstName} {facultyMember.lastName}.
                 </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                 <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                 <AlertDialogAction
                      onClick={async (e) => {
                          e.stopPropagation();
                          await handleDeleteFaculty(facultyMember.id); // Use facultyMember
                     }}
                      className={cn(buttonVariants({ variant: "destructive" }))}
                      disabled={isSubmitting}
                     >
                     {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     Yes, delete faculty
                 </AlertDialogAction>
                 </AlertDialogFooter>
             </AlertDialogContent>
         </AlertDialog>
        </>
    );


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Faculty</h1> {/* Updated Title */}
         <Button onClick={openAddModal}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Faculty {/* Updated Button Text */}
        </Button>
      </div>

      {isLoading ? (
          <div className="flex justify-center items-center py-10">
             <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading faculty data... {/* Updated Text */}
         </div>
       ) : faculty.length === 0 ? ( // Use renamed state variable
             <p className="text-center text-muted-foreground py-10">No faculty found.</p> // Updated Text
       ) : (
            <DataTable
                columns={columns}
                data={faculty} // Use renamed state variable
                searchPlaceholder="Search by name..."
                searchColumnId="firstName"
                 actionMenuItems={generateActionMenuItems}
                 columnVisibility={columnVisibility}
                 setColumnVisibility={setColumnVisibility}
            />
        )}

        <UserForm<Faculty> // Use Faculty type
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen} // Pass setter directly
          formSchema={teacherSchema} // Schema remains teacherSchema for validation rules
          onSubmit={handleSaveFaculty} // Use renamed handler
          title={isEditMode ? `Faculty Details: ${selectedFaculty?.firstName} ${selectedFaculty?.lastName}` : 'Add New Faculty'} // Updated title
          description={isEditMode ? "View or update the faculty's information." : "Fill in the details below. Credentials are generated upon creation."} // Updated description
          formFields={facultyFormFields} // Pass the updated form fields
          isEditMode={isEditMode}
          initialData={isEditMode ? selectedFaculty : undefined} // Use renamed state variable
          startReadOnly={isEditMode} // Start in read-only mode when editing
        />
    </div>
  );
}

    