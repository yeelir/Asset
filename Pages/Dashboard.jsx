import React, { useState, useEffect } from "react";
import { Asset, Category, Location, CheckoutHistory, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  TrendingUp, 
  AlertCircle, 
  Search, 
  Plus,
  Clock,
  MapPin,
  User as UserIcon,
  CheckCircle, 
  Wrench,
  Archive,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isValid } from "date-fns";

const StatsCard = ({ title, value, icon: Icon, trend, color, iconColor }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {trend}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-md ${color} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const statusConfig = {
  available: { icon: CheckCircle, label: "Available", color: "text-green-500" },
  checked_out: { icon: UserIcon, label: "Checked Out", color: "text-blue-500" },
  in_repair: { icon: Wrench, label: "In Repair", color: "text-orange-500" },
  maintenance: { icon: AlertCircle, label: "Maintenance", color: "text-yellow-500" },
  retired: { icon: Archive, label: "Retired", color: "text-gray-500" },
  installed: { icon: Package, label: "Installed", color: "text-purple-500" }
};

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [assetsData, categoriesData, locationsData] = await Promise.all([
        Asset.list('-created_date', 50),
        Category.list(),
        Location.list()
      ]);
      
      setAssets(assetsData);
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getStatusCounts = () => {
    return assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {});
  };

  const getTotalValue = () => {
    return assets.reduce((sum, asset) => sum + (Number(asset.purchase_price) || 0), 0);
  };

  const getOverdueAssets = () => {
    const today = new Date();
    return assets.filter(asset => {
      if (asset.status !== 'checked_out' || !asset.expected_return_date) return false;
      const returnDate = new Date(asset.expected_return_date);
      return isValid(returnDate) && returnDate < today;
    });
  };

  const statusCounts = getStatusCounts();
  const totalValue = getTotalValue();
  const overdueAssets = getOverdueAssets();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = createPageUrl(`Assets?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            An overview of your asset inventory.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex-1 md:w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          <Link to={createPageUrl("AssetForm")}>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Assets"
          value={assets.length}
          icon={Package}
          trend={`${categories.length} categories`}
          color="bg-primary/10"
          iconColor="text-primary"
        />
        <StatsCard
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={TrendingUp}
          trend={`${locations.length} locations`}
          color="bg-green-500/10"
          iconColor="text-green-500"
        />
        <StatsCard
          title="Checked Out"
          value={statusCounts.checked_out || 0}
          icon={UserIcon}
          trend={`${(( (statusCounts.checked_out || 0) / (assets.length || 1)) * 100).toFixed(0)}% of total`}
          color="bg-blue-500/10"
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Overdue"
          value={overdueAssets.length}
          icon={AlertCircle}
          trend={overdueAssets.length > 0 ? "Needs attention" : "All good"}
          color="bg-destructive/10"
          iconColor="text-destructive"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assets</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-3">
                {assets.slice(0, 5).map((asset) => (
                  <Link
                    key={asset.id}
                    to={createPageUrl(`AssetDetails?id=${asset.id}`)}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-md hover:bg-secondary">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">#{asset.asset_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <Badge variant="outline" className="font-medium capitalize border-border">
                          {asset.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isValid(new Date(asset.created_date)) ? format(new Date(asset.created_date), 'MMM d, yyyy') : 'Invalid date'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                {assets.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent assets found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assets by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(statusConfig).map(([statusKey, config]) => {
                  const count = statusCounts[statusKey] || 0;
                  if (count === 0) return null;
                  const Icon = config.icon;
                  const percentage = assets.length > 0 ? (count / assets.length) * 100 : 0;
                  
                  return (
                    <div key={statusKey} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${config.color}`} />
                        <span className="font-medium">{config.label}</span>
                       </div>
                       <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">{count}</span>
                        <div className="w-20 h-1.5 bg-secondary rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}