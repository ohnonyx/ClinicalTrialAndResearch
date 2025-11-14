import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, Users, Activity, FileText, BarChart3, Shield } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Clinical Trials Database</span>
          </div>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Clinical Trial Research & Results Database
          </h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive platform for managing patient data, trial enrollments, visits, measurements, 
            and outcomes across clinical research studies.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 border-t">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Patient Management</CardTitle>
                <CardDescription>
                  Complete patient records with contact information, enrollment history, and medical timeline
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FlaskConical className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Trial Management</CardTitle>
                <CardDescription>
                  Manage clinical trials across all phases with sponsor and investigator tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Activity className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Measurements & Visits</CardTitle>
                <CardDescription>
                  Track patient visits, measurements, medication dispensing, and outcomes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Visualize enrollment trends, response rates, and baseline summaries
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Protocol Management</CardTitle>
                <CardDescription>
                  Store and version trial protocols with document management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Secure authentication with role-based permissions for research staff
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 border-t">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to streamline your clinical research?</h2>
          <p className="text-lg text-muted-foreground">
            Access comprehensive trial management tools for doctors, researchers, and study coordinators.
          </p>
          <Link to="/login">
            <Button size="lg">
              Sign In to Continue
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Clinical Trials Database. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
