import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardAPI, trialsAPI } from '@/lib/api';
import { Users, FlaskConical, Calendar, Target, FlaskRound } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>({});
  const [visitsByTrial, setVisitsByTrial] = useState([]);
  const [enrollmentsTrend, setEnrollmentsTrend] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [metricsData, visitsData, enrollmentsData] = await Promise.all([
        dashboardAPI.getMetrics(),
        dashboardAPI.getVisitsByTrial(),
        dashboardAPI.getEnrollmentsTrend(),
      ]);
      setMetrics(metricsData);
      setVisitsByTrial(visitsData);
      setEnrollmentsTrend(enrollmentsData);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error loading dashboard',
        description: 'Unable to fetch dashboard data',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* --- HEADER --- */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Clinical trial performance and analytics overview</p>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
              <FlaskRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_trials || 0}</div>
              <p className="text-xs text-muted-foreground">Ongoing studies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_patients || 0}</div>
              <p className="text-xs text-muted-foreground">Participants enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Response Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.avg_response_rate ? `${metrics.avg_response_rate}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">Positive outcomes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Visits</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.completed_visits || 0}</div>
              <p className="text-xs text-muted-foreground">Across all trials</p>
            </CardContent>
          </Card>
        </div>

        {/* --- CHARTS --- */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 1: Visits by Trial */}
          <Card>
            <CardHeader>
              <CardTitle>Completed Visits by Trial</CardTitle>
              <CardDescription>Comparison across trials</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={visitsByTrial}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="trial_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed_visits" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Enrollments over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollments Over Time</CardTitle>
              <CardDescription>Monthly enrollment trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="enrollments" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
