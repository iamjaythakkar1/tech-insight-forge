import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { RichEditor } from "@/components/RichEditor";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const AdminCreatePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [readTime, setReadTime] = useState(5);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    console.log('AdminCreatePost - Auth state:', { user, loading });
    if (!loading && !user) {
      console.log('Redirecting to login...');
      navigate("/login");
      return;
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCategories();
      if (isEditing) {
        fetchBlog();
      }
    }
  }, [isEditing, id, user]);

  useEffect(() => {
    if (title && !isEditing) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [title, isEditing]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchBlog = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setTitle(data.title);
      setExcerpt(data.excerpt || '');
      setContent(data.content);
      setCategoryId(data.category_id || '');
      setSlug(data.slug);
      setStatus(data.status);
      setReadTime(data.read_time || 5);
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to fetch blog');
      navigate('/dashboard');
    }
  };

  const handleSave = async (saveStatus: 'draft' | 'published' = status) => {
    if (!title.trim() || !content.trim() || !categoryId || !slug.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const blogData = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim(),
        category_id: categoryId,
        slug: slug.trim(),
        status: saveStatus,
        read_time: readTime,
        author_id: user?.id,
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('blogs')
          .insert([blogData]);
      }

      if (result.error) throw result.error;

      toast.success(`Blog ${isEditing ? 'updated' : 'created'} successfully!`);
      navigate("/dashboard");
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
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
          <p className="text-slate-600 mb-4">Please log in to create or edit posts.</p>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <Button onClick={() => setIsPreview(false)} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Editor
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => handleSave('draft')} variant="outline" disabled={isLoading}>
                Save as Draft
              </Button>
              <Button onClick={() => handleSave('published')} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Publish'}
              </Button>
            </div>
          </div>
          
          <article>
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">{excerpt}</p>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPreview(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={() => handleSave('draft')} variant="outline" disabled={isLoading}>
              Save as Draft
            </Button>
            <Button onClick={() => handleSave('published')} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Publish'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter your blog post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="blog-post-url-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Write a brief excerpt..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="readTime">Read Time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  min="1"
                  max="60"
                  value={readTime}
                  onChange={(e) => setReadTime(parseInt(e.target.value) || 5)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <RichEditor
                content={content}
                onChange={setContent}
                placeholder="Write your blog post content..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCreatePost;
