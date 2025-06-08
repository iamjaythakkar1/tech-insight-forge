
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send, MapPin } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    toast.success("Thank you for your message! We'll get back to you soon.");
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Have a question, suggestion, or just want to say hello? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold">Send us a Message</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold">Email Us</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-2">
                  General inquiries:
                </p>
                <p className="font-semibold text-blue-600">
                  hello@techinsightforge.com
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-4 mb-2">
                  Technical support:
                </p>
                <p className="font-semibold text-blue-600">
                  support@techinsightforge.com
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold">Location</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  We're a distributed team working from around the globe, 
                  united by our passion for technology and knowledge sharing.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">Quick Response</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  We typically respond to all inquiries within 24-48 hours. 
                  For urgent matters, please include "URGENT" in your subject line.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Contributing to TechInsight Forge</h2>
              <p className="text-blue-100 leading-relaxed max-w-2xl mx-auto">
                Interested in writing for us? We're always looking for passionate contributors 
                who want to share their expertise with our community. Reach out to discuss 
                collaboration opportunities!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
