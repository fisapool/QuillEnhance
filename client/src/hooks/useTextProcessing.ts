import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { ProcessType, ProcessingOptions, ProcessingResult } from '@/lib/types';

export function useTextProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const processText = async (
    text: string,
    processType: ProcessType,
    options?: ProcessingOptions
  ): Promise<ProcessingResult | null> => {
    try {
      setIsProcessing(true);
      setError(null);

      const response = await apiRequest('POST', '/api/process-text', {
        text,
        processType,
        options
      });

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err: any) {
      console.error('Text processing error:', err);
      setError(err.message || 'Failed to process text');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const getWordCount = async (text: string) => {
    try {
      const response = await apiRequest('POST', '/api/word-count', { text });
      return await response.json();
    } catch (err) {
      console.error('Word count error:', err);
      return null;
    }
  };

  return {
    processText,
    getWordCount,
    isProcessing,
    error,
    result,
    resetResult: () => setResult(null),
    resetError: () => setError(null),
  };
}
