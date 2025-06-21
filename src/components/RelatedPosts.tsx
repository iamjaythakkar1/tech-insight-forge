
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

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

interface RelatedPostsProps {
  posts: RelatedPost[];
  dummyImages: string[];
}

export const RelatedPosts = ({ posts, dummyImages }: RelatedPostsProps) => {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((relatedPost, index) => (
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
  );
};
