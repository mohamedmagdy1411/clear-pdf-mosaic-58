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
      prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`
      break
    case 'explain':
      const style = options?.style || 'simple'
      let stylePrompt = ''
      switch (style) {
        case 'technical':
          stylePrompt = 'using technical terminology and detailed explanations'
          break
        case 'academic':
          stylePrompt = 'in an academic style with formal language and citations where relevant'
          break
        case 'simple':
        default:
          stylePrompt = 'in simple terms that anyone can understand'
      }
      prompt = `Explain the following text ${stylePrompt}:\n\n${text}`
      break
    case 'quiz':
      prompt = `Create 3 multiple choice questions based on this text. Format your response as a JSON array with exactly this structure, no additional text or explanation:
[
  {
    "question": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctIndex": 0
  }
]
Make sure:
- Generate exactly 3 questions
- Each question has exactly 4 options
- correctIndex is a number (0-3) indicating the correct option
- The response is valid JSON
Here's the text:\n\n${text}`
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
        // Clean the response to ensure it's valid JSON
        const cleanedResult = result.trim()
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
        
        // Parse and validate the quiz format
        const parsed = JSON.parse(cleanedResult)
        
        if (!Array.isArray(parsed)) {
          console.error('Quiz response is not an array:', parsed)
          throw new Error('Quiz response is not an array')
        }
        
        if (parsed.length !== 3) {
          console.error('Quiz response does not contain exactly 3 questions:', parsed)
          throw new Error('Quiz must contain exactly 3 questions')
        }
        
        parsed.forEach((q, index) => {
          if (!q.question || typeof q.question !== 'string') {
            throw new Error(`Invalid question format in question ${index + 1}`)
          }
          if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw new Error(`Question ${index + 1} must have exactly 4 options`)
          }
          if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
            throw new Error(`Invalid correctIndex in question ${index + 1}`)
          }
        })
        
        return JSON.stringify(parsed)
      } catch (e) {
        console.error('Quiz parsing error:', e, '\nRaw response:', result)
        throw new Error('Failed to parse quiz response: ' + e.message)
      }
    }

    return result
  } catch (error) {
    console.error('Error in generateGeminiResponse:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
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