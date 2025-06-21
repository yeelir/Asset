
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Asset, Category, Location, CheckoutHistory, User, AssetNote, AssetAttachment } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit, 
  Package, 
  Calendar, 
  DollarSign, 
  MapPin, 
  FolderOpen,
  User as UserIcon,
  History,
  QrCode,
  Download,
  BoxSelect,
  Tag,
  CheckCircle, // Changed from CheckIn and CheckOut
  Wrench,
  Archive,
  HardHat
} from "lucide-react";
import { format, isValid } from "date-fns";
import { createPageUrl } from "@/utils";

import CheckoutModal from "../components/assets/CheckoutModal";
import AssetHistory from "../components/assets/AssetHistory";
import AssetNotes from "../components/assets/AssetNotes";
import AssetAttachments from "../components/assets/AssetAttachments";
import CompositeAssetList from "../components/assets/CompositeAssetList";

const statusInfo = {
  available: { icon: CheckCircle, color: "text-green-500", label: "Available" }, // Updated icon
  checked_out: { icon: UserIcon, color: "text-blue-500", label: "Checked Out" }, // Updated icon
  in_repair: { icon: Wrench, color: "text-orange-500", label: "In Repair" },
  maintenance: { icon: HardHat, color: "text-yellow-500", label: "Maintenance" },
  retired: { icon: Archive, color: "text-gray-500", label: "Retired" },
  installed: { icon: Package, color: "text-purple-500", label: "Installed" }
};

export default function AssetDetails() {
  const locationRouter = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(locationRouter.search);
  const assetId = searchParams.get('id');
  
  const [asset, setAsset] = useState(null);
  const [category, setCategory] = useState(null);
  const [location, setLocation] = useState(null);
  const [checkedOutUser, setCheckedOutUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  useEffect(() => {
    if (assetId) {
      loadAssetData();
    } else {
      setIsLoading(false);
    }
  }, [assetId]);

  const loadAssetData = async () => {
    setIsLoading(true);
    try {
      const assetData = await Asset.get(assetId);
      setAsset(assetData);

      const [categoryData, locationData, userData] = await Promise.all([
        assetData.category_id ? Category.get(assetData.category_id).catch(() => null) : null,
        assetData.location_id ? Location.get(assetData.location_id).catch(() => null) : null,
        assetData.current_user ? User.filter({ email: assetData.current_user }).catch(() => []) : []
      ]);
      
      setCategory(categoryData);
      setLocation(locationData);
      setCheckedOutUser(userData?.[0] || null);

    } catch (error) {
      console.error("Error loading asset data:", error);
      setAsset(null);
    }
    setIsLoading(false);
  };
  
  const handleActionSuccess = () => {
    loadAssetData();
    setIsCheckoutModalOpen(false);
  }

  if (isLoading) {
    return <div className="text-center p-8">Loading asset details...</div>;
  }

  if (!asset) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Asset not found</h2>
        <Button onClick={() => navigate(createPageUrl("Assets"))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assets
        </Button>
      </div>
    );
  }

  const StatusIcon = statusInfo[asset.status]?.icon || Package;
  const statusColor = statusInfo[asset.status]?.color || "text-foreground";
  const statusLabel = statusInfo[asset.status]?.label || asset.status;

  const DetailItem = ({ icon: Icon, label, children }) => (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 mt-1 text-muted-foreground" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{children || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Button variant="ghost" onClick={() => navigate(createPageUrl("Assets"))} className="mb-4 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assets
          </Button>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 flex items-center justify-center rounded-md bg-secondary">
                <Package className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{asset.name}</h1>
              <p className="text-muted-foreground font-mono">#{asset.asset_id}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <Link to={createPageUrl(`AssetForm?id=${asset.id}`)}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button onClick={() => setIsCheckoutModalOpen(true)}>
            Actions
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column for details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Details</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem icon={StatusIcon} label="Status">
                <span className={statusColor}>{statusLabel}</span>
              </DetailItem>
              <DetailItem icon={FolderOpen} label="Category">
                {category ? (
                  <Badge variant="outline" style={{borderColor: category.color}}>{category.name}</Badge>
                ) : 'N/A'}
              </DetailItem>
              <DetailItem icon={MapPin} label="Location">
                {location ? location.name : 'N/A'}
              </DetailItem>
              <DetailItem icon={Package} label="Make / Model">
                {asset.make || asset.model ? `${asset.make || ''} ${asset.model || ''}`.trim() : 'N/A'}
              </DetailItem>
               <DetailItem icon={Tag} label="Serial Number">
                {asset.serial_number}
              </DetailItem>
              <DetailItem icon={DollarSign} label="Purchase Price">
                {typeof asset.purchase_price === 'number' ? `$${asset.purchase_price.toLocaleString()}` : 'N/A'}
              </DetailItem>
              <DetailItem icon={Calendar} label="Purchase Date">
                {isValid(new Date(asset.purchase_date)) ? format(new Date(asset.purchase_date), 'PPP') : 'N/A'}
              </DetailItem>
               {asset.status === 'checked_out' && (
                <>
                  <DetailItem icon={UserIcon} label="Checked Out To">
                    {checkedOutUser ? checkedOutUser.full_name : asset.current_user}
                  </DetailItem>
                   <DetailItem icon={Calendar} label="Expected Return">
                    {isValid(new Date(asset.expected_return_date)) ? format(new Date(asset.expected_return_date), 'PPP') : 'N/A'}
                  </DetailItem>
                </>
              )}
            </CardContent>
          </Card>
          
           {asset.is_composite && (
              <CompositeAssetList parentAssetId={asset.id} />
           )}
          
           <AssetHistory assetId={asset.id} />
        </div>

        {/* Right column for notes and attachments */}
        <div className="space-y-6">
          <AssetNotes assetId={asset.id} />
          <AssetAttachments assetId={asset.id} />
        </div>
      </div>
      
      <CheckoutModal 
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        asset={asset}
        onActionSuccess={handleActionSuccess}
      />
    </div>
  );
}
