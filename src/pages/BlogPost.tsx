import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, Eye, ArrowLeft, Share2, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from "lucide-react";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
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
    // Fix scroll to top when component mounts or slug changes
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
        
        // Fetch navigation posts and reaction counts
        await Promise.all([
          fetchNavigationPosts(data.created_at),
          fetchReactionCounts(data.id)
        ]);
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
        .single();

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
        .single();

      if (prevData) {
        setPreviousPost(prevData);
      }
    } catch (error) {
      console.error('Error fetching navigation posts:', error);
    }
  };

  const fetchReactionCounts = async (postId: string) => {
    // For now, using dummy data since we haven't created the reactions table
    // This would be replaced with actual Supabase queries once the reactions table is created
    setLikeCount(Math.floor(Math.random() * 50));
    setDislikeCount(Math.floor(Math.random() * 10));
  };

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!post) return;

    // Toggle reaction
    if (userReaction === type) {
      setUserReaction(null);
      if (type === 'like') {
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        setDislikeCount(prev => Math.max(0, prev - 1));
      }
    } else {
      // If user had opposite reaction, decrease that count
      if (userReaction === 'like' && type === 'dislike') {
        setLikeCount(prev => Math.max(0, prev - 1));
        setDislikeCount(prev => prev + 1);
      } else if (userReaction === 'dislike' && type === 'like') {
        setDislikeCount(prev => Math.max(0, prev - 1));
        setLikeCount(prev => prev + 1);
      } else {
        // No previous reaction
        if (type === 'like') {
          setLikeCount(prev => prev + 1);
        } else {
          setDislikeCount(prev => prev + 1);
        }
      }
      setUserReaction(type);
    }

    toast({
      title: userReaction === type ? "Reaction removed" : `${type === 'like' ? 'Liked' : 'Disliked'}!`,
      description: userReaction === type ? "Your reaction has been removed" : `You ${type === 'like' ? 'liked' : 'disliked'} this post`
    });

    // Here you would make the API call to save the reaction to the database
    // await supabase.from('post_reactions').upsert({ post_id: post.id, user_id, reaction_type: type });
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

          {/* HTML Content Section */}
          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <div 
              className="blog-content text-slate-700 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </div>

          {/* Like/Dislike Section */}
          <div className="flex items-center justify-center gap-4 py-8 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant={userReaction === 'like' ? "default" : "outline"}
              size="sm"
              onClick={() => handleReaction('like')}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{likeCount}</span>
            </Button>
            <Button
              variant={userReaction === 'dislike' ? "destructive" : "outline"}
              size="sm"
              onClick={() => handleReaction('dislike')}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{dislikeCount}</span>
            </Button>
          </div>

          {/* Navigation Section */}
          <div className="flex items-center justify-between py-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex-1">
              {previousPost ? (
                <Link to={`/blog/${previousPost.slug}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    <div className="text-left">
                      <div className="text-xs text-slate-500">Previous Article</div>
                      <div className="font-medium truncate max-w-48">{previousPost.title}</div>
                    </div>
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" disabled className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  <div className="text-left">
                    <div className="text-xs text-slate-500">No Previous Article</div>
                  </div>
                </Button>
              )}
            </div>
            
            <div className="flex-1 flex justify-end">
              {nextPost ? (
                <Link to={`/blog/${nextPost.slug}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Next Article</div>
                      <div className="font-medium truncate max-w-48">{nextPost.title}</div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" disabled className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">No Next Article</div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
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
