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
import { User, Event } from "@/entities/all";

export default function CheckoutModal({ isOpen, onClose, onSave, asset }) {
  const [formData, setFormData] = useState({});
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
      setFormData({
        user_email: '',
        checkout_date: new Date().toISOString().split('T')[0],
        expected_return_date: '',
        event_id: '',
        notes: ''
      });
    }
  }, [isOpen]);

  const loadOptions = async () => {
    try {
      const [usersData, eventsData] = await Promise.all([
        User.list(),
        Event.filter({ status: ['upcoming', 'active'] })
      ]);
      setUsers(usersData);
      setEvents(eventsData);
    } catch (error) {
      console.error("Error loading options:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave(formData);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg glass-morphism border-white/20">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Check Out Asset</DialogTitle>
          <p className="text-slate-600">Assign {asset?.name} to a user or event</p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="user">Assign To User *</Label>
              <Select value={formData.user_email || ''} onValueChange={(value) => handleChange('user_email', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.email}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkout_date">Checkout Date *</Label>
                <Input 
                  id="checkout_date" 
                  type="date"
                  value={formData.checkout_date || ''} 
                  onChange={(e) => handleChange('checkout_date', e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="expected_return_date">Expected Return</Label>
                <Input 
                  id="expected_return_date" 
                  type="date"
                  value={formData.expected_return_date || ''} 
                  onChange={(e) => handleChange('expected_return_date', e.target.value)} 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event">Assign to Event (Optional)</Label>
              <Select value={formData.event_id || ''} onValueChange={(value) => handleChange('event_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No Event</SelectItem>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={formData.notes || ''} 
                onChange={(e) => handleChange('notes', e.target.value)} 
                placeholder="Additional notes about this checkout..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading}
            >
              {isLoading ? 'Checking Out...' : 'Check Out Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}