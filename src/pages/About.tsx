
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft, Code, Users, Target, Lightbulb } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            About TechInsight Forge
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Your ultimate destination for cutting-edge tech insights, programming tutorials, and engineering excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Our Mission</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                To empower developers and tech enthusiasts with comprehensive, up-to-date knowledge and practical insights that drive innovation and professional growth in the rapidly evolving tech landscape.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Our Vision</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                To become the leading platform where developers discover breakthrough technologies, learn cutting-edge skills, and connect with a community of forward-thinking professionals.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Code className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">What We Offer</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                In-depth tutorials, industry insights, best practices, and hands-on coding examples covering everything from frontend frameworks to backend architectures and emerging technologies.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold">Our Community</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Join thousands of developers, engineers, and tech leaders who rely on TechInsight Forge for staying ahead of the curve and building exceptional digital experiences.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Why TechInsight Forge?</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              In today's fast-paced tech world, staying updated with the latest trends, tools, and techniques is crucial. 
              TechInsight Forge bridges the gap between complex technical concepts and practical implementation, 
              making cutting-edge technology accessible to developers at all skill levels.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/categories">
                <Button>
                  Explore Categories
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
