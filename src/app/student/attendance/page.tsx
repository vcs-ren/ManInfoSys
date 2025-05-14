"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, XCircle, Clock, Info, Loader2, CalendarSearch } from "lucide-react";
import { format, parseISO } from "date-fns";

import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import type { AttendanceRecord, AttendanceStatus } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchData, USE_MOCK_API, getMockStudentAttendance } from "@/lib/api"; // Adjusted API imports

const attendanceStatusIcons: Record<AttendanceStatus, React.ElementType> = {
    Present: CheckCircle,
    Absent: XCircle,
    Late: Clock,
    Excused: Info,
};

const attendanceStatusColors: Record<AttendanceStatus, string> = {
    Present: "text-green-600",
    Absent: "text-red-600",
    Late: "text-orange-500",
    Excused: "text-blue-500",
};


export default function StudentAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const studentId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : 1; // Mock or get actual student ID

  React.useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        let data: AttendanceRecord[];
        if (USE_MOCK_API) {
          data = getMockStudentAttendance(studentId); // Use the helper
        } else {
          data = await fetchData<AttendanceRecord[]>(`/api/student/attendance/read.php`); // Real endpoint
        }
        setAttendanceRecords(data || []);
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not load attendance records." });
      } finally {
        setIsLoading(false);
      }
    };
    if (studentId) fetchAttendance();
  }, [toast, studentId]);

  const columns: ColumnDef<AttendanceRecord>[] = React.useMemo(() => [
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => format(parseISO(row.original.date), "PPP"), // Format date nicely
    },
    {
      accessorKey: "subjectName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
      cell: ({ row }) => row.original.subjectName || row.original.subjectId,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const StatusIcon = attendanceStatusIcons[row.original.status];
        const colorClass = attendanceStatusColors[row.original.status];
        return (
          <Badge variant={row.original.status === 'Present' ? 'default' : (row.original.status === 'Absent' ? 'destructive' : 'secondary')} className="capitalize">
             {StatusIcon && <StatusIcon className={cn("mr-1.5 h-3.5 w-3.5", colorClass)} />}
            {row.original.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "Teacher Remarks",
      cell: ({ row }) => row.original.remarks || <span className="text-muted-foreground italic">N/A</span>,
    },
  ], []);

  // Calculate summary
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'Absent').length;
  const lateDays = attendanceRecords.filter(r => r.status === 'Late').length;
  const excusedDays = attendanceRecords.filter(r => r.status === 'Excused').length;
  const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays * 0.5 + excusedDays * 0.8) / totalDays * 100).toFixed(1) : 0; // Example calculation


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarSearch className="mr-2 h-6 w-6 text-primary"/> My Attendance Records</CardTitle>
          <CardDescription>View your attendance history for all subjects.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading attendance...
            </div>
          ) : attendanceRecords.length > 0 ? (
            <>
             <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                <h3 className="text-lg font-semibold mb-2">Attendance Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm">
                    <div className="p-2 bg-background rounded border"><strong>Total Recorded:</strong> {totalDays} days</div>
                    <div className="p-2 bg-background rounded border text-green-700"><strong>Present:</strong> {presentDays} days</div>
                    <div className="p-2 bg-background rounded border text-red-700"><strong>Absent:</strong> {absentDays} days</div>
                    <div className="p-2 bg-background rounded border text-orange-600"><strong>Late:</strong> {lateDays} days</div>
                    <div className="p-2 bg-background rounded border text-blue-600"><strong>Excused:</strong> {excusedDays} days</div>
                </div>
                <p className="text-md font-semibold mt-3">Overall Attendance Rate: <span className="text-primary">{attendancePercentage}%</span></p>
                <p className="text-xs text-muted-foreground mt-1">(Note: This is an indicative percentage. Official calculation may vary.)</p>
              </div>
              <DataTable columns={columns} data={attendanceRecords} searchPlaceholder="Search by subject..." />
            </>
          ) : (
            <p className="text-center text-muted-foreground py-10">No attendance records found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
