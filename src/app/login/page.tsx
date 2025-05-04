
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
import { LogIn, Loader2 } from 'lucide-react';
import { loginSchema } from "@/lib/schemas";
import Link from "next/link";
import { postData } from "@/lib/api"; // Import the centralized API helper

type LoginFormValues = z.infer<typeof loginSchema>;

// Interface for the expected API response
interface LoginResponse {
    success: boolean;
    message: string;
    role?: 'Admin' | 'Student' | 'Teacher';
    redirectPath?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle form submission - Call PHP Authentication API via centralized helper
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    console.log("Login attempt:", data.username); // Don't log password

    try {
        // Call the PHP login endpoint using the helper
        const response = await postData<LoginFormValues, LoginResponse>('/api/login.php', data);

        if (response.success && response.role && response.redirectPath) {
            toast({
                title: "Login Successful",
                description: `Redirecting to ${response.role} dashboard...`,
            });
            // Optional: Store session/token here if needed
            // Example: localStorage.setItem('userRole', response.role);
            router.push(response.redirectPath);
        } else {
            // Use the message from the API response
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: response.message || "Invalid username or password.",
            });
        }
    } catch (error: any) {
        console.error("Login API error:", error);
        toast({
            variant: "destructive",
            title: "Login Error",
            description: error.message || "An error occurred during login. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">CampusConnect</CardTitle>
          <CardDescription>Sign in with your provided username and password.</CardDescription>
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
                      <Input placeholder="Enter username" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field Reinstated */}
               <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} disabled={isLoading} />
                    </FormControl>
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
