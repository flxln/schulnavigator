# Sphere-Hotspot Layer-Spike — Ergebnis

**Datum:** 2026-06-13  
**ADR:** [018](../adr/018-360-sphere-viewer.md)

## Festgelegte Konventionen

| Thema | Ergebnis |
|-------|----------|
| Medien-Icons | `imageLayer` + `size` + `anchor: center center` |
| Dialog-Maskottchen | `element`-Billboard + `anchor: bottom center` (kein `elementLayer` — Boden-Kipp durch `lookAt`) |
| Dot-Fallback | `html` (gelber Punkt), wenn keine Bildquelle |
| JSON `yaw`/`pitch` | Ankerpunkt am Panorama (Fuß bei Maskottchen, Mitte bei Icons) |
| Dialog-Bubble | `projectHotspot` nutzt `pitch + bubblePitchOffset` (Kopf über Fuß) |
| Größe imageLayer | `resolveImageLayerSize()` — eigenes Maß, nicht Billboard-FOV-Helfer |
| Marker-Lifecycle | `addMarker` einmal pro `id`, Zustand via `updateMarker` / DOM-Mutation |

## Verworfen

- `elementLayer` für Maskottchen am Boden (starke Neigung durch PSV `lookAt`)
- Wiederverwendung `resolveMascotHeightPxForSphere` / `resolveIconSizeNormForSphere` für Layer

## Kalibrierung

Dev: `/raum/{slug}?hotspot-calib=1` (nur `NODE_ENV=development`).
