
"use client";

import * as React from "react";
import { CalendarView } from "@/components/ui/calendar-view"; // Re-use the calendar component
import type { ScheduleEntry } from "@/types";
import { Loader2 } from "lucide-react";

// Mock Data - Replace with API call specific to the logged-in teacher
const getTeacherSchedule = async (): Promise<ScheduleEntry[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const today = new Date();
  const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7)); // Get next Monday

  // Example schedule for the teacher
  return [
    { id: "tcl1", title: "Math 101 - Section A", start: new Date(today.setHours(9, 0, 0, 0)), end: new Date(today.setHours(10, 30, 0, 0)), type: "class", location: "Room 101", section: "A" },
    { id: "tcl2", title: "Physics 202 - Section B", start: new Date(today.setHours(11, 0, 0, 0)), end: new Date(today.setHours(12, 30, 0, 0)), type: "class", location: "Lab 3", section: "B" },
    { id: "tcl3", title: "Math 101 - Section A", start: new Date(nextMonday.setHours(9, 0, 0, 0)), end: new Date(nextMonday.setHours(10, 30, 0, 0)), type: "class", location: "Room 101", section: "A" },
    // Add other relevant events like faculty meetings if fetched together
     { id: "ev1", title: "Faculty Meeting", start: new Date(new Date().setDate(today.getDate() + 1)), end: new Date(new Date().setDate(today.getDate() + 1)), type: "event", location: "Conference Hall" },
  ];
};


export default function TeacherSchedulePage() {
    const [scheduleEntries, setScheduleEntries] = React.useState<ScheduleEntry[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

     React.useEffect(() => {
        const fetchSchedule = async () => {
        setIsLoading(true);
        try {
            const data = await getTeacherSchedule();
            setScheduleEntries(data);
        } catch (error) {
            console.error("Failed to fetch teacher schedule:", error);
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
    </div>
  );
}
