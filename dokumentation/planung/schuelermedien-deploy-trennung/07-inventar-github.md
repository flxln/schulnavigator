# Inventar — Schüler-Medien auf GitHub (Phase 0.2)

**Stand:** 2026-06-24 (Pre-Rewrite) · **Post-Rewrite (#232):** 2026-06-24 — siehe Abschnitt unten  
**Issue:** [#227](https://github.com/flxln/schulnavigator/issues/227) · **Umsetzung:** [#232](https://github.com/flxln/schulnavigator/issues/232) (History-Bereinigung)  
**Erstellt mit:** `git ls-files`, `git lfs ls-files`, `git status --porcelain` (Repo-Root, Branch `main`)

---

## Zusammenfassung

| Kennzahl | Wert |
|----------|------|
| Getrackte Dateien unter Bahn-B-Pfaden | **67** (`public/media`, `dialog-audio`, `coach-audio`) |
| Davon Git-LFS-Pointer (Schüler-Medien-Bäume) | **17** in `public/media` + **1** `dialog-audio` + **1** `coach-audio` = **19** |
| Raumbilder LFS (`public/stations/`, Bahn A) | **17** (O5: dürfen in Git bleiben) |
| Commits mit Medien-Pfad-Touches | **18** |
| Lokal ungetrackt (noch nicht auf GitHub) | **9** Pfade/Dateien (siehe unten) |

**DSB-Entscheidung O3:** Bereits gepushte Schüler-Medien in Git/LFS-History **bereinigen** → separates Vorhaben [#232](https://github.com/flxln/schulnavigator/issues/232).

---

## Kategorisierung: Bahn B vs. Icon-Umzug (Bahn A)

Nach [03-zielarchitektur.md](./03-zielarchitektur.md): Der Volume-Mount auf `/app/public/media` verdeckt git-getrackte Dateien darunter. **Personenfreie** Hotspot-/UI-Icons müssen in #228 nach `public/stations-icons/{slug}/` umziehen; **schülerbezogene** Bild-Icons bleiben in Bahn B (rsync).

### Schüler-Medien (Bahn B) — nicht mehr in Git ab #228

**Dialog-Audio** (`content/dialog-audio/`, 18 WAV + Platzhalter):

| Pfad | LFS |
|------|-----|
| `content/dialog-audio/daz/01-frieda.wav` … `09-beide.wav` | `01-frieda.wav` ja |
| `content/dialog-audio/pc-raum/01-frieda.wav` … `09-beide.wav` | nein |

**Coach-Audio** (`content/coach-audio/`):

| Pfad | LFS |
|------|-----|
| `content/coach-audio/welcome-hub.wav` | ja |
| `content/coach-audio/.gitkeep` | nein |

**Videos & Audio** (`public/media/`):

| Pfad | LFS |
|------|-----|
| `public/media/daz/video/video-hallo-im-daz-raum.mp4` | ja |
| `public/media/musik/audio/musikzimmer-fuer-elise.mp3` | ja |
| `public/media/musik/video/musikzimmer-gute-laune-tanz.mp4` | ja |
| `public/media/musikraum/videos/musikzimmer_fuer_elise.mp3` | ja |
| `public/media/musikraum/videos/musikzimmer_gute_laune_tanz.mp4` | ja |
| `public/media/pc-raum/video/pc-raum-angebote.mp4` | ja |
| `public/media/pc-raum/videos/pc-raum-neu-mit-ton.mp4` | ja |
| `public/media/speiseraum/video/speiseraum-essenausgabe-2.mp4` | ja |
| `public/media/werken/video/werken-das-kleine-quadrat.mp4` | ja |
| `public/media/werkenraum/video/werken-das-kleine-quadrat.mov` | nein |
| `public/media/werkenraum/video/werken-das-kleine-quadrat.mp4` | ja |

**Fotos / Schülerarbeiten** (`public/media/`):

| Pfad | LFS | Anmerkung |
|------|-----|-----------|
| `public/media/kunst/fotos/kunstraum-safia-bild1.jpg` | ja | Vorname in Dateiname |
| `public/media/kunst/fotos/kunstraum-safia-bild1.png` | nein | |
| `public/media/kunst/fotos/kunstraum-safia-bild2.jpg` | ja | |
| `public/media/kunst/fotos/kunstraum-safia-bild2-2.jpg` | ja | |
| `public/media/kunst/fotos/kunstraum-safia-bild2.png` | nein | |
| `public/media/werken/fotos/werken-elektrobaukasten.jpg` | ja | |
| `public/media/werken/fotos/werkenzimmer-dinge-aus-dem-unterricht.jpg` | ja | |
| `public/media/werkenraum/bilder/werken-elektrobaukasten.heic` | nein | |
| `public/media/werkenraum/bilder/werken-elektrobaukasten.jpg` | ja | |
| `public/media/werkenraum/bilder/werkenzimmer-dinge-aus-dem-unterricht.heic` | nein | |
| `public/media/werkenraum/bilder/werkenzimmer-dinge-aus-dem-unterricht.jpg` | ja | |

**Schülerbezogene Icons** (bleiben Bahn B, rsync mit Medien):

| Pfad | Anmerkung |
|------|-----------|
| `public/media/kunst/icons/kunstraum-safia-bild1.png` | Thumbnail Schülerarbeit |
| `public/media/kunst/icons/kunstraum-safia-bild2.png` | Thumbnail Schülerarbeit |
| `public/media/werken/icons/werken-elektrobaukasten.png` | Schülerarbeit |
| `public/media/werken/icons/werkenzimmer-dinge-aus-dem-unterricht.png` | Schülerarbeit |
| `public/media/werkenraum/icons/werken-elektrobaukasten.png` | Schülerarbeit |
| `public/media/werkenraum/icons/werkenzimmer-dinge-aus-dem-unterricht.png` | Schülerarbeit |
| `public/media/lesewelt/icons/otto.png` | Maskottchen-Hotspot |
| `public/media/schulhof/icons/Unknown.png` | |

**Texte / Meta unter `public/media/`** (in #228 mit `.gitignore` mit Bahn B — ggf. später nach `data/` oder Server-only):

| Pfad |
|------|
| `public/media/README.md` |
| `public/media/kunst/texte/regeln-im-kunstraum.md` |
| `public/media/lesewelt/links.md` |
| `public/media/schulhof/links.md` |
| `public/media/.gitkeep` |

### Generische Icons (Bahn A) — Umzug nach `public/stations-icons/` in #228

Diese Pfade sind in `stations.json` referenziert; Zielpfad siehe [04-umsetzungsplan.md](./04-umsetzungsplan.md) Phase 1.3.

| Aktueller Pfad | Slug | Referenz in `stations.json` |
|----------------|------|----------------------------|
| `public/media/daz/icons/video.svg` | daz | `icon` Hotspot Video |
| `public/media/klassenzimmer/icons/embed.svg` | klassenzimmer | `icon` |
| `public/media/klassenzimmer/icons/play.svg` | klassenzimmer | (lokal, ggf. ohne Hotspot) |
| `public/media/musik/icons/video.svg` | musik | `icon` |
| `public/media/musik/icons/matt-icons-folder-piano.svg` | musik | `icon` |
| `public/media/musikraum/icons/klaviertasten.png` | musikraum | (Ordner-Duplikat) |
| `public/media/musikraum/icons/matt-icons_folder-piano.svg` | musikraum | |
| `public/media/pc-raum/icons/delightex.svg` | pc-raum | |
| `public/media/pc-raum/icons/video.svg` | pc-raum | `icon` |
| `public/media/speiseraum/icons/video.svg` | speiseraum | `icon` |
| `public/media/werken/icons/video.svg` | werken | `icon` |
| `public/media/lesewelt/icons/books-stack-of-three.svg` | lesewelt | `icon` |

---

## Raumbilder (Bahn A, O5: in Git/LFS belassen)

17 LFS-Objekte unter `public/stations/` und `public/stations/360/` — **keine erkennbaren Kinder** (DSB 2026-06-24). Weiter versionieren wie bisher.

---

## Lokal ungetrackt — noch nicht auf GitHub (Push-Risiko)

Stand `git status --porcelain`:

| Pfad | Anmerkung |
|------|-----------|
| `app/content/coach-messages.json.bak` | Backup, nicht committen |
| `app/public/media/daz-raum/` | Neuer Ordner |
| `app/public/media/klassenzimmer/audio/` | Audio |
| `app/public/media/kunst/audio/` | Mehrere m4a/mp3 |
| `app/public/media/musikraum/videos/musikzimmer_gute_laune_tanz.MOV` | Rohvideo |
| `app/public/media/pc-raum/videos/pc-raum-neu-mit-ton.MOV` | Rohvideo |
| `app/public/media/speiseraum/bilder/` | inkl. HEIC |
| `app/public/media/speiseraum/video/speiseraum-essenausgabe.MOV` | |
| `app/public/media/speiseraum/video/speiseraum-essenausgabe.mp4` | |

**Sofortmaßnahme 0.1:** Diese Dateien **nicht** `git add`/`push`en, bis Phase 2 (#229) live ist.

---

## Commits mit Medien-Pfaden (Auszug für #232)

```
6a55156 Content GS39: DaZ-Video, Kunst-Dialog, Speiseraum, Klassenzimmer bereinigt.
96cdf5f Klassenzimmer: Delightex-Embed und Hotspot-Icon ergänzen.
75ccdcd Werkenzimmer: Fotos, Video, Hotspots und 360°-Startansicht ergänzen.
36aa97c Medien für Musikraum, PC-Raum und Werkenzimmer ergänzen.
457955c Content Kunst- und Musikzimmer für GS39-Schulfest ergänzen.
b9e64e8 PC-Raum: Angebots-Video als Hotspot statt Delightex-Embed.
de4949f Dialog: Text-only-Segmente ohne Audio (ADR-026) und GS39-Content.
a2f95c3 … stations.json … embeds …
7c55973 Doku und Content: Audio, Planungsstand …
ff48a44 Coach-Audio-Nachzieh …
2f07ae5 Coach-Audio mit Autoplay …
516c8b1 Implement link media type …
f0355a9 Hotspot-Marker mit Icon-Fallback …
995b2c8 TextViewer inline und Demo-Station klassenzimmer …
03128c9 … media handling …
f45f9a4 feat(demo): Otto/Frieda-Dialog mit gated Audio …
```

Vollständige Liste: `git log --oneline -- app/public/media/ app/content/dialog-audio/ app/content/coach-audio/`

---

## Handoff #228 / #229 (Pre-Mortem 1a)

Diese Punkte sind **nicht** in Phase 0 umzusetzen — verbindlich für die folgenden Issues:

### 1. `git rm -r --cached` zuerst (#228 Phase 1.0 / 1.1)

`.gitignore` greift **nicht rückwirkend**. Phase 1 **muss** mit folgendem Befehl starten (aus [04-umsetzungsplan.md](./04-umsetzungsplan.md)):

```bash
cd app
git rm -r --cached public/media content/dialog-audio content/coach-audio
# danach: .gitkeep per git add -f zurückholen, .gitignore committen
```

Ohne diesen Schritt re-leaken bestehende Medien beim nächsten Push trotz `.gitignore`.

### 2. Icon-Umzug (#228 Phase 1.3)

Generische Icons (Tabelle oben) nach `public/stations-icons/{slug}/` verschieben und `stations.json`-Pfade anpassen — sonst 404 nach Volume-Mount (Pre-Mortem 1a #1).

### 3. rsync SSH (#230)

`rsync -e "ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"` — entschieden als T6 in [05-offene-punkte.md](./05-offene-punkte.md).

### 4. Build-Validatoren (#229 Phase 2.5)

Coolify-Build nutzt `validate:stations:structure` und `validate:coach:structure` (kein `existsSync`); volle Validatoren nur lokal/im Deploy — entschieden als T4.

### 5. History-Bereinigung (#232)

**Erledigt 2026-06-24** — `git filter-repo --invert-paths` auf alle Refs; Force-Push aller Branches/Tags. Post-Mortem: [post-mortem-232-2026-06-24.md](../../reviews/post-mortem/post-mortem-232-2026-06-24.md).

---

## Post-Rewrite (#232, 2026-06-24)

| Kennzahl | Wert nach Bereinigung |
|----------|----------------------|
| Bahn-B-Objekte in `git rev-list --objects --all` | **0** (außer `.gitkeep` am Tip) |
| LFS-Pointer Schüler-Medien | **0** |
| LFS-Pointer Raumbilder (`public/stations/`) | **17** (unverändert, O5) |
| Getrackte Bahn-B-Dateien (Tip `kunde/39-gs`) | **3× `.gitkeep`** |
| GitHub-Support LFS-Purge | **eingereicht** (2026-06-24) — Bestätigung ausstehend; [08-github-support-ticket-232.md](./08-github-support-ticket-232.md) |

**Verifikation (frischer Klon):**

```bash
git rev-list --objects --all | grep -E 'app/public/media/|app/content/dialog-audio/|app/content/coach-audio/' | grep -v '\.gitkeep'
# → leer

git lfs ls-files --all | grep -v 'public/stations'
# → leer
```

**Hinweis:** Alle lokalen Klone vor 2026-06-24 verwerfen und neu klonen — alte SHAs sind ungültig.

---

## Befehle zur Aktualisierung

```bash
# Getrackte Bahn-B-Dateien
git ls-files app/public/media app/content/dialog-audio app/content/coach-audio

# LFS-Pointer
git lfs ls-files

# Ungetrackte Medien
git status --porcelain app/public/media app/content/

# Commit-Historie
git log --oneline -- app/public/media/ app/content/dialog-audio/ app/content/coach-audio/
```
