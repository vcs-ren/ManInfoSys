
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Loader2, LockKeyhole, Eye, EyeOff } from "lucide-react";

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
import { postData, USE_MOCK_API } from "@/lib/api"; // Import USE_MOCK_API

type PasswordFormValues = z.infer<typeof passwordChangeSchema>;

export default function StudentSettingsPage() {
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

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
    console.log("Attempting student password change...");
    const payload = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
    };

    try {
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 300));
            if (values.currentPassword === "wrongcurrent") {
                 throw new Error("Incorrect current password.");
            }
            console.log("Mock Student password changed:", payload);
        } else {
             await postData('student/change_password.php', payload);
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
