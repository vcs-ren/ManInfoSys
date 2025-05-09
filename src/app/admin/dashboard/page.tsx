
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, CalendarDays, Loader2, ListChecks, RotateCcw, Briefcase } from "lucide-react"; // Added Briefcase for Faculty
import * as React from 'react';
import { fetchData, postData } from "@/lib/api";
import type { DashboardStats, ActivityLogEntry } from "@/types";
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
        const [statsData, activityData] = await Promise.all([
          fetchData<DashboardStats>('admin/dashboard-stats.php'),
          fetchData<ActivityLogEntry[]>('admin/activity-log/read.php')
        ]);
        setStats(statsData);
        setActivityLog(activityData ? activityData.map(log => ({ ...log, timestamp: new Date(log.timestamp) })) : []);
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data. Please try again later.");
        toast({ variant: "destructive", title: "Error Loading Data", description: err.message || "Could not load dashboard information." });
      } finally {
        setIsLoading(false);
        setIsActivityLoading(false);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await postData('admin/activity-log/undo.php', { logId });
      toast({ title: "Action Undone", description: "The selected action has been reverted." });
      // Refetch activity log and stats to reflect changes
      await fetchDashboardData();
    } catch (err: any) {
      console.error("Failed to undo activity:", err);
      toast({ variant: "destructive", title: "Undo Failed", description: err.message || "Could not undo the action." });
      setIsActivityLoading(false); // Stop loading only if error, success will refetch
    }
    // setIsLoading will be handled by fetchDashboardData
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> {/* Adjusted grid to 3 columns */}
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
              <CardTitle className="text-sm font-medium">Faculty Staff</CardTitle> {/* New Card */}
              <Briefcase className="h-4 w-4 text-muted-foreground" /> {/* Icon for Faculty */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFaculty}</div>
            </CardContent>
          </Card>

          <Card onClick={() => handleCardClick('/admin/assignments')} className="cursor-pointer hover:shadow-md transition-shadow"> {/* Assuming assignments covers tasks */}
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
