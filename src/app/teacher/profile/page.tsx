
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import type { Teacher } from "@/types";
import { profileSchema } from "@/lib/schemas"; // Using a generic profile schema
import { Loader2 } from "lucide-react";

// Mock function to get teacher data (replace with actual API call)
// Assume it fetches data for the currently logged-in teacher
const getTeacherProfile = async (): Promise<Teacher> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    return {
        id: 2, // Example ID
        teacherId: "t1002",
        firstName: "Bob",
        lastName: "Williams",
        department: "Science",
        email: "bob.w@example.com",
        phone: "987-654-3210"
    };
};

// Define the schema specifically for the teacher profile form if needed,
// or use the generic profileSchema and cast the type.
// For this example, we use the generic profileSchema.
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function TeacherProfilePage() {
  const [teacherData, setTeacherData] = React.useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { // Initialize with empty strings or fetched data later
        id: undefined,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        // department: "", // Add department if it's part of profileSchema and editable
    },
  });

 React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getTeacherProfile();
        setTeacherData(data);
        // Reset form with fetched data
        form.reset({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || "", // Handle potentially undefined optional fields
            phone: data.phone || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load profile data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [form, toast]); // Add form and toast to dependency array

  // Mock Update Profile Function
  const onSubmit = async (values: ProfileFormValues) => {
    console.log("Updating profile:", values);
    // Simulate API call to update teacher profile
    await new Promise(resolve => setTimeout(resolve, 700));
    // Update local state optimistically or after confirmation
    setTeacherData(prev => prev ? { ...prev, ...values } : null);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
     // Optionally reset form state if needed, though usually we keep the updated values visible
    // form.reset(values);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Profile...</span>
      </div>
    );
  }

  if (!teacherData) {
     return <p className="text-destructive">Failed to load profile data.</p>;
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
       <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View and update your personal details. Username ({teacherData.teacherId}) cannot be changed.</CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                            <Input value={teacherData.department} disabled readOnly className="bg-muted"/>
                        </FormControl>
                         <FormMessage />
                         <p className="text-xs text-muted-foreground">Department is managed by the admin.</p>
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                            <Input type="tel" placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                     <Button type="submit" disabled={form.formState.isSubmitting}>
                         {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                     </Button>
                </form>
             </Form>
          </CardContent>
       </Card>

       {/* Placeholder for password change functionality */}
        <Card>
             <CardHeader>
                 <CardTitle>Security</CardTitle>
                 <CardDescription>Manage your account password.</CardDescription>
             </CardHeader>
             <CardContent>
                 <Button variant="outline" disabled>Change Password</Button>
                 <p className="text-xs text-muted-foreground mt-2">Password change functionality is not yet implemented.</p>
             </CardContent>
        </Card>
    </div>
  );
}
