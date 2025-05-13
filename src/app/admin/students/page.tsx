
"use client";

import * as React from "react";
import type { ColumnDef, VisibilityState, ColumnFiltersState } from "@tanstack/react-table";
import { PlusCircle, Trash2, Loader2, RotateCcw, Pencil, CheckSquare } from "lucide-react"; 
import { format, formatDistanceToNow } from 'date-fns';
import { useSearchParams } from 'next/navigation';

import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader, DataTableFilterableColumnHeader } from "@/components/data-table";
import { UserForm, type FormFieldConfig } from "@/components/user-form";
import { studentSchema } from "@/lib/schemas";
import type { Student, Program, YearLevel, EnrollmentType, Section as SectionType } from "@/types";
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
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchData, postData, putData, deleteData, USE_MOCK_API, mockApiPrograms, mockStudents, logActivity, mockSections, defaultUSE_MOCK_API } from "@/lib/api";
import { generateDefaultPasswordDisplay } from "@/lib/utils";


const enrollmentTypeOptions: { value: EnrollmentType; label: string }[] = [
    { value: "New", label: "New" },
    { value: "Transferee", label: "Transferee" },
    { value: "Returnee", label: "Returnee" },
    // "Continuing" is set via Promote action
];

const yearLevelOptions: { value: YearLevel; label: string }[] = [
    { value: "1st Year", label: "1st Year" },
    { value: "2nd Year", label: "2nd Year" },
    { value: "3rd Year", label: "3rd Year" },
    { value: "4th Year", label: "4th Year" },
];

const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
];

const getStudentFormFields = (programs: Program[]): FormFieldConfig<Student>[] => {
  const programOptions = programs.map(p => ({ value: p.id, label: p.name }));

  return [
    { name: "firstName", label: "First Name", placeholder: "Enter first name", required: true, section: 'personal' },
    { name: "lastName", label: "Last Name", placeholder: "Enter last name", required: true, section: 'personal' },
    { name: "middleName", label: "Middle Name", placeholder: "Enter middle name (optional)", section: 'personal' },
    { name: "suffix", label: "Suffix", placeholder: "e.g., Jr., Sr. (optional)", section: 'personal' },
    { name: "birthday", label: "Birthday", type: "date", placeholder: "YYYY-MM-DD (optional)", section: 'personal' },
    { name: "gender", label: "Gender", type: "select", options: genderOptions, placeholder: "Select gender (optional)", section: 'personal' },
    { name: "enrollmentType", label: "Enrollment Type", type: "select", options: enrollmentTypeOptions, placeholder: "Select enrollment type", required: true, section: 'enrollment' },
    { name: "year", label: "Year Level", type: "select", options: yearLevelOptions, placeholder: "Select year level", required: false, section: 'enrollment', condition: (data) => data?.enrollmentType ? ['Transferee', 'Returnee', 'Continuing'].includes(data.enrollmentType as EnrollmentType) : false },
    { name: "program", label: "Program", type: "select", options: programOptions, placeholder: "Select a program", required: true, section: 'enrollment' },
    { name: "email", label: "Email", placeholder: "Enter email (optional)", type: "email", section: 'contact' },
    { name: "phone", label: "Contact #", placeholder: "Enter contact number (optional)", type: "tel", section: 'contact' },
    { name: "emergencyContactName", label: "Emergency Contact Name", placeholder: "Parent/Guardian Name (optional)", type: "text", section: 'emergency' },
    { name: "emergencyContactRelationship", label: "Relationship", placeholder: "e.g., Mother, Father (optional)", type: "text", section: 'emergency' },
    { name: "emergencyContactPhone", label: "Emergency Contact Phone", placeholder: "Emergency contact number (optional)", type: "tel", section: 'emergency' },
    { name: "emergencyContactAddress", label: "Emergency Contact Address", placeholder: "Emergency contact address (optional)", type: "textarea", section: 'emergency' },
  ];
};

export default function ManageStudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [sections, setSections] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    emergencyContactName: false,
    emergencyContactRelationship: false,
    emergencyContactPhone: false,
    emergencyContactAddress: false,
    email: false,
    phone: false,
    middleName: false,
    suffix: false,
    gender: false,
    birthday: false,
    section: true,
    username: false,
    lastAccessed: false,
  });

  const studentFormFields = React.useMemo(() => getStudentFormFields(programs), [programs]);

  const loadInitialData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (USE_MOCK_API) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setStudents(mockStudents);
        setPrograms(mockApiPrograms);
        const distinctSections = [...new Set(mockSections.map(s => s.id).filter(Boolean))].sort();
        setSections(distinctSections);
      } else {
        const [studentsData, programsData, sectionsDataResult] = await Promise.all([
          fetchData<Student[]>('students/read.php'),
          fetchData<Program[]>('programs/read.php'),
          fetchData<SectionType[]>('sections/read.php') 
        ]);
        setStudents(studentsData || []);
        setPrograms(programsData || []);
        setSections((sectionsDataResult || []).map(s => s.id).sort());
      }
    } catch (error: any) {
      console.error("Failed to fetch initial data:", error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to load data." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  React.useEffect(() => {
    const programQuery = searchParams.get('program');
    if (programQuery) {
        setColumnFilters([{ id: 'program', value: [programQuery] }]);
    } else {
        setColumnFilters(prevFilters => prevFilters.filter(f => f.id !== 'program'));
    }
  }, [searchParams]);

  const handleSaveStudent = async (values: Student) => {
    setIsSubmitting(true);
    let year = values.year;
    if (values.enrollmentType === 'New') {
      year = '1st Year';
    } else if (['Transferee', 'Returnee', 'Continuing'].includes(values.enrollmentType) && !year) {
        toast({ variant: "destructive", title: "Validation Error", description: "Year level is required for this enrollment type." });
        setIsSubmitting(false);
        throw new Error("Year level missing");
    }

    const nameExists = students.some(
        (s) =>
            s.firstName.toLowerCase() === values.firstName.toLowerCase() &&
            s.lastName.toLowerCase() === values.lastName.toLowerCase() &&
            (!isEditMode || (isEditMode && selectedStudent && s.id !== selectedStudent.id))
    );

    if (nameExists) {
         toast({ variant: "destructive", title: "Duplicate Name", description: `A student named ${values.firstName} ${values.lastName} already exists.` });
         setIsSubmitting(false);
         throw new Error("Duplicate name");
    }

    const payload = {
      ...values,
      year: year,
      id: isEditMode ? selectedStudent?.id : undefined,
    };

    console.log(`Attempting to ${isEditMode ? 'edit' : 'add'} student:`, payload);
    try {
        let savedStudentResponse: Student;
        if (isEditMode && payload.id) {
            savedStudentResponse = await putData<typeof payload, Student>(`students/update.php/${payload.id}`, payload);
            logActivity("Updated Student", `${savedStudentResponse.firstName} ${savedStudentResponse.lastName}`, "Admin", savedStudentResponse.id, "student");
        } else {
             savedStudentResponse = await postData<Omit<typeof payload, 'id' | 'studentId' | 'username' | 'section' | 'lastAccessed'>, Student>('students/create.php', payload);
            if (!USE_MOCK_API) { 
              logActivity("Added Student", `${savedStudentResponse.firstName} ${savedStudentResponse.lastName} (${savedStudentResponse.username})`, "Admin", savedStudentResponse.id, "student", true, { ...savedStudentResponse});
            }
        }
        
        await loadInitialData(); 
        toast({ title: isEditMode ? "Student Updated" : "Student Added", description: `${savedStudentResponse.firstName} ${savedStudentResponse.lastName} has been ${isEditMode ? 'updated' : 'added'}.` });
        closeModal();
    } catch (error: any) {
        if (error.message !== "Duplicate name") { 
            console.error(`Failed to ${isEditMode ? 'update' : 'add'} student:`, error);
            toast({ variant: "destructive", title: `Error ${isEditMode ? 'Updating' : 'Adding'} Student`, description: error.message || `Could not ${isEditMode ? 'update' : 'add'} student. Please try again.` });
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
      setIsSubmitting(true);
      const studentToDelete = students.find(s => s.id === studentId);
      try {
          await deleteData(`students/delete.php/${studentId}`);
          await loadInitialData(); 
          toast({ title: "Student Deleted", description: `Student record has been removed.` });
          if (studentToDelete) {
            logActivity("Deleted Student", `${studentToDelete.firstName} ${studentToDelete.lastName} (${studentToDelete.username})`, "Admin", studentId, "student", true, studentToDelete);
          }
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
           await postData('admin/reset_password.php', { userId, userType: 'student', lastName });
           const defaultPassword = generateDefaultPasswordDisplay(lastName);
           toast({
                title: "Password Reset Successful",
                description: `Password for student ID ${userId} has been reset. Default password: ${defaultPassword}`,
           });
           logActivity("Reset Student Password", `For student ID ${userId}`, "Admin");
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

  const handlePromoteStudent = async (student: Student) => {
    if (!student.year) {
        toast({ variant: "destructive", title: "Promotion Error", description: "Student has no current year level." });
        return;
    }

    const currentYearIndex = yearLevelOptions.findIndex(opt => opt.value === student.year);
    if (currentYearIndex === -1 || currentYearIndex === yearLevelOptions.length - 1) {
        toast({ variant: "destructive", title: "Promotion Error", description: "Student is already at the highest year level or year level is invalid." });
        return;
    }

    const nextYearLevel = yearLevelOptions[currentYearIndex + 1].value;

    setIsSubmitting(true);
    try {
        const payload = {
            ...student,
            enrollmentType: 'Continuing' as EnrollmentType, 
            year: nextYearLevel,
        };
        const updatedStudent = await putData<Student, Student>(`students/update.php/${student.id}`, payload);
        await loadInitialData();
        toast({ title: "Student Promoted", description: `${student.firstName} ${student.lastName} promoted to ${nextYearLevel}. Enrollment type set to Continuing.` });
        logActivity("Promoted Student", `${student.firstName} ${student.lastName} to ${nextYearLevel}`, "Admin", student.id, "student");
    } catch (error: any) {
        console.error("Failed to promote student:", error);
        toast({ variant: "destructive", title: "Promotion Failed", description: error.message || "Could not promote student." });
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
     setTimeout(() => { 
        setSelectedStudent(null);
        setIsEditMode(false);
     }, 150);
   };

    const sectionOptions = React.useMemo(() => {
        return sections.map(sec => ({ label: sec, value: sec }));
    }, [sections]);

    const programOptions = React.useMemo(() => {
        return programs.map(p => ({ value: p.id, label: p.name}));
    }, [programs]);

    const columns: ColumnDef<Student>[] = React.useMemo(() => [
         {
            accessorKey: "studentId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Student ID" />,
            cell: ({ row }) => <div>{row.getValue("studentId")}</div>,
        },
         {
            accessorKey: "username",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
            cell: ({ row }) => <div>{row.original.username}</div>,
             enableHiding: true,
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
            accessorKey: "middleName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Middle Name" />,
            cell: ({ row }) => <div className="capitalize">{row.original.middleName || '-'}</div>,
            enableHiding: true,
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
            accessorKey: "suffix",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Suffix" />,
            cell: ({ row }) => <div className="capitalize">{row.original.suffix || '-'}</div>,
            enableHiding: true,
        },
        {
            accessorKey: "gender",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
            cell: ({ row }) => <div className="capitalize">{row.original.gender || '-'}</div>,
            enableHiding: true,
        },
        {
            accessorKey: "birthday",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Birthday" />,
            cell: ({ row }) => <div>{row.original.birthday || '-'}</div>,
            enableHiding: true,
        },
         {
            accessorKey: "program",
             header: ({ column }) => (
                 <DataTableFilterableColumnHeader
                     column={column}
                     title="Program"
                     options={programOptions}
                 />
             ),
            cell: ({ row }) => {
                const program = programs.find(p => p.id === row.original.program);
                return <div>{program?.name || row.original.program}</div>;
            },
             filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
         {
            accessorKey: "enrollmentType",
             header: ({ column }) => (
                 <DataTableFilterableColumnHeader
                     column={column}
                     title="Enrollment Type"
                     options={enrollmentTypeOptions}
                 />
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("enrollmentType")}</div>,
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
             enableHiding: false,
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
        {
            accessorKey: "lastAccessed",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Last Accessed" />,
            cell: ({ row }) => {
                const lastAccessed = row.original.lastAccessed;
                if (!lastAccessed) return <span className="text-muted-foreground italic">Never</span>;
                try {
                    return (
                        <div className="flex flex-col">
                            <span>{format(new Date(lastAccessed), "MMM d, yyyy, p")}</span>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(lastAccessed), { addSuffix: true })}</span>
                        </div>
                    );
                } catch (e) {
                    return <span className="text-muted-foreground italic">Invalid Date</span>;
                }
            },
            enableHiding: true,
        },
    ], [sectionOptions, programs, programOptions]);

    const generateActionMenuItems = (student: Student) => (
        <>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(student); }}>
            <Pencil className="mr-2 h-4 w-4" />
            View / Edit Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {student.year && student.year !== '4th Year' && ( 
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-green-600 focus:text-green-600 focus:bg-green-100" disabled={isSubmitting}>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Promote Student
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Promote Student?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will promote {student.firstName} {student.lastName} to the next year level and set their enrollment type to 'Continuing'. Are you sure?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async (e) => {
                                e.stopPropagation();
                                await handlePromoteStudent(student);
                            }}
                            className={cn(buttonVariants({ variant: "default" }), "bg-green-600 hover:bg-green-700 text-white")} 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Yes, promote student
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
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
                          This will reset the password for {student.firstName} ${student.lastName}. Default: {generateDefaultPasswordDisplay(student.lastName)}. Are you sure?
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
                searchPlaceholder="Search by ID, name, email..."
                actionMenuItems={generateActionMenuItems}
                columnVisibility={columnVisibility}
                setColumnVisibility={setColumnVisibility}
                 filterableColumnHeaders={[
                    { columnId: "program", title: "Program", options: programOptions },
                    { columnId: "year", title: "Year", options: yearLevelOptions },
                    { columnId: "enrollmentType", title: "Enrollment Type", options: enrollmentTypeOptions },
                    { columnId: "section", title: "Section", options: sectionOptions },
                ]}
                initialColumnFilters={columnFilters}
            />
        )}

      <UserForm<Student>
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen} 
            formSchema={studentSchema}
            onSubmit={handleSaveStudent}
            title={isEditMode ? `Student Details: ${selectedStudent?.firstName} ${selectedStudent?.lastName}` : 'Add New Student'}
            description={isEditMode ? "View or update student information." : "Fill in the details below. Section is assigned automatically. Credentials are generated upon creation."}
            formFields={studentFormFields}
            isEditMode={isEditMode}
            initialData={isEditMode ? selectedStudent : undefined}
            startReadOnly={isEditMode}
        />
    </div>
  );
}
