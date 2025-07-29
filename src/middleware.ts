import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = ['/admin', '/accountant', '/client'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;


  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!token) {
    console.warn('❌ Token ausente. Redirecionando para login.');
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '6880cc252d82d03f0907a642');
    const { payload } = await jwtVerify(token, secret);
    
    const userRole = payload.role as string;
    console.log('✅ Token válido. Role:', userRole);

    if (
    (pathname.startsWith('/admin') && userRole !== 'admin') ||
    (pathname.startsWith('/client') && userRole !== 'client') ||
    (pathname.startsWith('/accountant') && userRole !== 'accountant')
  ) {
    console.warn('🚫 Acesso negado para o role:', userRole);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }


    return NextResponse.next();
  } catch (error) {
    console.error('❌ Erro na verificação do token:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/accountant/:path*'
  ],
};
