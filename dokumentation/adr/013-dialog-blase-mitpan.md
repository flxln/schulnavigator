# ADR-013 — Dialog-Blase folgt Maskottchen beim Panning (Option C)

**Datum:** 2026-05-28
**Status:** entschieden
**Ergänzt:** [ADR-011](./011-dialog-mascot-hotspots.md) Punkt 6 (Sprechblase viewport-fix → Blase folgt Szene)

## Kontext

ADR-011 Punkt 6 legte fest: Sprechblase bleibt viewport-fix (v1), Gyro während Dialog aktiv.
Im iPhone-Test zeigte sich: wenn Nutzer während des Dialogs schwenken, wandern die Maskottchen mit dem Panorama, während die Blase mittig im Viewport stehen bleibt. Das wirkt wie ein zerrissener Dialog.

Die Ideen-Datei [`dialog-maskottchen-abstand-und-pan.md`](../ideen/archiv/dialog-maskottchen-abstand-und-pan.md) definierte drei Optionen:

| Option | Beschreibung |
|--------|-------------|
| A | Nur Koordinaten enger setzen; Blase bleibt fix |
| B | Pan während Dialog pausieren/dämpfen |
| C | Blase folgt der Szene (horizontaler Offset aus `panPx`) |

## Entscheidung

**Option C:** Die `DialogEmbeddedBubble` berechnet ihren horizontalen Offset aus der aktuellen Panorama-Pan-Position und dem normalisierten X-Mittelpunkt der Maskottchen-Hotspots.

Technisches Vorgehen:

1. `RoomImagePane` erhält einen neuen optionalen Prop `onPanChange(panPx, effectiveDisplayW, containerW)`, der per `useEffect` bei jeder Änderung aufgerufen wird.
2. `RaumViewer` reicht ihn transparent durch.
3. `raum-station-client.tsx` hält `panInfo` als State, berechnet `bubbleOffsetX`:
   ```
   midX = Durchschnitt der x-Werte aller Maskottchen-Hotspots
   raw  = panPx + midX × effectiveDisplayW − containerW / 2
   bubbleOffsetX = clamp(raw, ±containerW × 0.35)
   ```
4. `DialogEmbeddedBubble` erhält `offsetX?: number` und wendet es als `transform: translateX(${offsetX}px)` auf das innere `<p>` an.

## Begründung

- Blase und Figuren bleiben räumlich zusammen — Dialog wirkt als eine Szene.
- Der Clamp (±35 % des Viewports) verhindert, dass die Blase bei extremem Pan vollständig aus dem sichtbaren Bereich gleitet.
- Kein zusätzlicher State in `RoomImagePane` nötig — bestehende Werte werden nur nach außen gemeldet.
- Gyro bleibt während des Dialogs aktiv (keine Einschränkung wie Option B).

## Verworfene Alternativen

- **Option A (nur Koordinaten enger):** Blase driftet weiterhin ab sobald der Nutzer schwenkt — sichtbarer Fehler bleibt.
- **Option B (Pan während Dialog einfrieren):** Einfacher, aber schränkt die Raumerkundung während des Dialogs ein; widerspricht dem Ziel „Raum bleibt erlebbar" (ADR-011).

## Konsequenzen

- `RoomImagePane`, `RaumViewer`, `raum-station-client.tsx`, `DialogEmbeddedBubble` werden angepasst.
- `onPanChange` sollte als stabiler Callback übergeben werden (`useCallback` in der Aufrufstelle), um unnötige re-renders zu vermeiden.
- Gleichzeitig: Maskottchen werden größer (130 px/150 px) und tiefer im Bild platziert (`y: 0.78`).
- ADR-011 Punkt 6 gilt als durch diesen ADR ergänzt/abgelöst.
