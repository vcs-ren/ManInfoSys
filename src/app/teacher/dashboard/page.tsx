
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

// Mock data - replace with actual data fetching
const getAnnouncements = async () => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate fetch delay
    return [
        { id: 1, title: "Faculty Meeting Reminder", content: "Reminder: Faculty meeting tomorrow at 2 PM in the conference hall.", date: "2024-07-28" },
        { id: 2, title: "Midterm Grade Submission Deadline", content: "Please submit all midterm grades by Friday EOD.", date: "2024-07-26" },
    ];
}


export default async function TeacherDashboardPage() {
   const announcements = await getAnnouncements();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Teacher Dashboard</h1>

        <Card>
            <CardHeader className="flex flex-row items-center space-x-4 space-y-0">
                 <Megaphone className="h-6 w-6 text-primary" />
                 <div>
                    <CardTitle>Announcements</CardTitle>
                    <CardDescription>Updates from Admin</CardDescription>
                 </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {announcements.length > 0 ? (
                    announcements.map(announcement => (
                        <div key={announcement.id} className="p-3 border rounded-md bg-secondary">
                            <p className="font-semibold">{announcement.title} <span className="text-xs text-muted-foreground font-normal">- {announcement.date}</span></p>
                            <p className="text-sm text-muted-foreground">{announcement.content}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No current announcements.</p>
                )}
            </CardContent>
        </Card>

         {/* Placeholder for other relevant teacher info */}
         <Card>
            <CardHeader>
                <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Add links to frequently used sections like grade submission or schedule */}
                 <p className="text-sm text-muted-foreground">Quick links area (e.g., Link to Grade Submission).</p>
            </CardContent>
         </Card>
    </div>
  );
}
