import React from 'react';
import { TextIssue } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface FloatingCorrectionProps {
  issue: TextIssue;
  position: { x: number; y: number };
  onAccept: (suggestion: string) => void;
  onIgnore: () => void;
}

const FloatingCorrection: React.FC<FloatingCorrectionProps> = ({
  issue,
  position,
  onAccept,
  onIgnore
}) => {
  const typeToTitle = {
    grammar: 'Grammar Error',
    suggestion: 'Style Suggestion',
    improvement: 'Improvement'
  };

  const typeToColor = {
    grammar: 'bg-[#FF6B6B] text-white',
    suggestion: 'bg-primary text-white',
    improvement: 'bg-[#34C759] text-white'
  };

  const typeToButtonColor = {
    grammar: 'bg-[#FF6B6B] text-white hover:bg-[#FF6B6B]/90',
    suggestion: 'bg-primary text-white hover:bg-primary/90',
    improvement: 'bg-[#34C759] text-white hover:bg-[#34C759]/90'
  };

  return (
    <div 
      className="fixed z-50" 
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px` 
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-72 overflow-hidden">
        <div className={`px-4 py-2 text-sm font-medium ${typeToColor[issue.type]}`}>
          {typeToTitle[issue.type]}
        </div>
        <div className="p-4">
          <p className="text-sm font-medium mb-2">{issue.message}</p>
          <p className="text-sm text-gray-500 mb-4">{issue.suggestion}</p>
          <div className="space-y-2">
            <Button 
              className={`w-full py-2 ${typeToButtonColor[issue.type]}`}
              onClick={() => onAccept(issue.suggestion)}
            >
              Apply Suggestion
            </Button>
            <Button 
              variant="outline" 
              className="w-full py-2 bg-white border border-gray-200 text-sm hover:bg-gray-100"
              onClick={onIgnore}
            >
              Ignore
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingCorrection;
