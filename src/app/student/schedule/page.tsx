
"use client";

import * as React from "react";
import { CalendarView } from "@/components/ui/calendar-view"; // Re-use the calendar component
import type { ScheduleEntry } from "@/types";
import { Loader2 } from "lucide-react";

// Mock Data - Replace with API call specific to the logged-in student
const getStudentSchedule = async (): Promise<ScheduleEntry[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const today = new Date();
   const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7)); // Get next Monday
   const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Example schedule for the student
  return [
    { id: "scl1", title: "Math 101", start: new Date(today.setHours(9, 0, 0, 0)), end: new Date(today.setHours(10, 30, 0, 0)), type: "class", location: "Room 101", teacher: "Alice Johnson" },
    { id: "scl2", title: "English Literature", start: new Date(today.setHours(13, 0, 0, 0)), end: new Date(today.setHours(14, 30, 0, 0)), type: "class", location: "Room 205", teacher: "Charlie Davis" },
    { id: "scl3", title: "Math 101", start: new Date(nextMonday.setHours(9, 0, 0, 0)), end: new Date(nextMonday.setHours(10, 30, 0, 0)), type: "class", location: "Room 101", teacher: "Alice Johnson" },
    { id: "ex1", title: "Midterm Exam - CS 301", start: new Date(nextWeek.setHours(10, 0, 0, 0)), end: new Date(nextWeek.setHours(12, 0, 0, 0)), type: "exam", location: "Exam Hall A" },
    // Add general campus events if applicable
     { id: "ev_camp1", title: "Campus Event: Tech Fest 2024", start: new Date(new Date().setDate(today.getDate() + 8)), end: new Date(new Date().setDate(today.getDate() + 8)), type: "event", location: "Main Hall" },
  ];
};


export default function StudentSchedulePage() {
    const [scheduleEntries, setScheduleEntries] = React.useState<ScheduleEntry[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

     React.useEffect(() => {
        const fetchSchedule = async () => {
        setIsLoading(true);
        try {
            const data = await getStudentSchedule();
            setScheduleEntries(data);
        } catch (error) {
            console.error("Failed to fetch student schedule:", error);
            // Add toast notification for error
        } finally {
            setIsLoading(false);
        }
        };
        fetchSchedule();
    }, []);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Class Schedule</h1>

       {isLoading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading Schedule...</span>
            </div>
        ) : (
             <CalendarView events={scheduleEntries} />
        )}
         <p className="text-sm text-muted-foreground">
            Click on a date in the calendar to view your classes and events scheduled for that day.
        </p>
    </div>
  );
}
