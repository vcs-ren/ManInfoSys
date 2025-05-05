
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
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react'; // Added Eye, EyeOff
import { loginSchema } from "@/lib/schemas";
import Link from "next/link";
import { postData } from "@/lib/api";

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
  const [showPassword, setShowPassword] = React.useState(false); // State for password visibility

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
        const response = await postData<LoginFormValues, LoginResponse>('/login.php', data); // Use relative path

        if (response.success && response.role && response.redirectPath) {
            toast({
                title: "Login Successful",
                description: `Redirecting to ${response.role} dashboard...`,
            });
            // Optional: Store session/token here if needed
            // Example: localStorage.setItem('userRole', response.role);
            router.push(response.redirectPath);
        } else {
            // Handle cases where success is true but role/path might be missing, or explicit failure
            const failureMessage = response?.message || "Invalid username or password.";
            console.warn("Login failed or response format incorrect:", response);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: failureMessage,
            });
        }
    } catch (error: any) {
        console.error("Login API error:", error);
         // Display the refined error message from the API helper
         toast({
             variant: "destructive",
             title: "Login Error",
             // Use the error message directly, as it should be more descriptive now
             description: error.message || "An unexpected error occurred during login. Please try again.",
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

              {/* Password Field */}
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
                                className="pr-10" // Add padding to the right for the icon
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
