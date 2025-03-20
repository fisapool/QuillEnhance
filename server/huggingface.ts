import { HfInference } from '@huggingface/inference';
import { calculateSimilarity } from './nlp';

// Create HF inference client with API key
const hf = new HfInference(process.env.HUGGING_FACE_API_KEY || '');

// Better models for each task
const TEXT_GENERATION_MODEL = 'meta-llama/Llama-2-7b-chat-hf';
const SUMMARIZATION_MODEL = 'facebook/bart-large-cnn';
const TRANSLATION_MODEL = 'facebook/mbart-large-50-many-to-many-mmt';
const PARAPHRASE_MODEL = 'tuner007/pegasus_paraphrase';

/**
 * Process text using Hugging Face models
 * @param text The text to process
 * @param instruction The instruction for how to process the text
 * @returns Processed text
 */
async function generateText(text: string, instruction: string): Promise<string> {
  try {
    const prompt = `${instruction}:\n\n${text}\n\nOutput:`;
    
    const response = await hf.textGeneration({
      model: TEXT_GENERATION_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 256,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.15,
        do_sample: true
      }
    });
    
    // Extract the generated text
    let processedText = response.generated_text || '';
    
    // Remove the input prompt from the generated text
    if (processedText.startsWith(prompt)) {
      processedText = processedText.substring(prompt.length).trim();
    }
    
    return processedText || text;
  } catch (error) {
    console.error('Hugging Face text generation error:', error);
    return `[Error] Failed to process text with Hugging Face. Original text: ${text}`;
  }
}

export async function paraphraseText(text: string, mode: string = "standard"): Promise<{ processedText: string, similarity: number, issues: Array<{
  type: 'grammar' | 'suggestion' | 'improvement';
  message: string;
  suggestion: string;
  position?: {
    start: number;
    end: number;
  };
}> }> {
  try {
    let instruction = "Paraphrase the following text while preserving its meaning";
    
    if (mode === "formal") {
      instruction = "Paraphrase the following text into a formal and professional tone";
    } else if (mode === "academic") {
      instruction = "Paraphrase the following text using scholarly language, precise terminology, and an objective tone suitable for academic papers and essays";
    } else if (mode === "creative") {
      instruction = "Paraphrase the following text in a creative and engaging way";
    } else if (mode === "simplified") {
      instruction = "Paraphrase the following text using simpler language and shorter sentences";
    }
    
    const processedText = await generateText(text, instruction);
    const similarity = calculateSimilarity(text, processedText);
    
    return { processedText, similarity, issues: [] };
  } catch (error) {
    console.error("Paraphrasing error with Hugging Face:", error);
    return {
      processedText: `[Error] Failed to paraphrase text. ${text}`,
      similarity: 100,
      issues: []
    };
  }
}

export async function humanizeAIText(text: string): Promise<{ processedText: string, similarity?: number, issues: Array<{
  type: 'grammar' | 'suggestion' | 'improvement';
  message: string;
  suggestion: string;
  position?: {
    start: number;
    end: number;
  };
}> }> {
  try {
    const instruction = "Make the following AI-generated text sound more human. Remove repetitive patterns, add natural language variations, incorporate conversational elements, and vary sentence structures.";
    
    const processedText = await generateText(text, instruction);
    const similarity = calculateSimilarity(text, processedText);
    
    return { processedText, similarity, issues: [] };
  } catch (error) {
    console.error("Humanizing error with Hugging Face:", error);
    return {
      processedText: `[Error] Failed to humanize text. ${text}`,
      similarity: 100,
      issues: []
    };
  }
}

export async function rewordText(text: string): Promise<{ processedText: string, similarity?: number, issues: Array<{
  type: 'grammar' | 'suggestion' | 'improvement';
  message: string;
  suggestion: string;
  position?: {
    start: number;
    end: number;
  };
}> }> {
  try {
    const instruction = "Reword the following text. Replace words with synonyms while preserving the original meaning, structure, and length.";
    
    const processedText = await generateText(text, instruction);
    const similarity = calculateSimilarity(text, processedText);
    
    return { processedText, similarity, issues: [] };
  } catch (error) {
    console.error("Rewording error with Hugging Face:", error);
    return {
      processedText: `[Error] Failed to reword text. ${text}`,
      similarity: 100,
      issues: []
    };
  }
}

export async function rewriteParagraph(text: string): Promise<{ processedText: string, similarity?: number, issues: Array<{
  type: 'grammar' | 'suggestion' | 'improvement';
  message: string;
  suggestion: string;
  position?: {
    start: number;
    end: number;
  };
}> }> {
  try {
    const instruction = "Rewrite the following paragraph. Restructure and rephrase the paragraph while maintaining the core information and meaning.";
    
    const processedText = await generateText(text, instruction);
    const similarity = calculateSimilarity(text, processedText);
    
    return { processedText, similarity, issues: [] };
  } catch (error) {
    console.error("Paragraph rewriting error with Hugging Face:", error);
    return {
      processedText: `[Error] Failed to rewrite paragraph. ${text}`,
      similarity: 100,
      issues: []
    };
  }
}

export async function summarizeText(text: string): Promise<{ processedText: string, similarity?: number, issues: Array<{
  type: 'grammar' | 'suggestion' | 'improvement';
  message: string;
  suggestion: string;
  position?: {
    start: number;
    end: number;
  };
}> }> {
  try {
    // Use text generation for summarization to avoid authentication issues
    const instruction = "Summarize the following text concisely while preserving the key points";
    const processedText = await generateText(text, instruction);
    const similarity = calculateSimilarity(text, processedText);
    
    return { processedText, similarity, issues: [] };
  } catch (error) {
    console.error("Summarizing error with Hugging Face:", error);
    
    // Return original text with error message
    return {
      processedText: `[Error] Failed to summarize text. ${text}`,
      similarity: 100,
      issues: []
    };
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<{ processedText: string, similarity?: number, issues: Array<{
  type: 'grammar' | 'suggestion' | 'improvement';
  message: string;
  suggestion: string;
  position?: {
    start: number;
    end: number;
  };
}> }> {
  try {
    // Using text generation for translations as it's more flexible with languages
    const instruction = `Translate the following text into ${targetLanguage}:`;
    
    const processedText = await generateText(text, instruction);
    
    return { 
      processedText,
      // Similarity doesn't make sense for translations between languages
      similarity: 0,
      issues: []
    };
  } catch (error) {
    console.error("Translation error with Hugging Face:", error);
    return {
      processedText: `[Error] Failed to translate text. ${text}`,
      similarity: 0,
      issues: []
    };
  }
}

export async function checkGrammar(text: string): Promise<{ processedText: string, issues: any[], similarity?: number }> {
  try {
    const instruction = "Check and correct grammar, punctuation, and spelling errors in the following text. Return the corrected text only:";
    
    const processedText = await generateText(text, instruction);
    const similarity = calculateSimilarity(text, processedText);
    
    // Since Hugging Face models don't easily return structured data like issues,
    // We'll identify differences between original and corrected text
    const issues = [];
    
    // If texts are different, add a general issue
    if (similarity < 100) {
      issues.push({
        type: 'grammar',
        message: 'Grammar and style corrections were made',
        suggestion: 'See corrected text',
        position: { start: 0, end: text.length }
      });
    }
    
    return { processedText, issues, similarity };
  } catch (error) {
    console.error("Grammar checking error with Hugging Face:", error);
    return {
      processedText: `[Error] Failed to check grammar. ${text}`,
      issues: [],
      similarity: 100
    };
  }
}

export async function analyzeText(text: string): Promise<any> {
  try {
    const instruction = `Analyze this text and provide a detailed assessment. Include:
    - Readability score from 0-100
    - Grammar quality score from 0-100
    - Originality score from 0-100
    - List any writing issues or improvement suggestions
    - List any positive or negative style elements
    
    Format your response like this example:
    Readability: 75
    Grammar: 80
    Originality: 60
    Issues:
    - Run-on sentence in paragraph 2
    - Passive voice overused
    Style:
    - Good use of metaphors
    - Inconsistent tone`;
    
    const analysisText = await generateText(text, instruction);
    
    // Parse the free-form text response into structured data
    const analysis = parseAnalysisText(analysisText);
    
    // Add text statistics
    const words = text.trim().split(/\s+/).length;
    const characters = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim() !== '').length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '').length || 1;
    const readingTime = Math.max(1, Math.ceil(words / 225));
    const speakingTime = Math.max(1, Math.ceil(words / 150));
    
    return {
      ...analysis,
      statistics: {
        words,
        characters,
        sentences,
        paragraphs,
        readingTime,
        speakingTime
      }
    };
  } catch (error) {
    console.error("Text analysis error with Hugging Face:", error);
    
    // Return a basic analysis with default values
    const words = text.trim().split(/\s+/).length;
    const characters = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim() !== '').length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '').length || 1;
    const readingTime = Math.max(1, Math.ceil(words / 225));
    const speakingTime = Math.max(1, Math.ceil(words / 150));
    
    return {
      readability: 50,
      grammar: 50,
      originality: 50,
      issues: [
        {
          type: "suggestion" as "suggestion" | "grammar" | "improvement",
          message: "Analysis unavailable",
          suggestion: "Unable to perform detailed analysis due to API limits or errors."
        }
      ],
      statistics: {
        words,
        characters,
        sentences,
        paragraphs,
        readingTime,
        speakingTime
      },
      styleSuggestions: []
    };
  }
}

// Helper function to parse free-form text analysis into structured data
function parseAnalysisText(text: string): any {
  const result: any = {
    readability: 50,
    grammar: 50,
    originality: 50,
    issues: [],
    styleSuggestions: []
  };
  
  // Extract scores
  const readabilityMatch = text.match(/readability:?\s*(\d+)/i);
  if (readabilityMatch) {
    result.readability = Math.min(100, Math.max(0, parseInt(readabilityMatch[1])));
  }
  
  const grammarMatch = text.match(/grammar:?\s*(\d+)/i);
  if (grammarMatch) {
    result.grammar = Math.min(100, Math.max(0, parseInt(grammarMatch[1])));
  }
  
  const originalityMatch = text.match(/originality:?\s*(\d+)/i);
  if (originalityMatch) {
    result.originality = Math.min(100, Math.max(0, parseInt(originalityMatch[1])));
  }
  
  // Extract issues
  const issuesSection = text.match(/issues:?\s*([\s\S]*?)(?=style:|$)/i);
  if (issuesSection && issuesSection[1]) {
    const issuesList = issuesSection[1].split(/\n\s*-\s*/);
    
    for (const issue of issuesList) {
      const trimmedIssue = issue.trim();
      if (trimmedIssue && !trimmedIssue.match(/^issues:?$/i)) {
        const issueType: 'grammar' | 'suggestion' | 'improvement' = 
          trimmedIssue.toLowerCase().includes('grammar') ? 'grammar' : 
          trimmedIssue.toLowerCase().includes('improve') ? 'improvement' : 'suggestion';
        
        result.issues.push({
          type: issueType,
          message: trimmedIssue,
          suggestion: trimmedIssue
        });
      }
    }
  }
  
  // Extract style suggestions
  const styleSection = text.match(/style:?\s*([\s\S]*?)(?=$)/i);
  if (styleSection && styleSection[1]) {
    const styleList = styleSection[1].split(/\n\s*-\s*/);
    
    for (const style of styleList) {
      const trimmedStyle = style.trim();
      if (trimmedStyle && !trimmedStyle.match(/^style:?$/i)) {
        result.styleSuggestions.push({
          type: trimmedStyle.toLowerCase().includes('good') || 
                trimmedStyle.toLowerCase().includes('excellent') || 
                trimmedStyle.toLowerCase().includes('strong') ? 'positive' :
                trimmedStyle.toLowerCase().includes('poor') || 
                trimmedStyle.toLowerCase().includes('weak') || 
                trimmedStyle.toLowerCase().includes('avoid') ? 'negative' : 'neutral',
          message: trimmedStyle
        });
      }
    }
  }
  
  return result;
}