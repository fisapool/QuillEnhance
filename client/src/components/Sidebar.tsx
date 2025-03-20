import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download } from 'lucide-react';
import { ProcessType, ProcessingTool } from '@/lib/types';

interface SidebarProps {
  activeTool: ProcessType | null;
  onSelectTool: (tool: ProcessType) => void;
}

const tools: ProcessingTool[] = [
  {
    id: 'paraphrase',
    name: 'Paraphrase',
    icon: 'ri-refresh-line',
    category: 'text-processing',
    description: 'Rewrite your text while maintaining the original meaning'
  },
  {
    id: 'humanize',
    name: 'Humanize AI Text',
    icon: 'ri-user-line',
    category: 'text-processing',
    description: 'Make AI-generated text sound more natural and human'
  },
  {
    id: 'reword',
    name: 'Reword',
    icon: 'ri-edit-line',
    category: 'text-processing',
    description: 'Find alternative words for your text'
  },
  {
    id: 'rewriteParagraph',
    name: 'Rewrite Paragraph',
    icon: 'ri-text-wrap',
    category: 'text-processing',
    description: 'Completely restructure your paragraph while keeping the meaning'
  },
  {
    id: 'summarize',
    name: 'Summarize',
    icon: 'ri-file-list-3-line',
    category: 'text-processing',
    description: 'Create a concise summary of your text'
  },
  {
    id: 'grammarCheck',
    name: 'Grammar Check',
    icon: 'ri-error-warning-line',
    category: 'analysis',
    description: 'Check grammar, spelling, and punctuation'
  },
  {
    id: 'translate',
    name: 'Translate',
    icon: 'ri-translate-2',
    category: 'analysis',
    description: 'Translate your text to another language'
  }
];

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool }) => {
  // Group tools by category
  const textProcessingTools = tools.filter(tool => tool.category === 'text-processing');
  const analysisTools = tools.filter(tool => tool.category === 'analysis');
  const qualityTools = tools.filter(tool => tool.category === 'quality');

  return (
    <aside className="w-full md:w-16 lg:w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="hidden lg:block text-lg font-semibold">Writing Tools</h2>
        <div className="lg:hidden flex justify-center">
          <i className="ri-tools-fill text-xl text-primary"></i>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-2">
        {/* Text Processing Tools */}
        <div className="px-3 py-2">
          <h3 className="hidden lg:block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Text Processing
          </h3>
          
          {textProcessingTools.map(tool => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "secondary" : "ghost"}
              className={`w-full justify-start mb-1 ${
                activeTool === tool.id ? 'bg-primary bg-opacity-10 text-primary' : 'text-gray-500'
              }`}
              onClick={() => onSelectTool(tool.id)}
            >
              <i className={`${tool.icon} text-xl lg:mr-3`}></i>
              <span className="hidden lg:inline text-sm font-medium">{tool.name}</span>
            </Button>
          ))}
        </div>
        
        {/* Analysis Tools */}
        <div className="px-3 py-2 mt-2">
          <h3 className="hidden lg:block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Analysis Tools
          </h3>
          
          {analysisTools.map(tool => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "secondary" : "ghost"}
              className={`w-full justify-start mb-1 ${
                activeTool === tool.id ? 'bg-primary bg-opacity-10 text-primary' : 'text-gray-500'
              }`}
              onClick={() => onSelectTool(tool.id)}
            >
              <i className={`${tool.icon} text-xl lg:mr-3`}></i>
              <span className="hidden lg:inline text-sm font-medium">{tool.name}</span>
            </Button>
          ))}
        </div>
        
        {/* Quality Assurance Tools */}
        {qualityTools.length > 0 && (
          <div className="px-3 py-2 mt-2">
            <h3 className="hidden lg:block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Quality Assurance
            </h3>
            
            {qualityTools.map(tool => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 ${
                  activeTool === tool.id ? 'bg-primary bg-opacity-10 text-primary' : 'text-gray-500'
                }`}
                onClick={() => onSelectTool(tool.id)}
              >
                <i className={`${tool.icon} text-xl lg:mr-3`}></i>
                <span className="hidden lg:inline text-sm font-medium">{tool.name}</span>
              </Button>
            ))}
          </div>
        )}
      </nav>
      
      <div className="hidden lg:block p-4 border-t border-gray-200">
        <Button variant="default" className="w-full bg-primary hover:bg-primary/90 text-white">
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
