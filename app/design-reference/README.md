# Design-Referenz — Virtueller Schulrundgang

Dieser Ordner dokumentiert die **Quelle** für die GS39-UI-Umsetzung (Issue #58). Er ist **kein** Laufzeit-Bestandteil der App und wird **nicht** ins Docker-Image kopiert (Build-Kontext nur `app/`).

## Hub Frontansicht (ADR-016, Laufzeit)

| Bedarf | Pfad unter `app/` |
|--------|-------------------|
| Referenz-SVG (Build-Zeit) | [`scripts/reference/outline-39gs-frontansicht.svg`](../scripts/reference/outline-39gs-frontansicht.svg) |
| Hub-Outline (Runtime) | [`public/brand/hub/gs39-front-outline.svg`](../public/brand/hub/gs39-front-outline.svg) |
| Slot-Map | [`lib/schoolhouse-hub-map.ts`](../lib/schoolhouse-hub-map.ts) |
| Komponente | [`components/schoolhouse/front-schoolhouse.tsx`](../components/schoolhouse/front-schoolhouse.tsx) |

Sync: `cd app && npm run prepare:hub-outline`

## Legacy — Isometrie (ADR-009, ersetzt)

[`isometric-schoolhouse.svg`](./isometric-schoolhouse.svg) — nur noch historische Referenz.

## Source of Truth (Auftraggeber-Submodule)

```
auftraggeber/Virtueller Schulrundgang/   # GS39-Chrome, screens.jsx
auftraggeber/material/bilder/           # Frontansicht-Quelle
```

## Architektur

[ADR-016](../../dokumentation/adr/016-hub-frontansicht-39gs.md) (ersetzt [ADR-009](../../dokumentation/adr/009-hub-isometrisch.md) Darstellung).
