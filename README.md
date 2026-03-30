# RideEveryRoad

[![azure](https://img.shields.io/badge/Azure%20Web%20App-Launch-blue.svg?style=flat)](https://rideeveryroad.azurewebsites.net/)

View all your Strava activities on a single map. Built with **Next.js 14**, **React 18**, **Tailwind CSS**, and **Google Maps**.

## Getting started

```bash
# Install dependencies
npm install

# Create .env.local from the example and fill in your keys
cp .env.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_STRAVA_CLIENT_ID` | Strava API application client ID |
| `STRAVA_CLIENT_SECRET` | Strava API application client secret (server-side only) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key |

## Build

```bash
npm run build
npm start
```

## Deployment

Deployed to Azure Web App via GitHub Actions on push to `main`. Secrets are configured in the repository settings.
