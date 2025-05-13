
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchData, USE_MOCK_API, mockFaculty } from "@/lib/api"; 
import type { Faculty, DepartmentType, EmploymentType } from "@/types";
import { Loader2, Briefcase, Building, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; 

interface PopulationData {
  [department: string]: {
    [employmentType: string]: number;
    total: number;
  };
}

export default function FacultyPopulationPage() {
  const [populationData, setPopulationData] = React.useState<PopulationData | null>(null);
  const [totalFaculty, setTotalFaculty] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter(); 

  React.useEffect(() => {
    const fetchFacultyData = async () => {
      setIsLoading(true);
      try {
        let facultyList: Faculty[] | null = null;
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 300));
            facultyList = mockFaculty;
        } else {
            facultyList = await fetchData<Faculty[]>("teachers/read.php");
        }
        
        if (facultyList) {
          const breakdown: PopulationData = {};
          let currentTotal = 0;
          facultyList.forEach(facultyMember => {
            const department = facultyMember.department || "Unspecified Department";
            const employmentType = facultyMember.employmentType || "Unspecified Type";
            currentTotal++;

            if (!breakdown[department]) {
              breakdown[department] = { total: 0 };
            }
            if (!breakdown[department][employmentType]) {
              breakdown[department][employmentType] = 0;
            }
            breakdown[department][employmentType]++;
            breakdown[department].total++;
          });
          setPopulationData(breakdown);
          setTotalFaculty(currentTotal);
        } else {
          setPopulationData({});
          setTotalFaculty(0);
        }
      } catch (error: any) {
        console.error("Failed to fetch faculty data for population breakdown:", error);
        toast({
          variant: "destructive",
          title: "Error Loading Data",
          description: error.message || "Could not load faculty population data.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacultyData();
  }, [toast]);

  const handleCardClick = (department: DepartmentType) => {
    router.push(`/admin/teachers?department=${encodeURIComponent(department)}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading faculty population data...</p>
      </div>
    );
  }

  if (!populationData || Object.keys(populationData).length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Faculty Population Breakdown</h1>
            <Button asChild variant="outline">
                 <Link href="/admin/teachers">View Full Faculty List</Link>
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>No Faculty Data</CardTitle>
                <CardDescription>No faculty data available to generate population breakdown.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Please add faculty members to see the population breakdown.</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  const departmentIcons: Record<DepartmentType, React.ElementType> = {
    Teaching: UserCheck,
    Administrative: Building,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Faculty Population Breakdown</h1>
        <Button asChild variant="outline">
             <Link href="/admin/teachers">View Full Faculty List</Link>
        </Button>
      </div>
      <Card className="bg-accent/30 border-accent shadow-md">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-primary"/>
                Overall Faculty Population
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-4xl font-bold text-primary">{totalFaculty}</p>
            <p className="text-sm text-muted-foreground">Total faculty members across all departments and employment types.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {Object.entries(populationData)
            .sort(([deptA], [deptB]) => deptA.localeCompare(deptB)) 
            .map(([department, typeData]) => {
                const DepartmentIcon = departmentIcons[department as DepartmentType] || Briefcase;
                return (
                    <Card 
                        key={department} 
                        className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                        onClick={() => handleCardClick(department as DepartmentType)}
                    >
                        <CardHeader>
                        <CardTitle className="text-xl text-primary flex items-center gap-2">
                            <DepartmentIcon className="h-5 w-5" />
                            {department}
                        </CardTitle>
                        <CardDescription>Total in Department: <span className="font-semibold text-foreground">{typeData.total}</span></CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <ul className="space-y-2">
                            {Object.entries(typeData)
                            .filter(([key]) => key !== 'total')
                            .sort(([typeA], [typeB]) => typeA.localeCompare(typeB)) 
                            .map(([type, count]) => (
                            <li key={type} className="flex justify-between items-center text-sm p-3 bg-secondary/60 rounded-md border border-border">
                                <span className="text-muted-foreground">{type}:</span>
                                <span className="font-semibold text-foreground">{count} member{count !== 1 ? 's' : ''}</span>
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

