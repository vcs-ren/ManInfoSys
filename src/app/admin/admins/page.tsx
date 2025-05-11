
"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, Loader2, RotateCcw, ShieldAlert, Info } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
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
import { fetchData, postData, deleteData, USE_MOCK_API, mockApiAdmins, mockFaculty, logActivity } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Link from "next/link";

const CURRENT_SUPER_ADMIN_ID = 0;

export default function ManageAdminsPage() {
  const [admins, setAdmins] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedAdminForView, setSelectedAdminForView] = React.useState<AdminUser | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  // Placeholder: In a real app, fetch the current user's role/ID
  const isCurrentUserSuperAdmin = true; // Assume current user is Super Admin for mock
  const currentUserId = 0; // Assume current user is the Super Admin with ID 0

  React.useEffect(() => {
    const fetchAdminsData = async () => {
      setIsLoading(true);
      try {
        if (USE_MOCK_API) {
            // Derive admins from mockFaculty (Administrative) and merge with explicit mockApiAdmins
            const facultyAdmins: AdminUser[] = mockFaculty
                .filter(f => f.department === 'Administrative')
                .map(f => ({
                    id: f.id, // Use faculty ID as admin ID
                    username: f.username,
                    firstName: f.firstName,
                    lastName: f.lastName,
                    email: f.email,
                    role: 'Sub Admin',
                    isSuperAdmin: false,
                }));

            // Combine super admin, faculty-derived admins, and other explicit sub-admins from mockApiAdmins
            // Ensuring no duplicates and Super Admin ID 0 is always the primary.
            const superAdmin = mockApiAdmins.find(a => a.id === CURRENT_SUPER_ADMIN_ID && a.isSuperAdmin);
            const otherExplicitSubAdmins = mockApiAdmins.filter(a => a.id !== CURRENT_SUPER_ADMIN_ID && !facultyAdmins.some(fa => fa.id === a.id));

            let combinedAdmins: AdminUser[] = [];
            if (superAdmin) combinedAdmins.push(superAdmin);
            combinedAdmins = [...combinedAdmins, ...facultyAdmins, ...otherExplicitSubAdmins];
            
            // Ensure uniqueness by ID
            const uniqueAdmins = Array.from(new Map(combinedAdmins.map(admin => [admin.id, admin])).values());
            setAdmins(uniqueAdmins);

        } else {
            const data = await fetchData<AdminUser[]>('admins/read.php');
            setAdmins(data || []);
        }
      } catch (error: any) {
        console.error("Failed to fetch admins:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load admin data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminsData();
  }, [toast]);


  const handleDeleteAdmin = async (adminId: number, adminUsername?: string) => {
      if (!isCurrentUserSuperAdmin) {
         toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can remove admin roles." });
         return;
      }
       if (adminId === CURRENT_SUPER_ADMIN_ID) {
           toast({ variant: "destructive", title: "Error", description: "Cannot remove the main Super Admin account." });
           return;
       }
      setIsSubmitting(true);
      try {
          // The backend 'admins/delete.php/{adminId}' should handle:
          // - If it's a faculty-derived admin, change their department (e.g., to 'Teaching' or a default).
          // - If it's an explicit admin record (not tied to faculty), delete that record.
          await deleteData(`admins/delete.php/${adminId}`);
          setAdmins(prev => prev.filter(a => a.id !== adminId));
          toast({ title: "Admin Role Removed", description: `Admin role for ${adminUsername || `ID ${adminId}`} has been removed.` });
          logActivity("Removed Admin Role", `For ${adminUsername || `ID ${adminId}`}`, "Admin", adminId, "admin", true, admins.find(a => a.id === adminId));
      } catch (error: any) {
           console.error("Failed to remove admin role:", error);
           toast({ variant: "destructive", title: "Error Removing Admin Role", description: error.message || "Could not remove admin role." });
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
      // For sub-admins (who might be faculty), use their actual last name for password reset.
      // 'admin/reset_password.php' needs userType: 'admin' (or 'teacher' if it's a faculty record directly)
      // and the lastName.
      const userTypeForReset = mockFaculty.some(f => f.id === userId && f.department === 'Administrative') ? 'teacher' : 'admin';
      const lastNameForPassword = adminToReset?.lastName || 'user';

      try {
           await postData('admin/reset_password.php', { userId, userType: userTypeForReset, lastName: lastNameForPassword });
           const defaultPassword = `${lastNameForPassword.substring(0, 2).toLowerCase()}1000`;
           toast({
                title: "Password Reset Successful",
                description: `Password for admin ${username || `ID ${userId}`} has been reset. Default password: ${defaultPassword}`,
           });
           logActivity("Reset Admin Password", `For ${username || `ID ${userId}`}`, "Admin");
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
    {
        accessorKey: "firstName",
        header: "First Name",
        cell: ({ row }) => row.original.firstName || <span className="text-muted-foreground italic">N/A</span>,
    },
    {
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
                          This will reset the password for admin {admin.username}. Are you sure? The default password will be the first two letters of their last name (if available, otherwise 'us') followed by '1000'.
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
                     This action cannot be undone. This will remove the admin role for {admin.username}.
                     If this user is a faculty member, their department will be changed to 'Teaching' (if applicable).
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
      </div>
       <p className="text-sm text-muted-foreground">
            This page lists all administrators. The Super Admin is a system default.
            Sub Admins are primarily faculty members assigned to the 'Administrative' department.
            To add a new Sub Admin, add a new faculty member via the <Link href="/admin/teachers" className="underline hover:text-primary">Manage Faculty</Link> page and assign them to the 'Administrative' department.
            Their admin account will be generated automatically.
      </p>

      {isLoading ? (
         <div className="flex justify-center items-center py-10">
             <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading admin data...
         </div>
       ) : admins.length === 0 ? (
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
                        <p className="text-xs text-muted-foreground">
                            {mockFaculty.some(f => f.id === selectedAdminForView?.id && f.department === 'Administrative')
                                ? "This Sub Admin is managed through the Faculty list."
                                : "This is an explicit Sub Admin account."}
                        </p>
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
