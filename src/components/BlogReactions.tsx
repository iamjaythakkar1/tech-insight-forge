
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BlogReactionsProps {
  postId: string;
}

export const BlogReactions = ({ postId }: BlogReactionsProps) => {
  const { toast } = useToast();
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReactionData();
  }, [postId]);

  const fetchReactionData = async () => {
    try {
      // Get reaction counts
      const { data: counts } = await supabase.rpc('get_reaction_counts', { post_id: postId });
      
      if (counts && counts[0]) {
        setLikeCount(Number(counts[0].like_count));
        setDislikeCount(Number(counts[0].dislike_count));
      }

      // Get user's current reaction (if authenticated)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userReactionData } = await supabase.rpc('get_user_reaction', { 
          post_id: postId, 
          user_id_param: user.id 
        });
        setUserReaction(userReactionData);
      }
    } catch (error) {
      console.error('Error fetching reaction data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (type: 'like' | 'dislike') => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to react to this post",
        variant: "destructive"
      });
      return;
    }

    try {
      if (userReaction === type) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('blog_id', postId)
          .eq('user_id', user.id);
        
        setUserReaction(null);
        if (type === 'like') {
          setLikeCount(prev => Math.max(0, prev - 1));
        } else {
          setDislikeCount(prev => Math.max(0, prev - 1));
        }
        
        toast({
          title: "Reaction removed",
          description: "Your reaction has been removed"
        });
      } else {
        // Add or update reaction
        await supabase
          .from('post_reactions')
          .upsert({
            blog_id: postId,
            user_id: user.id,
            reaction_type: type
          });

        // Update counts based on previous reaction
        if (userReaction === 'like' && type === 'dislike') {
          setLikeCount(prev => Math.max(0, prev - 1));
          setDislikeCount(prev => prev + 1);
        } else if (userReaction === 'dislike' && type === 'like') {
          setDislikeCount(prev => Math.max(0, prev - 1));
          setLikeCount(prev => prev + 1);
        } else {
          if (type === 'like') {
            setLikeCount(prev => prev + 1);
          } else {
            setDislikeCount(prev => prev + 1);
          }
        }
        
        setUserReaction(type);
        toast({
          title: `${type === 'like' ? 'Liked' : 'Disliked'}!`,
          description: `You ${type === 'like' ? 'liked' : 'disliked'} this post`
        });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-4 py-8 border-t border-slate-200 dark:border-slate-700">
        <div className="animate-pulse flex gap-4">
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
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
  );
};
