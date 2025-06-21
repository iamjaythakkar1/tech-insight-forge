
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationPost {
  slug: string;
  title: string;
}

interface BlogNavigationProps {
  previousPost: NavigationPost | null;
  nextPost: NavigationPost | null;
}

export const BlogNavigation = ({ previousPost, nextPost }: BlogNavigationProps) => {
  return (
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
  );
};
