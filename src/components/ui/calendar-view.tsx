
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar"; // Use Shadcn calendar for display
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScheduleEntry } from "@/types"; // Import your schedule type
import { format } from "date-fns";

interface CalendarViewProps {
  events?: ScheduleEntry[]; // Array of events to display
  initialDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
}

export function CalendarView({
  events = [],
  initialDate,
  onDateSelect,
}: CalendarViewProps) {
  const [date, setDate] = React.useState<Date | undefined>(initialDate || new Date());
  const [selectedEvents, setSelectedEvents] = React.useState<ScheduleEntry[]>([]);

  React.useEffect(() => {
    if (date) {
      // Filter events for the selected date
      const eventsForDate = events.filter(
        (event) =>
          format(event.start, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );
      setSelectedEvents(eventsForDate);
      if (onDateSelect) {
        onDateSelect(date);
      }
    } else {
      setSelectedEvents([]);
       if (onDateSelect) {
        onDateSelect(undefined);
      }
    }
  }, [date, events, onDateSelect]);

  // Custom day renderer to highlight days with events
  const renderDay = (day: Date): React.ReactNode => {
    const formattedDay = format(day, "yyyy-MM-dd");
    const hasEvent = events.some(
      (event) => format(event.start, "yyyy-MM-dd") === formattedDay
    );

    return (
      <div className="relative">
        {format(day, "d")}
        {hasEvent && (
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></span>
        )}
      </div>
    );
  };


  return (
    <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
            <CardContent className="p-2 md:p-4">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border w-full"
                    initialFocus
                    formatters={{ formatDay: renderDay }} // Use custom day formatter
                    modifiers={{
                      hasEvent: events.map(e => e.start) // Pass event start dates for potential styling
                    }}
                     modifiersStyles={{ // Basic styling for days with events
                      hasEvent: { fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: 'hsl(var(--primary))', textUnderlineOffset: '2px' }
                    }}
                />
            </CardContent>
        </Card>

        <Card className="md:col-span-1">
             <CardHeader>
                <CardTitle>
                     Events for {date ? format(date, "PPP") : "Select a Date"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {selectedEvents.length > 0 ? (
                selectedEvents.map((event) => (
                    <div key={event.id} className="p-3 bg-secondary rounded-md border border-border">
                    <p className="font-semibold text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                        {format(event.start, "p")} - {format(event.end, "p")}
                        {event.location && ` @ ${event.location}`}
                    </p>
                    {/* Add more event details if needed */}
                    </div>
                ))
                ) : (
                <p className="text-sm text-muted-foreground p-3">
                    No events scheduled for this day.
                </p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
