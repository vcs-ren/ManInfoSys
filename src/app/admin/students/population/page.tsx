
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchData, USE_MOCK_API, mockStudents, mockApiPrograms } from "@/lib/api"; 
import type { Student, Program } from "@/types"; 
import { Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Import useRouter

interface PopulationData {
  [programIdentifier: string]: { 
    [year: string]: number;
    total: number;
  };
}

const DEFAULT_PROGRAM_LABEL = "Program Not Specified";
const DEFAULT_YEAR_LABEL = "Year Not Specified";

export default function StudentPopulationPage() {
  const [populationData, setPopulationData] = React.useState<PopulationData | null>(null);
  const [totalStudents, setTotalStudents] = React.useState<number>(0);
  const [programsList, setProgramsList] = React.useState<Program[]>([]); 
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter

  React.useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        let studentsData: Student[] | null = null;
        let programsData: Program[] | null = null;

        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 300));
            studentsData = mockStudents;
            programsData = mockApiPrograms;
        } else {
            [studentsData, programsData] = await Promise.all([
                fetchData<Student[]>("students/read.php"),
                fetchData<Program[]>("programs/read.php")
            ]);
        }
        
        setProgramsList(programsData || []);

        if (studentsData) {
          const breakdown: PopulationData = {};
          let currentTotal = 0;
          studentsData.forEach(student => {
            const programIdentifier = student.program || DEFAULT_PROGRAM_LABEL;
            const year = student.year || DEFAULT_YEAR_LABEL;
            currentTotal++;

            if (!breakdown[programIdentifier]) {
              breakdown[programIdentifier] = { total: 0 };
            }
            if (!breakdown[programIdentifier][year]) {
              breakdown[programIdentifier][year] = 0;
            }
            breakdown[programIdentifier][year]++;
            breakdown[programIdentifier].total++;
          });
          setPopulationData(breakdown);
          setTotalStudents(currentTotal);
        } else {
          setPopulationData({});
          setTotalStudents(0);
        }
      } catch (error: any) {
        console.error("Failed to fetch student or program data for population breakdown:", error);
        toast({
          variant: "destructive",
          title: "Error Loading Data",
          description: error.message || "Could not load student population data.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [toast]);

  const handleCardClick = (programIdentifier: string) => {
    if (programIdentifier === DEFAULT_PROGRAM_LABEL) {
        // Optionally handle clicks on "Program Not Specified" differently, e.g., show all or do nothing
        router.push(`/admin/students`); // Or a specific filter for unspecified if desired
    } else {
        router.push(`/admin/students?program=${encodeURIComponent(programIdentifier)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading student population data...</p>
      </div>
    );
  }

  if (!populationData || Object.keys(populationData).length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Student Population Breakdown</h1>
            <Button asChild variant="outline">
                 <Link href="/admin/students">View Full Student List</Link>
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>No Student Data</CardTitle>
                <CardDescription>No student data available to generate population breakdown.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Please add students to see the population breakdown.</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Population Breakdown</h1>
        <Button asChild variant="outline">
             <Link href="/admin/students">View Full Student List</Link>
        </Button>
      </div>
      <Card className="bg-accent/30 border-accent shadow-md">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary"/>
                Overall Student Population
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-4xl font-bold text-primary">{totalStudents}</p>
            <p className="text-sm text-muted-foreground">Total enrolled students across all programs and year levels.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(populationData)
            .sort(([programA], [programB]) => {
                const nameA = programsList.find(p => p.id === programA)?.name || programA;
                const nameB = programsList.find(p => p.id === programB)?.name || programB;
                if (nameA === DEFAULT_PROGRAM_LABEL) return 1; 
                if (nameB === DEFAULT_PROGRAM_LABEL) return -1;
                return nameA.localeCompare(nameB);
            })
            .map(([programIdentifier, yearData]) => {
                const programDetails = programsList.find(p => p.id === programIdentifier);
                const displayName = programDetails?.name || programIdentifier; 

                return (
                  <Card 
                    key={programIdentifier} 
                    className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleCardClick(programIdentifier)} // Added onClick handler
                  >
                    <CardHeader>
                      <CardTitle className="text-xl text-primary">{displayName}</CardTitle>
                      <CardDescription>Total Students: <span className="font-semibold text-foreground">{yearData.total}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-2">
                        {Object.entries(yearData)
                          .filter(([key]) => key !== 'total')
                          .sort(([yearA], [yearB]) => {
                              if (yearA === DEFAULT_YEAR_LABEL) return 1; 
                              if (yearB === DEFAULT_YEAR_LABEL) return -1;
                              const yearNumA = parseInt(yearA.match(/\d+/)?.[0] || '0');
                              const yearNumB = parseInt(yearB.match(/\d+/)?.[0] || '0');
                              if (yearNumA !== yearNumB) return yearNumA - yearNumB;
                              return yearA.localeCompare(yearB);
                          })
                          .map(([year, count]) => (
                          <li key={year} className="flex justify-between items-center text-sm p-3 bg-secondary/60 rounded-md border border-border">
                            <span className="text-muted-foreground">{year}:</span>
                            <span className="font-semibold text-foreground">{count} student{count !== 1 ? 's' : ''}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
        })}
      </div>
    </div>
  );
}
