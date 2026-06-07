# App-Content außerhalb `public/`

Dateien hier werden **nicht** direkt von Next.js ausgeliefert, sondern über Route-Handler (zugangsgeschütztes Dialog-Audio, Cookie-Prüfung).

| Ordner | Inhalt |
|--------|--------|
| `dialog-audio/{slug}/` | WAV-Clips pro Station — Auslieferung: `GET /api/dialog/{slug}/{clip}` (403 ohne Cookie, Range/206 für iOS) |

**Dateinamen-Konvention:** `{nn}-{sprecher}.wav` — nn zweistellig (01–99), sprecher: `frieda`, `otto` oder `beide`.  
Beispiel: `01-frieda.wav`, `02-otto.wav`, `09-beide.wav`

**Docker:** `COPY content/ ./content/` im [`Dockerfile`](../Dockerfile) (Standalone-Image übernimmt `content/` nicht automatisch).

**Quelle (Kopie):** `auftraggeber/material/stationen/transkripte/{slug}/`

**Öffentliche Medien** (ohne Cookie-Schutz) gehören nach [`public/media/`](../public/media/) — nicht hierher.

Vollständige Content-Architektur: [`dokumentation/content-verzeichnisstruktur.md`](../../dokumentation/content-verzeichnisstruktur.md)  
ADR: [ADR-010](../../dokumentation/adr/010-dialog-cutscene-gated-audio.md)
