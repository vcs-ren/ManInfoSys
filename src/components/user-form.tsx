
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Student, Faculty as Teacher, AdminUser } from "@/types"; // Renamed Teacher to Faculty
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Pencil } from "lucide-react";

interface UserFormProps<T extends Student | Teacher | AdminUser> {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  formSchema: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  onSubmit: (values: T) => Promise<void> | void;
  title: string;
  description: string;
  formFields: FormFieldConfig<T>[];
  isEditMode?: boolean;
  initialData?: T;
  startReadOnly?: boolean;
}

export type FormFieldConfig<T> = {
  name: keyof T;
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute | "select" | "textarea";
  required?: boolean;
  disabled?: boolean;
  options?: { value: string | number; label: string }[];
  condition?: (data: Partial<T> | null | undefined) => boolean;
  section?: 'personal' | 'enrollment' | 'employee' | 'emergency' | 'account' | 'contact';
};

export function UserForm<T extends Student | Teacher | AdminUser>({
  trigger,
  isOpen: isOpenProp,
  onOpenChange: onOpenChangeProp,
  formSchema,
  defaultValues,
  onSubmit,
  title,
  description,
  formFields,
  isEditMode = false,
  initialData,
  startReadOnly = false,
}: UserFormProps<T>) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [isReadOnly, setIsReadOnly] = React.useState(startReadOnly && isEditMode);
  const { toast } = useToast();

  const isControlled = isOpenProp !== undefined && onOpenChangeProp !== undefined;
  const isOpen = isControlled ? isOpenProp : internalOpen;
  const setIsOpen = isControlled ? onOpenChangeProp : setInternalOpen;

  const form = useForm<T>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? (initialData as any) : (defaultValues as any),
  });

  const watchedEnrollmentType = useWatch({ control: form.control, name: 'enrollmentType' as any }); // Changed from watchedStatus
  const currentFormValues = useWatch({ control: form.control });

  React.useEffect(() => {
    if (isOpen) {
      form.reset(isEditMode ? (initialData as any) : (defaultValues as any));
      setIsReadOnly(isEditMode && startReadOnly);
    } else {
        setIsReadOnly(false);
    }
  }, [isOpen, isEditMode, initialData, defaultValues, form, startReadOnly]);

  React.useEffect(() => {
    if (initialData && 'enrollmentType' in initialData) { // Changed from 'status'
        if (watchedEnrollmentType === 'New') { // Changed from watchedStatus
            form.setValue('year' as any, '1st Year', { shouldValidate: false });
        } else if (isEditMode && (initialData as Student).enrollmentType !== 'New') { // Changed from status
             form.setValue('year' as any, (initialData as Student)?.year || '', { shouldValidate: true });
        } else if (!isEditMode && watchedEnrollmentType !== 'New') { // Changed from watchedStatus
             form.setValue('year' as any, '', { shouldValidate: true });
        }
    }
  }, [watchedEnrollmentType, form, isEditMode, initialData]); // Changed from watchedStatus


  const handleFormSubmit = async (values: T) => {
    try {
      if ('enrollmentType' in values && (values as Student).enrollmentType === 'New') { // Changed from status
        (values as Student).year = '1st Year';
      }
      console.log("Submitting values:", values);
      await onSubmit(values);
      if (setIsOpen) {
        setIsOpen(false);
      }
      form.reset();
    } catch (error: any) {
      console.error("Form submission error:", error);
      if (!error?.message?.includes('Duplicate name')) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || `Failed to ${isEditMode ? 'update' : 'add'} user. Please try again.`,
            });
      }
    }
  };

   const handleCancelEdit = () => {
      setIsReadOnly(true);
       if (isEditMode && initialData) {
            form.reset(initialData as any);
       }
    };

  const renderFormField = (fieldConfig: FormFieldConfig<T>) => {
    if (fieldConfig.condition && !fieldConfig.condition(currentFormValues)) {
      return null;
    }

    const isStudentForm = initialData && 'studentId' in initialData;
    const isYearField = fieldConfig.name === 'year';
    const disableYearField = isStudentForm && isYearField && watchedEnrollmentType === 'New'; // Changed from watchedStatus
    const isDisabled = isReadOnly || disableYearField || fieldConfig.disabled || form.formState.isSubmitting;

    return (
      <FormField
        key={String(fieldConfig.name)}
        control={form.control}
        name={fieldConfig.name as any}
        render={({ field }) => (
          <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1">
            <FormLabel className="text-right text-sm">{fieldConfig.label}{fieldConfig.required && !disableYearField ? '*' : ''}</FormLabel>
            <FormControl className="col-span-3">
              {fieldConfig.type === 'select' ? (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ? String(field.value) : undefined}
                  disabled={isDisabled}
                >
                  <SelectTrigger className="w-full text-sm h-10">
                    <SelectValue placeholder={fieldConfig.placeholder || "Select an option"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(fieldConfig.options || []).map((option) => (
                      <SelectItem key={option.value} value={String(option.value)} className="text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : fieldConfig.type === 'textarea' ? (
                <Textarea
                  placeholder={fieldConfig.placeholder}
                  disabled={isDisabled}
                  {...field}
                  value={field.value ?? ''}
                  className="text-sm min-h-[60px]"
                  readOnly={isReadOnly}
                />
              ) : (
                <Input
                  placeholder={fieldConfig.placeholder}
                  type={fieldConfig.type || "text"}
                  disabled={isDisabled}
                  {...field}
                  value={fieldConfig.type === 'date' && field.value ? String(field.value).split('T')[0] : (field.value ?? '')}
                  onChange={(e) => {
                    if (fieldConfig.type === 'number') {
                      const numericValue = e.target.value === '' ? '' : Number(e.target.value);
                      field.onChange(isNaN(numericValue as number) ? '' : numericValue);
                    } else {
                      field.onChange(e.target.value);
                    }
                  }}
                  className="text-sm h-10"
                  readOnly={isReadOnly}
                />
              )}
            </FormControl>
            {isStudentForm && isYearField && disableYearField && (
              <p className="col-span-3 col-start-2 text-xs text-muted-foreground -mt-1">Set to 1st Year for New students.</p>
            )}
            <FormMessage className="col-span-3 col-start-2 text-xs" />
          </FormItem>
        )}
      />
    );
  };

  const personalFields = formFields.filter(f => f.section === 'personal');
  const enrollmentFields = formFields.filter(f => f.section === 'enrollment');
  const employeeFields = formFields.filter(f => f.section === 'employee');
  const contactFields = formFields.filter(f => f.section === 'contact');
  const accountFields = formFields.filter(f => f.section === 'account');
  const emergencyFields = formFields.filter(f => f.section === 'emergency');

  const isStudent = initialData && 'studentId' in initialData;
  const isTeacher = initialData && 'facultyId' in initialData; // Changed from teacherId
  const isAdmin = initialData && 'username' in initialData && !isStudent && !isTeacher;

  const idLabel = isStudent ? 'Student ID' : isTeacher ? 'Faculty ID' : isAdmin ? 'Username' : 'ID'; // Changed label
  const idValue = isStudent ? (initialData as Student)?.studentId : isTeacher ? (initialData as Teacher)?.facultyId : isAdmin ? (initialData as AdminUser)?.username : 'N/A'; // Changed field
  const usernameLabel = 'Username';
  const usernameValue = initialData ? (initialData as Student)?.username || (initialData as Teacher)?.username || (initialData as AdminUser)?.username || 'N/A' : 'N/A';


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex justify-between items-center">
             <div>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </div>
            {isEditMode && isReadOnly && (
                 <Button variant="outline" size="sm" onClick={() => setIsReadOnly(false)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                 </Button>
            )}
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <ScrollArea className="max-h-[70vh] p-1 pr-6">
                <div className="space-y-6 py-4">
                    {personalFields.length > 0 && (
                         <div className="space-y-3">
                            <h4 className="text-md font-semibold text-primary border-b pb-1">Personal Information</h4>
                            <div className="space-y-3">
                                {personalFields.map(renderFormField)}
                             </div>
                         </div>
                    )}
                    {enrollmentFields.length > 0 && (
                         <div className="space-y-3">
                            <Separator />
                             <h4 className="text-md font-semibold text-primary border-b pb-1 pt-2">Enrollment Information</h4>
                            <div className="space-y-3">
                                {isEditMode && isStudent && initialData && (
                                    <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1">
                                        <FormLabel className="text-right text-sm">{idLabel}</FormLabel>
                                        <FormControl className="col-span-3">
                                            <Input
                                                className="text-sm h-10 bg-muted"
                                                value={idValue}
                                                readOnly
                                                disabled
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                                {enrollmentFields.map(renderFormField)}
                                {isEditMode && isStudent && initialData && 'section' in initialData && (
                                    <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1">
                                        <FormLabel className="text-right text-sm">Section</FormLabel>
                                        <FormControl className="col-span-3">
                                            <Input
                                                className="text-sm h-10 bg-muted"
                                                value={(initialData as Student).section || 'N/A'}
                                                readOnly
                                                disabled
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                             </div>
                         </div>
                    )}
                    {employeeFields.length > 0 && (
                         <div className="space-y-3">
                            <Separator />
                             <h4 className="text-md font-semibold text-primary border-b pb-1 pt-2">Employee Information</h4>
                            <div className="space-y-3">
                                {isEditMode && isTeacher && initialData && (
                                    <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1">
                                        <FormLabel className="text-right text-sm">{idLabel}</FormLabel>
                                        <FormControl className="col-span-3">
                                            <Input
                                                className="text-sm h-10 bg-muted"
                                                value={idValue}
                                                readOnly
                                                disabled
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                                {employeeFields.map(renderFormField)}
                             </div>
                         </div>
                    )}
                     {(contactFields.length > 0 || accountFields.length > 0 || isEditMode) && (
                         <div className="space-y-3">
                            <Separator />
                             <h4 className="text-md font-semibold text-primary border-b pb-1 pt-2">Contact & Account Details</h4>
                             <div className="space-y-3">
                                {contactFields.map(renderFormField)}
                                {accountFields.map(renderFormField)}
                                {isEditMode && initialData && (isStudent || isTeacher || isAdmin) && (
                                    <>
                                        <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1">
                                            <FormLabel className="text-right text-sm">{usernameLabel}</FormLabel>
                                            <FormControl className="col-span-3">
                                                <Input
                                                    className="text-sm h-10 bg-muted"
                                                    value={usernameValue}
                                                    readOnly
                                                    disabled
                                                />
                                            </FormControl>
                                        </FormItem>
                                        <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1">
                                            <FormLabel className="text-right text-sm">Password</FormLabel>
                                            <FormControl className="col-span-3">
                                                <Input
                                                    className="bg-muted text-muted-foreground italic text-sm h-10"
                                                    value="******** (Hidden)"
                                                    readOnly
                                                    disabled
                                                    />
                                            </FormControl>
                                            <p className="col-span-3 col-start-2 text-xs text-muted-foreground -mt-1">Password is auto-generated/reset. User can change it in Settings.</p>
                                        </FormItem>
                                    </>
                                )}
                             </div>
                         </div>
                     )}
                    {emergencyFields.length > 0 && (
                        <div className="space-y-3">
                            <Separator />
                            <h4 className="text-md font-semibold text-primary border-b pb-1 pt-2">Emergency Contact</h4>
                            <div className="space-y-3">
                                {emergencyFields.map(renderFormField)}
                            </div>
                        </div>
                    )}
              </div>
            </ScrollArea>
            {!isReadOnly && (
                <DialogFooter className="mt-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={isEditMode ? handleCancelEdit : () => setIsOpen && setIsOpen(false)} disabled={form.formState.isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting || (isEditMode && !form.formState.isDirty)}>
                    {form.formState.isSubmitting ? (isEditMode ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>) : (isEditMode ? 'Save Changes' : 'Add User')}
                </Button>
                </DialogFooter>
            )}
             {isReadOnly && (
                  <DialogFooter className="mt-4 pt-4 border-t">
                     <Button type="button" variant="outline" onClick={() => setIsOpen && setIsOpen(false)}>
                         Close
                    </Button>
                  </DialogFooter>
             )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
