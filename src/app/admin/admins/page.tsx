
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Trash2, Loader2, RotateCcw, ShieldAlert, Info } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { UserForm, type FormFieldConfig } from "@/components/user-form";
import { adminUserSchema } from "@/lib/schemas";
import type { AdminUser } from "@/types";
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

const adminFormFields: FormFieldConfig<AdminUser>[] = [
  { name: "email", label: "Email", placeholder: "Enter admin email", type: "email", required: true, section: 'account' },
];

const CURRENT_SUPER_ADMIN_ID = 0;

export default function ManageAdminsPage() {
  const [admins, setAdmins] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedAdmin, setSelectedAdmin] = React.useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false); // Add state for edit mode
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

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

  const handleSaveAdmin = async (values: Pick<AdminUser, 'email'>) => {
    const payload = {
      email: values.email,
    };
    console.log(`Attempting to add admin:`, payload);
    try {
        const newAdmin = await postData<typeof payload, AdminUser>('admins/create.php', payload);
         const displayAdmin: AdminUser = {
             ...newAdmin,
             firstName: newAdmin.firstName || 'Admin',
             lastName: newAdmin.lastName || `User ${newAdmin.id}`,
         };
        setAdmins(prev => [...prev, displayAdmin]);
        toast({ title: "Admin Added", description: `Admin ${displayAdmin.username} (${displayAdmin.email}) has been added.` });
        closeModal();
    } catch (error: any) {
        console.error(`Failed to add admin:`, error);
        toast({ variant: "destructive", title: `Error Adding Admin`, description: error.message || `Could not add admin.` });
        throw error;
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
      if (adminId === CURRENT_SUPER_ADMIN_ID) {
          toast({ variant: "destructive", title: "Error", description: "Cannot delete the main super admin account." });
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
      if (userId === CURRENT_SUPER_ADMIN_ID) {
         toast({ variant: "warning", title: "Action Not Allowed", description: "Super admin password must be changed via Settings." });
         return;
      }
      setIsSubmitting(true);
      const adminToReset = admins.find(a => a.id === userId);
      const lastNameForPassword = adminToReset?.lastName || 'user';

      try {
           await postData('admin/reset_password.php', { userId, userType: 'admin', lastName: lastNameForPassword });
           const defaultPassword = `${lastNameForPassword.substring(0, 2).toLowerCase()}1000`;
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
    setIsEditMode(false); // Ensure edit mode is off
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

    // Function to open modal in view/edit mode (will start read-only)
   const openEditModal = (admin: AdminUser) => {
       if (admin.isSuperAdmin) {
           toast({ variant: "info", title: "Info", description: "Super Admin details cannot be viewed or edited here." });
           return;
       }
       setIsEditMode(true);
       setSelectedAdmin(admin);
       setIsModalOpen(true);
   };

   const closeModal = () => {
       setIsModalOpen(false);
       // No need to delay clearing state for Admin form as it's simpler
       setSelectedAdmin(null);
       setIsEditMode(false);
   };

  const columns: ColumnDef<AdminUser>[] = React.useMemo(() => [
    {
        accessorKey: "username",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
    },
    {
        accessorKey: "firstName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" />,
        cell: ({ row }) => row.original.firstName || <span className="text-muted-foreground italic">N/A</span>,
    },
    {
        accessorKey: "lastName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
         cell: ({ row }) => row.original.lastName || <span className="text-muted-foreground italic">N/A</span>,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || <span className="text-muted-foreground italic">N/A</span>,
    },
    {
        accessorKey: "isSuperAdmin",
        header: "Role",
        cell: ({ row }) => row.original.isSuperAdmin ? <Badge variant="destructive">Super Admin</Badge> : <Badge variant="secondary">Admin</Badge>,
    }
  ], []);

  const generateActionMenuItems = (admin: AdminUser) => (
    <>
      {/* View/Edit Details - Only for non-super admins */}
      <DropdownMenuItem
        onClick={(e) => { e.stopPropagation(); openEditModal(admin); }}
        disabled={admin.isSuperAdmin} // Disable for super admin
      >
        <Info className="mr-2 h-4 w-4" /> View Details
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <AlertDialog>
         <AlertDialogTrigger asChild>
             <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className={cn("text-orange-600 focus:text-orange-600 focus:bg-orange-100", admin.isSuperAdmin && "opacity-50 cursor-not-allowed")}
                disabled={admin.isSuperAdmin || isSubmitting}
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
                className={cn("text-destructive focus:text-destructive focus:bg-destructive/10", admin.isSuperAdmin && "opacity-50 cursor-not-allowed")}
                disabled={admin.isSuperAdmin || isSubmitting}
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
        <Button onClick={openAddModal}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Admin
        </Button>
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
                actionMenuItems={generateActionMenuItems}
            />
        )}

      {/* Modal uses UserForm, now expecting only email */}
      <UserForm<AdminUser>
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            formSchema={adminUserSchema}
            onSubmit={(values) => handleSaveAdmin(values as Pick<AdminUser, 'email'>)} // Only submit email
            title={isEditMode ? `Admin Details: ${selectedAdmin?.username}` : 'Add New Admin'}
            description={isEditMode ? "View admin details." : "Enter the email address for the new admin. Username and default password will be auto-generated. The new admin can change their password via Settings."}
            formFields={adminFormFields}
            isEditMode={isEditMode}
            initialData={isEditMode ? selectedAdmin : undefined}
            startReadOnly={isEditMode} // Start read-only when viewing/editing
        />
    </div>
  );
}
