# Bekannte UI-Probleme (Ist-Zustand)

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

**Entscheidung (2026-06-22):** Nur **Modal** aus Tab Medien; `/mpz/studio/ingest` + Sidebar-Eintrag „Medien hochladen“ entfallen (Redirect → Stationen). Siehe [`ROADMAP.md`](./ROADMAP.md) 3.2.

---

## 4. Brand vs. Hub — aufgeteilte Design-Konfiguration

**Problem:** Spec nennt „Brand & Design“ als Modul mit Tokens, Akzenten, Icons. Implementierung:

- **Hub-Karte:** Slug-Map, Akzentfarben, Lucide-Icons
- **Brand:** nur Asset-Uploads (Logos, Maskottchen)

Schwer zu finden, was wo gehört.

**Entscheidung (2026-06-22):** Zusammenlegen zu **einer** Route `/mpz/studio/design` (Tabs Hub + Brand); Redirects für `/hub` + `/brand`. **Technik-Hinweis (Pre-Mortem 1a #4):** Die Sidebar setzt ihren Aktiv-Zustand über `pathname.startsWith`, Brand/Hub sind getrennte `GLOBAL_ITEMS` — beim Mergen müssen Route, Aktiv-State **und** Redirects zusammen geändert werden, sonst brechen Navigation-State und Alt-Links. Details: [`ROADMAP.md`](./ROADMAP.md).

---

## 5. Veralteter Sidebar-Block „v1 / v2“

**Problem:** Leerer Platzhalter-Bereich in der Sidebar (`DISABLED_V1` ist leer) — wirkt unfertig.

---

## 6. Station Detail — Dialog-Tab versteckt

**Problem:** Tab **Dialog** erscheint nur, wenn `dialog` in `stations.json` existiert (`hidden: !hasDialog`). Neue Dialoge lassen sich so nicht von der Station aus starten.

**Entscheidung (2026-06-22):** Tab **Dialog bei allen 12 Stationen**; Empty-State mit **„Dialog hinzufügen“**. Details: [`15-dialog-segment-zeilenmodell.md`](./15-dialog-segment-zeilenmodell.md).

**Technik-Hinweis (Pre-Mortem 1a #1 / 1b #3 — verifiziert):** Das ist ein **Feature, kein Refactor** — es existiert **kein** Endpoint zum Anlegen eines Dialog-Blocks; `patchDialogMeta` wirft `NO_DIALOG`, solange `segmente` leer ist. Nötig: neuer `POST /api/mpz/stations/[slug]/dialog`. Siehe [`ROADMAP.md`](./ROADMAP.md) Phase 4.3.

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

**Technik-Hinweis (Pre-Mortem 1a #3 — verifiziert):** In `station-hotspots-table.tsx` öffnen 360°-Links heute hartcodiert `target="_blank"`/`rel="noopener noreferrer"` (Z. 134-135, 210-211, Label „↗ Sphere-App“). Bei der Umstellung müssen `_blank`/`rel` entfernt, das Label auf die interne Route gesetzt und der statische `?hotspot-calib=1`-Info-Text gelöscht werden — sonst öffnet der neue Screen weiter einen externen Tab.

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
3. ~~Medien-Upload: immer Modal oder eigene Seite bei komplexen Flows (link/embed)?~~ → **entschieden:** nur Modal aus Tab Medien; `/ingest` + Sidebar-Eintrag entfallen ([`ROADMAP.md`](./ROADMAP.md) 3.2)
4. ~~Dialog-Editor: Sub-Tabs für Gruppen/Bubble?~~ → **entschieden:** Gruppen/Bubble als einklappbare Bereiche **unter** der Segment-Tabelle, kein Sub-Tab ([`ROADMAP.md`](./ROADMAP.md) 3.3)
