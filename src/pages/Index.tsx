
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, User, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Navigation } from "@/components/Navigation";

// Dummy blog data
const blogPosts = [
  {
    id: 1,
    title: "The Future of React: Server Components and Beyond",
    excerpt: "Exploring the latest developments in React ecosystem and how server components are changing the game...",
    category: "React",
    author: "Tech Insider",
    date: "2024-05-30",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    readTime: "8 min read"
  },
  {
    id: 2,
    title: "Mastering TypeScript: Advanced Types and Patterns",
    excerpt: "Deep dive into TypeScript's advanced type system and learn patterns that will make your code more robust...",
    category: "TypeScript",
    author: "Code Master",
    date: "2024-05-29",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
    readTime: "12 min read"
  },
  {
    id: 3,
    title: "Building Scalable APIs with Node.js and Express",
    excerpt: "Learn best practices for creating robust and scalable REST APIs using Node.js and Express framework...",
    category: "Node.js",
    author: "Backend Pro",
    date: "2024-05-28",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop",
    readTime: "10 min read"
  },
  {
    id: 4,
    title: "CSS Grid vs Flexbox: When to Use Which",
    excerpt: "A comprehensive guide to choosing between CSS Grid and Flexbox for your layout needs...",
    category: "CSS",
    author: "Design Dev",
    date: "2024-05-27",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=400&fit=crop",
    readTime: "6 min read"
  },
  {
    id: 5,
    title: "Introduction to Machine Learning with Python",
    excerpt: "Get started with machine learning using Python and popular libraries like scikit-learn and pandas...",
    category: "Python",
    author: "AI Enthusiast",
    date: "2024-05-26",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop",
    readTime: "15 min read"
  },
  {
    id: 6,
    title: "DevOps Best Practices for Modern Applications",
    excerpt: "Essential DevOps practices every developer should know for deploying and maintaining applications...",
    category: "DevOps",
    author: "Ops Expert",
    date: "2024-05-25",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop",
    readTime: "11 min read"
  }
];

const categories = [
  { name: "React", count: 24, color: "bg-blue-500" },
  { name: "TypeScript", count: 18, color: "bg-indigo-500" },
  { name: "Node.js", count: 15, color: "bg-green-500" },
  { name: "Python", count: 22, color: "bg-yellow-500" },
  { name: "CSS", count: 12, color: "bg-pink-500" },
  { name: "DevOps", count: 9, color: "bg-purple-500" },
  { name: "JavaScript", count: 31, color: "bg-orange-500" },
  { name: "Machine Learning", count: 14, color: "bg-red-500" }
];

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slidesToShow = 6;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, blogPosts.length - slidesToShow + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, blogPosts.length - slidesToShow + 1)) % Math.max(1, blogPosts.length - slidesToShow + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            TechInsight Forge
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto animate-fade-in">
            Your ultimate destination for cutting-edge tech insights, programming tutorials, and engineering excellence.
          </p>
          <Button size="lg" className="animate-fade-in hover:scale-105 transition-transform">
            Start Reading <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Recent Posts Slider */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">Latest Articles</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={prevSlide} className="hover:scale-110 transition-transform">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextSlide} className="hover:scale-110 transition-transform">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)` }}
            >
              {blogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.id}`} className="flex-none w-80 group">
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <Badge className="absolute top-4 left-4 bg-white/90 text-slate-800">
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                        </div>
                        <span>{post.readTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-6 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800 dark:text-white">
            Explore by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.name} to={`/category/${category.name.toLowerCase()}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${category.color} rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className="text-white font-bold text-xl">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-slate-500 text-sm">{category.count} articles</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">TechInsight Forge</h3>
          <p className="text-slate-400 mb-6">Empowering developers with knowledge and insights</p>
          <div className="flex justify-center gap-6">
            <Link to="/about" className="hover:text-blue-400 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-blue-400 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
