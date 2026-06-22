# MPZ Studio v2.1 — Screens, User-Stories und Ist-Probleme

**Verbindlicher UI-Scope für Claude Design (Cleanup).** Alle umgesetzten Module — nicht nur v0.

Quellen: [mpz-studio.md](../../spezifikationen/mpz-studio.md), [mpz-studio-ui.md](../../ideen/archiv/mpz-studio-ui.md), Ist-Code in `app/components/mpz-studio/`.

---

## Screen-Inventar

### Shell & Querschnitt

| # | Route / Screen | Zweck | Pflicht-Zustände |
|---|----------------|-------|------------------|
| S1 | Studio-Shell | Sidebar, Top-Bar, Dev-Badge, Save-CTA | default, narrow (Sidebar collapsed) |
| S2 | Plan-A-Banner | Fallback-Hinweis CLI | visible |
| S3 | Save & Validate Panel | Ergebnis nach globalem Save | idle, running, success, rollback-error |
| S4 | Dashboard | Gesamt-Validierung, Stationen mit Fehlern | ok, errors, loading |

### Stationen

| # | Route / Screen | Zweck | Pflicht-Zustände |
|---|----------------|-------|------------------|
| S5 | Stationen-Grid | 12 Slugs wählen | partial, all-ok |
| S6 | Station Detail — Header | Titel, Hub-Nr, Viewer-Badge, Ampel, Vorschau-Link | flat, 360°, issues |
| S7 | Tab Stammdaten | titel, beschreibung, viewer, Raumbild-Upload | flat, equirectangular |
| S8 | Tab Medien | Tabelle, Bearbeiten, Löschen, Hinzufügen | empty, list, editing |
| S9 | Medien-Upload-Modal | 6 Typen, Drag & Drop, Pfade | default, link/embed, error |
| S10 | Medien bearbeiten | Inline-Formular / PATCH, Datei ersetzen, Thumbnail | metadata, replace-file |
| S11 | Tab Hotspots | Flat + 360° Tabellen, CRUD, Kalibrier-Links | empty, list, dialog-hotspot |
| S12 | Hotspot anlegen/bearbeiten | Formular + Icon-Upload | medium, dialog |
| S13 | Flat-Kalibrierung `/mpz/calib/flat/[slug]` | Klick → x/y | idle, marker, applied |
| S14 | Sphere-Kalibrierung `/mpz/calib/sphere/[slug]` | Klick → yaw/pitch; Layout wie S13 | idle, marker, applied, startblick |
| S15 | Tab Dialog | **alle Stationen** — Empty „Dialog hinzufügen“ oder Segment-Zeilen (Text + Audio), Gruppen, Bubble | no-dialog, empty-segments, filled, row-upload-play |

### Globale Module (Sidebar)

| # | Route / Screen | Zweck | Pflicht-Zustände |
|---|----------------|-------|------------------|
| S17 | Coach `/mpz/studio/coach` | CRUD coach-messages | empty, list, form |
| S18 | Embeds & Links `/mpz/studio/embeds` | Globale Allowlist + Medien-Übersicht | list, edit-suffix |
| S19 | Hub-Karte → Tab in `/mpz/studio/design?tab=hub` | Slug↔Slot, Akzente, Lucide-Icons | grid, edit |
| S20 | Brand & Design → Tab in `/mpz/studio/design?tab=brand` | Logos, Maskottchen, Motive | upload, preview |
| S21 | Deploy `/mpz/studio/deploy` | Env, QR, Token, validate-all, Vorschau-Links | ok, warnings |

**Entfällt im Cleanup:** ehem. S17 Dialog-Audio global, ehem. S16 Tab dialog-audio — siehe [`15-dialog-segment-zeilenmodell.md`](../mpz-studio-claude-design-cleanup/15-dialog-segment-zeilenmodell.md).

**Zusammengelegt (Entscheidung 3.5):** S19 + S20 unter `/mpz/studio/design` — siehe [`NAVIGATION-SOLL.md`](../mpz-studio-claude-design-cleanup/NAVIGATION-SOLL.md).

### Sonstiges

| # | Route / Screen | Zweck |
|---|----------------|-------|
| S23 | `/mpz/studio/ingest` | Deep-Link → öffnet Medien-Modal |
| S24 | `/mpz/unlock` | Zugang vor Studio (optional im Paket) |

---

## S1 — Studio-Shell (Ist)

**Layout:** Links Sidebar (240 px), rechts Content mit Top-Bar.

**Sidebar (Ist — 9 Einträge, einer überflüssig ⚠️):**

- Dashboard
- Stationen
- Medien hochladen (öffnet Modal, keine Route)
- Dialog-Audio ← **entfällt** (kein globaler Inhalt)
- Coach
- Embeds & Links
- Hub-Karte
- Brand & Design
- Deploy

**Top-Bar:** Seitentitel, Button „Speichern & Validieren“ (disabled wenn nichts zu speichern).

**Badge:** `Nur lokal · development`

**Design-Aufgabe:** Gruppierung, ggf. Sekundär-Navigation, klare Hierarchie.

---

## S4 — Dashboard

- Karte **Validierung** — grün/rot, Checks
- **Stationen mit Problemen** — Slug, Fehler, Link
- Quick-Actions: Alle Stationen, ggf. Deploy-Hinweis

---

## S5 — Stationen-Grid

**Kachel** (Daten: `10-hub-stationen-liste.json`):

- Hub-Nr, Titel, slug
- Badge Viewer: `flat` | `360°`
- Ampel: ok / warn / error
- Klick → Station Detail

Grid: 3 Spalten Desktop, 2 Tablet, 1 Mobil.

---

## S7 — Stammdaten

| Feld | UI |
|------|-----|
| `slug` | read-only |
| `titel` | Text |
| `beschreibung` | Textarea |
| `viewer` | Select flat / equirectangular |
| `bild` | Upload Flat-Panorama + Pfad |
| `panorama360` | Upload 360° (wenn equirectangular) |

---

## S8–S10 — Medien

**Tabelle:** id, typ, untertitel, quelle (gekürzt), Aktionen (Bearbeiten, Entfernen).

**Hinzufügen:** Modal S9 — Typ-Karten für alle 6 Typen.

**Bearbeiten:** Metadaten-PATCH; v2.1: Datei ersetzen, Thumbnail/Poster-Upload.

**Bedingte Felder:** siehe `05-typendefinitionen.md`.

---

## S11–S14 — Hotspots & Kalibrierung

- **Medien-Hotspot:** mediumId, x/y (flat) oder yaw/pitch (360°), icon, iconSize
- **Dialog-Hotspot:** action dialog, mascot, mascotSize
- Kalibrier-Buttons: Flat → **S13**; Sphere → **S14** (eigener MPZ-Screen, symmetrisch zu Flat)

Details Sphere: [`16-sphere-calib-screen.md`](./16-sphere-calib-screen.md)

### S13 — Flat-Kalibrierung (umgesetzt)

Route `/mpz/calib/flat/[slug]`. Nur `viewer: flat`.

### S14 — Sphere-Kalibrierung (geplant, Option A)

Route **`/mpz/calib/sphere/[slug]`** — noch **nicht** implementiert.

- Gleiche Shell-Idee wie Flat: Top-Bar, Tabs Hotspots / Startblick, Panorama links, Seitenpanel rechts
- APIs bestehend: `POST /api/mpz/hotspots/sphere`, `POST /api/mpz/view/sphere`
- **Ersetzt** primären Workflow über `/raum/{slug}?hotspot-calib=1`

---

## S15 — Dialog-Editor (alle Stationen)

**Tab Dialog ist bei jeder Station sichtbar** — auch ohne bestehenden `dialog`-Block in `stations.json`.

### Zustand A — Kein Dialog (`no-dialog`)

Station z. B. `klassenzimmer` (Mock: `06-referenz-station-klassenzimmer.json`).

- Erklärung: Maskottchen-Dialog optional pro Raum
- CTA: **Dialog hinzufügen** → `dialog`-Block anlegen (Figuren vorausgewählt, leere `segmente[]`)
- Kein Wechsel zu anderer Station nötig

### Zustand B — Dialog vorhanden (`filled`)

Station z. B. `daz`, `pc-raum` (Mock: `07-referenz-station-daz.json`).

**Domänenregel:** Jedes Segment = ein Sprechertext + eine Audiodatei — alles in **einer Tabellenzeile**.

Blöcke im Tab Dialog:

- Figuren (Frieda/Otto)
- **Segmente** — Tabelle: Nr, ID, Rolle, **Sprechertext**, Gruppe, **Audio** (Status, Abspielen), Aktionen (**Upload**, Bearbeiten, Löschen)
- Gruppen (optional)
- Sprechblasen-Layout (`bubble`)

Vollständige Spezifikation: [`15-dialog-segment-zeilenmodell.md`](./15-dialog-segment-zeilenmodell.md)

**Design-Aufgabe:** Gruppen/Bubble als Sub-Bereich; Segment-Tabelle zentral — kein separater Audio-Tab.

## S17 — Coach

Trigger-Typen:

- `hub-milestone` (+ milestone 0–12)
- `hub-complete`
- `room-first` (+ slug)

Felder: id, mascot (frieda/otto/duo), placement, text, modes (fest/heft).

Mock: `13-coach-messages-auszug.json`.

---

## S18 — Embeds & Links

- Globale Domain-Suffixe (`14-embed-allowlist.json`)
- Übersicht aller embed/link-Medien über Stationen

---

## S19 — Hub-Karte

- Slug ↔ Hub-Slot (12 feste Slots)
- Akzentfarbe pro Station
- Lucide-Icon-Picker

Slot-Geometrie bleibt Code — read-only Hinweis.

---

## S20 — Brand & Design

Upload-Bereiche: Logos, Maskottchen, optionale Motive unter `public/brand/`.

---

## S21 — Deploy

- `.env.local`-Werte anzeigen/ändern
- QR-Generierung, Token-Rotation (Dry-Run)
- validate-all (stations + coach + tokens)
- Vorschau-Links (Raum, Eintritt, Hub)

---

## User-Story → Screen-Mapping

| Story | Screens |
|-------|---------|
| Medien ingestieren | S5 → S8 → S9 → S3 → Vorschau |
| Medien bearbeiten/ersetzen | S5 → S8 → S10 → S3 |
| Hotspot Flat | S5 → S11 → S13 → S3 |
| Hotspot Sphere | S5 → S11 → **S14** → S3 |
| Dialog pflegen | S5 → S15 (Segment-Zeile: Text + Audio) → S3 |
| Coach-Nachricht | S17 → S3 |
| Deploy prüfen | S21 → S3 |
| Validierung fehlgeschlagen | S3 (error + rollback) |

---

## Zustände pro Screen (Pflicht)

Jeder Screen S1–S21 mindestens:

- **Empty** — wenig/noch keine Daten
- **Filled** — realistische Mock-Daten
- **Error** — Validierungs- oder Upload-Fehler
- **Loading** — wo asynchron (Save, Upload, validate-all)


---

# Dialog — Segment-Zeilenmodell (entschieden)

**Datum:** 2026-06-22  
**Status:** ✅ entschieden (Produkt/MPZ)  
**Gilt für:** UI-Cleanup, Claude Design, Phase-4-Implementierung

---

## Kernaussage

**Dialog-Audio ist kein globaler Inhalt.** Es gehört fest zum Dialog-Modul pro Station (`dialog` in `stations.json`). Jedes **Dialog-Segment** hat genau:

- einen **Sprechertext** (`segment.text`)
- eine **Audiodatei** (WAV unter `content/dialog-audio/{slug}/`, verknüpft über `segment.quelle`)

Beides wird **in einer Tabellenzeile** gepflegt — nicht auf einer separaten globalen Seite und nicht in einem eigenen Tab.

---

## Datenmodell (1:1)

```ts
interface DialogSegment {
  id: string
  rolle: DialogRolle          // frieda | otto | beide
  text: string                // Sprechertext (Anzeige + Pflege)
  quelle: string              // z. B. /api/dialog/daz/01-frieda.wav
  gruppe?: string
  tail?: 'left' | 'right' | 'center'
}
```

| Segment-Feld | Audio-Bezug |
|--------------|-------------|
| `text` | Was gesprochen wird |
| `quelle` | API-Pfad zur WAV-Datei |
| Dateiname auf Disk | `NN-rolle.wav` (Index in `segmente[]` + `rolle`) |

**Regel:** Ein Segment = ein Clip. Kein Segment ohne `text`; Audio kann temporär fehlen (Upload ausstehend), wird aber in derselben Zeile ergänzt.

---

## Tab Dialog — alle Stationen

**Entscheidung (2026-06-22):** Der Tab **Dialog** wird bei **allen 12 Stationen** angezeigt — nicht nur bei `daz` / `pc-raum`.

| Zustand | `stations.json` | UI im Tab Dialog |
|---------|-----------------|------------------|
| **Ohne Dialog** | kein `dialog`-Block | Empty-State + CTA **„Dialog hinzufügen“** |
| **Mit Dialog** | `dialog: { figuren, segmente, … }` | Segment-Tabelle, Gruppen, Bubble (siehe unten) |

### Empty-State (ohne Dialog)

- Kurzer Hinweis: Maskottchen-Dialog (Frieda/Otto) für diese Station
- Primär-CTA: **Dialog hinzufügen** → legt minimalen `dialog`-Block an, z. B.:

```json
{
  "figuren": ["frieda", "otto"],
  "segmente": [],
  "gruppen": []
}
```

- Optional: erster Schritt „Erstes Segment anlegen“ direkt nach Anlage
- Ordner `content/dialog-audio/{slug}/` wird bei Bedarf mit angelegt

### Dialog entfernen (optional)

Wenn Station keinen Dialog mehr braucht: **Dialog entfernen** (mit Bestätigung) — löscht `dialog`-Block; WAV-Dateien und Dialog-Hotspots separat prüfen/hinweisen.

**Ist (v2.1):** Tab ist ausgeblendet, wenn `hasDialog === false` (`station-detail-shell.tsx`) — **Soll:** Tab immer sichtbar.

---

## UI-Soll: Segment-Tabelle (wenn Dialog existiert)

Tab **Dialog** enthält dann u. a.:

1. Figuren (Checkboxen)
2. **Segmente** — Haupttabelle (Zeilenmodell)
3. Gruppen (optional, für `gruppe`-Referenzen)
4. Sprechblasen-Layout (`bubble`)

### Spalten Segment-Tabelle

| Spalte | Inhalt |
|--------|--------|
| Nr | Index `01` … `09` (fest an Reihenfolge gekoppelt) |
| ID | `segment.id` |
| Rolle | frieda / otto / beide |
| Sprechertext | Inline editierbar oder Expand — `segment.text` |
| Gruppe | optional |
| Audio | Status-Badge + **Abspielen** (Preview) |
| Aktionen | **Audio hinzufügen/ersetzen** (Upload) · Segment bearbeiten · **Segment löschen** (inkl. WAV-Renummerierung) |

### Aktionen pro Zeile (Pflicht)

| Aktion | Verhalten |
|--------|-----------|
| **Audio hinzufügen** | WAV-Upload → `POST /api/mpz/dialog-audio/ingest` → setzt `quelle` + Datei |
| **Abspielen** | Inline-Player / Button — Vorschau des Clips (`quelle`) |
| **Löschen** | Segment entfernen (bestehend) oder nur Audio-Datei entfernen — UX klar trennen: „Segment löschen“ vs. „Clip entfernen“ |

**Design-Ziel:** Kein Wechsel zu einem anderen Tab oder einer globalen Seite für Audio.

---

## Was entfällt im Cleanup

| Ist (v2.1) | Soll |
|------------|------|
| Sidebar **Dialog-Audio** `/mpz/studio/dialog-audio` | **entfernen** (Route Redirect → Stationen oder 404) |
| Tab **Dialog-Audio** `?tab=dialog-audio` | **entfernen** |
| `DialogAudioPanel` global | Logik in Segment-Zeile / Dialog-Tab integrieren |
| Link „→ Dialog-Audio-Tab“ im Dialog-Panel | entfällt — Aktionen in der Zeile |

API bleibt: `POST /api/mpz/dialog-audio/ingest`, `GET …/status` — nur UI-Einstieg ändert sich.

---

## Ist vs. Soll (Implementierung heute)

**Heute** (`station-detail-shell.tsx`, `station-dialog-panel.tsx`):

- Tab **Dialog** nur sichtbar, wenn Station bereits `dialog` hat
- Segment-Tabelle zeigt Text + Audio-**Badge** nur
- Upload/Abspielen liegt im separaten Tab `dialog-audio` bzw. global

**Soll:**

- Tab **Dialog** bei **jeder** Station; ohne Dialog → „Dialog hinzufügen“
- Badge + Upload + Play + Delete in **derselben Zeile** (wenn Segmente existieren)
- Kein separater Audio-Tab / keine globale Dialog-Audio-Seite

---

## Mock-Daten

- **Mit Dialog:** `07-referenz-station-daz.json` — 9 Segmente mit `text` + `quelle`
- **Ohne Dialog:** `06-referenz-station-klassenzimmer.json` — für Empty-State „Dialog hinzufügen“

---

## Verknüpfung

- [ROADMAP.md](./ROADMAP.md) — Navigation Soll
- [08-bekannte-ui-probleme.md](./08-bekannte-ui-probleme.md) — Problem #2 gelöst
- [02-screens-v2.1-und-user-stories.md](./02-screens-v2.1-und-user-stories.md) — Screen S15


---

# Sphere-Kalibrierung — eigener MPZ-Screen (Option A, geplant)

**Datum:** 2026-06-22  
**Status:** ✅ geplant (Design + Phase 4) — **noch nicht implementiert**  
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


---

# Bekannte UI-Probleme (Cleanup-Auftrag)

**Stand:** 2026-06-22 — nach Abschluss Epic v2/v2.1  
**Zweck:** Konkrete Ausgangspunkte für IA-Cleanup in Claude Design

Quellcode: `app/components/mpz-studio/studio-shell.tsx`, `station-detail-shell.tsx`

---

## 1. Flache Navigation ohne Gruppierung

**Problem:** 9 gleichwertige Sidebar-Einträge auf einer Ebene — keine visuelle Trennung zwischen Station-Arbeit, globalem Content und Betrieb.

**Aktuell:**

```
Dashboard | Stationen | Medien hochladen | Dialog-Audio | Coach | Embeds | Hub | Brand | Deploy
```

**Erwartung im Redesign:** Gruppen z. B. „Inhalt“, „Stationen“, „Global“, „Betrieb“ — oder vergleichbare IA mit max. 2 Ebenen.

---

## 2. Dialog-Audio fälschlich global und ausgelagert

**Problem:** Dialog-Audio ist **kein globaler Inhalt**, sondern 1:1 an Dialog-Segmente gekoppelt (je Segment: Sprechertext + WAV). Trotzdem gibt es drei getrennte UI-Einstiege:

| Ort | Route / UI | Problem |
|-----|------------|---------|
| Sidebar | `/mpz/studio/dialog-audio` | suggeriert globalen Inhalt |
| Station Detail | Tab `?tab=dialog-audio` | trennt Audio vom Segment |
| Tab Dialog | Segment-Tabelle | nur Badge, kein Upload/Play in der Zeile |

**Entscheidung (2026-06-22):** Alles in **einer Segment-Zeile** — Sprechertext, Audio hochladen, abspielen, löschen. Details: [`15-dialog-segment-zeilenmodell.md`](./15-dialog-segment-zeilenmodell.md).

**Design-Aufgabe:** Segment-Tabelle im Tab Dialog erweitern; globalen Nav-Punkt und Tab `dialog-audio` streichen.

---

## 3. Medien hochladen — zwei Einstiege

**Problem:**

- Sidebar-Button öffnet **Modal** (keine eigene Seite)
- Route `/mpz/studio/ingest` existiert als Deep-Link zum gleichen Modal
- Tab Medien hat zusätzlich „Medien hinzufügen“

Drei Wege, ein Flow — uneinheitlich in der Navigation.

---

## 4. Brand vs. Hub — aufgeteilte Design-Konfiguration

**Problem:** Spec nennt „Brand & Design“ als Modul mit Tokens, Akzenten, Icons. Implementierung:

- **Hub-Karte:** Slug-Map, Akzentfarben, Lucide-Icons
- **Brand:** nur Asset-Uploads (Logos, Maskottchen)

Schwer zu finden, was wo gehört.

---

## 5. Veralteter Sidebar-Block „v1 / v2“

**Problem:** Leerer Platzhalter-Bereich in der Sidebar (`DISABLED_V1` ist leer) — wirkt unfertig.

---

## 6. Station Detail — Dialog-Tab versteckt

**Problem:** Tab **Dialog** erscheint nur, wenn `dialog` in `stations.json` existiert (`hidden: !hasDialog`). Neue Dialoge lassen sich so nicht von der Station aus starten.

**Entscheidung (2026-06-22):** Tab **Dialog bei allen 12 Stationen**; Empty-State mit **„Dialog hinzufügen“**. Details: [`15-dialog-segment-zeilenmodell.md`](./15-dialog-segment-zeilenmodell.md).

---

## 7. Station Detail — überladene Tabs (ehem. 6)

**Problem:** Bis zu 4 Tabs; Tab **Dialog** enthält viele Subformulare (Segmente, Gruppen, Bubble) ohne eigene Unter-Navigation. (Tab `dialog-audio` entfällt.)

**Besonders schwer:** Dialog-Editor für Stationen mit vielen Segmenten (`daz`, `pc-raum`).

---

## 8. Vorschau nicht als Tab (ehem. 7)

**Problem:** Spec listet „Vorschau“ unter Station Detail. Implementierung: nur externer Link `↗ /raum/{slug}` im Header.

Kein Fehler per se — aber uneinheitlich zur Spec und leicht zu übersehen.

---

## 9. Save & Validate (ehem. 8)

**Problem:** Ein Button in der Top-Bar für alle Bereiche. Nutzer unsicher, ob Änderungen in Coach/Deploy/Station bereits „gespeichert“ sind oder erst nach Klick.

**Design-Aufgabe:** Klarer Dirty-State, ggf. Bereichs-Feedback oder Bestätigung vor Verlassen.

---

## 10. Uneinheitliche Formular-Muster (ehem. 9)

**Problem:** Mix aus Tabellen + Inline-Formularen + Modals + separaten Kalibrier-Seiten. Kein durchgängiges Muster für:

- Primäraktion (Speichern/Abbrechen)
- Sekundäraktionen (Löschen, Kalibrieren)
- Fehleranzeige

---

## 11. Mobile Sidebar (ehem. 10)

**Problem:** Horizontal scrollbare Nav auf schmalen Viewports — 9 Items schwer scanbar.

---

## 12. Sphere-Kalibrierung außerhalb des Studio-Chrome

**Problem:** Flat-Hotspots nutzen einen dedizierten MPZ-Vollbild-Screen (`/mpz/calib/flat/{slug}`). 360°-Hotspots laufen über die **Besucher-Raumseite** mit Query-Parameter `?hotspot-calib=1` und schwebendem Bottom-Panel — inkonsistent, verwirrend, kein gleiches Layout wie Flat.

**Entscheidung (2026-06-22, Option A):** Eigener MPZ-Screen **`/mpz/calib/sphere/{slug}`** — symmetrisch zu Flat (Top-Bar, Tabs Hotspots/Startblick, Panorama links, Seitenpanel rechts). Details: [`16-sphere-calib-screen.md`](./16-sphere-calib-screen.md).

**Design-Aufgabe:** S14 mockuppen wie S13; Hotspots-Tab verlinkt auf neuen Screen statt Besucher-App.

---

## Was gut funktioniert (beibehalten)

- GS39-Farben und Papier-Look
- Dev-Badge „Nur lokal · development“
- Plan-A-Banner als Fallback-Hinweis
- Stationen-Grid mit Ampel und Hub-Nr
- Flat-Kalibrierung als Vollbild-Seite
- Sphere-Kalibrierung (geplant): gleiches Muster wie Flat — [`16-sphere-calib-screen.md`](./16-sphere-calib-screen.md)
- Save & Validate mit Rollback-Feedback (rot/grün Panel)

---

## Offene Fragen für Claude Design (max. 2)

1. ~~Dialog-Audio: globaler Hub oder nur pro Station?~~ → **entschieden:** nur im Tab Dialog, Segment-Zeile ([`15-dialog-segment-zeilenmodell.md`](./15-dialog-segment-zeilenmodell.md))
2. ~~Sphere-Kalibrierung: Besucher-App oder Studio-Screen?~~ → **entschieden:** Option A, `/mpz/calib/sphere/{slug}` ([`16-sphere-calib-screen.md`](./16-sphere-calib-screen.md))
3. Medien-Upload: immer Modal oder eigene Seite bei komplexen Flows (link/embed)?
4. Dialog-Editor: Sub-Tabs für Gruppen/Bubble — Segment-Tabelle bleibt zentral mit Zeilenmodell
