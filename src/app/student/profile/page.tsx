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
import type { Student } from "@/types";
import { profileSchema } from "@/lib/schemas"; // Using a generic profile schema
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator"; // Import Separator
import { Textarea } from "@/components/ui/textarea"; // Import Textarea

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


type ProfileFormValues = z.infer<typeof profileSchema>;

export default function StudentProfilePage() {
  const [studentData, setStudentData] = React.useState<Student | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        id: undefined,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        emergencyContactName: "",
        emergencyContactRelationship: "",
        emergencyContactPhone: "",
        emergencyContactAddress: "",
    },
  });

 React.useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual API endpoint for fetching the logged-in student's profile
        const data = await fetchData<Student>('/api/student/profile');
        setStudentData(data);
        // Reset form with fetched data
        form.reset({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || "",
            phone: data.phone || "",
            emergencyContactName: data.emergencyContactName || "",
            emergencyContactRelationship: data.emergencyContactRelationship || "",
            emergencyContactPhone: data.emergencyContactPhone || "",
            emergencyContactAddress: data.emergencyContactAddress || "",
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
  }, []); // Fetch only once on mount


  // Update Profile Function (API Call)
  const onSubmit = async (values: ProfileFormValues) => {
    if (!studentData) return; // Should not happen if loaded

     const payload = {
         ...values, // Includes all editable fields + id
     };
    console.log("Updating profile:", payload);

    try {
        // Replace with your actual PUT/PATCH endpoint (e.g., /api/student/profile)
        // The backend should identify the user via session/token, not rely solely on ID in payload
        const updatedProfile = await putData<typeof payload, Student>('/api/student/profile', payload);
        // Update local state optimistically or with the response
        setStudentData(prev => ({ ...prev, ...updatedProfile })); // Merge updates
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
        });
        form.reset(updatedProfile); // Reset form with the confirmed updated values
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

  if (!studentData) {
     return <p className="text-destructive text-center mt-10">Failed to load profile data. Please try refreshing the page.</p>;
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
       <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View and update your personal and contact details. Academic information and Username ({studentData.studentId}) are managed by the admin.</CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                   {/* Display Only Fields */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-muted-foreground">Academic Information</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <FormItem>
                                <FormLabel>Course</FormLabel>
                                <FormControl>
                                    <Input value={studentData.course} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                              <FormItem>
                                <FormLabel>Year Level</FormLabel>
                                <FormControl>
                                    <Input value={studentData.year || studentData.status} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                             <FormItem>
                                <FormLabel>Section</FormLabel>
                                <FormControl>
                                    <Input value={studentData.section} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                        </div>
                    </div>

                     <Separator className="my-6" />

                    {/* Editable Personal Fields */}
                     <div className="space-y-4">
                          <h3 className="text-lg font-medium text-foreground">Personal Details</h3>
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
                                <Input type="tel" placeholder="Your phone number" {...field} value={field.value ?? ''}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>

                    <Separator className="my-6" />

                    {/* Emergency Contact Section */}
                     <div className="space-y-4">
                         <h3 className="text-lg font-medium text-foreground">Emergency Contact Information</h3>
                        <FormField
                            control={form.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Parent/Guardian Name" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="emergencyContactRelationship"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Relationship</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Mother, Father, Guardian" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Phone</FormLabel>
                                <FormControl>
                                    <Input type="tel" placeholder="Emergency contact phone number" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="emergencyContactAddress"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Address</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Full Address" {...field} value={field.value ?? ''}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>


                     <Button type="submit" disabled={form.formState.isSubmitting} className="mt-6">
                         {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                     </Button>
                </form>
             </Form>
          </CardContent>
       </Card>

    </div>
  );
}