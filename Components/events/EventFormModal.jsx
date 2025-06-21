import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EventFormModal({ isOpen, onClose, onSave, event, locations, users }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        start_date: event.start_date ? event.start_date.slice(0, 16) : '',
        end_date: event.end_date ? event.end_date.slice(0, 16) : ''
      });
    } else {
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        location_id: "",
        manager_email: "",
        status: "upcoming"
      });
    }
  }, [event, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg glass-morphism border-white/20">
        <DialogHeader>
          <DialogTitle className="text-slate-800">{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Event Name</Label>
              <Input id="name" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date & Time</Label>
                <Input id="start_date" type="datetime-local" value={formData.start_date || ''} onChange={(e) => handleChange('start_date', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="end_date">End Date & Time</Label>
                <Input id="end_date" type="datetime-local" value={formData.end_date || ''} onChange={(e) => handleChange('end_date', e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select value={formData.location_id || ''} onValueChange={(value) => handleChange('location_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="manager">Event Manager</Label>
              <Select value={formData.manager_email || ''} onValueChange={(value) => handleChange('manager_email', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => <SelectItem key={user.id} value={user.email}>{user.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Save Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}