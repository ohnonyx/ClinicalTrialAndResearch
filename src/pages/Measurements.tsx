import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { measurementsAPI, patientsAPI, visitsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function Measurements() {
  const [measurements, setMeasurements] = useState([]);
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editingMeasurement, setEditingMeasurement] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    visit_id: '',
    type: '',
    value: '',
    unit: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [measurementsData, patientsData, visitsData] = await Promise.all([
        measurementsAPI.getAll(),
        patientsAPI.getAll(),
        visitsAPI.getAll(),
      ]);
      setMeasurements(measurementsData);
      setPatients(patientsData);
      setVisits(visitsData);
    } catch (error) {
      toast({ title: 'Error loading data', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await measurementsAPI.create(formData);
      toast({ title: 'Measurement created successfully' });
      setIsDialogOpen(false);
      loadData();
      resetForm();
    } catch (error) {
      toast({ title: 'Error creating measurement', variant: 'destructive' });
    }
  };

  const handleEdit = (measurement: any) => {
    setEditingMeasurement(measurement);
    setFormData({
      patient_id: measurement.patient_id,
      visit_id: measurement.visit_id,
      type: measurement.type,
      value: measurement.value,
      unit: measurement.unit,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await measurementsAPI.update(editingMeasurement.measurement_id, formData);
      toast({ title: 'Measurement updated successfully' });
      setIsEditDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ title: 'Error updating measurement', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      await measurementsAPI.delete(deleteDialog.id);
      toast({ title: 'Measurement deleted successfully' });
      setDeleteDialog({ open: false, id: null });
      loadData();
    } catch (error) {
      toast({ title: 'Error deleting measurement', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      visit_id: '',
      type: '',
      value: '',
      unit: '',
    });
  };

  const filteredMeasurements = measurements.filter((measurement: any) => {
    const term = searchTerm.toLowerCase();
    return (
      measurement.patient_name?.toLowerCase().includes(term) ||
      measurement.type?.toLowerCase().includes(term)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Measurements</h1>
            <p className="text-muted-foreground">Patient measurement records</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search measurements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Measurement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-background">
              <DialogHeader>
                <DialogTitle>Add New Measurement</DialogTitle>
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
                  <Label htmlFor="visit_id">Visit</Label>
                  <Select value={formData.visit_id} onValueChange={(value) => setFormData({ ...formData, visit_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visit" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {visits.map((visit: any) => (
                        <SelectItem key={visit.visit_id} value={visit.visit_id.toString()}>
                          Visit {visit.visit_number} - {visit.patient_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Blood Pressure, Heart Rate"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., mmHg, bpm"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Create Measurement</Button>
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
                <TableHead>Visit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeasurements.map((measurement: any) => (
                <TableRow key={measurement.measurement_id}>
                  <TableCell>{measurement.measurement_id}</TableCell>
                  <TableCell className="font-medium">{measurement.patient_name}</TableCell>
                  <TableCell>Visit {measurement.visit_number}</TableCell>
                  <TableCell>{measurement.type}</TableCell>
                  <TableCell className="font-mono">{measurement.value}</TableCell>
                  <TableCell>{measurement.unit}</TableCell>
                  <TableCell>{new Date(measurement.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(measurement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, id: measurement.measurement_id })}
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
              <DialogTitle>Edit Measurement</DialogTitle>
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
                <Label htmlFor="edit_visit_id">Visit</Label>
                <Select value={formData.visit_id} onValueChange={(value) => setFormData({ ...formData, visit_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {visits.map((visit: any) => (
                      <SelectItem key={visit.visit_id} value={visit.visit_id.toString()}>
                        Visit {visit.visit_number} - {visit.patient_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_type">Type</Label>
                <Input
                  id="edit_type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_value">Value</Label>
                <Input
                  id="edit_value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_unit">Unit</Label>
                <Input
                  id="edit_unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Update Measurement</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <AlertDialogContent className="bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the measurement record.
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