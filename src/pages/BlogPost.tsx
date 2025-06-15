import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Eye, ArrowLeft, Share2, Copy, Check } from "lucide-react";

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

const BlogPost = () => {
  const {
    slug
  } = useParams();
  const {
    toast
  } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const dummyImages = ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop", "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400&h=250&fit=crop", "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=400&h=250&fit=crop"];
  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);
  const fetchPost = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('blogs').select(`
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
        `).eq('slug', slug).eq('status', 'published').single();
      if (error) throw error;
      if (data) {
        setPost(data);
        await supabase.rpc('increment_view_count', {
          post_id: data.id
        });
        if (data.categories) {
          fetchRelatedPosts(data.id);
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchRelatedPosts = async (currentPostId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('blogs').select(`
          id,
          title,
          slug,
          excerpt,
          read_time,
          categories (
            name,
            color
          )
        `).eq('status', 'published').neq('id', currentPostId).limit(3);
      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const sharePost = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Post link has been copied to clipboard"
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };
  const formatContentForDisplay = (content: string) => {
    let html = content
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-4 mt-6 text-slate-800 dark:text-white">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-6 mt-8 text-slate-800 dark:text-white">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-8 mt-10 text-slate-800 dark:text-white">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-800 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-slate-700 dark:text-slate-200">$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-6 shadow-lg border border-slate-200 dark:border-slate-700" />')
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
        const languageLabel = lang || 'code';
        const cleanCode = code.trim();
        const codeId = Math.random().toString(36).substr(2, 9);
        return `<div class="relative my-6 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-lg"><div class="flex items-center justify-between px-4 py-3 bg-slate-200 dark:bg-slate-700 border-b-2 border-slate-300 dark:border-slate-600"><span class="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">${languageLabel}</span><button onclick="copyCodeToClipboard('${codeId}')"class="copy-btn flex items-center px-3 py-1.5 text-xs font-medium bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-400 dark:hover:bg-slate-500 transition-all duration-200"id="copy-btn-${codeId}"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path></svg>Copy</button></div><div class="p-4 overflow-x-auto bg-slate-50 dark:bg-slate-900"><pre class="text-sm leading-relaxed"><code id="code-${codeId}" class="text-slate-800 dark:text-slate-200" style="font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace; line-height: 1.6;">${cleanCode}</code></pre></div></div>`;
      })
      .replace(/`([^`]+)`/gim, '<code class="px-2 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-600" style="font-family: \'JetBrains Mono\', \'Fira Code\', \'Courier New\', monospace;">$1</code>')
      .replace(/^\* (.+)$/gim, '<li class="mb-2 text-slate-700 dark:text-slate-300">$1</li>')
      .replace(/^(\d+)\. (.+)$/gim, '<li class="mb-2 text-slate-700 dark:text-slate-300">$2</li>')
      .replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-6 py-2 my-4 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-r">$1</blockquote>')
      .replace(/\n/gim, '<br />');
    html = html.replace(/(<li[^>]*>.*<\/li>)/gims, '<ul class="list-disc pl-6 mb-4 space-y-1">$1</ul>');
    return html;
  };
  useEffect(() => {
    (window as any).copyCodeToClipboard = async (codeId: string) => {
      try {
        const codeElement = document.getElementById(`code-${codeId}`);
        const copyBtn = document.getElementById(`copy-btn-${codeId}`);
        if (codeElement && copyBtn) {
          await navigator.clipboard.writeText(codeElement.textContent || '');
          const originalHTML = copyBtn.innerHTML;
          copyBtn.innerHTML = `
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            Copied!
          `;
          copyBtn.classList.add('bg-green-200', 'dark:bg-green-700', 'text-green-800', 'dark:text-green-200');
          setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.classList.remove('bg-green-200', 'dark:bg-green-700', 'text-green-800', 'dark:text-green-200');
          }, 2000);
          toast({
            title: "Code copied!",
            description: "Code has been copied to clipboard"
          });
        }
      } catch (error) {
        console.error('Error copying code:', error);
        toast({
          title: "Copy failed",
          description: "Failed to copy code to clipboard",
          variant: "destructive"
        });
      }
    };
    return () => {
      delete (window as any).copyCodeToClipboard;
    };
  }, [toast]);
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
          <header className="mb-8">
            {post.categories && (
              <Badge 
                className="mb-4" 
                style={{ backgroundColor: post.categories.color + '20', color: post.categories.color }}
              >
                {post.categories.name}
              </Badge>
            )}
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-white">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6 text-slate-500 text-sm">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.created_at)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.read_time} min read
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {post.view_count || 0} views
                </span>
              </div>
              
              <Button onClick={sharePost} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </header>

          {/* Featured Image Section */}
          <div className="mb-8">
            <img 
              src={post.featured_image || dummyImages[0]} 
              alt={post.title}
              className="w-full h-auto object-contain rounded-lg shadow-lg max-h-96"
            />
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <div dangerouslySetInnerHTML={{ __html: formatContentForDisplay(post.content) }} />
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost, index) => (
                <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full bg-white/80 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={dummyImages[index % dummyImages.length]} 
                          alt={relatedPost.title}
                          className="w-full h-32 object-cover"
                          loading="lazy"
                        />
                        {relatedPost.categories && (
                          <div className="absolute top-2 left-2">
                            <Badge 
                              className="text-xs" 
                              style={{ backgroundColor: relatedPost.categories.color }}
                            >
                              {relatedPost.categories.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2 text-slate-900 dark:text-white">
                          {relatedPost.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {relatedPost.read_time} min read
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;
