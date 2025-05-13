
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Forgot Password</CardTitle>
          <CardDescription>Contact administration for password assistance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            If you have forgotten your password, please contact the school administration
            to request a password reset.
          </p>
          <div className="space-y-1">
            <p className="font-medium">Contact Details:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
               {/* Add actual contact details here */}
              <li>Email: <a href="mailto:p4x.mnb@gmail.com" className="text-primary hover:underline">p4x.mnb@gmail.com</a></li>
              <li>Phone: <a href="tel:+639467545332" className="text-primary hover:underline">(+63) 9467545332</a></li>
              <li>Office Hours: Mon-Fri, 8:00 AM - 4:00 PM</li>
            </ul>
          </div>
          <Button asChild className="w-full mt-4">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

