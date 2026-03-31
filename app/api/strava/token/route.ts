import { NextRequest, NextResponse } from 'next/server';

const TOKEN_URL = 'https://www.strava.com/api/v3/oauth/token';

export async function POST(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing env vars:', { hasClientId: !!clientId, hasClientSecret: !!clientSecret });
    return NextResponse.json({ error: 'Server misconfigured: missing Strava credentials' }, { status: 500 });
  }

  const body = await request.json();
  const { grant_type, code, refresh_token } = body;

  const payload = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type,
  });

  if (grant_type === 'authorization_code' && code) {
    payload.set('code', code);
  } else if (grant_type === 'refresh_token' && refresh_token) {
    payload.set('refresh_token', refresh_token);
  } else {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload.toString(),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Strava token error:', res.status, data);
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  });
}
