# Schulnavigator — Architektur

_Stand: 2026-05-22 (Issue #16: Live-Deploy; **#55/#56:** Raum-Viewer; Gyro Portrait `alpha`/Armschwenk, GS39-Theme, Mobil-Härtung) — siehe [entscheidungen.md](./entscheidungen.md)_

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
| Zugangskontrolle    | Entry-Token, Cookie `sn_access` + Middleware, Modi `fest`/`heft` | gleich                           | [005](./adr/005-zugangskontrolle-token.md), [007](./adr/007-zugangskontrolle-cookie.md) |
| Navigation          | In-App-Scanner (`/scan`) + Raum-QRs               | gleich                           | [005](./adr/005-zugangskontrolle-token.md)    |
| Raum-Viewer         | Gyro-Pan, Hotspots, Tap-Fallback; normales Foto   | gleich                           | [006](./adr/006-raum-viewer-gyro-hotspots.md) |
| UI / Schul-Theme    | GS39-Design-Tokens (`gs39-tokens.css`), Nunito      | pro Schule eigenes Token-Sheet   | Auftraggeber-CSS, [ADR-003](./adr/003-content-mvp-json-directus.md) |

## UI & Theme (GS39, Issue #55)

- **Source of Truth (Design):** [`auftraggeber/material/UI-Vorschläge/colors_and_type.css`](../auftraggeber/material/UI-Vorschläge/colors_and_type.css) — Auftraggeber-Submodule, nicht im Docker-Kontext. Regeln für Agenten: [build-kontext-submodule-regeln.md](./build-kontext-submodule-regeln.md).
- **App-Kopie:** [`app/app/gs39-tokens.css`](../app/app/gs39-tokens.css) — `:root`-Variablen; in [`globals.css`](../app/app/globals.css) per `@import` und `@theme inline` als semantische Tailwind-Farben (`bg-1`, `fg-1`, `accent`, …).
- **Schul-ID (MVP):** [`app/lib/school-theme.ts`](../app/lib/school-theme.ts) — `SCHOOL_ID = 'gs39'`; Komponenten nutzen semantische Klassen, keine direkten `--brand-*` in TSX. Mehrere Schulen später: anderes Token-Sheet pro Mandant (ADR-003).
- **Dark Mode:** bewusst deaktiviert (Papier-Look).
- **Build-Check:** `npm run validate:tokens` vergleicht App-Tokens mit der Referenz (`colors_and_type.css` lokal bzw. [`app/scripts/reference/colors_and_type.css`](../app/scripts/reference/colors_and_type.css) im Docker-Build). Wird von `npm run build` mitaufgerufen.

## Raum-Viewer (Implementierung, Issue #55)

Komponenten unter [`app/components/raum-viewer/`](../app/components/raum-viewer/) und Mathematik in [`app/lib/raum-viewer/`](../app/lib/raum-viewer/). Stationen-Seite: [`RaumStationClient`](../app/components/raum-station-client.tsx) auf `/raum/[slug]`.

| Verhalten | Details |
| --------- | ------- |
| Gyro-Pan | Höhenbasiert, horizontal `translateX`; Auto-Zoom bis `MIN_PAN_DISPLAY_RATIO` (2); **Portrait:** `deviceorientation.alpha` (Armschwenk, zweiseitig, Neutral in Bildmitte); **Landscape:** `gamma` (Kippen, einseitig); zirkuläre EMA für alpha; iOS nach Nutzer-Geste |
| Neutral | ~500 ms Mittelwert (alpha: kreisförmig); nach **Wischen** Re-Kalibrierung (`neutralAngleForPan`); bei **Resize** und **orientationchange** Neu-Kalibrierung; ohne Kompass kann alpha langsam driften → **Ansicht zentrieren** |
| Hotspots | JSON 0–1; bei vertikalem Beschnitt können extreme **y** unsichtbar sein — Build-Warnung in `validate:stations`, Runtime-`console.warn` |
| UI | `touch-action: none` + CSS-Containment auf dem Viewer; Button **Ansicht zentrieren**; `?debug=1` für HUD |
| Fallback | Wischen, Tap; Banner wenn Orientierung fehlt; `sessionStorage`-Merker iOS + 2s-Watchdog bei fehlenden Events |
| Ohne `bild` | Statisches Layout + Medienliste ([ADR-006](./adr/006-raum-viewer-gyro-hotspots.md)) |
| Demo | `/raum/musik` (2 Hotspots) — Gyro auf iPhone nur unter **HTTPS** testen |

**Raumbilder (#17 / Content):** **Panorama** (≥ **2,5 : 1**, min. 2400 px Breite) bleibt ideal. Die App **zoomt** schmalere Bilder automatisch so, dass horizontal mindestens **`MIN_PAN_DISPLAY_RATIO` (2)** erreicht wird (`roomPanZoom`) — dabei entsteht **vertikaler Beschnitt**; Hotspot-**y** im mittleren Drittel platzieren. Konstanten: `lib/raum-viewer/constants.ts`, Geometrie: `room-pan-zoom.ts`, `clip-zone.ts`. Briefing: [`zuordnung-stationen-bilder.md`](../auftraggeber/material/stationen/zuordnung-stationen-bilder.md). **Viewport:** [`app/app/layout.tsx`](../app/app/layout.tsx) exportiert `viewport` (`device-width`, `initialScale: 1`).

## URL-Schema

```
/
/eintritt
/scan
/raum/[slug]
```

- **`/`** — Startseite mit Schulhaus-Hub; Modus aus Cookie: `heft` = alle Stationen, `fest` = Puzzle-Hub gesperrt (progressive Freischaltung → Issue #21).
- **`/eintritt`** — Entry-QR (`?t=…`) setzt Cookie und leitet auf `/` um; ohne gültigen Zugang Hinweis-/Fehlerseite (`?reason=invalid|expired`).
- **`/scan`** — In-App-QR-Scanner (`html5-qrcode`, dynamischer Import); nur same-origin `/raum/<slug>` — [ADR-005](./adr/005-zugangskontrolle-token.md), [ADR-007](./adr/007-zugangskontrolle-cookie.md).

**Zugang (Issue #23):** Token-Liste [`app/lib/access-tokens.ts`](../app/lib/access-tokens.ts) (sync mit [`app/scripts/qr-config.mjs`](../app/scripts/qr-config.mjs)); Middleware [`app/middleware.ts`](../app/middleware.ts) setzt/prüft Cookie `sn_access`. Ausnahmen: `/api/health`, `/_next/*`, `favicon.ico`, `robots.txt`, `/eintritt` ohne `?t=`. **Modus-Wechsel:** neuer gültiger `?t=`-Scan überschreibt das Cookie. **Rotation:** Token in Code ändern → deployen → `npm run generate:qr`.

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
- **Image:** [`app/Dockerfile`](../app/Dockerfile) — Multi-Stage, `output: 'standalone'`, Health `GET /api/health`, Container-Port **`PORT=3000`** (Coolify „Ports Exposes“ = `3000`).
- **Suchmaschinen:** `robots.txt` mit `Disallow: /` und `noindex` im Root-Layout (Issue #16); Verfeinerung in #23 möglich.
- **Coolify-Service:** nach Anlage UUID/Container-Name hier ergänzen (Betrieb).
- **Staging:** noch offen — ggf. separates Coolify-Projekt auf demselben Server

### Voraussetzungen fürs Dockerfile

- Multi-stage Build empfohlen (Build-Stage + schlankes Runtime-Image)
- Port via Umgebungsvariable konfigurierbar (`PORT`)
- Health-Check-Endpunkt für Coolify: `/api/health`
