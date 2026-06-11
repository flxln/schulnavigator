# ADR-016 — Startseite: Frontansicht GS39 als Schulhaus-Hub

**Datum:** 2026-06-10  
**Status:** entschieden  
**Ersetzt:** [ADR-009](./009-hub-isometrisch.md) (Hub-Darstellung und Slot-Geometrie)  
**Ergänzt:** Freischaltung, Modi, CTAs und A11y aus ADR-009 (Nachträge #83, #84) bleiben gültig

## Kontext

[ADR-009](./009-hub-isometrisch.md) etablierte einen **isometrischen** Schulhaus-Hub (`viewBox` 800×520). Für den Schulfest-Auftritt liegt eine **Frontansicht der 39. GS** vor (vektorisierte Outline, Content-Rahmen in Illustrator).

**Design-Quelle (Submodule):** `auftraggeber/material/bilder/outline-39gs-frontansicht*.svg` — Laufzeit-Kopie unter `app/scripts/reference/` und `app/public/brand/hub/` ([build-kontext-submodule-regeln.md](../build-kontext-submodule-regeln.md)).

**Unverändert:** Gyro-Raum-Viewer ([ADR-006](./006-raum-viewer-gyro-hotspots.md)), Zugang ([ADR-005](./005-zugangskontrolle-token.md), [ADR-007](./007-zugangskontrolle-cookie.md), [ADR-008](./008-eintritt-in-app-scanner.md)), Besuchs-Stempel (#21), modusabhängige CTAs (#84).

## Entscheidung

### Hub-Darstellung

- Startseite `/` nutzt **Frontansicht GS39** (SVG-Outline + Slot-Overlays), nicht mehr das isometrische Haus.
- Laufzeit-Asset: `app/public/brand/hub/gs39-front-outline.svg` (nur Outline-Ebene).
- Komponente `FrontSchoolhouse`; Shell `schoolhouse-hub.tsx` bleibt.
- Container-Aspect: `1087/1454` (`viewBox` `0 0 1086.5 1453.9`).

### Slot-Map

- 11 Stationen in `app/lib/schoolhouse-hub-map.ts` → Rechteck `[x,y,w,h]`, `slotId`, `nr`, `accent`.
- **Portal = klassenzimmer** (Haupteingang); 10 Fenster-Slots für die übrigen Stationen; 4 Plätze **Deko** (nicht klickbar): Dach-Banner, Vestibül, zwei Flügel-Fenster.
- Slot-Frames sind an die viewBox-Revision gekoppelt; `prepare-hub-outline.mjs` asserted den viewBox.

### Interaktion

Übernommen aus ADR-009: `fest`/`heft`, Toast bei Sperre, SVG `role="button"`, SR-Nav, Prefetch. Touch-Targets: `expandHitRect` mit **Kollisions-Klemmung** an Nachbarn (enge Mittelfenster-Paare < 44 CSS-px bewusst).

### Entfallendes

`IsometricSchoolhouse`, `schoolhouse-isometric-map.ts` nach Umsetzung.

## Begründung

- Wiedererkennbarkeit des echten Schulgebäudes.
- Hub-Logik bleibt slug-basiert; nur Darstellung und Koordinaten wechseln.
- Asset-Pipeline nur unter `app/` für Docker/Coolify.

## Verworfene Alternativen

- Isometrie behalten + Frontansicht als Deko.
- `hubStyle`-Feature-Flag (Dual-Pflege).
- 15 Stationen statt 11.

## Konsequenzen

- Doku-Sync; Vitest für Map und Hit-Rects.
- Rollback: Git-Tag `pre-adr-016` vor Merge.
- Offen mit Schule: finale Fenster-Zuordnung (Vorschlag 2026-06-10 in Map kommentiert).

### Nachtrag 2026-06-10 — Startseiten-Layout & Wordmark (#103)

Nach dem Hub-Umbau auf Frontansicht: Layout und Markenzeile an Schulkontext und schmalere Viewports angepasst.

**Layout (`home-screen.tsx`):**

- Brush-Headline („Entdecke unsere Schule“) in **eigener** Creme-Karte mit `px-4`.
- **Hub-Block** darunter: `w-full`, **ohne** horizontales Padding → nutzt die volle `main`-Breite (~480 px bei `max-w-lg`), Höhe skaliert mit Aspect `1087/1454`.
- Modus-Hinweis (`Schulstartheft · …` / `Schulfest · …`) **unter** der Jubiläumszeile, nicht mehr in der Kopfzeile.
- Untertitel „Tippen Sie auf einen Raum …“ entfällt.

**Wordmark (Home + Eintritt-Chip):**

| Ort | Anzeige |
|-----|---------|
| Home Kopfzeile | `Gs39ChipMark` (**39.** weiß) + **Grundschule Dresden-Plauen** (`text-[19px]`, #104 Folge #103) |
| Eintritt Chip | gleiches `Gs39ChipMark`; Titel bleibt „Schulnavigator“, Unterzeile **39. Grundschule Dresden-Plauen** |

Komponente: [`app/components/ui/gs39-chip-mark.tsx`](../../app/components/ui/gs39-chip-mark.tsx) — Schriftzug `39.` in `font-display`, Farbe weiß auf Navy-Chip (`!w-auto min-w-10 px-1.5`).

Issue: **#103** — https://github.com/flxln/schulnavigator/issues/103

## Bezug

- Quelle: `app/scripts/reference/outline-39gs-frontansicht.svg`
- Vorgänger: [ADR-009](./009-hub-isometrisch.md)
