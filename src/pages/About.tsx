
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Lightbulb, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About TechInsight Forge
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Your ultimate destination for cutting-edge tech insights, programming tutorials, and engineering excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold">Our Mission</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                To democratize access to high-quality technical knowledge and empower developers, engineers, and tech enthusiasts with the insights they need to excel in their careers and projects.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-2xl font-bold">Our Vision</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                To become the go-to platform for technology professionals seeking cutting-edge insights, practical tutorials, and expert guidance in an ever-evolving digital landscape.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Who We Are</h2>
            </div>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                TechInsight Forge is built by a passionate team of developers, engineers, and technology enthusiasts who believe in the power of shared knowledge. We come from diverse backgrounds in software development, system architecture, data science, and emerging technologies.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Our team is dedicated to creating content that bridges the gap between complex technical concepts and practical implementation. We understand the challenges faced by developers at all levels and strive to provide clear, actionable insights that make a real difference.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Whether you're a beginner taking your first steps in programming or a seasoned professional looking to stay ahead of the curve, TechInsight Forge is designed to support your journey with quality content, expert perspectives, and a community of like-minded individuals.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="p-6">
              <Award className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Quality Content</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Every article is carefully researched, tested, and reviewed to ensure accuracy and practical value.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Community Focus</h3>
              <p className="text-slate-600 dark:text-slate-300">
                We foster a collaborative environment where knowledge sharing and learning go hand in hand.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Lightbulb className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Innovation</h3>
              <p className="text-slate-600 dark:text-slate-300">
                We stay at the forefront of technology trends to bring you the latest insights and best practices.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Journey</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              TechInsight Forge is more than just a blog—it's a community of learners, builders, and innovators. 
              Join us as we explore the fascinating world of technology together, one insight at a time.
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default About;
