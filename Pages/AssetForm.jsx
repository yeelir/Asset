import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Asset, Category, Location } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function AssetForm() {
  const locationRouter = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(locationRouter.search);
  const assetId = searchParams.get('id');

  const [formData, setFormData] = useState({
    name: '',
    asset_id: '',
    make: '',
    model: '',
    serial_number: '',
    category_id: null,
    location_id: null,
    status: 'available',
    purchase_date: '',
    purchase_price: '',
    supplier: '',
    description: '',
    is_composite: false,
    parent_asset_id: null
  });
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [compositeAssets, setCompositeAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState("Add New Asset");

  useEffect(() => {
    const loadAllOptions = async () => {
      const [categoriesData, locationsData, assetsData] = await Promise.all([
        Category.list(),
        Location.list(),
        Asset.filter({ is_composite: true })
      ]);
      setCategories(categoriesData);
      setLocations(locationsData);
      setCompositeAssets(assetsData);
    };

    loadAllOptions();

    if (assetId) {
      setIsLoading(true);
      setPageTitle("Edit Asset");
      Asset.get(assetId).then(asset => {
        setFormData({
            ...asset,
            purchase_date: asset.purchase_date ? asset.purchase_date.split('T')[0] : '', // Format for date input
        });
        setIsLoading(false);
      });
    }
  }, [assetId]);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const dataToSave = {
      ...formData,
      purchase_price: formData.purchase_price ? Number(formData.purchase_price) : null,
      category_id: formData.category_id || null,
      location_id: formData.location_id || null,
      parent_asset_id: formData.parent_asset_id || null,
    };

    try {
      if (assetId) {
        await Asset.update(assetId, dataToSave);
      } else {
        await Asset.create(dataToSave);
      }
      navigate(createPageUrl(assetId ? `AssetDetails?id=${assetId}` : "Assets"));
    } catch (error) {
        console.error("Failed to save asset:", error);
        alert("Failed to save asset. Check console for details.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const availableCompositeAssets = compositeAssets.filter(a => a.id !== assetId);

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
        </Button>
        <Card className="glass-morphism border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-slate-800">{pageTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Asset Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="asset_id">Asset ID *</Label>
                  <Input id="asset_id" value={formData.asset_id} onChange={(e) => handleChange('asset_id', e.target.value)} required />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" value={formData.make} onChange={(e) => handleChange('make', e.target.value)} placeholder="Manufacturer" />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" value={formData.model} onChange={(e) => handleChange('model', e.target.value)} placeholder="Model number" />
                </div>
                <div>
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input id="serial_number" value={formData.serial_number} onChange={(e) => handleChange('serial_number', e.target.value)} placeholder="Serial number" />
                </div>
              </div>
              
              <div className="space-y-2 rounded-lg p-4 bg-slate-50/50">
                  <div className="flex items-center space-x-2">
                      <Switch id="is_composite" checked={formData.is_composite} onCheckedChange={(checked) => handleChange('is_composite', checked)} />
                      <Label htmlFor="is_composite">This is a Composite Asset</Label>
                  </div>
              </div>
              
              {!formData.is_composite && (
                <div>
                  <Label htmlFor="parent_asset_id">Add to Composite (Optional)</Label>
                  <Select value={formData.parent_asset_id || ''} onValueChange={(value) => handleChange('parent_asset_id', value)}>
                    <SelectTrigger><SelectValue placeholder="Select a composite asset" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {availableCompositeAssets.map(comp => <SelectItem key={comp.id} value={comp.id}>{comp.name} (#{comp.asset_id})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category_id || ''} onValueChange={(value) => handleChange('category_id', value)}>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>No Category</SelectItem>
                      {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select value={formData.location_id || ''} onValueChange={(value) => handleChange('location_id', value)}>
                    <SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value={null}>No Location</SelectItem>
                      {locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input id="purchase_date" type="date" value={formData.purchase_date} onChange={(e) => handleChange('purchase_date', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="purchase_price">Purchase Price</Label>
                  <Input id="purchase_price" type="number" step="0.01" placeholder="0.00" value={formData.purchase_price} onChange={(e) => handleChange('purchase_price', e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" value={formData.supplier} onChange={(e) => handleChange('supplier', e.target.value)} placeholder="Supplier or vendor name" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Asset description..." rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Asset'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}