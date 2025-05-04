
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

// Simplified Login Schema (Username only)
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  // Password field removed from schema as it's not used
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
    },
  });

  // Handle form submission - Mock Authentication
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    console.log("Login attempt:", data);

    // --- BASIC MOCK AUTH (No Password Check) ---
    let response: { success: boolean, role: string, redirectPath: string } | null = null;
    if (data.username === 'admin') {
        response = { success: true, role: 'Admin', redirectPath: '/admin/dashboard' };
    } else if (data.username === 's1001') { // Specific student ID
         response = { success: true, role: 'Student', redirectPath: '/student/dashboard' };
    } else if (data.username === 't1001') { // Specific teacher ID
         response = { success: true, role: 'Teacher', redirectPath: '/teacher/dashboard' };
    }
    // --- End Mock Auth ---

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsLoading(false);

    if (response?.success) {
        toast({
            title: "Login Successful",
            description: `Redirecting to ${response.role} dashboard...`,
        });
        // Store session/token if needed (implementation depends on auth strategy)
        // e.g., localStorage.setItem('userRole', response.role);
        router.push(response.redirectPath); // Redirect based on mock response
    } else {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid username. Use 'admin', 's1001', or 't1001'.",
        });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">CampusConnect</CardTitle>
          <CardDescription>Sign in with your provided username.</CardDescription>
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
                      <Input placeholder="Enter username (e.g., admin, s1001, t1001)" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password field removed */}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : <> <LogIn className="mr-2 h-4 w-4" /> Login </>}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          Use 'admin', 's1001', or 't1001' for testing. No password needed.
        </CardFooter>
      </Card>
    </div>
  );
}
