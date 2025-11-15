// OpenAI integration - calls GPT-4o-mini with Webex guidelines
import { buildPrompt, PromptContext } from './prompt-builder';

export interface Variant {
  text: string;
  rationale: string;
  appliedRules: string[];
}

export interface GenerateVariantsResponse {
  variants: Variant[];
}

/**
 * Generate text variants using OpenAI GPT-4o-mini
 */
export async function generateVariants(
  context: PromptContext,
  openaiApiKey: string
): Promise<GenerateVariantsResponse> {
  const prompt = buildPrompt(context);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Webex UX writing expert. Generate text variants following Webex Voice & Tone guidelines. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }
  
  const data = await response.json() as any;
  const content = data.choices[0].message.content;
  
  try {
    const result = JSON.parse(content) as GenerateVariantsResponse;
    
    // Validate response structure
    if (!result.variants || !Array.isArray(result.variants)) {
      throw new Error('Invalid response format: missing variants array');
    }
    
    // Ensure we have 3 variants
    if (result.variants.length !== 3) {
      throw new Error(`Expected 3 variants, got ${result.variants.length}`);
    }
    
    // Validate each variant
    result.variants.forEach((v, index) => {
      if (!v.text || !v.rationale || !v.appliedRules) {
        throw new Error(`Variant ${index + 1} is missing required fields`);
      }
    });
    
    return result;
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error(`Failed to parse OpenAI response: ${parseError}`);
  }
}

