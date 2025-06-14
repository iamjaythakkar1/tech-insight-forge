
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { RichEditor } from "@/components/RichEditor";
import { ArrowLeft, Upload, Save, Eye } from "lucide-react";
import { toast } from "sonner";

const categories = [
  "React", "TypeScript", "Node.js", "Python", "CSS", "DevOps", "JavaScript", "Machine Learning"
];

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    // In real app, save to database
    toast.success("Post saved successfully!");
    navigate("/");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In real app, upload to cloud storage
      const imageUrl = URL.createObjectURL(file);
      setFeaturedImage(imageUrl);
      toast.success("Image uploaded successfully!");
    }
  };

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <Button onClick={() => setIsPreview(false)} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Editor
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Post
            </Button>
          </div>
          
          <article>
            {featuredImage && (
              <img 
                src={featuredImage} 
                alt={title}
                className="w-full h-96 object-cover rounded-lg mb-8"
              />
            )}
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">{excerpt}</p>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPreview(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Post
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Blog Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter your blog post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Write a brief excerpt..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="image">Featured Image</Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image').click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Featured Image
                </Button>
              </div>
              {featuredImage && (
                <div className="mt-4">
                  <img 
                    src={featuredImage} 
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <RichEditor
                value={content}
                onChange={setContent}
                placeholder="Write your blog post content..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePost;
