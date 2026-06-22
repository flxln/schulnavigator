# Dialog — Segment-Zeilenmodell (Domänenentscheidung)

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

> **Implementierungs-Hinweis (Pre-Mortem 1a #1 / 1b #3 — verifiziert):** Für das Anlegen gibt es **heute keinen** Backend-Pfad. Der bestehende `PATCH …/dialog` (`patchDialogMeta` → `requireDialog`) wirft `NO_DIALOG`, solange `segmente` leer ist, und taugt **nicht** zum Erzeugen des Blocks. „Dialog hinzufügen“ ist damit ein **Feature, kein Refactor** und braucht einen neuen `POST /api/mpz/stations/[slug]/dialog`. Siehe [`ROADMAP.md`](./ROADMAP.md) Phase 4.3.

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
