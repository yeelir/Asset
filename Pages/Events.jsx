import React, { useState, useEffect } from "react";
import { Event, Location, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";

import EventCard from "../components/events/EventCard";
import EventFormModal from "../components/events/EventFormModal";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, locationsData, usersData] = await Promise.all([
        Event.list('-start_date'),
        Location.list(),
        User.list()
      ]);
      setEvents(eventsData);
      setLocations(locationsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading event data:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async (eventData) => {
    try {
      if (eventData.id) {
        await Event.update(eventData.id, eventData);
      } else {
        await Event.create(eventData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };
  
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              Live Events
            </h1>
            <p className="text-slate-600">
              Manage manifests for {events.length} events
            </p>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Search */}
        <Card className="glass-morphism border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search events by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-morphism border-white/20 focus:border-purple-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} locations={locations} />
          ))}
        </div>

        {filteredEvents.length === 0 && !isLoading && (
          <div className="text-center py-12 col-span-full">
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No events found</h3>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Event
            </Button>
          </div>
        )}

        <EventFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          locations={locations}
          users={users.filter(u => u.role === 'manager' || u.role === 'admin')}
        />
      </div>
    </div>
  );
}