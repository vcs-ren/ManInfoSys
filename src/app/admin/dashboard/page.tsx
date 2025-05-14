
// src/app/admin/dashboard/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, Loader2, ListChecks, RotateCcw, Briefcase, Megaphone } from "lucide-react";
import * as React from 'react';
import {
    fetchData,
    postData,
    USE_MOCK_API,
    logActivity,
    // Removed mock data imports, will rely on backend
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
  const [isCurrentUserSuperAdmin, setIsCurrentUserSuperAdmin] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      setIsCurrentUserSuperAdmin(userId === '0'); // Super Admin ID is 0
    }
  }, []);

  const fetchDashboardData = React.useCallback(async () => {
      setIsLoading(true);
      setIsActivityLoading(true);
      setError(null);
      try {
        let statsData: DashboardStats | null = null;
        let activityDataResult: ActivityLogEntry[] = [];

        // Always fetch from backend now
        const [fetchedStats, fetchedActivities] = await Promise.all([
          fetchData<DashboardStats>('admin/dashboard-stats.php'),
          isCurrentUserSuperAdmin ? fetchData<ActivityLogEntry[]>('admin/activity-log/read.php') : Promise.resolve([])
        ]);
        statsData = fetchedStats;
        activityDataResult = fetchedActivities || [];
        
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
    }, [toast, isCurrentUserSuperAdmin]);


  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCardClick = (path: string | null, departmentFilter?: DepartmentType) => {
    if (path) {
        if (departmentFilter) {
            router.push(`${path}?department=${departmentFilter}`);
        } else {
            router.push(path);
        }
    }
  };

 const handleUndoActivity = async (logId: string) => {
    if (!isCurrentUserSuperAdmin) {
        toast({ variant: "destructive", title: "Unauthorized", description: "Only Super Admins can undo actions." });
        return;
    }
    setIsActivityLoading(true);
    try {
      // The backend 'admin/activity-log/undo.php' is responsible for the actual undo logic.
      // The frontend just calls this endpoint.
      await postData('admin/activity-log/undo.php', { logId });
      
      toast({ title: "Undo Action Initiated", description: "The request to undo the action has been sent." });
      
      // Refresh data to reflect changes
      await fetchDashboardData(); 

    } catch (err: any) {
      console.error("Failed to undo activity:", err);
      toast({ variant: "destructive", title: "Undo Failed", description: err.message || "Could not undo the action. The backend might not support this action or an error occurred." });
    } finally {
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
       {isCurrentUserSuperAdmin && (
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
                    <p className="text-sm text-muted-foreground text-center py-10">No recent activities found or unable to load activity log.</p>
                )}
            </CardContent>
        </Card>
       )}
    </div>
  );
}

