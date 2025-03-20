import OpenAI from "openai";
import { calculateTextStatistics } from "./nlp";
import { VertexAI } from '@google-cloud/vertexai';
import * as natural from 'natural';

const tokenizer = new natural.WordTokenizer();

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export interface AIDetectionResult {
  probability: number;
  confidence: number;
  details: {
    patternMatches: string[];
    unusualPhrases: string[];
  };
}

export async function detectAIContent(text: string): Promise<AIDetectionResult> {
  // Basic pattern detection
  const aiPatterns = [
    'as an AI',
    'as a language model',
    'I cannot',
    'I do not have',
    'I am not able to',
  ];

  const patternMatches = aiPatterns.filter(pattern => 
    text.toLowerCase().includes(pattern.toLowerCase())
  );

  // Check for unusual word patterns
  const tokens = tokenizer.tokenize(text) || [];
  const unusualPhrases = [];

  // Statistical analysis
  const avgWordLength = tokens.reduce((sum, word) => sum + word.length, 0) / tokens.length;
  const uniqueWords = new Set(tokens).size;
  const repetitionScore = uniqueWords / tokens.length;

  // Combined analysis
  const probability = Math.min(
    ((patternMatches.length * 0.2) + 
    (avgWordLength > 6 ? 0.3 : 0) +
    (repetitionScore < 0.4 ? 0.3 : 0)) * 100,
    100
  );

  return {
    probability,
    confidence: Math.min(patternMatches.length ? 0.8 : 0.6, 1),
    details: {
      patternMatches,
      unusualPhrases
    }
  };
}