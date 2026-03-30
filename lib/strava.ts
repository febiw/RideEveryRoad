import { SummaryActivity } from './types';
import { writeCookie, readCookie, cookieExists } from './cookies';

const CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!;
const TOKEN_URL = 'https://www.strava.com/api/v3/oauth/token';
const ACTIVITIES_URL = 'https://www.strava.com/api/v3/athlete/activities';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

let accessToken = '';

export function getOAuthUrl(): string {
  const redirectUri = `${window.location.origin}/exchange_token`;
  return (
    'https://www.strava.com/oauth/authorize' +
    `?client_id=${CLIENT_ID}` +
    '&response_type=code' +
    `&redirect_uri=${redirectUri}` +
    '&approval_prompt=force' +
    '&scope=read,activity:read_all,activity:read'
  );
}

export function hasCachedRefreshToken(): boolean {
  return cookieExists('oauth_refresh_token');
}

function getCachedRefreshToken(): string | null {
  return readCookie('oauth_refresh_token');
}

async function tokenRequest(body: Record<string, string>): Promise<void> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status}`);
  }

  const data: TokenResponse = await res.json();
  accessToken = data.access_token;
  writeCookie('oauth_refresh_token', data.refresh_token, 365);
}

export async function exchangeCode(code: string): Promise<void> {
  const res = await fetch('/api/strava/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, grant_type: 'authorization_code' }),
  });

  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);

  const data: TokenResponse = await res.json();
  accessToken = data.access_token;
  writeCookie('oauth_refresh_token', data.refresh_token, 365);
}

export async function refreshTokens(): Promise<void> {
  const refreshToken = getCachedRefreshToken();
  if (!refreshToken) throw new Error('No cached refresh token');

  const res = await fetch('/api/strava/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken, grant_type: 'refresh_token' }),
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);

  const data: TokenResponse = await res.json();
  accessToken = data.access_token;
  writeCookie('oauth_refresh_token', data.refresh_token, 365);
}

async function fetchActivitiesPage(page: number, after?: number): Promise<SummaryActivity[]> {
  const params = new URLSearchParams({
    per_page: '200',
    page: String(page),
  });
  if (after) params.set('after', String(after));

  const res = await fetch(`${ACTIVITIES_URL}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Activities fetch failed: ${res.status}`);
  return res.json();
}

export async function getAllActivities(): Promise<SummaryActivity[]> {
  const activities: SummaryActivity[] = [];
  let page = 1;
  let batch: SummaryActivity[];

  do {
    batch = await fetchActivitiesPage(page);
    activities.push(...batch);
    page++;
  } while (batch.length === 200);

  return activities;
}

export async function getActivitiesSince(date: Date): Promise<SummaryActivity[]> {
  const afterEpoch = Math.floor(date.getTime() / 1000);
  const activities: SummaryActivity[] = [];
  let page = 1;
  let batch: SummaryActivity[];

  do {
    batch = await fetchActivitiesPage(page, afterEpoch);
    activities.push(...batch);
    page++;
  } while (batch.length === 200);

  return activities.sort((a, b) =>
    a.start_date > b.start_date ? 1 : -1
  );
}
