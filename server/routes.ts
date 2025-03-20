import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  paraphraseText, 
  humanizeAIText, 
  rewordText, 
  rewriteParagraph, 
  summarizeText, 
  translateText, 
  checkGrammar,
  analyzeText
} from "./openai";
import { 
  calculateTextStatistics, 
  detectBasicGrammarIssues, 
  calculateSimilarity 
} from "./nlp";
import { textProcessingSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

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
