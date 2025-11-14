import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { visitsAPI, patientsAPI, trialsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search } from 'lucide-react'; // 🔍 Added Search icon

export default function Visits() {
  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [trials, setTrials] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    trial_id: '',
    visit_number: '',
    scheduled_date: '',
    actual_date: '',
    status: 'Scheduled',
  });
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState(''); // 🔍 Added search state

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [visitsData, patientsData, trialsData] = await Promise.all([
        visitsAPI.getAll(),
        patientsAPI.getAll(),
        trialsAPI.getAll(),
      ]);
      setVisits(visitsData);
      setPatients(patientsData);
      setTrials(trialsData);
    } catch (error: any) {
  const message = error.message?.includes("Completed")
    ? "Cannot edit a visit that has been marked as Completed."
    : "Error updating visit";
  toast({ title: message, variant: 'destructive' });
}

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await visitsAPI.create(formData);
      toast({ title: 'Visit created successfully' });
      setIsDialogOpen(false);
      loadData();
      resetForm();
    } catch (error) {
      toast({ title: 'Error creating visit', variant: 'destructive' });
    }
  };

  const handleEdit = (visit: any) => {
    setEditingVisit(visit);
    setFormData({
      patient_id: visit.patient_id,
      trial_id: visit.trial_id,
      visit_number: visit.visit_number,
      scheduled_date: visit.scheduled_date.split('T')[0],
      actual_date: visit.actual_date ? visit.actual_date.split('T')[0] : '',
      status: visit.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await visitsAPI.update(editingVisit.visit_id, {
        patient_id: editingVisit.patient_id,
        trial_id: editingVisit.trial_id,
        visit_number: formData.visit_number,
        scheduled_date: formData.scheduled_date,
        actual_date: formData.actual_date,
        status: formData.status,
      });

      toast({ title: 'Visit updated successfully' });
      setIsEditDialogOpen(false);
      loadData();
    } catch (error: any) {
      const backendError = error.message || 'Error updating visit';
      toast({
        title: backendError,
        variant: 'destructive',
      });
    }
  };


  const handleDelete = async () => {
    try {
      await visitsAPI.delete(deleteDialog.id);
      toast({ title: 'Visit deleted successfully' });
      setDeleteDialog({ open: false, id: null });
      loadData();
    } catch (error) {
      toast({ title: 'Error deleting visit', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      trial_id: '',
      visit_number: '',
      scheduled_date: '',
      actual_date: '',
      status: 'Scheduled',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Completed': 'default',
      'Scheduled': 'secondary',
      'Rescheduled': 'outline',
      'Missed': 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  // 🔍 Filter logic
  const filteredVisits = visits.filter((visit: any) => {
    const term = searchTerm.toLowerCase();
    return (
      visit.patient_name?.toLowerCase().includes(term) ||
      visit.trial_name?.toLowerCase().includes(term) ||
      visit.status?.toLowerCase().includes(term)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Visits</h1>
            <p className="text-muted-foreground">Patient visit records</p>
          </div>
          <div className="flex items-center gap-2"> {/* 🔍 Added search + button */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search visits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Visit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-background">
                <DialogHeader>
                  <DialogTitle>Add New Visit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient_id">Patient</Label>
                    <Select value={formData.patient_id} onValueChange={(value) => setFormData({ ...formData, patient_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {patients.map((patient: any) => (
                          <SelectItem key={patient.patient_id} value={patient.patient_id.toString()}>
                            {patient.first_name} {patient.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trial_id">Trial</Label>
                    <Select value={formData.trial_id} onValueChange={(value) => setFormData({ ...formData, trial_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trial" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {trials.map((trial: any) => (
                          <SelectItem key={trial.trial_id} value={trial.trial_id.toString()}>
                            {trial.trial_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visit_number">Visit Number</Label>
                    <Input
                      id="visit_number"
                      value={formData.visit_number}
                      onChange={(e) => setFormData({ ...formData, visit_number: e.target.value })}
                      placeholder="e.g., 1, 2, 3"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date">Scheduled Date</Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actual_date">Actual Date</Label>
                    <Input
                      id="actual_date"
                      type="date"
                      value={formData.actual_date}
                      onChange={(e) => setFormData({ ...formData, actual_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                        <SelectItem value="Missed">Missed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Create Visit</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visit ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Trial</TableHead>
                <TableHead>Visit #</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 🔍 Use filteredVisits instead of visits */}
              {filteredVisits.map((visit: any) => (
                <TableRow key={visit.visit_id}>
                  <TableCell>{visit.visit_id}</TableCell>
                  <TableCell className="font-medium">{visit.patient_name}</TableCell>
                  <TableCell>{visit.trial_name}</TableCell>
                  <TableCell>{visit.visit_number}</TableCell>
                  <TableCell>{new Date(visit.scheduled_date).toLocaleDateString()}</TableCell>
                  <TableCell>{visit.actual_date ? new Date(visit.actual_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{getStatusBadge(visit.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(visit)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteDialog({ open: true, id: visit.visit_id })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl bg-background">
            <DialogHeader>
              <DialogTitle>Edit Visit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_patient_id">Patient</Label>
                <Input
                  id="edit_patient_id"
                  value={editingVisit ? patients.find((p: any) => p.patient_id === editingVisit.patient_id)?.first_name + ' ' + patients.find((p: any) => p.patient_id === editingVisit.patient_id)?.last_name : ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_trial_id">Trial</Label>
                <Input
                  id="edit_trial_id"
                  value={editingVisit ? trials.find((t: any) => t.trial_id === editingVisit.trial_id)?.trial_name : ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_visit_number">Visit Number</Label>
                <Input
                  id="edit_visit_number"
                  value={formData.visit_number}
                  onChange={(e) => setFormData({ ...formData, visit_number: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_scheduled_date">Scheduled Date</Label>
                <Input
                  id="edit_scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_actual_date">Actual Date</Label>
                <Input
                  id="edit_actual_date"
                  type="date"
                  value={formData.actual_date}
                  onChange={(e) => setFormData({ ...formData, actual_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="Missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Update Visit</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <AlertDialogContent className="bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the visit record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
