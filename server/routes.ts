import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Import both OpenAI and Hugging Face implementations
import * as openai from "./openai";
import * as huggingface from "./huggingface";
import { 
  calculateTextStatistics, 
  detectBasicGrammarIssues, 
  calculateSimilarity 
} from "./nlp";
import { textProcessingSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Helper function to determine which API to use
function useHuggingFace(): boolean {
  // Check if OpenAI API key is missing or if PREFER_HUGGINGFACE is set
  return !process.env.OPENAI_API_KEY || process.env.PREFER_HUGGINGFACE === 'true';
}

// Helper functions to choose the appropriate implementation
function paraphraseText(text: string, mode?: string) {
  return useHuggingFace() 
    ? huggingface.paraphraseText(text, mode)
    : openai.paraphraseText(text, mode);
}

function humanizeAIText(text: string) {
  return useHuggingFace()
    ? huggingface.humanizeAIText(text)
    : openai.humanizeAIText(text);
}

function rewordText(text: string) {
  return useHuggingFace()
    ? huggingface.rewordText(text)
    : openai.rewordText(text);
}

function rewriteParagraph(text: string) {
  return useHuggingFace()
    ? huggingface.rewriteParagraph(text)
    : openai.rewriteParagraph(text);
}

function summarizeText(text: string) {
  return useHuggingFace()
    ? huggingface.summarizeText(text)
    : openai.summarizeText(text);
}

function translateText(text: string, targetLanguage: string) {
  return useHuggingFace()
    ? huggingface.translateText(text, targetLanguage)
    : openai.translateText(text, targetLanguage);
}

function checkGrammar(text: string) {
  return useHuggingFace()
    ? huggingface.checkGrammar(text)
    : openai.checkGrammar(text);
}

function analyzeText(text: string) {
  return useHuggingFace()
    ? huggingface.analyzeText(text)
    : openai.analyzeText(text);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Text processing endpoint
  app.post("/api/process-text", async (req, res) => {
    try {
      const validatedData = textProcessingSchema.parse(req.body);
      const { text, processType, options } = validatedData;
      
      // Basic validation for empty text
      if (!text.trim()) {
        return res.status(400).json({ message: "Text cannot be empty" });
      }

      let result;
      
      // Process text based on the process type
      try {
        switch (processType) {
          case "paraphrase":
            result = await paraphraseText(text, options?.mode);
            break;
          case "humanize":
            result = await humanizeAIText(text);
            break;
          case "reword":
            result = await rewordText(text);
            break;
          case "rewriteParagraph":
            result = await rewriteParagraph(text);
            break;
          case "summarize":
            result = await summarizeText(text);
            break;
          case "translate":
            if (!options?.targetLanguage) {
              return res.status(400).json({ message: "Target language is required for translation" });
            }
            result = await translateText(text, options.targetLanguage);
            break;
          case "grammarCheck":
            result = await checkGrammar(text);
            break;
          default:
            return res.status(400).json({ message: "Invalid process type" });
        }
        
        // Check if we got an error response
        if (result.processedText && result.processedText.startsWith('[Error]')) {
          // Use basic fallback processing
          console.log('Using basic fallback processing');
          
          // Simple fallback implementations
          switch (processType) {
            case "paraphrase":
            case "humanize":
            case "reword":
            case "rewriteParagraph":
              // Just shuffle some words around as a very basic fallback
              const words = text.split(' ');
              const newWords = [...words];
              for (let i = 0; i < Math.min(3, Math.floor(words.length / 2)); i++) {
                const idx1 = Math.floor(Math.random() * words.length);
                const idx2 = Math.floor(Math.random() * words.length);
                [newWords[idx1], newWords[idx2]] = [newWords[idx2], newWords[idx1]];
              }
              result.processedText = newWords.join(' ');
              result.similarity = calculateSimilarity(text, result.processedText);
              break;
            case "summarize":
              // Basic summary: take first sentence and last sentence
              const sentences = text.split(/[.!?]+/).filter(s => s.trim() !== '');
              if (sentences.length > 1) {
                result.processedText = `${sentences[0].trim()}. ${sentences[sentences.length - 1].trim()}.`;
              } else {
                result.processedText = text;
              }
              result.similarity = calculateSimilarity(text, result.processedText);
              break;
            case "translate":
              // Can't really translate without AI, return original with message
              result.processedText = text + "\n\n[Translation unavailable due to API limitations]";
              result.similarity = 100;
              break;
            case "grammarCheck":
              // Use our basic grammar checker
              const issues = detectBasicGrammarIssues(text);
              result.processedText = text;
              result.issues = issues;
              result.similarity = 100;
              break;
          }
        }
      } catch (error) {
        console.error('Error in text processing:', error);
        // If any error occurred, use basic fallback
        result = {
          processedText: text,
          similarity: 100
        };
      }

      // Calculate text statistics for the processed text
      const originalStats = calculateTextStatistics(text);
      const processedStats = calculateTextStatistics(result.processedText);
      
      // Calculate similarity if not already provided
      const similarity = ('similarity' in result && result.similarity !== undefined) 
        ? result.similarity 
        : calculateSimilarity(text, result.processedText);

      return res.json({
        processedText: result.processedText,
        originalStats,
        processedStats,
        similarity,
        issues: ('issues' in result && result.issues) ? result.issues : []
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Text processing error:", error);
      return res.status(500).json({ message: "Failed to process text" });
    }
  });

  // Analyze text endpoint
  app.post("/api/analyze-text", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || !text.trim()) {
        return res.status(400).json({ message: "Text is required" });
      }

      // Get basic text statistics
      const statistics = calculateTextStatistics(text);
      
      // Detect basic grammar issues as a fallback
      const basicIssues = detectBasicGrammarIssues(text);
      
      // Use OpenAI for deeper analysis
      let analysisResult = {
        readability: 0,
        grammar: 0,
        originality: 0,
        issues: basicIssues,
        statistics,
        styleSuggestions: []
      };

      try {
        // Try to get enhanced analysis from OpenAI
        const aiAnalysis = await analyzeText(text);
        
        // Merge OpenAI analysis with our basic statistics
        analysisResult = {
          ...aiAnalysis,
          statistics: {
            ...aiAnalysis.statistics,
            words: statistics.words,
            characters: statistics.characters
          }
        };
      } catch (error) {
        console.error("OpenAI analysis failed, using basic analysis", error);
        // Continue with basic analysis if OpenAI fails
      }

      return res.json(analysisResult);
    } catch (error) {
      console.error("Text analysis error:", error);
      return res.status(500).json({ message: "Failed to analyze text" });
    }
  });

  // Word count endpoint (lightweight, doesn't use OpenAI)
  app.post("/api/word-count", (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      const statistics = calculateTextStatistics(text);
      return res.json(statistics);
    } catch (error) {
      console.error("Word count error:", error);
      return res.status(500).json({ message: "Failed to count words" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
