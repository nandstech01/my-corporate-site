import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect CLAVI routes - redirect to login if not authenticated
  const claviPublicPrefixes = [
    '/clavi/login',
    '/clavi/signup',
    '/clavi/pricing',
    '/clavi/features',
    '/clavi/contact',
    '/clavi/case-studies',
    '/clavi/blog',
  ]

  const isClaviPublic =
    request.nextUrl.pathname === '/clavi' ||
    claviPublicPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))

  if (request.nextUrl.pathname.startsWith('/clavi') && !isClaviPublic && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/clavi/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: Return the supabaseResponse object as-is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     * - api/slack (Slack webhook endpoints - no auth needed)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/slack/|api/v1/|api/sns-pilot/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
