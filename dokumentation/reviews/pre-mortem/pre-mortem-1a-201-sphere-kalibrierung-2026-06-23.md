---
name: "Pre-Mortem Analysis Issue 201"
overview: "Pre-Mortem 1a Analyse (Code-Praxis) für die Sphere-Kalibrierung (Issue #201). Identifiziert kritische Lücken in der Viewer-Integration (stale Props, State-Abhängigkeiten) und Performance-Probleme beim Tab-Wechsel."
---

# Pre-Mortem 1a — Code-Praxis: Sphere-Kalibrierung #201

**Plan:** `.cursor/plans/sphere-kalibrierung_#201_9fa39b03.plan.md`  
**Datum:** 2026-06-23  

---

Stell dir vor, du öffnest die erste Datei und fängst an zu tippen. Hier sind die Stellen, an denen du aufhörst und zurückgehen musst:

### 1. `calibMode` vs. `calibEnabled` im Viewer-State
- **Warum später teuer:** Der Plan führt einen neuen Prop `calibMode` für `sphere-raum-viewer-inner.tsx` ein, um die Kalibrierung ohne URL-Parameter zu aktivieren. Im Ist-Code basiert die gesamte Kalibrier-Logik (Event-Listener für Klicks, Updates in `calibViewRef`) aber streng auf der abgeleiteten Variable `calibEnabled` (welche aktuell rein auf `hotspotCalibFromSearchParams` basiert). Wenn man vergisst, `calibEnabled` um den neuen Prop zu erweitern, läuft der Code ins Leere.
- **Wann es beißt:** Direkt beim ersten Versuch, in der neuen `/mpz/calib/sphere/[slug]` Route einen Hotspot zu setzen. Klicks im Panorama werden ignoriert, das `position-updated` Event aktualisiert die Readouts nicht.
- **Billige Gegenmaßnahme jetzt:** `calibEnabled` explizit kombinieren: `const isCalibActive = calibEnabled || !!calibMode`. Alternativ `calibEnabledRef` auch von `calibMode` abhängig machen.

### 2. Stale Callbacks: Fehlende Ref-Kapselung für `onCalibClick` und `onCalibViewReady`
- **Warum später teuer:** Die Viewer-Event-Listener (`click`, `position-updated`) werden in einem `useEffect` mit leerem Dependency-Array (via `ready` / `once: true` bzw. nur bei Init) registriert. Wenn neue Callbacks (`onCalibClick`, `onCalibViewReady`) als Props eingeführt werden, weisen diese auf den Zustand des initialen Renders.
- **Wann es beißt:** Wenn das neue Seitenpanel in React neu rendert und einen aktualisierten Click-Handler übergibt. Der `viewer.addEventListener('click', ...)` feuert weiterhin den alten Closure-State, was zu falschen Zustandswerten im Parent führt.
- **Billige Gegenmaßnahme jetzt:** Analog zum Ist-Code von `onViewChangeRef` zwingend `onCalibClickRef` und `onCalibViewReadyRef` anlegen und in den Event-Listenern über `.current` aufrufen.

### 3. Performance-Falle: Viewer-Remount beim Tab-Wechsel
- **Warum später teuer:** Der Plan besagt: „`SphereCalibShell` mit Tabs Hotspots | Startblick" und verweist auf Symmetrie zu Flat. Bei Flat mounten die Tabs jeweils ihre eigene Viewer-Komponente. Ein equirectangulares Panorama im `PhotoSphereViewer` zu laden, bedeutet jedoch aufwendige WebGL-Initialisierung und das Dekodieren von >10MB großen Bild-Texturen.
- **Wann es beißt:** Bei jedem Klick auf die Tabs "Hotspots" <-> "Startblick". Das Bild blitzt schwarz auf, der Main-Thread blockiert kurz, die Orientierung (yaw/pitch) geht zurück auf Start. Die UX ist deutlich schlechter als im bisherigen Overlay.
- **Billige Gegenmaßnahme jetzt:** In `sphere-calib-shell.tsx` darf nicht zwischen `<SphereHotspotCalib>` und `<SphereStartblickCalib>` hin- und hergewechselt werden, wenn beide den Viewer enthalten. Stattdessen den `SphereRaumViewerInner` in die Shell (oder ein gemeinsames Layout) "hoisten" und über den Tab-State **nur das rechte Seitenpanel** (Hotspots-Formular vs. Startblick-Formular) austauschen. Die Callbacks (`onCalibClick`, `calibViewRef`) müssen dann von der Shell ans aktive Panel durchgereicht werden.

### 4. Legacy URL-Parameter Logik in `station-hotspots-table.tsx`
- **Warum später teuer:** Die Tabelle prüft aktuell, ob Hotspots vorhanden sind und zeigt dann statisch den Text an: `Sphere-Kalibrierung: /raum/{slug}?hotspot-calib=1` (Z. 259-263). Der Plan sagt "Hinweis weg" und "statischer Footer entfernt", was korrekt ist. Allerdings ändert sich in `mpzStationCalibHref` auch die Signatur (`hasPanorama360`).
- **Wann es beißt:** Wenn `hasPanorama360` false ist, liefert `mpzStationCalibHref` zukünftig `null`. Die Tabelle zeigt dann `Raumbild fehlt — Kalibrierung nicht verfügbar.`. Das ist logisch korrekt (ohne `panorama360` keine Sphere-Kalibrierung), muss aber in TypeScript sauber gemappt werden, da `hasBild` aktuell übergeben wird.
- **Billige Gegenmaßnahme jetzt:** In `station-hotspots-table.tsx` beim Aufruf von `mpzStationCalibHref` zwingend `hasPanorama360: !!activeStation.panorama360` anstelle von `hasBild` übergeben, damit die Typsicherheit und das Fallback-Verhalten greifen.
