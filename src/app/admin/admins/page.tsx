
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, Loader2, RotateCcw, ShieldAlert, Info } from "lucide-react"; // Removed PlusCircle

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
// import { UserForm, type FormFieldConfig } from "@/components/user-form"; // UserForm no longer needed for adding
// import { adminUserSchema } from "@/lib/schemas"; // Schema no longer needed for adding
import type { AdminUser, AdminRole } from "@/types";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // For view details

const CURRENT_SUPER_ADMIN_ID = 0; // Assuming Super Admin always has ID 0 from seed data

export default function ManageAdminsPage() {
  const [admins, setAdmins] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedAdminForView, setSelectedAdminForView] = React.useState<AdminUser | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  // TODO: Implement check for current user's role (should be Super Admin to manage others)
  const isCurrentUserSuperAdmin = true; // Placeholder - fetch actual role

  React.useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        // The mock API for 'admins/read.php' now combines Super Admin from mockAdmins
        // and Sub Admins derived from mockFaculty with 'Administrative' department.
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


  const handleDeleteAdmin = async (adminId: number, adminUsername?: string) => {
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
          // Note: Deleting an admin who is also a faculty member should ideally have cascading logic
          // in a real backend (e.g., remove from faculty or change department).
          // For mock, we just remove from the admin view. The faculty entry remains.
          await deleteData(`admins/delete.php/${adminId}`);
          setAdmins(prev => prev.filter(a => a.id !== adminId));
          toast({ title: "Admin Removed", description: `Admin ${adminUsername || `ID ${adminId}`} has been removed from admin roles.` });
      } catch (error: any) {
           console.error("Failed to delete admin:", error);
           toast({ variant: "destructive", title: "Error Removing Admin", description: error.message || "Could not remove admin role." });
      } finally {
           setIsSubmitting(false);
      }
  };

  const handleResetPassword = async (userId: number, username?: string) => {
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
      // For sub-admins (derived from faculty), their password reset is tied to their faculty last name.
      // The 'admin/reset_password.php' endpoint needs to handle 'admin' userType and find the corresponding faculty's last name.
      // Or, if sub-admins store their own password hash separately, then this works as is.
      // Based on previous setup, reset_password.php takes userType: 'admin'
      // and should ideally fetch the faculty's last name if the admin is a faculty member.
      // For mock: we can assume the backend handles it.
      const lastNameForPassword = adminToReset?.lastName || 'user'; // Use admin's last name if available, else generic

      try {
           await postData('admin/reset_password.php', { userId, userType: 'admin', lastName: lastNameForPassword });
           const defaultPassword = `${lastNameForPassword.substring(0, 2).toLowerCase()}1000`;
           toast({
                title: "Password Reset Successful",
                description: `Password for admin ${username || `ID ${userId}`} has been reset. Default password: ${defaultPassword}`,
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

   const openViewModal = (admin: AdminUser) => {
       setSelectedAdminForView(admin);
       setIsViewModalOpen(true);
   };

   const closeViewModal = () => {
       setIsViewModalOpen(false);
       setSelectedAdminForView(null);
   };

   const columns: ColumnDef<AdminUser>[] = React.useMemo(() => [
    {
        accessorKey: "username",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
    },
    { // Display First Name if available (for faculty-derived admins)
        accessorKey: "firstName",
        header: "First Name",
        cell: ({ row }) => row.original.firstName || <span className="text-muted-foreground italic">N/A</span>,
    },
    { // Display Last Name if available
        accessorKey: "lastName",
        header: "Last Name",
        cell: ({ row }) => row.original.lastName || <span className="text-muted-foreground italic">N/A</span>,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || <span className="text-muted-foreground italic">N/A</span>,
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
            <Badge variant={row.original.role === 'Super Admin' ? 'destructive' : 'secondary'}>
                {row.original.role}
            </Badge>
        ),
         filterFn: (row, id, value) => value.includes(row.getValue(id)),
    }
   ], []);

    const generateActionMenuItems = (admin: AdminUser) => (
        <>
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); openViewModal(admin); }}
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
                          onClick={() => handleResetPassword(admin.id, admin.username)}
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
                      Remove Admin Role
                 </DropdownMenuItem>
             </AlertDialogTrigger>
             <AlertDialogContent>
                 <AlertDialogHeader>
                 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                 <AlertDialogDescription>
                     This action cannot be undone. This will remove the admin role for {admin.username} ({admin.email}). If this user is also a faculty member, their faculty record will remain.
                 </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                 <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                 <AlertDialogAction
                      onClick={() => handleDeleteAdmin(admin.id, admin.username)}
                      className={cn(buttonVariants({ variant: "destructive" }))}
                      disabled={isSubmitting}
                     >
                     {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                     Yes, remove role
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
         {/* "Add New Admin" button is removed. Admins are added via Faculty (Administrative department) */}
      </div>
       <p className="text-sm text-muted-foreground">
            This page lists all administrators. The Super Admin is a system default. Sub Admins are faculty members with an 'Administrative' department.
            To add a new Sub Admin, add a new faculty member and assign them to the 'Administrative' department via the <Link href="/admin/teachers" className="underline hover:text-primary">Manage Faculty</Link> page.
      </p>

      {isLoading ? (
         <div className="flex justify-center items-center py-10">
             <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading admin data...
         </div>
       ) : admins.length === 0 ? ( // Should at least show Super Admin
            <p className="text-center text-muted-foreground py-10">No admin accounts found (this should not happen).</p>
       ) : (
            <DataTable
                columns={columns}
                data={admins}
                searchPlaceholder="Search by username or email..."
                searchColumnId="username"
                 filterableColumnHeaders={[
                    { columnId: 'role', title: 'Role', options: [{value: 'Super Admin', label: 'Super Admin'}, {value: 'Sub Admin', label: 'Sub Admin'}] }
                 ]}
                actionMenuItems={generateActionMenuItems}
            />
        )}

        {/* Modal for viewing admin details */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Admin Details: {selectedAdminForView?.username}</DialogTitle>
                    <DialogDescription>
                        Role: {selectedAdminForView?.role}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                     <p><strong>Username:</strong> {selectedAdminForView?.username}</p>
                     <p><strong>Email:</strong> {selectedAdminForView?.email || 'N/A'}</p>
                     {selectedAdminForView?.firstName && <p><strong>First Name:</strong> {selectedAdminForView.firstName}</p>}
                     {selectedAdminForView?.lastName && <p><strong>Last Name:</strong> {selectedAdminForView.lastName}</p>}
                     <p><strong>Role:</strong> <Badge variant={selectedAdminForView?.role === 'Super Admin' ? 'destructive' : 'secondary'}>{selectedAdminForView?.role}</Badge></p>
                     {selectedAdminForView?.role !== 'Super Admin' && (
                        <p className="text-xs text-muted-foreground">This Sub Admin is managed through the Faculty list.</p>
                     )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeViewModal}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
