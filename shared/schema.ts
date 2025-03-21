import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Text Processing
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  originalText: text("original_text").notNull(),
  processedText: text("processed_text"),
  processingType: text("processing_type").notNull(), // paraphrase, humanize, reword, etc.
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  analysis: jsonb("analysis"), // Store text analysis results
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
});

export const updateDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  userId: true,
  createdAt: true
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type UpdateDocument = z.infer<typeof updateDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Text Analysis 
export const textAnalysisSchema = z.object({
  readability: z.number().min(0).max(100),
  grammar: z.number().min(0).max(100),
  originality: z.number().min(0).max(100),
  issues: z.array(z.object({
    type: z.enum(["grammar", "suggestion", "improvement"]),
    message: z.string(),
    suggestion: z.string(),
    position: z.object({
      start: z.number(),
      end: z.number()
    }).optional()
  })),
  statistics: z.object({
    readingTime: z.number(),
    speakingTime: z.number(),
    sentences: z.number(),
    paragraphs: z.number(),
    words: z.number(),
    characters: z.number()
  }),
  styleSuggestions: z.array(z.object({
    type: z.enum(["positive", "negative", "neutral"]),
    message: z.string()
  }))
});

export type TextAnalysis = z.infer<typeof textAnalysisSchema>;

// Text Processing Request Schema
export const textProcessingSchema = z.object({
  text: z.string().min(1, "Text is required"),
  processType: z.enum([
    "paraphrase", 
    "humanize", 
    "reword", 
    "rewriteParagraph", 
    "summarize", 
    "grammarCheck", 
    "translate"
  ]),
  options: z.object({
    mode: z.enum(["standard", "formal", "creative", "simplified"]).optional(),
    targetLanguage: z.string().optional(),
  }).optional()
});

export type TextProcessingRequest = z.infer<typeof textProcessingSchema>;

// Text Processing Result Schema
export const textIssueSchema = z.object({
  type: z.enum(["grammar", "suggestion", "improvement"]),
  message: z.string(),
  suggestion: z.string(),
  position: z.object({
    start: z.number(),
    end: z.number()
  }).optional()
});

export const textProcessingResultSchema = z.object({
  processedText: z.string(),
  similarity: z.number().optional(),
  issues: z.array(textIssueSchema)
});

export type TextIssue = z.infer<typeof textIssueSchema>;
export type TextProcessingResult = z.infer<typeof textProcessingResultSchema>;

export const aiDetectionSchema = z.object({
  text: z.string().min(1, 'Text is required for AI detection')
});

export const aiDetectionResultSchema = z.object({
  aiProbability: z.number().min(0).max(100),
  humanProbability: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  textStatistics: z.object({
    repetitivePatterns: z.number().min(0).max(100),
    linguisticVariation: z.number().min(0).max(100),
    naturalFlow: z.number().min(0).max(100),
    creativityScore: z.number().min(0).max(100)
  }),
  detectionExplanation: z.string(),
  improvementSuggestions: z.array(z.string())
});

export type AIDetectionRequest = z.infer<typeof aiDetectionSchema>;
export type AIDetectionResult = z.infer<typeof aiDetectionResultSchema>;
