
import { detectAIContent } from './aiDetector';

export interface ComplianceCheck {
  isCompliant: boolean;
  issues: string[];
  contentFlags: {
    hasOffensiveContent: boolean;
    hasPlagiarism: boolean;
    isAIGenerated: boolean;
  };
}

export async function checkContentCompliance(text: string): Promise<ComplianceCheck> {
  const aiResult = await detectAIContent(text);
  
  // Basic content screening
  const offensiveWords = ['hate', 'slur', 'explicit', 'violent'];
  const hasOffensive = offensiveWords.some(word => text.toLowerCase().includes(word));
  
  return {
    isCompliant: !hasOffensive && aiResult.probability < 0.9,
    issues: [
      ...(hasOffensive ? ['Content contains potentially offensive language'] : []),
      ...(aiResult.probability > 0.9 ? ['Content appears to be AI-generated'] : [])
    ],
    contentFlags: {
      hasOffensiveContent: hasOffensive,
      hasPlagiarism: false, // Implement plagiarism check as needed
      isAIGenerated: aiResult.probability > 0.9
    }
  };
}
