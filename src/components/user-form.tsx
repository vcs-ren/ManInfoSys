
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form"; // Import useWatch
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
} from "@/components/ui/select"; // Import Select components
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Student, Teacher } from "@/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea

interface UserFormProps<T extends Student | Teacher> {
  trigger?: React.ReactNode; // Trigger is now optional
  isOpen?: boolean; // Optional prop to control dialog state externally
  onOpenChange?: (open: boolean) => void; // Optional handler for external control
  formSchema: z.ZodSchema<T>;
  defaultValues?: Partial<T>; // For editing
  onSubmit: (values: T) => Promise<void> | void; // Make onSubmit flexible
  title: string;
  description: string;
  formFields: FormFieldConfig<T>[]; // Configuration for form fields
  isEditMode?: boolean; // Flag to indicate if it's an edit form
  initialData?: T; // Data for edit mode, including generated IDs/credentials
}

// Define a type for form field configuration
export type FormFieldConfig<T> = {
  name: keyof T;
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute | "select" | "textarea"; // Added "textarea"
  required?: boolean; // For frontend indication, validation is via schema
  disabled?: boolean; // Make field read-only
  options?: { value: string | number; label: string }[]; // Options for select dropdown
  condition?: (data: Partial<T> | null | undefined) => boolean; // Conditional rendering
};

export function UserForm<T extends Student | Teacher>({
  trigger,
  isOpen: isOpenProp, // Rename prop to avoid conflict with internal state
  onOpenChange: onOpenChangeProp, // Rename prop
  formSchema,
  defaultValues,
  onSubmit,
  title,
  description,
  formFields,
  isEditMode = false,
  initialData
}: UserFormProps<T>) {
  // Internal state for dialog visibility, used if not controlled externally
  const [internalOpen, setInternalOpen] = React.useState(false);
  const { toast } = useToast();

  // Determine if the dialog is controlled externally
  const isControlled = isOpenProp !== undefined && onOpenChangeProp !== undefined;

  // Use external state if controlled, otherwise use internal state
  const isOpen = isControlled ? isOpenProp : internalOpen;
  const setIsOpen = isControlled ? onOpenChangeProp : setInternalOpen;

   // Initialize the form with default values or initial data for editing
    const form = useForm<T>({
        resolver: zodResolver(formSchema),
        defaultValues: isEditMode ? (initialData as any) : (defaultValues as any), // Use initialData if editing
    });

    // Watch the status field to conditionally show the year field
    const watchedStatus = useWatch({ control: form.control, name: 'status' as any });

    // Reset form when dialog opens/closes or mode changes
    React.useEffect(() => {
        if (isOpen) {
         form.reset(isEditMode ? (initialData as any) : (defaultValues as any));
        }
    }, [isOpen, isEditMode, initialData, defaultValues, form]);

   // Effect to set year to '1st Year' if status becomes 'New'
   React.useEffect(() => {
       if (watchedStatus === 'New') {
           form.setValue('year' as any, '1st Year', { shouldValidate: false }); // Set year, avoid immediate validation
       } else if (initialData && !isEditMode) { // Reset year if status changes from New on ADD mode
            form.setValue('year' as any, initialData.year || '', { shouldValidate: false });
       } else if (!isEditMode && !initialData) { // Reset year if status changes on ADD mode (no initial data)
            form.setValue('year' as any, '', { shouldValidate: true }); // Clear year if not New
       }
       // If editing, let the user control the year if status is not 'New'
   }, [watchedStatus, form, isEditMode, initialData]);


  const handleFormSubmit = async (values: T) => {
    try {
       // Override year if status is 'New' just before submitting
        if (values.status === 'New') {
            values.year = '1st Year' as any;
        }
       console.log("Submitting values:", values);
      await onSubmit(values); // Call the provided onSubmit function
      toast({
        title: `Success`,
        description: `${isEditMode ? 'User updated' : 'User added'} successfully.`,
      });
      setIsOpen(false); // Close dialog on success
      form.reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'add'} user. Please try again.`,
      });
    }
  };

  // Get current form values to pass to condition function
  const currentFormValues = useWatch({ control: form.control });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Render DialogTrigger only if trigger is provided and not controlled externally */}
      {!isControlled && trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <ScrollArea className="max-h-[60vh] p-1 pr-6"> {/* Added ScrollArea */}
              <div className="grid gap-4 py-4">
                {formFields.map((fieldConfig) => {
                    // Check condition if it exists
                    if (fieldConfig.condition && !fieldConfig.condition(currentFormValues)) {
                        return null; // Don't render field if condition is not met
                    }

                    // Special handling for year field when status is 'New'
                    const isYearField = fieldConfig.name === 'year';
                    const disableYearField = isYearField && watchedStatus === 'New';

                    return (
                        <FormField
                            key={String(fieldConfig.name)}
                            control={form.control}
                            name={fieldConfig.name as any} // Cast needed due to complex typing
                            render={({ field }) => (
                            <FormItem className="grid grid-cols-4 items-center gap-4">
                                <FormLabel className="text-right">{fieldConfig.label}{fieldConfig.required && !disableYearField ? '*' : ''}</FormLabel>
                                <FormControl className="col-span-3">
                                    {fieldConfig.type === 'select' ? (
                                        <Select
                                            onValueChange={field.onChange}
                                            // Ensure the value passed to Select is always a string
                                            value={field.value ? String(field.value) : undefined}
                                            disabled={fieldConfig.disabled || disableYearField || form.formState.isSubmitting}
                                        >
                                            {/* Apply w-full to the trigger */}
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={fieldConfig.placeholder || "Select an option"} />
                                            </SelectTrigger>
                                            {/* Ensure SelectContent pops over other elements */}
                                            <SelectContent>
                                                {(fieldConfig.options || []).map((option) => (
                                                    <SelectItem key={option.value} value={String(option.value)}>
                                                    {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : fieldConfig.type === 'textarea' ? ( // Handle textarea
                                        <Textarea
                                            placeholder={fieldConfig.placeholder}
                                            disabled={fieldConfig.disabled || form.formState.isSubmitting}
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    ) : (
                                        <Input
                                            placeholder={fieldConfig.placeholder}
                                            type={fieldConfig.type || "text"}
                                            disabled={fieldConfig.disabled || disableYearField || form.formState.isSubmitting}
                                            {...field}
                                            // Handle number input type properly
                                            value={fieldConfig.type === 'number' && typeof field.value === 'number' ? field.value : (field.value ?? '')} // Use nullish coalescing
                                            onChange={(e) => {
                                                if (fieldConfig.type === 'number') {
                                                const numericValue = e.target.value === '' ? '' : Number(e.target.value);
                                                field.onChange(isNaN(numericValue as number) ? '' : numericValue); // Handle NaN
                                                } else {
                                                field.onChange(e.target.value);
                                                }
                                            }}
                                        />
                                    )}

                                </FormControl>
                                {isYearField && disableYearField && (
                                     <p className="col-span-3 col-start-2 text-xs text-muted-foreground">Set to 1st Year for New students.</p>
                                )}
                                <FormMessage className="col-span-3 col-start-2" />
                            </FormItem>
                            )}
                        />
                    );
                })}
                 {/* Display generated username/password/section only in edit mode */}
                  {isEditMode && initialData && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right font-semibold">Username</Label>
                            <Input
                            className="col-span-3 bg-muted"
                            value={(initialData as any).studentId || (initialData as any).teacherId || 'N/A'}
                            readOnly
                            disabled
                            />
                        </div>
                         {/* Display Section for Students in Edit Mode */}
                        {'section' in initialData && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right font-semibold">Section</Label>
                                <Input
                                    className="col-span-3 bg-muted"
                                    value={(initialData as Student).section || 'N/A'}
                                    readOnly
                                    disabled
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right font-semibold">Password</Label>
                            <Input
                            className="col-span-3 bg-muted text-muted-foreground italic"
                            value="******** (Hidden)" // Show placeholder instead of actual password
                            readOnly
                            disabled
                            />
                             <p className="col-span-3 col-start-2 text-xs text-muted-foreground">Password is auto-generated and securely stored. Contact admin if needed.</p>
                        </div>

                      </>
                  )}

              </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add User')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

