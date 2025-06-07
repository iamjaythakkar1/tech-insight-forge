import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  created_at: string;
}

const CategoriesAdmin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    console.log('CategoriesAdmin - Auth state:', { user, loading });
    if (!loading && !user) {
      console.log('Redirecting to login...');
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  useEffect(() => {
    if (formData.name && !editingCategory) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, editingCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim(),
            slug: formData.slug.trim(),
            color: formData.color
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: formData.name.trim(),
            description: formData.description.trim(),
            slug: formData.slug.trim(),
            color: formData.color
          }]);

        if (error) throw error;
        toast.success('Category created successfully');
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', slug: '', color: '#3B82F6' });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      slug: category.slug,
      color: category.color
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter(cat => cat.id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', slug: '', color: '#3B82F6' });
    setEditingCategory(null);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-slate-600 mb-4">Please log in to manage categories.</p>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Manage Categories</h1>
            <p className="text-slate-600 dark:text-slate-300">Create and organize blog categories</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Category name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="category-slug"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Category description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-12 rounded border"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    <span className="text-white font-bold">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                  Slug: /{category.slug}
                </p>
                {category.description && (
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {category.description}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  Created: {new Date(category.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
              <p className="text-slate-600 mb-4">Create your first category to get started.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CategoriesAdmin;
