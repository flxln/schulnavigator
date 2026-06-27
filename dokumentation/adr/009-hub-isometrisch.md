# ADR-009 — Startseite: isometrischer Schulhaus-Hub (GS39 UI)

**Datum:** 2026-05-27  
**Status:** ersetzt durch [ADR-016](./016-hub-frontansicht-39gs.md) (Hub-Darstellung; Nachträge zu `fest`/CTAs bleiben über ADR-016 gültig)

## Kontext

Issue **#14** (Phase 1) etablierte einen **Puzzle-SVG-Hub** (`viewBox` 400×600, `puzzleSegmentId` pro Station) mit Freischaltung in **#21** / **#23** (Modus `fest`/`heft`, `visitedSlugs` in `localStorage`).

Das Auftraggeber-Design **„Virtueller Schulrundgang“** ([`auftraggeber/Virtueller Schulrundgang/`](../../auftraggeber/Virtueller%20Schulrundgang/)) definiert eine andere Hub-Darstellung: **isometrisches Schulhaus** mit 11 klickbaren Bereichen (9 Fenster auf der Hauptfassade, Turnhalle, Garten), GS39-Chrome (Brush-Typo, Fortschrittskarte, Dekoration) und zusätzlich die Route **`/stationen`** (Stationsliste).

Phase 2 verlangt eine **fertige App-Shell**, die dem Endprodukt entspricht ([`projektplan.md`](../archiv/projektplan.md)). Tokens und Raum-Viewer (#55/#56) sind umgesetzt; die **sichtbare** Jubiläums-UI fehlte bisher.

**Unverändert bleiben** (eigene ADRs): Gyro-Raum-Viewer ([ADR-006](./006-raum-viewer-gyro-hotspots.md)), Zugang per Token/Cookie ([ADR-005](./005-zugangskontrolle-token.md), [ADR-007](./007-zugangskontrolle-cookie.md), [ADR-008](./008-eintritt-in-app-scanner.md)), Besuchs-Stempel (`sn_visited_slugs`, #21).

## Entscheidung

### Hub-Darstellung

- Die **Startseite `/`** nutzt ein **isometrisches Schulhaus-SVG** (portiert aus `schoolhouse.jsx`, `viewBox` 800×520), nicht mehr das Puzzle-`SchoolhouseSvg`.
- **11 Produktions-Stationen** aus [`app/data/stations.json`](../../app/data/stations.json) werden in [`app/lib/schoolhouse-isometric-map.ts`](../../app/lib/schoolhouse-isometric-map.ts) auf SVG-Slots gemappt:
  - `room`: `top-left` … `ground-right` (Hauptgebäude), `gym` (Turnhalle), `garden` (Außenbereich)
  - pro Slug: `nr` (1–11), `accent` (Hex-Literal für SVG, kein `color-mix()` in TSX-SVG)
- **`puzzleSegmentId`** entfällt im Datenmodell und in `stations.json` (harter Cut mit Hub-Umbau — `buildSchoolhouseSegments` wird entfernt).

### Freischaltung und Modi

- Logik **#21** / **#23** bleibt: `fest` = nur besuchte Stationen am Hub klickbar; `heft` = alle klickbar; Fortschritt über `visitedSlugs`.
- Steuerung erfolgt über **Slug + `room`-Map**, nicht über `puzzleSegmentId` / Segment-Overlays.

#### Nachtrag 2026-05-30 — `fest`: Freischaltung nur per Raum-QR (#83)

**Problem:** Der Hub-**Vorschlag** auf `/` navigierte gesperrte Stationen direkt nach `/raum/[slug]`. `StationVisitRecorder` schrieb beim bloßen Seitenaufruf sofort in `sn_visited_slugs` — im Modus `fest` galt damit „besucht“ = freigeschaltet **ohne** Scan am Türcode.

**Entscheidung:**

| Modus | Wann `sn_visited_slugs` wächst |
|-------|--------------------------------|
| `fest` | Nur nach **erfolgreichem** Raum-QR in `QrScanner` (`/scan`, `mode=room`) — `markVisitedSlug` vor Navigation |
| `heft` | Weiterhin beim Öffnen von `/raum/[slug]` via `StationVisitRecorder` |

**Navigation gesperrter Stationen:** Hub und Raum-Footer leiten zu **`/scan`**, nicht zu `/raum/…` — analog zur Sperre am Hub (`schoolhouse-hub.tsx`). Seit #104 ohne Anzeige eines konkreten Stationsnamens (siehe Nachtrag 2026-06-11).

**Hinweis:** Direkt-URL `/raum/[slug]` ohne vorherigen Scan bleibt technisch erreichbar (nur Entry-Cookie), markiert im `fest`-Modus aber **keinen** Stempel mehr — Hub bleibt gesperrt bis QR-Scan.

#### Nachtrag 2026-06-01 — Startseite: modusabhängige CTAs

**Problem:** Auf `/` wirkten Fortschrittskarte („Nächste Station“) und Primär-Button „QR an der Tür scannen“ im Modus `fest` redundant (beide → `/scan`). Im Modus `heft` war der Scan-Button überflüssig (Hub + `/stationen` decken Navigation ab).

**Entscheidung:**

| Modus | Zustand | CTA unter der Fortschrittskarte |
|-------|---------|----------------------------------|
| `fest` | 0/11 | Ein Scan-Button |
| `fest` | 1–10, nächste unbesuchte Station | **Ein** geteilter Primär-Button (links Empfehlung + Schloss, rechts „Beliebiger QR“) → `/scan` |
| `fest` | 11/11 | Kein Scan-CTA (Sparkle in der Karte bleibt) |
| `heft` | mit Fortschritt | Vorschlag **in** der Karte → `/raum/[slug]`; kein Scan auf `/` |
| `heft` | sonst | Hub + Listen-Icon `/stationen` |

**Technik:** `getHomeFooterCta` ([`app/lib/home-cta.ts`](../../app/lib/home-cta.ts)), geteilter Button [`home-fest-scan-cta.tsx`](../../app/components/home/home-fest-scan-cta.tsx), gemeinsame nächste Station [`getNextStation`](../../app/lib/next-station.ts) (Home + Footer; Footer überspringt besuchte Räume und den aktuellen Raum). Vor Hydration im `fest`: stabiler Einzel-Scan (`isHydrated` in der CTA-Entscheidung).

Issue: **#84** (Sub-Issue zu **#83**, Kontext **#61**) — https://github.com/flxln/schulnavigator/issues/84 — siehe [issues-phase-2.md](../planung/archiv/issues-phase-2.md).

#### Nachtrag 2026-06-11 — Scan-CTA ohne Stationsvorschlag (#104)

**Problem:** Geteilter Fest-Button und Raum-Footer mit Stationsnamen („Weiter zu Turnhalle“, „Nächste Station | Beliebiger QR“) wirkten unübersichtlich; Heft-Vorschlag in der Fortschrittskarte widersprach dem Wunsch, keine konkrete Station zu empfehlen.

**Entscheidung:**

| Ort | Verhalten |
|-----|-----------|
| `/` `fest` 0/11 | Ein Scan-Button „QR an der Tür scannen“ |
| `/` `fest`/`heft` 1–10 | Ein Button „Scanne die nächste Station!“ → `/scan` (`scan-next`) |
| `/` `fest`/`heft` 11/11 | Kein Scan-CTA unter dem Hub |
| Fortschrittskarte `/` | Tipp öffnet `/stationen` (wie Listen-Icon) |
| Raum-Footer | Nur „Scanne die nächste Station!“ → `/scan`, wenn noch unbesuchte Stationen existieren |

**Technik:** `getHomeFooterCta` liefert `fest-scan` | `scan-next` | `none`. [`home-fest-scan-cta.tsx`](../../app/components/home/home-fest-scan-cta.tsx) und [`next-station-footer.tsx`](../../app/components/raum/next-station-footer.tsx) nutzen denselben Button. `getNextStation` nur noch zur Sichtbarkeitsentscheidung (nicht zur Anzeige). `next-station-row.tsx` entfernt.

Issue: **#104** (Folge **#84**) — https://github.com/flxln/schulnavigator/issues/104

#### Nachtrag 2026-06-25 — Einheitlicher Scan-Button-Text (`kunde/39-gs`)

**Entscheidung:** Primär-Scan-CTA auf `/`, `/stationen` (`fest`) und im Raum-Footer heißt überall **„Scanne einen beliebigen Code“** (statt abweichend „QR an der Tür scannen“ / „Scanne die nächste Station!“). Logik `fest-scan` | `scan-next` | `none` unverändert; nur Label vereinheitlicht.

| Ort | Verhalten |
|-----|-----------|
| `/` `fest` 0/11 | Ein Scan-Button „Scanne einen beliebigen Code“ (`fest-scan`) |
| `/` `fest`/`heft` 1–10 | Derselbe Button-Text (`scan-next`) |
| `/stationen` (`fest`) | Gleicher Button-Text |
| Raum-Footer | Gleicher Button-Text, wenn noch unbesuchte Stationen |

### Interaktion und Barrierefreiheit

- Klicks primär **im SVG** (`onClick` pro Fenster/Bereich), mit **`tabIndex={0}`**, **`role="button"`**, **`onKeyDown`** (Enter/Space).
- Transparente Hit-Areas mindestens **44×44** viewBox-Einheiten pro Slot.
- [`schoolhouse-sr-nav.tsx`](../../app/components/schoolhouse/schoolhouse-sr-nav.tsx) bleibt als **versteckte `<Link>`-Liste** für Screenreader; kein Ersatz für Tastatur-Fokus im SVG.
- Navigation zu `/raum/[slug]` per `router.push`; `router.prefetch` wo sinnvoll.

### GS39 UI (Epic #58)

- Design-Quelle: Ordner **Virtueller Schulrundgang** (`screens.jsx`, `app-styles.css`); Tokens weiter [`gs39-tokens.css`](../../app/app/gs39-tokens.css).
- Weitere Screens (ohne Hub-Logik zu ändern): Eintritt, Scan-Chrome, Raum-Seiten-Chrome um bestehenden `RaumViewer`, neue Route **`/stationen`**.
- Brand-Assets unter **`app/public/brand/`** (Docker-Build-Kontext); Submodule nur als Quelle — siehe [build-kontext-submodule-regeln.md](../build-kontext-submodule-regeln.md).

### Offene Abstimmung

- Zuordnung **`ground-mid`** (Eingangstür im SVG) zu genau einem Schul-Slug — mit Schule klären, bevor `schoolhouse-isometric-map.ts` final eingefroren wird.

## Begründung

- Entspricht dem genehmigten Design-Konzept und dem Schulfest-Auftritt (Jubiläum 2026, GS39).
- Puzzle-Hub war technischer Platzhalter (#14); isometrisches Haus ist die vereinbarte Nutzer-Metapher („Fenster aufleuchten“).
- Trennung: **Hub = Navigation/Fortschritt**; **Raum = Gyro-Viewer** (ADR-006) — keine Vermischung der Interaktionsmodelle.

## Verworfene Alternativen

- **Puzzle-Hub behalten, nur Farben/Typo anpassen:** weicht vom Design-Konzept ab; Doppelpflege Puzzle-Geometrie + Map.
- **Isometrisches Haus nur als Deko, Puzzle weiter klickbar:** visuell inkonsistent, zwei Wahrheiten.
- **`puzzleSegmentId` parallel zur Map behalten:** redundante Fehlerquelle; harter Cut reduziert Komplexität.

## Konsequenzen

- **Issue #14** (Hub-Layout Puzzle): Darstellung **ersetzt durch ADR-009**; Segment-Geometrie und `schoolhouse-layout.ts` werden entfernt.
- **#21** bleibt gültig für `visitedSlugs`; Texte in Doku/Issues von „Puzzle-Segment“ auf „Hub-Slot / Fenster“ anpassen.
- **Epic #58** (Phase 2): Umsetzung in PRs (Governance → Assets/Theme → Hub atomar → Screens → Polish).
- **Doku:** `entscheidungen.md`, `architektur.md`, `projektplan.md`, `issues-phase-2.md`.
- **Tests:** Vitest für Map (11 Slugs, 11 unique rooms, ein `gym`, ein `garden`); Hub-Mode-Tests neu gegen Slugs.
- **Risiko:** PR mit Hub-Umbau ist **atomar** — halbfertiger Stand bricht Build (`buildSchoolhouseSegments` entfällt).

## Bezug

- Design: [`auftraggeber/Virtueller Schulrundgang/Schulnavigator.html`](../../auftraggeber/Virtueller%20Schulrundgang/Schulnavigator.html)
- Ausführungsreihenfolge: [`dokumentation/archiv/projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md`](../archiv/projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md)
