
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight, Eye, TrendingUp } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  created_at: string;
  read_time: number;
  author_id: string;
  categories: {
    name: string;
    color: string;
    slug: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string;
  blog_count: number;
}

const Index = () => {
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);
  const [popularBlogs, setPopularBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch latest published blog posts
      const { data: latest, error: latestError } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          excerpt,
          slug,
          created_at,
          read_time,
          author_id,
          categories (
            name,
            color,
            slug
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);

      if (latestError) throw latestError;

      // Fetch popular blogs (same as latest for now - you can add view counts later)
      const { data: popular, error: popularError } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          excerpt,
          slug,
          created_at,
          read_time,
          author_id,
          categories (
            name,
            color,
            slug
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);

      if (popularError) throw popularError;

      // Fetch all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Count blogs for each category
      const categoriesWithCount = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('blogs')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'published');

          return {
            ...category,
            blog_count: count || 0
          };
        })
      );

      setLatestBlogs(latest || []);
      setPopularBlogs(popular || []);
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            TechInsight Forge
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto animate-fade-in">
            Your ultimate destination for cutting-edge tech insights, programming tutorials, and engineering excellence.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="animate-fade-in hover:scale-105 transition-transform">
              Start Reading <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/categories">
              <Button variant="outline" size="lg" className="animate-fade-in hover:scale-105 transition-transform">
                Explore Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Categories Section */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">Browse Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {categories.slice(0, 6).map((category) => (
                    <Link key={category.id} to={`/category/${category.slug}`}>
                      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <div 
                            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: category.color }}
                          >
                            <span className="text-white font-bold text-xl">
                              {category.name.charAt(0)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-slate-500 text-sm">{category.blog_count} articles</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                
                {categories.length > 6 && (
                  <div className="text-center mt-8">
                    <Link to="/categories">
                      <Button variant="outline">
                        View All Categories
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Popular Blogs */}
              <div>
                <div className="flex items-center gap-2 mb-8">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Popular Articles</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {popularBlogs.map((post) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <div className="relative h-48 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
                          {post.categories && (
                            <Badge className="absolute top-4 left-4 bg-white/90 text-slate-800">
                              {post.categories.name}
                            </Badge>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-6xl font-bold opacity-20">
                              {post.title.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Author
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <span>{post.read_time} min read</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-lg">Latest Posts</h3>
                    </div>
                    <div className="space-y-4">
                      {latestBlogs.map((post) => (
                        <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
                          <div className="border-l-4 border-blue-600 pl-4 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded transition-colors">
                            <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                              {post.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {latestBlogs.length === 0 && popularBlogs.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-semibold mb-2">Welcome to TechInsight Forge</h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-4">
                        No content available yet. Check back soon for amazing tech articles!
                      </p>
                      <Link to="/login">
                        <Button>
                          Admin Login
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">TechInsight Forge</h3>
          <p className="text-slate-400 mb-6">Empowering developers with knowledge and insights</p>
          <div className="flex justify-center gap-6">
            <Link to="/categories" className="hover:text-blue-400 transition-colors">Categories</Link>
            <Link to="/login" className="hover:text-blue-400 transition-colors">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
