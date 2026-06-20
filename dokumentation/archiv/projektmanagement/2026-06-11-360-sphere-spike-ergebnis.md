# 360°-Sphere-Viewer — Spike-Ergebnis & Rollout

**Datum:** 2026-06-11  
**ADR:** [018](../adr/018-360-sphere-viewer.md)  
**Branch-Kontext:** `feature/360-sphere-viewer`

## Spike-Ergebnisse

| Gate | Ergebnis |
|------|----------|
| Build-Kompat (PSV v5 + Next 16) | Grün — `dynamic(ssr: false)`, ESM ohne Sonder-Webpack-Config |
| StrictMode / Lade-Bug | Behoben: Panorama **nicht** im PSV-Konstruktor; `requestAnimationFrame` → `setPanorama()` |
| Projektions-PoC (V2) | `viewer.dataHelper.sphericalCoordsToViewerCoords` → `ScreenProjection` funktional |
| Dialog-Bubble in Sphere | `projectHotspot()` + `sphereProjection` in `raum-station-client.tsx` |
| iOS Gyro-Permission | `useDeviceOrientation` + Hero-Overlay „Orientierung aktivieren“; PSV `GyroscopePlugin.start()` nach Erlaubnis |
| Android Gyro-Start | Behoben: PSV `__checkSupport()` wertet das erste `deviceorientation`-Event aus, das auf Android oft `alpha=null` (Kalibrierung) trägt → `isSupported` blieb `false`. Patch ersetzt die Promise und wartet auf das erste Event mit gültigem `alpha`. |
| Pitch-Freeze (kein Kippen) | Behoben: `VisibleRangePlugin` (±15°) kollabiert den Pitch auf einen Punkt, wenn der Bereich kleiner als das Kamera-FOV ist. Plugin entfernt; `GyroscopePlugin.roll: false` begrenzt das seitwärts Kippen wie gewünscht. |
| FPS / Ladezeit iPhone | **Noch nicht gemessen** — manuell unter HTTPS auf `/raum/musik` nachholen |

## Rollout (Folgearbeit)

- **8 Stationen** auf `viewer: "equirectangular"` mit `panorama360` unter `/stations/360/{slug}.jpg`
- **Export:** `npm run export:pano360` → `export-pano-equirect.mjs` (5376×2688, ~2,6–3,7 MB)
- **Dialog-Stationen:** `daz`, `pc-raum` mit `hotspots360` + Maskottchen-PNG-Markern
- **Medien-Hotspots:** `klassenzimmer`, `musik` mit `hotspots360` (Start-yaw/pitch aus Flat-Heuristik, Feintuning im Browser)
- **Ohne Hotspots:** `werken`, `turnhalle`, `speiseraum`, `lesewelt`
- **Flat geblieben:** `kunst`, `hort`, `schulsozialarbeit`

## Entscheidungen

- **`onHotspotCenterHit` für Sphere:** entfällt — Nutzer tippt Hotspots/Maskottchen, kein Auto-Treffer beim Gyro-Drehen (siehe ADR-018).
- **Hotspot-Positionen:** kein automatisches `x/y` → `yaw/pitch`; Heuristik `(x−0,5)×100°` / `(0,5−y)×50°` als Startwert.

## Bekannte Follow-ups

- Hotspot-yaw/pitch visuell nachjustieren (besonders Dialog-Maskottchen)
- Optional: WebP-Export oder stärkere Kompression unter 2 MB
- Tablet/iPad-Hero (Epic #76)
