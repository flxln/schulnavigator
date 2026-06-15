# Schulnavigator — Architekturentscheidungen (Index)

Jede wichtige Entscheidung wird als eigenständiger ADR (Architecture Decision Record) im Ordner [`adr/`](./adr/) abgelegt. Diese Datei dient als Übersicht und Pflegeort.

## Übersicht

| Nr. | Titel | Status | Datum |
|---|---|---|---|
| [001](./adr/001-hosting-coolify.md) | Hosting: MPZ-Hetzner-Server mit Coolify | entschieden | 2026-05-07 |
| [002](./adr/002-frontend-nextjs.md) | Frontend: Next.js (App Router), TypeScript, Tailwind | entschieden | 2026-05-21 |
| [003](./adr/003-content-mvp-json-directus.md) | Content: JSON (MVP), Directus langfristig; kein Custom-Admin | entschieden | 2026-05-21 |
| [004](./adr/004-video-hosting-mpz.md) | Video: MPZ-Server; YouTube optional nach Rechtsklärung | entschieden | 2026-05-21 |
| [005](./adr/005-zugangskontrolle-token.md) | Zugang: Entry-Token, Modi fest/heft, In-App-Scanner | entschieden | 2026-05-21 |
| [006](./adr/006-raum-viewer-gyro-hotspots.md) | Raum-Viewer: Gyro (Standard), Hotspots, Tap-Fallback; Portrait `alpha`/Armschwenk, Mobil-Härtung (#56), Gimbal-Lock (#85) in [architektur.md](./architektur.md) | entschieden | 2026-05-22 |
| [007](./adr/007-zugangskontrolle-cookie.md) | Zugang: HttpOnly-Cookie + Middleware (ergänzt ADR-005 Speicher/Durchsetzung) | entschieden | 2026-05-22 |
| [008](./adr/008-eintritt-in-app-scanner.md) | Eintritt: In-App-Scanner auf `/eintritt/scan` (ergänzt ADR-005 Entry-UX; Nachtrag 2026-05-30) | entschieden | 2026-05-22 |
| [009](./adr/009-hub-isometrisch.md) | Startseite: isometrischer Schulhaus-Hub + GS39 UI; Nachträge #83/#84 — **Hub-Darstellung ersetzt durch ADR-016** | ersetzt durch ADR-016 | 2026-05-27 |
| [016](./adr/016-hub-frontansicht-39gs.md) | Startseite: Frontansicht GS39 als Schulhaus-Hub (SVG-Outline, Slot-Map); Portal = klassenzimmer | entschieden | 2026-06-10 |
| [010](./adr/010-dialog-cutscene-gated-audio.md) | Dialog: gated Audio (`/api/dialog/…`), Playlist ein `<audio>`; UI-Cutscene → ADR-011 | entschieden | 2026-05-27 |
| [011](./adr/011-dialog-mascot-hotspots.md) | Dialog-UI: Maskottchen-Hotspots, Gyro an, Sprechblase; Steuerung TopBar/Chip ([#72](https://github.com/flxln/schulnavigator/issues/72)) — Punkt 6 ergänzt durch ADR-013 | entschieden | 2026-05-28 |
| [012](./adr/012-tablet-ipad-responsive-layout.md) | Tablet/iPad: responsive Layout per Breakpoints (Epic #74–#78) | entschieden | 2026-06-14 |
| [013](./adr/013-dialog-blase-mitpan.md) | Dialog-Blase folgt Maskottchen beim Panning (Option C, ergänzt ADR-011 Pkt. 6) | entschieden | 2026-05-28 |
| [014](./adr/014-mascot-size-json.md) | Dialog-Maskottchen: `mascotSize` normiert in JSON, px-Render via `effectiveDisplayH` (ergänzt ADR-011 Pkt. 2) | entschieden | 2026-06-10 |
| [015](./adr/015-dialog-bubble-json.md) | Dialog-Sprechblase: `dialog.bubble` (Position/Größe, `followPan`), optional `segmente[].tail` (ergänzt ADR-011/013) | entschieden | 2026-06-10 |
| [017](./adr/017-externe-medien-hotspot-marker.md) | Externe Medien (`link`, `embed`), Hotspot-Icons; Stufe 1–3 live (#98–#100, #109) | entschieden | 2026-06-10 |
| [018](./adr/018-360-sphere-viewer.md) | 360°-Sphere-Viewer (PSV v5) + Flat-Viewer-Koexistenz per `viewer`-Flag; Spike-first | entschieden | 2026-06-11 |
| [019](./adr/019-coach-fortschritt-einblendung.md) | Coach: fortschritts-getriggerte Maskottchen-Einblendungen (getrennt vom Dialog); Schwellwert-Trigger, `duo-split`, modus-getrennter Seen-State, Layer-Vertrag; keine Migration | entschieden | 2026-06-14 |
| [020](./adr/020-hub-wegweiser-aussen-stationen.md) | Hub: Wegweiser-Slots für Schulhof + Turnhalle; 12 Stationen; Slot-Vertrag frame/hitFrame/chipAnchor/rotation | entschieden | 2026-06-14 |

## Konventionen

- **Dateinamen:** `NNN-kebab-case-titel.md`, fortlaufend nummeriert
- **Status:** `offen` → `entschieden` → ggf. `ersetzt durch ADR-XXX`
- **Vorlage:** [`adr/000-template.md`](./adr/000-template.md)
- Einmal getroffene und entschiedene ADRs werden **nicht überschrieben**, sondern bei Bedarf durch neue ADRs ersetzt (Status: `ersetzt durch …`).

## Architektur-Zielbild (Kurz)

```
MVP (bis 26.06.):     Next.js  ←  JSON + Medien im Repo
Langfristig:          Next.js  ←  Directus (self-hosted, Coolify)

Zugang:  /eintritt?t=…  →  Cookie sn_access (mode: fest | heft, ADR-007, #23)
Fest:    Entry (Kamera/In-App) → Frontansicht-Hub (ADR-016) + Scanner für Räume
Heft:    Entry im Heft → Hub mit allen Stationen (alle Fenster klickbar)

Station: /raum/[slug] → Gyro-Viewer + Hotspots (Tap-Fallback); normales Querformat-Foto
/stationen → Stationsliste (ADR-016, Epic #58)
```

Offen: YouTube-Freigabe (Recht, siehe ADR-004); H5P (Domain + DSB); Datenschutzerklärung um Drittanbieter-Absatz (Delightex, Book Creator); Mandanten-Modell für weitere Schulen. Echtes Kamera-AR: Post-Fest (nicht ADR-006). ADR-017 Stufe 1–3 live; Book Creator Lesewelt (#128); Delightex Demo `pc-raum`.
