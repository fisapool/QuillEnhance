import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { TextAnalysis } from '@/lib/types';

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);

  const analyzeText = async (text: string): Promise<TextAnalysis | null> => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await apiRequest('POST', '/api/analyze-text', { text });
      const data = await response.json();
      setAnalysis(data);
      return data;
    } catch (err: any) {
      console.error('Text analysis error:', err);
      setError(err.message || 'Failed to analyze text');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeText,
    isAnalyzing,
    error,
    analysis,
    resetAnalysis: () => setAnalysis(null),
    resetError: () => setError(null),
  };
}
