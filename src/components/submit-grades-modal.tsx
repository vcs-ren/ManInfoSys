
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { StudentSubjectAssignmentWithGrades } from "@/types";
import { submitGradesSchema } from "@/lib/schemas";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "./ui/scroll-area";

type SubmitGradesFormValues = z.infer<typeof submitGradesSchema>;

interface SubmitGradesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: StudentSubjectAssignmentWithGrades; // Data for the specific assignment
  onSubmit: (values: SubmitGradesFormValues) => Promise<void> | void;
}

export function SubmitGradesModal({
  isOpen,
  onOpenChange,
  assignment,
  onSubmit,
}: SubmitGradesModalProps) {
  const { toast } = useToast();

  const form = useForm<SubmitGradesFormValues>({
    resolver: zodResolver(submitGradesSchema),
    defaultValues: {
      assignmentId: assignment.assignmentId,
      studentId: assignment.studentId,
      subjectId: assignment.subjectId,
      prelimGrade: assignment.prelimGrade ?? "", // Initialize with empty string if null
      prelimRemarks: assignment.prelimRemarks ?? "",
      midtermGrade: assignment.midtermGrade ?? "", // Initialize with empty string if null
      midtermRemarks: assignment.midtermRemarks ?? "",
      finalGrade: assignment.finalGrade ?? "", // Initialize with empty string if null
      finalRemarks: assignment.finalRemarks ?? "",
    },
  });

   // Reset form when dialog opens or assignment changes
    React.useEffect(() => {
        if (isOpen) {
            form.reset({
                assignmentId: assignment.assignmentId,
                studentId: assignment.studentId,
                subjectId: assignment.subjectId,
                prelimGrade: assignment.prelimGrade ?? "", // Initialize with empty string if null
                prelimRemarks: assignment.prelimRemarks ?? "",
                midtermGrade: assignment.midtermGrade ?? "", // Initialize with empty string if null
                midtermRemarks: assignment.midtermRemarks ?? "",
                finalGrade: assignment.finalGrade ?? "", // Initialize with empty string if null
                finalRemarks: assignment.finalRemarks ?? "",
            });
        }
    }, [isOpen, assignment, form]);

  const handleFormSubmit = async (values: SubmitGradesFormValues) => {
    try {
        // Helper to safely convert form values (string, number, null, undefined) to number or null
        const convertToNumberOrNull = (val: unknown): number | null => {
            if (val === "" || val === null || typeof val === 'undefined') {
                return null;
            }
            const num = Number(val); // Attempt conversion
            // Check if the result is a valid finite number
            return isNaN(num) || !isFinite(num) ? null : num;
        };

        // Prepare the payload ensuring grade fields are either numbers or null
        const payload = {
            ...values,
            prelimGrade: convertToNumberOrNull(values.prelimGrade),
            midtermGrade: convertToNumberOrNull(values.midtermGrade),
            finalGrade: convertToNumberOrNull(values.finalGrade),
        };

        console.log("Submitting grades (processed):", payload);
        // Cast the payload to the expected type for the onSubmit function
        // This assumes the onSubmit function expects the structure with grades as number | null
        await onSubmit(payload as SubmitGradesFormValues); // Call the actual submit function passed via props

        toast({
            title: "Success",
            description: `Grades submitted successfully for ${assignment.studentName} in ${assignment.subjectName}.`,
        });
        onOpenChange(false); // Close main dialog
    } catch (error: any) { // Add type annotation for error
        console.error("Grade submission error:", error);
        // Use error.message if available, otherwise provide a generic message
        const errorMessage = error?.message || "Failed to submit grades. Please try again.";
        toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
        });
        // No need to re-throw if the error is handled here
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Submit Grades: {assignment.subjectName}
          </DialogTitle>
          <DialogDescription>
            Student: {assignment.studentName} ({assignment.studentId})
          </DialogDescription>
        </DialogHeader>
         <ScrollArea className="max-h-[60vh] p-1 pr-4">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">

                {/* Prelim Section */}
                <div className="space-y-2">
                    <h3 className="text-md font-semibold text-primary">Prelim</h3>
                    <FormField
                        control={form.control}
                        name="prelimGrade"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <FormControl>
                                <Input
                                     type="number" // Use number type for input
                                     min="0"
                                     max="100"
                                     step="1" // Allow only whole numbers if desired, or "any" for decimals
                                     placeholder="Enter grade (0-100)"
                                     {...field}
                                     // Use nullish coalescing for value to handle null/undefined
                                     value={field.value ?? ""}
                                     // Ensure onChange converts empty string or invalid number to empty string for the field state
                                     onChange={(e) => {
                                        const val = e.target.value;
                                        // Allow empty string, otherwise attempt to convert to number
                                        field.onChange(val === '' ? '' : val);
                                    }}
                                     />
                            </FormControl>
                             <FormMessage />
                                <p className="text-xs text-muted-foreground">Numeric grade between 0 and 100.</p>
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="prelimRemarks"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Remarks (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Prelim remarks..." {...field} value={field.value ?? ""} />
                            </FormControl>
                             <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

                <Separator />

                {/* Midterm Section */}
                 <div className="space-y-2">
                    <h3 className="text-md font-semibold text-primary">Midterm</h3>
                    <FormField
                        control={form.control}
                        name="midtermGrade"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <FormControl>
                                 <Input
                                     type="number"
                                     min="0"
                                     max="100"
                                     step="1"
                                     placeholder="Enter grade (0-100)"
                                     {...field}
                                     value={field.value ?? ""}
                                     onChange={(e) => {
                                        const val = e.target.value;
                                        field.onChange(val === '' ? '' : val);
                                    }}/>
                            </FormControl>
                             <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="midtermRemarks"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Remarks (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Midterm remarks..." {...field} value={field.value ?? ""} />
                            </FormControl>
                             <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

                <Separator />

                {/* Final Section */}
                 <div className="space-y-2">
                    <h3 className="text-md font-semibold text-primary">Final</h3>
                    <FormField
                        control={form.control}
                        name="finalGrade"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <FormControl>
                                <Input
                                     type="number"
                                     min="0"
                                     max="100"
                                     step="1"
                                     placeholder="Enter grade (0-100)"
                                     {...field}
                                     value={field.value ?? ""}
                                     onChange={(e) => {
                                        const val = e.target.value;
                                        field.onChange(val === '' ? '' : val);
                                    }}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="finalRemarks"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Remarks (Optional)</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Final remarks..." {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

                <DialogFooter className="mt-6 sticky bottom-0 bg-background py-3 pr-1">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Grades'}
                    </Button>
                </DialogFooter>

            </form>
            </Form>
         </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
