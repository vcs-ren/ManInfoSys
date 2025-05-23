
"use client";

import * as React from "react";
import type { ColumnDef, VisibilityState, ColumnFiltersState } from "@tanstack/react-table";
import { PlusCircle, Trash2, Loader2, RotateCcw, Pencil, Edit3, UserCog, Users, Library, ClipboardList, Settings as SettingsIcon, LayoutDashboard } from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'next/navigation';

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import { UserForm, type FormFieldConfig } from "@/components/user-form";
import { teacherSchema } from "@/lib/schemas";
import type { Faculty, EmploymentType, DepartmentType, AdminUser, AdminRole } from "@/types";
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchData, postData, putData, deleteData, USE_MOCK_API, mockFaculty, logActivity, mockApiAdmins } from "@/lib/api";
import { generateDefaultPasswordDisplay } from "@/lib/utils";


const baseDepartmentOptions: { value: DepartmentType; label: string }[] = [
    { value: "Teaching", label: "Teaching" },
    { value: "Administrative", label: "Administrative" },
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

// This function will now generate the fields with dynamic options/disabled states
const generateFacultyFormFields = (
    isCurrentUserSuperAdmin: boolean,
    isEditingMode: boolean,
    initialDepartment?: DepartmentType
): FormFieldConfig<Faculty>[] => [
  { name: "firstName", label: "First Name", placeholder: "Enter first name", required: true, section: 'personal' },
  { name: "lastName", label: "Last Name", placeholder: "Enter last name", required: true, section: 'personal' },
  { name: "middleName", label: "Middle Name", placeholder: "Enter middle name (optional)", section: 'personal' },
  { name: "suffix", label: "Suffix", placeholder: "e.g., Jr., Sr., III (optional)", section: 'personal' },
  { name: "gender", label: "Gender", type: "select", options: genderOptions, placeholder: "Select gender (optional)", section: 'personal' },
  { name: "birthday", label: "Birthday", placeholder: "YYYY-MM-DD (optional)", type: "date", section: 'personal' },
  { name: "address", label: "Address", placeholder: "Enter full address (optional)", type: "textarea", section: 'personal' },
  { name: "employmentType", label: "Employment Type", type: "select", options: employmentTypeOptions, placeholder: "Select employment type", required: true, section: 'employee' },
  {
    name: "department",
    label: "Department",
    type: "select",
    options: (() => {
        if (!isCurrentUserSuperAdmin) {
            if (!isEditingMode) { // Sub Admin adding new
                return baseDepartmentOptions.filter(opt => opt.value === 'Teaching');
            }
            if (isEditingMode && initialDepartment === 'Teaching') { // Sub Admin editing Teaching staff
                return baseDepartmentOptions.filter(opt => opt.value !== 'Administrative');
            }
            // If Sub Admin editing Administrative staff, field is disabled, show current value.
            // So returning all options here is fine as the `disabled` logic handles it.
            // Or better, just return the single current department if it's Administrative.
            if (isEditingMode && initialDepartment === 'Administrative') {
                 return baseDepartmentOptions.filter(opt => opt.value === 'Administrative');
            }
        }
        return baseDepartmentOptions; // Super Admin can see all options
    })(),
    placeholder: "Select department",
    required: true,
    section: 'employee',
    disabled: (currentData, isSuperAdminFromUserForm, isEditingModeFromUserForm, initialDeptFromUserForm) => {
        if (!isSuperAdminFromUserForm) {
          if (!isEditingModeFromUserForm) return true; // Sub-admin adding new: disabled (forced to Teaching)
          if (initialDeptFromUserForm === 'Administrative') return true; // Sub-admin editing Admin staff: disabled
        }
        return false; // Super-admin can always edit, Sub-admin can edit Teaching staff's dept (but not to Admin)
    }
  },
  { name: "phone", label: "Contact Number", placeholder: "Enter contact number (optional)", type: "tel", section: 'contact' },
  { name: "email", label: "Email", placeholder: "Enter email (optional)", type: "email", section: 'contact' },
  { name: "emergencyContactName", label: "Emergency Contact Name", placeholder: "Parent/Guardian/Spouse Name (optional)", type: "text", section: 'emergency' },
  { name: "emergencyContactRelationship", label: "Relationship", placeholder: "e.g., Mother, Father, Spouse (optional)", type: "text", section: 'emergency' },
  { name: "emergencyContactPhone", label: "Emergency Contact Phone", placeholder: "Contact Number (optional)", type: "tel", section: 'emergency' },
  { name: "emergencyContactAddress", label: "Emergency Contact Address", placeholder: "Full Address (optional)", type: "textarea", section: 'emergency' },
];


export default function ManageFacultyPage() {
  const [faculty, setFaculty] = React.useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedFaculty, setSelectedFaculty] = React.useState<Faculty | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCurrentUserSuperAdmin, setIsCurrentUserSuperAdmin] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = React.useState<AdminRole | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

   const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
     middleName: false,
     suffix: false,
     birthday: false,
     address: false,
     email: false,
     phone: false,
     gender: false,
     employmentType: false,
     emergencyContactName: false,
     emergencyContactRelationship: false,
     emergencyContactPhone: false,
     emergencyContactAddress: false,
     username: false,
     lastAccessed: false,
   });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      const storedUserRole = localStorage.getItem('userRole') as AdminRole | null;
      const parsedUserId = storedUserId ? parseInt(storedUserId, 10) : null;
      setCurrentUserId(parsedUserId);
      setCurrentUserRole(storedUserRole);
      setIsCurrentUserSuperAdmin(parsedUserId === 0 && storedUserRole === 'Super Admin');
    }
  }, []);

  const facultyFormFields = React.useMemo(() => {
    const initialDept = isEditMode && selectedFaculty ? selectedFaculty.department : undefined;
    return generateFacultyFormFields(isCurrentUserSuperAdmin, isEditMode, initialDept);
  }, [isCurrentUserSuperAdmin, isEditMode, selectedFaculty]);


    const fetchFacultyData = React.useCallback(async () => {
      setIsLoading(true);
       try {
        let data;
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 300));
            data = [...mockFaculty].sort((a,b) => b.id - a.id);
        } else {
            const fetchedData = await fetchData<Faculty[]>('teachers/read.php');
            data = (fetchedData || []).sort((a,b) => b.id - a.id);
        }

        let facultyList = data || [];
        if (currentUserRole === 'Sub Admin' && currentUserId !== null && !isCurrentUserSuperAdmin) { // Ensure super admin is not filtered out
            facultyList = facultyList.filter(f => f.id !== currentUserId);
        }

        setFaculty(facultyList);
      } catch (error: any) {
        console.error("Failed to fetch faculty:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load faculty data." });
      } finally {
        setIsLoading(false);
      }
    }, [toast, currentUserRole, currentUserId, isCurrentUserSuperAdmin]); // Added isCurrentUserSuperAdmin

  React.useEffect(() => {
    if (currentUserId !== null) { // Only fetch if userId is determined
        fetchFacultyData();
    }
  }, [fetchFacultyData, currentUserId]);


  React.useEffect(() => {
    const departmentQuery = searchParams.get('department');
    if (departmentQuery) {
        setColumnFilters([{ id: 'department', value: [departmentQuery] }]);
    } else {
        setColumnFilters(prevFilters => prevFilters.filter(f => f.id !== 'department'));
    }
  }, [searchParams]);

  const handleSaveFaculty = async (values: Faculty) => {
    setIsSubmitting(true);

    const isDuplicate = faculty.some(
      (f) =>
        f.firstName.toLowerCase() === values.firstName.toLowerCase() &&
        f.lastName.toLowerCase() === values.lastName.toLowerCase() &&
        (!isEditMode || (isEditMode && selectedFaculty && f.id !== selectedFaculty.id))
    );

    if (isDuplicate) {
      toast({ variant: "destructive", title: "Duplicate Name", description: `A faculty member named ${values.firstName} ${values.lastName} already exists.` });
      setIsSubmitting(false);
      throw new Error("Duplicate name");
    }

     const payload = { ...values, id: isEditMode ? selectedFaculty?.id : undefined };

     if (!isCurrentUserSuperAdmin) {
        if (!isEditMode) { // Sub Admin adding new faculty
            payload.department = 'Teaching';
        } else if (isEditMode && selectedFaculty?.department === 'Teaching' && payload.department === 'Administrative') {
            // Sub Admin trying to change Teaching to Administrative
            toast({ variant: "destructive", title: "Unauthorized Action", description: "You cannot change department to Administrative."});
            setIsSubmitting(false);
            throw new Error("Unauthorized department change");
        } else if (isEditMode && selectedFaculty?.department === 'Administrative' && payload.department !== 'Administrative') {
            // Sub Admin trying to change Administrative staff to something else
             toast({ variant: "destructive", title: "Unauthorized Action", description: "Department of Administrative staff cannot be changed by Sub Admins."});
            setIsSubmitting(false);
            throw new Error("Unauthorized department change");
        }
     }


     console.log(`Attempting to ${isEditMode ? 'edit' : 'add'} faculty:`, payload);
     try {
         let savedFacultyResponse: Faculty;
         if (isEditMode && payload.id) {
              savedFacultyResponse = await putData<typeof payload, Faculty>(`teachers/update.php/${payload.id}`, payload);
             logActivity("Updated Faculty", `${savedFacultyResponse.firstName} ${savedFacultyResponse.lastName}`, "Admin", savedFacultyResponse.id, "faculty");
         } else {
              savedFacultyResponse = await postData<Omit<typeof payload, 'id' | 'facultyId' | 'username' | 'lastAccessed'>, Faculty>('teachers/create.php', payload);
             logActivity("Added Faculty", `${savedFacultyResponse.firstName} ${savedFacultyResponse.lastName} (${savedFacultyResponse.username})`, "Admin", savedFacultyResponse.id, "faculty", true, { ...savedFacultyResponse, passwordHash: "mock_hash" });
         }

         await fetchFacultyData();
         toast({ title: isEditMode ? "Faculty Updated" : "Faculty Added", description: `${savedFacultyResponse.firstName} ${savedFacultyResponse.lastName} has been ${isEditMode ? 'updated' : 'added'}.` });
         closeModal();
     } catch (error: any) {
        if (error.message !== "Duplicate name" && error.message !== "Unauthorized department change") {
             console.error(`Failed to ${isEditMode ? 'update' : 'add'} faculty:`, error);
             toast({ variant: "destructive", title: `Error ${isEditMode ? 'Updating' : 'Adding'} Faculty`, description: error.message || `Could not ${isEditMode ? 'update' : 'add'} faculty.` });
        }
     } finally {
        setIsSubmitting(false);
     }
  };

  const handleDeleteFaculty = async (facultyId: number) => {
      setIsSubmitting(true);
      const facultyToDelete = faculty.find(f => f.id === facultyId);
      if (facultyToDelete?.department === 'Administrative' && !isCurrentUserSuperAdmin) {
          toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can delete Administrative staff."});
          setIsSubmitting(false);
          return;
      }
      try {
             await deleteData(`teachers/delete.php/${facultyId}`);
            await fetchFacultyData();
            toast({ title: "Faculty Deleted", description: `Faculty record has been removed.` });
            if (facultyToDelete) {
                logActivity("Deleted Faculty", `${facultyToDelete.firstName} ${facultyToDelete.lastName} (${facultyToDelete.username})`, "Admin", facultyId, "faculty", true, facultyToDelete);
            }
      } catch (error: any) {
          console.error("Failed to delete faculty:", error);
          toast({ variant: "destructive", title: "Error Deleting Faculty", description: error.message || "Could not remove faculty record." });
      } finally {
          setIsSubmitting(false);
      }
  };

    const handleResetPassword = async (userId: number, lastName: string) => {
        setIsSubmitting(true);
        try {
             await postData('admin/reset_password.php', { userId, userType: 'teacher', lastName });
             const defaultPassword = generateDefaultPasswordDisplay(lastName);
             toast({
                  title: "Password Reset Successful",
                  description: `Password for faculty ID ${userId} has been reset. Default password: ${defaultPassword}`,
             });
             logActivity("Reset Faculty Password", `For faculty ID ${userId}`, "Admin");
        } catch (error: any) {
             console.error("Failed to reset password:", error);
             toast({
                  variant: "destructive",
                  title: "Password Reset Failed",
                  description: error.message || "Could not reset faculty password.",
             });
        } finally {
             setIsSubmitting(false);
        }
    };

   const openAddModal = () => {
    setIsEditMode(false);
    setSelectedFaculty(null);
    setIsModalOpen(true);
  };

  const openEditModal = (facultyMember: Faculty) => {
    setIsEditMode(true);
    setSelectedFaculty(facultyMember);
    setIsModalOpen(true);
  };

   const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedFaculty(null);
            setIsEditMode(false);
        }, 150);
   };

    const currentDepartmentFilterOptions = React.useMemo(() => baseDepartmentOptions, []);

    const columns: ColumnDef<Faculty>[] = React.useMemo(() => [
         {
            accessorKey: "facultyId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Faculty ID" />,
            cell: ({ row }) => <div>{row.getValue("facultyId")}</div>,
        },
         {
            accessorKey: "username",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
             cell: ({ row }) => <div>{row.original.username}</div>,
             enableHiding: true,
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
                     options={currentDepartmentFilterOptions}
                 />
             ),
            cell: ({ row }) => <div>{row.getValue("department")}</div>,
             filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "gender",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
            cell: ({ row }) => <div className="capitalize">{row.original.gender || '-'}</div>,
            enableHiding: true,
        },
        {
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
        {
            accessorKey: "lastAccessed",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Last Accessed" />,
            cell: ({ row }) => {
                const lastAccessed = row.original.lastAccessed;
                if (!lastAccessed) return <span className="text-muted-foreground italic">Never</span>;
                try {
                    return (
                        <div className="flex flex-col">
                            <span>{format(new Date(lastAccessed), "MMM d, yyyy, p")}</span>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(lastAccessed), { addSuffix: true })}</span>
                        </div>
                    );
                } catch (e) {
                    return <span className="text-muted-foreground italic">Invalid Date</span>;
                }
            },
            enableHiding: true,
        },
    ], [currentDepartmentFilterOptions]);

    const generateActionMenuItems = (facultyMember: Faculty) => (
        <>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(facultyMember); }}>
            <Pencil className="mr-2 h-4 w-4" />
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
                          This will reset the password for {facultyMember.firstName} {facultyMember.lastName}. Default: {generateDefaultPasswordDisplay(facultyMember.lastName)}. Are you sure?
                     </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                     <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                     <AlertDialogAction
                          onClick={async (e) => {
                              e.stopPropagation();
                              await handleResetPassword(facultyMember.id, facultyMember.lastName);
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
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className={cn("text-destructive focus:text-destructive focus:bg-destructive/10", facultyMember.department === 'Administrative' && !isCurrentUserSuperAdmin && "opacity-50 cursor-not-allowed")}
                    disabled={isSubmitting || (facultyMember.department === 'Administrative' && !isCurrentUserSuperAdmin)}
                  >
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
                          await handleDeleteFaculty(facultyMember.id);
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
        <h1 className="text-3xl font-bold">Manage Faculty</h1>
         <Button onClick={openAddModal}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Faculty
        </Button>
      </div>

      {isLoading ? (
          <div className="flex justify-center items-center py-10">
             <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading faculty data...
         </div>
       ) : faculty.length === 0 ? (
             <p className="text-center text-muted-foreground py-10">No faculty found.</p>
       ) : (
            <DataTable
                columns={columns}
                data={faculty}
                searchPlaceholder="Search by ID or Last Name..."
                actionMenuItems={generateActionMenuItems}
                columnVisibility={columnVisibility}
                setColumnVisibility={setColumnVisibility}
                 filterableColumnHeaders={[
                    { columnId: "department", title: "Department", options: baseDepartmentOptions }
                ]}
                initialColumnFilters={columnFilters}
            />
        )}

        <UserForm<Faculty>
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          formSchema={teacherSchema}
          onSubmit={handleSaveFaculty}
          title={isEditMode ? `Faculty Details: ${selectedFaculty?.firstName} ${selectedFaculty?.lastName}` : 'Add New Faculty'}
          description={isEditMode ? "View or update the faculty's information." : "Fill in the details below. Credentials are generated upon creation."}
          formFields={facultyFormFields}
          isEditMode={isEditMode}
          initialData={isEditMode ? selectedFaculty : undefined}
          defaultValues={isEditMode ? undefined : (!isCurrentUserSuperAdmin ? { department: 'Teaching' } : { department: 'Teaching' })}
          startReadOnly={isEditMode}
          currentUserIsSuperAdmin={isCurrentUserSuperAdmin}
        />
    </div>
  );
}

    