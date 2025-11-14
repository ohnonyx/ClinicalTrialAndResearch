import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { enrollmentsAPI, patientsAPI, trialsAPI, sitesAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [trials, setTrials] = useState([]);
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editingEnrollment, setEditingEnrollment] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    trial_id: '',
    site_id: '',
    enrollment_date: '',
    status: 'Screened',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [enrollData, patientsData, trialsData, sitesData] = await Promise.all([
        enrollmentsAPI.getAll(),
        patientsAPI.getAll(),
        trialsAPI.getAll(),
        sitesAPI.getAll(),
      ]);
      setEnrollments(enrollData);
      setPatients(patientsData);
      setTrials(trialsData);
      setSites(sitesData);
    } catch (error) {
      toast({ title: 'Error loading data', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enrollmentsAPI.create(formData);
      toast({ title: 'Enrollment created successfully' });
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ title: 'Error creating enrollment', variant: 'destructive' });
    }
  };

  const handleEdit = (enrollment: any) => {
    setEditingEnrollment(enrollment);
    setFormData({
      patient_id: enrollment.patient_id.toString(),
      trial_id: enrollment.trial_id.toString(),
      site_id: enrollment.site_id.toString(),
      enrollment_date: enrollment.enrollment_date.split('T')[0],
      status: enrollment.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enrollmentsAPI.update(editingEnrollment.enrollment_id, formData);
      toast({ title: 'Enrollment updated successfully' });
      setIsEditDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ title: 'Error updating enrollment', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      await enrollmentsAPI.delete(deleteDialog.id);
      toast({ title: 'Enrollment deleted successfully' });
      setDeleteDialog({ open: false, id: null });
      loadData();
    } catch (error) {
      toast({ title: 'Error deleting enrollment', variant: 'destructive' });
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment: any) => {
    const term = search.toLowerCase();
    return (
      enrollment.patient_name?.toLowerCase().includes(term) ||
      enrollment.trial_name?.toLowerCase().includes(term) ||
      enrollment.site_name?.toLowerCase().includes(term) ||
      enrollment.status?.toLowerCase().includes(term)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Patient Enrollments</h1>
            <p className="text-muted-foreground">Manage trial enrollments</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search enrollments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Enrollment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-background">
              <DialogHeader>
                <DialogTitle>Add New Enrollment</DialogTitle>
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
                  <Label htmlFor="site_id">Site</Label>
                  <Select value={formData.site_id} onValueChange={(value) => setFormData({ ...formData, site_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {sites.map((site: any) => (
                        <SelectItem key={site.site_id} value={site.site_id.toString()}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollment_date">Enrollment Date</Label>
                  <Input
                    id="enrollment_date"
                    type="date"
                    value={formData.enrollment_date}
                    onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="Screened">Screened</SelectItem>
                      <SelectItem value="Enrolled">Enrolled</SelectItem>
                      <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Create Enrollment</Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Trial</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment: any) => (
                <TableRow key={enrollment.enrollment_id}>
                  <TableCell>{enrollment.enrollment_id}</TableCell>
                  <TableCell className="font-medium">{enrollment.patient_name}</TableCell>
                  <TableCell>{enrollment.trial_name}</TableCell>
                  <TableCell>{enrollment.site_name}</TableCell>
                  <TableCell>{new Date(enrollment.enrollment_date).toLocaleDateString()}</TableCell>
                  <TableCell>{enrollment.status}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(enrollment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, id: enrollment.enrollment_id })}
                      >
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
              <DialogTitle>Edit Enrollment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_patient_id">Patient</Label>
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
                <Label htmlFor="edit_trial_id">Trial</Label>
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
                <Label htmlFor="edit_site_id">Site</Label>
                <Select value={formData.site_id} onValueChange={(value) => setFormData({ ...formData, site_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {sites.map((site: any) => (
                      <SelectItem key={site.site_id} value={site.site_id.toString()}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_enrollment_date">Enrollment Date</Label>
                <Input
                  id="edit_enrollment_date"
                  type="date"
                  value={formData.enrollment_date}
                  onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="Screened">Screened</SelectItem>
                    <SelectItem value="Enrolled">Enrolled</SelectItem>
                    <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Update Enrollment</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <AlertDialogContent className="bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the enrollment record.
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
