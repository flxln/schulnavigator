# App-Content außerhalb `public/`

Dateien hier werden **nicht** direkt von Next.js ausgeliefert, sondern über Route-Handler (z. B. zugangsgeschütztes Dialog-Audio).

| Ordner | Inhalt |
|--------|--------|
| `dialog-audio/{slug}/` | WAV-Clips pro Station (`01-frieda.wav` …) — Auslieferung: `GET /api/dialog/{slug}/{clip}` |

**Docker:** `COPY content/ ./content/` im [`Dockerfile`](../Dockerfile) (Standalone-Image).

**Quelle (Kopie):** `auftraggeber/material/stationen/transkripte/`
