# Issues — Phase 2: Content-Struktur + UI

Milestone: **Phase 2** | Fällig: 12.06.2026

**Voraussetzung:** Phase 1 abgeschlossen. App deployed und erreichbar (HTTPS).

**Übernahmen aus Issue #16 (Phase 1):** Live unter HTTPS (`schulnavigator.mpz.schule`); website-weite Basis gegen Indexierung (`robots` / `noindex`); Route `/eintritt` mit **Platzhalter** (HTTP 200). **#23** baut darauf auf: Token, Middleware und Scanner sind der verbleibende Kern; SEO-Basis und Eintritt-404-Vermeidung sind **keine** Grünfeld-Aufgaben mehr. Detaillierte Abgrenzung: [`.cursor/plans/issue_16_coolify_deploy_39add57f.plan.md`](../../.cursor/plans/issue_16_coolify_deploy_39add57f.plan.md) (Abschnitt *Folge-Issues*). *Hinweis:* Zugehörige Cursor-**Chat-Request-ID** `51250690-23d9-4dfa-a554-4238883c9491` dient nur der Zuordnung zur Chat-Sitzung, nicht der technischen Referenz.

**Architektur:** [ADR-004](../../adr/004-video-hosting-mpz.md) · [ADR-005](../../adr/005-zugangskontrolle-token.md) · [ADR-006](../../adr/006-raum-viewer-gyro-hotspots.md) · [ADR-008](../../adr/008-eintritt-in-app-scanner.md) (#57) · [ADR-009](../../adr/009-hub-isometrisch.md) (#58) · [ADR-010](../../adr/010-dialog-cutscene-gated-audio.md) (#69) · [ADR-011](../../adr/011-dialog-mascot-hotspots.md) (#71) · [ADR-012](../../adr/012-tablet-ipad-responsive-layout.md) (Epic Tablet, #74–#78)

**Ausführungsreihenfolge:** [`projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md`](../../archiv/projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md)

---

## #58 — GS39 UI: Design-Konzept „Virtueller Schulrundgang“ (Epic)

**GitHub:** https://github.com/flxln/schulnavigator/issues/58 — **geschlossen** (2026-05-27)

**Labels:** `tech` `design`  
**Assignee:** Felix  
**Milestone:** Phase 2

Spezifikation: [ADR-009](../../adr/009-hub-isometrisch.md) · Quelle: [`auftraggeber/Virtueller Schulrundgang/`](../../auftraggeber/Virtueller%20Schulrundgang/)

**Ziel:** App-Shell mit Jubiläums-Look (isometrischer Hub, GS39-Chrome, fünf Screens). Gyro-Viewer (#55), Zugang (#23), Stempel (#21) bleiben funktional unverändert.

**Umsetzung:** PR #64–#68 (merged 2026-05-27). Ausführungsreihenfolge: [`projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md`](../../archiv/projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md).

### Checkliste (Teil-Issues / PRs)

- [x] **ADR-009 + Doku** (`entscheidungen`, `projektplan`, `architektur`, diese Datei) — PR #64
- [x] **#59** — Fonts, `sn-theme.css`, `components/ui/` Primitives, `public/brand/` — PR #65 — https://github.com/flxln/schulnavigator/issues/59
- [x] **#60** — `schoolhouse-isometric-map.ts` + `IsometricSchoolhouse`; Puzzle-Hub entfernt — PR #66 — https://github.com/flxln/schulnavigator/issues/60
- [x] **#61** — Home + Eintritt nach `screens.jsx` — PR #67 — https://github.com/flxln/schulnavigator/issues/61
- [x] **#62** — Raum-Chrome, `/stationen`, Scan-Chrome — PR #68 — https://github.com/flxln/schulnavigator/issues/62
- [x] **#81** — Scan-Chrome: Kamerabild füllt Rahmen (Folge #62, html5-qrcode-Mount) — https://github.com/flxln/schulnavigator/issues/81
- [x] **#63** — Abschluss-Sparkle bei 11/11 (#22) — PR #68 — https://github.com/flxln/schulnavigator/issues/63

### Abhängigkeiten / Verknüpfung

- Ersetzt Hub-Darstellung aus **#14** (Puzzle-SVG), nicht die Freischalt-Logik aus **#21**
- **#18–#20** (Medien-Player) — geschlossen 2026-06-09; `components/media/*`, Router `MediaPlayerByTyp`

### Nach Epic (nicht blockierend)

- **`ground-mid` (Eingangstür):** vorläufig `klassenzimmer` — finale Zuordnung mit Schule offen ([Schriftverkehr](../../auftraggeber/schriftverkehr/2026-05-27-klaerung-eingangstuer-slot.md))
- Manuelle Geräte-QA: Checkliste in [`anleitungen/lokal-testen-und-anschauen.md`](../../anleitungen/lokal-testen-und-anschauen.md)

---

## #107 — Raum-Viewer: Einmaliges Swipe-Onboarding (Folge #56)

**GitHub:** https://github.com/flxln/schulnavigator/issues/107 — **geschlossen** (2026-06-11)

**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 2

**Kontext:** Folge zu **#55** / **#56** (Tap-/Wisch-Fallback). Erstbesucher erkennen die horizontale Wisch-Geste im Panoramafoto oft nicht. Ursprünglicher Entwurf: Remote-Branch `claude/room-visit-onboarding-overlay-EY8o1`; Umsetzung auf `feature/pan-onboarding-overlay` (rebased auf `main`).

**Ziel:** Beim ersten Raumbesuch kurzes Overlay („Links oder rechts wischen“), danach `localStorage`-Merker — nicht parallel zum iOS-Gyro-Permission-Overlay.

### Akzeptanzkriterien

- [x] `PanOnboardingOverlay` + Einbindung in `room-image-pane.tsx`
- [x] Keyframe `sn-swipe-hint` in `globals.css`
- [x] `skip={orientState === 'needs-gesture'}` (iOS)
- [x] Tests `pan-onboarding-overlay.test.tsx`
- [x] Doku: diese Datei, `lokal-testen-und-anschauen.md`, `architektur.md`
- [x] Review + Merge auf `main`

### Technik

| Aspekt | Detail |
|--------|--------|
| Storage | `schulnav.pan-onboarding.seen` |
| Dauer | 3 s sichtbar, 400 ms Fade |
| Interaktion | `pointer-events: none`, `aria-hidden` |

---

## #55 — Raum-Viewer (Gyro + Hotspots)

**GitHub:** https://github.com/flxln/schulnavigator/issues/55 — **geschlossen** (2026-05-21)

**Labels:** `tech`  
**Assignee:** Felix

Spezifikation: [ADR-006](../../adr/006-raum-viewer-gyro-hotspots.md)

- [x] **Gyro-Viewer (Standard):** Querformat-Foto höhenbasiert; Portrait: Pan per `deviceorientation.alpha` (Armschwenk, zentrierter Neutral); Landscape: `gamma` (Kippen)
- [x] **Hotspots:** Overlay-Marker aus JSON; Aktivierung wenn Viewport-Mitte im Radius **oder** Tap
- [x] **Tap-Fallback:** Marker immer tappbar; Hinweis wenn Orientierung fehlt/abgelehnt; optional Wischen
- [x] **iOS:** Orientierung nach Nutzer-Geste; HTTPS (bereits #16)
- [x] Medien-Panel: öffnet Wiedergabe je nach `medium.typ` (dedizierte Player #18–#20)
- [x] Ohne `bild`: statisches Layout + Medienliste unterhalb
- [x] Demo-Station mit Hotspots für Meeting 10.06. — `musik` (2 HS), **`klassenzimmer`** (4 HS, #93)

---

## #56 — Raum-Viewer Mobil-Härtung (Folge zu #55)

**GitHub:** https://github.com/flxln/schulnavigator/issues/56 — **geschlossen** (Umsetzung im Repo)

**Labels:** `tech`  
**Assignee:** Felix

- [x] Viewport-Meta (`device-width`) — kein „gezoomter“ Mobile-Layout-Bug
- [x] **Pinch-Zoom gesperrt** ([#96](https://github.com/flxln/schulnavigator/issues/96), Folge zu #56): `userScalable: false` + `DisableZoom` (iOS Safari: `touchmove`/`gesturestart`); `body { touch-action: manipulation }`
- [x] `touch-action: none` + CSS-Containment auf dem Viewer; kein Pull-to-Refresh-Konflikt beim Wischen
- [x] Auto-Zoom bis `MIN_PAN_DISPLAY_RATIO` (2); Hotspot-y Build-/Runtime-Warnungen
- [x] Gyro: Neutral ~500 ms (alpha: kreisförmig); Re-Kalibrierung nach Wischen; Resize + `orientationchange`-Reset; `GYRO_FULL_RANGE_DEG` / Sensitivity / Deadzone; zirkuläre EMA für alpha; Gamma-Sanity nur für `gamma`
- [x] **Pan-Achse alpha (Portrait):** Armschwenk statt Kippen; zweiseitig ±45°; Hotspots nur per Tipp; Mathematik in `pan-from-orientation.ts`
- [x] iOS: `sessionStorage` + 2s-Watchdog bei Cache ohne Sensordaten
- [x] Button „Ansicht zentrieren“; `?debug=1` für Diagnose-HUD
- [x] Doku (u. a. `lokal-testen-und-anschauen.md`, `fuer-entwickler.md`, `architektur.md`, ADR-006, Projektplan, GitHub-Projekt-README) + Testmatrix

---

## #85 — Portrait Gimbal-Lock: gamma-Fallback + Post-Settle Re-Anchor (Folge zu #56)

**GitHub:** https://github.com/flxln/schulnavigator/issues/85 — **geschlossen** (Umsetzung `e59cd1e`)

**Labels:** `tech`  
**Assignee:** Felix

- [x] **Post-Settle Re-Anchor:** `neutralGamma` erst 150 ms nach Eintritt in Gimbal-Zone (iOS-Euler-Rearrangement abgewartet)
- [x] **Asymmetrisches Freeze:** Pause nur alpha → gamma; gamma → alpha sofortiger Re-Anchor von `neutralAlpha`
- [x] **`needsReanchorGamma`-Flag** — Reset bei Gyro-Deaktivierung, Resize, Zentrieren
- [x] Konstanten: `GIMBAL_LOCK_ENTER_DEG` (10), `GIMBAL_LOCK_EXIT_DEG` (15), `GYRO_GAMMA_PAN_SIGN` (-1, iPhone verifiziert)
- [x] Tests in `raum-viewer-math.test.ts`; Doku `anleitungen/raum-viewer-gyro-feintuning.md`

---

## #96 — Pinch-Zoom projektweit sperren (Folge zu #56)

**GitHub:** https://github.com/flxln/schulnavigator/issues/96 — **geschlossen** (Umsetzung `6bea507`)

**Labels:** `tech`  
**Assignee:** Felix

- [x] Viewport: `minimumScale`/`maximumScale: 1`, `userScalable: false` in `app/app/layout.tsx`
- [x] CSS: `body { touch-action: manipulation }` in `globals.css`
- [x] iOS Safari: `DisableZoom` — `touchmove` (>1 Finger) + `gesturestart`, `passive: false`
- [x] Auf Live nach manuellem Coolify-Redeploy verifiziert (iOS Pinch blockiert)
- [x] Doku: `architektur.md`, `lokal-testen-und-anschauen.md`, `fuer-entwickler.md`, #56-Checkliste oben

---

## #18 — Audio-Player-Komponente

**GitHub:** https://github.com/flxln/schulnavigator/issues/18 — **geschlossen** (2026-06-09)

**Labels:** `tech`  
**Assignee:** Felix

**Umsetzung:** `app/components/media/audio-player.tsx` + `audio-player.test.tsx`

- Custom Controls (Play/Pause, Fortschrittsbalken, Lautstärke-Slider) via `useRef<HTMLAudioElement>`
- GS39-Styling (`sn-media-audio*` in `sn-theme.css`); `preload="metadata"`, kein Autoplay
- Fehlerzustand mit Fallback-Link; `aria-label` auf allen Controls
- Cleanup `pause()` im `useEffect`-Rückgabe (kein Audio nach Panel-Unmount)
- Einbindung via `MediaPlayerByTyp` bei `typ === 'audio'`

---

## #19 — Video-Player-Komponente

**GitHub:** https://github.com/flxln/schulnavigator/issues/19 — **geschlossen** (2026-06-09)

**Labels:** `tech`  
**Assignee:** Felix

**Umsetzung:** `app/components/media/video-player.tsx` + `video-player.test.tsx`

- Drei Modi nach `videoSource` (führend): `upload` (MP4/Poster-only), `youtube` (Hinweistext, MVP inaktiv per ADR-004)
- Poster-only-Modus: `<img>` wenn `quelle` kein Video-Extension; MP4-Modus: `<video controls playsInline>`
- Optionales `poster`-Feld in `Medium` (Types + Validator-Guard `typ === 'video'`); asset-check in `validate-station-assets.mjs`
- Cleanup `pause()` im `useEffect`-Rückgabe
- Schema-Feld `videoSource: 'upload'` | `'youtube'`; Endungs-Heuristik nur als Upload-Fallback

---

## #20 — Bild-Galerie-Komponente

**GitHub:** https://github.com/flxln/schulnavigator/issues/20 — **geschlossen** (2026-06-09, Einzelbild + Lightbox)

**Labels:** `tech`  
**Assignee:** Felix

**Umsetzung:** `app/components/media/photo-viewer.tsx` + `photo-viewer.test.tsx`

- Inline `<img>` mit `object-contain`, bewusst **nicht** `next/image` (dynamische JSON-URLs, keine `remotePatterns` nötig); Kommentar im Code
- Expand-in-place-Vollbild (`enlarged`-State) innerhalb des Panel-Containers — kein zweites `role="dialog"` (ADR: Panel ist bereits Modal)
- `Escape` schließt Vollbild (ohne Panel zu schließen); Tap auf Bild ebenfalls
- Swipe-Galerie für Fotosets bewusst auf Phase 3 verschoben (kein `bilder[]`)
- GS39-Styling (`sn-media-photo*`, `.sn-media-photo--enlarged` in `sn-theme.css`)

---

## #93 — TextViewer inline + Demo-Station `klassenzimmer`

**GitHub:** https://github.com/flxln/schulnavigator/issues/93 — **geschlossen** (2026-06-10)

**Labels:** `tech` `content`  
**Assignee:** Felix

Follow-up zu **#18–#20**: `typ: "text"` wird nicht mehr als externer Link gerendert, sondern inline im `StationMediaPanel`.

**Umsetzung:**

- `app/components/media/text-viewer.tsx` + Tests — `fetch` same-origin `.md`/`.txt`; Markdown (`react-markdown`, `remark-gfm`); Plaintext `pre-wrap`; Redirect-/Content-Type-Guard
- Lazy-Load via `next/dynamic` in `MediaPlayerByTyp`
- GS39 `.sn-media-text*` in `sn-theme.css`
- **Globale Wirkung:** `musik` und `schulsozialarbeit` (`.txt` aus `/demo/`) zeigen Text ebenfalls inline

**Demo-Content `klassenzimmer`:**

- Rohquelle: `auftraggeber/material/medien/demo-generiert/`
- Laufzeit: `app/public/media/klassenzimmer/` (mp3, mp4, jpg, md)
- `stations.json`: 4 Medien + 4 Hotspots (`hs-text`, `hs-video`, `hs-audio`, `hs-foto`)

### Akzeptanzkriterien

- [x] `/raum/klassenzimmer`: Gyro, 4 Hotspots, 4 Medien-Tiles; Text als Markdown (Tabelle, Blockquote)
- [x] `/raum/musik`, `/raum/schulsozialarbeit`: Text inline (Regression)
- [x] `npm run validate:stations` + `npm test` grün
- [x] Doku: `architektur.md`, `projektplan.md`, `verzeichnisstruktur.md`, Meeting-Doku, `lokal-testen`

---

## #21 — Stempel-System + Hub-Freischaltung

**GitHub:** https://github.com/flxln/schulnavigator/issues/21 — **geschlossen** (2026-05-27)

**Labels:** `tech`  
**Assignee:** Felix

_Hinweis: Hub-Darstellung Puzzle → isometrisch siehe **#58** / [ADR-009](../../adr/009-hub-isometrisch.md); Freischalt-Logik (`visitedSlugs`) bleibt._

- [x] `localStorage` Key `sn_visited_slugs` (JSON-Array Slugs) — getrennt vom **Access-Token** ([ADR-005](../../adr/005-zugangskontrolle-token.md)); Logik in `lib/visited-stations.ts`, Hook `hooks/use-visited-stations.ts`
- [x] Besuch markieren: **`heft`** auf `/raum/[slug]` via `station-visit-recorder.tsx`; **`fest`** nur bei erfolgreichem Raum-QR in `qr-scanner.tsx` (#83)
- [x] **Modus `fest`:** freigeschaltete Hub-Slots nach Besuch (aktuell Puzzle-Segmente; #58 → isometrische Fenster); Hub-Platzhalter bis Hydration (kein „alles gesperrt“-Flash)
- [x] **Modus `heft`:** alle Stationen klickbar; Fortschritt trotzdem sichtbar
- [x] Fortschritt „n von 11“ (`HubWithProgress`, `total = segments.length`)
- [x] Badge „Besucht“ auf Stationsseite (`station-visited-badge.tsx`)
- [x] Cache-Löschen setzt Stempel zurück — akzeptabel

### Nachfolger (2026-05-30)

Hub-Vorschlag und `StationVisitRecorder` umgingen die Fest-Sperre — gesperrte Räume wurden ohne QR freigeschaltet. Fix + Spezifikation: [ADR-009 Nachtrag](../../adr/009-hub-isometrisch.md#nachtrag-2026-05-30--fest-freischaltung-nur-per-raum-qr-83). Issue **#83** (Sub-Issue zu #21).

---

## #83 — Fest: Hub-Vorschlag und Stempel nur per Raum-QR (Folge zu #21)

**GitHub:** https://github.com/flxln/schulnavigator/issues/83 — **geschlossen** (2026-05-30)

**Labels:** `tech` `bug`  
**Assignee:** Felix  
**Milestone:** Phase 2  
**Parent / Kontext:** Folge zu **#21** — Freischalt-Logik `visitedSlugs` / `hub-mode.ts`

**Problem:** Nach dem ersten freigeschalteten Raum führte der Hub-**Vorschlag** direkt nach `/raum/[slug]` (ohne Freischalt-Check). `StationVisitRecorder` markierte jeden Raumaufruf sofort in `sn_visited_slugs` → im Modus `fest` war die nächste Station ohne Scan am Türcode klickbar.

**Ziel:** Im Modus `fest` wächst `sn_visited_slugs` nur nach **erfolgreichem** Raum-QR (`QrScanner`); gesperrte Vorschläge (Hub-Karte, Footer „Nächste Station“) öffnen `/scan`.

### Akzeptanzkriterien

- [x] `home-screen.tsx`: Vorschlag bei gesperrter Station → `/scan` (Schloss-UI wie Footer)
- [x] `station-visit-recorder.tsx`: im `fest`-Modus kein Auto-`markVisited` auf Raum-Seite
- [x] `qr-scanner.tsx`: `markVisitedSlug` bei erfolgreichem Raum-Scan vor Navigation
- [x] ADR-009 Nachtrag; Doku: `architektur.md`, Anleitungen, diese Datei

### Nachfolger (2026-06-01)

UX-Konsolidierung der Startseiten-CTAs (kein Doppel-Scan im `fest`, kein Scan auf `/` im `heft`): Issue **#84** (Sub-Issue von **#83**), [ADR-009 Nachtrag CTAs](../../adr/009-hub-isometrisch.md#nachtrag-2026-06-01--startseite-modusabhängige-ctas).

### Nicht im Scope

- Serverseitige Sperre von `/raum/[slug]` ohne Stempel (Entry-Cookie reicht weiter für direkte URL)

---

## #84 — Startseite: modusabhängige CTAs (Fest Split / Heft Vorschlag)

**GitHub:** https://github.com/flxln/schulnavigator/issues/84 — **geschlossen** (2026-06-01, Sub-Issue von **#83**)

**Labels:** `tech` `design`  
**Assignee:** Felix  
**Milestone:** Phase 2  
**Parent / Kontext:** Sub-Issue zu **#83** (Fest-Navigation → `/scan`); UX-Folge zu **#61** (Home-Screen GS39)

**Problem:** Im Modus `fest` wirkten Fortschritts-Vorschlag und Primär-Button „QR an der Tür scannen“ doppelt (beide → `/scan`). Im Modus `heft` war der Scan-Button auf `/` überflüssig (Hub + `/stationen`).

**Ziel:** Ein klarer CTA pro Zustand; gemeinsame Logik für „nächste unbesuchte Station“ auf Home und im Raum-Footer.

### Akzeptanzkriterien

- [x] `fest` 1–10: geteilter Primär-Button unter der Karte (Nächste Station | Beliebiger QR) → `/scan`
- [x] `fest` 0/11: ein Scan-Button; 11/11: kein Scan unter der Karte
- [x] `heft`: Vorschlag in der Fortschrittskarte → Raum; kein Scan auf `/`
- [x] `getNextStation`, `getHomeFooterCta`; Footer überspringt besuchte Räume (→ #104: `next-station-row` entfernt)
- [x] Tests: `home-cta.test.ts`, `next-station.test.ts`, `next-station-footer.test.ts`
- [x] Doku: ADR-009 Nachtrag, `architektur.md`, `fuer-entwickler.md`, manuelle Checkliste `lokal-testen-und-anschauen.md`

### Nicht im Scope

- Scan-CTA auf [`/stationen`](../app/components/stationen/stationen-screen.tsx) im Modus `fest` (unverändert)

### Nachfolger (2026-06-11)

CTA-Vereinfachung ohne Stationsnamen: Issue **#104** (Folge **#84**), [ADR-009 Nachtrag #104](../../adr/009-hub-isometrisch.md#nachtrag-2026-06-11--scan-cta-ohne-stationsvorschlag-104). Ersetzt geteilten Fest-Button, Heft-Vorschlag in der Karte und benannte Raum-Footer-Zeile.

---

## #105 — Stationssymbole statt Nummerierung (Hub, Liste, Raum)

**GitHub:** https://github.com/flxln/schulnavigator/issues/105 — **geschlossen** (2026-06-11)

**Labels:** `tech`, `design`  
**Assignee:** Felix  
**Milestone:** Phase 2

**Ziel:** Raumspezifische Lucide-Icons statt sichtbarer Ziffern 1–11; unbesucht gedämpft (`navy300`), nach Besuch in Stations-Akzentfarbe. Keine suggerierte Besuchsreihenfolge.

### Akzeptanzkriterien

- [x] `lib/station-icons.ts` + `StationIcon` (Lucide; `image`-Typ für spätere monochrome SVGs via CSS-Mask)
- [x] `/stationen`, Hub-Chips, Raum-Header-Chip umgestellt; Untertitel „Station N“ entfernt
- [x] Grau-Vokabular: unbesucht-offen vs. gesperrt (`fest`) visuell unterscheidbar
- [x] Pre-Hydration: alle Badges muted bis `isHydrated` (kein Flackern)
- [x] `nr` nur intern + Screenreader (`aria-label`: „Raum N von 11“)
- [x] Tests `station-icons.test.ts`; Doku `architektur.md`, `lokal-testen-und-anschauen.md`

### Nachtrag 2026-06-11 — Hub-Glas & Chip-Größe (Folge #105)

UX-Feedback nach #105: besuchte Fenster/Portale wirkten opak; Symbole-Chips zu klein.

- [x] `visitedGlassFill`: transparentes `rgba` (α 0,28, Akzentmischung 52 %) statt deckendem Hex — gleiche Glaslogik wie gesperrte Slots
- [x] Hub-`StationChip`: größerer Kreis (`r` 24/25) und Icon (`34`); Häkchen proportional
- [x] Hilfsfunktion `hexToRgba` in `gs39-hex-blend.ts`; Test `schoolhouse-hub-map.test.ts`

---

## #104 — Scan-CTA vereinheitlichen, keine Stationsnamen (Folge #84)

**GitHub:** https://github.com/flxln/schulnavigator/issues/104 — **geschlossen** (2026-06-11)

**Labels:** `tech`, `design`  
**Assignee:** Felix  
**Milestone:** Phase 2  
**Parent / Kontext:** Folge **#84** / **#103** (Wordmark-Schriftgröße)

**Ziel:** Überall nur noch „Scanne die nächste Station!“ bzw. Erst-Scan „QR an der Tür scannen“ — keine Empfehlung einer konkreten Station auf `/` oder im Raum-Footer.

### Akzeptanzkriterien

- [x] `fest`/`heft` 1–10: ein Scan-Button (`scan-next`) → `/scan`
- [x] Raum-Footer: gleicher Text, kein Stationsname; nur sichtbar wenn unbesuchte Stationen übrig
- [x] Fortschrittskarte auf `/` tippbar → `/stationen`
- [x] Wordmark „Grundschule Dresden-Plauen“ `text-[19px]`
- [x] `next-station-row.tsx` entfernt; Tests `home-cta`, `next-station-footer`
- [x] Doku: ADR-009 Nachtrag, `architektur.md`, Anleitungen, diese Datei

---

## #103 — Startseite: Hub volle Breite & Wordmark Dresden-Plauen (Folge ADR-016)

**GitHub:** https://github.com/flxln/schulnavigator/issues/103 — **geschlossen** (2026-06-10)

**Labels:** `tech`, `design`  
**Assignee:** Felix  
**Milestone:** Phase 2

Spezifikation: [ADR-016 Nachtrag](../../adr/016-hub-frontansicht-39gs.md#nachtrag-2026-06-10--startseiten-layout--wordmark-103) · Folge zu **#58** / **#61** nach Frontansicht-Hub (ADR-016)

**Ziel:** Schulkontext in der Kopfzeile, Hub nutzt volle Viewport-Breite; Eintritt-Chip konsistent.

### Akzeptanzkriterien

- [x] Home: Headline und Hub in getrennten Blöcken; Hub `w-full` ohne seitliches Padding
- [x] `Gs39ChipMark`: **39.** weiß (`font-display`); Chip `aria-label` „39. Grundschule Dresden-Plauen“
- [x] Home Kopfzeile: **Grundschule Dresden-Plauen** (statt „Schulnavigator“)
- [x] Eintritt: gleicher Chip-Mark; Unterzeile „39. Grundschule Dresden-Plauen“
- [x] Modus-Label unter Jubiläumszeile (nicht in Kopfzeile)
- [x] Doku: ADR-016 Nachtrag, `home/README.md`, `architektur.md`, `projektplan.md`, diese Datei

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

Spezifikation: [ADR-005](../../adr/005-zugangskontrolle-token.md), Speicher/Durchsetzung: [ADR-007](../../adr/007-zugangskontrolle-cookie.md) (Cookie statt `localStorage`)

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

Spezifikation: [ADR-008](../../adr/008-eintritt-in-app-scanner.md) (inkl. Nachtrag Client vs. Middleware) · baut auf #23 auf

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

### Nachfolger (2026-05-30)

Entry-Scanner von Inline-Block auf **`/eintritt/scan`** verschoben; gemeinsame `ScanFullscreenShell` mit `/scan`. Spezifikation: [ADR-008 Nachtrag](../../adr/008-eintritt-in-app-scanner.md#nachtrag-2026-05-30--scanner-auf-eigene-route-eintrittscan). Issue **#82** (Sub-Issue zu #57).

---

## #82 — Eintritt-Scan: Route `/eintritt/scan` + `ScanFullscreenShell` (Folge zu #57)

**GitHub:** https://github.com/flxln/schulnavigator/issues/82 — **umgesetzt** (2026-05-30)

**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 2  
**Parent / Kontext:** Folge zu **#57** — ersetzt evaluierten Overlay-Ansatz (kein `history.pushState`, kein Body-Scroll-Lock)

**Problem:** Inline-`QrScanner` auf `/eintritt` ohne `chrome` wirkte wie leere Box; Overlay-Lösung wäre aufwendig in Mobile/A11y.

**Ziel:** Entry-Scan als **eigene Page** `/eintritt/scan` (wie `/scan`); Shell extrahiert; Middleware-Whitelist; Hinweisseite nur noch Link-CTA.

### Akzeptanzkriterien

- [x] `ScanFullscreenShell` — von `ScanScreen` und `EintrittScanScreen` genutzt
- [x] `/eintritt/scan` — Server-Page, `mode="entry"` `chrome`, SR-`<h1>`, `onBack` → `push('/eintritt')`
- [x] `/eintritt` — kein Inline-Scanner; Karte + Fehler-CTA → `/eintritt/scan`
- [x] Middleware: Matcher `/eintritt` + `/eintritt/:path*`; Bypass-Whitelist `['/eintritt', '/eintritt/scan']`
- [x] Vitest: `/eintritt/scan` ohne Cookie, `?t=` auf Scan-Route, `/eintritt/foo` → Redirect, Drift-Guard
- [x] ADR-008 Nachtrag; Doku: `architektur.md`, Anleitungen, `entscheidungen.md`

### Nicht im Scope

- `autoStart` Kamera, Telemetrie, Tablet-Layout (#74)

---

## #81 — Scan-Chrome: Kamerabild füllt quadratischen Rahmen (Folge zu #62)

**GitHub:** https://github.com/flxln/schulnavigator/issues/81 — **geschlossen** (2026-05-30) · Sub-Issue von **#62**

**Labels:** `tech` `design`  
**Assignee:** Felix  
**Milestone:** Phase 2

**Problem:** Auf `/scan` (`chrome={true}`) war `.sn-scan-frame` (240×240 px) größer als das Kamerabild; `<video>` blieb im natürlichen Seitenverhältnis (~240×180 px).

**Ursache:** `html5-qrcode` setzt beim Start `position: relative` auf das Mount-Element. Lag die Klasse `.sn-scan-camera` (`position: absolute; inset: 0`) auf demselben Element, fiel die absolute Positionierung weg — der Container schrumpfte auf die Video-Höhe.

**Lösung:**

- Äußerer Wrapper `.sn-scan-camera` (füllt den Rahmen, wird von der Library nicht verändert)
- Inneres Mount `.sn-scan-camera-mount` für `Html5Qrcode`
- Video-Styling unverändert: `.sn-scan-camera video { width/height: 100%; object-fit: cover; }`

**Dateien:** `app/components/scan/qr-scanner.tsx`, `app/app/sn-theme.css`

### Akzeptanzkriterien

- [x] Live-Kamerabild füllt den quadratischen Rahmen auf `/scan` ohne sichtbaren Leerraum
- [x] Ecken-Overlay und Scan-Line bleiben am Rahmen ausgerichtet

### Abhängigkeiten

- **#62** (geschlossen) — Scan-Chrome / dunkler Viewport

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

**Fahrplan (45–60 Min.):** [`dokumentation/archiv/projektmanagement/2026-06-10-mpz-meeting-fahrplan.md`](../../archiv/projektmanagement/2026-06-10-mpz-meeting-fahrplan.md) · Demo-Ablauf: [`2026-06-10-mpz-demo-meeting.md`](../../archiv/projektmanagement/2026-06-10-mpz-demo-meeting.md)

Agenda:

1. Demo App-Shell: Hub (`fest`), Scanner, `musik`/`daz`/`klassenzimmer` (Ziel-Workflow)
2. Content-Lieferplan: 11 Räume → Medientyp → Klasse → Verantwortlich → **Deadline 12.06.**
3. Schulfest-QR-Strategie (offene Räume vs. Hof-Virtualisierung, Nachtrag #86)
4. WLAN/Mobilfunk (Turnhalle, Außenbereich)
5. AVV-Status (#43)
6. Projekttag 24./25.06.

**Ohne Content-Lieferplan keine Phase 3.**

---

## #69 — Demo/Content: Otto-Frieda-Audio für `daz` aus Rohaufnahme

**Labels:** `content` `tech`  
**Assignee:** Felix  
**GitHub:** https://github.com/flxln/schulnavigator/issues/69 — **geschlossen** (2026-05-28)

*(Geplant als #64; nächste freie Nummer auf GitHub war #69.)*

**Abhängigkeit:** [flxln/hilfreiche-tools#3](https://github.com/flxln/hilfreiche-tools/issues/3) (`station-audio-transkript`)

**Umsetzung:** [ADR-010](../../adr/010-dialog-cutscene-gated-audio.md) — Dialog-Cutscene statt zwei lose Audio-Medien im Panel; Clips unter `app/content/dialog-audio/{slug}/`, Auslieferung `GET /api/dialog/[slug]/[clip]` (Cookie, Range). Stationen **`daz`** und **`pc-raum`** mit je 9 Segmenten; Maskottchen PNGs in `public/brand/mascots/`. Demo-Ablauf: [`2026-06-10-mpz-demo-meeting.md`](../../archiv/projektmanagement/2026-06-10-mpz-demo-meeting.md).

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

Ersetzt Cutscene-UX für Dialog-Stationen; Audio/Route bleiben [ADR-010](../../adr/010-dialog-cutscene-gated-audio.md). Spezifikation: [ADR-011](../../adr/011-dialog-mascot-hotspots.md).

### Akzeptanzkriterien

- [x] Tap Frieda/Otto → Dialog + Sprechblase, Gyro an (`daz`, `pc-raum`)
- [x] Schema `action: dialog` + `mascot`; Validator + Tests
- [x] Re-Tap-Guard, „Dialog beenden“ (v1 unter Sprechblase; UI-Polish → #72), Center-Hit ohne Maskottchen
- [x] Spike iPhone (2026-05-28) dokumentiert
- [x] Direkt auf `main` (`14cb740`); Deploy/Geräte-QA am Produktions-HTTPS ausstehend
- [x] Hotspot-Positionen/Größe per JSON (`mascotSize`, viewport-`y`) — [ADR-014](../../adr/014-mascot-size-json.md), Branch `feature/dialog-bubble-json`
- UI-Polish TopBar/Chip: [#72](https://github.com/flxln/schulnavigator/issues/72) — erledigt (PR #73)

---

## Dialog-Layout JSON (ADR-014 / ADR-015)

**Labels:** `tech` `content`  
**Assignee:** Felix  
**Branch:** `feature/dialog-bubble-json` (ADR-014 + ADR-015 gemergt, noch nicht auf `main`)

| ADR | Inhalt | Status |
|-----|--------|--------|
| [014](../../adr/014-mascot-size-json.md) | `mascotSize`, `mascotFlipX`, viewport-relative `y` | umgesetzt |
| [015](../../adr/015-dialog-bubble-json.md) | `dialog.bubble` (Position/Größe, `followPan`), `segmente[].tail` | umgesetzt |

### Akzeptanzkriterien

- [x] Types, Validator, Tests (`validate-stations`, `dialog-bubble-layout`, `hotspot-overlay`)
- [x] `daz` / `pc-raum`: `mascotSize` in `stations.json`; Doku [`content-einpflegen.md`](../../anleitungen/content-einpflegen.md)
- [x] `npm run test` grün
- [ ] `npm run build` + PR → `main`; Geräte-QA Dialog-Layout
- [ ] Optional: `dialog.bubble` in `stations.json` nach Feintuning am Gerät

---

## #72 — Raum-UI: Dialog beenden in TopBar, Zentrieren über Chip

**Labels:** `design`, `tech`  
**Assignee:** Felix  
**GitHub:** https://github.com/flxln/schulnavigator/issues/72 — **geschlossen** (2026-05-28, Merge [PR #73](https://github.com/flxln/schulnavigator/pull/73) → `main` @ `7fc23c6`)

Follow-up zu **#71** / [ADR-011](../../adr/011-dialog-mascot-hotspots.md). Kein ADR. Doku: [`architektur.md`](../architektur.md) (Raum-Viewer/TopBar), [`lokal-testen`](../../anleitungen/lokal-testen-und-anschauen.md).

### Akzeptanzkriterien

- [x] Dialog-Ende: **X**-Icon (38×38) neben Zurück in der TopBar; Sprechblase ohne Button darunter
- [x] Hero: kein floating „Zentrieren“; Stations-Chip tappbar → `recenterView`
- [x] Chip-Tap und „Zurück“ während Dialog: `endDialog()` (Audio + `activeHotspotId`)
- [x] `npm run test` + `npm run build` grün
- [x] Geräte-QA auf Dev-HTTPS (`schulnavigator-dev.mpz.schule`)
- [x] Merge PR #73 → `main` (Prod-Deploy: Coolify; Dev-Branch wieder `main` empfohlen)

---

## #74 — Tablet/iPad: Layout-Skalierung (Epic)

**Labels:** `design`, `tech`  
**Assignee:** Felix  
**Milestone:** Phase 2  
**GitHub:** https://github.com/flxln/schulnavigator/issues/74 — **geschlossen** (2026-06-14, Branch `feat/tablet-ipad-layout`)

Spezifikation: [ADR-012](../../adr/012-tablet-ipad-responsive-layout.md) · Detail: [epic-tablet-ipad-layout.md](./epic-tablet-ipad-layout.md)

**Ziel:** Mobile-first-App für **Stationstablets** (iPad, Android-Tablet) per Tailwind `md`/`lg` skalieren — breitere Spalte, höherer Raum-Hero — **ohne** CSS-Zoom und ohne Desktop-Redesign. Gyro/Hotspots ([#56](#56--raum-viewer-mobil-härtung-folge-zu-55)) bleiben; Regressionstest auf iPad.

**Abgrenzung:** [#72](#72--raum-ui-dialog-beenden-in-topbar-zentrieren-über-chip) erledigt; nicht im selben PR. Hardware-Fallback: [#41](./issues-phase-4.md) (Phase 4).

### Unterissues (geplant)

| Nr. | Titel | PR-Reihenfolge |
|-----|-------|----------------|
| **#75** | Layout-Container (`max-w` ab `md`) | 1 |
| **#76** | Raum-Viewer / Hero-Höhen | 2 |
| **#77** | Hub + Startseite | 3 |
| **#78** | Dialog + Medien-Panel (optional) | 4 |

### Epic-Checkliste

- [x] GitHub: Parent #74 + Unterissues #75–#78 angelegt (2026-05-28); URLs in dieser Datei und in `epic-tablet-ipad-layout.md`
- [x] #75 — `max-w-lg` → `.sn-page-container` auf Haupt-Routen; Medien-Modal ab `md:`; TopBar im Hero (`absolute z-[30]`, Safe-Area)
- [x] #76 — Nicht-Hero-Viewer CSS-Klassen; Card-Peek ohne Hero-Cap; `containerH`-Init 0; Tests
- [x] #77 — Hub nutzt breitere Spalte (Frontansicht skaliert mit); Touch-Targets bereits CSS-px
- [x] #78 — Dialog-/Medien-Polish (Bubble, Maskottchen-Schatten, Video `aspect-video` im Modal)
- [x] `anleitungen/lokal-testen-und-anschauen.md` — Tablet-Viewports (768, 1024, 834)
- [x] `architektur.md` — Abschnitt Responsive/Tablet
- [x] Medien-Hotspot-Icons: Tablet-Skalierung (`mediaIconSizingReferenceHeight`, `layoutViewportWidth ≥ 520 px` → Phone-QA-Referenz; Folge #74 QA)
- [x] Gyro nach Wischen (Folge #74 QA): Sphere — Neustart nach Ein-Finger-Pan (`gyroWasEnabledBeforeTouch`, erweitert #116); Flat — Höhen-Resize debounced (200 ms, iOS `svh` beim Card-Peek-Scroll)

---

## #113 — 360°-Sphere-Viewer: PSV-Koexistenz, Gyro-Panning (Spike Musikraum)

**GitHub:** https://github.com/flxln/schulnavigator/issues/113 — **geschlossen** (2026-06-11, Branch `feature/360-sphere-viewer`)

**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 2

**Ziel:** 360°-Equirectangular-Viewer (Photo Sphere Viewer v5) parallel zum bestehenden Flat-Viewer einführen. Pilot: Musikraum. Gyro-Panning (PSV GyroscopePlugin) mit iOS-Permission-Overlay auf Parität zum Flat-Viewer.

**Abschluss:** ADR-018, `SphereRaumViewer`, Gyro-Panning vollständig umgesetzt. Folgearbeit (Rollout weiterer Stationen, Maskottchen-Marker) in gesondertem Plan/Issue.

### Checkliste

- [x] ADR-018 angelegt (Koexistenz-Strategie, PSV v5, `viewer`-Flag)
- [x] `@photo-sphere-viewer/core`, `markers-plugin`, `gyroscope-plugin` installiert
- [x] `lib/types.ts`: `ViewerMode`, `HotspotBase`, `Hotspot360`, `StationViewerHandle`
- [x] `lib/validate-stations.ts`: viewer-abhängige Pflichtfelder
- [x] `components/raum-viewer/sphere-raum-viewer.tsx` + `sphere-raum-viewer-inner.tsx`
- [x] `raum-station-client.tsx`: Verzweigung `flat` / `equirectangular`
- [x] `pan-onboarding-overlay.tsx`: `mode="sphere"` (Text „Drehe dich um")
- [x] `lib/dialog-hotspot.ts`: viewer-aware (`hotspots360` einbezogen)
- [x] `stations.json`: `musik` auf `equirectangular` + `hotspots360`
- [x] Gyro-Panning: `useDeviceOrientation` + PSV `GyroscopePlugin.start()` + iOS-Permission-Overlay
- [x] Tests: `sphere-raum-viewer-inner.test.tsx` (11 Tests grün)
- [x] `npm run build` grün

---

## #114 — 360°-Sphere-Viewer: Rollout 8 Stationen, Maskottchen-Marker, Gyro-Bugfix (Folge #113)

**GitHub:** https://github.com/flxln/schulnavigator/issues/114 — **geschlossen** (2026-06-11, Branch `feature/360-sphere-viewer`)

**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 2 — Content-Struktur + UI

**Ziel:** Folgearbeit zum Spike #113 abschließen — alle Panorama-Stationen auf `equirectangular` umstellen, Dialog/Maskottchen im Sphere-Viewer fertigstellen, Export-Tooling bauen und das Gyro-Panning auf echten Geräten korrigieren.

**Kontext:** ADR-018 (Rollout-Nachtrag + `onHotspotCenterHit`-Entscheidung), Spike-Ergebnis [`2026-06-11-360-sphere-spike-ergebnis.md`](../../archiv/projektmanagement/2026-06-11-360-sphere-spike-ergebnis.md), Plan `360-viewer_folgearbeit`.

### Checkliste

- [x] Export-Tooling `scripts/export-pano-equirect.mjs` (`npm run export:pano360`, 8 Slugs, sips-Optimierung)
- [x] `validate-station-assets.mjs`: `panorama360` Existenz, JPEG, 2:1-Ratio, Größenwarnung
- [x] Maskottchen-Marker `lib/raum-viewer/sphere-marker-html.ts` (PNG, `mascotSize`/FlipX/Speaking) + Tests
- [x] Rollout 8 Stationen auf `equirectangular` (`klassenzimmer`, `daz`, `pc-raum`, `werken`, `turnhalle`, `speiseraum`, `lesewelt`, `musik`)
- [x] `kunst`, `hort`, `schulsozialarbeit` bleiben Flat (kein Rohmaterial)
- [x] Gyro-Bugfix Android: `isSupported`-Patch (wartet auf erstes Event mit gültigem `alpha`)
- [x] Gyro-Bugfix Pitch: `VisibleRangePlugin` entfernt (kollabierte Pitch); `roll: false` begrenzt seitwärts Kippen
- [x] Tests grün (`sphere-raum-viewer-inner.test.tsx`, `sphere-marker-html.test.ts`)

**Offen:** FPS/Ladezeit iPhone Safari messen. Hotspot-yaw/pitch → [#119](#119--sphere-hotspots-sphärisches-mapping-layer-marker-kalibrier-helfer-folge-114).

---

## #119 — Sphere-Hotspots: sphärisches Mapping (Layer-Marker, Kalibrier-Helfer, Folge #114)

**GitHub:** https://github.com/flxln/schulnavigator/issues/119 — **geschlossen** (2026-06-14, PR [#118](https://github.com/flxln/schulnavigator/pull/118) → `main` @ `006ff72`)

**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 2 — Content-Struktur + UI

**Ziel:** Maskottchen und Medien-Icons im Sphere-Viewer sphärisch auf der Kugel platzieren (PSV Layer-Marker statt flacher HTML-Billboards); Dev-Kalibrier-Workflow für `hotspots360`.

**Kontext:** ADR-018 (Layer-Marker-Nachtrag 2026-06-13), Folge #114/#116. Spike: [`2026-06-13-sphere-hotspot-layer-spike.md`](../../archiv/projektmanagement/2026-06-13-sphere-hotspot-layer-spike.md). Abnahme: [`2026-06-13-sphere-hotspot-acceptance.md`](../../archiv/projektmanagement/2026-06-13-sphere-hotspot-acceptance.md).

### Checkliste

- [x] Medien-Hotspots als PSV `imageLayer` (`sphere-marker-factory.ts`, `resolveImageLayerSize`)
- [x] Maskottchen als `element`-Billboard mit Fuß-Anker; `bubblePitchOffset` für Dialog-Bubble
- [x] Dot-Fallback über `sphere-marker-html.ts`
- [x] Marker-Lifecycle: `updateMarker`/DOM statt `clearMarkers`-Rebuild
- [x] Dev-Overlay `?hotspot-calib=1` (`sphere-hotspot-calib-overlay.tsx`)
- [x] `hotspots360` für `daz`, `pc-raum`, `klassenzimmer`, `musik` nachkalibriert
- [x] Types/Validator: `bubblePitchOffset` in `Hotspot360`
- [x] Tests: `sphere-marker-conventions`, `sphere-marker-factory`, `sphere-hotspot-calibration`
- [x] Flat-Viewer unverändert

---

## #120 — Sphere-Marker: PSV-Tooltips entfernen, Kalibrier-Yaw normalisieren (Folge #119)

**GitHub:** https://github.com/flxln/schulnavigator/issues/120 — **geschlossen** (2026-06-14, `main`)

**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 2 — Content-Struktur + UI

**Ziel:** Unerwünschte PSV-Tooltip-Labels über Maskottchen/Medien-Icons entfernen; Kalibrier-Helfer liefert `yaw` im Validator-Format (−180…180°).

**Kontext:** Folge #119. `label` in `hotspots360` bleibt für `aria-label`/Content-Pflege; keine sichtbaren Sprechblasen mehr.

### Checkliste

- [x] `tooltip` aus `buildSphereMarkerConfig` entfernt (`sphere-marker-factory.ts`)
- [x] `normalizeYawDeg` in `sphere-marker-conventions.ts` + Kalibrier-Snippet
- [x] DaZ `hotspots360` nachkalibriert (`stations.json`)
- [x] Tests: `sphere-hotspot-calibration.test.ts`
- [x] Abnahme-Referenz + `content-einpflegen.md` aktualisiert

---

## #116 — Sphere-Viewer: Zoom-Sperre + Gyro-Neustart nach Pinch (Folge #114)

**GitHub:** https://github.com/flxln/schulnavigator/issues/116 — **geschlossen** (2026-06-11, Branch `feature/sphere-zoom-sperre`)

**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 2 — Content-Struktur + UI

**Ziel:** Pinch-/Mausrad-Zoom im Sphere-Viewer deaktivieren (festes FOV 90°), Dialog-Bubble stabil halten, Marker für 90° nachkalibrieren; Gyro nach Zwei-Finger-Pinch wieder aktivieren.

**Kontext:** ADR-018 (Zoom-Sperre + Gyro-Neustart), Folge #114.

### Checkliste

- [x] `SPHERE_LOCKED_FOV_DEG` + Epsilon-Spanne in `constants.ts`
- [x] PSV-Config: `minFov`/`maxFov`/`defaultZoomLvl`/`mousewheel` in `sphere-raum-viewer-inner.tsx`
- [x] Sphere-Marker-Normen (`resolveMascotSizeNormForSphere`, `resolveIconSizeNormForSphere`)
- [x] Config-Smoke-Test `sphere-raum-viewer-inner.test.tsx`
- [x] Gyro-Neustart nach Pinch (`touchstart` Capture + `touchend`)
- [x] Gyro-Neustart nach Ein-Finger-Pan (Folge #74 QA, 2026-06-14): `gyroWasEnabledBeforeTouch` in `onTouchEnd` — PSV `stopAll()` nach Wischen
- [x] ADR-018 Konsequenzen ergänzt

---

## #26 — WLAN-Test vor Ort vereinbaren

**Labels:** `org`  
**Assignee:** Felix / Sten

- Abdeckung an **allen 11** Stationspunkten prüfen
- Kritisch: Turnhalle, Außenbereich A–N-Haus
- Mobilfunk = primär; WLAN = Bonus ([ADR-004](../../adr/004-video-hosting-mpz.md): Videos vom MPZ-Server)

---

## #121 — Coach: Fortschritts-Maskottchen-Einblendungen (ADR-019)

**GitHub:** https://github.com/flxln/schulnavigator/issues/121 — **geschlossen** (2026-06-14, [PR #123](https://github.com/flxln/schulnavigator/pull/123) → `main`)

**Labels:** `tech`, `design`  
**Assignee:** Felix  
**Milestone:** Phase 2 — Content-Struktur + UI

**Ziel:** Fortschritts-getriggerte Coach-Einblendungen (Frieda/Otto) getrennt vom Dialog: Hub-Meilensteine, Room-first, modus-getrennter Seen-State, sequenzielle 11/11-Sequenz vor `SparkleBurst`.

**Kontext:** ADR-019, [epic-coach-fortschritt.md](epic-coach-fortschritt.md). Folge-Issue: [#122](#122--raum-overlay-priorität-gyro--pan-onboarding--coach-folge-121).

### Checkliste

- [x] ADR-019, `coach-messages.json`, `validate:coach`
- [x] `coach-seen`, `coach-triggers`, Vitest
- [x] `MascotPeekOverlay`, `CoachNudgeLayer`, `use-coach-nudge`
- [x] Hub + Raum-Integration, Sparkle-Orchestrierung
- [x] Portal-Fix iOS (viewport-fix)
- [x] Coach-Inhalt an `.sn-page-container` gebunden (Backdrop fullscreen; Folge #74 Tablet-QA)
- [ ] Copy MPZ, PR merge

---

## #122 — Raum-Overlay-Priorität: Gyro → Pan-Onboarding → Coach (Folge #121)

**GitHub:** https://github.com/flxln/schulnavigator/issues/122 — **geschlossen** (2026-06-14, [PR #123](https://github.com/flxln/schulnavigator/pull/123))

**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 2 — Content-Struktur + UI

**Ziel:** Gyro-Berechtigung, Pan-Onboarding und Room-Coach nicht gleichzeitig; Reihenfolge Gyro → Pan → Coach im gleichen Besuch.

**Kontext:** ADR-019 Layer-Matrix, Parent #121. `checking`-State, `viewer-coach-gate.ts`, `onViewerCoachGateChange`.

### Checkliste

- [x] `useDeviceOrientation`: `checking` vs. terminal `unsupported`
- [x] `PanOnboardingOverlay`: Skip, sofort dismiss, `onActiveChange`
- [x] Viewer-Gate in Flat/Sphere + `raum-station-client`
- [x] `use-coach-nudge`: Seen-Timing, blocked blendet aus
- [x] Tests + Build grün
- [ ] Manueller iOS-Test

---

## #124 — Hub: Wegweiser-Slots für Schulhof und Turnhalle (ADR-020)

**GitHub:** https://github.com/flxln/schulnavigator/issues/124 — **geschlossen** (2026-06-14, [PR #125](https://github.com/flxln/schulnavigator/pull/125) → `main`)

**Labels:** `tech`, `design`  
**Assignee:** Felix  
**Milestone:** Phase 2 — Content-Struktur + UI

**Ziel:** Wegweiser-Slots für `turnhalle` (oben) und `schulhof` (unten); 12. Station; `fenster-lr` → Deko; Slot-Vertrag mit `hitFrame`/`chipAnchor`/`rotation`.

**Kontext:** ADR-020, [epic-hub-wegweiser.md](epic-hub-wegweiser.md). Schulhof-Content nachgelagert.

### Checkliste

- [x] `schoolhouse-hub-map.ts`, `front-schoolhouse.tsx`
- [x] `stations.json`, Panorama `schulhof`, QR-Manifest
- [x] Tests + Build grün
- [x] ADR-020 + Doku
- [ ] Schulhof-Hotspots (Content)
- [ ] Manueller Hub-Check
