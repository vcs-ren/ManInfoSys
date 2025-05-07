
"use client";

import * as React from "react";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { PlusCircle, Edit, Trash2, Loader2, RotateCcw, Info } from "lucide-react"; // Added Info icon

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
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchData, postData, putData, deleteData } from "@/lib/api"; // Import API helpers

// Define course options (consider fetching these from API if dynamic)
const courseOptions = [
  { value: "Computer Science", label: "Computer Science" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Business Administration", label: "Business Administration" },
  // Add more courses as needed
];

// Updated status options (removed 'Continuing')
const statusOptions: { value: StudentStatus; label: string }[] = [
    { value: "New", label: "New" },
    { value: "Transferee", label: "Transferee" },
    { value: "Returnee", label: "Returnee" },
];

const yearLevelOptions = [
    { value: "1st Year", label: "1st Year" },
    { value: "2nd Year", label: "2nd Year" },
    { value: "3rd Year", label: "3rd Year" },
    { value: "4th Year", label: "4th Year" },
];

// Updated form fields config with new sections
const studentFormFields: FormFieldConfig<Student>[] = [
  // Personal Info
  { name: "firstName", label: "First Name", placeholder: "Enter first name", required: true, section: 'personal' },
  { name: "lastName", label: "Last Name", placeholder: "Enter last name", required: true, section: 'personal' },
  // Enrollment Info
  { name: "course", label: "Course", type: "select", options: courseOptions, placeholder: "Select a course", required: true, section: 'enrollment' },
  { name: "status", label: "Status", type: "select", options: statusOptions, placeholder: "Select status", required: true, section: 'enrollment' },
  { name: "year", label: "Year Level", type: "select", options: yearLevelOptions, placeholder: "Select year level", required: true, section: 'enrollment', condition: (data) => data?.status ? ['Transferee', 'Returnee'].includes(data.status) : false },
  // Contact / Account (Section is handled separately in viewing mode)
  { name: "email", label: "Email", placeholder: "Enter email (optional)", type: "email", section: 'contact' },
  { name: "phone", label: "Phone", placeholder: "Enter phone (optional)", type: "tel", section: 'contact' },
  // Emergency Contact Fields
  { name: "emergencyContactName", label: "Emergency Contact Name", placeholder: "Parent/Guardian Name (optional)", type: "text", section: 'emergency' },
  { name: "emergencyContactRelationship", label: "Relationship", placeholder: "e.g., Mother, Father, Guardian (optional)", type: "text", section: 'emergency' },
  { name: "emergencyContactPhone", label: "Emergency Contact Phone", placeholder: "Contact Number (optional)", type: "tel", section: 'emergency' },
  { name: "emergencyContactAddress", label: "Emergency Contact Address", placeholder: "Full Address (optional)", type: "textarea", section: 'emergency' },
];

export default function ManageStudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false); // Combined state for Add/Edit modal
  const [isEditMode, setIsEditMode] = React.useState(false);
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

  React.useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const data = await fetchData<Student[]>('students/read.php');
        setStudents(data || []);
      } catch (error: any) {
        console.error("Failed to fetch students:", error);
         toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load student data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [toast]);

  const handleSaveStudent = async (values: Student) => {
    const year = values.status === 'New' ? '1st Year' : values.year;

    if (['Transferee', 'Returnee'].includes(values.status) && !year) {
        toast({ variant: "destructive", title: "Validation Error", description: "Year level is required for this status." });
        throw new Error("Year level missing");
    }

    // Check for duplicate name only when *adding* a new student
    if (!isEditMode) {
        const nameExists = students.some(
            (s) => s.firstName.toLowerCase() === values.firstName.toLowerCase() &&
                   s.lastName.toLowerCase() === values.lastName.toLowerCase()
        );
        if (nameExists) {
             toast({ variant: "destructive", title: "Duplicate Name", description: `A student named ${values.firstName} ${values.lastName} already exists.` });
             throw new Error("Duplicate name");
        }
    }


    const payload = {
      ...values,
      year: year,
      id: isEditMode ? selectedStudent?.id : undefined,
    };

    console.log(`Attempting to ${isEditMode ? 'edit' : 'add'} student:`, payload);
    try {
        let savedStudent: Student;
        if (isEditMode && payload.id) {
            savedStudent = await putData<typeof payload, Student>(`students/update.php/${payload.id}`, payload);
            setStudents(prev => prev.map(s => s.id === savedStudent.id ? savedStudent : s));
            toast({ title: "Student Updated", description: `${savedStudent.firstName} ${savedStudent.lastName} has been updated.` });
        } else {
            savedStudent = await postData<Omit<typeof payload, 'id'>, Student>('students/create.php', payload);
            setStudents(prev => [...prev, savedStudent]);
            toast({ title: "Student Added", description: `${savedStudent.firstName} ${savedStudent.lastName} (${savedStudent.year || savedStudent.status}, Section ${savedStudent.section}) has been added.` });
        }
        closeModal();
    } catch (error: any) {
        // Avoid double-toasting if it was a duplicate name error
        if (error.message !== "Duplicate name") {
            console.error(`Failed to ${isEditMode ? 'update' : 'add'} student:`, error);
            toast({ variant: "destructive", title: `Error ${isEditMode ? 'Updating' : 'Adding'} Student`, description: error.message || `Could not ${isEditMode ? 'update' : 'add'} student. Please try again.` });
        }
         throw error; // Re-throw to stop further execution in the form component
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
      setIsSubmitting(true);
      try {
          await deleteData(`students/delete.php/${studentId}`);
          setStudents(prev => prev.filter(s => s.id !== studentId));
          toast({ title: "Student Deleted", description: `Student record has been removed.` });
      } catch (error: any) {
           console.error("Failed to delete student:", error);
           toast({ variant: "destructive", title: "Error Deleting Student", description: error.message || "Could not remove student record." });
      } finally {
           setIsSubmitting(false);
      }
  };

  const handleResetPassword = async (userId: number, lastName: string) => {
      setIsSubmitting(true);
      try {
           await postData('admin/reset_password.php', { userId, userType: 'student', lastName }); // Pass lastName
           const defaultPassword = `${lastName.substring(0, 2).toLowerCase()}1000`;
           toast({
                title: "Password Reset Successful",
                description: `Password for student ID ${userId} has been reset. Default password: ${defaultPassword}`,
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

   const openAddModal = () => {
    setIsEditMode(false);
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setIsEditMode(true);
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

   const closeModal = () => {
    setIsModalOpen(false);
  };

    const sectionOptions = React.useMemo(() => {
        const distinctSections = [...new Set(students.map(s => s.section).filter(Boolean))].sort();
        return distinctSections.map(sec => ({ label: sec, value: sec }));
    }, [students]);

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
             filterFn: (row, id, value) => {
                return String(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase());
            },
        },
        {
            accessorKey: "lastName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" />,
            cell: ({ row }) => <div className="capitalize">{row.getValue("lastName")}</div>,
             filterFn: (row, id, value) => {
                return String(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase());
            },
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
            cell: ({ row }) => <div className="text-center">{row.original.year || '-'}</div>,
            filterFn: (row, id, value) => {
                 const rowValue = row.original.year;
                 return rowValue ? value.includes(rowValue) : value.includes('-');
             },
        },
        {
            accessorKey: "section",
             header: ({ column }) => (
                 <DataTableFilterableColumnHeader
                    column={column}
                    title="Section"
                    options={sectionOptions}
                 />
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("section")}</div>,
             filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
         {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div className="lowercase">{row.getValue("email") || '-'}</div>,
             enableHiding: true,
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <div>{row.getValue("phone") || '-'}</div>,
            enableHiding: true,
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
    ], [sectionOptions]);

    const generateActionMenuItems = (student: Student) => (
        <>
        {/* Update this item to open the modal in edit mode */}
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(student); }}>
            <Info className="mr-2 h-4 w-4" />
            View / Edit Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
         <AlertDialog>
             <AlertDialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-600 focus:text-orange-600 focus:bg-orange-100" disabled={isSubmitting}>
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
                          className={cn(buttonVariants({ variant: "destructive" }))}
                          disabled={isSubmitting}
                     >
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Yes, reset password
                     </AlertDialogAction>
                 </AlertDialogFooter>
             </AlertDialogContent>
         </AlertDialog>
         <AlertDialog>
             <AlertDialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled={isSubmitting}>
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
        <Button onClick={openAddModal}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Student
        </Button>
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
                searchPlaceholder="Search by name..."
                searchColumnId="firstName"
                actionMenuItems={generateActionMenuItems}
                columnVisibility={columnVisibility}
                setColumnVisibility={setColumnVisibility}
            />
        )}

      {/* Use UserForm for both Add and Edit */}
      <UserForm<Student>
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            formSchema={studentSchema}
            onSubmit={handleSaveStudent}
            title={isEditMode ? `Student Details: ${selectedStudent?.firstName} ${selectedStudent?.lastName}` : 'Add New Student'}
            description={isEditMode ? "View or update student information." : "Fill in the details below. Section & Year (for New status) are assigned automatically. Credentials are generated upon creation."}
            formFields={studentFormFields}
            isEditMode={isEditMode}
            initialData={isEditMode ? selectedStudent : undefined}
            startReadOnly={isEditMode} // Start in read-only mode when editing
        />
    </div>
  );
}
