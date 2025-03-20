
import { Anthropic } from '@anthropic-ai/sdk';

// Create Claude client with API key
const claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY || "" });

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

// Basic tier word limits
const BASIC_TIER_DAILY_LIMIT = 5000;
const PRO_TIER_DAILY_LIMIT = 10000;

export async function paraphraseText(text: string, mode: string = "standard"): Promise<TextProcessingResult> {
  try {
    // Check word count against tier limit
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
    const response = await claude.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Paraphrase this text maintaining its meaning: ${text}`
      }]
    });

    return {
      processedText: response.content[0].text,
      issues: []
    };
  } catch (error: any) {
    console.error("Claude paraphrasing error:", error.message);
    return {
      processedText: text,
      issues: [{
        type: 'error',
        message: 'Claude API error',
        suggestion: error.message
      }]
    };
  }
}
