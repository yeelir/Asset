import React, { useState, useEffect } from "react";
import { Location } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2, MapPin, ChevronRight, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function LocationForm({ location, allLocations, onSave, onCancel }) {
  const [formData, setFormData] = useState({ name: '', description: '', color: '#888888', parent_location_id: null });

  useEffect(() => {
    setFormData(location || { name: '', description: '', color: '#888888', parent_location_id: null });
  }, [location]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const availableParents = allLocations.filter(l => l.id !== location?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="location-name">Location Name</Label>
        <Input id="location-name" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="parent-location">Parent Location</Label>
        <Select value={formData.parent_location_id || ''} onValueChange={(value) => handleChange('parent_location_id', value || null)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a parent (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>None (Top-Level)</SelectItem>
            {availableParents.map(loc => (
              <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="location-description">Description</Label>
        <Textarea id="location-description" value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="location-color">Color</Label>
        <div className="flex items-center gap-2">
          <Input id="location-color" type="color" value={formData.color || '#888888'} onChange={(e) => handleChange('color', e.target.value)} className="w-12 h-10 p-1" />
          <Input type="text" value={formData.color || ''} onChange={(e) => handleChange('color', e.target.value)} placeholder="#888888" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}

function LocationList({ locations, parentId = null, onEdit, onDelete, level = 0, openLocations, setOpenLocations }) {
  const children = locations.filter(loc => loc.parent_location_id === parentId);
  if (children.length === 0) return null;

  const toggleLocation = (id) => {
    setOpenLocations(prev => prev.includes(id) ? prev.filter(locId => locId !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-2">
      {children.map(loc => (
        <div key={loc.id}>
          <Card className="bg-card/60">
            <CardContent className="p-3 flex justify-between items-center" style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}>
              <div className="flex items-center gap-3">
                 <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => toggleLocation(loc.id)}>
                   {openLocations.includes(loc.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: loc.color }} />
                <span className="font-medium">{loc.name}</span>
              </div>
              <div>
                <Button variant="ghost" size="icon" onClick={() => onEdit(loc)}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(loc.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
          {openLocations.includes(loc.id) && (
            <div className="mt-2">
              <LocationList locations={locations} parentId={loc.id} onEdit={onEdit} onDelete={onDelete} level={level + 1} openLocations={openLocations} setOpenLocations={setOpenLocations} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [openLocations, setOpenLocations] = useState([]);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const data = await Location.list();
    setLocations(data);
    setOpenLocations(data.filter(l => !l.parent_location_id).map(l => l.id));
  };

  const handleSave = async (locationData) => {
    if (locationData.id) {
      await Location.update(locationData.id, locationData);
    } else {
      await Location.create(locationData);
    }
    loadLocations();
    setIsModalOpen(false);
    setSelectedLocation(null);
  };

  const handleDelete = async (id) => {
    const children = locations.filter(l => l.parent_location_id === id);
    if (children.length > 0) {
      alert("Cannot delete a location with sub-locations. Please remove or reassign them first.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this location?")) {
      await Location.delete(id);
      loadLocations();
    }
  };

  const openModal = (location = null) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
      setIsModalOpen(false);
      setSelectedLocation(null);
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Locations</h1>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            New Location
          </Button>
        </div>

        <Card className="glass-morphism p-4">
          <CardContent>
            <LocationList 
              locations={locations} 
              onEdit={openModal} 
              onDelete={handleDelete}
              openLocations={openLocations}
              setOpenLocations={setOpenLocations}
            />
             {locations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No locations found. Add one to get started.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md glass-morphism">
          <DialogHeader>
            <DialogTitle>{selectedLocation ? "Edit Location" : "New Location"}</DialogTitle>
          </DialogHeader>
          <LocationForm 
            location={selectedLocation}
            allLocations={locations}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}