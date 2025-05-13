"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Loader2, LockKeyhole, Eye, EyeOff, User, InfoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { passwordChangeSchema } from "@/lib/schemas";
import { postData, USE_MOCK_API, mockApiAdmins, mockFaculty, fetchData } from "@/lib/api";
import type { AdminUser, Faculty, AdminRole } from "@/types";

type PasswordFormValues = z.infer<typeof passwordChangeSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [isCurrentUserSuperAdmin, setIsCurrentUserSuperAdmin] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);
  const [currentUserDetails, setCurrentUserDetails] = React.useState<AdminUser | null>(null);
  const [currentFacultyDetails, setCurrentFacultyDetails] = React.useState<Faculty | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = React.useState(true);


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      const parsedUserId = storedUserId ? parseInt(storedUserId, 10) : null;
      setCurrentUserId(parsedUserId);
      setIsCurrentUserSuperAdmin(parsedUserId === 0); // Super Admin ID is 0
    }
  }, []);

  React.useEffect(() => {
    const fetchAdminInfo = async () => {
        if (currentUserId === null) return;
        setIsLoadingInfo(true);
        try {
            if (USE_MOCK_API) {
                const admin = mockApiAdmins.find(a => a.id === currentUserId);
                setCurrentUserDetails(admin || null);
                if (admin && !admin.isSuperAdmin) {
                    const faculty = mockFaculty.find(f => f.id === currentUserId);
                    setCurrentFacultyDetails(faculty || null);
                }
            } else {
                // In a real API, you'd fetch the current admin's details.
                // This might involve fetching from an 'admins' endpoint and potentially a 'faculty' endpoint if the sub-admin is faculty.
                // For now, we'll simulate based on role for the placeholder.
                // If it's super admin (ID 0), we can assume some basic info.
                // If it's sub-admin, we'd need to fetch their faculty record to get employment type.
                
                // Placeholder: Fetch admin details (you'd need an endpoint like 'admins/profile/read.php')
                // For simplicity, assuming 'mockApiAdmins' and 'mockFaculty' are up-to-date or a similar fetch happens.
                // This part would need real API calls if not using mock.
                const allAdmins = await fetchData<AdminUser[]>('admins/read.php'); // Assuming this fetches all admins
                const admin = allAdmins.find(a => a.id === currentUserId);
                setCurrentUserDetails(admin || null);

                if (admin && !admin.isSuperAdmin) {
                    const allFaculty = await fetchData<Faculty[]>('teachers/read.php');
                    const faculty = allFaculty.find(f => f.id === currentUserId);
                    setCurrentFacultyDetails(faculty || null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch admin/faculty info:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load user information." });
        } finally {
            setIsLoadingInfo(false);
        }
    };

    fetchAdminInfo();
  }, [currentUserId, toast]);


  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update Password Function (API Call using helper)
  const onSubmit = async (values: PasswordFormValues) => {
    console.log("Attempting admin password change...");
    const payload = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        // No need to send confirmPassword to backend
    };

    try {
        if (USE_MOCK_API) {
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 300));
            if (values.currentPassword === "wrongcurrent") { // Simulate incorrect current password
                 throw new Error("Incorrect current password.");
            }
            console.log("Mock Admin password changed:", payload);
        } else {
             await postData('admin/change_password.php', payload);
        }

        toast({
            title: "Password Updated",
            description: "Your password has been changed successfully.",
        });
        form.reset(); // Reset form fields
    } catch (error: any) {
        console.error("Password change error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to change password. Please check your current password and try again.",
        });
         // Set form error if backend indicates incorrect current password
         if (error.message && error.message.toLowerCase().includes("incorrect current password")) {
             form.setError("currentPassword", { message: "Incorrect current password" });
         }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <InfoIcon className="h-6 w-6 text-primary" />
                    <CardTitle>General Information</CardTitle>
                </div>
                <CardDescription>Basic information about your account.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingInfo ? (
                     <div className="flex items-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading information...</span>
                    </div>
                ) : isCurrentUserSuperAdmin && currentUserId === 0 && currentUserDetails ? (
                    <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {currentUserDetails.firstName} {currentUserDetails.lastName}</p>
                        <p><strong>Username:</strong> {currentUserDetails.username}</p>
                        <p><strong>Role:</strong> {currentUserDetails.role}</p>
                        <p className="mt-2 text-muted-foreground">System Information:</p>
                        <ul className="list-disc list-inside pl-4 text-xs">
                            <li>Version: 1.0.0</li>
                            <li>Environment: {USE_MOCK_API ? "Mock API" : "Live API"}</li>
                            {/* Add more system info if needed */}
                        </ul>
                    </div>
                ) : !isCurrentUserSuperAdmin && currentUserDetails && currentFacultyDetails ? (
                    <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {currentFacultyDetails.firstName} {currentFacultyDetails.lastName}</p>
                        <p><strong>Username:</strong> {currentUserDetails.username}</p>
                        <p><strong>Role:</strong> Sub Admin</p>
                        <p><strong>Department:</strong> {currentFacultyDetails.department}</p>
                        <p><strong>Employment Type:</strong> {currentFacultyDetails.employmentType}</p>
                    </div>
                ) : !isCurrentUserSuperAdmin && currentUserDetails && !currentFacultyDetails && currentUserDetails.role === 'Sub Admin' ? (
                     <div className="space-y-2 text-sm">
                        <p><strong>Username:</strong> {currentUserDetails.username}</p>
                        <p><strong>Role:</strong> {currentUserDetails.role}</p>
                        <p className="text-muted-foreground italic">This is an explicit Sub Admin account not directly linked to a faculty record.</p>
                    </div>
                ) : (
                    <p className="text-muted-foreground">Could not load account information.</p>
                )}
            </CardContent>
        </Card>

       <Card>
          <CardHeader>
             <div className="flex items-center space-x-2">
                 <LockKeyhole className="h-6 w-6 text-primary" />
                <CardTitle>Change Password</CardTitle>
             </div>
            <CardDescription>Update your account password. Choose a strong, unique password.</CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <div className="relative">
                                <FormControl>
                                <Input type={showCurrentPassword ? "text" : "password"} placeholder="Enter your current password" {...field} />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 h-full -translate-y-1/2 px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    )}
                                 </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                             <div className="relative">
                                <FormControl>
                                <Input type={showNewPassword ? "text" : "password"} placeholder="Enter your new password" {...field} />
                                </FormControl>
                                 <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 h-full -translate-y-1/2 px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    )}
                                 </Button>
                            </div>
                             <p className="text-xs text-muted-foreground">Must be at least 7 characters long, include a letter, a number, and a symbol (@, #, &amp;, ?, *).</p>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <div className="relative">
                                <FormControl>
                                <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your new password" {...field} />
                                </FormControl>
                                 <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 h-full -translate-y-1/2 px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    )}
                                 </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />


                     <Button type="submit" disabled={form.formState.isSubmitting}>
                         {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Update Password'}
                     </Button>
                </form>
             </Form>
          </CardContent>
       </Card>

    </div>
  );
}
