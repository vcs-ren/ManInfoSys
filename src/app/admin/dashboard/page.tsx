
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, CalendarDays, Loader2 } from "lucide-react"; // Added Loader2
import * as React from 'react';
import { fetchData } from "@/lib/api"; // Import the centralized API helper

// Interface for dashboard stats fetched from API
interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    upcomingEvents: number;
    // Add more stats as needed
}


export default function AdminDashboardPage() {
  // State for dashboard stats and loading/error handling
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch dashboard data from the backend API using the helper
  React.useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the fetchData helper with the relative PHP endpoint path
        const data = await fetchData<DashboardStats>('/api/admin/dashboard-stats.php');
        setStats(data);
      } catch (err: any) { // Catch specific error type if possible
        console.error("Failed to fetch dashboard stats:", err);
        setError(err.message || "Failed to load dashboard data. Please try again later.");
        // Optionally use toast here
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
             <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading dashboard data...
        </div>
      )}
      {error && <p className="text-destructive">{error}</p>}

      {stats && !isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              {/* <p className="text-xs text-muted-foreground">+20 from last month</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
              {/* <p className="text-xs text-muted-foreground">+5 from last month</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              {/* <p className="text-xs text-muted-foreground">View details in scheduler</p> */}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Placeholder for more dashboard components */}
       <Card>
          <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">Recent system activities will appear here.</p>
              {/* TODO: Fetch and display recent activity logs */}
          </CardContent>
       </Card>

       {/* PHP Backend API Snippet Removed */}

    </div>
  );
}
