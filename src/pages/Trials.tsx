import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { trialsAPI, sponsorsAPI, staffAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Trials() {
  const [trials, setTrials] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editingTrial, setEditingTrial] = useState<any>(null);
  const [formData, setFormData] = useState({
    trial_name: '',
    phase: '',
    start_date: '',
    end_date: '',
    description: '',
    sponsor_id: '',
    primary_investigator_id: '',
  });
  const { toast } = useToast();

  const clearForm = () => {
    setFormData({
      trial_name: '',
      phase: '',
      start_date: '',
      end_date: '',
      description: '',
      sponsor_id: '',
      primary_investigator_id: '',
    });
    setEditingTrial(null);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trialsData, sponsorsData, staffData] = await Promise.all([
        trialsAPI.getAll(),
        sponsorsAPI.getAll(),
        staffAPI.getAll(),
      ]);
      setTrials(trialsData);
      setSponsors(sponsorsData);
      setStaff(staffData);
    } catch (error) {
      toast({ title: 'Error loading data', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trialsAPI.create(formData);
      toast({ title: 'Trial created successfully' });
      setIsDialogOpen(false);
      clearForm();
      loadData();
    } catch (error) {
      toast({ title: 'Error creating trial', variant: 'destructive' });
    }
  };

  const handleEdit = (trial: any) => {
    console.log('Editing trial:', trial);
    setEditingTrial(trial);
    
    const startDate = trial.start_date ? new Date(trial.start_date).toISOString().split('T')[0] : '';
    const endDate = trial.end_date ? new Date(trial.end_date).toISOString().split('T')[0] : '';
    
    setFormData({
      trial_name: trial.trial_name || '',
      phase: trial.phase || '',
      start_date: startDate,
      end_date: endDate,
      description: trial.description || '',
      sponsor_id: (trial.sponsor_id || '').toString(),
      primary_investigator_id: (trial.primary_investigator_id || '').toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Updating trial with data:', {
        id: editingTrial.trial_id,
        formData
      });
      await trialsAPI.update(editingTrial.trial_id, formData);
      toast({ title: 'Trial updated successfully' });
      setIsEditDialogOpen(false);
      clearForm();
      loadData();
    } catch (error) {
      console.error('Error in handleUpdate:', error);
      toast({ 
        title: 'Error updating trial', 
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async () => {
    try {
      await trialsAPI.delete(deleteDialog.id);
      toast({ title: 'Trial deleted successfully' });
      setDeleteDialog({ open: false, id: null });
      loadData();
    } catch (error) {
      toast({ title: 'Error deleting trial', variant: 'destructive' });
    }
  };

  const filteredTrials = trials.filter((trial: any) =>
    trial.trial_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clinical Trials</h1>
            <p className="text-muted-foreground">Manage clinical trial studies</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) clearForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Trial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
              <DialogHeader>
                <DialogTitle>Add New Trial</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trial_name">Trial Name</Label>
                  <Input
                    id="trial_name"
                    value={formData.trial_name}
                    onChange={(e) => setFormData({ ...formData, trial_name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phase">Phase</Label>
                    <Select value={formData.phase} onValueChange={(value) => setFormData({ ...formData, phase: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="I">Phase I</SelectItem>
                        <SelectItem value="II">Phase II</SelectItem>
                        <SelectItem value="III">Phase III</SelectItem>
                        <SelectItem value="IV">Phase IV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sponsor_id">Sponsor</Label>
                    <Select value={formData.sponsor_id} onValueChange={(value) => setFormData({ ...formData, sponsor_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sponsor" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {sponsors.map((sponsor: any) => (
                          <SelectItem key={sponsor.sponsor_id} value={sponsor.sponsor_id.toString()}>
                            {sponsor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="primary_investigator_id">Primary Investigator</Label>
                    <Select value={formData.primary_investigator_id} onValueChange={(value) => setFormData({ ...formData, primary_investigator_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select investigator" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {staff.map((member: any) => (
                          <SelectItem key={member.staff_id} value={member.staff_id.toString()}>
                            {member.first_name} {member.last_name} - {member.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full">Create Trial</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Trial Name</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrials.map((trial: any) => (
                <TableRow key={trial.trial_id}>
                  <TableCell>{trial.trial_id}</TableCell>
                  <TableCell className="font-medium">{trial.trial_name}</TableCell>
                  <TableCell>Phase {trial.phase}</TableCell>
                  <TableCell>{new Date(trial.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(trial.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{trial.sponsor_name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(trial)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, id: trial.trial_id })}
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

        {/* Edit Dialog - SINGLE INSTANCE */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) clearForm();
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
            <DialogHeader>
              <DialogTitle>Edit Trial</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_trial_name">Trial Name</Label>
                <Input
                  id="edit_trial_name"
                  value={formData.trial_name}
                  onChange={(e) => setFormData({ ...formData, trial_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_phase">Phase</Label>
                  <Select value={formData.phase} onValueChange={(value) => setFormData({ ...formData, phase: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="I">Phase I</SelectItem>
                      <SelectItem value="II">Phase II</SelectItem>
                      <SelectItem value="III">Phase III</SelectItem>
                      <SelectItem value="IV">Phase IV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_sponsor_id">Sponsor</Label>
                  <Select value={formData.sponsor_id} onValueChange={(value) => setFormData({ ...formData, sponsor_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sponsor" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {sponsors.map((sponsor: any) => (
                        <SelectItem key={sponsor.sponsor_id} value={sponsor.sponsor_id.toString()}>
                          {sponsor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_start_date">Start Date</Label>
                  <Input
                    id="edit_start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_end_date">End Date</Label>
                  <Input
                    id="edit_end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit_primary_investigator_id">Primary Investigator</Label>
                  <Select value={formData.primary_investigator_id} onValueChange={(value) => setFormData({ ...formData, primary_investigator_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select investigator" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {staff.map((member: any) => (
                        <SelectItem key={member.staff_id} value={member.staff_id.toString()}>
                          {member.first_name} {member.last_name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">Update Trial</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <AlertDialogContent className="bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the trial record.
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