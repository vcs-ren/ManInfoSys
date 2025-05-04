
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
import { profileSchema } from "@/lib/schemas"; // Using profile schema, but will ignore emergency fields
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label"; // Ensure Label is imported

// --- API Helpers ---
const fetchData = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
};

const putData = async <T, R>(url: string, data: T): Promise<R> => {
    const response = await fetch(url, {
        method: 'PUT', // Or PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
     if (!response.ok) {
         let errorData; try { errorData = await response.json(); } catch (e) {}
         throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};
// --- End API Helpers ---

// Use a subset of profileSchema relevant to teachers, or create teacherProfileSchema
// For simplicity, we adapt using profileSchema but only render/submit teacher fields.
const teacherEditableFieldsSchema = profileSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    // Exclude emergency contact fields for teachers
});
type ProfileFormValues = z.infer<typeof teacherEditableFieldsSchema>;


export default function TeacherProfilePage() {
  const [teacherData, setTeacherData] = React.useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(teacherEditableFieldsSchema),
    defaultValues: {
        id: undefined,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    },
  });

 React.useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual API endpoint for fetching the logged-in teacher's profile
        const data = await fetchData<Teacher>('/api/teacher/profile');
        setTeacherData(data);
        // Reset form with fetched data
        form.reset({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || "",
            phone: data.phone || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load profile data." });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch only once

  // Update Profile Function (API Call)
  const onSubmit = async (values: ProfileFormValues) => {
     if (!teacherData) return;

     const payload = { ...values }; // Already contains only the editable fields + id
     console.log("Updating teacher profile:", payload);

     try {
        // Replace with your actual PUT/PATCH endpoint (e.g., /api/teacher/profile)
        // Backend identifies user via session/token
        const updatedProfile = await putData<typeof payload, Teacher>('/api/teacher/profile', payload);

        setTeacherData(prev => ({ ...prev, ...updatedProfile })); // Merge updates
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
        });
        form.reset(updatedProfile); // Reset with confirmed updated values
     } catch (error: any) {
        console.error("Failed to update profile:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "Could not save profile changes.",
        });
     }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading Profile...</span>
      </div>
    );
  }

  if (!teacherData) {
     return <p className="text-destructive text-center mt-10">Failed to load profile data. Please try refreshing the page.</p>;
  }

  // Corrected return statement structure
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
       <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View and update your personal details. Username ({teacherData.teacherId}) and Department are managed by the admin.</CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                     <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                            <Input value={teacherData.department} disabled readOnly className="bg-muted"/>
                        </FormControl>
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} value={field.value ?? ''} />
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
                            <Input type="tel" placeholder="Your phone number" {...field} value={field.value ?? ''} />
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
    </div>
  );
}
