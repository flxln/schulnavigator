# MPZ Studio v0 — Screens und User-Stories

**Verbindlicher UI-Scope für Claude Design.** Alles andere ist Zielbild (v1/v2) — nicht mockuppen.

Quelle: [01-spezifikation-auszug.md](./01-spezifikation-auszug.md) → Abschnitt „v0 — Definition of Done“.

---

## Screen-Inventar

| # | Route / Screen | Zweck | Pflicht-Zustände |
|---|----------------|-------|------------------|
| S1 | `/mpz/studio` Shell | Navigation, Kontext, Dev-Warnung | default |
| S2 | Dashboard | Gesamt-Validierung, letzte Aktivität | ok, errors, loading |
| S3 | Stationen-Grid | 12 Slugs wählen | empty (keine), partial, all-ok |
| S4 | Station → Stammdaten | `titel`, `beschreibung`, `viewer`, Bild-URLs (read-only) | flat, equirectangular |
| S5 | Station → Medien | Liste + Hinzufügen | empty, list, uploading |
| S6 | Medien-Upload-Modal | Datei + Metadaten | default, validating, error |
| S7 | Station → Hotspots | Tabelle + Kalibrier-Links | empty, list |
| S8 | Flat-Kalibrierung `/mpz/calib/flat/[slug]` | Klick → x/y | idle, marker-placed, applied |
| S9 | Sphere-Kalibrierung (Hinweis) | Link zu `/raum/{slug}?hotspot-calib=1` + JSON übernehmen | info-panel |
| S10 | Station → Dialog-Audio | Nur Stationen mit `dialog` | list, missing-file-warning |
| S11 | Save & Validate (global) | Primary CTA + Ergebnis | idle, running, success, rollback-error |
| S12 | Vorschau-Aktion | Link `↗ /raum/{slug}` in neuem Tab | — |

---

## S1 — Studio-Shell

**Layout:** Links Sidebar (240 px), rechts Content mit Top-Bar.

**Sidebar (v0):**

- MPZ Studio (Logo/Text)
- Dashboard
- Stationen
- —— (ausgegraut, v1) Coach, Brand, Hub, Deploy

**Top-Bar:**

- Aktueller Pfad / Stationstitel
- Badge: `Nur lokal · development`
- Button: „Speichern & Validieren“ (disabled wenn keine Änderungen)

**Banner (persistent, dezent):**

> Plan A (CLI) bleibt Fallback. Bei Problemen: `npm run content:ingest`.

---

## S2 — Dashboard

**Inhalt:**

- Karte **Validierung:** `validate:stations` — grün/rot, letzter Lauf, Dauer
- Liste **Stationen mit Problemen** (Slug, Kurzfehler, Link zur Station)
- **Zuletzt bearbeitet:** slug + Zeitstempel (lokal)
- Quick-Actions: „Alle Stationen“, „CLI-Anleitung“ (Link zu Doku)

---

## S3 — Stationen-Grid

**Kachel pro Slug** (Daten: `10-hub-stationen-liste.json`):

- Hub-Nr (klein)
- Titel + slug
- Badge Viewer: `flat` | `360°`
- Ampel: grün (valid), gelb (Medien fehlen), rot (Validierungsfehler)
- Klick → Station Detail

**Grid:** 3 Spalten Desktop, 2 Tablet, 1 Mobil.

---

## S4 — Stammdaten

| Feld | UI |
|------|-----|
| `slug` | read-only |
| `titel` | Text input |
| `beschreibung` | Textarea (4–6 Zeilen) |
| `viewer` | Select: flat / equirectangular |
| `bild` | read-only Pfad + Link „Im Repo öffnen“ (Hinweis) |
| `panorama360` | nur wenn viewer = equirectangular, read-only |

Kein Raumbild-Upload in v0.

---

## S5 — Medien

**Tabelle:** id, typ, untertitel, quelle (monospace, gekürzt), Aktionen (Bearbeiten, Entfernen).

**Button:** „Medien hinzufügen“ → S6.

**Typ-Icons:** audio, video, foto, text (einfache Lucide-ähnliche Icons, GS39-Farben).

---

## S6 — Upload-Modal

1. Typ wählen (4 Karten: Audio, Video, Foto, Text)
2. Drag & Drop oder Datei wählen
3. Felder: `id` (Vorschlag aus Dateiname), `untertitel`
4. Vorschau generierter `quelle`-Pfad: `/media/{slug}/{typ}/…`
5. Buttons: Abbrechen | Hinzufügen

**Fehler:** falscher MIME-Typ, Datei zu groß, id-Kollision.

---

## S7 — Hotspots

**Zwei Bereiche** (je nach `viewer`):

- **Flat:** Tabelle `hotspots[]` — id, label, x, y, mediumId/mascot, Button „Flat kalibrieren“
- **360°:** Tabelle `hotspots360[]` — yaw, pitch, …, Button „Sphere kalibrieren (Besucher-App)“

**Zeile hinzufügen:** Minimalformular oder Import aus Kalibrierung.

---

## S8 — Flat-Kalibrierung

- Vollbreites Panorama (`bild`)
- Klick setzt Marker
- Panel: `x`, `y` (4 Dezimalen), Hotspot-id wählen oder neu
- „In stations.json übernehmen“ + Zurück zur Station

---

## S10 — Dialog-Audio

Nur sichtbar wenn Station `dialog` hat (z. B. `daz`, `pc-raum`).

- Liste erwarteter Clips (`01-frieda.wav`, …)
- Upload mit Auto-Benennung
- Warnung wenn `quelle` in JSON, Datei fehlt

---

## S11 — Save & Validate

**Ablauf:**

1. Nutzer klickt „Speichern & Validieren“
2. Loading (Spinner + „Prüfe Struktur und Dateien…“)
3. Erfolg: grünes Panel, Liste checks, Vorschau-Link
4. Fehler: rotes Panel, Bullet-Fehler, Hinweis „Änderungen zurückgerollt“

---

## User-Story → Screen-Mapping

| Story | Screens |
|-------|---------|
| Audio ingestieren | S3 → S5 → S6 → S11 → Vorschau |
| Hotspot Flat | S3 → S7 → S8 → S11 |
| Hotspot 360° | S3 → S7 → S9 (extern) → S7 → S11 |
| Dialog-Audio | S3 → S10 → S11 |
| Validierung fehlgeschlagen | S11 (error + rollback) |

---

## Zielbild-Navigation (NICHT designen, max. Sidebar-Platzhalter)

- Coach
- Dialog-Audio (global)
- Embeds & Links
- Brand & Design
- Hub-Karte
- Deploy
