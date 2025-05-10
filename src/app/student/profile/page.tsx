
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
import { studentProfileSchema } from "@/lib/schemas";
import { Loader2, Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { fetchData, putData } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProfileFormValues = z.infer<typeof studentProfileSchema>;

const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
];

export default function StudentProfilePage() {
  const [studentData, setStudentData] = React.useState<Student | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
        id: undefined,
        firstName: "",
        lastName: "",
        middleName: "",
        suffix: "",
        gender: undefined,
        birthday: "",
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
        const data = await fetchData<Student>('student/profile/read.php'); // Updated path
        setStudentData(data);
        form.reset({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName || "",
            suffix: data.suffix || "",
            gender: data.gender || undefined,
            birthday: data.birthday || "",
            email: data.email || "",
            phone: data.phone || "",
            emergencyContactName: data.emergencyContactName || "",
            emergencyContactRelationship: data.emergencyContactRelationship || "",
            emergencyContactPhone: data.emergencyContactPhone || "",
            emergencyContactAddress: data.emergencyContactAddress || "",
        });
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not load profile data." });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [form, toast]);


  const onSubmit = async (values: ProfileFormValues) => {
    if (!studentData) return;

     const payload: Student = {
         ...studentData,
         ...values,
         program: studentData.program, // Keep program from fetched data
         enrollmentType: studentData.enrollmentType, // Keep enrollmentType from fetched data
         year: studentData.year, // Keep year from fetched data
         section: studentData.section, // Keep section from fetched data
         gender: values.gender || undefined,
         birthday: values.birthday || undefined,
     };
    console.log("Updating profile:", payload);

    try {
        const updatedProfile = await putData<typeof payload, Student>('student/profile/update.php', payload); // Updated path
        setStudentData(prev => ({ ...prev, ...updatedProfile }));
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved.",
        });
        form.reset(updatedProfile);
        setIsEditing(false);
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
        if (studentData) {
            form.reset({
                id: studentData.id,
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                middleName: studentData.middleName || "",
                suffix: studentData.suffix || "",
                gender: studentData.gender || undefined,
                birthday: studentData.birthday || "",
                email: studentData.email || "",
                phone: studentData.phone || "",
                emergencyContactName: studentData.emergencyContactName || "",
                emergencyContactRelationship: studentData.emergencyContactRelationship || "",
                emergencyContactPhone: studentData.emergencyContactPhone || "",
                emergencyContactAddress: studentData.emergencyContactAddress || "",
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
            <CardDescription>View {isEditing ? 'and update ' : ''}your personal and contact details. Academic information and Username ({studentData.studentId}) are managed by the admin.</CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-muted-foreground">Academic Information</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <FormItem>
                                <FormLabel>Student ID</FormLabel>
                                <FormControl>
                                    <Input value={studentData.studentId} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                             <FormItem>
                                <FormLabel>Program</FormLabel>
                                <FormControl>
                                    <Input value={studentData.program} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                              <FormItem>
                                <FormLabel>Year Level</FormLabel>
                                <FormControl>
                                    <Input value={studentData.year || studentData.enrollmentType} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                             <FormItem>
                                <FormLabel>Section</FormLabel>
                                <FormControl>
                                    <Input value={studentData.section} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                              <FormItem>
                                <FormLabel>Enrollment Type</FormLabel>
                                <FormControl>
                                    <Input value={studentData.enrollmentType} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                        </div>
                    </div>

                     <Separator className="my-6" />

                     <div className="space-y-4">
                          <h3 className="text-lg font-medium text-foreground">Personal Details</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                name="middleName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Middle Name</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Middle name (optional)" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
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
                                    <Input placeholder="Your last name" {...field} disabled={!isEditing || form.formState.isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                              <FormField
                                control={form.control}
                                name="suffix"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Suffix</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Suffix (e.g. Jr.)" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField
                                control={form.control}
                                name="birthday"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Birthday</FormLabel>
                                    <FormControl>
                                    <Input type="date" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || undefined} disabled={!isEditing || form.formState.isSubmitting}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {genderOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                         </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                         </div>
                    </div>

                    <Separator className="my-6" />

                     <div className="space-y-4">
                         <h3 className="text-lg font-medium text-foreground">Emergency Contact Information</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="emergencyContactName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Parent/Guardian Name" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
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
                                        <Input placeholder="e.g., Mother, Father, Guardian" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                         </div>
                          <FormField
                                control={form.control}
                                name="emergencyContactPhone"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Phone</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="Emergency contact phone number" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
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
                                        <Textarea placeholder="Full Address" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                    </div>

                     {isEditing && (
                        <div className="flex justify-end gap-2 mt-6">
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
