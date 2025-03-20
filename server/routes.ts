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
async function paraphraseText(text: string, mode?: string): Promise<{
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
}> {
  const result = useHuggingFace() 
    ? await huggingface.paraphraseText(text, mode)
    : await openai.paraphraseText(text, mode);
  
  // Ensure the result has an issues array
  if (!result.issues) {
    result.issues = [];
  }
  
  return result;
}

async function humanizeAIText(text: string): Promise<{
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
}> {
  const result = useHuggingFace()
    ? await huggingface.humanizeAIText(text)
    : await openai.humanizeAIText(text);
  
  // Ensure the result has an issues array
  if (!result.issues) {
    result.issues = [];
  }
  
  return result;
}

async function rewordText(text: string): Promise<{
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
}> {
  const result = useHuggingFace()
    ? await huggingface.rewordText(text)
    : await openai.rewordText(text);
  
  // Ensure the result has an issues array
  if (!result.issues) {
    result.issues = [];
  }
  
  return result;
}

async function rewriteParagraph(text: string): Promise<{
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
}> {
  const result = useHuggingFace()
    ? await huggingface.rewriteParagraph(text)
    : await openai.rewriteParagraph(text);
  
  // Ensure the result has an issues array
  if (!result.issues) {
    result.issues = [];
  }
  
  return result;
}

async function summarizeText(text: string): Promise<{
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
}> {
  const result = useHuggingFace()
    ? await huggingface.summarizeText(text)
    : await openai.summarizeText(text);
  
  // Ensure the result has an issues array
  if (!result.issues) {
    result.issues = [];
  }
  
  return result;
}

async function translateText(text: string, targetLanguage: string): Promise<{
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
}> {
  const result = useHuggingFace()
    ? await huggingface.translateText(text, targetLanguage)
    : await openai.translateText(text, targetLanguage);
  
  // Ensure the result has an issues array
  if (!result.issues) {
    result.issues = [];
  }
  
  return result;
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

      // Initialize result object
      let result: {
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
      } = {
        processedText: text,
        issues: []
      };
      
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
              // Simple paraphrasing: change word order and structure
              const paraphraseSentences = text.split(/[.!?]+/).filter(s => s.trim() !== '');
              if (paraphraseSentences.length > 1) {
                // Rearrange sentence order for multiple sentences
                const newSentences = [...paraphraseSentences];
                for (let i = 0; i < Math.min(2, Math.floor(paraphraseSentences.length / 2)); i++) {
                  const idx1 = Math.floor(Math.random() * paraphraseSentences.length);
                  const idx2 = Math.floor(Math.random() * paraphraseSentences.length);
                  [newSentences[idx1], newSentences[idx2]] = [newSentences[idx2], newSentences[idx1]];
                }
                result.processedText = newSentences.map(s => s.trim() + '.').join(' ');
              } else {
                // For single sentences, reverse parts around commas or conjunctions
                const parts = text.split(/,|\sand\s|\sor\s|\sbut\s/);
                if (parts.length > 1) {
                  result.processedText = parts.reverse().join(', ');
                } else {
                  // Last resort: change active/passive voice crudely
                  if (text.match(/\b(is|are|was|were)\b/)) {
                    result.processedText = text.replace(/\b(is|are|was|were)\b/, 'has been');
                  } else {
                    const words = text.split(' ');
                    const newWords = [...words];
                    // Just swap some words as last resort
                    for (let i = 0; i < Math.min(3, Math.floor(words.length / 2)); i++) {
                      const idx1 = Math.floor(Math.random() * words.length);
                      const idx2 = Math.floor(Math.random() * words.length);
                      [newWords[idx1], newWords[idx2]] = [newWords[idx2], newWords[idx1]];
                    }
                    result.processedText = newWords.join(' ');
                  }
                }
              }
              result.similarity = calculateSimilarity(text, result.processedText);
              break;
              
            case "humanize":
              // Add more conversational elements and varied sentence structures
              let humanizedText = text
                .replace(/\b(furthermore|moreover|additionally)\b/gi, 'also')
                .replace(/\b(utilize|utilization)\b/gi, 'use')
                .replace(/\b(obtain)\b/gi, 'get')
                .replace(/\b(require)\b/gi, 'need')
                .replace(/\b(sufficient)\b/gi, 'enough')
                .replace(/\b(nevertheless|nonetheless)\b/gi, 'still')
                .replace(/\b(commence|initiate)\b/gi, 'start')
                .replace(/\b(terminate)\b/gi, 'end')
                .replace(/\b(endeavor)\b/gi, 'try')
                .replace(/\b(inquire)\b/gi, 'ask');
              
              // Add some human touches
              if (!humanizedText.includes('I think') && !humanizedText.includes('I believe')) {
                humanizedText = 'I think ' + humanizedText.charAt(0).toLowerCase() + humanizedText.slice(1);
              }
              
              // Add a conversational closer if it doesn't exist
              if (!humanizedText.match(/\b(right|you know|anyway)\b/)) {
                humanizedText += ", right?";
              }
              
              result.processedText = humanizedText;
              result.similarity = calculateSimilarity(text, result.processedText);
              break;
              
            case "reword":
              // Replace words with basic synonyms without changing structure
              let rewordedText = text
                .replace(/\b(big|large)\b/gi, 'substantial')
                .replace(/\b(small|tiny)\b/gi, 'minimal')
                .replace(/\b(good)\b/gi, 'excellent')
                .replace(/\b(bad)\b/gi, 'poor')
                .replace(/\b(happy)\b/gi, 'delighted')
                .replace(/\b(sad)\b/gi, 'unhappy')
                .replace(/\b(angry)\b/gi, 'furious')
                .replace(/\b(fast|quick)\b/gi, 'rapid')
                .replace(/\b(slow)\b/gi, 'gradual')
                .replace(/\b(important)\b/gi, 'significant')
                .replace(/\b(difficult|hard)\b/gi, 'challenging')
                .replace(/\b(easy|simple)\b/gi, 'straightforward')
                .replace(/\b(beautiful)\b/gi, 'gorgeous')
                .replace(/\b(ugly)\b/gi, 'unattractive')
                .replace(/\b(smart|intelligent)\b/gi, 'brilliant')
                .replace(/\b(stupid)\b/gi, 'foolish')
                .replace(/\b(rich)\b/gi, 'wealthy')
                .replace(/\b(poor)\b/gi, 'impoverished')
                .replace(/\b(old)\b/gi, 'aged')
                .replace(/\b(new)\b/gi, 'recent')
                .replace(/\b(like)\b/gi, 'appreciate')
                .replace(/\b(hate)\b/gi, 'detest')
                .replace(/\b(look)\b/gi, 'appear')
                .replace(/\b(see)\b/gi, 'observe')
                .replace(/\b(hear)\b/gi, 'listen to')
                .replace(/\b(touch)\b/gi, 'contact')
                .replace(/\b(smell)\b/gi, 'detect')
                .replace(/\b(taste)\b/gi, 'savor');
              
              result.processedText = rewordedText;
              result.similarity = calculateSimilarity(text, result.processedText);
              break;
              
            case "rewriteParagraph":
              // More comprehensive restructuring
              const paragraphSentences = text.split(/[.!?]+/).filter(s => s.trim() !== '');
              
              if (paragraphSentences.length > 1) {
                // For multiple sentences, combine some and reorder others
                let rewrittenParagraph = "";
                
                // Mix sentence order and combine some
                for (let i = 0; i < paragraphSentences.length; i++) {
                  const s = paragraphSentences[i].trim();
                  if (i < paragraphSentences.length - 1 && Math.random() > 0.5) {
                    // Combine with next sentence
                    const nextS = paragraphSentences[i+1].trim();
                    rewrittenParagraph += s + " and " + nextS + ". ";
                    i++; // Skip the next sentence as we've used it
                  } else {
                    rewrittenParagraph += s + ". ";
                  }
                }
                
                result.processedText = rewrittenParagraph.trim();
              } else {
                // For a single sentence, break it into multiple if possible
                const fragments = text.split(/,|\sand\s|\sor\s|\sbut\s/);
                if (fragments.length > 1) {
                  result.processedText = fragments.map(f => f.trim().charAt(0).toUpperCase() + f.trim().slice(1) + '.').join(' ');
                } else {
                  // Can't do much with a simple sentence
                  result.processedText = text;
                }
              }
              
              result.similarity = calculateSimilarity(text, result.processedText);
              break;
            case "summarize":
              // Basic summary: take first sentence and last sentence
              const summarySentences = text.split(/[.!?]+/).filter(s => s.trim() !== '');
              if (summarySentences.length > 1) {
                result.processedText = `${summarySentences[0].trim()}. ${summarySentences[summarySentences.length - 1].trim()}.`;
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
          similarity: 100,
          issues: [] // Ensure issues property exists for all results
        };
      }
      
      // Ensure all results have an issues property
      if (!result.issues) {
        result.issues = [];
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
