import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { RichEditor } from "@/components/RichEditor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Eye } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface BlogPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category_id: string;
  read_time: number;
  status: 'draft' | 'published';
}

const AdminCreatePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<BlogPost>({
    title: "",
    content: "",
    excerpt: "",
    slug: "",
    category_id: "",
    read_time: 5,
    status: 'draft'
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPost = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const handleInputChange = (field: keyof BlogPost, value: string | number) => {
    const updates: Partial<BlogPost> = { [field]: value };
    
    if (field === 'title') {
      updates.slug = generateSlug(value as string);
    }
    
    if (field === 'content') {
      updates.read_time = calculateReadTime(value as string);
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in the title and content",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const postData = {
        ...formData,
        status,
        author_id: '00000000-0000-0000-0000-000000000000' // Placeholder for now
      };

      let result;
      if (id) {
        result = await supabase
          .from('blogs')
          .update(postData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('blogs')
          .insert([postData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Post ${id ? 'updated' : 'created'} successfully`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatContentForPreview = (content: string) => {
    // Enhanced content processing with improved code block styling
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-4 mt-6 text-slate-800 dark:text-white">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-6 mt-8 text-slate-800 dark:text-white">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-8 mt-10 text-slate-800 dark:text-white">$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-slate-800 dark:text-white">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic text-slate-700 dark:text-slate-200">$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-6 shadow-lg border border-slate-200 dark:border-slate-700" />')
      
      // Enhanced Code blocks with copy functionality and improved styling
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
        const languageLabel = lang || 'code';
        const cleanCode = code.trim();
        const codeId = Math.random().toString(36).substr(2, 9);
        return `<div class="relative my-6 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 overflow-hidden shadow-sm">
          <div class="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize font-mono">${languageLabel}</span>
            <button 
              onclick="
                const code = document.getElementById('code-${codeId}').textContent;
                navigator.clipboard.writeText(code).then(() => {
                  this.textContent = 'Copied!';
                  this.classList.add('bg-green-100', 'dark:bg-green-800', 'text-green-700', 'dark:text-green-300');
                  setTimeout(() => {
                    this.textContent = 'Copy';
                    this.classList.remove('bg-green-100', 'dark:bg-green-800', 'text-green-700', 'dark:text-green-300');
                  }, 2000);
                });
              "
              class="px-3 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-200"
            >
              Copy
            </button>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-sm leading-relaxed"><code id="code-${codeId}" class="text-slate-800 dark:text-slate-200 font-mono" style="font-family: 'Courier New', Courier, monospace; line-height: 1.5;">${cleanCode}</code></pre>
          </div>
        </div>`;
      })
      
      // Inline code with better contrast
      .replace(/`([^`]+)`/gim, '<code class="px-2 py-1 text-sm font-mono bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-600">$1</code>')
      
      // Lists
      .replace(/^\* (.+)$/gim, '<li class="mb-2 text-slate-700 dark:text-slate-300">$1</li>')
      .replace(/^(\d+)\. (.+)$/gim, '<li class="mb-2 text-slate-700 dark:text-slate-300">$2</li>')
      
      // Blockquotes
      .replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-6 py-2 my-4 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-r">$1</blockquote>')
      
      // Line breaks
      .replace(/\n/gim, '<br />');

    // Wrap consecutive list items
    html = html.replace(/(<li[^>]*>.*<\/li>)/gims, '<ul class="list-disc pl-6 mb-4 space-y-1">$1</ul>');
    
    return html;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex justify-between items-center mb-8">
            <Button 
              onClick={() => setShowPreview(false)}
              variant="outline"
            >
              Back to Editor
            </Button>
            <div className="flex gap-2">
              <Button onClick={() => handleSave('draft')} disabled={loading}>
                Save as Draft
              </Button>
              <Button onClick={() => handleSave('published')} disabled={loading}>
                Publish
              </Button>
            </div>
          </div>

          <article>
            <header className="mb-8">
              {selectedCategory && (
                <Badge 
                  className="mb-4"
                  style={{ backgroundColor: selectedCategory.color + '20', color: selectedCategory.color }}
                >
                  {selectedCategory.name}
                </Badge>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-white">
                {formData.title || 'Untitled Post'}
              </h1>
              
              {formData.excerpt && (
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
                  {formData.excerpt}
                </p>
              )}
              
              <div className="flex items-center gap-6 text-slate-500 text-sm">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(new Date().toISOString())}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formData.read_time} min read
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  0 views
                </span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: formatContentForPreview(formData.content) }} />
            </div>
          </article>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{id ? 'Edit Post' : 'Create New Post'}</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowPreview(true)} variant="outline">
              Preview
            </Button>
            <Button onClick={() => handleSave('draft')} disabled={loading}>
              Save as Draft
            </Button>
            <Button onClick={() => handleSave('published')} disabled={loading}>
              Publish
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="post-slug"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief description of the post..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
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
                  <Label htmlFor="read-time">Read Time (minutes)</Label>
                  <Input
                    id="read-time"
                    type="number"
                    value={formData.read_time}
                    onChange={(e) => handleInputChange('read_time', parseInt(e.target.value) || 5)}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichEditor
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminCreatePost;
