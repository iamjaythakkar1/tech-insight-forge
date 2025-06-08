
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Calendar, Clock, ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  created_at: string;
  read_time: number;
  view_count: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  blog_count: number;
}

const Categories = () => {
  const { slug } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
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
    if (slug) {
      fetchCategoryAndPosts();
    } else {
      fetchAllCategories();
    }
  }, [slug]);

  const fetchAllCategories = async () => {
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

  const fetchCategoryAndPosts = async () => {
    try {
      // Fetch category details
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (categoryError) throw categoryError;
      
      // Create the selected category with blog_count
      const categoryWithCount: Category = {
        ...categoryData,
        blog_count: 0 // Will be updated when we fetch posts
      };
      setSelectedCategory(categoryWithCount);

      // Fetch posts for this category
      const { data: postsData, error: postsError } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          excerpt,
          slug,
          created_at,
          read_time,
          view_count
        `)
        .eq('category_id', categoryData.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);
      
      // Update the category with actual blog count
      setSelectedCategory(prev => prev ? { ...prev, blog_count: postsData?.length || 0 } : null);
    } catch (error) {
      console.error('Error fetching category and posts:', error);
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

  // Single category view
  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Link to="/categories" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>

          <div className="text-center mb-12">
            <Badge 
              className="mb-4 text-lg px-4 py-2"
              style={{ backgroundColor: selectedCategory.color + '20', color: selectedCategory.color }}
            >
              {selectedCategory.name}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-800 dark:text-white">
              {selectedCategory.name} Articles
            </h1>
            {selectedCategory.description && (
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                {selectedCategory.description}
              </p>
            )}
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="block">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={dummyImages[index % dummyImages.length]} 
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
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
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-slate-600 dark:text-slate-300">
                This category doesn't have any published articles yet.
              </p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    );
  }

  // All categories view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Browse Categories
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Explore articles by topic and discover your interests
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link key={category.id} to={`/category/${category.slug}`} className="block">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={dummyImages[index % dummyImages.length]} 
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge 
                        className="mb-2"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.blog_count} {category.blog_count === 1 ? 'Article' : 'Articles'}
                      </Badge>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-slate-200 text-sm line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="inline-flex items-center text-blue-600 group-hover:text-blue-800 transition-colors">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Explore {category.name}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No categories found</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Categories will appear here once they're created.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Categories;
