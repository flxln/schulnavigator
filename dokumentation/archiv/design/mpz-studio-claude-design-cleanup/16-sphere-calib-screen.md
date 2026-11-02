# Sphere-Kalibrierung — eigener MPZ-Screen (Option A)

**Datum:** 2026-06-22  
**Status:** ✅ umgesetzt (#201, 2026-06-23) — Route `/mpz/calib/sphere/[slug]` live  
**Entscheidung:** Option A — symmetrisch zur Flat-Kalibrierung

---

## Kernaussage

360°-Hotspots werden künftig über einen **eigenen Studio-Vollbild-Screen** kalibriert — nicht mehr primär über `/raum/{slug}?hotspot-calib=1` in der Besucher-App.

| | Flat (heute) | Sphere (Ist) | Sphere (Soll) |
|---|--------------|--------------|---------------|
| Route | `/mpz/calib/flat/[slug]` | `/raum/{slug}?hotspot-calib=1` | **`/mpz/calib/sphere/[slug]`** |
| Shell | `FlatCalibShell` | Overlay auf Raumseite | **`SphereCalibShell`** (analog) |
| Layout | Panorama links, Seitenpanel rechts | Schwebendes Panel unten | **Panorama links, Seitenpanel rechts** |
| Screen-ID | S13 | S14 (nur Hinweis) | **S14** (Vollscreen) |

---

## UI-Soll (an Flat angelehnt)

Gleiche visuelle Sprache wie [`flat-calib-shell.tsx`](../../../app/components/mpz-studio/flat-calib-shell.tsx):

1. **Top-Bar:** `← Zurück` · `Sphere-Kalibrierung · {slug}` · Badge `calib · nur lokal`
2. **Tabs:** `Hotspots` | `Startblick` (wie Flat: Hotspots / Startpan)
3. **Hauptbereich:**
   - Links: PSV-360°-Viewer (Klick setzt yaw/pitch)
   - Rechts: Seitenpanel (~272 px) — Hotspot wählen, Koordinaten, „In stations.json übernehmen“
4. **Kein** Besucher-Chrome (Dialog, Coach, TopBar der Raumseite)

### Hotspots-Tab

- Hotspot-Dropdown (`hotspots360[]`)
- Nach Klick: Anzeige yaw° / pitch°
- CTA: **In stations.json übernehmen** → bestehende API `POST /api/mpz/hotspots/sphere`
- Bestehende Hotspots als Marker im Panorama (optional, analog Flat)

### Startblick-Tab

- Live-Readout yaw/pitch der aktuellen Kameraposition
- CTA: **Als Startblick übernehmen** → `POST /api/mpz/view/sphere`

---

## Technik (Wiederverwendung)

| Bestand | Rolle im Soll |
|---------|----------------|
| `sphere-hotspot-calib-overlay.tsx` | Logik/UI in eingebettetes Panel migrieren (nicht Bottom-Overlay) |
| `sphere-raum-viewer-inner.tsx` + PSV | Viewer-Komponente für Calib-Route extrahieren oder schlank einbinden |
| `sphereCalibFromClick` | unverändert |
| `POST /api/mpz/hotspots/sphere` | unverändert |
| `POST /api/mpz/view/sphere` | unverändert |
| `lib/mpz-studio-calib.ts` | Link-Helfer auf `/mpz/calib/sphere/{slug}` umstellen |

**Neu (Phase 4, noch nicht bauen):**

- `app/app/mpz/calib/sphere/[slug]/page.tsx`
- `app/components/mpz-studio/sphere-calib-shell.tsx`
- `app/components/mpz-studio/sphere-hotspot-calib.tsx` (embedded, analog `flat-hotspot-calib.tsx`)

---

## Einstiege nach Umsetzung

| Von | Aktion |
|-----|--------|
| Tab Hotspots (360°-Station) | Button „Sphere kalibrieren“ → `/mpz/calib/sphere/{slug}` |
| `/mpz/calib/flat/{slug}` bei `equirectangular` | Redirect/Link → `/mpz/calib/sphere/{slug}` (statt `?hotspot-calib=1`) |

### Legacy (optional)

`/raum/{slug}?hotspot-calib=1` kann vorerst als Fallback bleiben oder später entfernt werden — **nicht** primärer MPZ-Workflow.

---

## Claude Design

Screen **S14** mockuppen wie **S13** (Empty/Filled/Error/Loading):

- Station `klassenzimmer` oder `musik` (`viewer: equirectangular`)
- Zustände: kein Klick, Marker gesetzt, Speichern erfolgreich, Fehler (kein Hotspot)

---

## Verknüpfung

- [02-screens-v2.1-und-user-stories.md](./02-screens-v2.1-und-user-stories.md) — S13, S14
- [ROADMAP.md](./ROADMAP.md) — Phase 3.6, Phase 4.8
