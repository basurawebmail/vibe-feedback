import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  if (!request.cookies.has('NEXT_LOCALE')) {
    const acceptLang = request.headers.get('accept-language') || ''
    const defaultLocale = acceptLang.startsWith('es') ? 'es' : 'en'
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
