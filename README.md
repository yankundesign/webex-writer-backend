# Webex Writer Backend

Backend API for the Write Like Webex Figma plugin. Uses OpenAI GPT-4o-mini with actual Webex Voice & Tone guidelines to generate contextual text variants.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set OpenAI API Key
```bash
npx wrangler secret put OPENAI_API_KEY
# Paste your OpenAI API key when prompted
```

### 3. Run Locally
```bash
npm run dev
# Server will start on http://localhost:8787
```

### 4. Deploy to Cloudflare
```bash
npm run deploy
```

## API Endpoint

### POST `/api/generate-variants`

**Request Body:**
```json
{
  "originalText": "Click here to start",
  "intent": "cta",
  "audience": "end-user",
  "instructions": "Make it more friendly"
}
```

**Response:**
```json
{
  "variants": [
    {
      "text": "Start your meeting",
      "rationale": "Direct action verb, friendly tone...",
      "appliedRules": ["rule-short_ctas", "voice-action_oriented"]
    }
  ]
}
```

## Guidelines

The backend uses `guidelines-v1.json` which contains:
- 7 voice principles (benefit-led, plain language, action-oriented, etc.)
- 6 tone patterns (marketing, in-product help, troubleshooting, etc.)
- 14 specific rules with good/bad examples
- Intent mapping to relevant rules

## Project Structure

```
webex-writer-backend/
├── src/
│   ├── index.ts           # Main API endpoint with CORS
│   ├── guidelines.ts      # Parse and filter guidelines
│   ├── prompt-builder.ts  # Build contextual prompts
│   └── openai.ts          # OpenAI API integration
├── guidelines-v1.json     # Webex Voice & Tone guidelines
└── wrangler.jsonc         # Cloudflare Worker config
```

## Testing

Test with curl:
```bash
curl -X POST http://localhost:8787/api/generate-variants \
  -H "Content-Type: application/json" \
  -d '{
    "originalText": "Click here",
    "intent": "cta",
    "audience": "general"
  }'
```

## Cost

- Cloudflare Workers: Free (100k requests/day)
- OpenAI GPT-4o-mini: ~$0.0045 per call
- Estimated monthly cost: $10-30 depending on usage

