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

## Bezug

- Quelle: `app/scripts/reference/outline-39gs-frontansicht.svg`
- Vorgänger: [ADR-009](./009-hub-isometrisch.md)
