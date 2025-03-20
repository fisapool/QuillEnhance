export interface TextStatistics {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
}

export interface TextIssue {
  type: 'grammar' | 'suggestion' | 'improvement';
  message: string;
  suggestion: string;
  position?: {
    start: number;
    end: number;
  };
}

export interface StyleSuggestion {
  type: 'positive' | 'negative' | 'neutral';
  message: string;
}

export interface TextAnalysis {
  readability: number;
  grammar: number;
  originality: number;
  issues: TextIssue[];
  statistics: TextStatistics;
  styleSuggestions: StyleSuggestion[];
}

export interface ProcessingResult {
  processedText: string;
  originalStats: TextStatistics;
  processedStats: TextStatistics;
  similarity: number;
  issues: TextIssue[];
}

export type ProcessType = 
  'paraphrase' | 
  'humanize' | 
  'reword' | 
  'rewriteParagraph' | 
  'summarize' | 
  'grammarCheck' | 
  'translate';

export interface ProcessingOptions {
  mode?: 'standard' | 'formal' | 'creative' | 'simplified';
  targetLanguage?: string;
}

export interface ProcessingTool {
  id: ProcessType;
  name: string;
  icon: string;
  category: 'text-processing' | 'analysis' | 'quality';
  description: string;
}
