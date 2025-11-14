import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { patientHistoryAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, Activity, Pill, Target } from 'lucide-react';

export default function PatientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadHistory();
    }
  }, [id]);

  const loadHistory = async () => {
    try {
      const data = await patientHistoryAPI.getHistory(Number(id));
      setHistory(data);
    } catch (error) {
      toast({ title: 'Error loading patient history', variant: 'destructive' });
    }
  };

  if (!history) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/patients')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {history.patient?.first_name} {history.patient?.last_name}
            </h1>
            <p className="text-muted-foreground">Patient Medical History & Timeline</p>
          </div>
        </div>

        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{new Date(history.patient?.date_of_birth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium">{history.patient?.gender}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{history.contact?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{history.contact?.phone_number}</p>
            </div>
          </CardContent>
        </Card>

        {/* Enrollments */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Trial Enrollments</h2>
          {history.enrollments?.map((enrollment: any) => (
            <Card key={enrollment.enrollment_id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {enrollment.trial_name} - {enrollment.status}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                  </p>
                </div>

                {/* Visits */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Visits</h3>
                  {enrollment.visits?.map((visit: any) => (
                    <div key={visit.visit_id} className="border-l-2 border-primary pl-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Visit {visit.visit_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {visit.actual_date ? new Date(visit.actual_date).toLocaleDateString() : 'Scheduled'}
                          </p>
                          <p className="text-sm">Status: {visit.status}</p>
                        </div>
                      </div>

                      {/* Measurements */}
                      {visit.measurements?.length > 0 && (
                        <div className="bg-muted/50 p-3 rounded-md space-y-1">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Measurements
                          </p>
                          {visit.measurements.map((m: any) => (
                            <p key={m.measurement_id} className="text-sm ml-6">
                              {m.type}: {m.value} {m.unit}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Medications */}
                      {visit.medications?.length > 0 && (
                        <div className="bg-muted/50 p-3 rounded-md space-y-1">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Pill className="h-4 w-4" />
                            Medications Dispensed
                          </p>
                          {visit.medications.map((med: any) => (
                            <p key={med.dispense_id} className="text-sm ml-6">
                              {med.medication_name}: {med.quantity_dispensed} units - {med.dosage_instructions}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Outcomes */}
                      {visit.outcomes?.length > 0 && (
                        <div className="bg-muted/50 p-3 rounded-md space-y-1">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Outcomes
                          </p>
                          {visit.outcomes.map((outcome: any) => (
                            <div key={outcome.outcome_id} className="ml-6">
                              <p className="text-sm font-medium">{outcome.outcome_type}: {outcome.outcome_value}</p>
                              {outcome.notes && <p className="text-xs text-muted-foreground">{outcome.notes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
