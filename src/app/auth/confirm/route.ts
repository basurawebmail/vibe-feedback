import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // We keep token_hash for backward compatibility just in case
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as any
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const url = request.nextUrl.clone()
      url.pathname = next
      url.search = ''
      return NextResponse.redirect(url)
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      const url = request.nextUrl.clone()
      url.pathname = next
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  // return the user to an error page with some instructions
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('message', 'Could not verify OTP or code')
  return NextResponse.redirect(url)
}
