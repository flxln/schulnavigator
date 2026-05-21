# Schulnavigator — Architektur

*Stand: 2026-05-21 — siehe [entscheidungen.md](./entscheidungen.md)*

## Tech-Stack

| Bereich | MVP (bis 26.06.) | Langfristig | ADR |
|---|---|---|---|
| Frontend | Next.js (App Router), TypeScript strict, Tailwind | gleich | [002](./adr/002-frontend-nextjs.md) |
| Content | JSON + Medien im Repo | **Directus** (self-hosted) | [003](./adr/003-content-mvp-json-directus.md) |
| Hosting | MPZ-Hetzner via Coolify | gleich | [001](./adr/001-hosting-coolify.md) |
| Containerisierung | Docker | gleich | [001](./adr/001-hosting-coolify.md) |
| Custom-Admin | — | **verworfen** (Directus) | [003](./adr/003-content-mvp-json-directus.md) |
| QR-Code-Generierung | Script (npm `qrcode`) | gleich | — |
| Video-Hosting | MPZ-Server (Upload) | YouTube-Embed nach Rechtsklärung | [004](./adr/004-video-hosting-mpz.md) |
| Zugangskontrolle | Entry-Token, `localStorage`, Modi `fest`/`heft` | gleich | [005](./adr/005-zugangskontrolle-token.md) |
| Navigation | In-App-Scanner (`/scan`) + Raum-QRs | gleich | [005](./adr/005-zugangskontrolle-token.md) |

## URL-Schema

```
/raum/[slug]
```

Sprechende Slugs (z. B. `/raum/musikzimmer`) — siehe [ADR-002](./adr/002-frontend-nextjs.md).

## Datenmodell (Entwurf)

```typescript
type Raum = {
  id: string;
  name: string;
  beschreibung: string;
  bilder: string[];   // URLs
  videos: string[];   // Embed-URLs
  zustaendig: string;
};
```

## Deployment

- **Produktion:** MPZ-Hetzner-Server, gemanagt über Coolify, deployed als Docker-Container
- **Staging:** noch offen — ggf. separates Coolify-Projekt auf demselben Server

### Voraussetzungen fürs Dockerfile

- Multi-stage Build empfohlen (Build-Stage + schlankes Runtime-Image)
- Port via Umgebungsvariable konfigurierbar (`PORT`)
- Health-Check-Endpunkt für Coolify: `/api/health`
