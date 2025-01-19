import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

async function generateGeminiResponse(text: string, action: string, options?: { language?: string, style?: string }) {
  let prompt = ''
  
  switch (action) {
    case 'translate':
      const targetLanguage = options?.language || 'English'
      prompt = `Translate the following text to ${targetLanguage}: "${text}"`
      break
    case 'explain':
      const style = options?.style || 'simple'
      let stylePrompt = ''
      switch (style) {
        case 'technical':
          stylePrompt = 'using technical terminology'
          break
        case 'academic':
          stylePrompt = 'in an academic style'
          break
        case 'simple':
        default:
          stylePrompt = 'in simple terms'
      }
      prompt = `Explain the following text ${stylePrompt}: "${text}"`
      break
    case 'quiz':
      prompt = `Generate 3 multiple choice questions based on this text: "${text}". Format your response as a valid JSON array with this exact structure: [{"question": "question text", "options": ["option1", "option2", "option3", "option4"], "correctIndex": 0}]. Make sure the JSON is properly formatted and each question has exactly 4 options.`
      break
    default:
      throw new Error('Invalid action')
  }

  console.log('Sending prompt to Gemini:', prompt)

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', error)
      throw new Error(`Gemini API error: ${error}`)
    }

    const data = await response.json()
    const result = data.candidates[0].content.parts[0].text

    if (action === 'quiz') {
      try {
        // Validate quiz format
        const parsed = JSON.parse(result)
        if (!Array.isArray(parsed)) throw new Error('Quiz response is not an array')
        parsed.forEach((q: any) => {
          if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctIndex !== 'number') {
            throw new Error('Invalid quiz question format')
          }
        })
        return result
      } catch (e) {
        console.error('Quiz parsing error:', e)
        throw new Error('Failed to parse quiz response')
      }
    }

    return result
  } catch (error) {
    console.error('Error in generateGeminiResponse:', error)
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, action, options } = await req.json()

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const result = await generateGeminiResponse(text, action, options)

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in gemini-ai function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})