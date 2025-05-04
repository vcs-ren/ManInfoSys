
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import type { Section, Subject, Teacher, SectionSubjectAssignment } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ManageSubjectsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
  subjects: Subject[];
  teachers: Teacher[];
  assignments: SectionSubjectAssignment[];
  onAddAssignment: (sectionId: string, subjectId: string, teacherId: number) => Promise<void> | void;
  onDeleteAssignment: (assignmentId: string) => Promise<void> | void;
  isLoadingAssignments: boolean;
  isLoadingSubjects: boolean;
  isLoadingTeachers: boolean;
}

export function ManageSubjectsModal({
  isOpen,
  onOpenChange,
  section,
  subjects,
  teachers,
  assignments,
  onAddAssignment,
  onDeleteAssignment,
  isLoadingAssignments,
  isLoadingSubjects,
  isLoadingTeachers,
}: ManageSubjectsModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("");
  const [isSubmittingAdd, setIsSubmittingAdd] = React.useState(false); // Local loading state for add
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null); // Track which assignment is being deleted
  const { toast } = useToast();

  const handleAddClick = async () => {
      if (!selectedSubjectId || !selectedTeacherId) {
          toast({ variant: "warning", title: "Selection Required", description: "Please select both a subject and a teacher." });
          return;
      }

      const teacherIdNum = parseInt(selectedTeacherId, 10);
      if (isNaN(teacherIdNum)) {
           toast({ variant: "destructive", title: "Error", description: "Invalid teacher selected." });
           return;
      }

      // Check if subject is already assigned
      if (assignments.some(a => a.subjectId === selectedSubjectId)) {
          toast({ variant: "warning", title: "Already Assigned", description: "This subject is already assigned to the section." });
          return;
      }

      setIsSubmittingAdd(true); // Start loading for add
      try {
          await onAddAssignment(section.id, selectedSubjectId, teacherIdNum);
          // Reset dropdowns only on successful add
          setSelectedSubjectId("");
          setSelectedTeacherId("");
      } catch (error) {
            // Error toast is handled by the calling component (AssignmentsAnnouncementsPage)
            console.error("Error during add assignment:", error);
      } finally {
          setIsSubmittingAdd(false); // Stop loading for add
      }
  };

    const handleDeleteClick = async (assignmentId: string) => {
        setIsDeletingId(assignmentId); // Start loading for delete specific item
        try {
             await onDeleteAssignment(assignmentId);
              // Success toast handled by calling component
        } catch (error) {
             // Error toast handled by calling component
             console.error("Error during delete assignment:", error);
        } finally {
             setIsDeletingId(null); // Stop loading for delete
        }
    };

    // Filter available subjects (subjects not already assigned to this section)
    const availableSubjects = React.useMemo(() => {
        const assignedSubjectIds = new Set(assignments.map(a => a.subjectId));
        return subjects.filter(s => !assignedSubjectIds.has(s.id));
    }, [subjects, assignments]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Manage Subjects for {section.sectionCode}</DialogTitle>
          <DialogDescription>
            Assign subjects and teachers for the {section.course} - {section.yearLevel} section.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 items-end">
          {/* Subject Selection */}
          <div className="space-y-1">
            <Label htmlFor="subject-select">Subject</Label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={isLoadingSubjects || isLoadingAssignments || isSubmittingAdd}>
              <SelectTrigger id="subject-select">
                <SelectValue placeholder="Select Subject..." />
              </SelectTrigger>
              <SelectContent>
                 {isLoadingSubjects ? (
                    <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
                 ) : availableSubjects.length > 0 ? (
                    availableSubjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))
                 ) : (
                    <SelectItem value="no-subjects" disabled>No unassigned subjects</SelectItem>
                 )}
              </SelectContent>
            </Select>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-1">
            <Label htmlFor="teacher-select">Teacher</Label>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId} disabled={isLoadingTeachers || isLoadingAssignments || isSubmittingAdd}>
              <SelectTrigger id="teacher-select">
                <SelectValue placeholder="Select Teacher..." />
              </SelectTrigger>
              <SelectContent>
                 {isLoadingTeachers ? (
                    <SelectItem value="loading" disabled>Loading teachers...</SelectItem>
                 ) : teachers.length > 0 ? (
                    teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={String(teacher.id)}>
                            {teacher.firstName} {teacher.lastName} ({teacher.department})
                        </SelectItem>
                    ))
                ) : (
                     <SelectItem value="no-teachers" disabled>No teachers available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Add Button */}
          <Button
            onClick={handleAddClick}
            disabled={!selectedSubjectId || !selectedTeacherId || isLoadingAssignments || isSubmittingAdd || isDeletingId !== null} // Disable if any operation is in progress
            className="md:self-end"
          >
             {isSubmittingAdd ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
             Assign Subject
          </Button>
        </div>

        {/* Assigned Subjects Table */}
        <div className="mt-4 space-y-2">
           <h4 className="font-medium">Current Assignments</h4>
           <ScrollArea className="h-[250px] border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Assigned Teacher</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoadingAssignments ? (
                    <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                         <span className="text-muted-foreground ml-2">Loading assignments...</span>
                    </TableCell>
                    </TableRow>
                ) : assignments.length > 0 ? (
                    assignments.map((assign) => (
                    <TableRow key={assign.id}>
                        <TableCell className="font-medium">{assign.subjectName || assign.subjectId}</TableCell>
                        <TableCell>{assign.teacherName || `Teacher ID: ${assign.teacherId}`}</TableCell>
                        <TableCell className="text-right">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(assign.id)}
                             // Disable if this specific item is being deleted or if an add is in progress
                            disabled={isLoadingAssignments || isSubmittingAdd || isDeletingId === assign.id}
                            aria-label={`Remove assignment ${assign.id}`}
                        >
                           {isDeletingId === assign.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                           ) : (
                                <Trash2 className="h-4 w-4" />
                           )}
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                        No subjects assigned yet.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </ScrollArea>
        </div>


        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoadingAssignments || isSubmittingAdd || isDeletingId !== null}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
