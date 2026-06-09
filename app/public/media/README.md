# `public/media/`

Öffentliche Stations-Medien (Audio, Video, Fotos, Texte). Statisch ausgeliefert — keine Cookie-Prüfung (im Gegensatz zu Dialog-Audio unter `content/dialog-audio/`).

## Struktur

```
public/media/
└── {slug}/
    ├── audio/      # MP3, WAV
    ├── video/      # MP4 (ADR-004: MPZ-Upload bevorzugt)
    ├── fotos/      # JPG, WebP
    └── texte/      # TXT, MD
```

Slug = App-Slug aus der [kanonischen Slug-Liste](../../../dokumentation/content-verzeichnisstruktur.md) (z. B. `musik`, `daz`).

## Pfadkonvention in `stations.json`

```json
{ "typ": "audio", "quelle": "/media/{slug}/audio/{dateiname}.mp3" }
{ "typ": "video", "quelle": "/media/{slug}/video/{dateiname}.mp4" }
{ "typ": "text", "quelle": "/media/{slug}/texte/{dateiname}.md" }
```

**Referenz-Station:** `klassenzimmer/` — erste vollständige Migration aus `auftraggeber/material/medien/demo-generiert/` (Issue **#93**).

## Workflow

1. Rohmaterial liegt in `auftraggeber/material/medien/{slug}/`
2. Nach Freigabe: optimierte Datei hierher kopieren
3. `stations.json` anpassen (Pfad von `/demo/…` auf `/media/{slug}/…`)
4. `npm run validate:stations` — muss grün sein

## Hinweis Demo-Platzhalter

Solange kein echter Content vorliegt, zeigt `stations.json` auf `/demo/…`. Nicht löschen bevor alle Referenzen umgestellt sind.

## Text-Medien (inline)

`typ: "text"` wird im Medien-Panel von [`TextViewer`](../../components/media/text-viewer.tsx) gerendert (Markdown `.md` oder Plaintext `.txt`). Keine Cookie-Prüfung — statische Dateien wie Audio/Video/Foto.
