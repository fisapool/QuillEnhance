
import { GoogleGenerativeAI } from '@google/generative-ai';

type TextProcessingResult = {
  processedText: string;
  similarity?: number;
  issues: Array<{
    type: 'grammar' | 'suggestion' | 'improvement';
    message: string;
    suggestion: string;
    position?: {
      start: number;
      end: number;
    };
  }>;
};

// Basic tier word limits (same as Claude)
const BASIC_TIER_DAILY_LIMIT = 5000;
const PRO_TIER_DAILY_LIMIT = 10000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function paraphraseText(text: string, mode: string = "standard"): Promise<TextProcessingResult> {
  try {
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount > BASIC_TIER_DAILY_LIMIT) {
      return {
        processedText: text,
        issues: [{
          type: 'error',
          message: 'Daily word limit exceeded',
          suggestion: 'Upgrade to Pro tier for higher limits'
        }]
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Paraphrase this text maintaining its meaning: ${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      processedText: response.text(),
      issues: []
    };
  } catch (error: any) {
    console.error("Gemini paraphrasing error:", error.message);
    return {
      processedText: text,
      issues: [{
        type: 'error',
        message: 'Gemini API error',
        suggestion: error.message
      }]
    };
  }
}
export async function translateText(text: string, targetLanguage: string): Promise<{ processedText: string, similarity: number, issues: any[] }> {
  try {
    const prompt = `Translate this text to ${targetLanguage}:\n\n${text}\n\nTranslation:`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translation = response.text().trim();
    
    return {
      processedText: translation,
      similarity: 0, // Translation similarity doesn't make sense between languages
      issues: []
    };
  } catch (error) {
    console.error('Gemini translation error:', error);
    return {
      processedText: text,
      similarity: 100,
      issues: [{
        type: 'error',
        message: 'Translation failed',
        suggestion: 'Please try again later'
      }]
    };
  }
}
