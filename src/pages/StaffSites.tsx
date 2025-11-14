import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { staffAPI, sitesAPI, sponsorsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Users, Building2, Wallet, Plus, Edit, Trash2, Search } from 'lucide-react';

export default function StaffSites() {
  const [staff, setStaff] = useState([]);
  const [sites, setSites] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Staff state
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isEditStaffDialogOpen, setIsEditStaffDialogOpen] = useState(false);
  const [deleteStaffDialog, setDeleteStaffDialog] = useState({ open: false, id: null });
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staffFormData, setStaffFormData] = useState({
    first_name: '',
    last_name: '',
    role: '',
  });

  // Sites state
  const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false);
  const [isEditSiteDialogOpen, setIsEditSiteDialogOpen] = useState(false);
  const [deleteSiteDialog, setDeleteSiteDialog] = useState({ open: false, id: null });
  const [editingSite, setEditingSite] = useState<any>(null);
  const [siteFormData, setSiteFormData] = useState({
    name: '',
    street_address: '',
    city: '',
    site_director_id: 'none',
  });

  // Sponsors state
  const [isSponsorDialogOpen, setIsSponsorDialogOpen] = useState(false);
  const [isEditSponsorDialogOpen, setIsEditSponsorDialogOpen] = useState(false);
  const [deleteSponsorDialog, setDeleteSponsorDialog] = useState({ open: false, id: null });
  const [editingSponsor, setEditingSponsor] = useState<any>(null);
  const [sponsorFormData, setSponsorFormData] = useState({
    name: '',
    contact_person: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [staffData, sitesData, sponsorsData] = await Promise.all([
        staffAPI.getAll(),
        sitesAPI.getAll(),
        sponsorsAPI.getAll(),
      ]);
      setStaff(staffData);
      setSites(sitesData);
      setSponsors(sponsorsData);
    } catch (error) {
      toast({ title: 'Error loading data', variant: 'destructive' });
    }
  };

  // Staff handlers
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/staffandsites/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffFormData),
      });
      if (!response.ok) throw new Error('Failed to create staff');
      toast({ title: 'Staff member created successfully' });
      setIsStaffDialogOpen(false);
      loadData();
      setStaffFormData({ first_name: '', last_name: '', role: '' });
    } catch (error) {
      toast({ title: 'Error creating staff member', variant: 'destructive' });
    }
  };

  const handleEditStaff = (member: any) => {
    setEditingStaff(member);
    setStaffFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      role: member.role,
    });
    setIsEditStaffDialogOpen(true);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/staffandsites/staff/${editingStaff.staff_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffFormData),
      });
      if (!response.ok) throw new Error('Failed to update staff');
      toast({ title: 'Staff member updated successfully' });
      setIsEditStaffDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ title: 'Error updating staff member', variant: 'destructive' });
    }
  };

  const handleDeleteStaff = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/staffandsites/staff/${deleteStaffDialog.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete staff');
      toast({ title: 'Staff member deleted successfully' });
      setDeleteStaffDialog({ open: false, id: null });
      loadData();
    } catch (error) {
      toast({ title: 'Error deleting staff member', variant: 'destructive' });
    }
  };

  // Site handlers
  const handleSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/staffandsites/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteFormData),
      });
      if (!response.ok) throw new Error('Failed to create site');
      toast({ title: 'Site created successfully' });
      setIsSiteDialogOpen(false);
      loadData();
      setSiteFormData({ name: '', street_address: '', city: '', site_director_id: 'none' });
    } catch (error) {
      toast({ title: 'Error creating site', variant: 'destructive' });
    }
  };

  const handleEditSite = (site: any) => {
    setEditingSite(site);
    setSiteFormData({
      name: site.name,
      street_address: site.street_address,
      city: site.city,
      // default to existing director id (use 'none' only if explicitly none)
      site_director_id: site.site_director_id !== undefined && site.site_director_id !== null ? String(site.site_director_id) : 'none',
    });
    setIsEditSiteDialogOpen(true);
  };

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/staffandsites/sites/${editingSite.site_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteFormData),
      });
      if (!response.ok) throw new Error('Failed to update site');
      toast({ title: 'Site updated successfully' });
      setIsEditSiteDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ title: 'Error updating site', variant: 'destructive' });
    }
  };

  const handleDeleteSite = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/staffandsites/sites/${deleteSiteDialog.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete site');
      toast({ title: 'Site deleted successfully' });
      setDeleteSiteDialog({ open: false, id: null });
      loadData();
    } catch (error) {
      toast({ title: 'Error deleting site', variant: 'destructive' });
    }
  };

  // Sponsor handlers
  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/staffandsites/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sponsorFormData),
      });
      if (!response.ok) throw new Error('Failed to create sponsor');
      toast({ title: 'Sponsor created successfully' });
      setIsSponsorDialogOpen(false);
      loadData();
      setSponsorFormData({ name: '', contact_person: '' });
    } catch (error) {
      toast({ title: 'Error creating sponsor', variant: 'destructive' });
    }
  };

  const handleEditSponsor = (sponsor: any) => {
    setEditingSponsor(sponsor);
    setSponsorFormData({
      name: sponsor.name,
      contact_person: sponsor.contact_person,
    });
    setIsEditSponsorDialogOpen(true);
  };

  const handleUpdateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/staffandsites/sponsors/${editingSponsor.sponsor_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sponsorFormData),
      });
      if (!response.ok) throw new Error('Failed to update sponsor');
      toast({ title: 'Sponsor updated successfully' });
      setIsEditSponsorDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ title: 'Error updating sponsor', variant: 'destructive' });
    }
  };

  const handleDeleteSponsor = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/staffandsites/sponsors/${deleteSponsorDialog.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete sponsor');
      toast({ title: 'Sponsor deleted successfully' });
      setDeleteSponsorDialog({ open: false, id: null });
      loadData();
    } catch (error) {
      toast({ title: 'Error deleting sponsor', variant: 'destructive' });
    }
  };

  // Filter data based on search
  const filteredStaff = staff.filter((member: any) => {
    const term = searchTerm.toLowerCase();
    return (
      member.first_name?.toLowerCase().includes(term) ||
      member.last_name?.toLowerCase().includes(term) ||
      member.role?.toLowerCase().includes(term)
    );
  });

  const filteredSites = sites.filter((site: any) => {
    const term = searchTerm.toLowerCase();
    return (
      site.name?.toLowerCase().includes(term) ||
      site.city?.toLowerCase().includes(term) ||
      site.director_name?.toLowerCase().includes(term)
    );
  });

  const filteredSponsors = sponsors.filter((sponsor: any) => {
    const term = searchTerm.toLowerCase();
    return (
      sponsor.name?.toLowerCase().includes(term) ||
      sponsor.contact_person?.toLowerCase().includes(term)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Staff & Sites</h1>
            <p className="text-muted-foreground">Manage research personnel, sites, and sponsors</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Tabs defaultValue="staff" className="space-y-4">
          <TabsList>
            <TabsTrigger value="staff">
              <Users className="mr-2 h-4 w-4" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="sites">
              <Building2 className="mr-2 h-4 w-4" />
              Sites
            </TabsTrigger>
            <TabsTrigger value="sponsors">
              <Wallet className="mr-2 h-4 w-4" />
              Sponsors
            </TabsTrigger>
          </TabsList>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Research Staff</CardTitle>
                <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background">
                    <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleStaffSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={staffFormData.first_name}
                          onChange={(e) => setStaffFormData({ ...staffFormData, first_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={staffFormData.last_name}
                          onChange={(e) => setStaffFormData({ ...staffFormData, last_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                          id="role"
                          value={staffFormData.role}
                          onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                          placeholder="e.g., Principal Investigator, Coordinator"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Create Staff Member</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((member: any) => (
                      <TableRow key={member.staff_id}>
                        <TableCell>{member.staff_id}</TableCell>
                        <TableCell className="font-medium">
                          {member.first_name} {member.last_name}
                        </TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStaff(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteStaffDialog({ open: true, id: member.staff_id })}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sites Tab */}
          <TabsContent value="sites">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Research Sites</CardTitle>
                <Dialog open={isSiteDialogOpen} onOpenChange={setIsSiteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Site
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background">
                    <DialogHeader>
                      <DialogTitle>Add New Site</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSiteSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="site_name">Name</Label>
                        <Input
                          id="site_name"
                          value={siteFormData.name}
                          onChange={(e) => setSiteFormData({ ...siteFormData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="street_address">Street Address</Label>
                        <Input
                          id="street_address"
                          value={siteFormData.street_address}
                          onChange={(e) => setSiteFormData({ ...siteFormData, street_address: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={siteFormData.city}
                          onChange={(e) => setSiteFormData({ ...siteFormData, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="site_director_id">Site Director</Label>
                        <Select
                          value={siteFormData.site_director_id ?? 'none'}
                          onValueChange={(value) => setSiteFormData({ ...siteFormData, site_director_id: value ?? 'none' })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select director (optional)" />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="none">No Director</SelectItem>
                            {Array.isArray(staff) && staff.length > 0 && staff.map((member: any) => (
                              <SelectItem key={String(member.staff_id)} value={String(member.staff_id)}>
                                {member.first_name} {member.last_name} - {member.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">Create Site</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Director</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSites.map((site: any) => (
                      <TableRow key={site.site_id}>
                        <TableCell>{site.site_id}</TableCell>
                        <TableCell className="font-medium">{site.name}</TableCell>
                        <TableCell>{site.street_address}</TableCell>
                        <TableCell>{site.city}</TableCell>
                        <TableCell>{site.director_name}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSite(site)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteSiteDialog({ open: true, id: site.site_id })}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Trial Sponsors</CardTitle>
                <Dialog open={isSponsorDialogOpen} onOpenChange={setIsSponsorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Sponsor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background">
                    <DialogHeader>
                      <DialogTitle>Add New Sponsor</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSponsorSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="sponsor_name">Name</Label>
                        <Input
                          id="sponsor_name"
                          value={sponsorFormData.name}
                          onChange={(e) => setSponsorFormData({ ...sponsorFormData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_person">Contact Person</Label>
                        <Input
                          id="contact_person"
                          value={sponsorFormData.contact_person}
                          onChange={(e) => setSponsorFormData({ ...sponsorFormData, contact_person: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Create Sponsor</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSponsors.map((sponsor: any) => (
                      <TableRow key={sponsor.sponsor_id}>
                        <TableCell>{sponsor.sponsor_id}</TableCell>
                        <TableCell className="font-medium">{sponsor.name}</TableCell>
                        <TableCell>{sponsor.contact_person}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSponsor(sponsor)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteSponsorDialog({ open: true, id: sponsor.sponsor_id })}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit/Delete Dialogs for Staff */}
        <Dialog open={isEditStaffDialogOpen} onOpenChange={setIsEditStaffDialogOpen}>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_first_name">First Name</Label>
                <Input
                  id="edit_first_name"
                  value={staffFormData.first_name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_last_name">Last Name</Label>
                <Input
                  id="edit_last_name"
                  value={staffFormData.last_name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, last_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_role">Role</Label>
                <Input
                  id="edit_role"
                  value={staffFormData.role}
                  onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Update Staff Member</Button>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteStaffDialog.open} onOpenChange={(open) => setDeleteStaffDialog({ ...deleteStaffDialog, open })}>
          <AlertDialogContent className="bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this staff member record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStaff}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit/Delete Dialogs for Sites */}
        <Dialog open={isEditSiteDialogOpen} onOpenChange={setIsEditSiteDialogOpen}>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Edit Site</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateSite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_site_name">Name</Label>
                <Input
                  id="edit_site_name"
                  value={siteFormData.name}
                  onChange={(e) => setSiteFormData({ ...siteFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_street_address">Street Address</Label>
                <Input
                  id="edit_street_address"
                  value={siteFormData.street_address}
                  onChange={(e) => setSiteFormData({ ...siteFormData, street_address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_city">City</Label>
                <Input
                  id="edit_city"
                  value={siteFormData.city}
                  onChange={(e) => setSiteFormData({ ...siteFormData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_site_director_id">Site Director</Label>
                <Select
                  value={siteFormData.site_director_id ?? 'none'}
                  onValueChange={(value) => setSiteFormData({ ...siteFormData, site_director_id: value ?? 'none' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select director (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {/* In edit mode we only show staff list (do not offer 'No Director' if DB doesn't accept null) */}
                    {Array.isArray(staff) && staff.length > 0 && staff.map((member: any) => (
                      <SelectItem key={String(member.staff_id)} value={String(member.staff_id)}>
                        {member.first_name} {member.last_name} - {member.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Update Site</Button>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteSiteDialog.open} onOpenChange={(open) => setDeleteSiteDialog({ ...deleteSiteDialog, open })}>
          <AlertDialogContent className="bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this site record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSite}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit/Delete Dialogs for Sponsors */}
        <Dialog open={isEditSponsorDialogOpen} onOpenChange={setIsEditSponsorDialogOpen}>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Edit Sponsor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateSponsor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_sponsor_name">Name</Label>
                <Input
                  id="edit_sponsor_name"
                  value={sponsorFormData.name}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_contact_person">Contact Person</Label>
                <Input
                  id="edit_contact_person"
                  value={sponsorFormData.contact_person}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, contact_person: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Update Sponsor</Button>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteSponsorDialog.open} onOpenChange={(open) => setDeleteSponsorDialog({ ...deleteSponsorDialog, open })}>
          <AlertDialogContent className="bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this sponsor record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSponsor}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
