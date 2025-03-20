import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function paraphraseText(text: string, mode: string = "standard"): Promise<{ 
  processedText: string, 
  similarity: number,
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
  const modeInstructions = {
    standard: "Maintain a balance between originality and preserving meaning",
    formal: "Use formal language, academic tone, and professional vocabulary",
    creative: "Use creative language with unique expressions while preserving core meaning",
    simplified: "Simplify the text to make it easier to understand while preserving key information"
  };

  try {
    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      // Return a fallback response if API key is missing
      return {
        processedText: `[OpenAI API key missing] ${text}`,
        similarity: 100
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert paraphrasing assistant. ${modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions.standard}. 
          Respond with JSON in this format: { "processedText": "paraphrased text here", "similarity": number between 0-100 }`
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
      processedText: result.processedText || "",
      similarity: result.similarity || 70,
      issues: []
    };
  } catch (error: any) {
    console.error("Paraphrasing error:", error.message);
    
    // Handle quota exceeded errors
    if (error.message.includes("429") || error.message.includes("exceeded your current quota")) {
      return {
        processedText: `[API quota exceeded] Unable to process text with OpenAI. ${text}`,
        similarity: 100
      };
    }
    
    // Handle other API errors
    if (error.message.includes("OpenAI")) {
      return {
        processedText: `[OpenAI API error] Unable to process text: ${error.message}. ${text}`,
        similarity: 100
      };
    }
    
    throw new Error("Failed to paraphrase text");
  }
}

export async function humanizeAIText(text: string): Promise<{ 
  processedText: string, 
  similarity?: number,
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
  try {
    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return {
        processedText: `[OpenAI API key missing] ${text}`,
        similarity: 100
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at making AI-generated text sound more human. Remove repetitive patterns, add natural language variations, incorporate conversational elements, and vary sentence structures. 
          Respond with JSON in this format: { "processedText": "humanized text here" }`
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
      processedText: result.processedText || ""
    };
  } catch (error: any) {
    console.error("Humanizing error:", error.message);
    
    // Handle quota exceeded errors
    if (error.message.includes("429") || error.message.includes("exceeded your current quota")) {
      return {
        processedText: `[API quota exceeded] Unable to process text with OpenAI. ${text}`,
        similarity: 100
      };
    }
    
    // Handle other API errors
    if (error.message.includes("OpenAI")) {
      return {
        processedText: `[OpenAI API error] Unable to process text: ${error.message}. ${text}`,
        similarity: 100
      };
    }
    
    throw new Error("Failed to humanize text");
  }
}

export async function rewordText(text: string): Promise<{ processedText: string, similarity?: number }> {
  try {
    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return {
        processedText: `[OpenAI API key missing] ${text}`,
        similarity: 100
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at rewording text. Replace words with synonyms while preserving the original meaning, structure, and length.
          Respond with JSON in this format: { "processedText": "reworded text here" }`
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
      processedText: result.processedText || ""
    };
  } catch (error: any) {
    console.error("Rewording error:", error.message);
    
    // Handle quota exceeded errors
    if (error.message.includes("429") || error.message.includes("exceeded your current quota")) {
      return {
        processedText: `[API quota exceeded] Unable to process text with OpenAI. ${text}`,
        similarity: 100
      };
    }
    
    // Handle other API errors
    if (error.message.includes("OpenAI")) {
      return {
        processedText: `[OpenAI API error] Unable to process text: ${error.message}. ${text}`,
        similarity: 100
      };
    }
    
    throw new Error("Failed to reword text");
  }
}

export async function rewriteParagraph(text: string): Promise<{ processedText: string, similarity?: number }> {
  try {
    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return {
        processedText: `[OpenAI API key missing] ${text}`,
        similarity: 100
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at rewriting paragraphs. Restructure and rephrase the paragraph while maintaining the core information and meaning.
          Respond with JSON in this format: { "processedText": "rewritten paragraph here" }`
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
      processedText: result.processedText || ""
    };
  } catch (error: any) {
    console.error("Paragraph rewriting error:", error.message);
    
    // Handle quota exceeded errors
    if (error.message.includes("429") || error.message.includes("exceeded your current quota")) {
      return {
        processedText: `[API quota exceeded] Unable to process text with OpenAI. ${text}`,
        similarity: 100
      };
    }
    
    // Handle other API errors
    if (error.message.includes("OpenAI")) {
      return {
        processedText: `[OpenAI API error] Unable to process text: ${error.message}. ${text}`,
        similarity: 100
      };
    }
    
    throw new Error("Failed to rewrite paragraph");
  }
}

export async function summarizeText(text: string): Promise<{ processedText: string, similarity?: number }> {
  try {
    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return {
        processedText: `[OpenAI API key missing] ${text}`,
        similarity: 100
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at summarizing text. Create a concise summary that captures the main points and key information.
          Respond with JSON in this format: { "processedText": "summarized text here" }`
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
      processedText: result.processedText || ""
    };
  } catch (error: any) {
    console.error("Summarizing error:", error.message);
    
    // Handle quota exceeded errors
    if (error.message.includes("429") || error.message.includes("exceeded your current quota")) {
      return {
        processedText: `[API quota exceeded] Unable to process text with OpenAI. ${text}`,
        similarity: 100
      };
    }
    
    // Handle other API errors
    if (error.message.includes("OpenAI")) {
      return {
        processedText: `[OpenAI API error] Unable to process text: ${error.message}. ${text}`,
        similarity: 100
      };
    }
    
    throw new Error("Failed to summarize text");
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<{ processedText: string, similarity?: number }> {
  try {
    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return {
        processedText: `[OpenAI API key missing] ${text}`,
        similarity: 100
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert translator. Translate the following text into ${targetLanguage} while preserving the meaning and tone.
          Respond with JSON in this format: { "processedText": "translated text here" }`
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
      processedText: result.processedText || ""
    };
  } catch (error: any) {
    console.error("Translation error:", error.message);
    
    // Handle quota exceeded errors
    if (error.message.includes("429") || error.message.includes("exceeded your current quota")) {
      return {
        processedText: `[API quota exceeded] Unable to process text with OpenAI. ${text}`,
        similarity: 100
      };
    }
    
    // Handle other API errors
    if (error.message.includes("OpenAI")) {
      return {
        processedText: `[OpenAI API error] Unable to process text: ${error.message}. ${text}`,
        similarity: 100
      };
    }
    
    throw new Error("Failed to translate text");
  }
}

export async function checkGrammar(text: string): Promise<{ processedText: string, issues: any[], similarity?: number }> {
  try {
    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return {
        processedText: `[OpenAI API key missing] ${text}`,
        issues: [],
        similarity: 100
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert grammar checker. Identify and correct grammar, punctuation, and spelling errors in the text.
          Respond with JSON in this format: { 
            "processedText": "corrected text here", 
            "issues": [
              {
                "type": "grammar",
                "message": "Description of the error",
                "suggestion": "Suggested correction",
                "position": { "start": 0, "end": 0 }
              }
            ]
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
      processedText: result.processedText || "",
      issues: result.issues || []
    };
  } catch (error: any) {
    console.error("Grammar checking error:", error.message);
    
    // Handle quota exceeded errors
    if (error.message.includes("429") || error.message.includes("exceeded your current quota")) {
      return {
        processedText: `[API quota exceeded] Unable to process text with OpenAI. ${text}`,
        issues: [],
        similarity: 100
      };
    }
    
    // Handle other API errors
    if (error.message.includes("OpenAI")) {
      return {
        processedText: `[OpenAI API error] Unable to process text: ${error.message}. ${text}`,
        issues: [],
        similarity: 100
      };
    }
    
    throw new Error("Failed to check grammar");
  }
}

export async function analyzeText(text: string): Promise<any> {
  try {
    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      // Return a basic analysis with default values
      const basicStats = {
        words: text.trim().split(/\s+/).length,
        characters: text.length,
        sentences: text.split(/[.!?]+/).filter(s => s.trim() !== '').length,
        paragraphs: text.split(/\n\s*\n/).filter(p => p.trim() !== '').length || 1,
        readingTime: Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 225)),
        speakingTime: Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 150))
      };
      
      return {
        readability: 50,
        grammar: 50,
        originality: 50,
        issues: [],
        statistics: basicStats,
        styleSuggestions: []
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert text analyzer. Analyze the text and provide metrics on readability, grammar quality, originality, and style suggestions.
          Respond with JSON in this format: { 
            "readability": number between 0-100,
            "grammar": number between 0-100,
            "originality": number between 0-100,
            "issues": [
              {
                "type": "grammar|suggestion|improvement",
                "message": "Description of the issue",
                "suggestion": "Suggested improvement"
              }
            ],
            "statistics": {
              "readingTime": number in minutes,
              "speakingTime": number in minutes,
              "sentences": number,
              "paragraphs": number,
              "words": number,
              "characters": number
            },
            "styleSuggestions": [
              {
                "type": "positive|negative|neutral",
                "message": "Style suggestion message"
              }
            ]
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
    return result;
  } catch (error: any) {
    console.error("Text analysis error:", error.message);
    
    // Return a basic analysis if OpenAI fails
    if (error.message.includes("429") || error.message.includes("exceeded your current quota") || error.message.includes("OpenAI")) {
      const basicStats = {
        words: text.trim().split(/\s+/).length,
        characters: text.length,
        sentences: text.split(/[.!?]+/).filter(s => s.trim() !== '').length,
        paragraphs: text.split(/\n\s*\n/).filter(p => p.trim() !== '').length || 1,
        readingTime: Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 225)),
        speakingTime: Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 150))
      };
      
      return {
        readability: 50,
        grammar: 50,
        originality: 50,
        issues: [
          {
            type: "suggestion",
            message: "OpenAI API unavailable",
            suggestion: "Unable to perform detailed analysis due to API limits or errors."
          }
        ],
        statistics: basicStats,
        styleSuggestions: []
      };
    }
    
    throw new Error("Failed to analyze text");
  }
}
