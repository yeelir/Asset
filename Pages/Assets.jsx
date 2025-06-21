import React, { useState, useEffect } from "react";
import { Asset, Category, Location, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  Filter, 
  Package, 
  Grid,
  List,
  Upload,
  Trash2,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isValid } from "date-fns";

import AssetCard from "../components/assets/AssetCard";
import AssetFilters from "../components/assets/AssetFilters";
import AssetImportModal from "../components/assets/AssetImportModal";
import MassDeleteModal from "../components/assets/MassDeleteModal";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    location: "all"
  });
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = useState(false);
  const [sortField, setSortField] = useState('created_date');
  const [sortDirection, setSortDirection] = useState('desc');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadData();
    loadCurrentUser();
    
    const searchParams = new URLSearchParams(location.search);
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [assetsData, categoriesData, locationsData] = await Promise.all([
        Asset.list('-created_date'),
        Category.list(),
        Location.list()
      ]);
      
      setAssets(assetsData);
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.warn("Could not load current user:", error);
    }
  };
  
  const handleImportSuccess = () => {
    loadData();
  };

  const handleMassDeleteSuccess = () => {
    loadData();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAssets = assets.filter(asset => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      (asset.name && asset.name.toLowerCase().includes(searchLower)) ||
      (asset.asset_id && asset.asset_id.toLowerCase().includes(searchLower)) ||
      (asset.make && asset.make.toLowerCase().includes(searchLower)) ||
      (asset.model && asset.model.toLowerCase().includes(searchLower)) ||
      (asset.serial_number && asset.serial_number.toLowerCase().includes(searchLower));
    
    const matchesStatus = filters.status === "all" || asset.status === filters.status;
    const matchesCategory = filters.category === "all" || asset.category_id === filters.category;
    const matchesLocation = filters.location === "all" || asset.location_id === filters.location;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLocation && !asset.parent_asset_id;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let aValue = a[sortField] || '';
    let bValue = b[sortField] || '';
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return sortDirection === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
  });

  const statusColors = {
    available: "border-green-500/50 text-green-500",
    checked_out: "border-blue-500/50 text-blue-500",
    in_repair: "border-orange-500/50 text-orange-500",
    maintenance: "border-yellow-500/50 text-yellow-500",
    retired: "border-gray-500/50 text-gray-500",
    installed: "border-purple-500/50 text-purple-500"
  };

  const getCategoryName = (categoryId) => categories.find(c => c.id === categoryId)?.name || 'N/A';
  const getLocationName = (locationId) => locations.find(l => l.id === locationId)?.name || 'N/A';

  const SortButton = ({ field, children }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="px-2 py-1 h-auto font-semibold flex items-center gap-1 hover:bg-secondary"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assets</h1>
          <p className="text-muted-foreground">Manage your inventory of {assets.length} assets</p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          {currentUser?.role === 'admin' && (
            <Button 
              variant="destructive"
              onClick={() => setIsMassDeleteModalOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Mass Delete
            </Button>
          )}
          <Link to={createPageUrl("AssetForm")}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by name, ID, make, model, or serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex border rounded-md overflow-hidden bg-background">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none"
                >
                  <Grid className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                   className="rounded-none"
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          <AssetFilters
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            locations={locations}
          />
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <p className="text-muted-foreground text-sm">
          Showing {sortedAssets.length} of {assets.filter(a => !a.parent_asset_id).length} top-level assets
        </p>
      </div>

      {/* Assets Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} categories={categories} locations={locations} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortButton field="name">Name</SortButton></TableHead>
                  <TableHead><SortButton field="asset_id">Asset ID</SortButton></TableHead>
                  <TableHead><SortButton field="status">Status</SortButton></TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead><SortButton field="make">Make</SortButton></TableHead>
                  <TableHead><SortButton field="model">Model</SortButton></TableHead>
                  <TableHead><SortButton field="serial_number">Serial #</SortButton></TableHead>
                  <TableHead className="text-right"><SortButton field="purchase_price">Price</SortButton></TableHead>
                  <TableHead><SortButton field="created_date">Created</SortButton></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAssets.map((asset) => (
                  <TableRow key={asset.id} onClick={() => navigate(createPageUrl(`AssetDetails?id=${asset.id}`))} className="cursor-pointer">
                    <TableCell className="font-medium text-primary hover:underline">{asset.name}</TableCell>
                    <TableCell className="font-mono text-xs">{asset.asset_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${statusColors[asset.status]}`}>
                        {asset.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{getCategoryName(asset.category_id)}</TableCell>
                    <TableCell>{getLocationName(asset.location_id)}</TableCell>
                    <TableCell>{asset.make || 'N/A'}</TableCell>
                    <TableCell>{asset.model || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-xs">{asset.serial_number || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      {typeof asset.purchase_price === 'number' ? `$${asset.purchase_price.toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell>{isValid(new Date(asset.created_date)) ? format(new Date(asset.created_date), 'MMM d, yyyy') : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {sortedAssets.length === 0 && !isLoading && (
        <Card className="text-center py-12">
           <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
           <h3 className="text-xl font-semibold text-foreground mb-2">No assets found</h3>
           <p className="text-muted-foreground mb-6">
             Try adjusting your search or filters.
           </p>
           <Link to={createPageUrl("AssetForm")}>
             <Button>
               <Plus className="w-4 h-4 mr-2" />
               Add First Asset
             </Button>
           </Link>
        </Card>
      )}
      
      <AssetImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
      
      <MassDeleteModal
        isOpen={isMassDeleteModalOpen}
        onClose={() => setIsMassDeleteModalOpen(false)}
        onDeleteSuccess={handleMassDeleteSuccess}
      />
    </div>
  );
}