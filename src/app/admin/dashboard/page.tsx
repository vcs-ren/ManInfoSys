
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, CalendarDays } from "lucide-react";
import * as React from 'react'; // Import React

// Interface for dashboard stats fetched from API
interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    upcomingEvents: number;
    // Add more stats as needed
}


export default function AdminDashboardPage() {
  // State for dashboard stats and loading/error handling
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch dashboard data from the backend API
  React.useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/admin/dashboard-stats'); // Example API call
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (err: any) { // Catch specific error type if possible
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard data. Please try again later.");
        // Optionally use toast here
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {isLoading && <p>Loading dashboard data...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              {/* Replace static text with dynamic data if available from API */}
              {/* <p className="text-xs text-muted-foreground">+20 from last month</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
              {/* <p className="text-xs text-muted-foreground">+5 from last month</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              {/* <p className="text-xs text-muted-foreground">View details in scheduler</p> */}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Placeholder for more dashboard components like charts or recent activity */}
       <Card>
          <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">Recent system activities will appear here.</p>
              {/* TODO: Fetch and display recent activity logs */}
          </CardContent>
       </Card>

       {/* Updated PHP conceptual example */}
        <Card>
          <CardHeader>
              <CardTitle>PHP Backend API Snippet (Conceptual)</CardTitle>
               <CardDescription>Example structure for PHP API endpoints handling requests.</CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                  This illustrates how PHP files might serve API requests for this application.
                  A proper implementation requires routing, controllers, models, robust error handling,
                  authentication, authorization, and secure database practices (e.g., PDO with prepared statements).
              </p>
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto text-xs">
                  <code>
{`<?php
// --- api/config/database.php ---
class Database {
    private $host = "localhost";
    private $db_name = "campus_connect_db";
    private $username = "your_db_user";
    private $password = "your_db_password";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}

// --- api/students/read.php --- (Example: GET /api/students)
header("Access-Control-Allow-Origin: *"); // Allow requests (adjust in production)
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';
include_once '../models/student.php'; // Assume a Student model class exists

$database = new Database();
$db = $database->getConnection();

$student = new Student($db); // Pass DB connection to model

$stmt = $student->read(); // Assume a read() method in the model
$num = $stmt->rowCount();

if ($num > 0) {
    $students_arr = array();
    $students_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $student_item = array(
            "id" => $id,
            "studentId" => $student_id, // Adjust column names as per your DB
            "firstName" => $first_name,
            "lastName" => $last_name,
            "course" => $course,
            "status" => $status,
            "year" => $year,
            "section" => $section,
            "email" => $email,
            "phone" => $phone,
            // Include emergency contacts etc.
        );
        array_push($students_arr["records"], $student_item);
    }
    http_response_code(200);
    echo json_encode($students_arr);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No students found."));
}

// --- api/students/create.php --- (Example: POST /api/students)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/student.php';

$database = new Database();
$db = $database->getConnection();
$student = new Student($db);

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->firstName) &&
    !empty($data->lastName) &&
    !empty($data->course) &&
    !empty($data->status) // Year might be optional depending on status
    // Add other necessary field checks
) {
    // Assign data to student object properties
    $student->first_name = $data->firstName;
    $student->last_name = $data->lastName;
    $student->course = $data->course;
    $student->status = $data->status;
    $student->year = (!empty($data->year)) ? $data->year : ($data->status == 'New' ? '1st Year' : null);
    $student->email = $data->email ?? null;
    $student->phone = $data->phone ?? null;
    // ... assign emergency contacts ...

    // Attempt to create student (model handles DB insert, ID generation, section generation, password hashing)
    $result = $student->create(); // create() method returns student data or false

    if ($result) {
        http_response_code(201);
        echo json_encode($result); // Return the created student data (including generated ID/Section/Username)
    } else {
        http_response_code(503); // Service Unavailable
        echo json_encode(array("message" => "Unable to add student."));
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(array("message" => "Unable to add student. Data is incomplete."));
}
?>`}
                  </code>
              </pre>
               <p className="text-xs text-muted-foreground mt-2">
                   Note: Actual implementation involves setting up a web server (like Apache or Nginx) with PHP,
                   creating a database, defining models for data interaction (using PDO or an ORM),
                   and establishing clear API routes. Security (authentication, input validation, prepared statements) is crucial.
                </p>
          </CardContent>
       </Card>
    </div>
  );
}
