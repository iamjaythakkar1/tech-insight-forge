
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Calendar, Clock, Eye, ArrowLeft, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  created_at: string;
  read_time: number;
  view_count: number;
  categories: {
    name: string;
    color: string;
  } | null;
  profiles: {
    username: string;
    full_name: string;
  } | null;
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
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
          created_at,
          read_time,
          view_count,
          categories (
            name,
            color
          ),
          profiles (
            username,
            full_name
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      
      setPost(data);
      
      // Increment view count
      if (data?.id) {
        await supabase.rpc('increment_view_count', { post_id: data.id });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const formatContent = (content: string) => {
    // Enhanced content processing with improved code block styling
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-4 mt-6 text-slate-800 dark:text-white">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-6 mt-8 text-slate-800 dark:text-white">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-8 mt-10 text-slate-800 dark:text-white">$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-slate-800 dark:text-white">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic text-slate-700 dark:text-slate-200">$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-6 shadow-lg border border-slate-200 dark:border-slate-700" />')
      
      // Enhanced Code blocks with copy functionality and improved styling
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
        const languageLabel = lang || 'code';
        const cleanCode = code.trim();
        const codeId = Math.random().toString(36).substr(2, 9);
        return `<div class="relative my-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div class="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300 capitalize">${languageLabel}</span>
            <button 
              onclick="
                const code = document.getElementById('code-${codeId}').textContent;
                navigator.clipboard.writeText(code).then(() => {
                  this.textContent = 'Copied!';
                  this.classList.add('bg-green-100', 'dark:bg-green-900', 'text-green-700', 'dark:text-green-300');
                  setTimeout(() => {
                    this.textContent = 'Copy';
                    this.classList.remove('bg-green-100', 'dark:bg-green-900', 'text-green-700', 'dark:text-green-300');
                  }, 2000);
                });
              "
              class="px-3 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
            >
              Copy
            </button>
          </div>
          <div class="p-4 overflow-x-auto bg-slate-50 dark:bg-slate-900">
            <pre class="text-sm leading-relaxed"><code id="code-${codeId}" class="text-slate-800 dark:text-slate-200 font-mono">${cleanCode}</code></pre>
          </div>
        </div>`;
      })
      
      // Inline code with better contrast
      .replace(/`([^`]+)`/gim, '<code class="px-2 py-1 text-sm font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-slate-200 dark:border-slate-700">$1</code>')
      
      // Lists
      .replace(/^\* (.+)$/gim, '<li class="mb-2 text-slate-700 dark:text-slate-300">$1</li>')
      .replace(/^(\d+)\. (.+)$/gim, '<li class="mb-2 text-slate-700 dark:text-slate-300">$2</li>')
      
      // Blockquotes
      .replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-6 py-2 my-4 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-r">$1</blockquote>')
      
      // Line breaks
      .replace(/\n/gim, '<br />');

    // Wrap consecutive list items
    html = html.replace(/(<li[^>]*>.*<\/li>)/gims, '<ul class="list-disc pl-6 mb-4 space-y-1">$1</ul>');
    
    return html;
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
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-slate-600 mb-4">The blog post you're looking for doesn't exist.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

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
            
            <div className="flex items-center gap-6 text-slate-500 text-sm">
              {post.profiles && (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.profiles.full_name || post.profiles.username}
                </span>
              )}
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
          </header>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
          </div>
        </article>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;
