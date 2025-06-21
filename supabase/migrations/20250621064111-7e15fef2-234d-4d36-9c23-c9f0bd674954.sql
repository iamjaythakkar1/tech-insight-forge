
-- Create a table for post reactions (likes/dislikes)
CREATE TABLE public.post_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blog_id, user_id)
);

-- Add RLS policies
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view all reactions (for counts)
CREATE POLICY "Anyone can view reactions" 
  ON public.post_reactions 
  FOR SELECT 
  USING (true);

-- Policy to allow authenticated users to insert their own reactions
CREATE POLICY "Users can create reactions" 
  ON public.post_reactions 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy to allow users to update their own reactions
CREATE POLICY "Users can update their own reactions" 
  ON public.post_reactions 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Policy to allow users to delete their own reactions
CREATE POLICY "Users can delete their own reactions" 
  ON public.post_reactions 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Create function to get reaction counts for a blog post
CREATE OR REPLACE FUNCTION public.get_reaction_counts(post_id UUID)
RETURNS TABLE (
  like_count BIGINT,
  dislike_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN reaction_type = 'like' THEN 1 ELSE 0 END), 0) as like_count,
    COALESCE(SUM(CASE WHEN reaction_type = 'dislike' THEN 1 ELSE 0 END), 0) as dislike_count
  FROM public.post_reactions 
  WHERE blog_id = post_id;
END;
$$;

-- Create function to get user's reaction for a specific post
CREATE OR REPLACE FUNCTION public.get_user_reaction(post_id UUID, user_id_param UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  reaction TEXT;
BEGIN
  SELECT reaction_type INTO reaction
  FROM public.post_reactions 
  WHERE blog_id = post_id AND user_id = user_id_param;
  
  RETURN reaction;
END;
$$;
