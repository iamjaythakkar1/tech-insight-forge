
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogContent } from "@/components/BlogContent";
import { BlogReactions } from "@/components/BlogReactions";
import { BlogNavigation } from "@/components/BlogNavigation";
import { RelatedPosts } from "@/components/RelatedPosts";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
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

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  read_time: number;
  categories: {
    name: string;
    color: string;
  } | null;
}

interface NavigationPost {
  slug: string;
  title: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextPost, setNextPost] = useState<NavigationPost | null>(null);
  const [previousPost, setPreviousPost] = useState<NavigationPost | null>(null);
  
  const dummyImages = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=400&h=250&fit=crop"
  ];

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
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
          featured_image,
          categories (
            name,
            color
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      if (data) {
        setPost(data);
        await supabase.rpc('increment_view_count', { post_id: data.id });
        
        if (data.categories) {
          fetchRelatedPosts(data.id);
        }
        
        await fetchNavigationPosts(data.created_at);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNavigationPosts = async (currentPostDate: string) => {
    try {
      // Fetch next post (newer)
      const { data: nextData } = await supabase
        .from('blogs')
        .select('slug, title')
        .eq('status', 'published')
        .gt('created_at', currentPostDate)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextData) {
        setNextPost(nextData);
      }

      // Fetch previous post (older)
      const { data: prevData } = await supabase
        .from('blogs')
        .select('slug, title')
        .eq('status', 'published')
        .lt('created_at', currentPostDate)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prevData) {
        setPreviousPost(prevData);
      }
    } catch (error) {
      console.error('Error fetching navigation posts:', error);
    }
  };

  const fetchRelatedPosts = async (currentPostId: string) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          slug,
          excerpt,
          read_time,
          categories (
            name,
            color
          )
        `)
        .eq('status', 'published')
        .neq('id', currentPostId)
        .limit(3);

      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/articles">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Articles
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link to="/articles">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
          </Link>
        </div>

        <article>
          <BlogHeader post={post} dummyImages={dummyImages} />
          <BlogContent content={post.content} />
          <BlogReactions postId={post.id} />
          <BlogNavigation previousPost={previousPost} nextPost={nextPost} />
        </article>

        <RelatedPosts posts={relatedPosts} dummyImages={dummyImages} />
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;
