
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
import type { Section, Subject, Faculty, SectionSubjectAssignment } from "@/types"; // Renamed Teacher to Faculty
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ManageSubjectsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section;
  subjects: Subject[];
  teachers: Faculty[]; // Use Faculty type
  assignments: SectionSubjectAssignment[];
  onAddAssignment: (sectionId: string, subjectId: string, teacherId: number) => Promise<void> | void;
  onDeleteAssignment: (assignmentId: string) => Promise<void> | void;
  isLoadingAssignments: boolean;
  isLoadingSubjects: boolean;
  isLoadingTeachers: boolean; // Renamed from isLoadingTeachers to isLoadingFaculty
}

export function ManageSubjectsModal({
  isOpen,
  onOpenChange,
  section,
  subjects,
  teachers: faculty, // Rename variable for clarity
  assignments,
  onAddAssignment,
  onDeleteAssignment,
  isLoadingAssignments,
  isLoadingSubjects,
  isLoadingTeachers: isLoadingFaculty, // Rename variable
}: ManageSubjectsModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>(""); // Keep as teacherId for backend compatibility
  const [isSubmittingAdd, setIsSubmittingAdd] = React.useState(false);
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleAddClick = async () => {
      if (!selectedSubjectId || !selectedTeacherId) {
          toast({ variant: "warning", title: "Selection Required", description: "Please select both a course(subject) and a faculty member." }); // Updated message
          return;
      }

      const teacherIdNum = parseInt(selectedTeacherId, 10);
      if (isNaN(teacherIdNum)) {
           toast({ variant: "destructive", title: "Error", description: "Invalid faculty selected." }); // Updated message
           return;
      }

      if (assignments.some(a => a.subjectId === selectedSubjectId)) {
          toast({ variant: "warning", title: "Already Assigned", description: "This course(subject) is already assigned to the section." });
          return;
      }

      setIsSubmittingAdd(true);
      try {
          await onAddAssignment(section.id, selectedSubjectId, teacherIdNum);
          setSelectedSubjectId("");
          setSelectedTeacherId("");
      } catch (error) {
            console.error("Error during add assignment:", error);
      } finally {
          setIsSubmittingAdd(false);
      }
  };

    const handleDeleteClick = async (assignmentId: string) => {
        setIsDeletingId(assignmentId);
        try {
             await onDeleteAssignment(assignmentId);
        } catch (error) {
             console.error("Error during delete assignment:", error);
        } finally {
             setIsDeletingId(null);
        }
    };

    const availableSubjects = React.useMemo(() => {
        const assignedSubjectIds = new Set(assignments.map(a => a.subjectId));
        return subjects.filter(s => !assignedSubjectIds.has(s.id));
    }, [subjects, assignments]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Manage Courses(subjects) for {section.sectionCode}</DialogTitle>
          <DialogDescription>
            Assign courses(subjects) and faculty members for the {section.programName} - {section.yearLevel} section. {/* Updated "teachers" to "faculty members" */}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 items-end">
          {/* Subject Selection */}
          <div className="space-y-1">
            <Label htmlFor="subject-select">Course(subject)</Label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={isLoadingSubjects || isLoadingAssignments || isSubmittingAdd}>
              <SelectTrigger id="subject-select">
                <SelectValue placeholder="Select Course(subject)..." />
              </SelectTrigger>
              <SelectContent>
                 {isLoadingSubjects ? (
                    <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                 ) : availableSubjects.length > 0 ? (
                    availableSubjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))
                 ) : (
                    <SelectItem value="no-subjects" disabled>No unassigned courses(subjects)</SelectItem>
                 )}
              </SelectContent>
            </Select>
          </div>

          {/* Faculty Selection */}
          <div className="space-y-1">
            <Label htmlFor="faculty-select">Faculty</Label> {/* Updated label */}
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId} disabled={isLoadingFaculty || isLoadingAssignments || isSubmittingAdd}> {/* Updated disabled prop */}
              <SelectTrigger id="faculty-select">
                <SelectValue placeholder="Select Faculty..." /> {/* Updated placeholder */}
              </SelectTrigger>
              <SelectContent>
                 {isLoadingFaculty ? ( // Updated loading check
                    <SelectItem value="loading" disabled>Loading faculty...</SelectItem> // Updated message
                 ) : faculty.length > 0 ? ( // Use faculty variable
                    faculty.map((facultyMember) => ( // Iterate over faculty
                        <SelectItem key={facultyMember.id} value={String(facultyMember.id)}>
                            {facultyMember.firstName} {facultyMember.lastName} ({facultyMember.department}) {/* Display faculty details */}
                        </SelectItem>
                    ))
                ) : (
                     <SelectItem value="no-faculty" disabled>No faculty available</SelectItem> // Updated message
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Add Button */}
          <Button
            onClick={handleAddClick}
            disabled={!selectedSubjectId || !selectedTeacherId || isLoadingAssignments || isSubmittingAdd || isDeletingId !== null}
            className="md:self-end"
          >
             {isSubmittingAdd ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
             Assign Course(subject)
          </Button>
        </div>

        {/* Assigned Subjects Table */}
        <div className="mt-4 space-y-2">
           <h4 className="font-medium">Current Assignments</h4>
           <ScrollArea className="h-[250px] border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Course(subject)</TableHead>
                    <TableHead>Assigned Faculty</TableHead> {/* Updated header */}
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
                        <TableCell>{assign.teacherName || `Faculty ID: ${assign.teacherId}`}</TableCell> {/* Updated text */}
                        <TableCell className="text-right">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(assign.id)}
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
                        No courses(subjects) assigned yet.
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

    