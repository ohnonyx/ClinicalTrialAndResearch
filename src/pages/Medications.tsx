import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { dispensesAPI, patientsAPI, visitsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function Medications() {
  const [dispenses, setDispenses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editingDispense, setEditingDispense] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    visit_id: '',
    medication_name: '',
    quantity_dispensed: '',
    dosage_instructions: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dispensesData, patientsData, visitsData] = await Promise.all([
        dispensesAPI.getAll(),
        patientsAPI.getAll(),
        visitsAPI.getAll(),
      ]);
      // Ensure we always store an array for dispenses (guard against unexpected API shape)
      setDispenses(Array.isArray(dispensesData) ? dispensesData : []);
      setPatients(patientsData);
      setVisits(visitsData);
    } catch (error) {
      toast({ title: 'Error loading data', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispensesAPI.create(formData);
      toast({ title: 'Medication dispense created successfully' });
      setIsDialogOpen(false);
      loadData();
      resetForm();
    } catch (error) {
      toast({ title: 'Error creating medication dispense', variant: 'destructive' });
    }
  };

  const handleEdit = (dispense: any) => {
    setEditingDispense(dispense);
    setFormData({
      patient_id: dispense.patient_id,
      visit_id: dispense.visit_id,
      medication_name: dispense.medication_name,
      quantity_dispensed: dispense.quantity_dispensed,
      dosage_instructions: dispense.dosage_instructions,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispensesAPI.update(editingDispense.dispense_id, formData);
      toast({ title: 'Medication dispense updated successfully' });
      setIsEditDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ title: 'Error updating medication dispense', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      await dispensesAPI.delete(deleteDialog.id);
      toast({ title: 'Medication dispense deleted successfully' });
      setDeleteDialog({ open: false, id: null });
      loadData();
    } catch (error) {
      toast({ title: 'Error deleting medication dispense', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      visit_id: '',
      medication_name: '',
      quantity_dispensed: '',
      dosage_instructions: '',
    });
  };

  const filteredDispenses = Array.isArray(dispenses) ? dispenses.filter((dispense: any) => {
    const term = searchTerm.toLowerCase();
    return (
      dispense.patient_name?.toLowerCase().includes(term) ||
      dispense.medication_name?.toLowerCase().includes(term)
    );
  }) : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Medication Dispenses</h1>
            <p className="text-muted-foreground">Trial medication dispensing records</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-background">
              <DialogHeader>
                <DialogTitle>Add New Medication Dispense</DialogTitle>
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
                  <Label htmlFor="medication_name">Medication Name</Label>
                  <Input
                    id="medication_name"
                    value={formData.medication_name}
                    onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity_dispensed">Quantity Dispensed</Label>
                  <Input
                    id="quantity_dispensed"
                    type="number"
                    value={formData.quantity_dispensed}
                    onChange={(e) => setFormData({ ...formData, quantity_dispensed: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage_instructions">Dosage Instructions</Label>
                  <Input
                    id="dosage_instructions"
                    value={formData.dosage_instructions}
                    onChange={(e) => setFormData({ ...formData, dosage_instructions: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Create Medication Dispense</Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispense ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Visit</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Dosage Instructions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDispenses.map((dispense: any) => (
                <TableRow key={dispense.dispense_id}>
                  <TableCell>{dispense.dispense_id}</TableCell>
                  <TableCell className="font-medium">{dispense.patient_name}</TableCell>
                  <TableCell>Visit {dispense.visit_number}</TableCell>
                  <TableCell>{dispense.medication_name}</TableCell>
                  <TableCell>{dispense.quantity_dispensed}</TableCell>
                  <TableCell>{dispense.dosage_instructions}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(dispense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, id: dispense.dispense_id })}
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
              <DialogTitle>Edit Medication Dispense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_patient_id">Patient</Label>
                    {/* When editing a dispense we don't allow changing the patient. Show read-only patient name. */}
                    <input
                      id="edit_patient_id"
                      className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
                      value={editingDispense?.patient_name || ''}
                      disabled
                    />
                  </div>
              <div className="space-y-2">
                <Label htmlFor="edit_visit_id">Visit</Label>
                {/* When editing a dispense we don't allow changing the visit. Show read-only visit info. */}
                <input
                  id="edit_visit_id"
                  className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
                  value={editingDispense ? `Visit ${editingDispense.visit_number} - ${editingDispense.patient_name}` : ''}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_medication_name">Medication Name</Label>
                <Input
                  id="edit_medication_name"
                  value={formData.medication_name}
                  onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_quantity_dispensed">Quantity Dispensed</Label>
                <Input
                  id="edit_quantity_dispensed"
                  type="number"
                  value={formData.quantity_dispensed}
                  onChange={(e) => setFormData({ ...formData, quantity_dispensed: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_dosage_instructions">Dosage Instructions</Label>
                <Input
                  id="edit_dosage_instructions"
                  value={formData.dosage_instructions}
                  onChange={(e) => setFormData({ ...formData, dosage_instructions: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Update Medication Dispense</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <AlertDialogContent className="bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the medication dispense record.
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