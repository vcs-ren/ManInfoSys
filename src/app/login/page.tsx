
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
import { loginSchema } from "@/lib/schemas";
import Link from "next/link";
// Removed postData import as we are using mock login

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginResponse {
    success: boolean;
    message: string;
    role?: 'Admin' | 'Student' | 'Teacher';
    redirectPath?: string;
    userId?: number;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "", // Password field is kept for UI consistency
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    console.log("Login attempt (mock):", data.username);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let response: LoginResponse = {
      success: false,
      message: "Invalid username.",
    };

    // Test users logic (no password check)
    if (data.username.toLowerCase() === "admin") {
      response = {
        success: true,
        message: "Login successful.",
        role: "Admin",
        redirectPath: "/admin/dashboard",
        userId: 0, // Mock admin ID
      };
    } else if (data.username.toLowerCase() === "s1001") {
      response = {
        success: true,
        message: "Login successful.",
        role: "Student",
        redirectPath: "/student/dashboard",
        userId: 1, // Mock student ID
      };
    } else if (data.username.toLowerCase() === "t1001") {
      response = {
        success: true,
        message: "Login successful.",
        role: "Teacher",
        redirectPath: "/teacher/dashboard",
        userId: 1, // Mock teacher ID
      };
    } else {
        // Fallback for actual login if needed in future, or just fail for others
        response.message = "Invalid username or password for mock setup.";
    }


    setIsLoading(false);

    if (response.success && response.role && response.redirectPath) {
      toast({
        title: "Login Successful",
        description: `Redirecting to ${response.role} dashboard...`,
      });
      // Optional: Store session/token here if needed
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', response.role);
        localStorage.setItem('userId', String(response.userId));
      }
      router.push(response.redirectPath);
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: response.message,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Management Information System</CardTitle>
          <CardDescription>Sign in with your provided username and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username (admin, s1001, t1001)" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                        <FormControl>
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password (mock: any)"
                                {...field}
                                disabled={isLoading}
                                className="pr-10"
                            />
                        </FormControl>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 h-full -translate-y-1/2 px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword((prev) => !prev)}
                            disabled={isLoading}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : <> <LogIn className="mr-2 h-4 w-4" /> Login </>}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="text-center justify-center text-sm">
             <Link href="/forgot-password" className="text-primary hover:underline">
                 Forgot password?
             </Link>
         </CardFooter>
      </Card>
    </div>
  );
}
