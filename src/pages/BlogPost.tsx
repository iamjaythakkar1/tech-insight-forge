
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/Navigation";
import { Calendar, User, Clock, ArrowLeft, MessageCircle, Reply } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  created_at: string;
  read_time: number;
  categories: {
    name: string;
    color: string;
  } | null;
}

interface Comment {
  id: string;
  content: string;
  author_name: string | null;
  author_id: string | null;
  created_at: string;
  replies?: Comment[];
}

const BlogPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    if (!id) return;

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
          categories (
            name,
            color
          )
        `)
        .or(`id.eq.${id},slug.eq.${id}`)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('blog_id', id)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies, error: repliesError } = await supabase
            .from('comments')
            .select('*')
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          if (repliesError) throw repliesError;

          return {
            ...comment,
            replies: replies || []
          };
        })
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (!user && !commenterName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          blog_id: post?.id,
          content: newComment.trim(),
          author_name: user ? null : commenterName.trim(),
          author_id: user?.id || null
        }]);

      if (error) throw error;

      setNewComment("");
      setCommenterName("");
      toast.success("Comment added successfully!");
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          blog_id: post?.id,
          parent_id: commentId,
          content: replyContent.trim(),
          author_name: user ? null : "Anonymous",
          author_id: user?.id || null
        }]);

      if (error) throw error;

      setReplyContent("");
      setReplyTo(null);
      toast.success("Reply added successfully!");
      fetchComments();
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const processContent = (content: string) => {
    // Enhanced content processing with better code block styling
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-4 mt-6">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-6 mt-8">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-8 mt-10">$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-6 shadow-lg" />')
      
      // Enhanced Code blocks with syntax highlighting and copy button
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
        const codeId = Math.random().toString(36).substr(2, 9);
        return `<div class="code-block relative bg-slate-900 rounded-lg my-6 overflow-hidden shadow-lg border border-slate-700">
          <div class="flex items-center justify-between bg-slate-800 px-4 py-3 border-b border-slate-700">
            <span class="text-slate-300 text-sm font-medium">${lang || 'code'}</span>
            <button 
              onclick="copyToClipboard('${codeId}', this)" 
              class="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded text-xs font-medium transition-colors"
              title="Copy code"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Copy
            </button>
          </div>
          <pre class="p-4 overflow-x-auto"><code id="${codeId}" class="text-slate-100 text-sm leading-relaxed">${code.trim()}</code></pre>
        </div>
        <script>
          function copyToClipboard(codeId, button) {
            const code = document.getElementById(codeId).textContent;
            navigator.clipboard.writeText(code).then(() => {
              const originalText = button.innerHTML;
              button.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Copied!';
              button.classList.add('bg-green-600', 'hover:bg-green-700');
              button.classList.remove('bg-slate-700', 'hover:bg-slate-600');
              setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('bg-green-600', 'hover:bg-green-700');
                button.classList.add('bg-slate-700', 'hover:bg-slate-600');
              }, 2000);
            });
          }
        </script>`;
      })
      
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Lists
      .replace(/^\* (.+)$/gim, '<li class="mb-2">$1</li>')
      .replace(/^(\d+)\. (.+)$/gim, '<li class="mb-2">$1. $2</li>')
      
      // Blockquotes
      .replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-6 py-2 my-4 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-r">$1</blockquote>')
      
      // Line breaks
      .replace(/\n/gim, '<br />');

    // Wrap consecutive list items
    html = html.replace(/(<li[^>]*>.*<\/li>)/gims, '<ul class="list-disc pl-6 mb-4">$1</ul>');
    
    return html;
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

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <article className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-8">
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
          
          <div className="flex items-center gap-6 text-slate-600 dark:text-slate-300 mb-8">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Author
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {post.read_time} min read
            </span>
          </div>

          {post.excerpt && (
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 italic">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert mb-16">
          <div dangerouslySetInnerHTML={{ __html: processContent(post.content) }} />
        </div>

        {/* Comments Section */}
        <section className="border-t border-slate-200 dark:border-slate-700 pt-8">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Leave a Comment</h3>
              {!user && (
                <Input
                  placeholder="Your name (optional)"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  className="mb-4"
                />
              )}
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-4"
                rows={4}
              />
              <Button onClick={handleAddComment}>
                Post Comment
              </Button>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {(comment.author_name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold">{comment.author_name || 'Anonymous'}</span>
                        <span className="text-slate-500 text-sm ml-2">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-4">{comment.content}</p>

                  {/* Reply Form */}
                  {replyTo === comment.id && (
                    <div className="border-t pt-4">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="mb-3"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAddReply(comment.id)}>
                          Post Reply
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-6 border-l-2 border-slate-200 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {(reply.author_name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm">{reply.author_name || 'Anonymous'}</span>
                              <span className="text-slate-500 text-xs">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-sm">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {comments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
              <p className="text-slate-600">Be the first to share your thoughts!</p>
            </div>
          )}
        </section>
      </article>
    </div>
  );
};

export default BlogPost;
