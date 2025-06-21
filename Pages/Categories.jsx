import React, { useState, useEffect } from "react";
import { Category } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2,ChevronRight, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function CategoryForm({ category, allCategories, onSave, onCancel }) {
  const [formData, setFormData] = useState({ name: '', description: '', color: '#888888', parent_category_id: null });

  useEffect(() => {
    setFormData(category || { name: '', description: '', color: '#888888', parent_category_id: null });
  }, [category]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const availableParents = allCategories.filter(c => c.id !== category?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category-name">Category Name</Label>
        <Input id="category-name" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} required />
      </div>
       <div>
        <Label htmlFor="parent-category">Parent Category</Label>
        <Select value={formData.parent_category_id || ''} onValueChange={(value) => handleChange('parent_category_id', value || null)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a parent (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>None (Top-Level)</SelectItem>
            {availableParents.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="category-description">Description</Label>
        <Textarea id="category-description" value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="category-color">Color</Label>
        <div className="flex items-center gap-2">
          <Input id="category-color" type="color" value={formData.color || '#888888'} onChange={(e) => handleChange('color', e.target.value)} className="w-12 h-10 p-1" />
          <Input type="text" value={formData.color || ''} onChange={(e) => handleChange('color', e.target.value)} placeholder="#888888" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}

function CategoryList({ categories, parentId = null, onEdit, onDelete, level = 0, openCategories, setOpenCategories }) {
  const children = categories.filter(cat => cat.parent_category_id === parentId);
  if (children.length === 0) return null;
  
  const toggleCategory = (id) => {
    setOpenCategories(prev => prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-2">
      {children.map(cat => (
        <div key={cat.id}>
          <Card className="bg-card/60">
            <CardContent className="p-3 flex justify-between items-center" style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => toggleCategory(cat.id)}>
                   {openCategories.includes(cat.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="font-medium">{cat.name}</span>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={() => onEdit(cat)}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(cat.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
          {openCategories.includes(cat.id) && (
            <div className="mt-2">
              <CategoryList categories={categories} parentId={cat.id} onEdit={onEdit} onDelete={onDelete} level={level + 1} openCategories={openCategories} setOpenCategories={setOpenCategories} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openCategories, setOpenCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await Category.list();
    setCategories(data);
    // By default, open all top-level categories
    setOpenCategories(data.filter(c => !c.parent_category_id).map(c => c.id));
  };

  const handleSave = async (categoryData) => {
    if (categoryData.id) {
      await Category.update(categoryData.id, categoryData);
    } else {
      await Category.create(categoryData);
    }
    loadCategories();
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This may affect assets in this category.")) {
      await Category.delete(id);
      loadCategories();
    }
  };

  const openModal = (category = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        </div>

        <Card className="glass-morphism p-4">
          <CardContent>
            <CategoryList 
              categories={categories} 
              onEdit={openModal} 
              onDelete={handleDelete}
              openCategories={openCategories}
              setOpenCategories={setOpenCategories}
            />
             {categories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No categories found. Add one to get started.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md glass-morphism">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <CategoryForm 
            category={selectedCategory}
            allCategories={categories}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}