import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Calendar, Clock, Eye, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  created_at: string;
  read_time: number;
  view_count: number;
  featured_image?: string;
  categories: {
    name: string;
    color: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  slug: string;
  image_url?: string;
  post_count?: number;
}

const Index = () => {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const dummyImages = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop"
  ];

  useEffect(() => {
    fetchRecentPosts();
    fetchCategories();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          excerpt,
          slug,
          created_at,
          read_time,
          view_count,
          featured_image,
          categories (
            name,
            color
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecentPosts(data || []);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')
        .limit(6);

      if (categoriesError) throw categoriesError;

      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('blogs')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('status', 'published');

          return { ...category, post_count: count || 0 };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
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
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Tech Insights & Innovations
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
          Explore cutting-edge technologies, best practices, and industry insights from our expert community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/articles">
            <Button size="lg" className="min-w-[200px]">
              Explore Articles
            </Button>
          </Link>
          <Link to="/categories">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              Browse Categories
            </Button>
          </Link>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Latest Articles</h2>
          <Link to="/articles">
            <Button variant="outline" className="group">
              View All
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentPosts.map((post, index) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full bg-white/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 backdrop-blur-sm shadow-lg">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={post.featured_image || dummyImages[index % dummyImages.length]} 
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {post.categories && (
                      <div className="absolute top-4 left-4">
                        <Badge 
                          className="text-white font-medium"
                          style={{ backgroundColor: post.categories.color }}
                        >
                          {post.categories.name}
                        </Badge>
                      </div>
                    )}
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
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Popular Categories</h2>
          <Link to="/categories">
            <Button variant="outline" className="group">
              View All
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link key={category.id} to={`/category/${category.slug}`} className="block group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 backdrop-blur-sm shadow-lg">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="w-full h-64 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                      <img 
                        src={category.image_url || dummyImages[index % dummyImages.length]} 
                        alt={category.name}
                        className="w-auto h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge 
                        className="text-white font-medium"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.post_count || 0} articles
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6 h-32 flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-slate-900 dark:text-white text-center">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 text-center">
                        {category.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
