
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Loader2, LockKeyhole } from "lucide-react";

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

type PasswordFormValues = z.infer<typeof passwordChangeSchema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Mock Update Password Function
  const onSubmit = async (values: PasswordFormValues) => {
    console.log("Attempting password change:", values);
    // Simulate API call - replace with actual backend interaction
    // Check if currentPassword is correct (mock check)
    if (values.currentPassword !== 'adminpassword') { // Replace with actual check
        toast({
          variant: "destructive",
          title: "Error",
          description: "Incorrect current password.",
        });
        form.setError("currentPassword", { message: "Incorrect current password" });
        return;
    }

    await new Promise(resolve => setTimeout(resolve, 700));

    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    form.reset(); // Reset form fields
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
                            <FormControl>
                            <Input type="password" placeholder="Enter your current password" {...field} />
                            </FormControl>
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
                            <FormControl>
                            <Input type="password" placeholder="Enter your new password" {...field} />
                            </FormControl>
                             <p className="text-xs text-muted-foreground">Must be at least 6 characters long.</p>
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
                            <FormControl>
                            <Input type="password" placeholder="Confirm your new password" {...field} />
                            </FormControl>
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
