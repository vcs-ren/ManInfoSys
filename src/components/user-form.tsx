
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
  DialogTrigger,
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
import type { Student, Teacher, AdminUser } from "@/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Pencil } from "lucide-react"; // Import Pencil

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
  startReadOnly?: boolean; // New prop to control initial state
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
  section?: 'personal' | 'work' | 'emergency' | 'account';
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
  startReadOnly = false, // Default to not read-only
}: UserFormProps<T>) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [isReadOnly, setIsReadOnly] = React.useState(startReadOnly && isEditMode); // Internal read-only state, only applicable in edit mode
  const { toast } = useToast();

  const isControlled = isOpenProp !== undefined && onOpenChangeProp !== undefined;
  const isOpen = isControlled ? isOpenProp : internalOpen;
  const setIsOpen = isControlled ? onOpenChangeProp : setInternalOpen;

  const form = useForm<T>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? (initialData as any) : (defaultValues as any),
  });

  const watchedStatus = useWatch({ control: form.control, name: 'status' as any });
  const currentFormValues = useWatch({ control: form.control });

  // Reset form and read-only state when dialog opens/closes or mode changes
  React.useEffect(() => {
    if (isOpen) {
      form.reset(isEditMode ? (initialData as any) : (defaultValues as any));
      // Set read-only state only when opening in edit mode with startReadOnly true
      setIsReadOnly(isEditMode && startReadOnly);
    } else {
        // Reset read-only state when closing
        setIsReadOnly(false);
    }
  }, [isOpen, isEditMode, initialData, defaultValues, form, startReadOnly]);

  React.useEffect(() => {
    if (watchedStatus === 'New') {
        form.setValue('year' as any, '1st Year', { shouldValidate: false });
    } else if (initialData && !isEditMode) {
        form.setValue('year' as any, (initialData as Student)?.year || '', { shouldValidate: false });
    } else if (!isEditMode && !initialData) {
        form.setValue('year' as any, '', { shouldValidate: true });
    }
  }, [watchedStatus, form, isEditMode, initialData]);

  const handleFormSubmit = async (values: T) => {
    try {
      if ('status' in values && values.status === 'New') {
        (values as Student).year = '1st Year';
      }
      console.log("Submitting values:", values);
      await onSubmit(values);
      toast({
        title: `Success`,
        description: `${isEditMode ? 'User updated' : 'User added'} successfully.`,
      });
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'add'} user. Please try again.`,
      });
    }
  };

   const handleCancelEdit = () => {
      setIsReadOnly(true); // Go back to read-only mode
      // Reset form to initial data
       if (isEditMode && initialData) {
            form.reset(initialData as any);
       }
    };


  const renderFormField = (fieldConfig: FormFieldConfig<T>) => {
    if (fieldConfig.condition && !fieldConfig.condition(currentFormValues)) {
      return null;
    }

    const isStudentForm = 'status' in form.getValues();
    const isYearField = fieldConfig.name === 'year';
    const disableYearField = isStudentForm && isYearField && watchedStatus === 'New';
    const isDisabled = isReadOnly || disableYearField || fieldConfig.disabled || form.formState.isSubmitting; // Determine final disabled state

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
                  <SelectTrigger className="w-full h-9 text-sm">
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
                  readOnly={isReadOnly} // Explicitly set readOnly for textarea
                />
              ) : (
                <Input
                  placeholder={fieldConfig.placeholder}
                  type={fieldConfig.type || "text"}
                  disabled={isDisabled}
                  {...field}
                  value={fieldConfig.type === 'number' && typeof field.value === 'number' ? field.value : (field.value ?? '')}
                  onChange={(e) => {
                    if (fieldConfig.type === 'number') {
                      const numericValue = e.target.value === '' ? '' : Number(e.target.value);
                      field.onChange(isNaN(numericValue as number) ? '' : numericValue);
                    } else {
                      field.onChange(e.target.value);
                    }
                  }}
                  className="h-9 text-sm"
                  readOnly={isReadOnly} // Explicitly set readOnly for input
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

  const personalFields = formFields.filter(f => (f.section === 'personal' || !f.section) && !f.name.toString().toLowerCase().includes('emergency'));
  const workFields = formFields.filter(f => f.section === 'work');
  const emergencyFields = formFields.filter(f => f.section === 'emergency' || f.name.toString().toLowerCase().includes('emergency'));
  const accountFields = formFields.filter(f => f.section === 'account');

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
            {/* Show Edit button only in read-only mode when editing */}
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
                    {workFields.length > 0 && (
                         <div className="space-y-3">
                            <Separator />
                             <h4 className="text-md font-semibold text-primary border-b pb-1 pt-2">Work Information</h4>
                            <div className="space-y-3">
                                {workFields.map(renderFormField)}
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
                    {accountFields.length > 0 && (
                         <div className="space-y-3">
                            <Separator />
                             <h4 className="text-md font-semibold text-primary border-b pb-1 pt-2">Account Details</h4>
                            <div className="space-y-3">
                                {accountFields.map(renderFormField)}
                             </div>
                         </div>
                    )}

                  {/* Display System Info only when editing (always read-only here) */}
                  {isEditMode && initialData && (
                      <>
                        <Separator />
                        <div className="space-y-3 pt-2">
                             <h4 className="text-md font-semibold text-primary border-b pb-1">System Information</h4>
                            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-1">
                                <Label className="text-right font-semibold text-sm">Username</Label>
                                <Input
                                className="col-span-3 bg-muted h-9 text-sm"
                                value={(initialData as any).studentId || (initialData as any).teacherId || (initialData as any).username ||'N/A'}
                                readOnly
                                disabled
                                />
                            </div>
                            {'section' in initialData && (
                                <div className="grid grid-cols-4 items-center gap-x-4 gap-y-1">
                                    <Label className="text-right font-semibold text-sm">Section</Label>
                                    <Input
                                        className="col-span-3 bg-muted h-9 text-sm"
                                        value={(initialData as Student).section || 'N/A'}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-1">
                                <Label className="text-right font-semibold text-sm">Password</Label>
                                <Input
                                className="col-span-3 bg-muted text-muted-foreground italic h-9 text-sm"
                                value="******** (Hidden)"
                                readOnly
                                disabled
                                />
                                <p className="col-span-3 col-start-2 text-xs text-muted-foreground -mt-1">Password is auto-generated. User can change it in Settings.</p>
                            </div>
                        </div>
                      </>
                  )}
              </div>
            </ScrollArea>
             {/* Footer with buttons - shown only when NOT read-only */}
            {!isReadOnly && (
                <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={isEditMode ? handleCancelEdit : () => setIsOpen(false)} disabled={form.formState.isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (isEditMode ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>) : (isEditMode ? 'Save Changes' : 'Add User')}
                </Button>
                </DialogFooter>
            )}
             {/* Close button for read-only mode */}
             {isReadOnly && (
                  <DialogFooter className="mt-4">
                     <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
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
