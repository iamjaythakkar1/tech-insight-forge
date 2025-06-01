
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, FileText, Settings, LogOut } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  status: 'draft' | 'published';
  created_at: string;
  category: { name: string; color: string } | null;
}

const Dashboard = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      if (!isAdmin) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchBlogs();
    }
  }, [user, isAdmin]);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          excerpt,
          status,
          created_at,
          categories (
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBlogs = data.map(blog => ({
        ...blog,
        category: blog.categories
      }));

      setBlogs(formattedBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBlogs(blogs.filter(blog => blog.id !== id));
      toast.success('Blog deleted successfully');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const togglePublishStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';

    try {
      const { error } = await supabase
        .from('blogs')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setBlogs(blogs.map(blog => 
        blog.id === id ? { ...blog, status: newStatus as 'draft' | 'published' } : blog
      ));
      toast.success(`Blog ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error updating blog status:', error);
      toast.error('Failed to update blog status');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300">Manage your blog content and settings</p>
          </div>
          <div className="flex gap-2">
            <Link to="/categories-admin">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Manage Categories
              </Button>
            </Link>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Blogs</p>
                  <p className="text-2xl font-bold">{blogs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Published</p>
                  <p className="text-2xl font-bold">{blogs.filter(b => b.status === 'published').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Edit className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Drafts</p>
                  <p className="text-2xl font-bold">{blogs.filter(b => b.status === 'draft').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Blog Posts</h2>
          <Link to="/admin/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Post
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {blogs.map((blog) => (
            <Card key={blog.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{blog.title}</h3>
                      <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                        {blog.status}
                      </Badge>
                      {blog.category && (
                        <Badge 
                          variant="outline" 
                          style={{ backgroundColor: blog.category.color + '20', color: blog.category.color }}
                        >
                          {blog.category.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">{blog.excerpt}</p>
                    <p className="text-sm text-slate-500">
                      Created: {new Date(blog.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublishStatus(blog.id, blog.status)}
                    >
                      {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Link to={`/admin/edit/${blog.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBlog(blog.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {blogs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
                <p className="text-slate-600 mb-4">Create your first blog post to get started.</p>
                <Link to="/admin/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Post
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
