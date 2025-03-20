import React from 'react';
import { TextAnalysis } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  AlertCircle, 
  LightbulbIcon, 
  Check, 
  X, 
  Info 
} from 'lucide-react';

interface AnalysisPanelProps {
  analysis: TextAnalysis | null;
  isLoading: boolean;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <aside className="hidden xl:block w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Text Analysis</h2>
        </div>
        <div className="p-5 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  if (!analysis) {
    return (
      <aside className="hidden xl:block w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Text Analysis</h2>
        </div>
        <div className="p-5 flex items-center justify-center h-full">
          <p className="text-gray-500 text-center">
            Start typing or processing text to see analysis
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden xl:block w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Text Analysis</h2>
      </div>
      
      <div className="p-5">
        {/* Writing Quality */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Writing Quality</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Readability</span>
                <span className="text-sm font-medium">
                  {analysis.readability >= 80 ? 'Excellent' : 
                   analysis.readability >= 70 ? 'Good' : 
                   analysis.readability >= 60 ? 'Fair' : 'Needs Improvement'}
                </span>
              </div>
              <Progress 
                value={analysis.readability} 
                className="h-2 bg-gray-200"
                indicatorClassName={analysis.readability >= 70 ? "bg-[#34C759]" : "bg-[#FF6B6B]"}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Grammar</span>
                <span className="text-sm font-medium">
                  {analysis.grammar >= 80 ? 'Excellent' : 
                   analysis.grammar >= 70 ? 'Good' : 
                   analysis.grammar >= 60 ? 'Fair' : 'Needs Improvement'}
                </span>
              </div>
              <Progress 
                value={analysis.grammar} 
                className="h-2 bg-gray-200"
                indicatorClassName={analysis.grammar >= 70 ? "bg-[#34C759]" : "bg-[#FF6B6B]"}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Originality</span>
                <span className="text-sm font-medium">
                  {analysis.originality >= 80 ? 'Excellent' : 
                   analysis.originality >= 70 ? 'Good' : 
                   analysis.originality >= 60 ? 'Fair' : 'Needs Improvement'}
                </span>
              </div>
              <Progress 
                value={analysis.originality} 
                className="h-2 bg-gray-200"
                indicatorClassName={analysis.originality >= 70 ? "bg-[#34C759]" : "bg-[#FF6B6B]"}
              />
            </div>
          </div>
        </div>
        
        {/* Issues Found */}
        {analysis.issues && analysis.issues.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-3">Issues Found</h3>
            <div className="space-y-2">
              {analysis.issues.map((issue, index) => {
                const bgColor = 
                  issue.type === 'grammar' ? 'bg-[#FF6B6B]/10' : 
                  issue.type === 'suggestion' ? 'bg-primary/10' : 
                  'bg-[#34C759]/10';
                
                const textColor = 
                  issue.type === 'grammar' ? 'text-[#FF6B6B]' : 
                  issue.type === 'suggestion' ? 'text-primary' : 
                  'text-[#34C759]';
                
                const Icon = 
                  issue.type === 'grammar' ? AlertCircle : 
                  issue.type === 'suggestion' ? LightbulbIcon : 
                  CheckCircle2;
                
                return (
                  <div key={index} className={`flex items-start p-3 ${bgColor} rounded-md`}>
                    <Icon className={`${textColor} h-4 w-4 mt-0.5 mr-2 flex-shrink-0`} />
                    <div>
                      <p className="text-sm font-medium">{issue.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{issue.suggestion}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Statistics */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500">Reading Time</p>
              <p className="text-lg font-semibold">~{analysis.statistics.readingTime} min</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500">Speaking Time</p>
              <p className="text-lg font-semibold">~{analysis.statistics.speakingTime} min</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500">Sentences</p>
              <p className="text-lg font-semibold">{analysis.statistics.sentences}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500">Paragraphs</p>
              <p className="text-lg font-semibold">{analysis.statistics.paragraphs}</p>
            </div>
          </div>
        </div>
        
        {/* Style Suggestions */}
        {analysis.styleSuggestions && analysis.styleSuggestions.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Style Suggestions</h3>
            <ul className="space-y-2 text-sm">
              {analysis.styleSuggestions.map((suggestion, index) => {
                const Icon = 
                  suggestion.type === 'positive' ? Check : 
                  suggestion.type === 'negative' ? X : 
                  Info;
                
                const textColor = 
                  suggestion.type === 'positive' ? 'text-[#34C759]' : 
                  suggestion.type === 'negative' ? 'text-[#FF6B6B]' : 
                  'text-primary';
                
                return (
                  <li key={index} className="flex items-start">
                    <Icon className={`${textColor} h-4 w-4 mt-0.5 mr-2`} />
                    <span>{suggestion.message}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AnalysisPanel;
