import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature')

  // MOCK WEBHOOK FOR MVP
  // In production, verify signature with Stripe SDK
  try {
    const event = JSON.parse(payload) // mock parsing without signature verification
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const projectId = session.client_reference_id

      if (projectId) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Upgrade the project's plan to starter
        await supabase
          .from('projects')
          .update({ plan: 'starter' })
          .eq('id', projectId)

        console.log(`Successfully upgraded project ${projectId} to Starter plan.`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 })
  }
}
