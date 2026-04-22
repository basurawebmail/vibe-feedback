import { NextRequest, NextResponse } from 'next/server'
// import Stripe from 'stripe'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-12-18.acacia'
// })

export async function POST(req: NextRequest) {
  try {
    const { projectId, planId } = await req.json()
    // For now, this is a mock. In real production:
    
    /*
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_STARTER_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancel`,
      client_reference_id: projectId, // Link to the project
    })
    return NextResponse.json({ url: session.url })
    */
    
    // MOCK RESPONSE
    console.log(`Mock Stripe Checkout for project ${projectId} to plan ${planId}`)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.json({ url: `${appUrl}/dashboard?checkout=success_mock` })
    
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
