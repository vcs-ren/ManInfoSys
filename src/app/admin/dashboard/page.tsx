// src/app/admin/dashboard/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, Loader2, ListChecks, RotateCcw, Briefcase, Megaphone } from "lucide-react"; // Added Megaphone
import * as React from 'react';
import {
    fetchData,
    postData,
    USE_MOCK_API,
    mockActivityLog,
    logActivity,
    executeUndoAddStudent,
    executeUndoDeleteStudent,
    executeUndoAddFaculty,
    executeUndoDeleteFaculty,
    executeUndoRemoveAdminRole,
    recalculateDashboardStats,
    mockDashboardStats,
    mockStudents, // Import mockStudents for direct length check
    mockFaculty, // Import mockFaculty for direct length check
    mockAnnouncements // Import mockAnnouncements for direct length check
} from "@/lib/api";
import type { DashboardStats, ActivityLogEntry, Student, Faculty, AdminUser, DepartmentType } from "@/types";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';


export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [activityLog, setActivityLog] = React.useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isActivityLoading, setIsActivityLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchDashboardData = React.useCallback(async () => {
      setIsLoading(true);
      setIsActivityLoading(true);
      setError(null);
      try {
        let statsData: DashboardStats | null = null;
        let activityDataResult: ActivityLogEntry[] = [];

        if (USE_MOCK_API) {
            recalculateDashboardStats();
            statsData = {
                totalStudents: mockStudents.length,
                totalTeachingStaff: mockFaculty.filter(f => f.department === 'Teaching').length,
                totalAdministrativeStaff: mockFaculty.filter(f => f.department === 'Administrative').length,
                totalEventsAnnouncements: mockAnnouncements.length,
            };
            activityDataResult = mockActivityLog.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0,10);
        } else {
            const [fetchedStats, fetchedActivities] = await Promise.all([
              fetchData<DashboardStats>('admin/dashboard-stats.php'),
              fetchData<ActivityLogEntry[]>('admin/activity-log/read.php')
            ]);
            statsData = fetchedStats;
            activityDataResult = fetchedActivities || [];
        }

        setStats(statsData);
        
        const uniqueActivityDataById = activityDataResult
            ? Array.from(new Map(activityDataResult.map(log => [log.id, log])).values())
            : [];
        setActivityLog(uniqueActivityDataById.map(log => ({ ...log, timestamp: new Date(log.timestamp) })));


      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data. Please try again later.");
        toast({ variant: "destructive", title: "Error Loading Data", description: err.message || "Could not load dashboard information." });
      } finally {
        setIsLoading(false);
        setIsActivityLoading(false);
      }
    }, [toast]);


  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCardClick = (path: string | null) => {
    if (path) {
        router.push(path);
    }
  };

 const handleUndoActivity = async (logId: string) => {
    setIsActivityLoading(true);
    try {
      const logEntry = USE_MOCK_API ? mockActivityLog.find(l => l.id === logId) : activityLog.find(l => l.id === logId);

      if (!logEntry) {
          throw new Error("Log entry not found.");
      }
      if (!logEntry.canUndo) {
          throw new Error("This action cannot be undone.");
      }

      let undoSuccess = false;
      let specificErrorMessage: string | null = null;

      if (USE_MOCK_API) {
          if (logEntry.action === "Added Student" && logEntry.targetType === "student") {
              if (logEntry.originalData && logEntry.targetId) {
                  executeUndoAddStudent(logEntry.targetId as number, logEntry.originalData as Student);
                  undoSuccess = true;
              } else { specificErrorMessage = "Missing data for undoing 'Added Student'."; }
          } else if (logEntry.action === "Deleted Student" && logEntry.targetType === "student") {
              if (logEntry.originalData) {
                  executeUndoDeleteStudent(logEntry.originalData as Student);
                  undoSuccess = true;
              } else { specificErrorMessage = "Missing data for undoing 'Deleted Student'."; }
          } else if (logEntry.action === "Added Faculty" && logEntry.targetType === "faculty") {
               if (logEntry.originalData && logEntry.targetId) {
                  const facultyData = logEntry.originalData as Faculty;
                  executeUndoAddFaculty(logEntry.targetId as number, facultyData);
                  undoSuccess = true;
              } else { specificErrorMessage = "Missing data for undoing 'Added Faculty'."; }
          } else if (logEntry.action === "Deleted Faculty" && logEntry.targetType === "faculty") {
              if (logEntry.originalData) {
                  executeUndoDeleteFaculty(logEntry.originalData as Faculty);
                  undoSuccess = true;
              } else { specificErrorMessage = "Missing data for undoing 'Deleted Faculty'."; }
          } else if (logEntry.action === "Removed Admin Role" && logEntry.targetType === "admin") {
                if (logEntry.originalData && logEntry.targetId) {
                  const adminData = logEntry.originalData as AdminUser & { originalDepartment?: DepartmentType };
                  undoSuccess = executeUndoRemoveAdminRole(adminData);
                   if(!undoSuccess) { specificErrorMessage = "Could not undo 'Removed Admin Role': Details in log."; }
              } else { specificErrorMessage = "Missing data for undoing 'Removed Admin Role'."; }
          } else {
              specificErrorMessage = `Mock: Undo for action type "${logEntry.action}" is not implemented.`;
          }
      } else {
          await postData('admin/activity-log/undo.php', { logId });
          undoSuccess = true;
      }

      if (undoSuccess) {
          toast({ title: "Action Undone", description: "The selected action has been successfully reverted." });
          // Remove the undone log entry from the local state to avoid re-display
          // and also from mockActivityLog for mock consistency
          if (USE_MOCK_API) {
                const indexInMockLog = mockActivityLog.findIndex(log => log.id === logId);
                if (indexInMockLog > -1) {
                    mockActivityLog.splice(indexInMockLog, 1);
                }
            }
          setActivityLog(prev => prev.filter(log => log.id !== logId));
          // Fetch fresh data to ensure UI consistency for the "Undone Action: ..." log and stats
          await fetchDashboardData();
      } else {
          throw new Error(specificErrorMessage || "Undo operation failed for an unknown reason.");
      }
    } catch (err: any) {
      console.error("Failed to undo activity:", err);
      toast({ variant: "destructive", title: "Undo Failed", description: err.message || "Could not undo the action." });
    } finally {
        setIsActivityLoading(false); // Ensure loading state is reset even on error
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {isLoading && !error && (
        <div className="flex items-center justify-center py-10">
             <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading dashboard data...
        </div>
      )}
      {error && <p className="text-destructive text-center py-4">{error}</p>}

      {stats && !isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card onClick={() => handleCardClick('/admin/students/population')} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>

           <Card onClick={() => handleCardClick('/admin/faculty/population')} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculty Staff</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachingStaff + stats.totalAdministrativeStaff}</div>
            </CardContent>
          </Card>

          <Card onClick={() => handleCardClick('/admin/assignments')} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events & Announcements</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEventsAnnouncements}</div>
            </CardContent>
          </Card>
        </div>
      )}
       <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <ListChecks className="h-6 w-6 text-primary" />
                    <CardTitle>Recent Activity</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={isActivityLoading || isLoading}>
                    {isActivityLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                    Refresh
                </Button>
            </div>
             <CardDescription>
                Overview of recent system actions. Some actions may be undoable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isActivityLoading && (!activityLog || activityLog.length === 0) ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" /> Loading activities...
                </div>
            ) : activityLog && activityLog.length > 0 ? (
                <ScrollArea className="h-[300px]">
                    <ul className="space-y-3">
                        {activityLog.map((log) => (
                        <li key={log.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-secondary/50 transition-colors">
                            <div>
                                <p className="text-sm font-medium">
                                    <span className="font-bold text-primary">{log.action}:</span> {log.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    By {log.user} - {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : 'Unknown time'}
                                </p>
                            </div>
                            {log.canUndo && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUndoActivity(log.id)}
                                className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                                disabled={isActivityLoading}
                                aria-label={`Undo action: ${log.action} - ${log.description}`}
                            >
                                <RotateCcw className="mr-1 h-3 w-3" /> Undo
                            </Button>
                            )}
                        </li>
                        ))}
                    </ul>
                </ScrollArea>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No recent activities found.</p>
            )}
          </CardContent>
       </Card>
    </div>
  );
}
