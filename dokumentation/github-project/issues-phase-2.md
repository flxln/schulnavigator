# Issues — Phase 2: Content-Struktur + UI

Milestone: **Phase 2** | Fällig: 12.06.2026

**Voraussetzung:** Phase 1 abgeschlossen. App deployed und erreichbar (HTTPS).

**Übernahmen aus Issue #16 (Phase 1):** Live unter HTTPS (`schulnavigator.mpz.schule`); website-weite Basis gegen Indexierung (`robots` / `noindex`); Route `/eintritt` mit **Platzhalter** (HTTP 200). **#23** baut darauf auf: Token, Middleware und Scanner sind der verbleibende Kern; SEO-Basis und Eintritt-404-Vermeidung sind **keine** Grünfeld-Aufgaben mehr. Detaillierte Abgrenzung: [`.cursor/plans/issue_16_coolify_deploy_39add57f.plan.md`](../../.cursor/plans/issue_16_coolify_deploy_39add57f.plan.md) (Abschnitt *Folge-Issues*). *Hinweis:* Zugehörige Cursor-**Chat-Request-ID** `51250690-23d9-4dfa-a554-4238883c9491` dient nur der Zuordnung zur Chat-Sitzung, nicht der technischen Referenz.

**Architektur:** [ADR-004](../adr/004-video-hosting-mpz.md) · [ADR-005](../adr/005-zugangskontrolle-token.md) · [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md)

---

## #55 — Raum-Viewer (Gyro + Hotspots)

**GitHub:** https://github.com/flxln/schulnavigator/issues/55 — **geschlossen** (2026-05-21)

**Labels:** `tech`  
**Assignee:** Felix

Spezifikation: [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md)

- [x] **Gyro-Viewer (Standard):** Querformat-Foto höhenbasiert; Portrait: Pan per `deviceorientation.alpha` (Armschwenk, zentrierter Neutral); Landscape: `gamma` (Kippen)
- [x] **Hotspots:** Overlay-Marker aus JSON; Aktivierung wenn Viewport-Mitte im Radius **oder** Tap
- [x] **Tap-Fallback:** Marker immer tappbar; Hinweis wenn Orientierung fehlt/abgelehnt; optional Wischen
- [x] **iOS:** Orientierung nach Nutzer-Geste; HTTPS (bereits #16)
- [x] Medien-Panel: öffnet Wiedergabe je nach `medium.typ` (HTML5-Basis; UI-Polish in #18–#20)
- [x] Ohne `bild`: statisches Layout + Medienliste unterhalb
- [x] Demo-Station mit 1–2 Test-Hotspots für Meeting 10.06. (#25)

---

## #56 — Raum-Viewer Mobil-Härtung (Folge zu #55)

**GitHub:** https://github.com/flxln/schulnavigator/issues/56 — **geschlossen** (Umsetzung im Repo)

**Labels:** `tech`  
**Assignee:** Felix

- [x] Viewport-Meta (`device-width`) — kein „gezoomter“ Mobile-Layout-Bug
- [x] `touch-action: none` + CSS-Containment auf dem Viewer; kein Pull-to-Refresh-Konflikt beim Wischen
- [x] Auto-Zoom bis `MIN_PAN_DISPLAY_RATIO` (2); Hotspot-y Build-/Runtime-Warnungen
- [x] Gyro: Neutral ~500 ms (alpha: kreisförmig); Re-Kalibrierung nach Wischen; Resize + `orientationchange`-Reset; `GYRO_FULL_RANGE_DEG` / Sensitivity / Deadzone; zirkuläre EMA für alpha; Gamma-Sanity nur für `gamma`
- [x] **Pan-Achse alpha (Portrait):** Armschwenk statt Kippen; zweiseitig ±45°; Hotspots nur per Tipp; Mathematik in `pan-from-orientation.ts`
- [x] iOS: `sessionStorage` + 2s-Watchdog bei Cache ohne Sensordaten
- [x] Button „Ansicht zentrieren“; `?debug=1` für Diagnose-HUD
- [x] Doku (u. a. `lokal-testen-und-anschauen.md`, `fuer-entwickler.md`, `architektur.md`, ADR-006, Projektplan, GitHub-Projekt-README) + Testmatrix

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

**GitHub:** https://github.com/flxln/schulnavigator/issues/23 — **umgesetzt** (2026-05-22)

**Labels:** `tech`  
**Assignee:** Felix

Spezifikation: [ADR-005](../adr/005-zugangskontrolle-token.md), Speicher/Durchsetzung: [ADR-007](../adr/007-zugangskontrolle-cookie.md) (Cookie statt `localStorage`)

- [x] `/eintritt?t=…` — Token validieren, HttpOnly-Cookie `sn_access` (Middleware)
- [x] Middleware: ohne gültigen Zugang → Hinweisseite (`/eintritt`, `reason=invalid|expired`)
- [x] Startseite: `heft` = voller Hub; `fest` = Puzzle-Hub gesperrt (progressive Aufdeckung → #21)
- [x] `/scan` — In-App-QR-Scanner (`html5-qrcode`, dynamischer Import); `parseRoomScan` + Slug-Whitelist
- [x] Token-Logik: `lib/access-tokens.ts` sync mit `qr-config.mjs` (Vitest)
- [x] `robots.txt` / `noindex` — unverändert site-wide (#16); keine weitere Verfeinerung nötig

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
