
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
import { postData, logActivity } from "@/lib/api"; 
import type { AdminRole } from "@/types";

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginResponse {
    success: boolean;
    message: string;
    role?: AdminRole | 'Student' | 'Teacher';
    redirectPath?: string;
    userId?: number; // Added userId to LoginResponse
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
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
        const response = await postData<LoginFormValues, LoginResponse>('login.php', data);
        setIsLoading(false);
        if (response.success && response.role && response.redirectPath) {
            toast({ title: "Login Successful", description: `Redirecting to ${response.role} dashboard...` });
            if (typeof window !== 'undefined') {
                localStorage.setItem('userRole', response.role);
                localStorage.setItem('userId', String(response.userId)); // Store userId
                localStorage.setItem('username', data.username); // Store username
            }
            // Log activity (no-op if backend logging not implemented)
            logActivity("User Login", `${data.username} logged in as ${response.role}.`, data.username, response.userId, response.role.toLowerCase().replace(' ', '_') as any);
            router.push(response.redirectPath);
        } else {
            toast({ variant: "destructive", title: "Login Failed", description: response.message });
        }
    } catch (error: any) {
        setIsLoading(false);
        console.error("Login API error:", error);
        toast({ variant: "destructive", title: "Login Error", description: error.message || "An unexpected error occurred." });
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
                      <Input placeholder="Enter username" {...field} disabled={isLoading} />
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
                                placeholder="Enter password"
                                {...field}
                                disabled={isLoading}
                                className="pr-10" // Add padding for the icon button
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
