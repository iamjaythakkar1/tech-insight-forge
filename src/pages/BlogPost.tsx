
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/Navigation";
import { Calendar, User, Clock, ArrowLeft, MessageCircle, Reply, Heart } from "lucide-react";
import { toast } from "sonner";

// Dummy blog data (in real app, this would come from database)
const blogPosts = [
  {
    id: 1,
    title: "The Future of React: Server Components and Beyond",
    content: `
      <p>React Server Components represent a paradigm shift in how we build React applications. They allow us to render components on the server, reducing bundle size and improving performance.</p>
      
      <h2>What are Server Components?</h2>
      <p>Server Components are React components that run on the server and never ship to the client. This means they can access server-side resources directly, such as databases, file systems, or APIs.</p>
      
      <pre><code>
// Example of a Server Component
async function BlogPost({ id }) {
  const post = await db.posts.findById(id);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
      </code></pre>
      
      <h2>Benefits of Server Components</h2>
      <ul>
        <li><strong>Reduced Bundle Size:</strong> Server Components don't ship to the client</li>
        <li><strong>Better Performance:</strong> Data fetching happens on the server</li>
        <li><strong>Improved SEO:</strong> Content is rendered on the server</li>
        <li><strong>Direct Database Access:</strong> No need for API endpoints</li>
      </ul>
      
      <h2>The Future</h2>
      <p>As React Server Components mature, we'll see even more innovative patterns emerge. The combination of server and client components will enable us to build applications that are both performant and interactive.</p>
    `,
    category: "React",
    author: "Tech Insider",
    date: "2024-05-30",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop",
    readTime: "8 min read"
  }
];

const dummyComments = [
  {
    id: 1,
    author: "Developer123",
    content: "Great article! Server Components are definitely the future of React development.",
    date: "2024-05-30",
    likes: 5,
    replies: [
      {
        id: 11,
        author: "Anonymous",
        content: "I agree! The performance benefits are huge.",
        date: "2024-05-30",
        likes: 2
      }
    ]
  },
  {
    id: 2,
    author: "Anonymous",
    content: "Can you provide more examples of when to use Server Components vs Client Components?",
    date: "2024-05-30",
    likes: 3,
    replies: []
  }
];

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState(dummyComments);
  const [newComment, setNewComment] = useState("");
  const [commenterName, setCommenterName] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLoggedIn] = useState(false); // This will be managed by auth context later

  useEffect(() => {
    // In real app, fetch post from database
    const foundPost = blogPosts.find(p => p.id === parseInt(id));
    setPost(foundPost);
  }, [id]);

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    const comment = {
      id: Date.now(),
      author: isLoggedIn ? "Current User" : (commenterName || "Anonymous"),
      content: newComment,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment("");
    setCommenterName("");
    toast.success("Comment added successfully!");
  };

  const handleAddReply = (commentId) => {
    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    const reply = {
      id: Date.now(),
      author: isLoggedIn ? "Current User" : "Anonymous",
      content: replyContent,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));

    setReplyContent("");
    setReplyTo(null);
    toast.success("Reply added successfully!");
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 reading:bg-amber-50">
      <Navigation />
      
      <article className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-8">
          <Badge className="mb-4">{post.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 dark:text-white reading:text-amber-900">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-6 text-slate-600 dark:text-slate-300 reading:text-amber-700 mb-8">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>

          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert reading:prose-amber">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Comments Section */}
        <section className="mt-16 border-t border-slate-200 dark:border-slate-700 pt-8">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Leave a Comment</h3>
              {!isLoggedIn && (
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
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold">{comment.author}</span>
                        <span className="text-slate-500 text-sm ml-2">{comment.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4 mr-1" />
                        {comment.likes}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
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
                  {comment.replies.length > 0 && (
                    <div className="mt-4 pl-6 border-l-2 border-slate-200 space-y-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {reply.author.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm">{reply.author}</span>
                              <span className="text-slate-500 text-xs">{reply.date}</span>
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
        </section>
      </article>
    </div>
  );
};

export default BlogPost;
