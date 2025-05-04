
"use client"; // Mark as Client Component

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Bell, Loader2 } from "lucide-react";
import type { Announcement } from "@/types"; // Assuming ScheduleEntry type exists - removed as UpcomingItem is simpler
import { fetchData } from "@/lib/api"; // Import the centralized API helper

// Interface for upcoming items (simplified)
interface UpcomingItem {
    id: string;
    title: string;
    date?: string; // Date might be string from API
    type: string; // Keep type flexible
}

export default function StudentDashboardPage() {
    const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
    const [upcomingItems, setUpcomingItems] = React.useState<UpcomingItem[]>([]);
    const [isLoadingAnnouncements, setIsLoadingAnnouncements] = React.useState(true);
    const [isLoadingUpcoming, setIsLoadingUpcoming] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoadingAnnouncements(true);
            setIsLoadingUpcoming(true);
            setError(null);
            try {
                // Fetch announcements using the helper
                const announcementsData = await fetchData<Announcement[]>('/api/student/announcements/read.php');
                setAnnouncements(announcementsData || []);

                // Fetch upcoming items using the helper
                const upcomingData = await fetchData<UpcomingItem[]>('/api/student/upcoming/read.php');
                setUpcomingItems(upcomingData || []);

            } catch (err: any) {
                console.error("Failed to load dashboard data:", err);
                setError(err.message || "Could not load dashboard information. Please try again later.");
                // Optionally use toast here
            } finally {
                setIsLoadingAnnouncements(false);
                setIsLoadingUpcoming(false);
            }
        };

        loadDashboardData();
    }, []); // Empty dependency array runs once on mount


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>

        {error && <p className="text-destructive">{error}</p>}

        <Card>
            <CardHeader className="flex flex-row items-center space-x-4 space-y-0">
                 <Megaphone className="h-6 w-6 text-primary" />
                 <div>
                    <CardTitle>Announcements</CardTitle>
                    <CardDescription>Updates from Admin and Teachers</CardDescription>
                 </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 {isLoadingAnnouncements ? (
                     <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" /> Loading announcements...
                     </div>
                 ) : announcements.length > 0 ? (
                    announcements.map(announcement => (
                        <div key={announcement.id} className={`p-3 border rounded-md ${announcement.author === 'Admin' ? 'bg-accent/50' : 'bg-secondary'}`}>
                             <p className="font-semibold">
                                <span className={`text-xs font-medium mr-2 px-1.5 py-0.5 rounded ${announcement.author === 'Admin' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-background'}`}>
                                    {announcement.author || 'SYSTEM'}
                                </span>
                                {announcement.title}
                                 <span className="text-xs text-muted-foreground font-normal ml-2">
                                     - {announcement.date ? new Date(announcement.date).toLocaleDateString() : 'No Date'}
                                 </span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No current announcements.</p>
                )}
            </CardContent>
        </Card>

         <Card>
            <CardHeader className="flex flex-row items-center space-x-4 space-y-0">
                 <Bell className="h-6 w-6 text-primary" />
                 <div>
                    <CardTitle>Upcoming</CardTitle>
                    <CardDescription>Deadlines and Schedule Highlights</CardDescription>
                 </div>
            </CardHeader>
            <CardContent>
                 {isLoadingUpcoming ? (
                     <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" /> Loading upcoming items...
                    </div>
                 ) : upcomingItems.length > 0 ? (
                     <ul className="space-y-2">
                         {upcomingItems.map(item => (
                             <li key={item.id} className="text-sm p-2 border-l-4 border-primary bg-secondary rounded">
                                 <span className="font-medium">{item.title}</span>
                                 {/* Safely format date if it exists */}
                                 {item.date && <span className="text-xs text-muted-foreground ml-2">({new Date(item.date).toLocaleDateString()})</span>}
                                 <span className="text-xs bg-primary/20 text-primary font-semibold px-1.5 py-0.5 rounded ml-2 capitalize">{item.type}</span>
                             </li>
                         ))}
                     </ul>
                 ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines or events found.</p>
                 )}
            </CardContent>
         </Card>
    </div>
  );
}
