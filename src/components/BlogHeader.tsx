
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogImage } from "./BlogImage";

interface BlogHeaderProps {
  post: {
    title: string;
    excerpt?: string;
    categories: {
      name: string;
      color: string;
    } | null;
    created_at: string;
    read_time: number;
    view_count: number;
    featured_image?: string;
  };
  dummyImages: string[];
}

export const BlogHeader = ({ post, dummyImages }: BlogHeaderProps) => {
  const { toast } = useToast();

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
          title: post.title,
          text: post.excerpt,
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

  return (
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

      <div className="mb-8">
        <BlogImage
          blog={post}
          dummyImages={dummyImages}
          alt={post.title}
          className="w-full h-auto object-contain rounded-lg shadow-lg max-h-96"
        />
      </div>
    </header>
  );
};
