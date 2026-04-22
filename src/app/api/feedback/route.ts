import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // We need a way to bypass RLS or ensure RLS allows reading 'projects' by script_token
  // and inserting into 'feedbacks' by project_id
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Fallback to anon key if service role is not provided
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const body = await req.json()
    const { script_token, type, message, screenshot_url, metadata, email } = body

    if (!script_token || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 1. Get project ID from token
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('script_token', script_token)
      .single()

    if (projectError || !project) {
      console.error('Project lookup error:', projectError)
      return new Response(JSON.stringify({ error: 'Invalid token or project not found' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    // 2. Insert feedback
    const { data: feedback, error: insertError } = await supabase
      .from('feedbacks')
      .insert({
        project_id: project.id,
        type: type || 'feedback',
        message,
        screenshot_url,
        metadata,
        email
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to save feedback' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    return new Response(JSON.stringify({ success: true, data: feedback }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (err) {
    console.error('Feedback API Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
