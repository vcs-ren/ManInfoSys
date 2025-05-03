
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from 'lucide-react';

// Define the schema for the login form using Zod
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  role: z.enum(["admin", "teacher", "student"], {
    required_error: "You need to select a role.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: undefined, // Ensure no default role is selected
    },
  });

  // Handle form submission
  const onSubmit = (data: LoginFormValues) => {
    console.log("Login attempt:", data);

    // --- Mock Login Logic ---
    // In a real app, replace this with API call to PHP backend
    // For now, we'll use simple mock logic based on username prefix
    let redirectPath = '';
    if (data.role === 'admin' && data.username === 'admin' && data.password === 'adminpass') {
      redirectPath = '/admin/dashboard';
    } else if (data.role === 'teacher' && data.username.startsWith('t') && data.password === 'teacherpass') {
       // Extract potential ID if needed: const teacherId = data.username.substring(1);
      redirectPath = '/teacher/dashboard';
    } else if (data.role === 'student' && data.username.startsWith('s') && data.password === 'studentpass') {
       // Extract potential ID if needed: const studentId = data.username.substring(1);
      redirectPath = '/student/dashboard';
    } else {
       toast({
         variant: "destructive",
         title: "Login Failed",
         description: "Invalid username, password, or role.",
       });
       return; // Stop execution if login fails
    }
    // --- End Mock Login Logic ---

    toast({
      title: "Login Successful",
      description: `Redirecting to ${data.role} dashboard...`,
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
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Role Selection */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Select Your Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="admin" />
                          </FormControl>
                          <FormLabel className="font-normal">Admin</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="teacher" />
                          </FormControl>
                          <FormLabel className="font-normal">Teacher</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="student" />
                          </FormControl>
                          <FormLabel className="font-normal">Student</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., admin, t1001, s1001" {...field} />
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
                      <Input type="password" placeholder="Enter your password" {...field} />
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
          <p>Forgot password? Contact administrator.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
