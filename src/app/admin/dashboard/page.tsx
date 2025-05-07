
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, CalendarDays, Loader2, ShieldAlert } from "lucide-react"; // Added ShieldAlert
import * as React from 'react';
import { fetchData } from "@/lib/api";
import type { DashboardStats } from "@/types";
import Link from "next/link"; // Import Link
import { useRouter } from 'next/navigation';


export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the correct relative path
        const data = await fetchData<DashboardStats>('admin/dashboard-stats.php');
        setStats(data);
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats:", err);
        setError(err.message || "Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
             <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading dashboard data...
        </div>
      )}
      {error && <p className="text-destructive text-center py-4">{error}</p>}

      {stats && !isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> {/* Adjusted for 4 cards */}
          <Card onClick={() => handleCardClick('/admin/students')} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card onClick={() => handleCardClick('/admin/teachers')} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            </CardContent>
          </Card>
           <Card onClick={() => handleCardClick('/admin/admins')} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAdmins}</div>
            </CardContent>
          </Card>
          <Card onClick={() => handleCardClick('/admin/assignments')} className="cursor-pointer hover:shadow-md transition-shadow"> {/* Assuming assignments is for upcoming events/tasks */}
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
              <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">Recent system activities will appear here.</p>
              {/* TODO: Fetch and display recent activity logs */}
          </CardContent>
       </Card>
    </div>
  );
}

    