
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
import { profileSchema } from "@/lib/schemas";
import { Loader2, Pencil } from "lucide-react"; // Added Pencil
import { Label } from "@/components/ui/label";
import { fetchData, putData } from "@/lib/api"; // Import API helpers

// Use a subset of profileSchema relevant to teachers
const teacherEditableFieldsSchema = profileSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
});
type ProfileFormValues = z.infer<typeof teacherEditableFieldsSchema>;


export default function TeacherProfilePage() {
  const [teacherData, setTeacherData] = React.useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false); // State to toggle edit mode
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
        // Use fetchData helper
        const data = await fetchData<Teacher>('/api/teacher/profile/read.php');
        setTeacherData(data);
        form.reset({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || "",
            phone: data.phone || "",
        });
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not load profile data." });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch only once

  // Update Profile Function (API Call using helper)
  const onSubmit = async (values: ProfileFormValues) => {
     if (!teacherData) return;

     const payload = { ...values };
     console.log("Updating teacher profile:", payload);

     try {
        // Use putData helper
        const updatedProfile = await putData<typeof payload, Teacher>('/api/teacher/profile/update.php', payload);

        setTeacherData(prev => ({ ...prev, ...updatedProfile }));
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
        });
        form.reset(updatedProfile);
        setIsEditing(false); // Exit edit mode
     } catch (error: any) {
        console.error("Failed to update profile:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "Could not save profile changes.",
        });
     }
  };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form to original fetched data
        if (teacherData) {
             form.reset({
                id: teacherData.id,
                firstName: teacherData.firstName,
                lastName: teacherData.lastName,
                email: teacherData.email || "",
                phone: teacherData.phone || "",
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

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold">My Profile</h1>
         {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
        )}
       </div>
       <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View {isEditing ? 'and update ' : ''}your personal details. Username ({teacherData.teacherId}) and Department are managed by the admin.</CardDescription>
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
                                <Input placeholder="Your first name" {...field} disabled={!isEditing || form.formState.isSubmitting}/>
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
                                <Input placeholder="Your last name" {...field} disabled={!isEditing || form.formState.isSubmitting}/>
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
                            <Input type="email" placeholder="your.email@example.com" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
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
                            <Input type="tel" placeholder="Your phone number" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    {isEditing && (
                        <div className="flex justify-end gap-2 pt-4">
                             <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={form.formState.isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                            </Button>
                        </div>
                     )}
                </form>
             </Form>
          </CardContent>
       </Card>
    </div>
  );
}
