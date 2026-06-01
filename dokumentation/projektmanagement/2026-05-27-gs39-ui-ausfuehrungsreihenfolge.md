# GS39 UI — Ausführungsreihenfolge

Präzise Abfolge für die Umsetzung des Design-Konzepts „Virtueller Schulrundgang" in 5 PRs.
Jeder Schritt referenziert den zugehörigen Plan und Abschnitt.

- **Plan 1** = `.cursor/plans/gs39_ui_aus_design-konzept_936de8e3.plan.md` (technische Details)
- **Plan 2** = `.cursor/plans/gs39_ui_phase_2_integration_7859e3c8.plan.md` (Governance + PR-Struktur)

---

## Vor dem ersten Commit — kein PR

| Schritt | Plan | Abschnitt | Was |
|---------|------|-----------|-----|
| 1 | Plan 2 | Schritt 0 — ADR-009 | `dokumentation/adr/009-hub-isometrisch.md` anlegen aus Template — **erledigt 2026-05-27** |
| 2 | Plan 2 | Schritt 0 — Doku-Sync | `entscheidungen.md`, `projektplan.md`, `architektur.md`, `issues-phase-2.md` aktualisieren — **erledigt 2026-05-27** |
| 3 | Plan 2 | Schritt 0 — GitHub | Epic #58 + Teil-Issues #59–#63 anlegen (Milestone Phase 2) — **erledigt 2026-05-27** |
| 4 | *(extern)* | — | L13: `ground-mid`-Slot mit Sten/Tina klären — welche Station, Sonder-Interaktion? |

---

## PR1 — Governance

Nur Doku, kein App-Code.

| Schritt | Plan | Abschnitt | Was |
|---------|------|-----------|-----|
| 5 | Plan 2 | Schritt 0 | ADR-009 + alle Doku-Dateien committen — **erledigt 2026-05-27** (Branch `docs/gs39-ui-pr1-governance`) |

---

## PR2 — Assets & Design-System

| Schritt | Plan | Abschnitt | Was |
|---------|------|-----------|-----|
| 6 | Plan 1 | Phase 0, Punkt 2 | Logos nach `app/public/brand/logos/`; L11: Git-Policy in `brand/README.md` festlegen (committed) — **erledigt 2026-05-27** |
| 7 | Plan 1 | Phase 0, Punkt 1 | `app/design-reference/README.md` als Verweis auf Submodul-Ordner — **erledigt 2026-05-27** |
| 8 | Plan 1 | Phase 0, Punkt 3 | Tokens abgleichen → `npm run validate:tokens` grün — **erledigt 2026-05-27** |
| 9 | Plan 2 | Schritt 2 — Fonts | `layout.tsx`: Caveat_Brush + Caveat via `next/font/google` — **erledigt 2026-05-27** |
| 10 | Plan 2 | Schritt 2 — Styles | `sn-theme.css` neu; relevante Klassen aus `app-styles.css` portieren; in `globals.css` importieren — **erledigt 2026-05-27** |
| 11 | Plan 1 | Phase 1 — Primitives | `components/ui/`: `Gs39Button`, `Gs39Chip`, `Gs39Card`, `TopBar`, `Gs39Progress`, `FestiveDecor`, `SparkleBurst`, `Toast` — **erledigt 2026-05-27** |
| 12 | Plan 1 | Phase 1 — L9 | Accent-Farben als Hex-Literale vorab berechnen (kein `color-mix()` im SVG) — **erledigt 2026-05-27** (`lib/gs39-brand-colors.ts`) |

---

## PR3 — Isometrischer Hub

> **Achtung: atomar — nicht partial deployen.** `buildSchoolhouseSegments` wirft hart; ein halbfertiger Zustand bricht den Build sofort.

| Schritt | Plan | Abschnitt | Was |
|---------|------|-----------|-----|
| 13 | Plan 2 | Schritt 3, Punkt 1 | `schoolhouse-isometric-map.ts`: 11 Slugs → room + nr + accent (Hex); Vitest-Tests — **erledigt 2026-05-27** |
| 14 | Plan 2 | Schritt 3, Punkt 2 | `isometric-schoolhouse.tsx` portieren; L3: transparente Hit-Area-Overlays ≥ 44×44 viewBox-px; L2: `tabIndex`, `role="button"`, `onKeyDown` pro Fenster; L7: `isHydrated`-Guard wie in `hub-with-progress.tsx`; L10: `fontFamily="var(--font-display)"` + Render-Test auf Gerät — **erledigt 2026-05-27** (Geräte-Render-Test manuell) |
| 15 | Plan 1 | Phase 2 — L8 | `hub-mode.ts` API komplett neu definieren (kein Ersetzen — alle Typen, Exports, 4 Tests neu schreiben) — **erledigt 2026-05-27** |
| 16 | Plan 1 | Phase 2, Punkt 3 — L4 | `schoolhouse-segments.ts` + `schoolhouse-layout.ts` + `schoolhouse-svg.tsx` + Puzzle-Overlays in `schoolhouse-hub.tsx` entfernen; `puzzleSegmentId` aus `stations.json` und allen TS-Typen entfernen — **erledigt 2026-05-27** |
| 17 | Plan 2 | Schritt 3, Punkt 4 | `schoolhouse-sr-nav.tsx` auf neue Slugs/Rooms anpassen (bleibt als versteckte `<Link>`-Liste für Screen-Reader) — **erledigt 2026-05-27** |
| 18 | Plan 2 | Schritt 3 | `npm run test` → alle Tests grün; `npm run build` — **erledigt 2026-05-27** |

---

## PR4 — Home + Eintritt + `/stationen`

| Schritt | Plan | Abschnitt | Was |
|---------|------|-----------|-----|
| 19 | Plan 1 | Phase 3.1 | `home-screen.tsx`: Brand-Strip, Hero, `IsometricSchoolhouse`, `Gs39Progress`, Scan-CTA, Ribbon — **erledigt 2026-05-27** |
| 19b | — | — | Modusabhängige CTAs auf `/` (Fest Split-Scan, Heft nur Vorschlag in Karte) — **erledigt 2026-06-01**, Issue **#84**, ADR-009 Nachtrag |
| 20 | Plan 1 | Phase 3.2 | `eintritt/page.tsx`: Brush-Headline, Karte, Fehlerkarten — keine Demo-Buttons — **erledigt 2026-05-27** (`eintritt-screen.tsx`) |
| 21 | Plan 1 | Phase 3.5 | `app/stationen/page.tsx` neu: Station-Cards mit Lock/Visited — **erledigt 2026-05-27** (`stationen-screen.tsx`) |
| 22 | Plan 1 | Phase 3.5 — L1 | `middleware.ts:82`: `'/stationen'` zum `config.matcher` hinzufügen — **erledigt 2026-05-27** |
| 23 | Plan 1 | Phase 3.4 — L5 | `highlightSlug`-Mechanismus: „Zurück"-Button mit `/?highlight=`; `page.tsx` liest `searchParams.highlight`; danach `router.replace('/')` — **erledigt 2026-05-27** (`highlight-slug-sync.tsx`, `station-back-link.tsx`) |

---

## PR5 — Raum + Scan + Abschluss + Doku

| Schritt | Plan | Abschnitt | Was |
|---------|------|-----------|-----|
| 24 | Plan 1 | Phase 3.3 | `scan/page.tsx` + `qr-scanner.tsx`: Chrome, Rahmen, Copy — keine Funktionsänderung — **erledigt 2026-05-27** (`scan-screen.tsx`, `chrome`-Prop) |
| 25 | Plan 1 | Phase 3.4 | `raum-station-client.tsx`: Layout aus `StationScreen` um bestehenden `RaumViewer` — Gyro unverändert — **erledigt 2026-05-27** (`layout="hero"`) |
| 26 | Plan 1 | Phase 3.6 — L6 | `SparkleBurst` bei 11/11 mit `sn_sparkle_done`-Guard in `localStorage` — **erledigt 2026-05-27** (`lib/sparkle-done.ts`) |
| 27 | Plan 1 | Phase 4 | `stations.json` optional um `schoolhouse`-Feld ergänzen (oder nur in Map belassen) — **entfallen** (nur `schoolhouse-isometric-map.ts`) |
| 28 | Plan 1 | Phase 4 — Doku | `architektur.md`: Hub isometrisch; `lokal-testen-und-anschauen.md`: `/stationen` ergänzen — **erledigt 2026-05-27** |
| 29 | Plan 2 | Schritt 5 — QA | Checkliste: Build, Tests, `curl /stationen` ohne Cookie → 302, Touch iOS ≥ 44px, Tastatur-Navigation, SVG-Fonts auf Gerät, SparkleBurst-Guard, `highlightSlug`-Flow — **Checkliste in** `lokal-testen-und-anschauen.md` |
| 30 | Plan 2 | Schritt 5 — Abnahme | Slug↔Fenster-Tabelle + `ground-mid`-Zuordnung mit Auftraggeber durchgehen — **offen** (L13); Epic **#58** + #59–#63 auf GitHub **geschlossen** 2026-05-27 |

---

## Übersicht

| PR | Inhalt | Tage (ca.) | Kritische Lücken |
|----|--------|------------|-----------------|
| PR1 | Governance: ADR-009, Doku, Issues | 0,5 | L13 (ground-mid vorab klären) |
| PR2 | Assets, Fonts, `sn-theme`, Primitives | 1–2 | L9, L11 |
| PR3 | Isometrischer Hub (atomar) | 2–3 | L2, L3, L4, L7, L8, L10 |
| PR4 | Home, Eintritt, `/stationen` | 1–2 | — (L1, L5 erledigt) |
| PR5 | Raum, Scan, Sparkle, Doku | 1,5–2 | L13 (Abnahme); L6 erledigt |
| **Σ** | | **6–9** | |

Demo-Termin 10.06.: PR1–PR4 müssen vorher merged sein. PR3 ist der kritischste — frühzeitig beginnen.
