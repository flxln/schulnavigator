# ADR-023 — Sphere-Viewer: konfigurierbarer Startblick (`startYaw` / `startPitch`)

**Datum:** 2026-06-16
**Status:** entschieden

## Kontext

Beim Öffnen einer 360°-Station (`viewer: 'equirectangular'`, [ADR-018](./018-360-sphere-viewer.md)) zeigt Photo Sphere Viewer v5 standardmäßig **yaw 0° / pitch 0°** — die Mitte des Equirectangular-Bildes. `recenterView()` springt ebenfalls auf 0/0 ([`sphere-raum-viewer-inner.tsx`](../../app/components/raum-viewer/sphere-raum-viewer-inner.tsx)).

In der Praxis liegt der „interessante“ Raumausschnitt oft **nicht** in der Bildmitte: Das MPZ exportiert Panoramen mit beliebiger Ausrichtung; Hotspots und Maskottchen sitzen an anderen yaw/pitch-Werten. Besucher starten dann mit leerem Wandbereich und müssen erst drehen.

Hotspot-Kalibrierung (`?hotspot-calib=1`, Issue #149 / MPZ Studio) setzt nur `hotspots360[]`, nicht den initialen Kamerastand. Eine **eigene, optionale** JSON-Konfiguration für den Startblick ist nötig — getrennt von Hotspot-Koordinaten.

## Entscheidung

Pro Station mit `viewer: 'equirectangular'` dürfen optional zwei Felder gesetzt werden:

| Feld | Typ | Bereich | Default |
|------|-----|---------|---------|
| `startYaw` | `number` | −180 … 180 (Grad) | `0` |
| `startPitch` | `number` | −90 … 90 (Grad) | `0` |

**Semantik:**

- Gleiche Koordinatenkonvention wie `hotspots360[].yaw` / `pitch` (PSV, Equirectangular-Mitte = 0/0; `yaw` wird wie bei Hotspots normalisiert).
- Felder sind **optional**; fehlen beide → Verhalten wie heute (0/0).
- Nur **ein** Wert gesetzt → der andere Default `0`.
- Nur bei `viewer === 'equirectangular'` erlaubt; bei Flat-Stationen lehnt der Validator ab ([ADR-024](./024-flat-startpan.md) für Flat).
- Beim Laden: nach `setPanorama()` Kamera auf `(startYaw, startPitch)` setzen (ohne Animation oder mit kurzer Initial-Rotation — Implementierungsdetail).
- **`recenterView()`** springt auf **`(startYaw, startPitch)`**, nicht blind auf 0/0.
- **`focusHotspot(id)`** bleibt unverändert (animiert zum Hotspot).

**Pflege (Plan A / Plan B):**

- Manuell in `stations.json` oder VS-Code-Snippet.
- Dev: aktuelle Ansicht aus `?hotspot-calib=1` per MPZ-API persistieren — separates Issue (#153), folgt ADR-022, **nicht** Teil von #149.

## Begründung

- Minimal-invasiv: zwei optionale Zahlen, keine Breaking Changes.
- Wiederverwendet bewährte yaw/pitch-Semantik aus ADR-018 — kein zweites Koordinatensystem.
- Entkoppelt von Hotspots: Startblick ≠ Hotspot-Position; ein Raum kann auf die Tafel zeigen, Hotspots liegen woanders.
- `recenterView` als „zurück zum definierten Einstieg“ ist für Besucher und Content-Abnahme konsistent.

## Verworfene Alternativen

- **Panorama-Datei immer so exportieren, dass Mitte = guter Blick:** operativ fragil, bei jedem Re-Export neu justieren.
- **`initialView`-Objekt statt flacher Felder:** sauberer, aber mehr Migration/Snippet-Aufwand; flache Felder passen zum bestehenden `stations.json`-Stil.
- **Startblick in #149 (Hotspot-Kalibrierung) mischen:** anderer Zweck, anderer API-Vertrag; verworfen.
- **Nur MPZ, kein JSON-Feld:** würde Production-Verhalten nicht steuern; verworfen.

## Konsequenzen

- **Schema:** `app/lib/types.ts` (`Station`), `app/lib/validate-stations.ts`, `app/data/stations.schema.json`.
- **Runtime:** `SphereRaumViewerInner` liest Werte beim Init; `recenterView` nutzt Station-Startblick.
- **Doku:** [`content-einpflegen.md`](../../anleitungen/content-einpflegen.md), [`architektur.md`](../architektur.md).
- **Issues:** #152 (Runtime + Schema), #153 (MPZ Persistenz, Epic #144).
- **ADR-018** bleibt gültig; Querverweis in Konsequenzen ergänzt.
- **Directus (später):** analoge Felder auf der Stations-Collection.
