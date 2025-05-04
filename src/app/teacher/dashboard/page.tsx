"use client"; // Mark as Client Component

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Link as LinkIcon, Loader2 } from "lucide-react"; // Added LinkIcon, Loader2
import Link from 'next/link'; // Import Link for navigation
import { buttonVariants } from "@/components/ui/button"; // Import buttonVariants for styling
import type { Announcement } from "@/types";

// --- API Helper ---
const fetchData = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
};
// --- End API Helper ---

export default function TeacherDashboardPage() {
   const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
   const [isLoading, setIsLoading] = React.useState(true);
   const [error, setError] = React.useState<string | null>(null);

   React.useEffect(() => {
       const loadAnnouncements = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Replace with your actual API endpoint for fetching teacher announcements
                const data = await fetchData<Announcement[]>('/api/teacher/announcements');
                setAnnouncements(data || []);
            } catch (err) {
                console.error("Failed to fetch announcements:", err);
                setError("Could not load announcements. Please try again later.");
                 // Optionally use toast here
            } finally {
                setIsLoading(false);
            }
       };
       loadAnnouncements();
   }, []); // Empty dependency array runs once on mount

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Teacher Dashboard</h1>

        {error && <p className="text-destructive">{error}</p>}

        <Card>
            <CardHeader className="flex flex-row items-center space-x-4 space-y-0">
                 <Megaphone className="h-6 w-6 text-primary" />
                 <div>
                    <CardTitle>Announcements</CardTitle>
                    <CardDescription>Updates from Admin</CardDescription>
                 </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 {isLoading ? (
                     <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" /> Loading announcements...
                     </div>
                 ) : announcements.length > 0 ? (
                    announcements.map(announcement => (
                        <div key={announcement.id} className="p-3 border rounded-md bg-secondary">
                             <p className="font-semibold">
                                 {announcement.title}
                                 {/* Format date safely */}
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
                <LinkIcon className="h-6 w-6 text-primary" />
                <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Link href="/teacher/grades" passHref legacyBehavior>
                    <a className={buttonVariants({ variant: "outline" })}>Submit Grades</a>
                </Link>
                 <Link href="/teacher/schedule" passHref legacyBehavior>
                    <a className={buttonVariants({ variant: "outline" })}>View Schedule</a>
                </Link>
                 {/* Add more relevant links */}
            </CardContent>
         </Card>
    </div>
  );
}