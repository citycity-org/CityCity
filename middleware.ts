import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Coming Soon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f0f0f;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #fff;
    }
    .container { text-align: center; padding: 2rem; }
    .logo { font-size: 2.5rem; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 1.5rem; }
    .divider { width: 40px; height: 2px; background: #fff; margin: 0 auto 1.5rem; opacity: 0.3; }
    p { font-size: 1rem; color: rgba(255,255,255,0.5); letter-spacing: 0.02em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">LAKIVE</div>
    <div class="divider"></div>
    <p>Something better is coming.</p>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    }
  )
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
