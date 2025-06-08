
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Calendar, User, Clock, ChevronRight, BookOpen, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  created_at: string;
  read_time: number;
  view_count: number;
  categories: {
    name: string;
    color: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  blog_count: number;
}

const Index = () => {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
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
    fetchFeaturedPosts();
    fetchLatestPosts();
    fetchCategories();
  }, []);

  const fetchFeaturedPosts = async () => {
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
          categories (
            name,
            color
          )
        `)
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(3);

      if (error) throw error;
      setFeaturedPosts(data || []);
    } catch (error) {
      console.error('Error fetching featured posts:', error);
    }
  };

  const fetchLatestPosts = async () => {
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
          categories (
            name,
            color
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setLatestPosts(data || []);
    } catch (error) {
      console.error('Error fetching latest posts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          color,
          blogs!blogs_category_id_fkey(id)
        `)
        .order('name');

      if (error) throw error;

      const categoriesWithCount = (data || []).map(category => ({
        ...category,
        blog_count: category.blogs ? category.blogs.length : 0
      })).sort((a, b) => b.blog_count - a.blog_count);

      setCategories(categoriesWithCount);
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
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TechInsight Forge
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            Your ultimate destination for cutting-edge tech insights, programming tutorials, and engineering excellence.
          </p>
          <Link to="/articles">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
              Start Reading
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white">
              Featured Articles
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Discover our most popular and trending content
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <CardContent className="p-0">
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  <div className="p-6">
                    {post.categories && (
                      <Badge 
                        className="mb-3"
                        style={{ backgroundColor: post.categories.color + '20', color: post.categories.color }}
                      >
                        {post.categories.name}
                      </Badge>
                    )}
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    
                    {post.excerpt && (
                      <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.read_time} min
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {post.view_count || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 px-6 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white">
                Latest Articles
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Stay updated with our newest content
              </p>
            </div>
            <Link to="/articles">
              <Button variant="outline" className="hidden md:flex">
                View All Articles
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {post.categories && (
                    <Badge 
                      className="mb-3"
                      style={{ backgroundColor: post.categories.color + '20', color: post.categories.color }}
                    >
                      {post.categories.name}
                    </Badge>
                  )}
                  
                  <h3 className="text-xl font-bold mb-3">
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  
                  {post.excerpt && (
                    <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.read_time} min
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8 md:hidden">
            <Link to="/articles">
              <Button>
                View All Articles
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Browse Categories */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800 dark:text-white">
                Browse Categories
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Explore articles by topic and interest
              </p>
            </div>
            <Link to="/categories">
              <Button variant="outline" className="hidden md:flex">
                View All Categories
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.slice(0, 6).map((category, index) => (
              <Card key={category.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={dummyImages[index % dummyImages.length]} 
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge 
                        className="mb-2"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.blog_count} {category.blog_count === 1 ? 'Article' : 'Articles'}
                      </Badge>
                      <h3 className="text-xl font-bold text-white mb-2">
                        <Link 
                          to={`/category/${category.slug}`}
                          className="hover:text-blue-200 transition-colors"
                        >
                          {category.name}
                        </Link>
                      </h3>
                      {category.description && (
                        <p className="text-slate-200 text-sm line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <Link 
                      to={`/category/${category.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Explore {category.name}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8 md:hidden">
            <Link to="/categories">
              <Button>
                View All Categories
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
