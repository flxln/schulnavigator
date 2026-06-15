# Issues — Phase 5: Post-Fest

Milestone: **Phase 5** | Fällig: 31.10.2026

Kein harter Termin. Prioritäten werden nach der Schulfest-Auswertung festgelegt.
Issues hier sind Vorausplanung — können nach dem 26.06. konkretisiert und neu priorisiert werden.

---

## #44 — Auswertung mit Schule

**Labels:** `org`
**Assignee:** Felix / Thomas

Meeting mit Sten und Tina nach dem Schulfest.
Fragen:
- Was hat gut funktioniert?
- Was hat Eltern/Kinder begeistert?
- Was war technisch problematisch (WLAN, Laden, Bedienung)?
- Welche Stationen sollen überarbeitet werden?
- Welche neuen Stationen sollen dazukommen?

Ergebnis: priorisierte Liste für Phase-5-Features.

---

## #45 — Bekannte Bugs und UX-Probleme dokumentieren

**Labels:** `tech`
**Assignee:** Felix

Alle während Projekttag und Schulfest beobachteten Probleme als Issues anlegen.
Besonders: mobile Darstellung, Ladezeiten, In-App-Scanner, Puzzle-Hub, Token/`heft`-Modus.

---

## #46 — Entscheidung: Content-Pflege langfristig

**GitHub:** geschlossen (2026-05-21)

**Labels:** `org`
**Assignee:** Thomas / Felix

**Status: entschieden (2026-05-21)** — [ADR-003](../adr/003-content-mvp-json-directus.md)

- Schule pflegt selbst über **Directus** (Headless CMS)
- MPZ betreibt Hosting und Mandanten
- Eigenes Custom-Admin **verworfen**

---

## #47 — Directus einführen und Content migrieren

**Labels:** `tech`
**Assignee:** Felix

Directus auf Coolify deployen; Collections aus JSON-Schema; Migration der 39. Grundschule.

Lehrkräfte können ohne Entwickler (über Directus-UI):
- Stationsbeschreibungen bearbeiten
- Medien hochladen und zuordnen
- Neue Stationen anlegen (Rollen abhängig)

Datenschutz: Login nur für Lehrkräfte, keine Schülerdaten im CMS.

---

## #48 — Englisch-Menü aktivieren

**Labels:** `tech`
**Assignee:** Felix

`en.json` vollständig übersetzen (Menütexte, Systemmeldungen).
Sprachumschalter in der UI aktivieren.
Content (Audio/Video) bleibt deutsch — nur UI-Texte mehrsprachig.
Tinas Motivation: englischsprachige Eltern (TU Dresden, internationale Familien).

---

## #49 — Weitere Stationen nachrüsten

**Labels:** `content` `org`
**Assignee:** Felix / Schule

Stationen mit schwachem Content oder technischen Problemen überarbeiten; ggf. **12.+ Station** (z. B. Außenbereich, Robotik-Werkraum) — Liste aus #44.
Aktuell **11 Stationen** im MVP; Erweiterung über JSON (bis Directus #47 live).

---

## #50 — Wunschliste Phase 2 evaluieren

**Labels:** `tech` `org`
**Assignee:** Thomas / Felix

Im Gespräch am 07.05. wurden mehrere Features diskutiert, die explizit auf "nach 26.6." verschoben wurden.
Nach der Auswertung entscheiden, welche davon umgesetzt werden:

- [ ] Echtes AR (Kamera/WebXR) — **nicht** MVP-Gyro-Viewer ([ADR-006](../adr/006-raum-viewer-gyro-hotspots.md))
- [ ] 360°-Panorama-Viewer — Planung: [`360-panorama-viewer-planung.md`](../kurzfristige-ideen/360-panorama-viewer-planung.md) (2026-06-03)
- [ ] Interaktive Trigger (Lego-Motor, Tafel-Steuerung per App)
- [ ] Mal-App im Kunstzimmer
- [ ] Mini-Spiel "Schulranzen packen"
- [ ] Kind-gezeichnete interaktive Schulhaus-Karte
- [x] Verlinkung zu externen Lernspielen — [#99](https://github.com/flxln/schulnavigator/issues/99) erledigt (PR #102)
- [x] iframe-Einbettung (Delightex) — [#100](https://github.com/flxln/schulnavigator/issues/100) erledigt (gemergt)
- [x] Hotspot-Icons statt gelber Punkt — [#98](https://github.com/flxln/schulnavigator/issues/98) erledigt (PR #101)

**Umsetzungsplan:** [`projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md`](../projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md) · **Epic-Spezifikation:** [epic-externe-medien-hotspot-marker.md](./epic-externe-medien-hotspot-marker.md)

Verbleibende Wunschliste-Punkte bekommen weiterhin einen eigenen Issue, wenn sie beschlossen werden.

---

## #97 — Externe Medien & Hotspot-Marker (Epic, ADR-017)

**GitHub:** https://github.com/flxln/schulnavigator/issues/97  
**Labels:** `tech`, `design`  
**Assignee:** Felix  
**Milestone:** Phase 5 — Post-Fest

Sukzessive Post-Fest-Erweiterung: Hotspot-Marker → externe Links → iframe (Delightex).

### Unterissues

- [x] [#98](https://github.com/flxln/schulnavigator/issues/98) — Hotspot-Marker & `thumbnail` (Stufe 1) — PR #101
- [x] [#99](https://github.com/flxln/schulnavigator/issues/99) — Medientyp `link` (Stufe 2) — PR #102
- [x] [#100](https://github.com/flxln/schulnavigator/issues/100) — Medientyp `embed` / iframe (Stufe 3) — gemergt

### Epic erledigt wenn

- [x] #100 geschlossen
- [x] Demo: `klassenzimmer` Icon-Hotspot; `pc-raum` mit `typ: embed` (Delightex)
- [x] `content-einpflegen.md` beschreibt Stufe 1–3 produktiv

---

## #98 — Hotspot-Marker & thumbnail (ADR-017 Stufe 1) — erledigt

**GitHub:** https://github.com/flxln/schulnavigator/issues/98  
**Parent:** #97  
**Labels:** `tech`, `design`  
**Assignee:** Felix  
**Status:** geschlossen (PR #101, 2026-06-10)

`hotspots[].icon`, `iconSize`; `medien[].thumbnail`; Fallback gelber Punkt. Siehe [Epic Stufe 1](./epic-externe-medien-hotspot-marker.md#98--hotspot-marker--thumbnail-stufe-1).

---

## #99 — Medientyp link (ADR-017 Stufe 2) — erledigt

**GitHub:** https://github.com/flxln/schulnavigator/issues/99  
**Parent:** #97  
**Labels:** `tech`  
**Assignee:** Felix  
**Status:** geschlossen (PR #102, 2026-06-10)

`typ: link`, `openIn: external` — z. B. Delightex-Share-URL im neuen Tab.

---

## #100 — Medientyp embed / iframe Delightex (ADR-017 Stufe 3) — erledigt

**GitHub:** https://github.com/flxln/schulnavigator/issues/100  
**Parent:** #97  
**Labels:** `tech`  
**Assignee:** Felix  
**Status:** geschlossen (2026-06-11, gemergt #100)

`typ: embed`, CSP `frame-src`, Allowlist `delightex.com`, `EmbedViewer`, Demo `pc-delightex` mit `https://edu.delightex.com/WVX-NAQ`.

---

## #109 — Delightex-Fallback Mobile (Folge #100, ADR-017 Aufgabe 3.6) — erledigt

**GitHub:** https://github.com/flxln/schulnavigator/issues/109  
**Parent:** #97  
**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 5 — Post-Fest  
**Status:** geschlossen (2026-06-11, Branch `feature/delightex-fallback`)

Delightex-Embed auf Touch-Geräten ohne iframe; `DelightexFallbackPanel` mit Browser- und App-Store-Buttons; gleiche UI bei `typ: link`; kein Auto-Tab bei Delightex-Links.

**Dateien:** `app/lib/delightex-fallback.ts`, `app/components/media/delightex-fallback-panel.tsx`, `embed-viewer.tsx`, `link-viewer.tsx`, `raum-station-client.tsx`

### Akzeptanzkriterien

- [x] Mobile: Fallback-Karte statt iframe
- [x] Desktop: iframe + Fallback-Panel
- [x] Delightex-Host-Erkennung ohne JSON-Schema-Change
- [x] Tests + Doku aktualisiert

---

## #128 — Book Creator Embed Lesewelt (ADR-017) — erledigt

**GitHub:** https://github.com/flxln/schulnavigator/issues/128  
**Parent:** #97  
**Labels:** `tech`, `content`  
**Assignee:** Felix  
**Milestone:** Phase 5 — Post-Fest  
**Status:** geschlossen (2026-06-15, Branch `feature/bookcreator-lesewelt`)

Allowlist `bookcreator.com`, Demo `lesewelt` / `lesewelt-beruehmte-personen` („Berühmte Personen“), `EmbedViewer` mit Book-Creator-Höhe und schlanker Quellenzeile unten.

### Akzeptanzkriterien

- [x] Allowlist + CSP
- [x] `stations.json` Lesewelt + Hotspot (Platzhalter-Koordinaten)
- [x] Tests + Doku

**Offen:** Hotspot-Kalibrierung; DSB/Datenschutzerklärung Book Creator

---

## #51 — Mandantenfähigkeit: andere Schulen vorbereiten

**Labels:** `tech`
**Assignee:** Felix

Thomas-Vision: Das MPZ stellt die Lösung anderen Schulen bereit.
Voraussetzungen:
- Schul-spezifische Konfiguration (Name, Logo, Maskottchen, Stationen, Token-Profile `fest`/`heft`) ausgelagert
- Deployment-Prozess für neue Schulen dokumentiert
- Onboarding-Anleitung für Lehrkräfte erstellt

Zeitrahmen: frühestens Schuljahr 2026/27.

---

## #111 — Raum-Inhaltskarte: Card-Peek-Layout + iOS-Viewport-Fix

**GitHub:** https://github.com/flxln/schulnavigator/issues/111

**Labels:** `tech` `design`  
**Assignee:** Felix  
**Milestone:** Phase 5 — Post-Fest  
**Status:** geschlossen (Branch `feat/raum-card-peek-layout`, 2026-06-11)

**Ziel:** Beim Öffnen einer Raumstation maximal die Überschriftenzeile der Inhaltskarte sichtbar; Beschreibung/Medien per Hochscrollen. iOS: keine horizontale Überbreite, Scroll in Chrome und Safari.

**Umsetzung:**

- Hero `h-[calc(100svh-6.5rem)]`, Karte `-mt-6`, permanenter ChevronUp-Hinweis
- `<main>` `w-full max-w-lg` (Flex-Body `fit-content`-Fix)
- `overflow-x: clip` auf `html`/`body`; Stationsname `break-words hyphens-auto`
- Pan-Onboarding iOS: rAF-Ausblenden (Nachtrag zu #107)

**Dateien:** `app/components/raum-station-client.tsx`, `app/app/raum/[slug]/page.tsx`, `app/app/globals.css`, `app/components/raum-viewer/pan-onboarding-overlay.tsx`

### Akzeptanzkriterien

- [x] Initial nur Header-Zeile sichtbar; Beschreibung/Medien nach Hochwischen
- [x] `/raum/klassenzimmer` auf iPhone: kein horizontaler Überstand (Safari + Chrome)
- [x] iOS Chrome: Body-Scroll funktioniert
- [x] Tests + Build grün

---

## #106 — Scanner: Text bei System-Dark-Mode unsichtbar

**GitHub:** https://github.com/flxln/schulnavigator/issues/106

**Labels:** `tech` `design`  
**Assignee:** Felix  
**Milestone:** Phase 5 — Post-Fest

**Problem:** Auf Geräten mit aktivem System-Dark-Mode war die Scanner-UI (`/scan`, `/eintritt/scan`) teils unlesbar — helle Schrift auf schwarzem Hintergrund wurde vom Browser zu dunkler Schrift korrigiert.

**Lösung:**

- `color-scheme: light` auf `html` (`globals.css`)
- `sn-scan-shell` mit `color-scheme: dark` auf `ScanFullscreenShell`
- Explizite `text-white`-Klassen im Scanner-Chrome; `themeColor` Papierfarbe in `layout.tsx`
- Manuelle Test-Checkliste in `anleitungen/lokal-testen-und-anschauen.md`

**Dateien:** `app/app/globals.css`, `app/app/layout.tsx`, `app/app/sn-theme.css`, `app/components/scan/*`, `app/components/ui/top-bar.tsx`, `app/components/eintritt/eintritt-scan-screen.tsx`

### Akzeptanzkriterien

- [x] TopBar, Hinweise, Buttons und Status auf `/scan` und `/eintritt/scan` bei OS-Dark-Mode lesbar (hell auf schwarz)
- [x] Rest der App bleibt Papier-Look ohne unerwartetes Auto-Darkening

---

## Epic #132 — Zugangsmodus konfigurierbar (ADR-021)

**GitHub:** https://github.com/flxln/schulnavigator/issues/132  
**Epic-Doku:** [epic-zugangsmodus-konfigurierbar.md](epic-zugangsmodus-konfigurierbar.md)  
**Plan:** [`.cursor/plans/adr-021_zugangsmodus_c30df8a5.plan.md`](../../.cursor/plans/adr-021_zugangsmodus_c30df8a5.plan.md)  
**Branch:** `feat/adr-021-zugangsmodus`  
**PR:** [#140](https://github.com/flxln/schulnavigator/pull/140) — umgesetzt, offen

**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 5 — Post-Fest  
**Folge zu:** #23 (ADR-007)

Konfigurierbarer Zugangsmodus (`SN_ACCESS_MODE`: `gated`|`open`), Tokens aus ENV (`SN_ACCESS_TOKENS`), CSP `frame-ancestors` für Website-Einbettung (`SN_EMBED_ANCESTORS`). Pilot bleibt `gated`.

### Unterissues (alle umgesetzt in PR #140)

| Nr. | Titel | GitHub |
|-----|-------|--------|
| #133 | access-config + access-tokens | https://github.com/flxln/schulnavigator/issues/133 |
| #134 | Middleware + Dialog-API | https://github.com/flxln/schulnavigator/issues/134 |
| #135 | CSP frame-ancestors | https://github.com/flxln/schulnavigator/issues/135 |
| #136 | Build-/Runtime-Validierung + Docker-Entrypoint | https://github.com/flxln/schulnavigator/issues/136 |
| #137 | Token-Rotation + QR-Sync | https://github.com/flxln/schulnavigator/issues/137 |
| #138 | Tests ADR-021 | https://github.com/flxln/schulnavigator/issues/138 |
| #139 | Entwickler-Doku | https://github.com/flxln/schulnavigator/issues/139 |
