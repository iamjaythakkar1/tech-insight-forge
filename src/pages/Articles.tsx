import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Calendar, Clock, Eye, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  created_at: string;
  read_time: number;
  view_count: number;
  status?: 'draft' | 'published';
  featured_image?: string;
  categories: {
    name: string;
    color: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

const Articles = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminView = location.pathname === "/admin/articles" && user;
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>(isAdminView ? "all" : "published");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const POSTS_PER_PAGE = 25;

  const dummyImages = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop"
  ];

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [currentPage, searchTerm, selectedCategory, sortBy, dateFrom, dateTo, statusFilter, isAdminView]);

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

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('blogs')
        .select(`
          id,
          title,
          content,
          excerpt,
          slug,
          created_at,
          read_time,
          view_count,
          status,
          featured_image,
          categories (
            name,
            color
          )
        `);

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      } else if (!isAdminView) {
        query = query.eq('status', 'published');
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%, excerpt.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo);
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

      const countQuery = supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true });
      
      if (statusFilter !== "all") {
        countQuery.eq('status', statusFilter);
      } else if (!isAdminView) {
        countQuery.eq('status', 'published');
      }

      const { count } = await countQuery;

      const totalCount = count || 0;
      setTotalPages(Math.ceil(totalCount / POSTS_PER_PAGE));

      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("latest");
    setDateFrom("");
    setDateTo("");
    setStatusFilter(isAdminView ? "all" : "published");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isAdminView ? "Manage Articles" : "All Articles"}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {isAdminView 
              ? "Manage and filter your blog articles" 
              : "Discover our complete collection of tech insights and tutorials"
            }
          </p>
        </div>

        <Card className="mb-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search articles by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
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

              {isAdminView && (
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
              )}

              <Input
                type="date"
                placeholder="From date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                aria-label="From date"
              />

              <Input
                type="date"
                placeholder="To date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                aria-label="To date"
              />

              <Button onClick={resetFilters} variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {posts.map((post, index) => (
            <Link 
              key={post.id} 
              to={isAdminView ? `/admin/edit/${post.id}` : `/blog/${post.slug}`}
              className="block group"
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={post.featured_image || dummyImages[index % dummyImages.length]} 
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {isAdminView && post.status && (
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      )}
                      {post.categories && (
                        <Badge 
                          className="text-white font-medium"
                          style={{ backgroundColor: post.categories.color }}
                        >
                          {post.categories.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-slate-900 dark:text-white">
                      {post.title}
                    </h3>
                    
                    {post.excerpt && (
                      <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.read_time} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
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

        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Articles;
