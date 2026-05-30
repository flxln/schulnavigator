# Epic: Tablet/iPad — Layout-Skalierung

**Milestone:** Phase 2  
**ADR:** [ADR-012](../adr/012-tablet-ipad-responsive-layout.md)  
**Status:** geplant — Issues angelegt (#74–#78, 2026-05-28)  
**Abhängigkeit:** [#72](https://github.com/flxln/schulnavigator/issues/72) erledigt; nicht parallel im selben PR vermischen

## Übersicht

| Rolle | Slug | Titel (kurz) | PR-Reihenfolge |
|-------|------|--------------|----------------|
| **Epic (Parent)** | `#74` | Tablet/iPad: Layout-Skalierung | — |
| Unterissue | `#75` | Layout-Container (`max-w` ab `md`) | 1 |
| Unterissue | `#76` | Raum-Viewer / Hero-Höhen + Hotspot-Beschnitt | 2 |
| Unterissue | `#77` | Hub + Startseite (inkl. CSS-px Hit-Areas) | 3 |
| Unterissue | `#78` | Dialog + Medien-Panel (optional) | 4 |

## GitHub-Links

| Issue | URL |
|-------|-----|
| #74 (Epic) | https://github.com/flxln/schulnavigator/issues/74 |
| #75 | https://github.com/flxln/schulnavigator/issues/75 |
| #76 | https://github.com/flxln/schulnavigator/issues/76 |
| #77 | https://github.com/flxln/schulnavigator/issues/77 |
| #78 | https://github.com/flxln/schulnavigator/issues/78 |

## Sync-Regel

1. ~~Issues auf GitHub anlegen~~ — erledigt 2026-05-28.
2. ~~Platzhalter ersetzen~~ — erledigt, echte Nummern #74–#78 eingetragen.
3. Epic-Parent (#74) bei Abschluss aller Unterissues schließen.

---

## Epic `#74` — Tablet/iPad: Layout-Skalierung (Parent)

**Labels:** `design`, `tech`  
**Assignee:** Felix  
**Milestone:** Phase 2

### GitHub-Issue-Body (Vorlage)

```markdown
## Kontext

Die App ist Mobile-first mit `max-w-lg` (~512 px) und gedeckeltem Raum-Hero. Am Schulfest sollen Stationen auch auf **iPads/Tablets** gut nutzbar sein (Tablet-Fallback im Projektplan).

Architekturentscheidung: [ADR-012](https://github.com/flxln/schulnavigator/blob/main/dokumentation/adr/012-tablet-ipad-responsive-layout.md)

Vollständige Spezifikation: [`dokumentation/github-project/epic-tablet-ipad-layout.md`](https://github.com/flxln/schulnavigator/blob/main/dokumentation/github-project/epic-tablet-ipad-layout.md)

## Ziel

Tablet-taugliche UI per Tailwind-Breakpoints (`md` ab 768 px, `lg` ab 1024 px) — **ohne** CSS-Zoom und **ohne** Änderung der Phone-Baseline unter `md`. **Max. Content-Breite cap auf `max-w-3xl` (768 px) auch auf iPad Pro / Desktop** (ADR-012 Punkt 7).

## Unterissues (Reihenfolge)

- [ ] `#75` — Layout-Container
- [ ] `#76` — Raum-Viewer / Hero-Höhen + Hotspot-Beschnitt
- [ ] `#77` — Hub + Startseite (inkl. CSS-px Hit-Areas)
- [ ] `#78` — Dialog + Medien-Panel (optional)

## Nicht im Scope

- Desktop-Layout (breite Sidebars, Multi-Column über Schulfest hinaus)
- Gyro-Mathematik neu erfinden (nur Regression bei `#76`)
- #72 TopBar/Chip (erledigt)
- `DialogPlayer`/Cutscene-Layout (unverdrahtet; bei Reaktivierung separates Issue)

## Epic erledigt wenn

- [ ] Alle Unterissues geschlossen
- [ ] iPad-Testmatrix in `anleitungen/lokal-testen-und-anschauen.md` ergänzt
- [ ] `architektur.md` Abschnitt „Responsive/Tablet" mit Breakpoint-Tabelle, Hero-Strategie und empfohlener Bild-Aspect je Breakpoint ergänzt
- [ ] ADR-012 von `vorgeschlagen` → `entschieden` (Content-Voraussetzung aus `#76` geklärt)
```

### Epic-Akzeptanzkriterien (Checkliste)

- [ ] Phone (375 px): kein visueller Regressionsschaden
- [ ] iPad Mini Portrait (768×1024) und Landscape (1024×768): `/`, `/raum/musik`, `/raum/daz` ohne horizontalen Scroll
- [ ] Gyro: Portrait α + Landscape γ laut bestehender Matrix ([#56](./issues-phase-2.md))
- [ ] Auf iPad Pro 12.9" (1024+): Content auf `max-w-3xl` gedeckelt, sichtbar Leerraum links/rechts ist gewollt
- [ ] `npm run test` + `cd app && npm run build` grün

---

## `#75` — Tablet: Layout-Container (`max-w` responsive)

**Labels:** `design`, `tech`  
**Parent:** `#74`  
**Assignee:** Felix

### Ziel

Die zentrierte Phone-Spalte (`max-w-lg`) auf Tablets verbreitern, ohne Phone zu verändern. Cap bei `lg:max-w-3xl` laut [ADR-012](../adr/012-tablet-ipad-responsive-layout.md) Punkt 7.

### Betroffene Dateien

| Datei | Aktuell | Ziel (Vorschlag) |
|-------|---------|------------------|
| `app/app/page.tsx` | `max-w-lg` | `max-w-lg md:max-w-2xl lg:max-w-3xl` |
| `app/app/raum/[slug]/page.tsx` | `max-w-lg` | wie oben |
| `app/app/eintritt/page.tsx` | `max-w-lg` | wie oben |
| `app/app/eintritt/scan/page.tsx` | `max-w-lg` | Vollbild-Scanner (Shell); Tablet-Fix zentral über `ScanFullscreenShell` |
| `app/app/scan/page.tsx` | `max-w-lg` | siehe Sonderfall „Scan" unten |
| `app/app/stationen/page.tsx` | `max-w-lg` | wie oben |
| `components/station-media-panel.tsx` | inner `max-w-lg` | siehe Sonderfall „Medien-Panel" unten |
| `components/scan/qr-scanner.tsx` | kein Aspect-Cap | `aspect-square md:aspect-[4/3]` o. ä. |

Optional: gemeinsame Utility-Klasse in `globals.css` (z. B. `.sn-page-container`) statt fünfmal Copy-Paste — nur wenn alle Routen identisch bleiben.

### Sonderfall: Phone-Landscape

`md:` startet bei 768 px. **iPhone 14 Pro Max Landscape (852 × 393) triggert `md:`** — ein Phone bekommt also Tablet-Klassen, obwohl Höhe nur 393 px ist.

**Entscheidung in diesem Issue:** Bewusst akzeptiert für Schulfest-Scope. Phone-Landscape ist ein selten genutzter Modus (QR-Scan und Hero brauchen Hochformat). Begründung im PR-Body festhalten. Wenn sich auf echtem Gerät Probleme zeigen (z. B. Hero zu flach bei 55 vh = 216 px): Tablet-Klassen auf Routen begrenzen, bei denen Landscape unwahrscheinlich ist, **oder** kombinierte Media-Query `@media (min-width: 768px) and (min-height: 600px)` per Tailwind-Plugin/Custom-Screen einführen. **Kein präemptiver Custom-Screen ohne nachgewiesenes Problem.**

### Sonderfall: Medien-Panel (Bottom-Sheet)

`station-media-panel.tsx:42` ist `fixed inset-x-0 bottom-0` (viewport-edge-to-edge), mit innerem `max-w-lg` zentriert. Reines Hochsetzen auf `max-w-3xl` macht den Sheet auf 1024-px-Landscape edge-to-edge breit mit viel Leerraum — das fühlt sich nicht mehr wie ein Bottom-Sheet an.

**Entscheidung in diesem Issue:** Ab `md:` **Modal-Variante** (zentriert, `max-w-2xl`, abgerundet auf allen Seiten, mittig statt am unteren Rand) statt edge-to-edge Sheet. Phone (< md): unverändertes Bottom-Sheet.

**Safe-Area beim Modal:** `pb-[max(1rem,env(safe-area-inset-bottom))]` (vom Bottom-Sheet) muss für die Modal-Variante **nicht** mehr unten greifen (Modal hat oben/unten symmetrische Abstände). Stattdessen `mt-[max(1rem,env(safe-area-inset-top))] mb-[max(1rem,env(safe-area-inset-bottom))]` auf dem Modal-Container, damit auf iPad Pro mit Home-Indicator kein Inhalt verdeckt wird.

### Sonderfall: TopBar in `/raum/[slug]`

`raum-station-client.tsx` rendert die TopBar `absolute left-0 right-0 top-0` **innerhalb** des `max-w`-Wrappers. Mit `md:max-w-2xl` endet die TopBar bei ~672 px statt am Viewport-Rand — keine Mobile-App-Konvention.

**Entscheidung in diesem Issue:** TopBar via negative Margin (`-mx-4 md:-mx-8`) edge-to-edge ziehen oder Hero komplett aus dem `max-w`-Wrapper ausbrechen. Variante in der PR begründen.

### Sonderfall: `/scan`-Kamera

`scan-screen.tsx` ist `min-h-[100dvh]` schwarz; `qr-scanner.tsx:168` hat `min-h-[240px]` ohne Aspect-Cap. Ohne Cap streckt sich der Kamera-Sucher auf Tablet ungewollt breit.

**Entscheidung in diesem Issue:** Scanner-Container mit `aspect-square` (Phone) bzw. `md:aspect-[4/3]` capen; Page-Wrapper darf bewusst breiter sein, der Sucher bleibt zentral und proportional.

### GitHub-Issue-Body (Vorlage)

```markdown
Parent: #74 · ADR-012

## Aufgabe

`max-w-lg` auf Haupt-Routen ab Breakpoint `md` (768 px) erweitern bis Cap `lg:max-w-3xl`. Phone (< md) unverändert.

## Akzeptanzkriterien

- [ ] `/`, `/eintritt`, `/eintritt/scan`, `/scan`, `/stationen`, `/raum/musik`: kein `overflow-x` auf 375 px, 768 px, 1024 px
- [ ] Ab `md`: Content nutzt mehr Breite (kein schmaler Streifen mittig auf iPad)
- [ ] Ab `lg`: Content cap bei `max-w-3xl` (kein weiteres Wachsen auf iPad Pro)
- [ ] Medien-Panel: ab `md:` zentriertes Modal, kein edge-to-edge Sheet; Safe-Area-Insets oben + unten respektiert
- [ ] TopBar in `/raum/[slug]`: edge-to-edge auf Tablet (Begründung in PR-Beschreibung)
- [ ] `/scan` Kamera-Sucher: Aspect-Cap greift ab `md:` (kein extrem breiter Sucher)
- [ ] Phone-Landscape (852×393, iPhone 14 Pro Max): App bleibt nutzbar; Entscheidung „akzeptiert" im PR-Body begründet
- [ ] `npm run build` grün

## Nicht im Scope

- Hero-Höhe (#76), Hub-Layout (#77)
```

---

## `#76` — Tablet: Raum-Viewer / Hero-Höhen + Hotspot-Beschnitt

**Labels:** `tech`  
**Parent:** `#74`  
**Assignee:** Felix  
**Abhängigkeit:** `#75` (empfohlen, nicht zwingend)

### Ziel

Panorama-Hero auf Tablets höher darstellen; Konstanten synchron halten; **Hotspot-Beschnitt durch Auto-Zoom prüfen** und Content-Voraussetzung mit MPZ klären (ADR-012 Konsequenz).

### Aktueller Stand (nach #72)

Die Hero-Höhe in `raum-station-client.tsx` ist auf **eine Konstante** vereinfacht: `RAUM_HERO_HEIGHT_CLASS = 'h-[min(58vh,400px)]'` (kein With/Without-Dialog-Switch mehr). Die untenstehenden Werte gehen davon aus, dass diese Vereinfachung erhalten bleibt.

### Betroffene Dateien

| Datei | Hinweis |
|-------|---------|
| `lib/raum-viewer/constants.ts` | `ROOM_VIEWER_HEIGHT_CSS`, `ROOM_VIEWER_MAX_HEIGHT_PX`, **`RECOMMENDED_SOURCE_ASPECT_MIN`** — tablet-aware machen oder dokumentierte `md:`-Overrides |
| `components/raum-station-client.tsx` | `RAUM_HERO_HEIGHT_CLASS` als responsive-Klasse (`md:`-Suffix), **eine** Höhe behalten |
| `components/raum-viewer/room-image-pane.tsx` | Hero `height: 100%` — Container muss mitwachsen |
| `components/raum-viewer/static-room-fallback.tsx` | nutzt `ROOM_VIEWER_HEIGHT_CSS` — mitziehen |
| `components/raum-viewer/raum-viewer-error-boundary.tsx` | nutzt `ROOM_VIEWER_HEIGHT_CSS` — mitziehen |
| `components/dialog/dialog-embedded-bubble.tsx` | `max-w-md` → `md:max-w-lg` (von `#78` hierher gezogen, damit Dialog auf Tablet nicht „verloren mittig" wirkt) |
| `components/raum-viewer/hotspot-overlay.tsx` | Maskottchen `sm:h-[110px]` → `md:h-[130px]` (von `#78` hierher gezogen — Tap-Target skaliert mit Hero) |
| `stations.json` / Bild-Pipeline | ggf. Hotspot-Y-Rebalancing oder neue Bilder (siehe „Content-Voraussetzung" unten) |

### Vorschlag Werte (Startpunkt, im PR feinjustieren)

| Kontext | Phone (unverändert) | `md:` (≥768 px) |
|---------|---------------------|-----------------|
| `RAUM_HERO_HEIGHT_CLASS` | `min(58vh, 400px)` | `md:min(55vh, 520px)` |
| `ROOM_VIEWER_HEIGHT_CSS` (Nicht-Hero, Error/Fallback) | `min(50vh, 360px)` | `md:min(50vh, 460px)` |
| `ROOM_VIEWER_MAX_HEIGHT_PX` (Initial-State `containerH`) | 360 | 460 |

### Content-Voraussetzung (zwingend vor Merge zu klären)

Auto-Zoom in `roomPanZoom` setzt `MIN_PAN_DISPLAY_RATIO = 2` durch. Bei Container 768 × 520 und Bild-Aspect 2.5:1 → `targetAspect = 2 × 768 / 520 ≈ 2.95` → Zoom **1.18×** → effektive Anzeigehöhe **614 px** in 520-px-Container → **~94 px vertikaler Beschnitt**.

Konsequenz: Hotspot-Y-Koordinaten in `stations.json`, die nahe oberem/unterem Bildrand liegen, können **außerhalb von `visibleYNormalRange`** fallen und erzeugen die Dev-Warnung `[RaumViewer] Hotspot „…" y=… liegt außerhalb …`.

**Optionen (mit MPZ):**

1. **Option A:** `RECOMMENDED_SOURCE_ASPECT_MIN` auf `3.0` (oder höher) anheben → Bestandsbilder ggf. neu liefern lassen (Issue **#17**).
2. **Option B:** `md:`-Hero-Höhe niedriger ansetzen (z. B. `min(45vh, 460px)`) → Beschnitt minimieren, dafür weniger eindrucksvoller Hero auf Tablet.
3. **Option C:** Hotspot-Y-Werte aller Stationen rebalancieren (alle `stations.json`-Einträge anfassen).

**Fallback-Deadline:** MPZ-Anfrage zu Option A muss **bis spätestens 2 Wochen vor Schulfest (= 2026-06-12)** beantwortet sein. Liegt zu dem Zeitpunkt keine Lieferzusage mit Termin **vor dem 22.06.** vor, wird automatisch **Option B** umgesetzt — ohne weitere Diskussion, damit der Tablet-Layout-Pfad nicht das Schulfest blockiert. Option C nur dann, wenn A und B beide ausfallen.

Gewählte Option im PR-Body begründen und in ADR-012 als Folge-Entscheidung nachtragen (Status: `vorgeschlagen` → `entschieden`).

### Orientierungswechsel (iPad rotiert Portrait ↔ Landscape)

Beim Rotieren ändert sich gleichzeitig: Viewport (768×1024 ↔ 1024×768), `vh`-Einheit (Hero-Höhe springt), Gyro-Sensor-Achse (α ↔ γ), aktive Tailwind-Klassen (mit/ohne `md:`-Override), Pan-Offset wird ungültig.

**Bestehendes Verhalten (`room-image-pane.tsx:155`):** `ResizeObserver` mit Schwelle `RESIZE_RESET_PX = 5` setzt bei jeder relevanten Container-Änderung `neutralAngle`, `neutralCalibrated`, `neutralSamples` zurück und erhöht `neutralEpoch` → der Effekt in Z. 175 kalibriert neu (`NEUTRAL_CALIB_MS = 500 ms`). **Das deckt den Rotationsfall bereits ab** — die α↔γ-Umschaltung passiert über `axisEpoch` im selben Hook.

**Was in diesem Issue zu prüfen ist:**

- [ ] `panPx` wird beim Rotieren nicht hart auf `0` zurückgesetzt, sondern bleibt während der 500-ms-Kalibrierung stehen und übernimmt danach den neuen Neutralwert (kein sichtbarer Sprung).
- [ ] Wenn `containerH` durch `md:`-Wechsel sich ändert (Hero von 400 → 520 px), läuft `clampPan` (Z. 142) auf den neuen `maxPan` — sanft via Tailwind-Transition wäre ideal, ist aber für Schulfest nicht erforderlich.
- [ ] Manueller Test in iPad-Matrix (siehe Testmatrix unten): **drei Rotationen** in Folge auf `/raum/musik`, danach Gyro-Pan weiterhin funktional.

**Keine neue Pan-Mathematik** in diesem Issue — die bestehende Logik wird nur unter dem neuen Höhen-Regime verifiziert.

### Initial-Container-Höhe (Code-Kommentar)

`room-image-pane.tsx:98` initialisiert `containerH` mit `ROOM_VIEWER_MAX_HEIGHT_PX` (JS-Zahl, kein `md:`-Switch möglich). Auf Tablet stimmt der Initial-Wert nicht. **Praktisch harmlos**, weil das `<Image>` erst rendert `if (naturalW > 0 && effectiveDisplayW > 0)` (Z. 508), und bis dahin `ResizeObserver` längst gefeuert hat — kein sichtbarer Flash.

**Anforderung in diesem Issue:** Code-Kommentar oberhalb der `useState`-Zeile, der genau diese Annahme festhält, damit ein zukünftiger Refactor (z. B. „Bild ohne `naturalW`-Guard rendern") die stille Voraussetzung nicht bricht. Keine Logik-Änderung.

### Tests

> **Voraussetzung:** Im #72-Plan waren `top-bar.test.tsx`, `room-image-pane.test.tsx` und `raum-station-client.test.tsx` vorgesehen. **Aktuell existieren diese Tests nicht** (`/app/**/*.test.*` zeigt nur `raum-viewer-math.test.ts` und Math-Tests). Vor `#76` entweder nachholen oder das vorhandene `raum-viewer-math.test.ts` als alleinige Regression akzeptieren.

Neue/erweiterte Tests in diesem Issue:
- `raum-viewer-math.test.ts`: zweiter Test-Case mit Tablet-Container (768 × 520) — prüft `effectiveDisplayW / containerW ≥ MIN_PAN_DISPLAY_RATIO` für die in Option A/B/C beschlossene Bild-Aspect.
- `stations-hotspot-coverage.test.ts` *(neu)*: lädt alle `stations.json`-Einträge, prüft pro Station, dass alle Hotspot-Y im `visibleYNormalRange` für Phone **und** Tablet-Container liegen.

### GitHub-Issue-Body (Vorlage)

```markdown
Parent: #74 · ADR-012

## Aufgabe

Raum-Hero und Viewer-Konstanten für Tablet vergrößern. Gyro-Pan und Hotspots müssen weiter funktionieren. Hotspot-Beschnitt durch Auto-Zoom mit MPZ klären.

## Akzeptanzkriterien

- [ ] `/raum/musik` auf 768×1024: sichtbar größerer Hero als auf 375×667
- [ ] Auto-Zoom / `MIN_PAN_DISPLAY_RATIO` unverändert in Logik (keine Math-Änderung)
- [ ] iPad Portrait: Armschwenk (α); Landscape: γ — keine Pan-Sprünge bei Orientierungswechsel
- [ ] **Rotationstest:** Drei Rotationen Portrait↔Landscape auf `/raum/musik`, danach Gyro weiterhin funktional, keine Pan-Sprünge
- [ ] **Keine `[RaumViewer] Hotspot …` Warnung** auf 768×520 für alle Stationen (Dev-Console grep)
- [ ] `stations-hotspot-coverage.test.ts` grün für Phone- **und** Tablet-Container
- [ ] Sprechblase und Maskottchen skalieren ab `md:` proportional (siehe Tabelle)
- [ ] Stations-Chip (#72) und TopBar unverändert bedienbar
- [ ] Code-Kommentar oberhalb `containerH`-`useState` dokumentiert die `naturalW`-Render-Guard-Annahme
- [ ] Vitest grün
- [ ] Gewählte Content-Option (A/B/C) im PR-Body begründet und in ADR-012 nachgetragen
- [ ] Fallback-Deadline 2026-06-12 dokumentiert (Issue-Kommentar oder PR-Beschreibung)

## Nicht im Scope

- Hub (#77), DialogPlayer/Cutscene
```

---

## `#77` — Tablet: Hub + Startseite (inkl. CSS-px Hit-Areas)

**Labels:** `design`, `tech`  
**Parent:** `#74`  
**Assignee:** Felix  
**Abhängigkeit:** `#75`

### Ziel

Isometrisches Schulhaus und Fortschritts-Chrome nutzen die breitere Spalte; keine neue Hub-Logik (#21/#58). **Zusätzlich: Touch-Target-Berechnung von SVG-Einheiten auf CSS-px umstellen** — kommt auch der Phone-Baseline zugute.

### Hit-Area-Problem (ADR-012 Konsequenz)

`isometric-schoolhouse.tsx:14` hat `MIN_HIT_PX = 44`, expandiert in `expandHitRect` in **SVG-viewBox-Einheiten (800 × 520)**. Effektive CSS-px-Tap-Fläche skaliert mit Container-Breite:

| Container | CSS-px pro 44 SVG-Einheit |
|-----------|---------------------------|
| Phone ~480 px | **26 px** ← deutlich unter 44 |
| iPad `md:max-w-2xl` 672 px | **37 px** ← unter 44 |
| iPad `lg:max-w-3xl` 768 px | **42 px** ← knapp |

**Fix:** `MIN_HIT_PX` als CSS-px-Konstante behalten und beim Rendern zurück in viewBox-Einheiten rechnen:

```tsx
// Beispiel-Skizze
const svgRef = useRef<SVGSVGElement>(null)
const [scaleFactor, setScaleFactor] = useState(1) // viewBox-Einheit pro CSS-px

useEffect(() => {
  if (!svgRef.current) return
  const ro = new ResizeObserver(entries => {
    const renderW = entries[0]?.contentRect.width ?? 0
    if (renderW > 0) setScaleFactor(800 / renderW) // 800 = viewBox width
  })
  ro.observe(svgRef.current)
  return () => ro.disconnect()
}, [])

// In expandHitRect: MIN_HIT_PX * scaleFactor statt MIN_HIT_PX
```

### Hub-Höhe: `min-h` vs. `aspect-ratio`

`hub-with-progress.tsx:21` kombiniert `aspect-[800/520]` mit `min-h-[40vh]`. CSS-Verhalten: `min-height` gewinnt, wenn die aspect-ratio-abgeleitete Höhe darunter liegt — dann wird die Box höher als das Bildverhältnis, das SVG bleibt zentriert und es entsteht **vertikaler Leerraum** über/unter dem Schulhaus.

| Container | Aspect-Höhe | `min-h-[40vh]` (iPad Portrait, 1024 h) | Welche gewinnt |
|-----------|-------------|----------------------------------------|----------------|
| Phone 480 px | 312 px | 410 px | min-h |
| iPad 672 px (`md`) | 437 px | 410 px | aspect |
| iPad 768 px (`lg`) | 499 px | 410 px | aspect |

**Entscheidung in diesem Issue:** Auf Tablet **kein zusätzliches `md:min-h-*`** — aspect-ratio reicht und produziert die korrekte Höhe (437–499 px). Auf iPad Mini Portrait (verfügbare Höhe ~950 px nach URL-Bar) bleibt Platz für Header + Progress + Button ohne Scroll. Falls in der QA Scroll auftritt: `max-h` an aspect-Container statt zusätzliches `min-h`.

**Konsequenz für Phone:** `min-h-[40vh]` bleibt (Box wäre sonst nur 312 px hoch), Layout dort unverändert.

### Betroffene Dateien

| Datei | Hinweis |
|-------|---------|
| `components/home/home-screen.tsx` | Hub-Container — **kein** `md:min-h-*`, aspect-ratio gewinnt ab `md:` |
| `components/schoolhouse/hub-with-progress.tsx` | gleiche Aspect-Box, mitziehen |
| `components/schoolhouse/isometric-schoolhouse.tsx` | **`MIN_HIT_PX` in CSS-px-Logik überführen** (s. o.); ggf. `max-h` auf sehr hohen Tablets, **kein** zusätzliches `min-h` |

### GitHub-Issue-Body (Vorlage)

```markdown
Parent: #74 · ADR-012

## Aufgabe

Startseite-Hub auf Tablet proportional vergrößern (innerhalb der in #75 verbreiterten Spalte). Freischalt-Logik unverändert. **Touch-Targets der Hub-Fenster auf CSS-px-Garantie umstellen** (ADR-012 Konsequenz).

## Akzeptanzkriterien

- [ ] `/` auf iPad: Hub wirkt nicht „Mini-Handy", Touch-Ziele der Fenster **≥ 44 CSS-px** (DevTools messen, nicht SVG-Einheit)
- [ ] Auf Phone (375 px): Touch-Ziele weiterhin ≥ 44 CSS-px (Phone-Baseline profitiert mit)
- [ ] iPad Mini Portrait (768×1024): **`/` ohne vertikalen Scroll** (Header + Hub + Progress + CTA + Ribbon in einem Viewport)
- [ ] Hub-Container hat **kein** `md:min-h-*` — aspect-ratio bestimmt die Höhe ab `md:`
- [ ] Fortschritt „n von 11" lesbar, kein Überlappen mit Hub
- [ ] `fest` / `heft` Verhalten wie #21 — kein Regressionstest-Stempel nötig außer Smoke
- [ ] `prefers-reduced-motion` / Sparkle (#22) unberührt

## Nicht im Scope

- Neue Hub-Darstellung, `ground-mid`-Slot (#58 Nacharbeit)
```

---

## `#78` — Tablet: Dialog-Polish + Medien-Panel-Feinschliff (optional)

**Labels:** `design`, `tech`  
**Parent:** `#74`  
**Assignee:** Felix  
**Abhängigkeit:** `#75`, `#76` (empfohlen)

### Ziel

Restliche Tablet-UX-Politur. **Basis-Skalierung** für Sprechblase (`md:max-w-lg`) und Maskottchen (`md:h-[130px]`) ist in `#76` enthalten, damit Schulfest nicht von diesem optionalen Issue abhängt. Die **Medien-Panel-Modal-Variante** ab `md:` ist in `#75` enthalten.

### Referenz

[`kurzfristige-ideen/dialog-maskottchen-abstand-und-pan.md`](../kurzfristige-ideen/dialog-maskottchen-abstand-und-pan.md)

### Betroffene Dateien

| Datei | Hinweis |
|-------|---------|
| `components/dialog/dialog-embedded-bubble.tsx` | Feinschliff: Abstand Bubble ↔ Maskottchen-Gruppe, optional Bubble-mit-Pan-Folge (eigenes Konzept) |
| `components/raum-viewer/hotspot-overlay.tsx` | Maskottchen-Layout-Polish auf größerem Hero (Position, Schatten) |
| `components/station-media-panel.tsx` | Feinschliff Modal-Variante aus `#75` (Padding, Schließen-Position, Aspect-Cap für Video) |

### Bewusst NICHT in diesem Issue

- `DialogPlayer` / Cutscene (`components/dialog/dialog-player.tsx`) — derzeit unverdrahtet, ADR-012 schließt sie explizit aus dem Scope aus. Bei Reaktivierung: separates Issue.
- Bubble-mitpannt — komplexes UX-Feature, eigenes Konzept-Issue.

### GitHub-Issue-Body (Vorlage)

```markdown
Parent: #74 · ADR-012

## Aufgabe

Tablet-UX-Polish für Dialog-Gruppe und Medien-Panel. Basis-Skalierung ist bereits in #76/#75 enthalten — hier nur Feinschliff.

## Akzeptanzkriterien

- [ ] `/raum/daz` auf iPad: Sprechblase + Figuren als eine Gruppe, ausgewogene Abstände
- [ ] Dialog-Ende (TopBar X) und Chip-Zentrieren (#72) weiter nutzbar
- [ ] Medien-Panel-Modal: Video respektiert `aspect-video`, kein Stretching auf 768 px Breite
- [ ] Schließen-Button im Modal gut erreichbar (oben rechts, ≥ 44 CSS-px)

## Kann verschoben werden

Wenn #75+#76 für Schulfest reichen — als Follow-up nach 26.06. markieren. Basis-Tablet-Tauglichkeit ist auch ohne #78 gegeben.
```

---

## Testmatrix (Epic, für `lokal-testen-und-anschauen.md`)

| Viewport | Gerät (Preset) | Routen | Prüfen |
|----------|----------------|--------|--------|
| 375×667 | iPhone SE | `/`, `/raum/musik` | Baseline unverändert |
| 768×1024 | iPad Mini Portrait | `/`, `/raum/musik`, `/raum/daz`, `/scan` | Breite + Hero + Kamera-Aspect |
| 1024×768 | iPad Landscape | `/raum/musik` | Gyro γ, kein Sprung, Hotspot-Visibility |
| 834×1194 | iPad Pro 11" | `/raum/daz` | Dialog-Layout-Polish (`#78`) |
| 1024×1366 | iPad Pro 12.9" | `/`, `/raum/musik` | `lg:max-w-3xl` Cap greift, Leerraum gewollt |

**HTTPS** für Gyro auf echten Geräten; lokal DevTools reicht für Layout.

---

## Vorschlag: Abschnitt „Responsive/Tablet" in `architektur.md`

Skelett (im Rahmen des Epic-Abschlusses einzuarbeiten):

```markdown
## Responsive & Tablet

### Breakpoints

| Klasse | min-Breite | Zielgerät |
|--------|------------|-----------|
| (default) | 0 | Phone Portrait (Baseline: 375 px) |
| `md:` | 768 px | iPad Mini Portrait, große Phones Landscape |
| `lg:` | 1024 px | iPad Landscape, iPad Pro |

### Content-Container

Alle Haupt-Routen nutzen `max-w-lg md:max-w-2xl lg:max-w-3xl`. **Cap bei `max-w-3xl` (768 px)** auch auf Desktop — keine Sidebar-Architektur (ADR-012).

### Hero-Strategie

| Element | Phone | `md:` |
|---------|-------|-------|
| `RAUM_HERO_HEIGHT_CLASS` | `min(58vh,400px)` | `min(55vh,520px)` |
| `ROOM_VIEWER_HEIGHT_CSS` (Error/Fallback) | `min(50vh,360px)` | `min(50vh,460px)` |
| TopBar in `/raum/[slug]` | innerhalb Wrapper | edge-to-edge (negative Margin) |

### Empfohlene Bild-Aspect

`MIN_PAN_DISPLAY_RATIO = 2` erzwingt Auto-Zoom mit vertikalem Beschnitt. Damit Hotspots auf allen Breakpoints sichtbar bleiben:

| Container | Min. Bild-Aspect (Breite : Höhe) |
|-----------|----------------------------------|
| Phone (≤ 480 px) | **2.5 : 1** (bestehende Empfehlung) |
| Tablet (768 px) | **≥ 3.0 : 1** (siehe ADR-012) |

Verifikation via `stations-hotspot-coverage.test.ts` und Dev-Console-Warnung `[RaumViewer] Hotspot „…" y=…`.

### Hub-Touch-Targets

`MIN_HIT_PX = 44` in `isometric-schoolhouse.tsx` wird **in CSS-px** garantiert (über `ResizeObserver` und Rückrechnung in SVG-viewBox-Einheiten), nicht in viewBox-Einheiten. Gilt auf Phone und Tablet gleichermaßen.

### Hub-Box

- Phone: `aspect-[800/520] min-h-[40vh]` — `min-h` gewinnt (Box höher als Bildverhältnis).
- `md:` und darüber: **kein** zusätzliches `md:min-h-*`. Aspect-ratio bestimmt die Höhe (~437 px bei `md`, ~499 px bei `lg`).

### Medien-Panel

- Phone: Bottom-Sheet (`fixed inset-x-0 bottom-0`).
- `md:` und darüber: zentriertes Modal (`max-w-2xl`, abgerundet auf allen Seiten, Safe-Area-Margins oben/unten).

### Typografie

Keine pauschale `md:text-*`-Skalierung. Zeilenlänge bei `max-w-3xl` (~80 Zeichen) bewusst akzeptiert (Schulfest-Scope).

### Phone-Landscape

`md:` triggert ab 768 px Breite — iPhone Pro Max Landscape (852 px) bekommt also Tablet-Klassen. Bewusst akzeptiert: Phone-Landscape ist Randmodus. Bei nachgewiesenen Problemen Custom-Screen `tablet: { raw: '(min-width: 768px) and (min-height: 600px)' }` einführen.

### Android-Tablets

Best-Effort, kein QA-Gate. Stichprobenartig im DevTools-Preset testen. Schulfest-Hardware sind iPads (ADR-012 Punkt 1).
```

---

## Abgrenzung zu anderen Issues

| Issue | Verhältnis |
|-------|------------|
| **#56** Mobil-Härtung | erledigt — Viewport/Gyro; Epic baut Layout darauf auf |
| **#72** TopBar/Chip | erledigt — nicht in Epic-PRs ändern; Test-Lücken aus #72 (siehe `#76` Voraussetzung) |
| **#17** Raumfotos (extern) | tangiert: Tablet-Hero benötigt ggf. Bilder mit höherer Aspect (siehe `#76` Content-Voraussetzung) |
| **#41** Tablet-Fallback (Phase 4) | Hardware/Prozess; Epic = Software-UI |
| **#24** i18n | unabhängig |
| `DialogPlayer` / Cutscene | unverdrahtet, bewusst ausgeschlossen — bei Reaktivierung separates Issue |
