import OpenAI from "openai";
import { calculateTextStatistics } from "./nlp";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export type AIDetectionResult = {
  aiProbability: number; // 0-100 scale
  humanProbability: number; // 0-100 scale
  confidence: number; // 0-100 scale
  textStatistics: {
    repetitivePatterns: number; // 0-100 scale
    linguisticVariation: number; // 0-100 scale
    naturalFlow: number; // 0-100 scale
    creativityScore: number; // 0-100 scale
  };
  detectionExplanation: string;
  improvementSuggestions: string[];
};

/**
 * Detects if text is likely AI-generated similar to QuillBot's detector
 * @param text The text to analyze
 * @returns Analysis result with probability scores and explanations
 */
export async function detectAIContent(text: string): Promise<AIDetectionResult> {
  try {
    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      
      // Basic statistics-based fallback detection when API key is missing
      return generateBasicFallbackDetection(text);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert AI content detector similar to QuillBot's AI detector. 
          Analyze the text for signs of AI generation such as:
          1. Repetitive patterns and phrasing
          2. Lack of linguistic variation
          3. Unnatural flow of ideas
          4. Impersonal tone and generic examples
          5. Too-perfect grammar with no natural human errors
          6. Consistency in sentence structure
          7. Limited creativity and nuance
          
          Respond with JSON in this format: { 
            "aiProbability": number between 0-100,
            "humanProbability": number between 0-100, 
            "confidence": number between 0-100,
            "textStatistics": {
              "repetitivePatterns": number between 0-100,
              "linguisticVariation": number between 0-100,
              "naturalFlow": number between 0-100,
              "creativityScore": number between 0-100
            },
            "detectionExplanation": "detailed explanation of the analysis",
            "improvementSuggestions": ["suggestion1", "suggestion2", "etc"]
          }`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      aiProbability: result.aiProbability || 50,
      humanProbability: result.humanProbability || 50,
      confidence: result.confidence || 50,
      textStatistics: {
        repetitivePatterns: result.textStatistics?.repetitivePatterns || 50,
        linguisticVariation: result.textStatistics?.linguisticVariation || 50,
        naturalFlow: result.textStatistics?.naturalFlow || 50,
        creativityScore: result.textStatistics?.creativityScore || 50
      },
      detectionExplanation: result.detectionExplanation || "Analysis could not determine text origin with confidence.",
      improvementSuggestions: result.improvementSuggestions || ["Add more personal experiences", "Vary sentence structure", "Include colloquial language"]
    };
  } catch (error: any) {
    console.error("AI detection error:", error.message);
    
    // Return a basic analysis if OpenAI fails
    return generateBasicFallbackDetection(text);
  }
}

/**
 * Generate a basic analysis of text when AI services aren't available
 * Uses simple heuristics to estimate AI probability
 */
function generateBasicFallbackDetection(text: string): AIDetectionResult {
  const stats = calculateTextStatistics(text);
  
  // Simple heuristics to determine if text might be AI-generated
  // These are basic approximations and not as accurate as ML-based approaches
  
  // 1. Check for extremely consistent sentence length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim() !== '');
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
  
  // Calculate standard deviation of sentence lengths
  const sentenceLengthVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length;
  const sentenceLengthStdDev = Math.sqrt(sentenceLengthVariance);
  
  // 2. Check for repeating phrases (basic implementation)
  const threeGrams = generateNGrams(text, 3);
  const fourGrams = generateNGrams(text, 4);
  
  // Count repeated n-grams
  const repeatedThreeGrams = countRepeatedElements(threeGrams);
  const repeatedFourGrams = countRepeatedElements(fourGrams);
  
  // Calculate AI probability based on heuristics
  // Low sentence variation often indicates AI text
  const sentenceVariationScore = Math.min(100, Math.max(0, 100 - (sentenceLengthStdDev * 10)));
  
  // High repetition often indicates AI text
  const repetitionScore = Math.min(100, Math.max(0, (repeatedThreeGrams * 20) + (repeatedFourGrams * 30)));
  
  // Perfect grammar/structure often indicates AI text
  const perfectStructureScore = Math.min(100, Math.max(0, avgSentenceLength > 10 ? 70 : 40));
  
  // Combine scores (weighted average)
  const aiProbability = Math.round((sentenceVariationScore * 0.4) + (repetitionScore * 0.3) + (perfectStructureScore * 0.3));
  
  return {
    aiProbability: aiProbability,
    humanProbability: 100 - aiProbability,
    confidence: 40, // Lower confidence for this basic method
    textStatistics: {
      repetitivePatterns: repetitionScore,
      linguisticVariation: 100 - sentenceVariationScore,
      naturalFlow: sentenceLengthStdDev > 5 ? 70 : 40,
      creativityScore: 100 - perfectStructureScore
    },
    detectionExplanation: "This analysis was performed using basic language statistics and may not be as accurate as machine learning-based methods. The detection is based on sentence variation, phrase repetition, and text structure analysis.",
    improvementSuggestions: [
      "Add more variation in sentence lengths",
      "Include more personal anecdotes or examples",
      "Use more diverse vocabulary",
      "Add some colloquial expressions or idioms",
      "Vary paragraph structure and transitions"
    ]
  };
}

/**
 * Generate n-grams from text
 */
function generateNGrams(text: string, n: number): string[] {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const ngrams = [];
  
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  
  return ngrams;
}

/**
 * Count repeated elements in an array
 */
function countRepeatedElements(arr: string[]): number {
  const counts: Record<string, number> = {};
  let repeatedCount = 0;
  
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > 1) repeatedCount++;
  });
  
  return repeatedCount;
}