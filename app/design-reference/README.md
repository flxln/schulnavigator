# Design-Referenz — Virtueller Schulrundgang

Dieser Ordner dokumentiert die **Quelle** für die GS39-UI-Umsetzung (Issue #58). Er ist **kein** Laufzeit-Bestandteil der App und wird **nicht** ins Docker-Image kopiert (Build-Kontext nur `app/`).

## Source of Truth (Auftraggeber-Submodule)

Pfad im Repo-Root (eine Ebene über `app/`):

```
auftraggeber/Virtueller Schulrundgang/
├── Schulnavigator.html      # Klick-Prototyp (iOS/Android-Canvas)
├── screens.jsx                # Eintritt, Home, Scanner, Station, Liste
├── schoolhouse.jsx            # Isometrisches Schulhaus (viewBox 800×520)
├── app-styles.css             # App-Klassen (.sn-brush, .sn-btn, …)
├── stations.js                # Prototyp-Daten (nicht 1:1 = stations.json)
└── assets/
    ├── colors_and_type.css    # Design-Tokens (:root)
    └── logos/                 # SVG-Lockups
```

## Was in der App liegt

| Bedarf | Pfad unter `app/` |
|--------|-------------------|
| Tokens (Runtime) | [`app/gs39-tokens.css`](../app/gs39-tokens.css) |
| Tokens (Docker-Build-Check) | [`scripts/reference/colors_and_type.css`](../scripts/reference/colors_and_type.css) |
| Logos (Runtime) | [`public/brand/logos/`](../public/brand/logos/) |
| Motive (PNG) | [`public/brand/motifs/`](../public/brand/motifs/) — siehe README dort |
| Isometrisches Schulhaus (Hub) | [`isometric-schoolhouse.svg`](./isometric-schoolhouse.svg) — Illustrator-Referenz, nicht zur Laufzeit |

Nach Änderungen am Design-Paket: Tokens und Logos in `app/` synchron halten, `npm run validate:tokens` ausführen.

## Isometrisches Schulhaus — Illustrator-Workflow

Datei: [`isometric-schoolhouse.svg`](./isometric-schoolhouse.svg) (viewBox `0 0 800 520`).

**Ebenen / Gruppen:**

| Gruppe | Inhalt |
|--------|--------|
| `ground` | Boden, Schatten |
| `garden` | Station schulsozialarbeit (Nr. 11) |
| `gym` | Station turnhalle (Nr. 10) |
| `main-building` | Fassade, Dach, Flagge, Dekor |
| `windows` | 9 Fenster-Slots (`data-room` → `ISOMETRIC_ROOM_FRAMES`) |

Gestrichelte Rahmen (`.window-guide`) sind Koordinaten-Hilfen — vor React-Sync entfernen oder ausblenden.

**Ablauf:**

1. SVG in Illustrator öffnen, Layout anpassen (Gruppen beibehalten).
2. Fertige SVG ins Repo zurücklegen (dieselbe Datei oder `-v2`-Suffix).
3. Koordinaten in [`components/schoolhouse/isometric-schoolhouse.tsx`](../components/schoolhouse/isometric-schoolhouse.tsx) und ggf. [`lib/schoolhouse-isometric-map.ts`](../lib/schoolhouse-isometric-map.ts) übernehmen.
4. Startseite lokal prüfen (Touch-Targets, Fest/Heft-Modus).

Laufzeit-Implementierung: [`isometric-schoolhouse.tsx`](../components/schoolhouse/isometric-schoolhouse.tsx) (dynamisch: Besucht/Gesperrt, Hit-Areas).

## Architektur

Hub-Darstellung: [ADR-009](../../dokumentation/adr/009-hub-isometrisch.md) (isometrisch statt Puzzle-SVG).

## Ausführungsplan

[`dokumentation/projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md`](../../dokumentation/projektmanagement/2026-05-27-gs39-ui-ausfuehrungsreihenfolge.md)
