
import { detectAIContent } from './aiDetector';
import natural from 'natural';

export interface ComplianceCheck {
  isCompliant: boolean;
  issues: string[];
  contentFlags: {
    hasOffensiveContent: boolean;
    hasPlagiarism: boolean;
    isAIGenerated: boolean;
    readabilityScore: number;
  };
  recommendations: string[];
}

async function checkPlagiarism(text: string): Promise<boolean> {
  // Basic plagiarism detection - can be enhanced with external APIs
  const sentences = new natural.SentenceTokenizer().tokenize(text);
  const unusualPatterns = sentences.filter(s => 
    s.length > 100 && !s.includes(',') && !s.includes(';')
  );
  return unusualPatterns.length > sentences.length * 0.3;
}

async function getReadabilityScore(text: string): Promise<number> {
  // Implement Flesch-Kincaid readability score
  const words = text.split(/\s+/).length;
  const sentences = new natural.SentenceTokenizer().tokenize(text).length;
  const syllables = text.split(/[aeiou]/i).length;
  
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

export async function checkContentCompliance(text: string): Promise<ComplianceCheck> {
  const aiResult = await detectAIContent(text);
  const readabilityScore = await getReadabilityScore(text);
  const hasPlagiarism = await checkPlagiarism(text);
  
  // Enhanced content screening
  const offensiveWords = ['hate', 'slur', 'explicit', 'violent', 'offensive', 'discriminatory'];
  const hasOffensive = offensiveWords.some(word => text.toLowerCase().includes(word));
  
  const recommendations = [];
  if (hasOffensive) {
    recommendations.push('Remove inappropriate language');
  }
  if (aiResult.probability > 0.9) {
    recommendations.push('Revise content to be more original');
  }
  if (readabilityScore < 60) {
    recommendations.push('Improve text readability');
  }

  return {
    isCompliant: !hasOffensive && !hasPlagiarism && aiResult.probability < 0.9,
    issues: [
      ...(hasOffensive ? ['Content contains potentially offensive language'] : []),
      ...(hasPlagiarism ? ['Content may be plagiarized'] : []),
      ...(aiResult.probability > 0.9 ? ['Content appears to be AI-generated'] : []),
      ...(readabilityScore < 60 ? ['Content has low readability score'] : [])
    ],
    contentFlags: {
      hasOffensiveContent: hasOffensive,
      hasPlagiarism,
      isAIGenerated: aiResult.probability > 0.9,
      readabilityScore
    },
    recommendations
  };
}
