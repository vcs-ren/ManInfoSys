
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Bell } from "lucide-react";

// Mock data - replace with actual data fetching for the logged-in student
const getStudentAnnouncements = async () => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate fetch delay
    // Fetch announcements relevant to the student (e.g., general or course/section specific)
    return [
        { id: 1, type: 'admin', title: "Campus Event: Tech Fest 2024", content: "Join us for Tech Fest next week! Workshops, competitions, and more.", date: "2024-07-28" },
        { id: 3, type: 'teacher', title: "Assignment 3 Reminder (Math 101 - Section A)", content: "Don't forget Assignment 3 is due this Friday.", date: "2024-07-29" },
    ];
}


export default async function StudentDashboardPage() {
   const announcements = await getStudentAnnouncements();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>

        <Card>
            <CardHeader className="flex flex-row items-center space-x-4 space-y-0">
                 <Megaphone className="h-6 w-6 text-primary" />
                 <div>
                    <CardTitle>Announcements</CardTitle>
                    <CardDescription>Updates from Admin and Teachers</CardDescription>
                 </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {announcements.length > 0 ? (
                    announcements.map(announcement => (
                        <div key={announcement.id} className={`p-3 border rounded-md ${announcement.type === 'admin' ? 'bg-accent/50' : 'bg-secondary'}`}>
                             <p className="font-semibold">
                                <span className={`text-xs font-medium mr-2 px-1.5 py-0.5 rounded ${announcement.type === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-background'}`}>
                                    {announcement.type === 'admin' ? 'ADMIN' : 'TEACHER'}
                                </span>
                                {announcement.title}
                                <span className="text-xs text-muted-foreground font-normal ml-2">- {announcement.date}</span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No current announcements.</p>
                )}
            </CardContent>
        </Card>

         {/* Placeholder for other relevant student info like upcoming deadlines or schedule summary */}
         <Card>
            <CardHeader className="flex flex-row items-center space-x-4 space-y-0">
                 <Bell className="h-6 w-6 text-primary" />
                 <div>
                    <CardTitle>Upcoming</CardTitle>
                    <CardDescription>Deadlines and Schedule Highlights</CardDescription>
                 </div>
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground">Upcoming deadlines and schedule items will appear here.</p>
                 {/* Example: List next 2 classes or assignment deadlines */}
            </CardContent>
         </Card>
    </div>
  );
}
