# ADR-012 — Tablet/iPad: responsive Layout (Mobile-first erweitern)

**Datum:** 2026-05-28  
**Status:** vorgeschlagen — Wechsel auf `entschieden` erst nach Klärung der Content-Voraussetzungen (siehe Konsequenzen, Punkt „Bildauflösung").  
**Ergänzt:** [ADR-002](./002-frontend-nextjs.md) (Frontend), [ADR-006](./006-raum-viewer-gyro-hotspots.md) (Raum-Viewer), [ADR-009](./009-hub-isometrisch.md) (Hub) — ersetzt keine dieser ADRs

## Kontext

Die App ist **Mobile-first** umgesetzt: Hauptlayouts nutzen `max-w-lg` (≈ 512 px) und zentrieren den Inhalt. Der Raum-Hero ist auf `min(52–58vh, 340–400px)` bzw. `ROOM_VIEWER_HEIGHT_CSS = min(50vh, 360px)` gedeckelt ([#56](../github-project/issues-phase-2.md), `lib/raum-viewer/constants.ts`).

Am **Tag der offenen Tür** und in der Projektplanung ist ein **Tablet-Fallback** vorgesehen (Stationen mit betreuten Tablets, [#41](../github-project/issues-phase-4.md)). Auf iPad (768–1024 px Viewport) wirkt die UI heute wie ein vergrößertes Handy: breite Ränder, kleiner Panorama-Hero, ungenutzter Platz.

**#56** hat Viewport-Meta und Gyro für iPad bereits abgedeckt (Portrait `alpha`, Landscape `gamma`). Das Problem ist **Layout-Skalierung**, nicht Browser-Zoom oder fehlende Sensoren.

**Abgrenzung:** [#72](https://github.com/flxln/schulnavigator/issues/72) (TopBar/Chip) ist abgeschlossen — reine Bedienlogik auf dem bestehenden Phone-Layout. Tablet-Skalierung ist ein **eigenes Epic** mit Unterissues (siehe [epic-tablet-ipad-layout.md](../github-project/epic-tablet-ipad-layout.md)).

## Entscheidung

1. **Zielgeräte:** Primär **iPad** (Portrait und Landscape). **Android-Tablets sind Best-Effort, nicht QA-Gate** — werden lokal stichprobenartig geprüft, blockieren aber keinen Merge. Begründung: am Schulfest werden iPads aufgestellt; Android-Geräte sind „BYOD" der Besucher. Kein Desktop-Website-Redesign.
2. **Methode:** Responsive Erweiterung per **Tailwind-Breakpoints** (`md:` ab 768 px, optional `lg:` ab 1024 px) — **kein** globales CSS-`zoom`, kein `initial-scale` > 1, keine zweite „Tablet-App“.
3. **Phone-Baseline bleibt:** Unter `md` unverändertes Verhalten (375 px QA bleibt Referenz).
4. **Umsetzung in vier PR-fähigen Unterissues** (Reihenfolge verbindlich):
   - **A** Layout-Container (`max-w-*` auf Haupt-Routen)
   - **B** Raum-Viewer / Hero-Höhen (Konstanten + `raum-station-client`)
   - **C** Hub + Startseite (isometrische Karte, Fortschritt)
   - **D** Dialog/Maskottchen + Medien-Panel (optional, nach A+B)
5. **Gyro/Hotspots:** Keine Änderung an Pan-Mathematik ohne Regressionstest; Höhen/Breiten-Anpassungen dürfen `containerW`/`containerH` ändern — Tests und iPad-Matrix aus [#56](../github-project/issues-phase-2.md) erneut ausführen.
6. **Bildauflösung (Content-Voraussetzung):** Die Konstante `RECOMMENDED_SOURCE_ASPECT_MIN = 2.5` in [`app/lib/raum-viewer/constants.ts`](../../app/lib/raum-viewer/constants.ts) ist auf Phone-Container (≈ 390 × 360 px) kalibriert. Auf Tablet-Containern (768 × 520) erzwingt `MIN_PAN_DISPLAY_RATIO = 2` einen Auto-Zoom (`roomPanZoom`), der bei 2.5:1-Bildern **~94 px vertikal beschneidet** und damit den `visibleYNormalRange` schrumpft. Konsequenzen siehe unten; die Frage „Bilder neu aufnehmen vs. Hero-Höhe deckeln" wird im Rahmen von **#76** entschieden und ggf. in einem Folge-ADR fixiert.
7. **`lg:`-Cap:** Maximale Content-Breite **`max-w-3xl` (768 px)** auch auf iPad Pro / Desktop. Größere Viewports sehen bewusst Leerraum links/rechts. Begründung: Schulfest-Scope, einheitliches Touch-Layout, keine Sidebar-Architektur.
8. **Doku:** Tablet-Viewports in [`anleitungen/lokal-testen-und-anschauen.md`](../../anleitungen/lokal-testen-und-anschauen.md); Epic-Spezifikation in [`github-project/epic-tablet-ipad-layout.md`](../github-project/epic-tablet-ipad-layout.md); neuer Abschnitt **„Responsive/Tablet"** in [`dokumentation/architektur.md`](../architektur.md) mit Breakpoint-Tabelle, Hero-Strategie und empfohlener Bild-Aspect je Breakpoint.
9. **Typografie:** **Keine** pauschale `md:text-*`-Skalierung. Bei `max-w-3xl` (768 px) und Basis-Schriftgrößen liegt die Zeilenlänge am oberen lesbaren Rand (~80 Zeichen) — bewusst akzeptiert für Schulfest-Scope. Punktuelle Anpassungen erlaubt, falls Lesbarkeit konkret leidet.
10. **Bild-Performance:** Next.js `<Image fill priority sizes="100vw">` (`room-image-pane.tsx`) bedient Tablet-Breakpoints automatisch über das eingebaute `srcset`. Keine zusätzliche `sizes`-Logik in diesem Epic nötig. Wenn Option A (höhere Aspect-Bilder) gewählt wird: MPZ liefert die Originale, Next.js generiert die Größen.

## Begründung

- Stationstablets profitieren vor allem von **größerem Hero** und **breiterer Content-Spalte** — ohne die Mobile-UX zu verschlechtern.
- Breakpoint-basierte CSS-Klassen passen zum Stack (Tailwind, ADR-002) und sind reviewbar in kleinen PRs.
- CSS-Zoom würde Hotspot-Koordinaten, Touch-Ziele und Gyro-Pan optisch verzerren.
- Epic + Unterissues verhindert einen „Mega-PR“ parallel zu laufenden UI-Fixes.

## Verworfene Alternativen

- **Nur größere Phones simulieren (`max-w-lg` beibehalten):** auf Tablets zu viel Leerraum; Schulfest-Nutzer sehen kleines Panorama.
- **Vollständige Desktop-Responsivität (xl/2xl, Sidebar, …):** außerhalb Schulfest-Scope; Overengineering.
- **Separate `/tablet`-Route oder User-Agent-Switch:** doppelte Wartung, QR-URLs unverändert bleiben müssen.
- **Viewport `maximum-scale` / Pinch-Zoom sperren:** Barrierefreiheit und iOS-Safari-Risiken; nicht nötig bei korrektem Layout.

## Konsequenzen

- Geplante GitHub-Issues **(Epic)** und **(A–D)** (Unterissues) — siehe [epic-tablet-ipad-layout.md](../github-project/epic-tablet-ipad-layout.md). **Echte Nummern werden erst beim `gh issue create` vergeben** und müssen anschließend im Epic-Dokument und in dieser ADR ersetzt werden.
- Betroffene Dateien (Auszug): `app/app/page.tsx`, `app/app/raum/[slug]/page.tsx`, `app/app/eintritt/page.tsx`, `app/app/scan/page.tsx`, `app/app/stationen/page.tsx`, `lib/raum-viewer/constants.ts`, `components/raum-station-client.tsx`, `components/schoolhouse/*`, `components/station-media-panel.tsx`, `components/scan/qr-scanner.tsx`, optional Dialog-Komponenten.
- **Konstanten** für Hero-Höhen sollen zentral (z. B. `constants.ts` oder geteilte Tailwind-Arbitrary-Werte dokumentiert) bleiben, damit Viewer und Hero-Section nicht auseinanderlaufen.
- **Content-Voraussetzung (offen):** Bestehende Panoramen sind auf `RECOMMENDED_SOURCE_ASPECT_MIN = 2.5` ausgelegt (Phone-tauglich). Auf Tablet werden sie per Auto-Zoom vertikal beschnitten — Hotspots, die in `stations.json` nahe oberem/unterem Bildrand liegen, können dadurch **außerhalb von `visibleYNormalRange` fallen**. Mit MPZ ist zu klären: Bilder mit höherer Aspect (≥ 3.0) neu liefern (Issue **#17**) **oder** Hero-Höhe auf Tablet so deckeln, dass der Beschnitt minimal bleibt. Entscheidung erfolgt in Unterissue **B** und wird vor ADR-Statuswechsel auf `entschieden` festgehalten.
- **Hub-Touch-Targets:** `MIN_HIT_PX = 44` in [`components/schoolhouse/isometric-schoolhouse.tsx`](../../app/components/schoolhouse/isometric-schoolhouse.tsx) ist eine **SVG-viewBox-Einheit (800 × 520)**, nicht CSS-px. Auf schmaleren Phone-Viewports liegt die effektive Tap-Fläche unter 44 CSS-px (≈ 26 px bei 480 px Container). Im Rahmen von Unterissue **C** muss `expandHitRect` in CSS-px-Logik überführt werden (`ResizeObserver` auf SVG, Rückrechnung in viewBox-Einheiten). Diese Korrektur kommt der Phone-Baseline ebenfalls zugute.
- Follow-up-Ideen (Blase mitpannt, Abstände) bleiben in [`kurzfristige-ideen/dialog-maskottchen-abstand-und-pan.md`](../kurzfristige-ideen/dialog-maskottchen-abstand-und-pan.md) — Issue **D** kann davon profitieren, ersetzt sie nicht.
- Phase-4-Issue **#41** (Tablet-Fallback Hardware) bleibt organisatorisch; das Epic liefert die **softwareseitige** Tablet-taugliche UI.
