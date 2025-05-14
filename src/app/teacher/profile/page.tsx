
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
import { teacherProfileSchema } from "@/lib/schemas"; // Corrected import
import { Loader2, Pencil } from "lucide-react"; 
import { fetchData, putData, USE_MOCK_API, mockFaculty } from "@/lib/api"; 
import { Textarea } from "@/components/ui/textarea"; 
import { Separator } from "@/components/ui/separator"; 


// Use a relevant subset or the full profile schema if applicable
const teacherEditableFieldsSchema = teacherProfileSchema.pick({ 
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    emergencyContactName: true,
    emergencyContactRelationship: true,
    emergencyContactPhone: true,
    emergencyContactAddress: true,
    middleName: true,
    suffix: true,
    birthday: true,
    address: true,
});
type ProfileFormValues = z.infer<typeof teacherEditableFieldsSchema>;


export default function TeacherProfilePage() {
  const [teacherData, setTeacherData] = React.useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false); 
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(teacherEditableFieldsSchema), 
    defaultValues: {
        id: undefined,
        firstName: "",
        lastName: "",
        middleName: "",
        suffix: "",
        birthday: "",
        address: "",
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
        let data: Teacher | null = null;
        if (USE_MOCK_API) {
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const loggedInTeacherId = Number(localStorage.getItem('userId')) || 1;
            data = mockFaculty.find(t => t.id === loggedInTeacherId) || null;
        } else {
            data = await fetchData<Teacher>('teacher/profile/read.php');
        }

        if (data) {
            setTeacherData(data);
            form.reset({
                id: data.id,
                firstName: data.firstName,
                lastName: data.lastName,
                middleName: data.middleName || "",
                suffix: data.suffix || "",
                birthday: data.birthday || "",
                address: data.address || "",
                email: data.email || "",
                phone: data.phone || "",
                emergencyContactName: data.emergencyContactName || "",
                emergencyContactRelationship: data.emergencyContactRelationship || "",
                emergencyContactPhone: data.emergencyContactPhone || "",
                emergencyContactAddress: data.emergencyContactAddress || "",
            });
        } else {
             throw new Error("Teacher profile not found.");
        }
      } catch (error: any) {
        console.error("Failed to fetch profile:", error);
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not load profile data." });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  
  const onSubmit = async (values: ProfileFormValues) => {
     if (!teacherData) return;

     const payload: Teacher = { 
         ...teacherData, 
         ...values,
         
         facultyId: teacherData.facultyId,
         username: teacherData.username,
         department: teacherData.department,
         employmentType: teacherData.employmentType,
         
         gender: teacherData.gender, 
     };
     console.log("Updating teacher profile:", payload);

     try {
        let updatedProfile: Teacher;
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const index = mockFaculty.findIndex(t => t.id === teacherData.id);
            if (index > -1) {
                mockFaculty[index] = { ...mockFaculty[index], ...payload };
                updatedProfile = mockFaculty[index];
            } else {
                throw new Error("Mock teacher not found for update.");
            }
        } else {
            updatedProfile = await putData<Teacher, Teacher>('teacher/profile/update.php', payload);
        }
        

        setTeacherData(prev => ({ ...prev, ...updatedProfile })); 
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
        if (teacherData) {
             form.reset({ 
                id: teacherData.id,
                firstName: teacherData.firstName,
                lastName: teacherData.lastName,
                middleName: teacherData.middleName || "",
                suffix: teacherData.suffix || "",
                birthday: teacherData.birthday || "",
                address: teacherData.address || "",
                email: teacherData.email || "",
                phone: teacherData.phone || "",
                emergencyContactName: teacherData.emergencyContactName || "",
                emergencyContactRelationship: teacherData.emergencyContactRelationship || "",
                emergencyContactPhone: teacherData.emergencyContactPhone || "",
                emergencyContactAddress: teacherData.emergencyContactAddress || "",
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
            <CardDescription>View {isEditing ? 'and update ' : ''}your personal details. Username ({teacherData.username}) and Department are managed by the admin.</CardDescription>
          </CardHeader>
          <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-muted-foreground">Work Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                    <Input value={teacherData.department} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                            <FormItem>
                                <FormLabel>Faculty ID</FormLabel>
                                <FormControl>
                                    <Input value={teacherData.facultyId} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                             <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input value={teacherData.username} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                             <FormItem>
                                <FormLabel>Employment Type</FormLabel>
                                <FormControl>
                                    <Input value={teacherData.employmentType} disabled readOnly className="bg-muted"/>
                                </FormControl>
                            </FormItem>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    
                    <div className="space-y-4">
                         <h3 className="text-lg font-medium text-foreground">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="First name" {...field} disabled={!isEditing || form.formState.isSubmitting}/>
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
                                        <Input placeholder="Last name" {...field} disabled={!isEditing || form.formState.isSubmitting}/>
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
                                        <Input placeholder="Suffix (optional)" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="birthday"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Birthday</FormLabel>
                                    <FormControl>
                                        <Input type="date" placeholder="YYYY-MM-DD" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Full address" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Number</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="Contact number" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Email address" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
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
                        <FormField
                            control={form.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Emergency contact name" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
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
                                    <Input placeholder="Relationship to contact" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
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
                                    <Textarea placeholder="Emergency contact address" {...field} value={field.value ?? ''} disabled={!isEditing || form.formState.isSubmitting}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>

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
