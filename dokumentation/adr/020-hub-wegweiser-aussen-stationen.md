# ADR-020 — Hub Wegweiser für Außen-Stationen (Schulhof, Turnhalle)

**Datum:** 2026-06-14  
**Status:** entschieden  
**Ergänzt:** [ADR-016](./016-hub-frontansicht-39gs.md) (Slot-Map, 12 Stationen)

## Kontext

Die Frontansicht des Schulhauses (ADR-016) ordnete 11 Stationen 10 Fenstern und einem Portal zu. Turnhalle und Schulhof liegen **außerhalb** des Gebäudes — ein Fenster-Slot für die Turnhalle wirkte in der Schulkonzeption unrealistisch (Meeting 14.06.2026). Die Schule lieferte eine überarbeitete SVG mit Wegweiser links vor dem Portal ([`outline-39gs-frontansicht wegweiser.svg`](../../auftraggeber/material/bilder/outline-39gs-frontansicht%20wegweiser.svg)).

Außen-Stationen brauchen rotierte Schildarme; die bisherige Slot-Map nutzte eine einzige axis-aligned `frame` für Rendering, Hit-Test und Chip-Position — das führt bei Rotation zu Portal-Überlappung und falsch platzierten Chips.

## Entscheidung

### Wegweiser-Slots

- Neuer Slot-Typ `wegweiser` in `app/lib/schoolhouse-hub-map.ts`
- **Oberer Schildarm** (`wegweiser-oben`) → `turnhalle` (bestehender Slug, 360° vorhanden)
- **Unterer Schildarm** (`wegweiser-unten`) → `schulhof` (neue Station, 12. Hub-Eintrag)
- `fenster-lr` wird **Deko** (nicht klickbar) — kein Fenster-Slot mehr für Turnhalle

### Slot-Vertrag (aufgeteilt)

| Feld | Zweck |
|------|--------|
| `frame` | Layout-AABB (Nachbar-Gaps, SR-Layout) |
| `hitFrame` | schlanke Trefferfläche (kein Portal-Overlap) |
| `chipAnchor` | Chip-Mitte auf dem Schildarm |
| `rotation` | Grad für visuelles Overlay |
| `overlayFrame` / `overlayTranslate` | Illustrator-Quellrechteck + Transform |

Fenster-, Portal- und Deko-Slots bleiben unverändert (nur `frame`).

### Station `schulhof`

- Slug `schulhof`, `viewer: equirectangular`, Panorama aus `flat/schulhof/raw/017-360-Schulhof.JPG`
- **Veröffentlichte Minimalstation:** zählt zu 12/12, erhält QR-Code, Platzhalter-Text ist bewusster Minimalzustand (Medien/Hotspots nachgeliefert)
- **Besucht = Station geöffnet** — unverändert für alle Stationen (kein Interaktions-Schwellwert)

### Hub-Asset

- Laufzeit-SVG aus Wegweiser-Variante (`Generatives_Objekt1` in Outline-Ebene)
- `viewBox` unverändert `0 0 1086.5 1453.9`; bestehende Fenster-Frames verifiziert identisch

## Begründung

- Wiedererkennbarkeit: Wegweiser statt Fenster für Wege vom Portal weg
- Getrennte Hit-/Render-Geometrie verhindert Portal-Tap-Konflikte bei rotierten Armen
- Slug `turnhalle` bleibt — bestehende QR-Codes und `visited`-State gültig

## Verworfene Alternativen

- Turnhalle am Fenster `fenster-lr` belassen
- Nur eine zusätzliche Station ohne Wegweiser-SVG
- Polygon-Hit-Areas im MVP (BBox + schlanker `hitFrame` reicht)

## Konsequenzen

- 12 Stationen in `HUB_SLUG_MAP`, `stations.json`, QR-Manifest, Coach-Fortschritt (dynamisch)
- ADR-016: „11 Stationen“ obsolet für Slot-Anzahl; Darstellung Frontansicht bleibt
- Schulhof-Medien/Hotspots: separates Content-Ticket

## Bezug

- Plan: `.cursor/plans/hub_wegweiser_slots_c7386ac9.plan.md`
- Vorgänger: [ADR-016](./016-hub-frontansicht-39gs.md)
