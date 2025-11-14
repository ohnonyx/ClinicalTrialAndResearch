import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { outcomesAPI, patientsAPI, visitsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function Outcomes() {
  const [outcomes, setOutcomes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editingOutcome, setEditingOutcome] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    visit_id: '',
    outcome_type: '',
    outcome_value: '',
    notes: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [outcomesData, patientsData, visitsData] = await Promise.all([
        outcomesAPI.getAll(),
        patientsAPI.getAll(),
        visitsAPI.getAll(),
      ]);
      setOutcomes(outcomesData);
      setPatients(patientsData);
      setVisits(visitsData);
    } catch (error) {
      toast({ title: 'Error loading data', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await outcomesAPI.create(formData);
      toast({ title: 'Outcome created successfully' });
      setIsDialogOpen(false);
      loadData();
      resetForm();
    } catch (error) {
      toast({ title: 'Error creating outcome', variant: 'destructive' });
    }
  };

  const handleEdit = (outcome: any) => {
    setEditingOutcome(outcome);
    setFormData({
      patient_id: outcome.patient_id,
      visit_id: outcome.visit_id,
      outcome_type: outcome.outcome_type,
      outcome_value: outcome.outcome_value,
      notes: outcome.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await outcomesAPI.update(editingOutcome.outcome_id, formData);
      toast({ title: 'Outcome updated successfully' });
      setIsEditDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ title: 'Error updating outcome', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      await outcomesAPI.delete(deleteDialog.id);
      toast({ title: 'Outcome deleted successfully' });
      setDeleteDialog({ open: false, id: null });
      loadData();
    } catch (error) {
      toast({ title: 'Error deleting outcome', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      visit_id: '',
      outcome_type: '',
      outcome_value: '',
      notes: '',
    });
  };

  const getOutcomeBadge = (value: string) => {
    if (value.includes('Responded') || value.includes('Positive') || value.includes('Improved')) {
      return <Badge className="bg-green-500">{value}</Badge>;
    }
    if (value.includes('Stable')) {
      return <Badge variant="secondary">{value}</Badge>;
    }
    return <Badge variant="outline">{value}</Badge>;
  };

  const filteredOutcomes = outcomes.filter((outcome: any) => {
    const term = searchTerm.toLowerCase();
    return (
      outcome.patient_name?.toLowerCase().includes(term) ||
      outcome.outcome_type?.toLowerCase().includes(term) ||
      outcome.outcome_value?.toLowerCase().includes(term)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Trial Outcomes</h1>
            <p className="text-muted-foreground">Patient outcome records</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search outcomes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Outcome
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-background">
              <DialogHeader>
                <DialogTitle>Add New Outcome</DialogTitle>
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
                  <Label htmlFor="outcome_type">Outcome Type</Label>
                  <Input
                    id="outcome_type"
                    value={formData.outcome_type}
                    onChange={(e) => setFormData({ ...formData, outcome_type: e.target.value })}
                    placeholder="e.g., Primary, Secondary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outcome_value">Outcome Value</Label>
                  <Input
                    id="outcome_value"
                    value={formData.outcome_value}
                    onChange={(e) => setFormData({ ...formData, outcome_value: e.target.value })}
                    placeholder="e.g., Responded, Stable, Improved"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">Create Outcome</Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Outcome ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Visit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOutcomes.map((outcome: any) => (
                <TableRow key={outcome.outcome_id}>
                  <TableCell>{outcome.outcome_id}</TableCell>
                  <TableCell className="font-medium">{outcome.patient_name}</TableCell>
                  <TableCell>Visit {outcome.visit_number}</TableCell>
                  <TableCell>{outcome.outcome_type}</TableCell>
                  <TableCell>{getOutcomeBadge(outcome.outcome_value)}</TableCell>
                  <TableCell className="max-w-md truncate">{outcome.notes}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(outcome)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, id: outcome.outcome_id })}
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
              <DialogTitle>Edit Outcome</DialogTitle>
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
                <Label htmlFor="edit_outcome_type">Outcome Type</Label>
                <Input
                  id="edit_outcome_type"
                  value={formData.outcome_type}
                  onChange={(e) => setFormData({ ...formData, outcome_type: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_outcome_value">Outcome Value</Label>
                <Input
                  id="edit_outcome_value"
                  value={formData.outcome_value}
                  onChange={(e) => setFormData({ ...formData, outcome_value: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">Update Outcome</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <AlertDialogContent className="bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the outcome record.
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
