// Guidelines module - parses Webex Voice & Tone guidelines and filters relevant rules
import guidelines from '../guidelines-v1.json';

export interface VoicePrinciple {
  id: string;
  name: string;
  description: string;
  examples: {
    good: string;
    bad: string;
  };
}

export interface TonePattern {
  id: string;
  name: string;
  use_for: string;
  description: string;
  style: string;
  example: {
    before: string;
    after: string;
  };
}

export interface Rule {
  id: string;
  description: string;
  do: string;
  dont: string;
  example: {
    good: string;
    bad: string;
  };
}

// Map UI intents to guideline tags and relevant rules
const INTENT_MAP: Record<string, { tags: string[]; rules: string[] }> = {
  'cta': {
    tags: ['cta_primary', 'cta_secondary'],
    rules: ['rule-short_ctas', 'rule-imperative_steps', 'rule-benefit_first_headlines']
  },
  'tooltip': {
    tags: ['tooltip'],
    rules: ['rule-benefit_first_headlines', 'rule-feature_plus_outcome']
  },
  'label': {
    tags: ['headline_product'],
    rules: ['rule-sentence_case_headings']
  },
  'helper': {
    tags: ['helper_text', 'quick_start_step'],
    rules: ['rule-feature_plus_outcome', 'rule-imperative_steps']
  },
  'dialog-title': {
    tags: ['headline_product'],
    rules: ['rule-sentence_case_headings', 'rule-benefit_first_headlines']
  },
  'error': {
    tags: ['error_message'],
    rules: ['rule-calm_error_tone', 'rule-imperative_steps']
  },
  'success': {
    tags: ['success_message'],
    rules: ['rule-confident_reassuring']
  },
  'placeholder': {
    tags: [],
    rules: []
  }
};

// Map audiences to tone patterns
const AUDIENCE_TONE_MAP: Record<string, string> = {
  'general': 'tone-in_product_help',
  'end-user': 'tone-end_user_everyday',
  'it-admins': 'tone-admin_it_guides'
};

/**
 * Get relevant voice principles (always include core ones)
 */
export function getRelevantVoicePrinciples(): VoicePrinciple[] {
  // Return core principles that apply to all writing
  return guidelines.voice_principles.filter(p => 
    ['voice-plain_human', 'voice-action_oriented', 'voice-benefit_led'].includes(p.id)
  );
}

/**
 * Get tone pattern based on audience
 */
export function getTonePattern(audience: string): TonePattern | null {
  const toneId = AUDIENCE_TONE_MAP[audience] || AUDIENCE_TONE_MAP['general'];
  return guidelines.tone_patterns.find(t => t.id === toneId) || null;
}

/**
 * Get relevant rules based on intent
 */
export function getRelevantRules(intent: string): Rule[] {
  const intentData = INTENT_MAP[intent] || { tags: [], rules: [] };
  
  // Get rules by ID
  const rules = guidelines.rules.filter(r => 
    intentData.rules.includes(r.id)
  );
  
  // Always include second person for end users
  const secondPersonRule = guidelines.rules.find(r => r.id === 'rule-second_person_end_user');
  if (secondPersonRule && !rules.find(r => r.id === secondPersonRule.id)) {
    rules.push(secondPersonRule);
  }
  
  return rules;
}

/**
 * Get all guidelines data (for debugging/reference)
 */
export function getAllGuidelines() {
  return guidelines;
}

/**
 * Format rules for prompt inclusion
 */
export function formatRulesForPrompt(rules: Rule[]): string {
  return rules.map((rule, index) => `
${index + 1}. ${rule.description} (${rule.id})
   DO: ${rule.do}
   DON'T: ${rule.dont}
   ✓ Good: "${rule.example.good}"
   ✗ Bad: "${rule.example.bad}"
`).join('\n');
}

/**
 * Format voice principles for prompt
 */
export function formatVoicePrinciplesForPrompt(principles: VoicePrinciple[]): string {
  return principles.map(p => `
- ${p.name}: ${p.description}
  ✓ Good: "${p.examples.good}"
  ✗ Bad: "${p.examples.bad}"
`).join('\n');
}

