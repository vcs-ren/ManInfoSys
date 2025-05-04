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
        // Ensure empty strings become null before submission if desired by backend
        // And convert valid numbers from string if needed (though coerce handles this in schema)
        const processedValues = {
            ...values,
            prelimGrade: values.prelimGrade === "" || values.prelimGrade === null ? null : Number(values.prelimGrade),
            midtermGrade: values.midtermGrade === "" || values.midtermGrade === null ? null : Number(values.midtermGrade),
            finalGrade: values.finalGrade === "" || values.finalGrade === null ? null : Number(values.finalGrade),
        }
      console.log("Submitting grades:", processedValues);
      await onSubmit(processedValues); // Call the actual submit function passed via props
      toast({
        title: "Success",
        description: `Grades submitted successfully for ${assignment.studentName} in ${assignment.subjectName}.`,
      });
      onOpenChange(false); // Close main dialog
    } catch (error) {
      console.error("Grade submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to submit grades. Please try again.`,
      });
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
                                        field.onChange(val === '' ? '' : Number(val));
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
                                        field.onChange(val === '' ? '' : Number(val));
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
                                        field.onChange(val === '' ? '' : Number(val));
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
