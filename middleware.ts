import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get origin from request
    const origin = request.headers.get('origin')

    // Allow requests from frontend (localhost:3001) and production domains
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://bibiginlacorte.com',
      'https://www.bibiginlacorte.com',
    ]

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })

      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }

      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      response.headers.set('Access-Control-Max-Age', '86400')
      response.headers.set('Access-Control-Allow-Credentials', 'true')

      return response
    }

    // For actual requests, continue and add CORS headers to the response
    const response = NextResponse.next()

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    return response
  }

  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: '/api/:path*',
}
