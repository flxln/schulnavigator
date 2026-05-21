# Schulnavigator — Architektur

_Stand: 2026-05-21 (Dockerfile im Repo) — siehe [entscheidungen.md](./entscheidungen.md)_

## Tech-Stack

| Bereich             | MVP (bis 26.06.)                                  | Langfristig                      | ADR                                           |
| ------------------- | ------------------------------------------------- | -------------------------------- | --------------------------------------------- |
| Frontend            | Next.js (App Router), TypeScript strict, Tailwind | gleich                           | [002](./adr/002-frontend-nextjs.md)           |
| Content             | JSON + Medien im Repo                             | **Directus** (self-hosted)       | [003](./adr/003-content-mvp-json-directus.md) |
| Hosting             | MPZ-Hetzner via Coolify                           | gleich                           | [001](./adr/001-hosting-coolify.md)           |
| Containerisierung   | Docker                                            | gleich                           | [001](./adr/001-hosting-coolify.md)           |
| Custom-Admin        | —                                                 | **verworfen** (Directus)         | [003](./adr/003-content-mvp-json-directus.md) |
| QR-Code-Generierung | Script (npm `qrcode`)                             | gleich                           | —                                             |
| Video-Hosting       | MPZ-Server (Upload)                               | YouTube-Embed nach Rechtsklärung | [004](./adr/004-video-hosting-mpz.md)         |
| Zugangskontrolle    | Entry-Token, `localStorage`, Modi `fest`/`heft`   | gleich                           | [005](./adr/005-zugangskontrolle-token.md)    |
| Navigation          | In-App-Scanner (`/scan`) + Raum-QRs               | gleich                           | [005](./adr/005-zugangskontrolle-token.md)    |
| Raum-Viewer         | Gyro-Pan, Hotspots, Tap-Fallback; normales Foto   | gleich                           | [006](./adr/006-raum-viewer-gyro-hotspots.md) |

## URL-Schema

```
/raum/[slug]
```

Sprechende Slugs (z. B. `/raum/musik`) — siehe [ADR-002](./adr/002-frontend-nextjs.md).

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
  puzzleSegmentId?: string;
}
```

## Deployment

- **Produktion:** MPZ-Hetzner-Server, gemanagt über Coolify, deployed als Docker-Container
- **Image:** [`app/Dockerfile`](../../app/Dockerfile) — Multi-Stage, `output: 'standalone'`, Health `GET /api/health`
- **Staging:** noch offen — ggf. separates Coolify-Projekt auf demselben Server

### Voraussetzungen fürs Dockerfile

- Multi-stage Build empfohlen (Build-Stage + schlankes Runtime-Image)
- Port via Umgebungsvariable konfigurierbar (`PORT`)
- Health-Check-Endpunkt für Coolify: `/api/health`
