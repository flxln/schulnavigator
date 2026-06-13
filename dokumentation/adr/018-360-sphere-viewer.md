# ADR-018 — 360°-Sphere-Viewer: Koexistenz mit Flat-Viewer per `viewer`-Flag

**Datum:** 2026-06-11
**Status:** entschieden

## Kontext

Stationsseiten zeigen heute ein breites Panorama-Foto und verschieben es horizontal per `translateX` (Gyro-Pan, ADR-006). Die vorhandenen Aufnahmen sind 3:1-Streifen-JPEGs aus 360°-Kamera-Exporten — keine echten Equirectangulars. Beim Panning entstehen sichtbare Projektionsverzerrungen, vor allem an den Rändern, weil ein lineares Verschieben keine zylindrische oder sphärische Geometrie berücksichtigt.

Das MPZ will künftig echte 360°-Kamera-Aufnahmen liefern (equirectangular 2:1). Dafür ist ein vollständiger Kugel-Viewer nötig. Gleichzeitig sollen bestehende Flat-Stationen (breite Panoramen, 4:3-Platzhalter) unverändert weiterarbeiten — kein Big-Bang, keine Datenmigration.

## Entscheidung

Zwei Viewer koexistieren hinter einem expliziten Flag `viewer: 'flat' | 'equirectangular'` pro Station:

| Aspekt | Flat (Standard, ADR-006) | Sphere (neu) |
|--------|--------------------------|--------------|
| Flag | `viewer` fehlt oder `'flat'` | `viewer: 'equirectangular'` |
| Bilddatei | `bild` (≥2,5:1 JPEG) | `panorama360` (2:1 WebP/JPEG, `/stations/360/`) |
| Rendering | `translateX` auf `<Image>` | **Photo Sphere Viewer v5** (WebGL/Canvas) |
| Gyro | eigener `useDeviceOrientation`-Hook | PSV Gyroscope-Plugin |
| Hotspot-Position | `x`/`y` (0–1, Bildebene) | `yaw`/`pitch` (Grad, Kamerakoordinaten) |
| Hotspot-Hit-Test | `hit-test-hotspot.ts` | PSV `select-marker`-Event |
| Dialog/Maskottchen | `onPanChange` → `panInfo` → Bubble | PSV-Marker-Element + `ProjectHotspot`-Projektion → Bubble |

**Library:** `@photo-sphere-viewer/core` v5 + Plugins `markers-plugin` + `gyroscope-plugin`.

**Koexistenz-Strategie:**
- `viewer` fehlt → Default `'flat'`, kein Breaking Change für bestehende Stationen
- `SphereRaumViewer` wird nur bei `viewer === 'equirectangular'` gerendert (kein Bundle-Overhead für Flat-Stationen durch `dynamic()` mit `ssr: false`)
- Gemeinsame Shell (`TopBar`, Medien-Panel, `StationMediaPanel`, Besuch-Badge) bleibt für beide Viewer identisch

**Vertrag-Dreiklang:**
- **V1 (Hotspot-Basis):** `HotspotBase`-Interface teilt `action`, `mediumId`, `mascot`, `mascotSize`, `mascotFlipX`, `icon`, `iconSize`; nur die Position divergiert (`x`/`y` vs. `yaw`/`pitch`). Verhindert, dass Dialog-Helper bei Sphere-Stationen blind auf `hotspots` ohne Treffer laufen.
- **V2 (Projektion):** `ProjectHotspot(id) → ScreenProjection | null` abstrahiert die Koordinatenumrechnung. Sphere liefert über PSV `dataHelper`; Flat emuliert per Adapter aus `panInfo`. `dialog-bubble-layout.ts` konsumiert `ScreenProjection`, nicht `panPx` direkt.
- **V3 (Handle):** `StationViewerHandle { recenterView(); focusHotspot?(id) }` ersetzt den viewer-spezifischen `RaumViewerHandle`-Ref im Client — ein `viewerRef` für beide Viewer.

## Begründung

- PSV v5 ist die aktivste, dokumentierteste 360°-Library für Browser/React; Gyro- und Marker-Plugin sind first-party
- `dynamic()` mit `ssr: false` löst das Browser-only-Problem ohne Webpack-Konfiguration
- Explizites Flag statt Auto-Erkennung per Seitenverhältnis vermeidet Fehlzuordnung (heutige 3:1-Panoramen würden bei 2:1-Grenze falsch landen)
- Spike-first (eine Pilot-Station) begrenzt Risiko: Build-Kompatibilität, FPS, iOS-Gyro-Permission und Projektions-PoC werden vor dem Rollout aller 11 Stationen belegt

## Verworfene Alternativen

- **Pannellum:** weniger aktiv gepflegt, React-Integration manueller, kein first-party Gyro-Plugin
- **Marzipano:** Google-Heritage, weniger Community, keine aktive Weiterentwicklung
- **A-Frame:** mächtiger VR-Stack, aber Bundle-Overhead unverhältnismäßig für einen Schulfest-Viewer
- **Eigenbau WebGL (Zylinder/Kugel):** volle Kontrolle, aber 5–15 PT Eigenentwicklung für etwas, das PSV kostenlos liefert
- **Auto-Erkennung per Aspect-Ratio:** bequem, aber gefährlich — heutige 3:1-Panoramen sind kein Equirectangular; explizites Flag ist sicherer
- **Kein Flat-Fallback (Big-Bang):** würde `kunst`, `hort`, `schulsozialarbeit` und alle Übergangsphasen ohne 2:1-Content brechen

## Konsequenzen

- **Neue Dateien:** `app/components/raum-viewer/sphere-raum-viewer.tsx` + Inner-Modul (PSV-Instanz), `app/lib/raum-viewer/sphere-projection.ts` (V2-Adapter)
- **Geändert:** `app/lib/types.ts` (neue Interfaces `ViewerMode`, `HotspotBase`, `Hotspot360`, `StationViewerHandle`; `Station` um `viewer`/`panorama360`/`hotspots360`), `app/lib/validate-stations.ts` (viewer-abhängige Validierung), `app/components/raum-station-client.tsx` (Verzweigung + `viewerRef` auf `StationViewerHandle`), `app/lib/dialog-hotspot.ts` (auch `hotspots360` auslesen), `app/lib/dialog-bubble-layout.ts` (konsumiert `ScreenProjection`)
- **Content-Pfad:** equirectangular-Dateien nach `app/public/stations/360/{slug}.webp`; im Submodule `auftraggeber/material/stationen-360-pano/equirect/` (wie in `content-verzeichnisstruktur.md` vorgesehen)
- **Spike-Gates vor Phase-1-Vollausbau:** Build-Kompat (PSV + Next 16 Turbopack/ESM), FPS iPhone Safari, Projektions-PoC (`dataHelper`→`ScreenProjection`), iOS-Gyro-Permission-Trigger
- **Dialog in 360° (Phase 3):** Bubble bleibt 2D-Overlay; Maskottchen ist PSV-Marker-Element; `visible: false` aus `ScreenProjection` blendet Bubble bei verdecktem Maskottchen aus
- **Nicht betroffen:** ADR-006 bleibt gültig für Flat-Stationen; ADR-006 erhält Querverweiszeile auf ADR-018
- **`onHotspotCenterHit` (entschieden 2026-06-11):** Für Sphere **bewusst entfallen**. Gyro-Zentrierung im Flat-Viewer setzt `activeHotspotId` per Hit-Test (`room-image-pane.tsx`); in der Kugel wählen Nutzer Maskottchen/Medien per Tap. Kein Auto-Highlight beim Drehen.
- **Rollout (2026-06-11):** 8 Stationen auf `equirectangular` (`klassenzimmer`, `daz`, `pc-raum`, `werken`, `turnhalle`, `speiseraum`, `lesewelt`, `musik`); Export via `app/scripts/export-pano-equirect.mjs`; Maskottchen-Marker in `app/lib/raum-viewer/sphere-marker-html.ts`.
- **Zoom-Sperre (2026-06-11):** Zoom im Sphere-Viewer gesperrt (festes FOV 90°, Epsilon-Spanne gegen NaN) — HTML-Marker + Dialog-Bubble bleiben stabil; kein FOV-Zoom. Marker-Norm für 90° kalibriert (`SPHERE_MASCOT_SIZE_NORM` / `SPHERE_ICON_SIZE_NORM`). **Entsperren erfordert** `zoom-updated`-Listener für die Bubble-Projektion und FOV-abhängige Markergröße.
- **Gyro nach Pinch (2026-06-11):** Zwei-Finger-Pinch ruft PSV `stopAll()` auf → GyroscopePlugin stoppt; Neustart per `touchend` (Capture-Phase merkt Gyro-Zustand vor PSV).
- **Offen:** Tablet-Hero-Höhe im Sphere-Viewer (ADR-012 Epic); FPS/Ladezeit iPhone Safari (manuell messen).
