// Basic NLP utilities for text analysis
// These are lightweight functions to supplement OpenAI analysis

export function countWords(text: string): number {
  // Remove extra spaces and split by spaces
  return text.trim().split(/\s+/).length;
}

export function countCharacters(text: string): number {
  // Count all characters including spaces
  return text.length;
}

export function countSentences(text: string): number {
  // Split by sentence endings (., !, ?) and filter out empty entries
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim() !== '');
  return sentences.length;
}

export function countParagraphs(text: string): number {
  // Split by double line breaks and filter out empty entries
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '');
  return paragraphs.length || 1; // Return at least 1 paragraph
}

export function estimateReadingTime(text: string): number {
  // Average reading speed: 225 words per minute
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / 225));
}

export function estimateSpeakingTime(text: string): number {
  // Average speaking speed: 150 words per minute
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / 150));
}

export function calculateTextStatistics(text: string): {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
} {
  return {
    words: countWords(text),
    characters: countCharacters(text),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readingTime: estimateReadingTime(text),
    speakingTime: estimateSpeakingTime(text)
  };
}

// Basic check for common grammar errors
export function detectBasicGrammarIssues(text: string): Array<{
  type: string;
  message: string;
  suggestion: string;
}> {
  const issues: Array<{
    type: string;
    message: string;
    suggestion: string;
  }> = [];

  // Check for double spaces
  if (text.includes("  ")) {
    issues.push({
      type: "grammar",
      message: "Double spaces detected",
      suggestion: "Remove extra spaces"
    });
  }

  // Check for missing spaces after punctuation
  const missingSpaceRegex = /[.!?][A-Z]/g;
  if (missingSpaceRegex.test(text)) {
    issues.push({
      type: "grammar",
      message: "Missing space after punctuation",
      suggestion: "Add a space after periods, exclamation points, and question marks"
    });
  }

  // Check for repeated words
  const repeatedWordRegex = /\b(\w+)\s+\1\b/gi;
  if (repeatedWordRegex.test(text)) {
    issues.push({
      type: "grammar",
      message: "Repeated words detected",
      suggestion: "Remove or replace the repeated word"
    });
  }

  return issues;
}

// Calculate similarity percentage between two texts (very basic implementation)
export function calculateSimilarity(originalText: string, processedText: string): number {
  const originalWords = originalText.toLowerCase().trim().split(/\s+/);
  const processedWords = processedText.toLowerCase().trim().split(/\s+/);
  
  // Count matching words (simplistic approach)
  let matchCount = 0;
  const processedWordSet = new Set(processedWords);
  
  for (const word of originalWords) {
    if (processedWordSet.has(word)) {
      matchCount++;
    }
  }
  
  // Calculate similarity percentage
  const maxLength = Math.max(originalWords.length, processedWords.length);
  const similarity = (matchCount / maxLength) * 100;
  
  // Cap similarity at 90% to account for limitations of this simple algorithm
  return Math.min(90, Math.round(similarity));
}
