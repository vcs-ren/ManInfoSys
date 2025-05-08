
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

// Define the expected payload type matching the PHP endpoint
// Ensure grades are number | null
type GradePayload = Omit<StudentSubjectAssignmentWithGrades, 'studentName' | 'subjectName' | 'section' | 'year' | 'status' | 'prelimGrade' | 'midtermGrade' | 'finalGrade'> & {
    prelimGrade: number | null;
    prelimRemarks?: string | null;
    midtermGrade: number | null;
    midtermRemarks?: string | null;
    finalGrade: number | null;
    finalRemarks?: string | null;
};

type SubmitGradesFormValues = z.infer<typeof submitGradesSchema>;

interface SubmitGradesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: StudentSubjectAssignmentWithGrades;
  onSubmit: (values: GradePayload) => Promise<void> | void; // Expecting the payload type
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
    // Initialize form with values from the assignment prop
    defaultValues: {
      assignmentId: assignment.assignmentId,
      studentId: assignment.studentId,
      subjectId: assignment.subjectId,
      prelimGrade: assignment.prelimGrade ?? "",
      prelimRemarks: assignment.prelimRemarks ?? "",
      midtermGrade: assignment.midtermGrade ?? "",
      midtermRemarks: assignment.midtermRemarks ?? "",
      finalGrade: assignment.finalGrade ?? "",
      finalRemarks: assignment.finalRemarks ?? "",
    },
  });

    React.useEffect(() => {
        if (isOpen) {
            form.reset({
                assignmentId: assignment.assignmentId,
                studentId: assignment.studentId,
                subjectId: assignment.subjectId,
                prelimGrade: assignment.prelimGrade ?? "",
                prelimRemarks: assignment.prelimRemarks ?? "",
                midtermGrade: assignment.midtermGrade ?? "",
                midtermRemarks: assignment.midtermRemarks ?? "",
                finalGrade: assignment.finalGrade ?? "",
                finalRemarks: assignment.finalRemarks ?? "",
            });
        }
    }, [isOpen, assignment, form]);

  const handleFormSubmit = async (values: SubmitGradesFormValues) => {
    try {
        const convertToNumberOrNull = (val: unknown): number | null => {
            if (val === "" || val === null || typeof val === 'undefined') return null;
            const num = Number(val);
            // Ensure only numbers 0-100 are valid, treat others as null
            return isNaN(num) || !isFinite(num) || num < 0 || num > 100 ? null : num;
        };


        const payload: GradePayload = {
            assignmentId: values.assignmentId,
            studentId: values.studentId,
            subjectId: values.subjectId,
            prelimGrade: convertToNumberOrNull(values.prelimGrade),
            prelimRemarks: values.prelimRemarks || null,
            midtermGrade: convertToNumberOrNull(values.midtermGrade),
            midtermRemarks: values.midtermRemarks || null,
            finalGrade: convertToNumberOrNull(values.finalGrade),
            finalRemarks: values.finalRemarks || null,
        };

        console.log("Submitting grades (processed payload):", payload);
        await onSubmit(payload); // Call the actual submit function passed via props

        // Toast is handled by the parent component on success
        // toast({
        //     title: "Success",
        //     description: `Grades submitted successfully for ${assignment.studentName} in ${assignment.subjectName}.`,
        // });
        onOpenChange(false); // Close modal on success
    } catch (error: any) {
        console.error("Grade submission error in modal:", error);
        // Toast is handled by the parent component on error
        // toast({
        //     variant: "destructive",
        //     title: "Error",
        //     description: error?.message || "Failed to submit grades. Please try again.",
        // });
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
                                     type="number"
                                     min="0"
                                     max="100"
                                     step="1" // Or "any" for decimals
                                     placeholder="Enter grade (0-100)"
                                     {...field}
                                     value={field.value ?? ""}
                                     onChange={(e) => {
                                        const val = e.target.value;
                                         // Allow empty string or valid numbers
                                         if (val === '' || (/^\d*$/.test(val) && Number(val) >= 0 && Number(val) <= 100)) {
                                             field.onChange(val);
                                         }
                                    }}
                                     />
                            </FormControl>
                             <FormMessage />
                             {/* Removed redundant text, placeholder is sufficient */}
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
                                     step="1" // Or "any"
                                     placeholder="Enter grade (0-100)"
                                     {...field}
                                     value={field.value ?? ""}
                                     onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (/^\d*$/.test(val) && Number(val) >= 0 && Number(val) <= 100)) {
                                             field.onChange(val);
                                         }
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
                                     step="1" // Or "any"
                                     placeholder="Enter grade (0-100)"
                                     {...field}
                                     value={field.value ?? ""}
                                     onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '' || (/^\d*$/.test(val) && Number(val) >= 0 && Number(val) <= 100)) {
                                             field.onChange(val);
                                         }
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
