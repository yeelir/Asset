import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  available: "bg-green-100 text-green-800 border-green-200",
  checked_out: "bg-blue-100 text-blue-800 border-blue-200",
  in_repair: "bg-orange-100 text-orange-800 border-orange-200",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
  retired: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function RecentAssets({ assets, isLoading }) {
  if (isLoading) {
    return (
      <Card className="glass-morphism border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">Recent Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-slate-800">Recent Assets</CardTitle>
        <Link 
          to={createPageUrl("Assets")}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {assets.map((asset) => (
            <Link
              key={asset.id}
              to={createPageUrl(`Assets/${asset.id}`)}
              className="block"
            >
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                    <Package className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{asset.name}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>#{asset.asset_id}</span>
                      {asset.purchase_price && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>${asset.purchase_price.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(asset.created_date), 'MMM d')}
                    </p>
                  </div>
                  <Badge variant="secondary" className={`${statusColors[asset.status]} font-medium`}>
                    {asset.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
          
          {assets.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No assets found</p>
              <p className="text-sm text-slate-400">Get started by adding your first asset</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}