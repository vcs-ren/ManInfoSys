
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

// Define form fields for the UserForm component - Only Email
const adminFormFields: FormFieldConfig<AdminUser>[] = [
  { name: "email", label: "Email", placeholder: "Enter admin email", type: "email", required: true },
  // First Name and Last Name are removed from the form
];

// Assume the current logged-in admin is the super admin (ID 0 or fetched from session)
const CURRENT_SUPER_ADMIN_ID = 0; // Replace with actual session logic if available

export default function ManageAdminsPage() {
  const [admins, setAdmins] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedAdmin, setSelectedAdmin] = React.useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        const data = await fetchData<AdminUser[]>('admins/read.php'); // Fetch actual admins
        setAdmins(data || []); // Use fetched data
      } catch (error: any) {
        console.error("Failed to fetch admins:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load admin data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdmins();
  }, [toast]);

  const handleSaveAdmin = async (values: Pick<AdminUser, 'email'>) => { // Expect only email from form
    // Payload now only contains email
    const payload = {
      email: values.email,
      // Backend needs to handle generating firstName/lastName placeholders if needed
    };
    console.log(`Attempting to add admin:`, payload);
    try {
        const newAdmin = await postData<typeof payload, AdminUser>('admins/create.php', payload);
         // Ensure the received newAdmin might have placeholders for name if backend doesn't return them
         const displayAdmin: AdminUser = {
             ...newAdmin,
             firstName: newAdmin.firstName || 'Admin', // Placeholder if missing
             lastName: newAdmin.lastName || `User ${newAdmin.id}`, // Placeholder if missing
         };
        setAdmins(prev => [...prev, displayAdmin]);
        toast({ title: "Admin Added", description: `Admin ${displayAdmin.username} (${displayAdmin.email}) has been added.` });
        setIsModalOpen(false);
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
       // Find the admin to get lastName for default password generation (or use a placeholder)
      const adminToReset = admins.find(a => a.id === userId);
      const lastNameForPassword = adminToReset?.lastName || 'user'; // Fallback if lastName isn't available

      try {
           // Pass lastName for potential default password generation on backend if needed
           await postData('admin/reset_password.php', { userId, userType: 'admin', lastName: lastNameForPassword });
           // Assume default password format is known or backend handles it
           const defaultPassword = `${lastNameForPassword.substring(0, 2).toLowerCase()}1000`; // Example format
           toast({
                title: "Password Reset Successful",
                description: `Password for admin ID ${userId} has been reset. Default password: ${defaultPassword}`, // Inform user of the standard default
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
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<AdminUser>[] = React.useMemo(() => [
    {
        accessorKey: "username",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
    },
    {
        accessorKey: "firstName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" />,
        cell: ({ row }) => row.original.firstName || <span className="text-muted-foreground italic">N/A</span>, // Handle potential missing names
    },
    {
        accessorKey: "lastName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
         cell: ({ row }) => row.original.lastName || <span className="text-muted-foreground italic">N/A</span>, // Handle potential missing names
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
      {/* No View/Edit for other admins by default */}
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
                searchColumnId="username" // Or "email"
                actionMenuItems={generateActionMenuItems}
            />
        )}

      {/* Modal uses UserForm, now expecting only email */}
      <UserForm<AdminUser>
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            formSchema={adminUserSchema} // Use the updated schema
            onSubmit={(values) => handleSaveAdmin(values as Pick<AdminUser, 'email'>)} // Adapt onSubmit call
            title={'Add New Admin'}
            description={"Enter the email address for the new admin. Username and default password will be auto-generated. The new admin can change their password via Settings."}
            formFields={adminFormFields} // Use updated form fields config
            isEditMode={false} // Add mode only for simplicity here
        />
    </div>
  );
}
