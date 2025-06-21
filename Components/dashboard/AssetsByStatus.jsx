import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle, Wrench, AlertTriangle, Archive } from "lucide-react";

const statusConfig = {
  available: {
    icon: CheckCircle,
    label: "Available",
    color: "bg-green-100 text-green-800 border-green-200"
  },
  checked_out: {
    icon: Package,
    label: "Checked Out",
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  in_repair: {
    icon: Wrench,
    label: "In Repair",
    color: "bg-orange-100 text-orange-800 border-orange-200"
  },
  maintenance: {
    icon: AlertTriangle,
    label: "Maintenance",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  retired: {
    icon: Archive,
    label: "Retired",
    color: "bg-gray-100 text-gray-800 border-gray-200"
  }
};

export default function AssetsByStatus({ statusCounts }) {
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="glass-morphism border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800">Assets by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(statusCounts).map(([status, count]) => {
            const config = statusConfig[status];
            if (!config) return null;
            
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const Icon = config.icon;
            
            return (
              <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{config.label}</p>
                    <p className="text-sm text-slate-500">{percentage.toFixed(1)}% of total</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <Badge variant="secondary" className={`${config.color} font-semibold`}>
                    {count}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}