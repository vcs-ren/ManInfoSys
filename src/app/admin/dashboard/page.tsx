
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, Loader2, ListChecks, RotateCcw, Briefcase, ShieldCheck } from "lucide-react";
import * as React from 'react';
import { fetchData, postData, USE_MOCK_API, mockDashboardStats, mockActivityLog, logActivity, mockStudents, mockFaculty, mockApiAdmins, mockSections, recalculateDashboardStats } from "@/lib/api";
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
            recalculateDashboardStats(); // Ensure stats are up-to-date before fetching
            statsData = mockDashboardStats;
            // Ensure mockActivityLog is treated as the source of truth and sliced/sorted
            activityDataResult = [...mockActivityLog].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0,10);
        } else {
            const [fetchedStats, fetchedActivities] = await Promise.all([
              fetchData<DashboardStats>('admin/dashboard-stats.php'),
              fetchData<ActivityLogEntry[]>('admin/activity-log/read.php')
            ]);
            statsData = fetchedStats;
            activityDataResult = fetchedActivities || [];
        }
        
        setStats(statsData);

        // Deduplication step
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
      if (USE_MOCK_API) {
        const logEntryIndex = mockActivityLog.findIndex(l => l.id === logId);

        if (logEntryIndex === -1) {
            throw new Error("Log entry not found.");
        }
        
        const logEntry = mockActivityLog[logEntryIndex];

        if (!logEntry.canUndo) {
            throw new Error("This action cannot be undone.");
        }

        let undoSuccess = false;
        let specificErrorMessage: string | null = null; // For errors specific to undo logic

        // Specific Undo Logic
        if (logEntry.action === "Added Student" && logEntry.targetType === "student") {
            if (logEntry.originalData && logEntry.targetId) {
                const studentIdToUndo = logEntry.targetId as number;
                const studentDataToUndo = logEntry.originalData as Student;
                mockStudents = mockStudents.filter(s => s.id !== studentIdToUndo);
                const sectionToUpdate = mockSections.find(s => s.id === studentDataToUndo.section);
                if (sectionToUpdate) {
                    sectionToUpdate.studentCount = mockStudents.filter(s => s.section === studentDataToUndo.section).length;
                }
                undoSuccess = true;
            } else {
                specificErrorMessage = "Missing original data or target ID for undoing 'Added Student'.";
            }
        } else if (logEntry.action === "Deleted Student" && logEntry.targetType === "student") {
            if (logEntry.originalData) {
                const studentDataToRestore = logEntry.originalData as Student;
                if (!mockStudents.some(s => s.id === studentDataToRestore.id)) mockStudents.push(studentDataToRestore);
                const sectionToUpdate = mockSections.find(s => s.id === studentDataToRestore.section);
                if (sectionToUpdate) {
                    sectionToUpdate.studentCount = mockStudents.filter(s => s.section === studentDataToRestore.section).length;
                }
                undoSuccess = true;
            } else {
                specificErrorMessage = "Missing original data for undoing 'Deleted Student'.";
            }
        } else if (logEntry.action === "Added Faculty" && logEntry.targetType === "faculty") {
             if (logEntry.originalData && logEntry.targetId) {
                const facultyData = logEntry.originalData as Faculty;
                mockFaculty = mockFaculty.filter(f => f.id !== (logEntry.targetId as number));
                if (facultyData.department === 'Administrative') {
                    mockApiAdmins = mockApiAdmins.filter(a => a.id !== (logEntry.targetId as number));
                }
                undoSuccess = true;
            } else {
                specificErrorMessage = "Missing original data or target ID for undoing 'Added Faculty'.";
            }
        } else if (logEntry.action === "Deleted Faculty" && logEntry.targetType === "faculty") {
            if (logEntry.originalData) {
                const facultyData = logEntry.originalData as Faculty;
                if (!mockFaculty.some(f => f.id === facultyData.id)) mockFaculty.push(facultyData);
                if (facultyData.department === 'Administrative') {
                    if (!mockApiAdmins.some(a => a.id === facultyData.id)) {
                       mockApiAdmins.push({
                           id: facultyData.id, username: facultyData.username, firstName: facultyData.firstName,
                           lastName: facultyData.lastName, email: facultyData.email, role: 'Sub Admin', isSuperAdmin: false
                       });
                    }
                }
                undoSuccess = true;
            } else {
                specificErrorMessage = "Missing original data for undoing 'Deleted Faculty'.";
            }
        } else if (logEntry.action === "Removed Admin Role" && logEntry.targetType === "admin") {
            if (logEntry.originalData && logEntry.targetId) {
                const adminData = logEntry.originalData as AdminUser & { originalDepartment?: DepartmentType };
                const facultyMember = mockFaculty.find(f => f.id === adminData.id);
                if (facultyMember) {
                    facultyMember.department = adminData.originalDepartment || 'Administrative';
                    if (!mockApiAdmins.some(a => a.id === adminData.id)) {
                        mockApiAdmins.push({ // Reconstruct AdminUser object
                            id: adminData.id, username: adminData.username, firstName: adminData.firstName,
                            lastName: adminData.lastName, email: adminData.email, role: 'Sub Admin', isSuperAdmin: false
                        });
                    }
                    undoSuccess = true;
                } else {
                     // This case might be for an admin that was *not* faculty-derived
                     // For now, this is unlikely with current logic where sub-admins are from faculty
                     if (!mockApiAdmins.some(a => a.id === adminData.id)) { // Check if it was an explicit admin
                         mockApiAdmins.push(adminData); // Add back the AdminUser
                         undoSuccess = true;
                     } else {
                        specificErrorMessage = "Could not undo 'Removed Admin Role': Corresponding faculty member not found, and admin user already exists or was not an explicit admin entry.";
                     }
                }
            } else {
                 specificErrorMessage = "Missing original data or target ID for undoing 'Removed Admin Role'.";
            }
        } else {
            // If canUndo was true but no specific handler was found for this action type
            specificErrorMessage = `Mock: Undo for action type "${logEntry.action}" is not implemented.`;
        }

        if (undoSuccess) {
            mockActivityLog.splice(logEntryIndex, 1); // Remove the original log entry
            recalculateDashboardStats();
            logActivity("Action Undone", `Reverted: ${logEntry.action} - ${logEntry.description}`, "System"); // Log the undo itself
            toast({ title: "Action Undone", description: "The selected action has been successfully reverted." });
        } else {
            // This means undo failed either due to missing data or unimplemented handler
            throw new Error(specificErrorMessage || "Undo operation failed for an unknown reason.");
        }
      } else { // Real API call
        // This part would interact with your PHP backend
        await postData('admin/activity-log/undo.php', { logId });
        toast({ title: "Action Undone", description: "The selected action has been reverted (via API)." });
      }
      // Refresh data after undo attempt (success or if API was called and succeeded/failed)
      // For mock, this re-renders the list based on the modified mockActivityLog.
      await fetchDashboardData(); 
    } catch (err: any) {
      console.error("Failed to undo activity:", err);
      toast({ variant: "destructive", title: "Undo Failed", description: err.message || "Could not undo the action." });
      // Ensure loading state is reset if an error occurs before fetchDashboardData or within it
      setIsActivityLoading(false);
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
              <div className="text-2xl font-bold">{stats.totalFaculty}</div>
            </CardContent>
          </Card>
          
          <Card className="cursor-not-allowed opacity-75">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events/Tasks</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
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

