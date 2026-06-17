# Schulnavigator — Architektur

_Stand: 2026-06-11 (**#111:** Card-Peek Raumseiten + iOS-Breitenfix; **#107:** Swipe-Onboarding; **#93:** TextViewer; **#72:** Raum-UI; **#55/#56:** Raum-Viewer; Live #16) — siehe [entscheidungen.md](./entscheidungen.md)_

## Tech-Stack

| Bereich             | MVP (bis 26.06.)                                  | Langfristig                      | ADR                                           |
| ------------------- | ------------------------------------------------- | -------------------------------- | --------------------------------------------- |
| Frontend            | Next.js (App Router), TypeScript strict, Tailwind | gleich                           | [002](./adr/002-frontend-nextjs.md)           |
| Content             | JSON + Medien im Repo                             | **Directus** (self-hosted)       | [003](./adr/003-content-mvp-json-directus.md) |
| Hosting             | MPZ-Hetzner via Coolify                           | gleich                           | [001](./adr/001-hosting-coolify.md)           |
| Containerisierung   | Docker                                            | gleich                           | [001](./adr/001-hosting-coolify.md)           |
| Custom-Admin        | —                                                 | **verworfen** (Directus)         | [003](./adr/003-content-mvp-json-directus.md) |
| QR-Code-Generierung | `npm run generate:qr`, `rotate:access-tokens` (#141) | gleich | — |
| Video-Hosting       | MPZ-Server (Upload)                               | YouTube-Embed nach Rechtsklärung | [004](./adr/004-video-hosting-mpz.md)         |
| Zugangskontrolle    | Entry-Token, Cookie `sn_access` + Middleware, Modi `fest`/`heft` | gleich                           | [005](./adr/005-zugangskontrolle-token.md), [007](./adr/007-zugangskontrolle-cookie.md) |
| Navigation          | In-App-Scanner Entry (`/eintritt/scan`) + Räume (`/scan`) | gleich                      | [005](./adr/005-zugangskontrolle-token.md), [008](./adr/008-eintritt-in-app-scanner.md) |
| Raum-Viewer         | Gyro-Pan, Hotspots, Tap-Fallback; normales Foto   | gleich                           | [006](./adr/006-raum-viewer-gyro-hotspots.md) |
| UI / Schul-Theme    | GS39-Tokens + Jubiläums-UI (Epic #58)             | pro Schule eigenes Token-Sheet   | [ADR-009](./adr/009-hub-isometrisch.md), Auftraggeber-CSS |
| Startseite-Hub      | Frontansicht GS39 (SVG-Outline, Slot-Map)         | gleich                           | [ADR-016](./adr/016-hub-frontansicht-39gs.md) |
| Responsive / Tablet | `.sn-page-container` (`max-w-lg` → `md:2xl` → `lg:3xl`) | gleich                           | [ADR-012](./adr/012-tablet-ipad-responsive-layout.md), Epic [#74–#78](./github-project/epic-tablet-ipad-layout.md) |

## Responsive & Tablet (ADR-012, umgesetzt 2026-06-14)

### Breakpoints

| Klasse | min-Breite | Content-Breite | Zielgerät |
|--------|------------|----------------|-----------|
| (default) | 0 | `max-w-lg` (~512 px) | Phone Portrait (Baseline: 375 px) |
| `md:` | 768 px | `max-w-2xl` (~672 px) | iPad Mini Portrait |
| `lg:` | 1024 px | `max-w-3xl` (768 px) | iPad Landscape / iPad Pro |

Utility: `.sn-page-container` in [`globals.css`](../app/app/globals.css). Scan-Routen (`/scan`, `/eintritt/scan`): `w-full max-w-none` (schwarze Vollfläche).

### Hero-Strategie

| Element | Phone + Tablet |
|---------|----------------|
| `RAUM_HERO_HEIGHT_CLASS` | `h-[calc(100svh-6.5rem)]` — **kein** `md:`-Cap (Card-Peek, weniger vertikaler Crop als Hero-Deckelung) |
| TopBar `/raum/[slug]` | `absolute inset-x-0 top-0 z-[30]` im Hero, Safe-Area-Padding |
| Nicht-Hero-Viewer | `.sn-viewer-fallback-height` / `.sn-viewer-fallback-min-height` — Phone `min(50vh,360px)`, Tablet `min(50vh,460px)` |
| Medien-Hotspot-Icons | `iconSize × effectiveDisplayH`, auf Tablet (`layoutViewportWidth ≥ 520 px`) Referenzhöhe = Phone-QA-Hero (~563 px); Flat + Sphere via `mediaIconSizingReferenceHeight()` in [`hotspot-marker.ts`](../app/lib/hotspot-marker.ts) |
| Gyro nach Wischen | Sphere: PSV-Gyro nach Ein-Finger-Pan neu starten (Folge #116/#74); Flat: nur-Höhe-Resize debounced (200 ms), damit Card-Peek-`svh` die Neutral-Kalibrierung nicht dauerhaft zurücksetzt |
| Coach-Overlay (ADR-019) | Portal an `body`, Backdrop fullscreen; Inhalt in `.sn-page-container` (gleiche Spalte wie Seite; Folge #74) |

### Medien-Panel

- Phone: Bottom-Sheet (`fixed inset-x-0 bottom-0`)
- `md:` und darüber: zentriertes Modal (`max-w-2xl`), ESC + Fokus auf ×

### Hub-Touch-Targets

`expandHitRect` in [`schoolhouse-hub-hit.ts`](../app/lib/schoolhouse-hub-hit.ts) garantiert **44 CSS-px** (Frontansicht-Hub, ADR-016).

**Pinch-Zoom gesperrt** projektweit ([#96](https://github.com/flxln/schulnavigator/issues/96)): Viewport `userScalable: false` + [`DisableZoom`](../app/components/ui/disable-zoom.tsx).

## UI & Theme (GS39, Issue #55 / Epic #58)

**Design-Konzept (Umsetzung):** [`auftraggeber/Virtueller Schulrundgang/`](../auftraggeber/Virtueller%20Schulrundgang/) — [ADR-009](./adr/009-hub-isometrisch.md). Brand-Assets zur Laufzeit: [`app/public/brand/`](../app/public/brand/) (Kopie aus Submodule/Design-Paket).

- **Source of Truth (Design):** [`auftraggeber/material/UI-Vorschläge/colors_and_type.css`](../auftraggeber/material/UI-Vorschläge/colors_and_type.css) — Auftraggeber-Submodule, nicht im Docker-Kontext. Regeln für Agenten: [build-kontext-submodule-regeln.md](./build-kontext-submodule-regeln.md).
- **App-Kopie:** [`app/app/gs39-tokens.css`](../app/app/gs39-tokens.css) — `:root`-Variablen; in [`globals.css`](../app/app/globals.css) per `@import` und `@theme inline` als semantische Tailwind-Farben (`bg-1`, `fg-1`, `accent`, …).
- **Schul-ID (MVP):** [`app/lib/school-theme.ts`](../app/lib/school-theme.ts) — `SCHOOL_ID = 'gs39'`; Komponenten nutzen semantische Klassen, keine direkten `--brand-*` in TSX. Mehrere Schulen später: anderes Token-Sheet pro Mandant (ADR-003).
- **Dark Mode:** bewusst deaktiviert (Papier-Look). `color-scheme: light` auf `html` verhindert Browser-Auto-Darkening bei OS-Dark-Mode; Scanner-Vollbild (`sn-scan-shell`) setzt lokal `color-scheme: dark` für den bewusst dunklen Kamera-Chrome.
- **Build-Check:** `npm run validate:tokens` vergleicht App-Tokens mit der Referenz (`colors_and_type.css` lokal bzw. [`app/scripts/reference/colors_and_type.css`](../app/scripts/reference/colors_and_type.css) im Docker-Build). Wird von `npm run build` mitaufgerufen.
- **Display/Script-Fonts (#58):** Caveat Brush, Caveat via `next/font` — ergänzt Nunito; App-Klassen in [`sn-theme.css`](../app/app/sn-theme.css).

## Startseite-Hub (ADR-016, umgesetzt)

| Aspekt | Details |
|--------|---------|
| Komponente | `FrontSchoolhouse` — Outline `public/brand/hub/gs39-front-outline.svg`, `viewBox` 1086.5×1453.9 |
| Zuordnung | `lib/schoolhouse-hub-map.ts`: 11 Slugs → `slotId`, Rechteck, `nr`, `accent`; Portal = klassenzimmer |
| Stationssymbole | `lib/station-icons.ts` + `StationIcon`: Lucide pro Slug (#105); unbesucht gedämpft, besucht akzentfarbig; `nr` nur intern / SR |
| Besuchtes Glas | `visitedGlassFill` als `rgba` (α 0,28) — Fensterfläche durchscheinend getönt, Rahmen in `accent` (#105 Nachtrag) |
| Hub-Chips | `STATION_CHIP` in `FrontSchoolhouse`: größere Symbol-Kreise (`r` 24) und Häkchen-Chips (`r` 25) (#105 Nachtrag) |
| Freischaltung | wie #21/#23 über `visitedSlugs`; `fest` = nur besuchte Slots klickbar; Stempel nur per Raum-QR (#83, [ADR-009 Nachtrag](./adr/009-hub-isometrisch.md#nachtrag-2026-05-30--fest-freischaltung-nur-per-raum-qr-83)) |
| Touch | `expandHitRect` mit Nachbar-Klemmung (`schoolhouse-hub-hit.ts`) |
| A11y | SVG `role="button"` + SR-Nav (`schoolhouse-sr-nav`) |
| Offen | Fenster-Zuordnung mit Schule feinjustieren (Vorschlag 2026-06-10 in Map) |
| Layout | Headline und Hub getrennt; Hub **volle `main`-Breite** ohne seitliches Padding ([ADR-016 Nachtrag](./adr/016-hub-frontansicht-39gs.md#nachtrag-2026-06-10--startseiten-layout--wordmark-103), #103) |
| Wordmark | `Gs39ChipMark` (39. weiß) + „Grundschule Dresden-Plauen“ auf `/`; Eintritt-Chip gleich, Titel dort „Schulnavigator“ |

## Raum-Viewer (Implementierung, Issue #55)

Komponenten unter [`app/components/raum-viewer/`](../app/components/raum-viewer/) und Mathematik in [`app/lib/raum-viewer/`](../app/lib/raum-viewer/). **Alle 11 Stationen:** [`RaumStationClient`](../app/components/raum-station-client.tsx) auf `/raum/[slug]` — Hero `calc(100svh - 6.5rem)`, Card-Peek unten (#111: Überschrift sichtbar, Rest per Body-Scroll), Gyro-`RaumViewer` (`layout="hero"`), TopBar, tappbarer Stations-Chip (#72), Dialog nur `daz`/`pc-raum` (#71). `<main>`: `w-full max-w-lg` — verhindert `fit-content`-Überbreite im Flex-Body bei langen Titeln (iOS).

| Verhalten | Details |
| --------- | ------- |
| Gyro-Pan | Höhenbasiert, horizontal `translateX`; Auto-Zoom bis `MIN_PAN_DISPLAY_RATIO` (2); **Portrait:** stabiler **Yaw aus α/β/γ** (`headingFromOrientation`, Armschwenk, zweiseitig, Neutral in Bildmitte) — **nicht** mehr rohes `alpha`, das bei β≈90° (Handy aufrecht) durch Euler-Gimbal-Lock zittert; der Matrix-Yaw kürzt dieses α↔γ-Zittern heraus (bei β=90° gilt `yaw = α+γ`). **Gimbal-Zone** (|β−90°| < 10°): gamma-Fallback mit **Post-Settle Re-Anchor** (150 ms, #85); asymmetrisches Freeze beim Moduswechsel. **Landscape:** `gamma` (Kippen, einseitig); EMA-Glättung; iOS nach Nutzer-Geste |
| Neutral | ~500 ms Mittelwert; nach **Wischen** Re-Kalibrierung (`neutralAngleForPan`); bei **Resize** und **orientationchange** Neu-Kalibrierung; ohne Kompass kann der Yaw langsam driften → **Stations-Chip** tippen (alle `/raum/[slug]` mit Hero) |
| Hotspots | JSON 0–1; bei vertikalem Beschnitt können extreme **y** unsichtbar sein — Build-Warnung in `validate:stations`, Runtime-`console.warn` |
| UI | `touch-action: none` + CSS-Containment auf dem Viewer; Hero: **Zentrieren** über tappbaren **Stations-Chip** (nicht mehr floating); Default-Layout: Button **Ansicht zentrieren** unter dem Viewer; `?debug=1` für HUD |
| TopBar (Raum) | `TopBar` mit `onBack`, optionalem `leftExtra` (z. B. Dialog-Ende **X** 38×38) und `right`; rechte Slot-Breite spiegelt links (`lib/ui/top-bar-layout.ts`) |
| Recenter-API | `RaumViewerHandle.recenterView()` — intern `RoomImagePane`; **nicht** aus `raum-viewer/index.ts` als Pane exportiert (#72) |
| Startblick / Startpan | Optional `startYaw`/`startPitch` (Sphere, [ADR-023](./adr/023-sphere-startblick.md), #152 umgesetzt) bzw. `startPanX` (Flat, [ADR-024](./adr/024-flat-startpan.md), #154); fehlen → Default 0/0 bzw. heutiges Flat-Verhalten |
| Fallback | Wischen, Tap; Banner wenn Orientierung fehlt; `sessionStorage`-Merker iOS + 2s-Watchdog bei fehlenden Events |
| Onboarding (#107) | Einmaliges Overlay „Links oder rechts wischen“ (`PanOnboardingOverlay`); `localStorage` `schulnav.pan-onboarding.seen`; auf iOS erst nach Gyro-Berechtigung |
| Ohne `bild` | Statisches Layout + Medienliste ([ADR-006](./adr/006-raum-viewer-gyro-hotspots.md)) |
| Demo | `/raum/klassenzimmer` (4 Hotspots, 4 Medientypen inkl. Markdown-Text inline, echte Dateien unter `/media/klassenzimmer/`); `/raum/musik` (2 Hotspots, 4 Medientypen, Platzhalter `/demo/`); `/raum/daz`, `/raum/pc-raum` (Maskottchen-Dialog-Hotspots, [ADR-011](./adr/011-dialog-mascot-hotspots.md), Audio [ADR-010](./adr/010-dialog-cutscene-gated-audio.md)) — Gyro/Dialog auf iPhone nur unter **HTTPS**; Eintritt zuerst `/eintritt?t=fest-2026` |

**Raumbilder (#17 / #27):** **8/11** Stationen mit Panorama 3:1 in `public/stations/` (Juni 2026, Git LFS); `kunst`/`hort` noch 4:3; `schulsozialarbeit` ohne `bild`. **Panorama** (≥ **2,5 : 1**, min. 2400 px Breite) bleibt ideal. Die App **zoomt** schmalere Bilder automatisch so, dass horizontal mindestens **`MIN_PAN_DISPLAY_RATIO` (2)** erreicht wird (`roomPanZoom`) — dabei entsteht **vertikaler Beschnitt**. Hotspot-**`x`**: Quellbild (0–1); **`y`**: sichtbarer Ausschnitt (0 oben, 1 unten), siehe [ADR-014](./adr/014-mascot-size-json.md) und `content-einpflegen.md`. Konstanten: `lib/raum-viewer/constants.ts`, Geometrie: `room-pan-zoom.ts`, `clip-zone.ts`. Briefing: [`zuordnung-stationen-bilder.md`](../auftraggeber/material/stationen/zuordnung-stationen-bilder.md). **Viewport / Zoom-Sperre:** [`app/app/layout.tsx`](../app/app/layout.tsx) — `viewport` (`device-width`, `userScalable: false`, `maximumScale: 1`); `body` `touch-action: manipulation` (Doppel-Tipp); [`DisableZoom`](../app/components/ui/disable-zoom.tsx) im Root-Layout blockiert Pinch auf iOS (`touchmove` mit >1 Finger, `gesturestart`, jeweils `passive: false`).

## Medien-Player (Issues #18–#20, umgesetzt)

Hotspot oder Medienliste → [`StationMediaPanel`](../app/components/station-media-panel.tsx) → [`MediaPlayerByTyp`](../app/components/media-player-by-typ.tsx) (dünner Router). **Live (ADR-017):** Hotspot-Icons, `typ: link` (externer Tab), `typ: embed` (iframe Delightex, Allowlist + CSP; auf Touch kein iframe → Fallback-Panel #109) — [ADR-017](./adr/017-externe-medien-hotspot-marker.md).

| `typ` | Komponente | Verhalten |
| ----- | ---------- | --------- |
| `audio` | [`AudioPlayer`](../app/components/media/audio-player.tsx) | Custom Controls (Play/Pause, Fortschritt, Lautstärke), GS39 (`sn-media-audio*`); `pause()` im Unmount-Cleanup |
| `video` | [`VideoPlayer`](../app/components/media/video-player.tsx) | Modus nach **`videoSource`** (führend): `upload` + MP4 → `<video controls playsInline>`; `upload` + Bild → Poster-only; `youtube` → Hinweistext (MVP inaktiv, [ADR-004](./adr/004-video-hosting-mpz.md)) |
| `foto` | [`PhotoViewer`](../app/components/media/photo-viewer.tsx) | Inline `<img>` (bewusst kein `next/image` — dynamische JSON-URLs); Expand-in-place-Vollbild innerhalb des Panels; kein Swipe-Set (Phase 3) |
| `text` | [`TextViewer`](../app/components/media/text-viewer.tsx) (lazy via `dynamic()`) | `fetch` same-origin `.md`/`.txt`; Markdown (`react-markdown` + `remark-gfm`) oder Plaintext (`pre-wrap`); Redirect-/Content-Type-Guard; GS39 `.sn-media-text*` |
| `link` | [`LinkViewer`](../app/components/media/link-viewer.tsx) | Hinweis „App verlassen“; synchrones `window.open` bei Tap; Button „Im Browser öffnen“ ([ADR-017](./adr/017-externe-medien-hotspot-marker.md) Stufe 2) |
| `embed` | [`EmbedViewer`](../app/components/media/embed-viewer.tsx) | iframe im Panel (Desktop); Delightex-Fallback auf Touch; Feature-Flag `NEXT_PUBLIC_EMBED_ENABLED`; Allowlist `delightex.com` ([ADR-017](./adr/017-externe-medien-hotspot-marker.md) Stufe 3) |

**Video-Datenvertrag** (`videoSource` führend, Endung nur Fallback bei `upload`):

| Modus | `videoSource` | `quelle` | `poster?` |
| ----- | ------------- | -------- | --------- |
| Upload-Video | `upload` | Pfad `.mp4`/`.webm`/`.mov` | optional Vorschaubild |
| Poster-only (noch kein MP4) | `upload` | Pfad auf Poster-Bild | leer — `quelle` ist das Poster |
| YouTube (inaktiv) | `youtube` | bare Video-ID (kein `/`) | n/a |

`poster` nur bei `typ === 'video'` (Validator-Guard). Dialog-Audio ([ADR-010](./adr/010-dialog-cutscene-gated-audio.md), [ADR-011](./adr/011-dialog-mascot-hotspots.md)) bleibt getrennt von #18.

## URL-Schema

```
/
/eintritt
/eintritt/scan
/scan
/stationen
/raum/[slug]
/api/dialog/[slug]/[clip]
```

- **`/`** — Startseite mit **Frontansicht**-Hub ([ADR-016](./adr/016-hub-frontansicht-39gs.md)); Modus aus Cookie: `heft` = alle Stationen, `fest` = nur besuchte Slots klickbar (#21). **CTAs** modusabhängig ([ADR-009 Nachtrag CTAs](./adr/009-hub-isometrisch.md#nachtrag-2026-06-01--startseite-modusabhängige-ctas), [Nachtrag #104](./adr/009-hub-isometrisch.md#nachtrag-2026-06-11--scan-cta-ohne-stationsvorschlag-104)): `fest` 0/11 = Einzel-Scan; `fest`/`heft` 1–10 = „Scanne die nächste Station!“; Fortschrittskarte → `/stationen`. Logik: `lib/home-cta.ts`, `lib/next-station.ts` (Sichtbarkeit). Wordmark/Layout: [ADR-016 Nachtrag](./adr/016-hub-frontansicht-39gs.md#nachtrag-2026-06-10--startseiten-layout--wordmark-103) (#103, Schriftgröße #104).
- **`/stationen`** — Stationsliste mit Raum-Icons (#105; Lock im Modus `fest`) — Epic #58.
- **`/eintritt`** — Entry-QR (`?t=…`) setzt Cookie und leitet auf `/` um; ohne gültigen Zugang **Hinweis-/Fehlerseite** (Willkommens-Karte verlinkt auf `/eintritt/scan`). Kein Inline-Scanner mehr (#57, #82, [ADR-008](./adr/008-eintritt-in-app-scanner.md)).
- **`/eintritt/scan`** — Vollbild-Entry-Scanner (gleiche Shell wie `/scan`, `ScanFullscreenShell`); `QrScanner` `mode="entry"` `chrome`; ohne Cookie erreichbar (Middleware-Whitelist). `parseEntryScan` prüft nur Struktur (Origin, Pfad `/eintritt`, `t` nicht leer); Gültigkeit nur Middleware.
- **`/scan`** — In-App-QR-Scanner für Raum-QRs (nur mit Cookie); dunkles Scan-Chrome mit gelbem Rahmen; `parseRoomScan` + Slug-Whitelist — [ADR-005](./adr/005-zugangskontrolle-token.md), [ADR-007](./adr/007-zugangskontrolle-cookie.md).
- **Fortschritt 11/11:** `SparkleBurst` auf der Startseite einmalig (`sn_sparkle_done` in `localStorage`, L6).
- **`/api/dialog/[slug]/[clip]`** — Dialog-Audio aus `content/dialog-audio/`; **403** ohne Cookie; **206** Range ([ADR-010](./adr/010-dialog-cutscene-gated-audio.md), #69).

**Zugang (Issue #23, Entry-Scanner #57, Route #82):** Token-Liste Production aus `SN_ACCESS_TOKENS` (ENV), Dev-Fallback [`app/lib/access-token-constants.mjs`](../app/lib/access-token-constants.mjs); Runtime [`app/lib/access-tokens.ts`](../app/lib/access-tokens.ts). Rotation: `npm run rotate:access-tokens` (#141). Middleware [`app/middleware.ts`](../app/middleware.ts) setzt/prüft Cookie `sn_access`. Entry-Treffer im Scanner: `location.replace` zu `/eintritt?t=…`. Cookie-frei ohne `?t=`: Whitelist `/eintritt`, `/eintritt/scan`. Weitere Ausnahmen: `/api/health`, `/_next/*`, `favicon.ico`, `robots.txt`.

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
  action?: "medium" | "dialog"; // default medium
  mediumId?: string; // bei medium
  icon?: string; // /public/…; Medien-Hotspot; [ADR-017]
  iconSize?: number; // 0.05–0.25, Anteil Referenzhöhe (Phone: effectiveDisplayH; Tablet: gekappt, siehe Responsive/Tablet)
  mascot?: "frieda" | "otto"; // bei dialog
  mascotSize?: number; // 0.05–1, Anteil effectiveDisplayH; [ADR-014]
  mascotFlipX?: boolean; // horizontal spiegeln; [ADR-014]
}

interface Medium {
  id: string;
  typ: "audio" | "video" | "foto" | "text" | "link" | "embed"; // link/embed live [ADR-017]
  quelle: string; // /public/… oder https:// bei link/embed
  videoSource?: "upload" | "youtube";
  poster?: string; // nur typ === "video" (upload); optional Vorschaubild
  thumbnail?: string; // optional, /public/…; Liste + Hotspot-Fallback [ADR-017]
  openIn?: "external"; // nur typ === "link"
  embedAllow?: string[]; // nur typ === "embed"; Domain-Suffixe
  untertitel?: string;
}

interface DialogBubbleLayout {
  y?: number; // 0–1, Anteil containerH (Hero-Box)
  x?: number; // 0–1; fehlt → ADR-013 Mitpan
  maxWidth?: number; // 0.3–1, Anteil containerW
  fontSize?: number; // 0.02–0.06, Anteil containerH
  followPan?: boolean; // Default true; [ADR-015]
}

interface DialogSegment {
  id: string;
  rolle: "frieda" | "otto" | "beide";
  quelle: string;
  text: string;
  gruppe?: string;
  tail?: "left" | "right" | "center"; // [ADR-015]
}

interface Dialog {
  figuren: ("frieda" | "otto")[];
  segmente: DialogSegment[];
  gruppen?: { id: string; text: string }[];
  bubble?: DialogBubbleLayout; // [ADR-015]
}

interface Station {
  slug: string;
  titel: string;
  beschreibung: string;
  bild?: string; // /public/stations/… — fehlt → statische Ansicht
  medien: Medium[];
  hotspots?: Hotspot[];
  dialog?: Dialog;
  // puzzleSegmentId entfällt mit ADR-009 — Hub-Zuordnung in schoolhouse-isometric-map.ts
}
```

Vollständige Ablagekonventionen (Pfade, Autorenzone, Laufzeit): [`content-verzeichnisstruktur.md`](./content-verzeichnisstruktur.md).

## Deployment

- **Produktion:** MPZ-Hetzner-Server, gemanagt über Coolify, deployed als Docker-Container ([`anleitungen/fuer-entwickler.md`](../anleitungen/fuer-entwickler.md) — Abschnitt „Coolify“).
- **Öffentliche URL:** `https://schulnavigator.mpz.schule` — erreichbar über MPZ-Wildcard-DNS **`*.mpz.schule`** → Coolify-VPS `217.154.120.240` (kein eigener A-Record nur für `schulnavigator` nötig).
- **Image:** [`app/Dockerfile`](../app/Dockerfile) — Multi-Stage, `output: 'standalone'`, Health `GET /api/health`, Container-Port **`PORT=3000`** (Coolify „Ports Exposes“ = `3000`).
- **Suchmaschinen:** `robots.txt` mit `Disallow: /` und `noindex` im Root-Layout (Issue #16); Verfeinerung in #23 möglich.
- **Coolify Prod:** Application `q1a8t4zswynvgutbw9og5l7n` — Projekt **Schulprojekte**, Branch `main`.
- **Staging / Dev:** `https://schulnavigator-dev.mpz.schule` — Application `jjgl5u105ucxjvbeuwflsjq4` (`schulnavigator:development-feature`), gleicher Server, Branch `main` (Feature-Branches bei Bedarf in Coolify umstellen).

### Voraussetzungen fürs Dockerfile

- Multi-stage Build empfohlen (Build-Stage + schlankes Runtime-Image)
- Port via Umgebungsvariable konfigurierbar (`PORT`)
- Health-Check-Endpunkt für Coolify: `/api/health`

## Client-Storage-Keys

Browser-seitige Persistenz (`localStorage` / `sessionStorage`) folgt einer festen Benennungskonvention:

| Präfix | Typ | Zweck | Beispiel |
|--------|-----|-------|---------|
| `schulnav.` | `localStorage` | Dauerhaftes UI-State pro Gerät/Browser | `schulnav.pan-onboarding.seen`, `schulnav.gyro.granted` |
| `sn_` | `localStorage` | Fachlicher Besuchsfortschritt (älterer Stil) | `sn_visited_slugs`, `sn_sparkle_done` |

**Neue Keys:** immer `schulnav.<domäne>.<zustand>` (Punkt-getrennt). Das `sn_*`-Präfix bleibt für bestehende Keys, wird aber nicht mehr vergeben.
