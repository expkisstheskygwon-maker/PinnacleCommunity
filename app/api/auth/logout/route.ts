import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear the auth_session cookie
  response.cookies.set('auth_session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0 // Expire immediately
  });

  return response;
}
