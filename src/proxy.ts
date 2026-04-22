import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  const response = await updateSession(request)

  // Auto-detect user locale if no preference is saved
  if (!request.cookies.has('NEXT_LOCALE')) {
    const acceptLang = request.headers.get('accept-language') || ''
    const defaultLocale = acceptLang.toLowerCase().startsWith('es') ? 'es' : 'en'
    response.cookies.set('NEXT_LOCALE', defaultLocale, { path: '/', maxAge: 31536000 })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
