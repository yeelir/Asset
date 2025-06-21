import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Event, Asset, CheckoutHistory, User, Location } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarDays, Clock, MapPin, User as UserIcon, Package, Download, ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function EventDetails() {
  const locationRouter = useLocation();
  const searchParams = new URLSearchParams(locationRouter.search);
  const eventId = searchParams.get('id');

  const [event, setEvent] = useState(null);
  const [manifest, setManifest] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    } else {
      setIsLoading(false);
    }
  }, [eventId]);

  const loadEventData = async () => {
    setIsLoading(true);
    try {
      const eventData = await Event.get(eventId);
      const [location, manager] = await Promise.all([
        eventData.location_id ? Location.get(eventData.location_id) : null,
        eventData.manager_email ? User.filter({ email: eventData.manager_email }) : [null]
      ]);
      eventData.location = location;
      eventData.manager = manager?.[0];
      setEvent(eventData);

      const historyRecords = await CheckoutHistory.filter({ event_id: eventId });
      const assetIds = [...new Set(historyRecords.map(h => h.asset_id))];
      
      if (assetIds.length > 0) {
        const assets = await Asset.filter({ id: { in: assetIds } });
        const manifestData = assets.map(asset => {
          const record = historyRecords.find(h => h.asset_id === asset.id);
          return { ...asset, checkoutInfo: record };
        });
        setManifest(manifestData);
      } else {
        setManifest([]);
      }
    } catch (error) {
      console.error("Error loading event details:", error);
      setEvent(null);
    }
    setIsLoading(false);
  };

  const exportManifest = () => {
    const headers = ["Asset Name", "Asset ID", "Status", "Checked Out By", "Checkout Date", "Notes"];
    const csvRows = [headers.join(",")];

    manifest.forEach(item => {
      const row = [
        `"${item.name}"`,
        `"${item.asset_id}"`,
        `"${item.status}"`,
        `"${item.checkoutInfo?.user_email || 'N/A'}"`,
        `"${item.checkoutInfo ? format(new Date(item.checkoutInfo.checkout_date), 'yyyy-MM-dd') : 'N/A'}"`,
        `"${item.checkoutInfo?.notes || ''}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${event.name}-manifest.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!event) return <div className="p-8">Event not found.</div>;

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link to={createPageUrl("Events")} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to All Events
        </Link>
        
        <Card className="glass-morphism border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{event.name}</h1>
                <p className="text-slate-600 mt-2 max-w-2xl">{event.description}</p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-slate-600">
                  <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> {format(new Date(event.start_date), "MMM d, yyyy")}</div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {format(new Date(event.start_date), 'p')} to {format(new Date(event.end_date), 'p')}</div>
                  {event.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location.name}</div>}
                  {event.manager && <div className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> {event.manager.full_name}</div>}
                </div>
              </div>
              <div>
                <Badge className="capitalize bg-purple-100 text-purple-800">{event.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-white/20 shadow-xl">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-xl font-bold text-slate-800">Asset Manifest ({manifest.length})</CardTitle>
            <Button onClick={exportManifest} variant="outline" disabled={manifest.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Checked Out By</TableHead>
                  <TableHead>Checkout Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manifest.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium text-slate-800">{item.name}</div>
                      <div className="text-sm text-slate-500">#{item.asset_id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{item.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>{item.checkoutInfo?.user_email || "N/A"}</TableCell>
                    <TableCell>{item.checkoutInfo ? format(new Date(item.checkoutInfo.checkout_date), "MMM d, yyyy") : "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {manifest.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No assets have been assigned to this event yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}