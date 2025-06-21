import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, BoxSelect } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  available: "border-green-500/50 text-green-400 bg-green-500/10",
  checked_out: "border-blue-500/50 text-blue-400 bg-blue-500/10",
  in_repair: "border-orange-500/50 text-orange-400 bg-orange-500/10",
  maintenance: "border-yellow-500/50 text-yellow-400 bg-yellow-500/10",
  retired: "border-stone-500/50 text-stone-400 bg-stone-500/10",
  installed: "border-purple-500/50 text-purple-400 bg-purple-500/10"
};

export default function AssetCard({ asset, categories, locations }) {
  const category = categories.find(c => c.id === asset.category_id);
  const location = locations.find(l => l.id === asset.location_id);
  
  return (
    <Link to={createPageUrl(`AssetDetails?id=${asset.id}`)}>
      <Card className="hover:border-primary transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col h-full">
        <CardHeader className="p-4">
          <div className="w-full h-32 bg-secondary rounded-md flex items-center justify-center relative">
            {Array.isArray(asset.images) && asset.images.length > 0 ? (
              <img 
                src={asset.images[0]} 
                alt={asset.name}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <Package className="w-12 h-12 text-muted-foreground" />
            )}
            {asset.is_composite && (
              <Badge variant="secondary" className="absolute top-2 right-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
                <BoxSelect className="w-3 h-3 mr-1" />
                Composite
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 flex flex-col flex-grow space-y-3">
          <div className="space-y-1 flex-grow">
            <h3 className="font-semibold text-foreground text-md leading-tight">
              {asset.name}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">#{asset.asset_id}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`capitalize ${statusColors[asset.status]}`}>
                {asset.status.replace('_', ' ')}
              </Badge>
              {category && (
                <Badge variant="outline" style={{borderColor: category.color, color: category.color}} className="text-xs opacity-80">
                  {category.name}
                </Badge>
              )}
            </div>
             {location && (
              <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: location.color }} />
                 <p className="text-xs text-muted-foreground">{location.name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}