
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Eye, ArrowLeft, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  } | null;
}

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  created_at: string;
  read_time: number;
  view_count: number;
  categories: {
    id: string;
    name: string;
    color: string;
  };
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const dummyImages = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop"
  ];

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post?.categories?.id) {
      fetchRelatedPosts(post.categories.id, post.id);
    }
  }, [post]);

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
          categories (
            id,
            name,
            color
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        return;
      }

      setPost(data);
      
      // Increment view count
      if (data?.id) {
        await supabase.rpc('increment_view_count', { post_id: data.id });
      }
    } catch (error) {
      console.error('Error in fetchPost:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (categoryId: string, currentPostId: string) => {
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
      
      const typedData = data?.map(item => ({
        ...item,
        categories: item.categories as { id: string; name: string; color: string; }
      })) || [];
      
      setRelatedPosts(typedData);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const copyToClipboard = async (text: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const processContent = (content: string) => {
    // Process code blocks with copy functionality
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let processedContent = content;
    let codeBlockIndex = 0;

    processedContent = processedContent.replace(codeBlockRegex, (match, language, code) => {
      const codeId = `code-${codeBlockIndex++}`;
      const cleanCode = code.trim();
      
      return `
        <div class="code-block-container relative bg-slate-900 dark:bg-slate-800 rounded-lg my-6 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-700 border-b border-slate-700">
            <span class="text-sm text-slate-300 font-mono">${language || 'code'}</span>
            <button 
              onclick="copyCode('${codeId}', this)"
              class="copy-btn flex items-center gap-2 px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
              data-code-id="${codeId}"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Copy
            </button>
          </div>
          <pre class="p-4 overflow-x-auto"><code id="${codeId}" class="text-sm font-mono text-slate-100 language-${language || 'text'}">${cleanCode}</code></pre>
        </div>
      `;
    });

    return processedContent;
  };

  useEffect(() => {
    // Add global copy function
    (window as any).copyCode = async (codeId: string, button: HTMLElement) => {
      const codeElement = document.getElementById(codeId);
      if (codeElement) {
        try {
          await navigator.clipboard.writeText(codeElement.textContent || '');
          
          // Update button text temporarily
          const originalHTML = button.innerHTML;
          button.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Copied
          `;
          button.classList.add('bg-green-600');
          
          toast.success("Code copied to clipboard!");
          
          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('bg-green-600');
          }, 2000);
        } catch (err) {
          toast.error("Failed to copy code");
        }
      }
    };
  }, []);

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

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Post not found</h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              The blog post you're looking for doesn't exist.
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
      
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link to="/articles" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Link>

        {/* Featured Image */}
        <div className="relative mb-8 rounded-xl overflow-hidden">
          <img 
            src={dummyImages[0]}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {post.categories && (
              <Badge 
                style={{ backgroundColor: post.categories.color + '20', color: post.categories.color }}
                className="text-sm"
              >
                {post.categories.name}
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400 text-sm">
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
              {post.view_count} views
            </span>
          </div>
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-slate dark:prose-invert max-w-none prose-lg
            prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
            prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900 dark:prose-strong:text-white
            prose-ul:text-slate-700 dark:prose-ul:text-slate-300
            prose-ol:text-slate-700 dark:prose-ol:text-slate-300
            prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
            prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300"
          dangerouslySetInnerHTML={{ __html: processContent(post.content) }}
        />
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold mb-8 text-center">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost, index) => (
              <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="block group">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img 
                        src={dummyImages[(index + 1) % dummyImages.length]} 
                        alt={relatedPost.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <Badge 
                        className="absolute top-4 right-4"
                        style={{ backgroundColor: relatedPost.categories.color + '20', color: relatedPost.categories.color }}
                      >
                        {relatedPost.categories.name}
                      </Badge>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 text-sm">
                        {relatedPost.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(relatedPost.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {relatedPost.read_time} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {relatedPost.view_count}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
