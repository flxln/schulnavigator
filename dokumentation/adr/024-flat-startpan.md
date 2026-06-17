# ADR-024 — Flat-Viewer: konfigurierbarer horizontaler Startausschnitt (`startPanX`)

**Datum:** 2026-06-16
**Status:** entschieden

## Kontext

Der Flat-Viewer ([ADR-006](./006-raum-viewer-gyro-hotspots.md)) verschiebt ein breites Panorama horizontal per `translateX` (`panPx`). Beim **ersten Laden** startet `panPx` bei **0** — der **linke Bildrand** ist sichtbar, nicht die Bildmitte ([`room-image-pane.tsx`](../../app/components/raum-viewer/room-image-pane.tsx)).

`recenterView()` setzt `panPx` über `panPxAfterRecenter()` — in Portrait oft **zentriert**, in Landscape auf **0** ([`recenter-pan.ts`](../../app/lib/raum-viewer/recenter-pan.ts)). Das ist ein anderer Bezugspunkt als der Initialzustand.

Für Content-Pflege fehlt die Möglichkeit, den **ersten sichtbaren horizontalen Ausschnitt** festzulegen (z. B. Eingang statt linker Wandecke), ohne das Quellbild neu zu schneiden.

**Abgrenzung zu ADR-023:** Sphere nutzt yaw/pitch; Flat hat kein Kugelmodell. Vertikaler Ausschnitt wird weiterhin durch Auto-Zoom und `yBand` gesteuert — **nicht** per separatem JSON-Feld im ersten Schritt (zu eng mit Gyro-Neutral verzahnt).

## Entscheidung

Pro Station mit `viewer` fehlend oder `'flat'` darf optional ein Feld gesetzt werden:

| Feld | Typ | Bereich | Default |
|------|-----|---------|---------|
| `startPanX` | `number` | 0 … 1 | *(entspricht heutigem Verhalten: linker Rand)* |

**Semantik:**

- `startPanX` = **normalisierte horizontale Position der Viewport-Mitte** auf dem Quellbild (0 = Mitte am linken Bildrand, 0,5 = Bildmitte, 1 = Mitte am rechten Rand).
- Analog zu Hotspot-`x`: Bezug auf **Quellbildbreite**, nicht auf sichtbaren Ausschnitt allein.
- Feld optional; fehlt es → `startPanX` effektiv **0** (rückwärtskompatibel zum heutigen Laden).
- Bei `viewer: 'equirectangular'` lehnt der Validator ab ([ADR-023](./023-sphere-startblick.md) für Sphere).
- Beim Laden: `panPx` aus `startPanX`, `effectiveDisplayW`, `containerW` und `maxPan` berechnen.
- **`recenterView()`** springt auf **`startPanX`** (nicht mehr pauschal `centeredPanPx` / 0), sofern `startPanX` gesetzt; fehlt das Feld → bisheriges Recenter-Verhalten beibehalten.
- **Gyro-Neutral:** Nach dem Setzen von `startPanX` beim Load erfolgt die Orientierungs-Neutral-Kalibrierung wie heute; der Startausschnitt ist der **Pan-Baseline**, Gyro addiert darauf.

**Pflege:**

- Manuell in JSON (Schätzwert oder aus Dev-Tools).
- MPZ-Kalibrier-Route für Flat (Klick auf Panorama → `startPanX`) — **Folge-Issue**, nicht Blocker für ADR-024-Runtime; kann an `/mpz/calib/flat/{slug}` anknüpfen (#149).

## Begründung

- Ein Feld reicht für den häufigsten Pain (horizontaler Einstieg).
- 0…1 passt zu Hotspot-`x` und Content-Doku in `content-einpflegen.md`.
- Vertikale Startposition bewusst **nicht** im Scope: Auto-Zoom/`yBand` und Gyro-Lock sind komplexer; bei Bedarf späteres Feld `startPanY` oder Erweiterung ADR-006.

## Verworfene Alternativen

- **`startPanX` in Pixel:** geräteabhängig; verworfen.
- **Immer beim Load zentrieren (ohne JSON):** ändert Verhalten aller bestehenden Stationen; Breaking Change.
- **Gleiche Felder `startYaw`/`startPitch` wie Sphere:** semantisch falsch für Flat; verworfen.
- **`startPanX` + sofortiges Überschreiben durch Gyro-Neutral:** würde Startblick ignorieren; stattdessen Pan als Baseline vor Neutral-Set.

## Konsequenzen

- **Schema:** `Station`, Validator, `stations.schema.json` (mit #154).
- **Runtime:** `RoomImagePane` — Initial-`panPx` und `recenterView` an `startPanX` koppeln.
- **Tests:** `recenter-pan` / Pane-Init mit gesetztem `startPanX`.
- **Issue:** #154 (Runtime + Schema); MPZ-UI optional Folge zu #149.
- **ADR-006** bleibt gültig; Querverweis ergänzt.
- **Directus (später):** Feld `start_pan_x` analog JSON.
