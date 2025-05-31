
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Youtube
} from "lucide-react";
import { toast } from "sonner";

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

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
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
      
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
        return `<div class="code-block" style="position: relative; background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; margin: 16px 0; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; overflow-x: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 12px;">
            <span style="color: #64748b;">${lang || 'code'}</span>
            <button onclick="navigator.clipboard.writeText(\`${code.trim()}\`); alert('Code copied!')" style="background: #334155; border: none; color: #e2e8f0; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Copy</button>
          </div>
          <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;"><code>${code.trim()}</code></pre>
        </div>`;
      })
      
      // Inline code
      .replace(/`([^`]+)`/gim, '<code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: Monaco, Menlo, monospace; font-size: 0.9em;">$1</code>')
      
      // Lists
      .replace(/^\* (.+)$/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gim, '<li>$1. $2</li>')
      
      // Blockquotes
      .replace(/^> (.+)$/gim, '<blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; font-style: italic; color: #64748b;">$1</blockquote>')
      
      // Line breaks
      .replace(/\n/gim, '<br />');

    // Wrap consecutive list items
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
    
    return html;
  };

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
            {isPreview ? "Edit" : "Preview"}
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
