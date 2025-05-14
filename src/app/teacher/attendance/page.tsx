"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, XCircle, Clock, Info, Loader2, CalendarIcon, UserCheck, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import type { Student, TeacherClassInfo, AttendanceStatus, StudentAttendanceData, AttendanceRecord } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { fetchData, postData, USE_MOCK_API, getMockStudentsForClass, saveMockAttendance, mockTeacherClasses, mockAttendanceRecords } from "@/lib/api"; // Adjusted API imports


const attendanceStatusOptions: { value: AttendanceStatus; label: string; icon?: React.ElementType }[] = [
    { value: "Present", label: "Present", icon: CheckCircle },
    { value: "Absent", label: "Absent", icon: XCircle },
    { value: "Late", label: "Late", icon: Clock },
    { value: "Excused", label: "Excused", icon: Info },
];

export default function TeacherAttendancePage() {
  const [teacherClasses, setTeacherClasses] = React.useState<TeacherClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = React.useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [studentsForClass, setStudentsForClass] = React.useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = React.useState<Map<number, StudentAttendanceData>>(new Map());

  const [isLoadingClasses, setIsLoadingClasses] = React.useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = React.useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = React.useState(false);

  const { toast } = useToast();
  const teacherId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : 1; // Mock or get actual teacher ID


  // Fetch teacher's classes
  React.useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        let classesData: TeacherClassInfo[];
        if (USE_MOCK_API) {
          // Ensure mockTeacherClasses is populated based on assignments
          // This might need adjustment if mockTeacherClasses isn't directly set up by default
          classesData = mockTeacherClasses.filter(tc => mockSectionAssignments.some(sa => sa.id === tc.id && sa.teacherId === teacherId));
          if (classesData.length === 0 && mockTeacherClasses.length > 0 && teacherId === 1) { // Fallback for default mock teacher 1
            classesData = mockTeacherClasses;
          }
        } else {
          classesData = await fetchData<TeacherClassInfo[]>(`/api/teacher/classes/read.php`); // Actual endpoint
        }
        setTeacherClasses(classesData || []);
        if (classesData && classesData.length > 0) {
            // setSelectedClassId(classesData[0].id); // Auto-select first class
        }
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error fetching classes", description: error.message });
      } finally {
        setIsLoadingClasses(false);
      }
    };
    if (teacherId) fetchClasses();
  }, [toast, teacherId]);

  // Fetch students and existing attendance when class or date changes
  React.useEffect(() => {
    if (!selectedClassId || !selectedDate || !teacherClasses.length) {
        setStudentsForClass([]);
        setAttendanceData(new Map());
        return;
    }

    const fetchStudentsAndAttendance = async () => {
      setIsLoadingStudents(true);
      const currentClass = teacherClasses.find(tc => tc.id === selectedClassId);
      if (!currentClass) {
          setIsLoadingStudents(false);
          return;
      }

      try {
        let fetchedStudents: Student[];
        let fetchedAttendance: AttendanceRecord[] = [];

        if (USE_MOCK_API) {
          fetchedStudents = getMockStudentsForClass(currentClass.sectionId);
          // Simulate fetching existing attendance for this class and date
          const dateString = format(selectedDate, 'yyyy-MM-dd');
          fetchedAttendance = mockAttendanceRecords.filter(
            r => r.subjectId === currentClass.subjectId && r.sectionId === currentClass.sectionId && r.date === dateString
          );

        } else {
          fetchedStudents = await fetchData<Student[]>(`/api/attendance/class/students?sectionId=${currentClass.sectionId}`);
          fetchedAttendance = await fetchData<AttendanceRecord[]>(`/api/attendance/class/records?classId=${selectedClassId}&date=${format(selectedDate, 'yyyy-MM-dd')}`);
        }
        
        setStudentsForClass(fetchedStudents || []);
        
        const newAttendanceMap = new Map<number, StudentAttendanceData>();
        (fetchedStudents || []).forEach(student => {
            const existingRecord = (fetchedAttendance || []).find(rec => rec.studentId === student.id);
            newAttendanceMap.set(student.id, {
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                status: existingRecord?.status || "Present", // Default to Present
                remarks: existingRecord?.remarks || "",
            });
        });
        setAttendanceData(newAttendanceMap);

      } catch (error: any) {
        toast({ variant: "destructive", title: "Error fetching student data", description: error.message });
        setStudentsForClass([]);
        setAttendanceData(new Map());
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [selectedClassId, selectedDate, toast, teacherClasses]);


  const handleAttendanceChange = (studentId: number, field: 'status' | 'remarks', value: string) => {
    setAttendanceData(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(studentId);
      if (current) {
        newMap.set(studentId, { ...current, [field]: value });
      }
      return newMap;
    });
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || !selectedDate || attendanceData.size === 0) {
      toast({ variant: "default", title: "No Data", description: "Please select a class, date, and ensure there are students." });
      return;
    }
    setIsSubmittingAttendance(true);
    const currentClass = teacherClasses.find(tc => tc.id === selectedClassId);
    if(!currentClass) {
         toast({ variant: "destructive", title: "Error", description: "Selected class details not found." });
         setIsSubmittingAttendance(false);
         return;
    }

    const payload = Array.from(attendanceData.values());
    
    try {
        if (USE_MOCK_API) {
            saveMockAttendance(teacherId, currentClass, selectedDate, payload);
        } else {
             await postData(`/api/attendance/save.php`, {
                teacherId: teacherId, // Include teacherId
                classInfo: currentClass, // Pass classInfo (id, subjectId, sectionId etc.)
                date: format(selectedDate, 'yyyy-MM-dd'), // Date as string
                studentAttendances: payload
            });
        }
      toast({ title: "Attendance Saved", description: "Attendance records have been successfully saved." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message });
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  const columns: ColumnDef<StudentAttendanceData>[] = React.useMemo(() => [
    {
      accessorKey: "studentName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Student Name" />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const studentId = row.original.studentId;
        const currentStatus = attendanceData.get(studentId)?.status || "Present";
        return (
          <Select
            value={currentStatus}
            onValueChange={(value) => handleAttendanceChange(studentId, 'status', value as AttendanceStatus)}
            disabled={isLoadingStudents || isSubmittingAttendance}
          >
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {attendanceStatusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center">
                    {opt.icon && <opt.icon className={cn("mr-2 h-4 w-4", 
                        opt.value === "Present" ? "text-green-600" :
                        opt.value === "Absent" ? "text-red-600" :
                        opt.value === "Late" ? "text-orange-500" :
                        "text-blue-500"
                    )} />}
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const studentId = row.original.studentId;
        const currentRemarks = attendanceData.get(studentId)?.remarks || "";
        return (
          <Input
            value={currentRemarks}
            onChange={(e) => handleAttendanceChange(studentId, 'remarks', e.target.value)}
            placeholder="Optional remarks..."
            className="h-9 text-xs"
            disabled={isLoadingStudents || isSubmittingAttendance}
          />
        );
      },
    },
  ], [attendanceData, handleAttendanceChange, isLoadingStudents, isSubmittingAttendance]);

  const studentDataForTable = React.useMemo(() => {
    return studentsForClass.map(student => {
        const attEntry = attendanceData.get(student.id);
        return {
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName} (${student.studentId})`,
            status: attEntry?.status || "Present", // Default or actual
            remarks: attEntry?.remarks || "",
        };
    });
  }, [studentsForClass, attendanceData]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserCheck className="mr-2 h-6 w-6 text-primary"/> Class Attendance</CardTitle>
          <CardDescription>Select a class and date to mark student attendance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class-select">Select Class</Label>
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
                disabled={isLoadingClasses || teacherClasses.length === 0}
              >
                <SelectTrigger id="class-select" className="h-10">
                  <SelectValue placeholder={isLoadingClasses ? "Loading classes..." : "Select a class"} />
                </SelectTrigger>
                <SelectContent>
                  {teacherClasses.length === 0 && !isLoadingClasses ? (
                     <SelectItem value="no-class" disabled>No classes assigned to you.</SelectItem>
                  ) : (
                    teacherClasses.map(tc => (
                        <SelectItem key={tc.id} value={tc.id}>
                        {tc.subjectName} - {tc.sectionCode} ({tc.yearLevel})
                        </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-picker">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-picker"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !selectedDate && "text-muted-foreground"
                    )}
                    disabled={!selectedClassId}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {isLoadingStudents && selectedClassId && selectedDate && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading students...
            </div>
          )}

          {!isLoadingStudents && selectedClassId && selectedDate && studentsForClass.length > 0 && (
            <>
              <DataTable columns={columns} data={studentDataForTable} />
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveAttendance} disabled={isSubmittingAttendance || studentsForClass.length === 0}>
                  {isSubmittingAttendance ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Attendance
                </Button>
              </div>
            </>
          )}
           {!isLoadingStudents && selectedClassId && selectedDate && studentsForClass.length === 0 && (
            <p className="text-center text-muted-foreground py-6">No students found for the selected class or section has no students.</p>
           )}
           {!selectedClassId && !isLoadingClasses && (
             <p className="text-center text-muted-foreground py-6">Please select a class to view students.</p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
