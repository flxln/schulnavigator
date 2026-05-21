# Issues — Phase 1: Foundation

Milestone: **Phase 1** | Fällig: 28.05.2026

**Voraussetzung:** Phase-0-ADRs (#1–#5, #55) geschlossen — siehe [entscheidungen.md](../entscheidungen.md).

**Architektur-Referenz:** [ADR-001](../adr/001-hosting-coolify.md) · [ADR-002](../adr/002-frontend-nextjs.md) · [ADR-003](../adr/003-content-mvp-json-directus.md) · [ADR-005](../adr/005-zugangskontrolle-token.md) · [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md)

**Stationen:** **11** (Material Tina) — Slugs z. B. `klassenzimmer`, `daz`, `pc-raum`, `werken`, `turnhalle`, `speiseraum`, `kunst`, `lesewelt`, `hort`, `musik`, `schulsozialarbeit`

---

## #9 — Next.js-Projekt aufsetzen

**Labels:** `tech`  
**Assignee:** Felix

- Next.js (App Router), TypeScript strict, Tailwind CSS — [ADR-002](../adr/002-frontend-nextjs.md)
- ESLint + Prettier konfigurieren
- Verzeichnisstruktur: `app/`, `components/`, `data/`, `public/`, `lib/`
- Initiales Commit ins GitHub-Repo

---

## #10 — Dockerfile erstellen

**Labels:** `tech`  
**Assignee:** Felix

- Multi-stage Build: Build-Stage + schlankes Runtime-Image — [ADR-001](../adr/001-hosting-coolify.md)
- Port via Umgebungsvariable `PORT`
- Health-Check: `GET /api/health` → `200 OK`

---

## #11 — Routing: /raum/[slug]

**Labels:** `tech`  
**Assignee:** Felix

- Dynamische Route `app/raum/[slug]/page.tsx` — [ADR-002](../adr/002-frontend-nextjs.md)
- Slug aus JSON-Datenmodell (#12)
- 404 für unbekannte Slugs
- `/` → Startseite (Zugangskontrolle/Middleware in Phase 2, #23)

---

## #12 — JSON-Datenmodell für Stationen definieren

**Labels:** `tech`  
**Assignee:** Felix

Schema pro Station ([ADR-003](../adr/003-content-mvp-json-directus.md), [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md) — später Directus-Collection):

```ts
interface Station {
  slug: string
  titel: string
  beschreibung: string
  bild?: string             // Pfad in /public/stations/ — fehlt → statische Ansicht
  medien: Medium[]
  hotspots?: Hotspot[]
  puzzleSegmentId?: string  // Zuordnung Puzzle-Hub (fest), optional
}

interface Hotspot {
  id: string
  label?: string
  x: number                 // 0–1
  y: number
  radius?: number
  mediumId: string
}

interface Medium {
  id: string
  typ: 'audio' | 'video' | 'foto' | 'text'
  quelle: string
  videoSource?: 'upload' | 'youtube'  // MVP: nur upload — ADR-004
  untertitel?: string
}
```

- **11 Platzhalter-Einträge** (Texte aus `auftraggeber/material/stationen/` wo vorhanden)
- Inhalte/Medien vollständig in Phase 3

---

## #13 — Platzhalter-Stationsseite

**Labels:** `tech`  
**Assignee:** Felix

- `RaumViewer`-Platzhalter (volle Logik Phase 2 #55): Layout für Gyro + Hotspots — [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md)
- Raumbild (Placeholder bis #17 / Material; Zuordnung: `zuordnung-stationen-bilder.md`)
- Titel + Beschreibung
- Media-Slots (Struktur für Audio/Video/Foto — Player Phase 2)
- Zurück zur Startseite
- Mobile First (Hochformat)

---

## #14 — Startseite: Schulhaus-Grundlayout

**Labels:** `tech`  
**Assignee:** Felix

Schematische Schulhaus-Grafik (SVG) mit **11 Segmenten** — [ADR-005](../adr/005-zugangskontrolle-token.md):

- **Phase 1:** Layout + Segment-Zuordnung zu Slugs; Freischalt-Logik **Stub** (alles sichtbar oder alles gesperrt — Toggle für Dev)
- **Phase 2 (#21, #23):** Modus `fest` = **Puzzle-Hub** (progressive disclosure nach Scan); Modus `heft` = alle Segmente klickbar
- Fortschrittsanzeige (Platzhalter „0/11“)
- Prominenter Link/Button zu `/scan` (Scanner UI Phase 2)

*Nicht in Phase 1:* voller klickbarer Hub für `fest` (widerspricht Schulfest-Konzept).

---

## #15 — QR-Code-Generator-Script

**Labels:** `tech`  
**Assignee:** Felix

Zwei Ausgabe-Typen ([ADR-005](../adr/005-zugangskontrolle-token.md)):

1. **Entry-QR** (1× Fest + 1× Heft): `https://[domain]/eintritt?t=<token>`
2. **Raum-QR** (11×): `https://[domain]/raum/[slug]` — **ohne** Token im URL

- npm `qrcode` oder Script in `scripts/`
- Ausgabe z. B. `public/qr/entry-fest.png`, `public/qr/raum-musik.png`
- Druckfertig: min. 300 dpi, schwarzweiß

---

## #16 — Deployment auf MPZ-Server testen

**Labels:** `tech`  
**Assignee:** Felix

- Docker-Image auf Coolify/Hetzner — [ADR-001](../adr/001-hosting-coolify.md)
- Domain/Subdomain (z. B. `schulnavigator.mpz-dresden.de`)
- HTTPS (Pflicht für Kamera/Scanner in Phase 2)
- Health-Check erreichbar
- Deploy-Link für Sten/Tina

---

## #17 — Raumfotos für alle 11 Stationen liefern

**Labels:** `content` `extern`  
**Assignee:** Sten / Tina

- **11 Räume** fotografieren (Material Tina als Referenz; ggf. bereits Bilder in `material/stationen/`)
- Querformat, min. 1920 px Breite, JPG
- Bis 28.05. für Phase 2; sonst Platzhalter aus Material/HTML-Export
