import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  XCircle, 
  RefreshCw, 
  Clipboard, 
  Download, 
  Edit, 
  ArrowUpFromLine 
} from 'lucide-react';
import { TextStatistics, TextIssue } from '@/lib/types';

interface HighlightedText {
  text: string;
  type?: 'grammar' | 'suggestion' | 'improvement';
}

interface TextEditorPanelProps {
  title: string;
  text: string;
  onTextChange?: (text: string) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  statistics?: TextStatistics;
  similarity?: number;
  highlights?: Array<{
    start: number;
    end: number;
    type: 'grammar' | 'suggestion' | 'improvement';
  }>;
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>;
}

const TextEditorPanel: React.FC<TextEditorPanelProps> = ({
  title,
  text,
  onTextChange,
  readOnly = false,
  isLoading = false,
  statistics,
  similarity,
  highlights = [],
  actions = []
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Apply highlights if provided
  const renderHighlightedText = () => {
    if (!highlights || highlights.length === 0) {
      return text;
    }
    
    // Sort highlights by start position to process them in order
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
    
    const segments: HighlightedText[] = [];
    let lastIndex = 0;
    
    for (const highlight of sortedHighlights) {
      if (highlight.start > lastIndex) {
        // Add text before highlight
        segments.push({ text: text.slice(lastIndex, highlight.start) });
      }
      
      // Add highlighted text
      segments.push({
        text: text.slice(highlight.start, highlight.end),
        type: highlight.type
      });
      
      lastIndex = highlight.end;
    }
    
    // Add remaining text after last highlight
    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex) });
    }
    
    return (
      <>
        {segments.map((segment, index) => {
          if (!segment.type) {
            return segment.text;
          }
          
          const classes = {
            grammar: 'bg-red-100 border-b-2 border-[#FF6B6B] cursor-pointer',
            suggestion: 'bg-primary/10 border-b-2 border-primary cursor-pointer',
            improvement: 'bg-green-100 border-b-2 border-[#34C759] cursor-pointer'
          };
          
          return (
            <span key={index} className={classes[segment.type]}>
              {segment.text}
            </span>
          );
        })}
      </>
    );
  };
  
  // Handle text changes if editable
  const handleInput = () => {
    if (editorRef.current && onTextChange) {
      onTextChange(editorRef.current.innerText);
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onTextChange) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result && onTextChange) {
          onTextChange(event.target.result as string);
        }
      };
      
      reader.readAsText(file);
      e.target.value = '';
    }
  };
  
  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Clear text
  const clearText = () => {
    if (onTextChange) {
      onTextChange('');
    }
  };
  
  // Copy text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Panel header */}
      <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center space-x-4">
          {!readOnly && (
            <Button variant="ghost" size="sm" onClick={triggerFileUpload} className="text-gray-500 hover:text-primary text-sm">
              <Upload className="h-4 w-4 mr-1" />
              Upload File
            </Button>
          )}
          
          {actions.map((action, index) => (
            <Button key={index} variant="ghost" size="sm" onClick={action.onClick} className="text-gray-500 hover:text-primary text-sm">
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Text editor area */}
      <div className={`flex-1 overflow-auto p-5 bg-white ${isLoading ? 'opacity-60' : ''}`}>
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning={true}
          onInput={handleInput}
          className={`min-h-full focus:outline-none leading-relaxed ${readOnly ? 'cursor-default' : ''}`}
        >
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: text }}></div>
          )}
        </div>
      </div>
      
      {/* Panel footer with statistics */}
      <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-500">
          {statistics && (
            <>
              <span>Words: <strong>{statistics.words}</strong></span>
              <span className="mx-3">|</span>
              <span>Characters: <strong>{statistics.characters}</strong></span>
            </>
          )}
          
          {similarity !== undefined && (
            <>
              <span>Similarity: <strong>{similarity}%</strong></span>
              <span className="mx-3">|</span>
              <span>Words: <strong>{statistics?.words || 0}</strong></span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {!readOnly && (
            <Button variant="ghost" size="sm" onClick={clearText} className="text-gray-500 hover:text-primary">
              <XCircle className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          
          {readOnly && (
            <>
              <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-gray-500 hover:text-primary">
                <Clipboard className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button variant="ghost" size="sm" className="text-primary hover:underline">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".txt,.doc,.docx,.pdf,.md"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default TextEditorPanel;
