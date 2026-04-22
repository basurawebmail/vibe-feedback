import { NextRequest, NextResponse } from 'next/server'
// import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'edge'

// JSON Schema that Gemini will eventually return
export interface AIAnalysisResult {
  resumen_corto: string
  categoria: 'bug' | 'feature_request' | 'praise' | 'question' | 'other'
  prioridad: 'baja' | 'media' | 'alta' | 'critica'
  sugerencia_accion: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { feedback_id, message, screenshot_url, locale = 'es' } = body

    if (!feedback_id || !message) {
      return NextResponse.json({ error: 'Missing feedback_id or message' }, { status: 400 })
    }

    // ==========================================
    // TODO: GEMINI 2.0 FLASH INTEGRATION (COMMENTED OUT)
    // ==========================================
    /*
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        // Enforce JSON schema
      }
    });

    const prompt = `Analyze this user feedback for our product.
    Message: "${message}"
    ${screenshot_url ? `There is also an attached screenshot.` : ''}
    
    Return a JSON object with:
    - resumen_corto: short summary of the issue/feedback.
    - categoria: 'bug', 'feature_request', 'praise', 'question', or 'other'.
    - prioridad: 'baja', 'media', 'alta', or 'critica'.
    - sugerencia_accion: A suggested action for the product team.
    
    Language: ${locale === 'es' ? 'Spanish' : 'English'}.
    `;

    // If there's an image, fetch it and pass as base64 part
    const parts = [{ text: prompt }];
    if (screenshot_url) {
       // Fetch image and append to parts
    }

    const result = await model.generateContent(parts);
    const analysis: AIAnalysisResult = JSON.parse(result.response.text());
    */

    // ==========================================
    // MOCK RESPONSE
    // ==========================================
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const isSpanish = locale === 'es'
    
    const mockAnalysis: AIAnalysisResult = {
      resumen_corto: isSpanish ? "El usuario reporta un problema no especificado." : "User reports an unspecified issue.",
      categoria: message.toLowerCase().includes('error') || message.toLowerCase().includes('bug') ? 'bug' : 'feature_request',
      prioridad: message.toLowerCase().includes('urgente') || message.toLowerCase().includes('urgent') ? 'alta' : 'media',
      sugerencia_accion: isSpanish ? "Revisar logs del sistema en la sección afectada." : "Check system logs in the affected section."
    }

    // Here you would typically update the Supabase 'feedbacks' row with this analysis
    // e.g. await supabase.from('feedbacks').update({ ai_analysis: mockAnalysis }).eq('id', feedback_id)

    return NextResponse.json({ success: true, analysis: mockAnalysis })
  } catch (error) {
    console.error('AI Process Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
