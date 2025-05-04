"use client";

import * as React from "react";
import { CalendarView } from "@/components/ui/calendar-view"; // Re-use the calendar component
import type { ScheduleEntry } from "@/types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Import useToast

// --- API Helper ---
const fetchData = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
};
// --- End API Helper ---


export default function StudentSchedulePage() {
    const [scheduleEntries, setScheduleEntries] = React.useState<ScheduleEntry[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast(); // Initialize toast

     React.useEffect(() => {
        const fetchSchedule = async () => {
        setIsLoading(true);
        try {
             // Replace with your actual API endpoint for fetching the student's schedule
            const data = await fetchData<ScheduleEntry[]>('/api/student/schedule');
            // Ensure dates are converted to Date objects if they come as strings
             const processedData = (data || []).map(entry => ({
                 ...entry,
                 start: new Date(entry.start),
                 end: new Date(entry.end),
             }));
            setScheduleEntries(processedData);
        } catch (error) {
            console.error("Failed to fetch student schedule:", error);
             toast({ // Use toast for error notification
                variant: "destructive",
                title: "Error Loading Schedule",
                description: "Could not fetch schedule data. Please try refreshing the page.",
            });
        } finally {
            setIsLoading(false);
        }
        };
        fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Add toast as dependency


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Class Schedule</h1>

       {isLoading ? (
            <div className="flex justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-lg">Loading Schedule...</span>
            </div>
        ) : scheduleEntries.length > 0 ? (
             <CalendarView events={scheduleEntries} />
        ) : (
             <p className="text-center text-muted-foreground mt-10">Your schedule is currently empty.</p>
        )}
         <p className="text-sm text-muted-foreground mt-4 text-center md:text-left">
            Click on a date in the calendar to view your classes and events scheduled for that day. Highlighted dates indicate scheduled activities.
        </p>
    </div>
  );
}