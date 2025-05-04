"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Student, Teacher } from "@/types";
import { Label } from "@/components/ui/label"; // Import Label
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
type FormFieldConfig<T> = {
  name: keyof T;
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute; // "text", "email", "number", etc.
  required?: boolean; // For frontend indication, validation is via schema
  disabled?: boolean; // Make field read-only
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


    // Reset form when dialog opens/closes or mode changes
    React.useEffect(() => {
        if (isOpen) {
         form.reset(isEditMode ? (initialData as any) : (defaultValues as any));
        }
    }, [isOpen, isEditMode, initialData, defaultValues, form]);


  const handleFormSubmit = async (values: T) => {
    try {
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
                {formFields.map((fieldConfig) => (
                  <FormField
                    key={String(fieldConfig.name)}
                    control={form.control}
                    name={fieldConfig.name as any} // Cast needed due to complex typing
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">{fieldConfig.label}{fieldConfig.required ? '*' : ''}</FormLabel>
                        <FormControl className="col-span-3">
                          <Input
                            placeholder={fieldConfig.placeholder}
                            type={fieldConfig.type || "text"}
                            disabled={fieldConfig.disabled || form.formState.isSubmitting}
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
                        </FormControl>
                        <FormMessage className="col-span-3 col-start-2" />
                      </FormItem>
                    )}
                  />
                ))}
                 {/* Display generated username/password only in edit mode */}
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

