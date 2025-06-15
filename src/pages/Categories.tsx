import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Calendar, Clock, Eye, ArrowLeft, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  created_at: string;
  read_time: number;
  view_count: number;
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

const Categories = () => {
  const { slug } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (slug) {
      fetchCategoryPosts();
    } else {
      fetchCategories();
    }
  }, [slug]);

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

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

      categoriesWithCounts.sort((a, b) => (b.post_count || 0) - (a.post_count || 0));
      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryPosts = async () => {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (categoryError) throw categoryError;
      setSelectedCategory(categoryData);

      const { data: postsData, error: postsError } = await supabase
        .from('blogs')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching category posts:', error);
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

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Link
            to="/categories"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-8 transition-colors"
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>

          <div className="text-center mb-12">
            <Badge 
              className="mb-4 text-lg px-4 py-2 text-white font-medium"
              style={{ backgroundColor: selectedCategory.color }}
            >
              {selectedCategory.name}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {selectedCategory.name} Articles
            </h1>
            {selectedCategory.description && (
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {selectedCategory.description}
              </p>
            )}
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="block">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={dummyImages[index % dummyImages.length]} 
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge 
                            className="text-white font-medium"
                            style={{ backgroundColor: selectedCategory.color }}
                          >
                            {selectedCategory.name}
                          </Badge>
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
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">No articles found</h3>
              <p className="text-slate-600 dark:text-slate-300">
                There are no published articles in this category yet.
              </p>
            </div>
          )}
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
            Categories
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Explore our content by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link key={category.id} to={`/category/${category.slug}`} className="block">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="w-full h-64 overflow-hidden">
                      <img 
                        src={category.image_url || dummyImages[index % dummyImages.length]} 
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge 
                        className="text-white font-medium"
                        style={{ backgroundColor: category.color }}
                      >
                        <FolderOpen className="h-4 w-4 mr-1" />
                        {category.post_count || 0} articles
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6 h-32 flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-slate-900 dark:text-white text-center">
                      {category.name}
                    </h3>
                    
                    {category.description && (
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-3 text-center">
                        {category.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">No categories found</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Categories will appear here once they are created.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Categories;
