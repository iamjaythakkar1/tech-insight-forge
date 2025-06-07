
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, User, ArrowLeft, Folder } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string;
  blog_count: number;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  created_at: string;
  read_time: number;
}

const Categories = () => {
  const { slug } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCategoryBlogs(slug);
    } else {
      fetchAllCategories();
    }
  }, [slug]);

  const fetchAllCategories = async () => {
    try {
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

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

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryBlogs = async (categorySlug: string) => {
    try {
      // First get the category
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (categoryError) throw categoryError;

      setCurrentCategory({ ...category, blog_count: 0 });

      // Then get blogs for this category
      const { data: blogsData, error: blogsError } = await supabase
        .from('blogs')
        .select('id, title, excerpt, slug, created_at, read_time')
        .eq('category_id', category.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (blogsError) throw blogsError;

      setBlogs(blogsData || []);
      setCurrentCategory(prev => prev ? { ...prev, blog_count: blogsData?.length || 0 } : null);
    } catch (error) {
      console.error('Error fetching category blogs:', error);
      toast.error('Failed to load category content');
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
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {currentCategory ? (
          // Single category view
          <>
            <Link to="/categories" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>

            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: currentCategory.color }}
                >
                  <span className="text-white font-bold text-2xl">
                    {currentCategory.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
                    {currentCategory.name}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-300">
                    {currentCategory.blog_count} article{currentCategory.blog_count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {currentCategory.description && (
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  {currentCategory.description}
                </p>
              )}
            </div>

            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                  <Link key={blog.id} to={`/blog/${blog.slug}`} className="group">
                    <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-6xl font-bold opacity-20">
                            {blog.title.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Author
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(blog.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <span>{blog.read_time} min read</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Folder className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
                  <p className="text-slate-600">
                    This category doesn't have any published articles yet. Check back soon!
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          // All categories view
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
                Browse Categories
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Explore our content organized by topics
              </p>
            </div>

            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
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
                        <p className="text-slate-500 text-sm mb-2">
                          {category.blog_count} article{category.blog_count !== 1 ? 's' : ''}
                        </p>
                        {category.description && (
                          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Folder className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                  <p className="text-slate-600">
                    Categories will appear here once they are created.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;
