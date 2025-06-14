
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link2, 
  Image, 
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo
} from "lucide-react";

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichEditor: React.FC<RichEditorProps> = ({ value, onChange, placeholder = "Start writing..." }) => {
  const [isPreview, setIsPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertCodeBlock = () => {
    const selection = window.getSelection();
    if (selection) {
      const range = selection.getRangeAt(0);
      const codeBlock = document.createElement('pre');
      codeBlock.style.backgroundColor = '#1e293b';
      codeBlock.style.color = '#e2e8f0';
      codeBlock.style.padding = '1rem';
      codeBlock.style.borderRadius = '0.5rem';
      codeBlock.style.fontFamily = 'Monaco, Consolas, "Courier New", monospace';
      codeBlock.style.fontSize = '0.875rem';
      codeBlock.style.overflowX = 'auto';
      codeBlock.style.margin = '1rem 0';
      
      const code = document.createElement('code');
      code.textContent = 'Your code here...';
      codeBlock.appendChild(code);
      
      range.insertNode(codeBlock);
      range.setStartAfter(codeBlock);
      selection.removeAllRanges();
      selection.addRange(range);
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const toolbarButtons = [
    { icon: Undo, command: 'undo', tooltip: 'Undo' },
    { icon: Redo, command: 'redo', tooltip: 'Redo' },
    { icon: Bold, command: 'bold', tooltip: 'Bold' },
    { icon: Italic, command: 'italic', tooltip: 'Italic' },
    { icon: Underline, command: 'underline', tooltip: 'Underline' },
    { icon: Heading1, command: 'formatBlock', value: 'h1', tooltip: 'Heading 1' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', tooltip: 'Heading 2' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', tooltip: 'Heading 3' },
    { icon: List, command: 'insertUnorderedList', tooltip: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', tooltip: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', tooltip: 'Quote' },
    { icon: AlignLeft, command: 'justifyLeft', tooltip: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', tooltip: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', tooltip: 'Align Right' },
  ];

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <div className="border-b border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800">
        <div className="flex flex-wrap gap-1">
          {toolbarButtons.map((button, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => executeCommand(button.command, button.value)}
              title={button.tooltip}
              type="button"
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
          
          <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={insertLink}
            title="Insert Link"
            type="button"
          >
            <Link2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={insertImage}
            title="Insert Image"
            type="button"
          >
            <Image className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={insertCodeBlock}
            title="Insert Code Block"
            type="button"
          >
            <Code className="h-4 w-4" />
          </Button>
          
          <div className="w-px bg-slate-300 dark:bg-slate-600 mx-1" />
          
          <Button
            variant={isPreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            title="Toggle Preview"
            type="button"
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      <div className="min-h-[400px]">
        {isPreview ? (
          <div 
            className="p-4 prose prose-slate dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
              prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900 dark:prose-strong:text-white
              prose-ul:text-slate-700 dark:prose-ul:text-slate-300
              prose-ol:text-slate-700 dark:prose-ol:text-slate-300
              prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
              prose-pre:bg-slate-900 prose-pre:text-slate-100"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            className="p-4 min-h-[400px] outline-none prose prose-slate dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
              prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-900 dark:prose-strong:text-white
              prose-ul:text-slate-700 dark:prose-ul:text-slate-300
              prose-ol:text-slate-700 dark:prose-ol:text-slate-300
              prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
              prose-pre:bg-slate-900 prose-pre:text-slate-100"
            onInput={handleInput}
            dangerouslySetInnerHTML={{ __html: value }}
            data-placeholder={placeholder}
            style={{
              wordBreak: 'break-word',
            }}
          />
        )}
      </div>
    </div>
  );
};
