
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Trash2, Loader2, RotateCcw, ShieldAlert, Info } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { UserForm, type FormFieldConfig } from "@/components/user-form";
import { adminUserSchema } from "@/lib/schemas";
import type { AdminUser, AdminRole } from "@/types"; // Import AdminRole
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
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchData, postData, deleteData } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const adminRoleOptions: { value: AdminRole; label: string }[] = [
    { value: "Super Admin", label: "Super Admin" },
    { value: "Sub Admin", label: "Sub Admin" },
    // Add other roles here if needed in the future
];

// Update form fields to remove names and add Role
const adminFormFields: FormFieldConfig<AdminUser>[] = [
  { name: "email", label: "Email", placeholder: "Enter admin email", type: "email", required: true, section: 'account' },
  { name: "role", label: "Role", type: "select", options: adminRoleOptions, placeholder: "Select admin role", required: true, section: 'account' },
];

const CURRENT_SUPER_ADMIN_ID = 0; // Assuming Super Admin always has ID 0 from seed data

export default function ManageAdminsPage() {
  const [admins, setAdmins] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedAdmin, setSelectedAdmin] = React.useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false); // For viewing details (no actual edit)
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  // TODO: Implement check for current user's role (should be Super Admin to manage others)
  const isCurrentUserSuperAdmin = true; // Placeholder - fetch actual role

  React.useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        const data = await fetchData<AdminUser[]>('admins/read.php');
        setAdmins(data || []);
      } catch (error: any) {
        console.error("Failed to fetch admins:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load admin data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdmins();
  }, [toast]);

  const handleSaveAdmin = async (values: Pick<AdminUser, 'email' | 'role'>) => {
    // Only Super Admin can add
    if (!isCurrentUserSuperAdmin) {
        toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can add new admins." });
        return;
    }
    const payload = {
      email: values.email,
      role: values.role,
    };
    console.log(`Attempting to add admin:`, payload);
    try {
        const newAdmin = await postData<typeof payload, AdminUser>('admins/create.php', payload);
        setAdmins(prev => [...prev, newAdmin]);
        toast({ title: "Admin Added", description: `Admin ${newAdmin.username} (${newAdmin.email}) with role ${newAdmin.role} has been added.` });
        closeModal();
    } catch (error: any) {
        console.error(`Failed to add admin:`, error);
        toast({ variant: "destructive", title: `Error Adding Admin`, description: error.message || `Could not add admin.` });
        throw error;
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
      // Only Super Admin can delete, and cannot delete self
      if (!isCurrentUserSuperAdmin) {
         toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can delete admins." });
         return;
      }
       if (adminId === CURRENT_SUPER_ADMIN_ID) {
           toast({ variant: "destructive", title: "Error", description: "Cannot delete the main Super Admin account." });
           return;
       }
      setIsSubmitting(true);
      try {
          await deleteData(`admins/delete.php/${adminId}`);
          setAdmins(prev => prev.filter(a => a.id !== adminId));
          toast({ title: "Admin Deleted", description: `Admin record has been removed.` });
      } catch (error: any) {
           console.error("Failed to delete admin:", error);
           toast({ variant: "destructive", title: "Error Deleting Admin", description: error.message || "Could not remove admin record." });
      } finally {
           setIsSubmitting(false);
      }
  };

  const handleResetPassword = async (userId: number) => {
       // Only Super Admin can reset others' passwords
       if (!isCurrentUserSuperAdmin) {
            toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can reset passwords." });
            return;
        }
      if (userId === CURRENT_SUPER_ADMIN_ID) {
         toast({ variant: "warning", title: "Action Not Allowed", description: "Super Admin password must be changed via Settings." });
         return;
      }
      setIsSubmitting(true);
      const adminToReset = admins.find(a => a.id === userId);
      const lastNameForPassword = 'user'; // Use a generic fallback since names are removed

      try {
           // The PHP endpoint now only needs userId and userType
           await postData('admin/reset_password.php', { userId, userType: 'admin' });
           const defaultPassword = `${lastNameForPassword.substring(0, 2).toLowerCase()}1000`; // Use generic default format
           toast({
                title: "Password Reset Successful",
                description: `Password for admin ID ${userId} has been reset. Default password: ${defaultPassword}`,
           });
      } catch (error: any) {
           console.error("Failed to reset admin password:", error);
           toast({
                variant: "destructive",
                title: "Password Reset Failed",
                description: error.message || "Could not reset admin password.",
           });
      } finally {
           setIsSubmitting(false);
      }
  };

  const openAddModal = () => {
     // Only Super Admin can open the add modal
     if (!isCurrentUserSuperAdmin) {
        toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can add new admins." });
        return;
    }
    setIsEditMode(false);
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

   // Function to open modal in view mode (no edit functionality here)
   const openViewModal = (admin: AdminUser) => {
       setIsEditMode(true); // Use edit mode flag to signal viewing
       setSelectedAdmin(admin);
       setIsModalOpen(true);
   };

   const closeModal = () => {
       setIsModalOpen(false);
       setSelectedAdmin(null);
       setIsEditMode(false);
   };

    // Update columns to remove names and add Role
   const columns: ColumnDef<AdminUser>[] = React.useMemo(() => [
    {
        accessorKey: "username",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || <span className="text-muted-foreground italic">N/A</span>,
    },
    {
        accessorKey: "role", // Use the new role field
        header: "Role",
        cell: ({ row }) => (
            <Badge variant={row.original.role === 'Super Admin' ? 'destructive' : 'secondary'}>
                {row.original.role}
            </Badge>
        ),
         filterFn: (row, id, value) => value.includes(row.getValue(id)), // Allow filtering by role
    }
   ], []);

   // Generate actions, disable if not Super Admin or if action targets Super Admin
    const generateActionMenuItems = (admin: AdminUser) => (
        <>
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); openViewModal(admin); }}
            // Viewing details might be allowed for non-super admins, adjust if needed
          >
            <Info className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialog>
             <AlertDialogTrigger asChild>
                 <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className={cn("text-orange-600 focus:text-orange-600 focus:bg-orange-100", (!isCurrentUserSuperAdmin || admin.isSuperAdmin) && "opacity-50 cursor-not-allowed")}
                    disabled={!isCurrentUserSuperAdmin || admin.isSuperAdmin || isSubmitting}
                 >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset Password
                 </DropdownMenuItem>
             </AlertDialogTrigger>
             <AlertDialogContent>
                 <AlertDialogHeader>
                     <AlertDialogTitle>Reset Password?</AlertDialogTitle>
                     <AlertDialogDescription>
                          This will reset the password for admin {admin.username} ({admin.email}). Are you sure?
                     </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                     <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                     <AlertDialogAction
                          onClick={() => handleResetPassword(admin.id)}
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
                    className={cn("text-destructive focus:text-destructive focus:bg-destructive/10", (!isCurrentUserSuperAdmin || admin.isSuperAdmin) && "opacity-50 cursor-not-allowed")}
                    disabled={!isCurrentUserSuperAdmin || admin.isSuperAdmin || isSubmitting}
                 >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Admin
                 </DropdownMenuItem>
             </AlertDialogTrigger>
             <AlertDialogContent>
                 <AlertDialogHeader>
                 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                 <AlertDialogDescription>
                     This action cannot be undone. This will permanently delete the admin account for {admin.username} ({admin.email}).
                 </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                 <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                 <AlertDialogAction
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className={cn(buttonVariants({ variant: "destructive" }))}
                      disabled={isSubmitting}
                     >
                     {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     Yes, delete admin
                 </AlertDialogAction>
                 </AlertDialogFooter>
             </AlertDialogContent>
         </AlertDialog>
        </>
    );


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Admins</h1>
        <Button onClick={openAddModal} disabled={!isCurrentUserSuperAdmin}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Admin
        </Button>
         {!isCurrentUserSuperAdmin && (
            <p className="text-sm text-destructive">Only Super Admins can add new admins.</p>
         )}
      </div>

      {isLoading ? (
         <div className="flex justify-center items-center py-10">
             <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading admin data...
         </div>
       ) : admins.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No additional admins found.</p>
       ) : (
            <DataTable
                columns={columns}
                data={admins}
                searchPlaceholder="Search by username or email..."
                searchColumnId="username"
                 filterableColumnHeaders={[ // Add role filter
                    { columnId: 'role', title: 'Role', options: adminRoleOptions }
                 ]}
                actionMenuItems={generateActionMenuItems}
            />
        )}

      {/* Modal uses UserForm, now expecting email and role */}
      <UserForm<AdminUser>
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            formSchema={adminUserSchema}
            onSubmit={(values) => handleSaveAdmin(values as Pick<AdminUser, 'email' | 'role'>)}
            title={isEditMode ? `Admin Details: ${selectedAdmin?.username}` : 'Add New Admin'}
            description={isEditMode ? "View admin details." : "Enter email and select role for the new admin. Username and default password will be auto-generated."}
            formFields={adminFormFields}
            isEditMode={isEditMode} // Used for title/description and read-only state
            initialData={isEditMode ? selectedAdmin : undefined}
            startReadOnly={isEditMode} // Start read-only when viewing
        />
    </div>
  );
}
