
"use client";

import * as React from "react";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2, Loader2, RotateCcw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import { UserForm, type FormFieldConfig } from "@/components/user-form";
import { studentSchema } from "@/lib/schemas";
import type { Student, StudentStatus } from "@/types";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- API Helper Functions (Implement based on your backend) ---
const fetchData = async <T>(url: string): Promise<T> => {
    // Append a cache-busting query parameter
    const cacheBustingUrl = `${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
    const response = await fetch(cacheBustingUrl, { cache: 'no-store' }); // Prevent caching
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
};


const postData = async <T, R>(url: string, data: T): Promise<R> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
         let errorData; try { errorData = await response.json(); } catch (e) {}
         throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

const putData = async <T, R>(url: string, data: T): Promise<R> => {
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
     if (!response.ok) {
         let errorData; try { errorData = await response.json(); } catch (e) {}
         throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};


const deleteData = async (url: string): Promise<void> => {
    const response = await fetch(url, { method: 'DELETE' });
     if (!response.ok) {
         let errorData; try { errorData = await response.json(); } catch (e) {}
         throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    // No need to parse response body for successful DELETE (often 204 No Content)
};
// --- End API Helpers ---


// Define course options (consider fetching these from API if dynamic)
const courseOptions = [
  { value: "Computer Science", label: "Computer Science" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Business Administration", label: "Business Administration" },
  // Add more courses as needed
];

const statusOptions: { value: StudentStatus; label: string }[] = [
    { value: "New", label: "New" },
    { value: "Transferee", label: "Transferee" },
    { value: "Continuing", label: "Continuing" },
    { value: "Returnee", label: "Returnee" },
];

const yearLevelOptions = [
    { value: "1st Year", label: "1st Year" },
    { value: "2nd Year", label: "2nd Year" },
    { value: "3rd Year", label: "3rd Year" },
    { value: "4th Year", label: "4th Year" },
];

// Updated form fields config
const studentFormFields: FormFieldConfig<Student>[] = [
  { name: "firstName", label: "First Name", placeholder: "Enter first name", required: true },
  { name: "lastName", label: "Last Name", placeholder: "Enter last name", required: true },
  { name: "course", label: "Course", type: "select", options: courseOptions, placeholder: "Select a course", required: true },
  { name: "status", label: "Status", type: "select", options: statusOptions, placeholder: "Select status", required: true },
  { name: "year", label: "Year Level", type: "select", options: yearLevelOptions, placeholder: "Select year level", required: true, condition: (data) => data?.status ? ['Continuing', 'Transferee', 'Returnee'].includes(data.status) : false }, // Updated condition check
  { name: "email", label: "Email", placeholder: "Enter email (optional)", type: "email" },
  { name: "phone", label: "Phone", placeholder: "Enter phone (optional)", type: "tel" },
  // Emergency Contact Fields
  { name: "emergencyContactName", label: "Emergency Contact Name", placeholder: "Parent/Guardian Name (optional)", type: "text" },
  { name: "emergencyContactRelationship", label: "Relationship", placeholder: "e.g., Mother, Father, Guardian (optional)", type: "text" },
  { name: "emergencyContactPhone", label: "Emergency Contact Phone", placeholder: "Contact Number (optional)", type: "tel" },
  { name: "emergencyContactAddress", label: "Emergency Contact Address", placeholder: "Full Address (optional)", type: "textarea" },
];

export default function ManageStudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For delete/reset password confirmation
  const { toast } = useToast();
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    emergencyContactName: false,
    emergencyContactRelationship: false,
    emergencyContactPhone: false,
    emergencyContactAddress: false,
    email: false,
    phone: false,
  });

  // Fetch students from API on component mount
  React.useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const data = await fetchData<{ records: Student[] }>('/api/students/read.php'); // Update to PHP endpoint
        setStudents(data.records || []);
      } catch (error) {
        console.error("Failed to fetch students:", error);
         toast({ variant: "destructive", title: "Error", description: "Failed to load student data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [toast]);

  // Add Student Function (API Call)
  const handleAddStudent = async (values: Omit<Student, 'id' | 'studentId' | 'section'>) => {
    const year = values.status === 'New' ? '1st Year' : values.year;

    if (['Continuing', 'Transferee', 'Returnee'].includes(values.status) && !year) {
        toast({ variant: "destructive", title: "Validation Error", description: "Year level is required for this status." });
        throw new Error("Year level missing"); // Prevent submission
    }

    const payload = {
      ...values,
      year: year, // Ensure year is correctly set based on status
    };

    console.log("Attempting to add student:", payload);
    try {
        const newStudent = await postData<typeof payload, Student>('/api/students/create.php', payload); // Update to PHP endpoint
        setStudents(prev => [...prev, newStudent]);
        toast({ title: "Student Added", description: `${newStudent.firstName} ${newStudent.lastName} (${newStudent.year || newStudent.status}, Section ${newStudent.section}) has been added.` });
    } catch (error: any) {
        console.error("Failed to add student:", error);
        toast({ variant: "destructive", title: "Error Adding Student", description: error.message || "Could not add student. Please try again." });
         throw error;
    }
  };

   // Edit Student Function (API Call)
  const handleEditStudent = async (values: Student) => {
     if (!selectedStudent) return;

     const payload = {
         ...values,
         id: selectedStudent.id,
         year: values.status === 'New' ? '1st Year' : values.year,
     };
      console.log("Attempting to edit student:", payload);

     try {
         const updatedStudent = await putData<typeof payload, Student>(`/api/students/update.php/${selectedStudent.id}`, payload); // Update to PHP endpoint and pass ID in URL
         setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
         toast({ title: "Student Updated", description: `${updatedStudent.firstName} ${updatedStudent.lastName} has been updated.` });
         closeEditModal();
     } catch (error: any) {
         console.error("Failed to update student:", error);
         toast({ variant: "destructive", title: "Error Updating Student", description: error.message || "Could not update student. Please try again." });
         throw error;
     }
  };

   // Delete Student Function (API Call)
  const handleDeleteStudent = async (studentId: number) => {
      setIsSubmitting(true);
      try {
          await deleteData(`/api/students/delete.php/${studentId}`); // Update to PHP endpoint and pass ID in URL
          setStudents(prev => prev.filter(s => s.id !== studentId));
          toast({ title: "Student Deleted", description: `Student record has been removed.` });
      } catch (error: any) {
           console.error("Failed to delete student:", error);
           toast({ variant: "destructive", title: "Error Deleting Student", description: error.message || "Could not remove student record." });
      } finally {
           setIsSubmitting(false);
      }
  };

  // --- Reset Password Function ---
  const handleResetPassword = async (userId: number, lastName: string) => {
      setIsSubmitting(true);
      try {
           // Call the generic reset password endpoint
           await postData('/api/admin/reset_password.php', { userId, userType: 'student' }); // Update to PHP endpoint
           const defaultPassword = `${lastName.substring(0, 2).toLowerCase()}1000`;
           toast({
                title: "Password Reset Successful",
                description: `Password for student ID ${userId} has been reset. Default password: ${defaultPassword}`, // Mention default format
           });
      } catch (error: any) {
           console.error("Failed to reset password:", error);
           toast({
                variant: "destructive",
                title: "Password Reset Failed",
                description: error.message || "Could not reset student password.",
           });
      } finally {
           setIsSubmitting(false);
      }
  };


  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

   const closeEditModal = () => {
    setSelectedStudent(null);
    setIsEditModalOpen(false);
  };

    // Memoize section options calculation
    const sectionOptions = React.useMemo(() => {
        const distinctSections = [...new Set(students.map(s => s.section).filter(Boolean))].sort();
        return distinctSections.map(sec => ({ label: sec, value: sec }));
    }, [students]);

    // Define columns for the DataTable
    const columns: ColumnDef<Student>[] = React.useMemo(() => [
         {
            accessorKey: "studentId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Student ID" />,
            cell: ({ row }) => <div>{row.getValue("studentId")}</div>,
        },
        {
            accessorKey: "firstName",
             header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" />,
            cell: ({ row }) => <div className="capitalize">{row.getValue("firstName")}</div>,
        },
        {
            accessorKey: "lastName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
            cell: ({ row }) => <div className="capitalize">{row.getValue("lastName")}</div>,
        },
         {
            accessorKey: "course",
             header: ({ column }) => (
                 <DataTableFilterableColumnHeader
                     column={column}
                     title="Course"
                     options={courseOptions}
                 />
             ),
            cell: ({ row }) => <div>{row.getValue("course")}</div>,
             filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
         {
            accessorKey: "status",
             header: ({ column }) => (
                 <DataTableFilterableColumnHeader
                     column={column}
                     title="Status"
                     options={statusOptions}
                 />
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("status")}</div>,
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "year",
            header: ({ column }) => (
                 <DataTableFilterableColumnHeader
                    column={column}
                    title="Year"
                    options={yearLevelOptions}
                 />
            ),
            cell: ({ row }) => <div className="text-center">{row.original.year || '-'}</div>, // Display original.year
            filterFn: (row, id, value) => {
                 const rowValue = row.original.year; // Filter based on original.year
                 return rowValue ? value.includes(rowValue) : value.includes('-'); // Handle '-' case if needed
             },
        },
        {
            accessorKey: "section",
             header: ({ column }) => (
                 <DataTableFilterableColumnHeader
                    column={column}
                    title="Section"
                    options={sectionOptions} // Use pre-calculated options
                 />
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("section")}</div>,
             filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
         {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div className="lowercase">{row.getValue("email") || '-'}</div>,
             enableHiding: true, // Enable hiding
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <div>{row.getValue("phone") || '-'}</div>,
            enableHiding: true, // Enable hiding
        },
         {
            accessorKey: "emergencyContactName",
            header: "Emergency Contact Name",
            cell: ({ row }) => <div>{row.original.emergencyContactName || '-'}</div>,
            enableHiding: true,
        },
         {
            accessorKey: "emergencyContactRelationship",
            header: "Relationship",
            cell: ({ row }) => <div>{row.original.emergencyContactRelationship || '-'}</div>,
             enableHiding: true,
        },
         {
            accessorKey: "emergencyContactPhone",
            header: "Emergency Contact Phone",
            cell: ({ row }) => <div>{row.original.emergencyContactPhone || '-'}</div>,
             enableHiding: true,
        },
         {
            accessorKey: "emergencyContactAddress",
            header: "Emergency Contact Address",
            cell: ({ row }) => <div className="max-w-xs truncate">{row.original.emergencyContactAddress || '-'}</div>,
            enableHiding: true,
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [sectionOptions]); // Dependency on calculated options


      // Function to generate dropdown menu items for each row
    const generateActionMenuItems = (student: Student) => (
        <>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenEditModal(student); }}>
            <Edit className="mr-2 h-4 w-4" />
            Edit / View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
         {/* Reset Password Action */}
         <AlertDialog>
             <AlertDialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-600 focus:text-orange-600 focus:bg-orange-100">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset Password
                 </DropdownMenuItem>
             </AlertDialogTrigger>
             <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                 <AlertDialogHeader>
                     <AlertDialogTitle>Reset Password?</AlertDialogTitle>
                     <AlertDialogDescription>
                          This will reset the password for {student.firstName} {student.lastName} to the default format (first 2 letters of last name + 1000). Are you sure?
                     </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                     <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                     <AlertDialogAction
                          onClick={async (e) => {
                              e.stopPropagation();
                              await handleResetPassword(student.id, student.lastName);
                         }}
                          className={cn(buttonVariants({ variant: "destructive" }))} // Use destructive style for reset confirmation
                          disabled={isSubmitting}
                     >
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Yes, reset password
                     </AlertDialogAction>
                 </AlertDialogFooter>
             </AlertDialogContent>
         </AlertDialog>
         {/* Delete Action */}
         <AlertDialog>
             <AlertDialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                 </DropdownMenuItem>
             </AlertDialogTrigger>
             <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                 <AlertDialogHeader>
                     <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                     <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the student record for {student.firstName} {student.lastName}.
                     </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                     <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                     <AlertDialogAction
                          onClick={async (e) => {
                              e.stopPropagation();
                              await handleDeleteStudent(student.id);
                         }}
                          className={cn(buttonVariants({ variant: "destructive" }))}
                          disabled={isSubmitting}
                     >
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Yes, delete student
                     </AlertDialogAction>
                 </AlertDialogFooter>
             </AlertDialogContent>
         </AlertDialog>
        </>
    );


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <UserForm<Student>
          trigger={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Student
            </Button>
          }
          formSchema={studentSchema}
          onSubmit={handleAddStudent}
          title="Add New Student"
          description="Fill in the details below. Section & Year (for New status) are assigned automatically. Credentials are generated upon creation."
          formFields={studentFormFields}
        />
      </div>

      {isLoading ? (
         <div className="flex justify-center items-center py-10">
             <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> Loading student data...
         </div>
       ) : students.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No students found.</p>
       ) : (
            <DataTable
                columns={columns}
                data={students}
                searchPlaceholder="Search by first name..."
                searchColumnId="firstName"
                actionMenuItems={generateActionMenuItems}
                columnVisibility={columnVisibility}
                setColumnVisibility={setColumnVisibility}
            />
        )}


      {/* Edit Modal - Controlled externally */}
      {selectedStudent && (
           <UserForm<Student>
              isOpen={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              formSchema={studentSchema}
              onSubmit={handleEditStudent}
              title={`Edit Student: ${selectedStudent.firstName} ${selectedStudent.lastName}`}
              description="Update info. Username, password, section & year are managed by the system."
              formFields={studentFormFields.map(f => ({...f, disabled: false }))}
              isEditMode={true}
              initialData={selectedStudent}
            />
      )}
    </div>
  );
}

    