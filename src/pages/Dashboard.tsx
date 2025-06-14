
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { UserManagement } from "@/components/UserManagement";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, FileText, LogOut, Folder, Users, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  status: 'draft' | 'published';
  created_at: string;
  view_count: number;
  read_time: number;
  categories: { name: string; color: string } | null;
}

interface CategoryType {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'blogs' | 'categories' | 'users'>('blogs');
  
  // Filter states for blogs
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
        return;
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBlogs();
      fetchCategories();
      fetchUserCount();
    }
  }, [user, currentPage, searchTerm, selectedCategory, sortBy, statusFilter]);

  const fetchBlogs = async () => {
    try {
      let query = supabase
        .from('blogs')
        .select(`
          id,
          title,
          excerpt,
          status,
          created_at,
          view_count,
          read_time,
          categories (
            name,
            color
          )
        `);

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%, excerpt.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      switch (sortBy) {
        case 'popularity':
          query = query.order('view_count', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'latest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Get total count for pagination
      const countQuery = supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true });
      
      if (statusFilter !== "all") {
        countQuery.eq('status', statusFilter);
      }

      const { count } = await countQuery;
      const totalCount = count || 0;
      setTotalPages(Math.ceil(totalCount / POSTS_PER_PAGE));

      // Apply pagination
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      const formattedBlogs = data.map(blog => ({
        ...blog,
        categories: blog.categories
      }));

      setBlogs(formattedBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchUserCount = async () => {
    try {
      // For now, we'll use a mock count since we can't access auth.admin
      setUserCount(1);
    } catch (error) {
      console.error('Error fetching user count:', error);
      setUserCount(0);
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

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

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

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("latest");
    setStatusFilter('all');
    setCurrentPage(1);
  };

  if (loading || isLoading || !user) {
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
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage your blog content, categories, and users
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button 
            variant={activeTab === 'blogs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('blogs')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Blogs
          </Button>
          <Button 
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('categories')}
          >
            <Folder className="mr-2 h-4 w-4" />
            Categories
          </Button>
          <Button 
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            <Users className="mr-2 h-4 w-4" />
            Users
          </Button>
        </div>

        {/* Stats Cards */}
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
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold">{userCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Folder className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Blog Posts</h2>
              <Link to="/admin/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Post
                </Button>
              </Link>
            </div>

            {/* Blog Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search blogs by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={(value: 'all' | 'published' | 'draft') => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Drafts</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={resetFilters} variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                          {blog.categories && (
                            <Badge 
                              variant="outline" 
                              style={{ backgroundColor: blog.categories.color + '20', color: blog.categories.color }}
                            >
                              {blog.categories.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-2">{blog.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>Created: {new Date(blog.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {blog.view_count || 0}
                          </span>
                          <span>{blog.read_time} min read</span>
                        </div>
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
                    <h3 className="text-lg font-semibold mb-2">No blog posts found</h3>
                    <p className="text-slate-600 mb-4">
                      {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all' 
                        ? 'Try adjusting your search criteria or filters.' 
                        : 'Create your first blog post to get started.'
                      }
                    </p>
                    {!searchTerm && selectedCategory === 'all' && statusFilter === 'all' ? (
                      <Link to="/admin/create">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create First Post
                        </Button>
                      </Link>
                    ) : (
                      <Button onClick={resetFilters}>Reset Filters</Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Link to="/categories-admin">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Manage Categories
                </Button>
              </Link>
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
                        <Link to="/categories-admin">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCategory(category.id)}
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
                  <Folder className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                  <p className="text-slate-600 mb-4">Categories will be shown here once they are created.</p>
                  <Link to="/categories-admin">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Category
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UserManagement />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
