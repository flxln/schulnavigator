# Issues — Phase 1: Foundation

Milestone: **Phase 1** | Fällig: 28.05.2026

**Voraussetzung:** Phase-0-Issues **#1–#8** geschlossen; **ADR-006** entschieden — siehe [entscheidungen.md](../entscheidungen.md).

**Architektur-Referenz:** [ADR-001](../../adr/001-hosting-coolify.md) · [ADR-002](../../adr/002-frontend-nextjs.md) · [ADR-003](../../adr/003-content-mvp-json-directus.md) · [ADR-005](../../adr/005-zugangskontrolle-token.md) · [ADR-006](../../adr/006-raum-viewer-gyro-hotspots.md)

**Stationen:** **11** (Material Tina) — Slugs z. B. `klassenzimmer`, `daz`, `pc-raum`, `werken`, `turnhalle`, `speiseraum`, `kunst`, `lesewelt`, `hort`, `musik`, `schulsozialarbeit`

---

## #9 — Next.js-Projekt aufsetzen

**GitHub:** geschlossen (2026-05-21) — Next.js 16 in `app/`, Prettier, Struktur ohne `src/`

**Labels:** `tech`  
**Assignee:** Felix

- Next.js (App Router), TypeScript strict, Tailwind CSS — [ADR-002](../../adr/002-frontend-nextjs.md)
- ESLint + Prettier konfigurieren
- Verzeichnisstruktur: `app/`, `components/`, `data/`, `public/`, `lib/`
- Initiales Commit ins GitHub-Repo

---

## #10 — Dockerfile erstellen

**GitHub:** geschlossen (2026-05-21) — Multi-Stage, `output: 'standalone'`, `HEALTHCHECK` → `/api/health`

**Labels:** `tech`  
**Assignee:** Felix

- Multi-stage Build: Build-Stage + schlankes Runtime-Image — [ADR-001](../../adr/001-hosting-coolify.md)
- Port via Umgebungsvariable `PORT`
- Health-Check: `GET /api/health` → `200 OK`

---

## #11 — Routing: /raum/[slug]

**GitHub:** geschlossen (2026-05-21) — `app/app/raum/[slug]/page.tsx`, SSG, `dynamicParams: false` → 404

**Labels:** `tech`  
**Assignee:** Felix

- Dynamische Route `app/app/raum/[slug]/page.tsx` (npm-Root `app/`) — [ADR-002](../../adr/002-frontend-nextjs.md)
- Slug aus JSON-Datenmodell (#12)
- 404 für unbekannte Slugs
- `/` → Startseite (Schulhaus-Hub in #14; Zugangskontrolle/Middleware in Phase 2, #23)

---

## #12 — JSON-Datenmodell für Stationen definieren

**GitHub:** geschlossen (2026-05-21) — `data/stations.json`, `lib/types.ts`, `lib/stations.ts`, 11 Platzhalter; **`puzzleSegmentId` seit Issue #14 Pflicht** (Schulhaus-Hub)

**Labels:** `tech`  
**Assignee:** Felix

Schema pro Station ([ADR-003](../../adr/003-content-mvp-json-directus.md), [ADR-006](../../adr/006-raum-viewer-gyro-hotspots.md) — später Directus-Collection):

```ts
interface Station {
  slug: string;
  titel: string;
  beschreibung: string;
  bild?: string; // Pfad in /public/stations/ — fehlt → statische Ansicht
  medien: Medium[];
  hotspots?: Hotspot[];
  puzzleSegmentId: string; // Zuordnung Schulhaus-Hub / Puzzle (11 Segmente), Pflicht im MVP-JSON — Issue #14
}

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
  videoSource?: "upload" | "youtube"; // MVP: nur upload — ADR-004
  untertitel?: string;
}
```

- **11 Platzhalter-Einträge** (Texte aus `auftraggeber/material/stationen/` wo vorhanden)
- Inhalte/Medien vollständig in Phase 3

---

## #13 — Platzhalter-Stationsseite

**GitHub:** geschlossen (2026-05-21) — RaumViewer-Stub, Validierung, `validate:stations`, Demo `musik` + `schulsozialarbeit`, Metadata, Error Boundary

**Labels:** `tech`  
**Assignee:** Felix

- Stations-Shell (#13); **volle Raum-Viewer-Logik** in Phase 2 **#55** (umgesetzt) — [ADR-006](../../adr/006-raum-viewer-gyro-hotspots.md)
- Raumbild (Placeholder bis #17 / Material; Zuordnung: `zuordnung-stationen-bilder.md`)
- Titel + Beschreibung
- Media-Slots (Struktur für Audio/Video/Foto — Player Phase 2)
- Zurück zur Startseite
- Mobile First (Hochformat)

---

## #14 — Startseite: Schulhaus-Grundlayout

**GitHub:** geschlossen (2026-05-21) — Schulhaus-SVG (`viewBox` 400×600), `lib/schoolhouse-*`, `components/schoolhouse/`, Dev-Stub + `sessionStorage`, `/scan`-Platzhalter, Vitest (Merge/Validierung), `puzzleSegmentId` Pflicht

**Labels:** `tech`  
**Assignee:** Felix

Schematische Schulhaus-Grafik (SVG) mit **11 Segmenten** — [ADR-005](../../adr/005-zugangskontrolle-token.md):

- **Phase 1:** Layout + Segment-Zuordnung zu Slugs; Freischalt-Logik **Stub** (alles sichtbar oder alles gesperrt — Toggle für Dev)
- **Phase 2 (#21, #23):** Modus `fest` = **Puzzle-Hub** (progressive disclosure nach Scan); Modus `heft` = alle Segmente klickbar
- Fortschrittsanzeige (Platzhalter „0/11“)
- Prominenter Link/Button zu `/scan` (Scanner UI Phase 2)

_Nicht in Phase 1:_ voller klickbarer Hub für `fest` (widerspricht Schulfest-Konzept).

**Nachfolger (Darstellung):** Puzzle-Hub wird durch isometrisches Schulhaus ersetzt — [ADR-009](../../adr/009-hub-isometrisch.md), Epic **#58** (Phase 2). Freischalt-Logik (#21) bleibt.

---

## #15 — QR-Code-Generator-Script

**GitHub:** geschlossen (2026-05-21) — `npm run generate:qr`, `lib/qr-urls.ts`, `scripts/generate-qr-codes.ts`, `scripts/qr-config.mjs`, `scripts/load-env-local.mjs`; Ausgabe `public/qr/*.png` (gitignored) + `manifest.json`; `--dry-run`, `--size` / `QR_PRINT_WIDTH_PX`

**Erweiterung #130** (geschlossen 2026-06-15): Druck-PDFs `public/qr/pdf/` (`qr-a5-2up.pdf`, `qr-a4-grid-3cm.pdf`; Schulfest: `qr-schulfest-*.pdf`) mit Label + Subtitle; `pdf-lib`, `qr-print-items.ts`, `qr-pdf-layouts.ts`; `--preset=schulfest` = 12 Räume + Entry `fest` — https://github.com/flxln/schulnavigator/issues/130

**Labels:** `tech`  
**Assignee:** Felix

Zwei Ausgabe-Typen ([ADR-005](../../adr/005-zugangskontrolle-token.md)):

1. **Entry-QR** (1× Fest + 1× Heft): `https://[domain]/eintritt?t=<token>`
2. **Raum-QR** (N× aus `data/stations.json`, aktuell 11): `https://[domain]/raum/[slug]` — **ohne** Token im URL

- Dev-Dependencies: `qrcode`, `tsx`; Druck: SW, Error Correction H, Default-Breite 512 px (anpassbar)
- Anleitungen: [`anleitungen/qr-codes-drucken.md`](../../anleitungen/qr-codes-drucken.md), [`app/public/qr/README.md`](../../app/public/qr/README.md)
- Route `/eintritt` und Token-Prüfung bleiben **Phase 2** (#23); Entry-QR-URLs sind bereits final codiert; seit #16: Platzhalter unter `/eintritt` (kein 404)

---

## #16 — Deployment auf MPZ-Server testen

**GitHub:** geschlossen (2026-05-21) — Live unter **`https://schulnavigator.mpz.schule`** (Coolify, HTTPS, `/api/health`). **Repo:** Go-Live-Härtung (`app/app/robots.ts`, `metadata.robots` + `noindex` in `layout.tsx`, Platzhalter `app/app/eintritt/page.tsx`); Coolify-Runbook, Submodule-Hinweis, Smoke-`curl`, Rollback in [`anleitungen/fuer-entwickler.md`](../../anleitungen/fuer-entwickler.md). **Dockerfile:** `RUN npm ci --include=dev` in der `deps`-Stage — Coolify setzt beim Build oft `NODE_ENV=production`; ohne `--include=dev` fehlen Build-Tools wie **`@tailwindcss/postcss`** (`next build` / Turbopack). QR mit Produktions-Domain: `NEXT_PUBLIC_BASE_URL=… npm run generate:qr` (siehe Runbook).

**Labels:** `tech`  
**Assignee:** Felix

- Docker-Image auf Coolify/IONOS-VPS — [ADR-001](../../adr/001-hosting-coolify.md)
- Domain/Subdomain: **`schulnavigator.mpz.schule`** (Wildcard `*.mpz.schule` → Coolify-VPS `217.154.120.240`; in Coolify als App-Domain eintragen)
- HTTPS (Pflicht für Kamera/Scanner in Phase 2)
- Health-Check erreichbar
- Deploy-Link für Sten/Tina: **`https://schulnavigator.mpz.schule`**
- **Nachverfolgung:** Umsetzungsplan [`.cursor/plans/archiv/2026-06/issue_16_coolify_deploy_39add57f.plan.md`](../../.cursor/plans/archiv/2026-06/issue_16_coolify_deploy_39add57f.plan.md) (*Umsetzung*, *Folge-Issues*). Zugehörige **Chat-Request-ID** (Cursor): `51250690-23d9-4dfa-a554-4238883c9491`. Auswirkungen auf Phase 2: [`issues-phase-2.md`](issues-phase-2.md) (Einleitung), konkret **#23** / **#55**.

---

## #17 — Raumfotos für alle 11 Stationen liefern

**GitHub:** https://github.com/flxln/schulnavigator/issues/17 — **offen** (Teillieferung 8/11 Panorama, Juni 2026)

**Labels:** `content` `extern`  
**Assignee:** Sten / Tina

- **11 Räume** fotografieren (Material Tina als Referenz; ggf. bereits Bilder in `material/stationen/`)
- **Panorama für Gyro-Viewer** ([ADR-006](../../adr/006-raum-viewer-gyro-hotspots.md), umgesetzt in #55/#56): **Empfehlung** überbreites Querformat, **Seitenverhältnis ≥ 2,5 : 1** (z. B. 2500×1000 px), **min. 2400 px** Breite — weniger vertikaler Beschnitt als bei 4:3. **Hinweis:** Die App zoomt schmalere Bilder automatisch, damit am Handy horizontal genug Pan entsteht; Hotspots in **y** nicht zu nah an den Rändern platzieren (Briefing).
- Aufnahme-Tipp: Handy quer, langsam durch den Raum schwenken / mehrere Bilder zu einem Panorama stitchen — Hotspots später auf genau diesem Bild
- Format JPG oder WebP; Details: [`zuordnung-stationen-bilder.md`](../../auftraggeber/material/stationen/zuordnung-stationen-bilder.md), [`anleitungen/fuer-entwickler.md`](../../anleitungen/fuer-entwickler.md)

### Stand (08.06.2026)

| Slug | Lieferung | Rohmaterial | App |
|------|-----------|-------------|-----|
| `klassenzimmer`, `daz`, `pc-raum`, `werken`, `turnhalle`, `speiseraum`, `lesewelt`, `musik` | ✅ Panorama 4320×1440 (3:1) | `stationen-360-pano/flat/{slug}/raw/` | eingepflegt via **#27** |
| `kunst`, `hort` | ❌ nur 4:3-Platzhalter | fehlt unter `flat/{slug}/raw/` | 4:3 aus `material/stationen/` |
| `schulsozialarbeit` | ❌ kein HD-Foto | — | kein `bild` in `stations.json` (statisch) |

**Offen bis Issue schließbar:** Panorama-Nachlieferung für `kunst`, `hort`; HD-Foto für `schulsozialarbeit`.
