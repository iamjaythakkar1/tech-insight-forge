
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code, 
  Quote,
  Type,
  Upload,
  Copy,
  Youtube,
  Eye,
  Edit
} from "lucide-react";

export const RichEditor = ({ content, onChange, placeholder }) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const textareaRef = useRef(null);

  const insertText = (before, after = "") => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    onChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const newText = content.substring(0, start) + text + content.substring(start);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleImageInsert = () => {
    if (imageUrl) {
      insertAtCursor(`\n![Image](${imageUrl})\n`);
      setImageUrl("");
      setShowImageDialog(false);
      toast.success("Image inserted!");
    }
  };

  const handleVideoInsert = () => {
    if (videoUrl) {
      // Extract YouTube video ID
      const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        insertAtCursor(`\n<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>\n`);
        toast.success("Video inserted!");
      } else {
        toast.error("Invalid YouTube URL");
      }
      setVideoUrl("");
      setShowVideoDialog(false);
    }
  };

  const handleCodeInsert = () => {
    if (codeContent) {
      const codeBlock = `\n\`\`\`${codeLanguage}\n${codeContent}\n\`\`\`\n`;
      insertAtCursor(codeBlock);
      setCodeContent("");
      setShowCodeDialog(false);
      toast.success("Code block inserted!");
    }
  };

  const processContent = (text) => {
    // Convert markdown-like syntax to HTML
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />')
      
      // Code blocks with language and copy button
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
        const uniqueId = `code-${Math.random().toString(36).substring(2, 9)}`;
        return `
          <div class="code-block relative rounded-lg overflow-hidden my-6">
            <div class="flex justify-between items-center px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white">
              <span class="text-sm font-mono">${lang || 'code'}</span>
              <button 
                onclick="(() => {
                  navigator.clipboard.writeText(document.getElementById('${uniqueId}').textContent);
                  const toast = document.createElement('div');
                  toast.className = 'fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-up';
                  toast.textContent = 'Code copied!';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 2000);
                })()"
                class="bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </button>
            </div>
            <pre class="m-0 p-4 bg-slate-100 dark:bg-slate-800 overflow-x-auto text-sm"><code id="${uniqueId}" class="font-mono text-slate-800 dark:text-slate-200">${code.trim()}</code></pre>
          </div>
        `;
      })
      
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono text-sm">$1</code>')
      
      // Lists
      .replace(/^\* (.+)$/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gim, '<li>$1. $2</li>')
      
      // Blockquotes
      .replace(/^> (.+)$/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 italic text-slate-600 dark:text-slate-400">$1</blockquote>')
      
      // Line breaks
      .replace(/\n/gim, '<br />');

    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul class="list-disc pl-5 my-4">$1</ul>');
    
    return html;
  };

  // Add a dynamic style element for the toast animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(1rem);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.3s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("**", "**")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("*", "*")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("# ", "")}
          title="Heading"
        >
          <Type className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("* ", "")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("1. ", "")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("[Link Text](url)", "")}
          title="Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageDialog(true)}
          title="Image"
        >
          <Image className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowVideoDialog(true)}
          title="YouTube Video"
        >
          <Youtube className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowCodeDialog(true)}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("> ", "")}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <div className="ml-auto">
          <Button
            type="button"
            variant={isPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="min-h-[400px]">
        {isPreview ? (
          <div className="p-6 prose prose-lg max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: processContent(content) }} />
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] border-0 resize-none focus:ring-0 rounded-none"
          />
        )}
      </div>

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Insert Image</h3>
              <Input
                placeholder="Enter image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button onClick={handleImageInsert}>Insert</Button>
                <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Video Dialog */}
      {showVideoDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Insert YouTube Video</h3>
              <Input
                placeholder="Enter YouTube URL..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button onClick={handleVideoInsert}>Insert</Button>
                <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Code Dialog */}
      {showCodeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[600px]">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Insert Code Block</h3>
              <Input
                placeholder="Language (e.g., javascript, python, html)"
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="mb-4"
              />
              <Textarea
                placeholder="Paste your code here..."
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                rows={10}
                className="mb-4 font-mono"
              />
              <div className="flex gap-2">
                <Button onClick={handleCodeInsert}>Insert</Button>
                <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export const useEffect = React.useEffect;
