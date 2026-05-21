# Issues — Phase 2: Content-Struktur + UI

Milestone: **Phase 2** | Fällig: 12.06.2026

**Voraussetzung:** Phase 1 abgeschlossen. App deployed und erreichbar (HTTPS).

**Architektur:** [ADR-004](../adr/004-video-hosting-mpz.md) · [ADR-005](../adr/005-zugangskontrolle-token.md) · [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md)

---

## #55 — Raum-Viewer (Gyro + Hotspots)

**Labels:** `tech`  
**Assignee:** Felix

Spezifikation: [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md)

- [ ] **Gyro-Viewer (Standard):** Querformat-Foto höhenbasiert, horizontaler Pan per `deviceorientation` (gedämpft, begrenzt)
- [ ] **Hotspots:** Overlay-Marker aus JSON; Aktivierung wenn Viewport-Mitte im Radius **oder** Tap
- [ ] **Tap-Fallback:** Marker immer tappbar; Hinweis wenn Orientierung fehlt/abgelehnt; optional Wischen
- [ ] **iOS:** Orientierung nach Nutzer-Geste; HTTPS (bereits #16)
- [ ] Medien-Panel: öffnet Player (#18–#20) je nach `medium.typ`
- [ ] Ohne `bild`: statisches Layout + Medienliste unterhalb
- [ ] Demo-Station mit 1–2 Test-Hotspots für Meeting 10.06. (#25)

---

## #18 — Audio-Player-Komponente

**Labels:** `tech`  
**Assignee:** Felix

- HTML5-Audio, App-Design, Play/Pause, Fortschritt
- Einbindung bei `medien.typ === 'audio'`

---

## #19 — Video-Player-Komponente

**Labels:** `tech`  
**Assignee:** Felix

- HTML5-Video, Quelle: **MPZ-Upload** (`/public` oder Storage-URL) — [ADR-004](../adr/004-video-hosting-mpz.md)
- Kein Autoplay; Controls + Vollbild
- Max. ~50 MB / 60 s; Schema-Feld `videoSource: 'upload'` (youtube vorbereitet, MVP inaktiv)
- Einbindung bei `medien.typ === 'video'`

---

## #20 — Bild-Galerie-Komponente

**Labels:** `tech`  
**Assignee:** Felix

- Galerie für Fotosets (Mobile: swipe)
- Optional Lightbox
- Einbindung bei `medien.typ === 'foto'`

---

## #21 — Stempel-System + Puzzle-Freischaltung

**Labels:** `tech`  
**Assignee:** Felix

- `localStorage` Key z. B. `visitedSlugs: string[]` — getrennt vom **Access-Token** ([ADR-005](../adr/005-zugangskontrolle-token.md))
- **Voraussetzung Phase 1 (#14):** Schulhaus-Hub mit festen Segment-IDs (`puzzleSegmentId` in JSON, Layout in `lib/schoolhouse-layout.ts`) — hier Freischaltung und Fortschritt anbinden
- Markierung bei **Raum-QR-Scan** (In-App-Scanner oder gültiger Besuch von `/raum/[slug]`)
- **Modus `fest`:** freigeschaltetes Puzzle-Segment auf Startseite; Segment klickbar → `/raum/[slug]`; gesperrte Segmente: Hinweis „QR an der Tür scannen“
- **Modus `heft`:** Stempel optional; alle Stationen von Start aus klickbar
- Fortschritt: „7 von 11 Stationen“
- Häkchen auf Stationsseite wenn besucht
- Cache-Löschen setzt Stempel zurück — akzeptabel

---

## #22 — Abschluss-Animation

**Labels:** `tech`  
**Assignee:** Felix

- Bei **11/11** besuchten Stationen (Stempel): Konfetti o. ä. (CSS/Canvas, keine externe Library)
- Auf Startseite auslösen
- Tina-Idee: einfache „Belohnung“-Animation

---

## #23 — Zugangskontrolle: Token-System

**Labels:** `tech`  
**Assignee:** Felix

Spezifikation: [ADR-005](../adr/005-zugangskontrolle-token.md)

- [ ] `/eintritt?t=…` — Token validieren, `localStorage`: `{ token, mode: 'fest'|'heft', expires }`
- [ ] Middleware: ohne gültigen Token → Hinweisseite
- [ ] Startseite: `heft` = voller Hub; `fest` = Puzzle-Hub (#21)
- [ ] `/scan` — In-App-QR-Scanner (`html5-qrcode` o. ä.); parst `/raum/*` und lehnt Fremd-URLs ab (**ersetzt** die Phase-1-Platzhalterseite aus Issue #14)
- [ ] Token-Logik serverseitig: dieselben Token-Strings wie in Phase 1 (`app/scripts/qr-config.mjs`); Ablaufdatum / Validierung — bei Domain- oder Token-Wechsel QR-PNGs mit `npm run generate:qr` neu erzeugen (**#15 erledigt**)
- [ ] `robots.txt` / `noindex` — Basis site-wide bereits in Phase 1 (#16); in #23 optional verfeinern (z. B. nach Middleware nur geschützte Bereiche)

**Demo 10.06.:** primär **`fest`**-UX (Puzzle + Scanner) zeigen; `heft` kurz erklären.

---

## #24 — i18n-Struktur für Menütexte

**Labels:** `tech`  
**Assignee:** Felix

- UI-Texte in `de.json` / `en.json` (Platzhalter EN)
- Umschalter noch inaktiv
- Content (Räume, Medien) bleibt DE

---

## #25 — Meeting 10.06.: Demo + Content-Lieferplan einfordern

**Labels:** `org` `blocker`  
**Assignee:** Felix / Thomas

Agenda:

1. Demo App-Shell: Puzzle-Hub (`fest`), Scanner, eine Beispiel-Station mit Gyro-Viewer + Hotspots + Medien
2. Content-Lieferplan: 11 Räume → Medientyp → Klasse → Verantwortlich
3. WLAN/Mobilfunk (Turnhalle, Außenbereich)
4. AVV-Status (#43)
5. Projekttag 24./25.06.

**Ohne Content-Lieferplan keine Phase 3.**

---

## #26 — WLAN-Test vor Ort vereinbaren

**Labels:** `org`  
**Assignee:** Felix / Sten

- Abdeckung an **allen 11** Stationspunkten prüfen
- Kritisch: Turnhalle, Außenbereich A–N-Haus
- Mobilfunk = primär; WLAN = Bonus ([ADR-004](../adr/004-video-hosting-mpz.md): Videos vom MPZ-Server)
