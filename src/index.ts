// Main Cloudflare Worker - API endpoint for generating text variants
import { generateVariants } from './openai';

export interface Env {
  OPENAI_API_KEY: string;
}

// CORS headers for Figma plugin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: corsHeaders }
      );
    }
    
    // Check if this is the generate-variants endpoint
    const url = new URL(request.url);
    if (!url.pathname.endsWith('/api/generate-variants')) {
      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: corsHeaders }
      );
    }
    
    try {
      // Parse request body
      const body = await request.json() as any;
      const { originalText, intent, audience, instructions } = body;
      
      // Validate required fields
      if (!originalText) {
        return new Response(
          JSON.stringify({ error: 'originalText is required' }),
          { status: 400, headers: corsHeaders }
        );
      }
      
      // Check for API key
      if (!env.OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY not configured');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          { status: 500, headers: corsHeaders }
        );
      }
      
      // Generate variants
      const result = await generateVariants(
        {
          originalText,
          intent: intent || '',
          audience: audience || 'general',
          instructions: instructions || ''
        },
        env.OPENAI_API_KEY
      );
      
      // Return success response
      return new Response(
        JSON.stringify(result),
        { status: 200, headers: corsHeaders }
      );
      
    } catch (error) {
      console.error('Error generating variants:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate variants',
          details: errorMessage
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  }
};
