# Schulnavigator — Architektur

_Stand: 2026-05-21 (Issue #16: Deploy-Runbook, `/eintritt`-Platzhalter, `robots`/`noindex`) — siehe [entscheidungen.md](./entscheidungen.md)_

## Tech-Stack

| Bereich             | MVP (bis 26.06.)                                  | Langfristig                      | ADR                                           |
| ------------------- | ------------------------------------------------- | -------------------------------- | --------------------------------------------- |
| Frontend            | Next.js (App Router), TypeScript strict, Tailwind | gleich                           | [002](./adr/002-frontend-nextjs.md)           |
| Content             | JSON + Medien im Repo                             | **Directus** (self-hosted)       | [003](./adr/003-content-mvp-json-directus.md) |
| Hosting             | MPZ-Hetzner via Coolify                           | gleich                           | [001](./adr/001-hosting-coolify.md)           |
| Containerisierung   | Docker                                            | gleich                           | [001](./adr/001-hosting-coolify.md)           |
| Custom-Admin        | —                                                 | **verworfen** (Directus)         | [003](./adr/003-content-mvp-json-directus.md) |
| QR-Code-Generierung | Script `npm run generate:qr`, `lib/qr-urls.ts` (URLs) | gleich                           | —                                             |
| Video-Hosting       | MPZ-Server (Upload)                               | YouTube-Embed nach Rechtsklärung | [004](./adr/004-video-hosting-mpz.md)         |
| Zugangskontrolle    | Entry-Token, `localStorage`, Modi `fest`/`heft`   | gleich                           | [005](./adr/005-zugangskontrolle-token.md)    |
| Navigation          | In-App-Scanner (`/scan`) + Raum-QRs               | gleich                           | [005](./adr/005-zugangskontrolle-token.md)    |
| Raum-Viewer         | Gyro-Pan, Hotspots, Tap-Fallback; normales Foto   | gleich                           | [006](./adr/006-raum-viewer-gyro-hotspots.md) |

## URL-Schema

```
/
/eintritt
/scan
/raum/[slug]
```

- **`/`** — Startseite mit schematischem Schulhaus-Hub (Stationen; Phase 2: Puzzle-Modus nach Token).
- **`/eintritt`** — Platzhalter bis Phase 2 (#23); gleiche URL-Form wie auf den Entry-QRs (Issue #15).
- **`/scan`** — Platzhalter bis Phase 2; später In-App-QR-Scanner — [ADR-005](./adr/005-zugangskontrolle-token.md).

Sprechende Raum-Slugs (z. B. `/raum/musik`) — siehe [ADR-002](./adr/002-frontend-nextjs.md).

**Stabilität:** Die Pfade `/raum/[slug]` sind an **gedruckte Raum-QRs** gekoppelt (Issue #15). Slugs in `stations.json` und Dateinamen unter `public/stations/` nur mit bewusster Migration ändern.

## Datenmodell (Entwurf)

Siehe [ADR-006](./adr/006-raum-viewer-gyro-hotspots.md) und Issue #12.

```typescript
interface Hotspot {
  id: string;
  label?: string;
  x: number; // 0–1
  y: number;
  radius?: number;
  mediumId: string;
}

interface Medium {
  id: string;
  typ: "audio" | "video" | "foto" | "text";
  quelle: string;
  videoSource?: "upload" | "youtube";
  untertitel?: string;
}

interface Station {
  slug: string;
  titel: string;
  beschreibung: string;
  bild?: string; // /public/stations/… — fehlt → statische Ansicht
  medien: Medium[];
  hotspots?: Hotspot[];
  puzzleSegmentId: string; // Zuordnung Schulhaus-Hub (11 Segmente), Pflicht im MVP-JSON
}
```

## Deployment

- **Produktion:** MPZ-Hetzner-Server, gemanagt über Coolify, deployed als Docker-Container ([`anleitungen/fuer-entwickler.md`](../anleitungen/fuer-entwickler.md) — Abschnitt „Coolify“).
- **Öffentliche URL:** `https://schulnavigator.mpz.schule` — erreichbar über MPZ-Wildcard-DNS **`*.mpz.schule`** → Coolify-VPS `217.154.120.240` (kein eigener A-Record nur für `schulnavigator` nötig).
- **Image:** [`app/Dockerfile`](../../app/Dockerfile) — Multi-Stage, `output: 'standalone'`, Health `GET /api/health`, Container-Port **`PORT=3000`** (Coolify „Ports Exposes“ = `3000`).
- **Suchmaschinen:** `robots.txt` mit `Disallow: /` und `noindex` im Root-Layout (Issue #16); Verfeinerung in #23 möglich.
- **Coolify-Service:** nach Anlage UUID/Container-Name hier ergänzen (Betrieb).
- **Staging:** noch offen — ggf. separates Coolify-Projekt auf demselben Server

### Voraussetzungen fürs Dockerfile

- Multi-stage Build empfohlen (Build-Stage + schlankes Runtime-Image)
- Port via Umgebungsvariable konfigurierbar (`PORT`)
- Health-Check-Endpunkt für Coolify: `/api/health`
