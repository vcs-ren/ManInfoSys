
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, CalendarDays } from "lucide-react";

export default function AdminDashboardPage() {
  // Mock data - replace with actual data fetching
  const stats = {
    totalStudents: 1250,
    totalTeachers: 85,
    upcomingEvents: 3,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">+20 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">View details in scheduler</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for more dashboard components like charts or recent activity */}
       <Card>
          <CardHeader>
              <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">No new announcements.</p>
              {/* Add announcement posting functionality here */}
          </CardContent>
       </Card>

       {/* Placeholder for PHP code display */}
        <Card>
          <CardHeader>
              <CardTitle>PHP Backend Snippet (Conceptual)</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                  This is a conceptual example of how PHP might handle database interactions.
                  Do not use this code directly without proper security measures and error handling.
              </p>
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-xs">
                  <code>
{`<?php
// --- Database Connection (Example - Use secure methods like PDO) ---
$servername = "localhost";
$username = "your_db_user";
$password = "your_db_password";
$dbname = "campus_connect_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// --- Fetch Dashboard Stats (Example) ---
$sql_students = "SELECT COUNT(*) as total_students FROM students";
$result_students = $conn->query($sql_students);
$students_data = $result_students->fetch_assoc();
$total_students = $students_data['total_students'];

$sql_teachers = "SELECT COUNT(*) as total_teachers FROM teachers";
$result_teachers = $conn->query($sql_teachers);
$teachers_data = $result_teachers->fetch_assoc();
$total_teachers = $teachers_data['total_teachers'];

// --- Add Student (Example - Requires Sanitization & Validation) ---
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['add_student'])) {
    $first_name = mysqli_real_escape_string($conn, $_POST['first_name']); // Sanitize input
    $last_name = mysqli_real_escape_string($conn, $_POST['last_name']);
    // ... other fields ...

    $sql_insert = "INSERT INTO students (first_name, last_name, ...) VALUES ('$first_name', '$last_name', ...)";

    if ($conn->query($sql_insert) === TRUE) {
        $last_id = $conn->insert_id;
        $username = "s1000" . $last_id;
        // IMPORTANT: Generate a secure password hash, don't store plain text
        $plain_password = bin2hex(random_bytes(8)); // Generate random password
        $hashed_password = password_hash($plain_password, PASSWORD_DEFAULT);

        $sql_update_credentials = "UPDATE students SET username='$username', password_hash='$hashed_password' WHERE id=$last_id";
        $conn->query($sql_update_credentials);

        echo "New student added successfully. Username: " . $username . " Temp Password: " . $plain_password;
    } else {
        echo "Error: " . $sql_insert . "<br>" . $conn->error;
    }
}

$conn->close();
?>
`}
                  </code>
              </pre>
               <p className="text-xs text-muted-foreground mt-2">
                    Note: Automatic username generation (e.g., `s1000 + id`) and password handling should be done securely on the server-side (PHP).
                    Passwords should always be hashed before storing. Temporary passwords should be shown once and require a change on first login.
                </p>
          </CardContent>
       </Card>
    </div>
  );
}
