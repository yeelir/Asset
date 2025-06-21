import React, { useState, useEffect } from 'react';
import { Asset } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BoxSelect, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';

export default function CompositeAssetList({ parentAssetId }) {
  const [childAssets, setChildAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (parentAssetId) {
      loadChildAssets();
    }
  }, [parentAssetId]);

  const loadChildAssets = async () => {
    setIsLoading(true);
    try {
      const data = await Asset.filter({ parent_asset_id: parentAssetId });
      setChildAssets(data);
    } catch (error) {
      console.error("Error loading child assets:", error);
    }
    setIsLoading(false);
  };

  return (
    <Card className="glass-morphism border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BoxSelect className="w-5 h-5" />
          Contained Assets ({childAssets.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {isLoading ? (
            Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
          ) : childAssets.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No assets have been added to this composite.</p>
          ) : (
            childAssets.map(asset => (
              <Link key={asset.id} to={createPageUrl(`AssetDetails?id=${asset.id}`)}>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">{asset.name}</p>
                      <p className="text-sm text-slate-500">#{asset.asset_id}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">{asset.status.replace(/_/g, ' ')}</Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}