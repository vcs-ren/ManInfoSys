
"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from 'lucide-react';

// Define the schema for the login form using Zod (removed role)
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  // Password is required for the form, but logic might bypass it for test users
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "", // Keep password field, but logic handles test users
    },
  });

  // Handle form submission
  const onSubmit = (data: LoginFormValues) => {
    console.log("Login attempt:", data);

    // --- Simplified Mock Login Logic (No Password Check for test users) ---
    let redirectPath = '';
    let role = '';

    if (data.username === 'admin') {
      redirectPath = '/admin/dashboard';
      role = 'Admin';
    } else if (data.username === 's1001') {
      redirectPath = '/student/dashboard';
      role = 'Student';
    } else if (data.username === 't1001') {
      redirectPath = '/teacher/dashboard';
      role = 'Teacher';
    }
    // Add more specific user checks or a generic failure case here if needed
    // For now, any other username/password combination will fail.
     else {
       toast({
         variant: "destructive",
         title: "Login Failed",
         description: "Invalid username or password. Use 'admin', 's1001', or 't1001' for testing.",
       });
       return; // Stop execution if login fails
    }
    // --- End Simplified Mock Login Logic ---

    toast({
      title: "Login Successful",
      description: `Redirecting to ${role} dashboard...`,
    });

    // Redirect based on role after a short delay
    setTimeout(() => {
       router.push(redirectPath);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">CampusConnect</CardTitle>
          <CardDescription>Sign in with your username. (Use 'admin', 's1001', or 't1001' for testing - password field required but not checked for test users).</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username (e.g., admin, s1001, t1001)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter any password for test users" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logging in..." : <> <LogIn className="mr-2 h-4 w-4" /> Login </>}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="text-center text-xs text-muted-foreground">
          <p>This is a test login. Authentication is simplified.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
