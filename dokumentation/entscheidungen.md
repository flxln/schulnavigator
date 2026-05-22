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
| [006](./adr/006-raum-viewer-gyro-hotspots.md) | Raum-Viewer: Gyro (Standard), Hotspots, Tap-Fallback; Umsetzungsdetails Mobil-Härtung (#56) in [architektur.md](./architektur.md) | entschieden | 2026-05-22 |

## Konventionen

- **Dateinamen:** `NNN-kebab-case-titel.md`, fortlaufend nummeriert
- **Status:** `offen` → `entschieden` → ggf. `ersetzt durch ADR-XXX`
- **Vorlage:** [`adr/000-template.md`](./adr/000-template.md)
- Einmal getroffene und entschiedene ADRs werden **nicht überschrieben**, sondern bei Bedarf durch neue ADRs ersetzt (Status: `ersetzt durch …`).

## Architektur-Zielbild (Kurz)

```
MVP (bis 26.06.):     Next.js  ←  JSON + Medien im Repo
Langfristig:          Next.js  ←  Directus (self-hosted, Coolify)

Zugang:  /eintritt?t=…  →  localStorage (mode: fest | heft)
Phase 1: / und /scan (Platzhalter) ohne Token — Schulhaus-Hub mit Dev-Stub (Issue #14)
Fest:    Entry (Kamera) → Puzzle-Hub + In-App-Scanner für Räume
Heft:    Entry im Heft → Hub mit allen Stationen

Station: /raum/[slug] → Gyro-Viewer + Hotspots (Tap-Fallback); normales Querformat-Foto
```

Offen: YouTube-Freigabe (Recht, siehe ADR-004); Mandanten-Modell für weitere Schulen. Echtes Kamera-AR: Post-Fest (nicht ADR-006).
