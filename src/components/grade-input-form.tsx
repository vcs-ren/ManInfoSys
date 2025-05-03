
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
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea component exists
import { useToast } from "@/hooks/use-toast";
import type { Grade, Student } from "@/types";
import { gradeSchema } from "@/lib/schemas";
import { Loader2 } from "lucide-react";
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


type GradeFormValues = z.infer<typeof gradeSchema>;

interface GradeInputFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student; // Student for whom the grade is being entered
  subject?: string; // Pre-fill subject if needed
  initialGradeData?: Partial<Grade>; // For editing existing grade
  onSubmit: (values: GradeFormValues) => Promise<void> | void;
}

export function GradeInputForm({
  isOpen,
  onOpenChange,
  student,
  subject,
  initialGradeData,
  onSubmit,
}: GradeInputFormProps) {
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [formData, setFormData] = React.useState<GradeFormValues | null>(null);

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      subject: initialGradeData?.subject || subject || "",
      grade: initialGradeData?.grade ?? "", // Use empty string for initial number field to avoid '0' display
      remarks: initialGradeData?.remarks || "",
    },
  });

   // Reset form when dialog opens or initial data changes
    React.useEffect(() => {
        if (isOpen) {
            form.reset({
                subject: initialGradeData?.subject || subject || "",
                grade: initialGradeData?.grade ?? "",
                remarks: initialGradeData?.remarks || "",
            });
            setIsConfirming(false); // Reset confirmation state
            setFormData(null);
        }
    }, [isOpen, initialGradeData, subject, form]);

  const handleAttemptSubmit = (values: GradeFormValues) => {
     // Basic auto-computation (example: Convert numeric to letter grade if needed)
     // This is highly dependent on the grading system.
     // let computedGrade = values.grade;
     // if (typeof computedGrade === 'number') {
     //     if (computedGrade >= 90) computedGrade = 'A';
     //     else if (computedGrade >= 80) computedGrade = 'B';
     //     // ... add more ranges ...
     //     else computedGrade = 'F';
     // }
     // values.grade = computedGrade; // Update the value if computation is done


    console.log("Grade data before confirmation:", values);
    setFormData(values); // Store data for confirmation
    setIsConfirming(true); // Trigger the confirmation dialog
  };

  const handleConfirmSubmit = async () => {
    if (!formData) return;

    try {
      await onSubmit(formData); // Call the actual submit function passed via props
      toast({
        title: "Success",
        description: `Grade submitted successfully for ${student.firstName} ${student.lastName}.`,
      });
      onOpenChange(false); // Close main dialog
    } catch (error) {
      console.error("Grade submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to submit grade. Please try again.`,
      });
    } finally {
        setIsConfirming(false); // Close confirmation dialog regardless of outcome
        setFormData(null);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialGradeData ? 'Edit Grade' : 'Submit Grade'} for {student.firstName} {student.lastName}
          </DialogTitle>
          <DialogDescription>
            Enter the grade details below. Student ID: {student.studentId}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAttemptSubmit)} className="space-y-4 py-4">
             <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mathematics 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                     {/* Input allows string or number, validation handles format */}
                    <Input placeholder="e.g., 85, B+, P, INC" {...field} />
                  </FormControl>
                   <FormMessage />
                    <p className="text-xs text-muted-foreground">Enter numeric grade (e.g., 75) or letter grade (e.g., A-, B+, P, F, INC, DRP).</p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any relevant remarks here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Grade'}
                </Button>
            </DialogFooter>

          </form>
        </Form>

          {/* Confirmation Dialog */}
           <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Grade Submission</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please review the grade details before confirming:
                        <div className="mt-4 space-y-1 text-sm text-foreground bg-secondary p-3 rounded-md border">
                            <p><strong>Student:</strong> {student.firstName} {student.lastName} ({student.studentId})</p>
                            <p><strong>Subject:</strong> {formData?.subject}</p>
                            <p><strong>Grade:</strong> {formData?.grade}</p>
                            <p><strong>Remarks:</strong> {formData?.remarks || "N/A"}</p>
                        </div>
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={form.formState.isSubmitting}>Edit</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmSubmit} disabled={form.formState.isSubmitting}>
                         {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...</> : 'Confirm and Submit'}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
