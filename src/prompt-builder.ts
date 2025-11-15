// Prompt builder - constructs contextual prompts using Webex guidelines
import {
  getRelevantVoicePrinciples,
  getTonePattern,
  getRelevantRules,
  formatRulesForPrompt,
  formatVoicePrinciplesForPrompt
} from './guidelines';

export interface PromptContext {
  originalText: string;
  intent: string;
  audience: string;
  instructions?: string;
}

/**
 * Build a contextual prompt for OpenAI based on Webex guidelines
 */
export function buildPrompt(context: PromptContext): string {
  const { originalText, intent, audience, instructions } = context;
  
  // Get relevant guidelines
  const voicePrinciples = getRelevantVoicePrinciples();
  const tonePattern = getTonePattern(audience);
  const rules = getRelevantRules(intent);
  
  // Build the prompt
  return `You are a Webex UX writing expert. Generate exactly 2 distinct text variants following Webex guidelines.

ORIGINAL TEXT: "${originalText}"
INTENT: ${intent || 'general UI text'}
AUDIENCE: ${audience || 'general'}
${instructions ? `CUSTOM INSTRUCTIONS: ${instructions}` : ''}

=== WEBEX VOICE PRINCIPLES ===
${formatVoicePrinciplesForPrompt(voicePrinciples)}

${tonePattern ? `=== TONE PATTERN: ${tonePattern.name} ===
Use for: ${tonePattern.use_for}
Description: ${tonePattern.description}
Style: ${tonePattern.style}

Example transformation:
Before: "${tonePattern.example.before}"
After: "${tonePattern.example.after}"
` : ''}

=== RELEVANT RULES ===
${formatRulesForPrompt(rules)}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 2 variants (not 3, not 1, exactly 2)
2. Preserve ALL placeholders exactly: {name}, {{email}}, {variable}, etc.
3. Each variant must be meaningfully different from the other
4. Apply Webex voice: benefit-led, clear, action-oriented, plain language
5. Follow the tone pattern for ${audience} audience
6. Apply the specific rules listed above
7. Keep variants concise and scannable

RETURN FORMAT:
Return a valid JSON object with this exact structure (2 variants only):
{
  "variants": [
    {
      "text": "the generated text variant here",
      "rationale": "explain why this variant follows Webex voice and guidelines",
      "appliedRules": ["rule-id-1", "rule-id-2", "rule-id-3"]
    },
    {
      "text": "second variant here",
      "rationale": "rationale for second variant",
      "appliedRules": ["rule-id-1", "rule-id-2"]
    }
  ]
}

Use the exact rule IDs from the guidelines above (e.g., "rule-short_ctas", "voice-benefit_led").`;
}

