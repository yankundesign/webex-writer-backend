# Deployment Guide

## Backend Deployment to Cloudflare

### Prerequisites
1. Cloudflare account (free tier is sufficient)
2. OpenAI API key with GPT-4o-mini access
3. Wrangler CLI (already installed in the project)

### Step 1: Login to Cloudflare
```bash
cd webex-writer-backend
npx wrangler login
```

This will open a browser window to authenticate with Cloudflare.

### Step 2: Set OpenAI API Key
```bash
npx wrangler secret put OPENAI_API_KEY
```

When prompted, paste your OpenAI API key (starts with `sk-`).

### Step 3: Deploy
```bash
npm run deploy
```

This will:
- Build the TypeScript code
- Upload the worker to Cloudflare
- Provide you with a production URL (e.g., `https://webex-writer-backend.YOUR-SUBDOMAIN.workers.dev`)

### Step 4: Test the Deployed API
```bash
curl -X POST https://webex-writer-backend.YOUR-SUBDOMAIN.workers.dev/api/generate-variants \
  -H "Content-Type: application/json" \
  -d '{
    "originalText": "Click here to start",
    "intent": "cta",
    "audience": "end-user"
  }'
```

You should get back 3 variants with rationale and applied rules.

## Update Figma Plugin

Once deployed, update the Figma plugin to use the production API URL:

### In `/Users/yankunwang/WLW-Figma/ui.html`

Replace the mock LLM with a real API call:

```javascript
// Replace the computeMockCandidates function with:
async function generateVariantsFromAPI() {
  const settings = getSettings();
  
  try {
    const response = await fetch('https://webex-writer-backend.YOUR-SUBDOMAIN.workers.dev/api/generate-variants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalText: state.original,
        intent: settings.intent,
        audience: settings.audience,
        instructions: settings.instructions
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.variants;
  } catch (error) {
    console.error('Failed to generate variants:', error);
    // Fallback to mock if API fails
    return computeMockCandidates();
  }
}

// Update generateVariants function:
async function generateVariants() {
  if (!state.original) return;
  
  state.isGenerating = true;
  renderUI();
  
  try {
    // Call the real API
    state.candidates = await generateVariantsFromAPI();
    state.activeTab = 0;
    renderUI();
    
    // Auto-scroll to results
    setTimeout(() => {
      const resultsSection = document.getElementById('results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  } catch (error) {
    console.error('Generation failed:', error);
    alert('Failed to generate variants. Please try again.');
  } finally {
    state.isGenerating = false;
    renderUI();
  }
}
```

## Local Development (Optional)

To test the backend locally before deploying:

1. Create `.dev.vars` file:
```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars and add your OpenAI API key
```

2. Start local server:
```bash
npm run dev
```

3. Test with curl:
```bash
curl -X POST http://localhost:8787/api/generate-variants \
  -H "Content-Type: application/json" \
  -d '{
    "originalText": "Click here",
    "intent": "cta",
    "audience": "general"
  }'
```

## Cost Monitoring

Monitor your usage in the Cloudflare dashboard:
- Workers: https://dash.cloudflare.com/workers
- OpenAI: https://platform.openai.com/usage

Expected costs:
- Cloudflare Workers: Free (up to 100k requests/day)
- OpenAI GPT-4o-mini: ~$0.0045 per generation (3 variants)
- Estimated: $10-30/month for moderate use

## Troubleshooting

### Error: "Server configuration error"
- The OPENAI_API_KEY secret is not set. Run `npx wrangler secret put OPENAI_API_KEY`

### Error: "Failed to generate variants"
- Check OpenAI API key is valid and has credits
- Check Cloudflare Workers logs: `npx wrangler tail`

### CORS errors in Figma
- Ensure the worker is deployed (not just running locally)
- Check the CORS headers in `src/index.ts`

