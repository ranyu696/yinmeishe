import { NextResponse } from 'next/server'
import { auth } from './server/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminPanel = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminPanel) {
    if (isLoggedIn) {
      if (req.auth?.user?.role === 'admin') {
        return NextResponse.next()
      } else {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
    return NextResponse.redirect(new URL('/admin-login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
