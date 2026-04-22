import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      script_token,
      type,
      message,
      screenshot_url,
      annotated_image_url,
      email,
      turnstile_token,
      honeypot,
      metadata
    } = await req.json();

    if (honeypot) {
      return new Response(JSON.stringify({ error: "Spam detected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (turnstileSecret && turnstile_token) {
      const formData = new FormData();
      formData.append('secret', turnstileSecret);
      formData.append('response', turnstile_token);
      
      const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: formData
      });
      const turnstileResult = await turnstileRes.json();
      if (!turnstileResult.success) {
         return new Response(JSON.stringify({ error: "Invalid captcha" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('script_token', script_token)
      .single();

    if (projectError || !project) {
      return new Response(JSON.stringify({ error: "Invalid project token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    let gemini_summary = null;
    
    if (geminiKey && message) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
      
      const prompt = `
        Analiza el siguiente feedback o reporte de un usuario.
        Extrae un JSON con la siguiente estructura (siempre asegúrate de devolver un JSON válido sin markdown code blocks extras, o con mimeType JSON):
        {
          "categoria": "Bug | Feature Request | Queja | Pregunta | Otro",
          "prioridad": "Alta | Media | Baja",
          "resumen_corto": "Una frase corta resumiendo el problema",
          "sugerencia_accion": "Qué debería hacer el dueño del sitio para resolverlo"
        }
        
        Mensaje del usuario: "${message}"
        Tipo reportado por el usuario: "${type}"
      `;

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        })
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          try {
            gemini_summary = JSON.parse(responseText);
          } catch (e) {
            console.error("Failed to parse Gemini response:", responseText);
          }
        }
      } else {
        console.error("Gemini API Error:", await geminiRes.text());
      }
    }

    const { error: insertError } = await supabase
      .from('feedbacks')
      .insert({
        project_id: project.id,
        type,
        message,
        screenshot_url,
        annotated_image_url,
        email,
        metadata,
        gemini_summary
      });

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
