import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')
if (!GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  text: string;
  targetLanguage?: string;
  action: 'translate' | 'analyze';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage = 'en', action } = await req.json() as RequestBody;

    if (!text) {
      throw new Error('Text is required');
    }

    if (action === 'translate') {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) {
        return new Response(
          JSON.stringify({ error: { message: data.error.message, code: 'SERVICE_DISABLED' } }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'analyze') {
      const response = await fetch(
        `https://language.googleapis.com/v1/documents:analyzeEntities?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document: {
              type: 'PLAIN_TEXT',
              content: text,
            },
            encodingType: 'UTF8',
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) {
        return new Response(
          JSON.stringify({ error: { message: data.error.message, code: 'SERVICE_DISABLED' } }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: { 
          message: error.message,
          details: error.stack
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
})