
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy,
  ArrowLeft,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  created_at: string;
  read_time: number;
  view_count: number;
  categories: {
    id: string;
    name: string;
    color: string;
    slug: string;
  } | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlogPost(slug);
    }
  }, [slug]);

  const fetchBlogPost = async (slug: string) => {
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
          categories (
            id,
            name,
            color,
            slug
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setPost(data);
      
      // Increment view count
      incrementViewCount(data.id);
      
      // Fetch related posts
      if (data.categories) {
        fetchRelatedPosts(data.id, data.categories.id);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (postId: string) => {
    try {
      await supabase.rpc('increment_view_count', { post_id: postId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const fetchRelatedPosts = async (currentPostId: string, categoryId: string) => {
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
            id,
            name,
            color
          )
        `)
        .eq('category_id', categoryId)
        .eq('status', 'published')
        .neq('id', currentPostId)
        .limit(3);

      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${post?.title}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}&title=${post?.title}`, '_blank');
  };

  const processContent = (content: string) => {
    // Convert markdown-like syntax to HTML
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />')
      
      // Code blocks with language and copy button
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
        const uniqueId = `code-${Math.random().toString(36).substring(2, 9)}`;
        return `
          <div class="code-block relative rounded-lg overflow-hidden my-6">
            <div class="flex justify-between items-center px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white">
              <span class="text-sm font-mono">${lang || 'code'}</span>
              <button 
                onclick="(() => {
                  navigator.clipboard.writeText(document.getElementById('${uniqueId}').textContent);
                  const toast = document.createElement('div');
                  toast.className = 'fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-up';
                  toast.textContent = 'Code copied!';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 2000);
                })()"
                class="bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </button>
            </div>
            <pre class="m-0 p-4 bg-slate-100 dark:bg-slate-800 overflow-x-auto text-sm"><code id="${uniqueId}" class="font-mono text-slate-800 dark:text-slate-200">${code.trim()}</code></pre>
          </div>
        `;
      })
      
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono text-sm">$1</code>')
      
      // Lists
      .replace(/^\* (.+)$/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gim, '<li>$1. $2</li>')
      
      // Blockquotes
      .replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 italic text-slate-600 dark:text-slate-400">$1</blockquote>')
      
      // Line breaks
      .replace(/\n/gim, '<br />');

    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul class="list-disc pl-5 my-4">$1</ul>');
    
    return html;
  };

  const dummyImages = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&h=400&fit=crop", 
    "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=400&fit=crop"
  ];

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
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Post Not Found</h1>
            <p className="mb-8 text-slate-600 dark:text-slate-300">Sorry, the blog post you're looking for doesn't exist or has been removed.</p>
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
        {/* Category */}
        {post.categories && (
          <Link to={`/category/${post.categories.slug}`} className="inline-flex mb-4">
            <Badge 
              variant="outline"
              style={{ backgroundColor: post.categories.color + '20', color: post.categories.color }}
              className="text-sm"
            >
              {post.categories.name}
            </Badge>
          </Link>
        )}
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>
        
        {/* Meta info */}
        <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-400 mb-8">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{post.read_time} min read</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{post.view_count || 1} views</span>
          </div>
        </div>
        
        {/* Featured image */}
        <div className="rounded-xl overflow-hidden mb-10 shadow-lg">
          <img 
            src={post.feature_image || dummyImages[Math.floor(Math.random() * dummyImages.length)]} 
            alt={post.title}
            className="w-full h-[24rem] object-cover"
          />
        </div>
        
        {/* Content */}
        <div 
          className="prose prose-lg max-w-none dark:prose-invert mb-10"
          dangerouslySetInnerHTML={{ __html: processContent(post.content) }}
        />
        
        {/* Share section */}
        <div className="border-t border-b border-slate-200 dark:border-slate-700 py-6 my-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-medium">Share this article</p>
            <div className="flex items-center gap-3">
              <Button onClick={shareOnFacebook} variant="outline" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button onClick={shareOnTwitter} variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button onClick={shareOnLinkedIn} variant="outline" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button onClick={copyLink} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost.id} 
                  to={`/blog/${relatedPost.slug}`}
                  className="block group"
                >
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-0">
                      <img 
                        src={dummyImages[Math.floor(Math.random() * dummyImages.length)]}
                        alt={relatedPost.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-5">
                        <h3 className="font-bold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                          {relatedPost.title}
                        </h3>
                        <div className="flex items-center text-xs text-slate-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(relatedPost.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center">
          <Link to="/articles">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
