
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  upcoming: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800"
};

export default function EventCard({ event, locations }) {
  const locationName = locations.find(l => l.id === event.location_id)?.name || "N/A";
  
  return (
    <Link to={createPageUrl(`EventDetails?id=${event.id}`)}>
      <Card className="glass-morphism border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold text-slate-800 pr-2">{event.name}</CardTitle>
            <Badge className={`${statusColors[event.status]} font-medium capitalize`}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center gap-2 text-slate-600">
            <CalendarDays className="w-4 h-4" />
            <span>{format(new Date(event.start_date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(event.start_date), "p")} - {format(new Date(event.end_date), "p")}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>{locationName}</span>
          </div>
        </CardContent>
        <div className="p-6 pt-0 mt-auto">
          <div className="border-t border-slate-200/50 pt-4 flex justify-between items-center text-purple-600 font-medium">
            View Manifest
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
