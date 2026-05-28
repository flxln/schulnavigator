# Issues — Phase 2: Content-Struktur + UI

Milestone: **Phase 2** | Fällig: 12.06.2026

**Voraussetzung:** Phase 1 abgeschlossen. App deployed und erreichbar (HTTPS).

**Übernahmen aus Issue #16 (Phase 1):** Live unter HTTPS (`schulnavigator.mpz.schule`); website-weite Basis gegen Indexierung (`robots` / `noindex`); Route `/eintritt` mit **Platzhalter** (HTTP 200). **#23** baut darauf auf: Token, Middleware und Scanner sind der verbleibende Kern; SEO-Basis und Eintritt-404-Vermeidung sind **keine** Grünfeld-Aufgaben mehr. Detaillierte Abgrenzung: [`.cursor/plans/issue_16_coolify_deploy_39add57f.plan.md`](../../.cursor/plans/issue_16_coolify_deploy_39add57f.plan.md) (Abschnitt *Folge-Issues*). *Hinweis:* Zugehörige Cursor-**Chat-Request-ID** `51250690-23d9-4dfa-a554-4238883c9491` dient nur der Zuordnung zur Chat-Sitzung, nicht der technischen Referenz.

**Architektur:** [ADR-004](../adr/004-video-hosting-mpz.md) · [ADR-005](../adr/005-zugangskontrolle-token.md) · [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md) · [ADR-008](../adr/008-eintritt-in-app-scanner.md) (#57) · [ADR-009](../adr/009-hub-isometrisch.md) (#58) · [ADR-010](../adr/010-dialog-cutscene-gated-audio.md) (#69) · [ADR-011](../adr/011-dialog-mascot-hotspots.md) (#71)

**Ausführungsreihenfolge:** [`projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md`](../projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md)

---

## #58 — GS39 UI: Design-Konzept „Virtueller Schulrundgang“ (Epic)

**GitHub:** https://github.com/flxln/schulnavigator/issues/58 — **geschlossen** (2026-05-27)

**Labels:** `tech` `design`  
**Assignee:** Felix  
**Milestone:** Phase 2

Spezifikation: [ADR-009](../adr/009-hub-isometrisch.md) · Quelle: [`auftraggeber/Virtueller Schulrundgang/`](../../auftraggeber/Virtueller%20Schulrundgang/)

**Ziel:** App-Shell mit Jubiläums-Look (isometrischer Hub, GS39-Chrome, fünf Screens). Gyro-Viewer (#55), Zugang (#23), Stempel (#21) bleiben funktional unverändert.

**Umsetzung:** PR #64–#68 (merged 2026-05-27). Ausführungsreihenfolge: [`projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md`](../projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md).

### Checkliste (Teil-Issues / PRs)

- [x] **ADR-009 + Doku** (`entscheidungen`, `projektplan`, `architektur`, diese Datei) — PR #64
- [x] **#59** — Fonts, `sn-theme.css`, `components/ui/` Primitives, `public/brand/` — PR #65 — https://github.com/flxln/schulnavigator/issues/59
- [x] **#60** — `schoolhouse-isometric-map.ts` + `IsometricSchoolhouse`; Puzzle-Hub entfernt — PR #66 — https://github.com/flxln/schulnavigator/issues/60
- [x] **#61** — Home + Eintritt nach `screens.jsx` — PR #67 — https://github.com/flxln/schulnavigator/issues/61
- [x] **#62** — Raum-Chrome, `/stationen`, Scan-Chrome — PR #68 — https://github.com/flxln/schulnavigator/issues/62
- [x] **#63** — Abschluss-Sparkle bei 11/11 (#22) — PR #68 — https://github.com/flxln/schulnavigator/issues/63

### Abhängigkeiten / Verknüpfung

- Ersetzt Hub-Darstellung aus **#14** (Puzzle-SVG), nicht die Freischalt-Logik aus **#21**
- **#18–#20** bleiben eigene Issues (Player-Logik); Medien-Panel nutzt bereits GS39-Tokens

### Nach Epic (nicht blockierend)

- **`ground-mid` (Eingangstür):** vorläufig `klassenzimmer` — finale Zuordnung mit Schule offen ([Schriftverkehr](../../auftraggeber/schriftverkehr/2026-05-27-klaerung-eingangstuer-slot.md))
- Manuelle Geräte-QA: Checkliste in [`anleitungen/lokal-testen-und-anschauen.md`](../../anleitungen/lokal-testen-und-anschauen.md)

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

## #21 — Stempel-System + Hub-Freischaltung

**GitHub:** https://github.com/flxln/schulnavigator/issues/21 — **geschlossen** (2026-05-27)

**Labels:** `tech`  
**Assignee:** Felix

_Hinweis: Hub-Darstellung Puzzle → isometrisch siehe **#58** / [ADR-009](../adr/009-hub-isometrisch.md); Freischalt-Logik (`visitedSlugs`) bleibt._

- [x] `localStorage` Key `sn_visited_slugs` (JSON-Array Slugs) — getrennt vom **Access-Token** ([ADR-005](../adr/005-zugangskontrolle-token.md)); Logik in `lib/visited-stations.ts`, Hook `hooks/use-visited-stations.ts`
- [x] Besuch markieren auf `/raum/[slug]` via `components/station-visit-recorder.tsx` (Scanner-Navigation und System-Kamera-Deeplink)
- [x] **Modus `fest`:** freigeschaltete Hub-Slots nach Besuch (aktuell Puzzle-Segmente; #58 → isometrische Fenster); Hub-Platzhalter bis Hydration (kein „alles gesperrt“-Flash)
- [x] **Modus `heft`:** alle Stationen klickbar; Fortschritt trotzdem sichtbar
- [x] Fortschritt „n von 11“ (`HubWithProgress`, `total = segments.length`)
- [x] Badge „Besucht“ auf Stationsseite (`station-visited-badge.tsx`)
- [x] Cache-Löschen setzt Stempel zurück — akzeptabel

---

## #22 — Abschluss-Animation

**GitHub:** https://github.com/flxln/schulnavigator/issues/22 — **geschlossen** (2026-05-27, umgesetzt über #63 / PR #68)

**Labels:** `tech`  
**Assignee:** Felix

- [x] Bei **11/11** besuchten Stationen: `SparkleBurst` auf Startseite (`home-screen.tsx`)
- [x] Einmaliger Guard `sn_sparkle_done` in `localStorage` (`lib/sparkle-done.ts`)
- [x] Keine externe Library; `prefers-reduced-motion` in `sn-theme.css`

---

## #23 — Zugangskontrolle: Token-System

**GitHub:** https://github.com/flxln/schulnavigator/issues/23 — **umgesetzt** (2026-05-22)

**Labels:** `tech`  
**Assignee:** Felix

Spezifikation: [ADR-005](../adr/005-zugangskontrolle-token.md), Speicher/Durchsetzung: [ADR-007](../adr/007-zugangskontrolle-cookie.md) (Cookie statt `localStorage`)

- [x] `/eintritt?t=…` — Token validieren, HttpOnly-Cookie `sn_access` (Middleware)
- [x] Middleware: ohne gültigen Zugang → Hinweisseite (`/eintritt`, `reason=invalid|expired`)
- [x] Startseite: `heft` = voller Hub; `fest` = progressive Freischaltung (#21); Hub-UI → #58 / ADR-009
- [x] `/scan` — In-App-QR-Scanner (`html5-qrcode`, dynamischer Import); `parseRoomScan` + Slug-Whitelist
- [x] Token-Logik: `lib/access-tokens.ts` sync mit `qr-config.mjs` (Vitest)
- [x] `robots.txt` / `noindex` — unverändert site-wide (#16); keine weitere Verfeinerung nötig

**Demo 10.06.:** primär **`fest`**-UX (Hub + Scanner) zeigen; `heft` kurz erklären. Zielbild nach #58: isometrischer Hub.

---

## #57 — Eintritt: In-App-Scanner auf `/eintritt` (Folge zu #23)

**GitHub:** https://github.com/flxln/schulnavigator/issues/57 — **umgesetzt** (2026-05-22)

**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 2

Spezifikation: [ADR-008](../adr/008-eintritt-in-app-scanner.md) (inkl. Nachtrag Client vs. Middleware) · baut auf #23 auf

**Problem:** Nutzer ohne Cookie sehen `/eintritt` als Hinweistext; `/scan` ist geschützt. Entry-QR erforderte die System-Kamera.

**Ziel:** Auf `/eintritt` integrierte Kamera zum Scannen des **Eintritts-QR** (URL `/eintritt?t=…`), danach Middleware → Cookie → `/`.

### Akzeptanzkriterien

- [x] `parseEntryScan(raw, origin)` — Struktur only (kein Token im Client); Vitest inkl. Fragment/Extra-Query
- [x] `QrScanner` `mode: 'entry'|'room'`; `/eintritt` nur `origin`, keine Token-Prop
- [x] Treffer → `location.replace('/eintritt?t=…')` (Middleware setzt Cookie; kein Back-Button-Loop)
- [x] Differenzierte Fehlermeldungen Entry vs. Raum; Ladezustand „Zugang wird geprüft …"; `aria-live`
- [x] `/scan` unverändert: `mode="room"`, nur Raum-QRs
- [x] Doku: `fuer-lehrkraefte.md`, `lokal-testen-und-anschauen.md`, `architektur.md`

### Nicht im Scope

- Entry-Scan auf `/scan` oder Middleware-Ausnahme für `/scan` ohne Cookie
- Token manuell eingeben
- Neue Token-Strings (bleiben `qr-config.mjs` / `access-tokens.ts`)

### Abhängigkeiten

- **#23** (geschlossen) — Middleware, Cookie, `html5-qrcode` auf `/scan`

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

1. Demo App-Shell: Hub (`fest`, nach #58 isometrisch), Scanner, eine Beispiel-Station mit Gyro-Viewer + Hotspots + Medien
2. Content-Lieferplan: 11 Räume → Medientyp → Klasse → Verantwortlich
3. WLAN/Mobilfunk (Turnhalle, Außenbereich)
4. AVV-Status (#43)
5. Projekttag 24./25.06.

**Ohne Content-Lieferplan keine Phase 3.**

---

## #69 — Demo/Content: Otto-Frieda-Audio für `daz` aus Rohaufnahme

**Labels:** `content` `tech`  
**Assignee:** Felix  
**GitHub:** https://github.com/flxln/schulnavigator/issues/69 — **geschlossen** (2026-05-28)

*(Geplant als #64; nächste freie Nummer auf GitHub war #69.)*

**Abhängigkeit:** [flxln/hilfreiche-tools#3](https://github.com/flxln/hilfreiche-tools/issues/3) (`station-audio-transkript`)

**Umsetzung:** [ADR-010](../adr/010-dialog-cutscene-gated-audio.md) — Dialog-Cutscene statt zwei lose Audio-Medien im Panel; Clips unter `app/content/dialog-audio/{slug}/`, Auslieferung `GET /api/dialog/[slug]/[clip]` (Cookie, Range). Stationen **`daz`** und **`pc-raum`** mit je 9 Segmenten; Maskottchen PNGs in `public/brand/mascots/`. Demo-Ablauf: [`anleitungen/demo-meeting-2026-06-10.md`](../../anleitungen/demo-meeting-2026-06-10.md).

### Ziel (ursprünglich)

Aus Roh-m4a per `station-audio-transkript` Text + Zeitstempel prüfen, Clips in die App, `stations.json` für `daz` befüllen.

### Akzeptanzkriterien

- [x] JSON-Artefakt unter `auftraggeber/material/stationen/transkripte/` (`011-DaZ-Zimmer/`, `010-PC-Raum/`)
- [x] Audio-Clips deploybar (`content/dialog-audio/`, Dockerfile `COPY content/`)
- [x] `daz` + `pc-raum` in `stations.json` mit `dialog`-Block (Segmente, Gruppen bei DaZ)
- [x] `npm run validate:stations` + Dialog-Playback lokal (HTTPS, Eintritt `?t=fest-2026`)
- [x] DSGVO: gated Route (403 ohne Cookie); Demo in Meeting-Doku gekennzeichnet

### Nicht im Scope (unverändert)

- Automatischer Import der JSON zur Laufzeit
- Lip-Sync / Panorama-Overlay (Cutscene bewusst für Demo 10.06.)

---

## #71 — Dialog-UI: Maskottchen-Hotspots im Raumbild (ADR-011)

**Labels:** `tech` `design` `content`  
**Assignee:** Felix  
**GitHub:** https://github.com/flxln/schulnavigator/issues/71 — **geschlossen** (2026-05-28, Commit `14cb740` auf `main`)

Ersetzt Cutscene-UX für Dialog-Stationen; Audio/Route bleiben [ADR-010](../adr/010-dialog-cutscene-gated-audio.md). Spezifikation: [ADR-011](../adr/011-dialog-mascot-hotspots.md).

### Akzeptanzkriterien

- [x] Tap Frieda/Otto → Dialog + Sprechblase, Gyro an (`daz`, `pc-raum`)
- [x] Schema `action: dialog` + `mascot`; Validator + Tests
- [x] Re-Tap-Guard, „Dialog beenden“, Center-Hit ohne Maskottchen
- [x] Spike iPhone (2026-05-28) dokumentiert
- [x] Direkt auf `main` (`14cb740`); Deploy/Geräte-QA am Produktions-HTTPS ausstehend
- [ ] Hotspot-Positionen am echten Foto feinjustieren (optional vor 10.06.)
- UI-Polish TopBar/Chip: [#72](https://github.com/flxln/schulnavigator/issues/72)

---

## #72 — Raum-UI: Dialog beenden in TopBar, Zentrieren über Chip

**Labels:** `design`, `tech`  
**Assignee:** Felix  
**GitHub:** https://github.com/flxln/schulnavigator/issues/72 — **offen**

Follow-up zu **#71** / [ADR-011](../adr/011-dialog-mascot-hotspots.md). Kein ADR.

### Akzeptanzkriterien

- [ ] Dialog-Ende: **X**-Icon (38×38) neben Zurück in der TopBar; Sprechblase ohne Button darunter
- [ ] Hero: kein floating „Zentrieren“; Stations-Chip tappbar → `recenterView`
- [ ] Chip-Tap und „Zurück“ während Dialog: `endDialog()` (Audio + `activeHotspotId`)
- [ ] `npm run test` + `npm run build` grün

---

## #26 — WLAN-Test vor Ort vereinbaren

**Labels:** `org`  
**Assignee:** Felix / Sten

- Abdeckung an **allen 11** Stationspunkten prüfen
- Kritisch: Turnhalle, Außenbereich A–N-Haus
- Mobilfunk = primär; WLAN = Bonus ([ADR-004](../adr/004-video-hosting-mpz.md): Videos vom MPZ-Server)
