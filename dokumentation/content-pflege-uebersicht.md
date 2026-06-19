# Content pflegen — Übersicht

Umfassende Referenz: **wo** und **wie** Inhalte im Schulnavigator hinzugefügt und geändert werden können (MVP: JSON + Dateien im Repo).

**Schritt-für-Schritt-Anleitung:** [`anleitungen/content-einpflegen.md`](../anleitungen/content-einpflegen.md)  
**Interaktive Übersicht (HTML):** [`content-pflege-interaktiv.html`](./content-pflege-interaktiv.html) — Content-Typ wählen, gefilterte Anleitung  
**Pfadkonventionen und Slug-Liste:** [`content-verzeichnisstruktur.md`](./content-verzeichnisstruktur.md)  
**Zielbild CMS:** [ADR-003](./adr/003-content-mvp-json-directus.md)

---

## Grundmodell

| Phase | Wer pflegt | Wie |
|-------|------------|-----|
| **MVP (jetzt)** | MPZ / Entwickler | Dateien + JSON im Git-Repo, Deploy über Coolify |
| **Zielbild (Phase 5)** | Lehrkräfte | **Directus** (Headless CMS), kein Custom-Admin |

### Zwei Zonen

| Zone | Pfad | Im Docker-Image? | Rolle |
|------|------|------------------|-------|
| **Autorenzone** | `auftraggeber/material/` | Nein | Rohmaterial, Varianten, Transkripte |
| **Laufzeitzone** | `app/data/`, `app/public/`, `app/content/` | Ja | Deploybarer Content |

**Workflow:** Schule liefert Material → Ablage in `auftraggeber/` → nach Freigabe **kopieren** (nicht verlinken) nach `app/` → validieren → commit → deploy.

Details zum Build-Kontext: [`build-kontext-submodule-regeln.md`](./build-kontext-submodule-regeln.md)

---

## 1. Zentrale Metadaten — `app/data/stations.json`

Die wichtigste Content-Datei. Wird beim Build geladen (`app/lib/stations.ts`) und validiert (`npm run validate:stations`).

Pro Station (12 kanonische Slugs — **nicht umbenennen**, QR-Codes sind gedruckt):

| Feld / Block | Was steuert es |
|--------------|----------------|
| `slug`, `titel`, `beschreibung` | Stationsseite, Hub, Liste |
| `viewer` | `flat` (Default) oder `equirectangular` (360°-Kugel, [ADR-018](./adr/018-360-sphere-viewer.md)) |
| `bild` | Flat-Panorama für Gyro-Viewer (`/stations/{slug}.jpg`) |
| `panorama360` | Equirectangular-Bild (`/stations/360/{slug}.webp`) |
| `medien[]` | Audio, Video, Foto, Text, Link, Embed |
| `hotspots[]` | Gelbe Punkte / Icons im **Flat**-Viewer (`x`/`y`, 0–1) |
| `hotspots360[]` | Hotspots im **Sphere**-Viewer (`yaw`/`pitch` in Grad) |
| `dialog` | Maskottchen-Dialog (Stationen `daz`, `pc-raum`) |

### Medientypen in `medien[]`

| `typ` | `quelle` | Datei nötig? |
|-------|----------|--------------|
| `audio` | `/media/{slug}/audio/…` | Ja (MP3/WAV) |
| `video` | `/media/…` oder YouTube-ID | MP4 oder Poster-only |
| `foto` | `/media/…/fotos/…` | Ja |
| `text` | `/media/…/texte/…` | Ja (`.md` oder `.txt`, inline via TextViewer) |
| `link` | `https://…` | Optional `thumbnail`, Hotspot-`icon` |
| `embed` | `https://…` (Delightex) | Optional Assets; braucht `NEXT_PUBLIC_EMBED_ENABLED=true` |

Weitere Felder: `untertitel`, `thumbnail`, `poster` (nur Video), `videoSource` (`upload` \| `youtube`), `embedAllow` ([ADR-017](./adr/017-externe-medien-hotspot-marker.md)).

### Hotspots

- **Medien-Hotspot:** `mediumId` verweist auf `medien[].id`
- **Dialog-Hotspot:** `action: "dialog"`, `mascot`, optional `mascotSize`, `mascotFlipX` ([ADR-011](./adr/011-dialog-mascot-hotspots.md), [ADR-014](./adr/014-mascot-size-json.md))
- **Custom-Icon:** `icon`, `iconSize` unter `/media/{slug}/icons/` oder Brand-Presets

### Dialog-Block (`dialog`)

| Feld | Inhalt |
|------|--------|
| `figuren` | `["frieda", "otto"]` |
| `segmente[]` | `id`, `rolle`, `text` (Sprechblase), `quelle` (API-Pfad zu WAV) |
| `gruppen[]` | Gemeinsamer Blasentext für gruppierte Segmente |
| `bubble` | Position und Größe der Sprechblase ([ADR-015](./adr/015-dialog-bubble-json.md)) |

---

## 2. Stations-Medien — `app/public/media/{slug}/`

Statisch ausgeliefert, **kein** Cookie-Schutz.

```
app/public/media/{slug}/
├── audio/      MP3, WAV
├── video/      MP4
├── fotos/      JPG, WebP
├── texte/      .md, .txt
└── icons/      SVG/PNG für Hotspots (ADR-017)
```

**Ändern:** Datei ersetzen oder hinzufügen + passenden Eintrag in `stations.json`.

- **Referenz-Station:** `klassenzimmer` (4 Medientypen + 4 Hotspots)
- **Demo-Platzhalter:** `/demo/…` — wird schrittweise durch `/media/{slug}/…` ersetzt (`musik`, `schulsozialarbeit` nutzen noch Demo-Texte)
- **Rohquelle:** `auftraggeber/material/medien/{slug}/` oder `demo-generiert/`

README: [`app/public/media/README.md`](../app/public/media/README.md)

---

## 3. Raumbilder

### Flat-Panorama (Gyro-Viewer)

| Ort | Regeln |
|-----|--------|
| `app/public/stations/{slug}.jpg` | ≤ 500 KB, ≥ 2400 px Breite, Seitenverhältnis ≥ 2,5:1 |
| Rohmaterial | `auftraggeber/material/stationen-360-pano/flat/{slug}/raw/` |
| Export | `cd app && node scripts/export-pano.mjs` |

In JSON: `"bild": "/stations/{slug}.jpg"`. Ohne `bild` → statische Ansicht + Medienliste (z. B. `schulsozialarbeit`).

README: [`app/public/stations/README.md`](../app/public/stations/README.md)

### 360°-Kugel (Sphere-Viewer, ADR-018)

| Ort | Regeln |
|-----|--------|
| `app/public/stations/360/{slug}.webp` | Equirectangular 2:1, max. 4 MB |
| Export | `npm run export:pano360` |
| JSON | `"viewer": "equirectangular"` + `"panorama360": "/stations/360/{slug}.webp"` |

8 Stationen nutzen bereits Sphere; `kunst`, `hort`, `schulsozialarbeit` bleiben auf Flat bzw. ohne Bild.

README: [`app/public/stations/360/README.md`](../app/public/stations/360/README.md)

---

## 4. Dialog-Audio — `app/content/dialog-audio/{slug}/`

**Nicht öffentlich** — Auslieferung über `GET /api/dialog/{slug}/{clip}` (Cookie-geschützt, [ADR-010](./adr/010-dialog-cutscene-gated-audio.md)).

| Konvention | Beispiel |
|------------|----------|
| Dateiname | `01-frieda.wav`, `09-beide.wav` |
| JSON-Referenz | `"/api/dialog/daz/01-frieda.wav"` |
| Rohquelle | `auftraggeber/material/stationen/transkripte/011-DaZ-Zimmer/` → nach Slug kopieren |

Stationen mit Dialog: **`daz`**, **`pc-raum`**.

---

## 5. Coach-Einblendungen — `app/content/coach-messages.json`

Fortschritts-getriggerte Maskottchen-Texte ([ADR-019](./adr/019-coach-fortschritt-einblendung.md)), **getrennt** von `stations.json`.

| Trigger | Wann |
|---------|------|
| `hub-milestone` | Nach X besuchten Stationen auf der Startseite |
| `hub-complete` | Alle Stationen besucht |
| `room-first` | Erster Besuch eines Raums (`slug`) |

Felder: `id`, `mascot` (`frieda` \| `otto` \| `duo`), `placement`, `text`, optional `modes: ["fest", "heft"]`.

Validierung: `npm run validate:coach` (Teil von `npm run build`).

README: [`app/content/README.md`](../app/content/README.md)

---

## 6. Brand- und UI-Assets — `app/public/brand/`

| Ordner | Inhalt | Quelle |
|--------|--------|--------|
| `logos/` | Jubiläums-Lockup, Badge | `auftraggeber/Virtueller Schulrundgang/assets/` |
| `mascots/` | Frieda/Otto PNG für Dialog-Hotspots | gleich |
| `motifs/` | Dekorative PNGs | Auftraggeber (optional) |
| `hotspot-icons/` | Preset-Icons (audio, video, text, …) | App-intern |
| `hub/` | `gs39-front-outline.svg` (Startseiten-Hub) | `scripts/reference/` via `npm run prepare:hub-outline` |

### Design-Tokens (Farben, Typo)

| Datei | Rolle |
|-------|-------|
| `app/app/gs39-tokens.css` | CSS-Variablen (Hauptquelle zur Laufzeit) |
| `app/scripts/reference/colors_and_type.css` | Referenzkopie für Docker-Build |
| `auftraggeber/material/UI-Vorschläge/colors_and_type.css` | Auftraggeber-Original |

Nach Token-Änderung auch `app/lib/gs39-brand-colors.ts` (Hex für SVG) prüfen.

README: [`app/public/brand/README.md`](../app/public/brand/README.md)

---

## 7. QR-Codes und Zugang

| Was | Wo ändern |
|-----|-----------|
| Eintritts-Token | `app/lib/access-token-constants.mjs` (Single Source); Production: Coolify `SN_ACCESS_TOKENS` |
| Token rotieren | `npm run rotate:access-tokens` (#141) |
| QR-PNGs | `npm run generate:qr` → `app/public/qr/` |
| Basis-URL in QRs | `NEXT_PUBLIC_BASE_URL` in `.env.local` |

Raum-QRs verweisen auf `/raum/{slug}` (aus `stations.json`). Entry-QRs auf `/eintritt?t=…`.

Anleitung: [`anleitungen/qr-codes-drucken.md`](../anleitungen/qr-codes-drucken.md)

---

## 8. Autorenzone (Vorbereitung, nicht Laufzeit)

Hier sammelt die Schule Material **vor** der Übernahme ins Repo:

```
auftraggeber/material/
├── stationen/              Rohfotos 001.jpeg–012.jpeg, HTML-Referenz
├── stationen/transkripte/  Dialog-Artefakte (010-PC-Raum, 011-DaZ-Zimmer)
├── stationen-360-pano/     Panorama-Roh + Export
├── medien/{slug}/          Audio, Video, Fotos, Texte
└── UI-Vorschläge/          Design-Vorgaben
```

Zuordnung Slug ↔ Foto: [`auftraggeber/material/stationen/zuordnung-stationen-bilder.md`](../auftraggeber/material/stationen/zuordnung-stationen-bilder.md)

---

## 9. Hilfsmittel zum Platzieren (kein visueller Editor)

| Methode | Wofür |
|---------|-------|
| **A** — Schätzung + Nachjustieren | `x`/`y`/`mascotSize` in JSON, Seite neu laden |
| **B** — Browser-Konsole-Snippet | Klick-Koordinaten auf Flat-Panorama (siehe [`content-einpflegen.md`](../anleitungen/content-einpflegen.md)) |
| **C** — Erst ohne Hotspots | Nur `medien[]`, Wiedergabe über Medienliste |
| **D** — Sphere-Kalibrierung | `/raum/{slug}?hotspot-calib=1` → JSON-Snippet kopieren |
| **Debug** | `?debug=1` — Gyro-HUD |

---

## 10. Validierung und Deploy-Workflow

```bash
cd app
npm run validate:stations   # Pfade, Schema, Hotspot-Heuristiken
npm run validate:coach      # Coach-Messages
npm run validate:tokens     # GS39-Tokens
npm run test
npm run build               # ruft alle Validatoren auf
```

Nach Push: Coolify-Deploy. Raumbilder per **Git LFS**.

Lokal testen: `npm run dev` → `/eintritt?t=heft-2026-27` (alle Räume frei). Details: [`anleitungen/lokal-testen-und-anschauen.md`](../anleitungen/lokal-testen-und-anschauen.md)

---

## 11. Nur mit Code-Änderung (nicht Redaktion)

Diese Inhalte und Strukturen liegen in TypeScript und erfordern Entwickler:

| Datei | Was |
|-------|-----|
| `app/lib/hub-slot-definitions.ts` | Hub-Slot-Geometrie (`HUB_SLOTS`) — an SVG gekoppelt |
| `app/lib/home-cta.ts`, `app/lib/next-station.ts` | Startseiten-CTA-Logik |
| `app/lib/lucide-icon-registry.ts` | Lucide-Name → Komponente (nicht JSON-serialisierbar) |
| UI-Komponenten | Feste UI-Strings (Hinweisseiten, Buttons) |

**Hub-Konfiguration (Slug↔Slot, Akzente, Icons):** `data/hub-slug-map.json`, `data/station-accents.json`, `data/station-icons.json` — MPZ Studio [`/mpz/studio/hub`](../anleitungen/fuer-entwickler.md) oder manuell im Repo. Loader: `schoolhouse-hub-map.ts`, `gs39-brand-colors.ts`, `station-icons.ts`.

**Brand-Assets (Logos, Maskottchen, Motive):** `public/brand/` — MPZ Studio [`/mpz/studio/brand`](../anleitungen/fuer-entwickler.md) oder manuell im Repo. Feste Slot-Dateinamen (z. B. `mascots/frieda.png`); Hotspot-Preset-Icons und Hub-SVG bleiben Dev-Pflege.

**Embed-Allowlist:** `data/embed-allowlist.json` — MPZ Studio `/mpz/studio/embeds`.

Hub-SVG: `viewBox` 1086,5×1453,9 ist an Slot-Koordinaten gekoppelt — bei Asset-Wechsel Koordinaten neu vermessen ([ADR-016](./adr/016-hub-frontansicht-39gs.md), [ADR-020](./adr/020-hub-wegweiser-aussen-stationen.md)).

---

## 12. Umgebungsvariablen mit Content-Bezug

| Variable | Wirkung |
|----------|---------|
| `NEXT_PUBLIC_BASE_URL` | QR-Ziel-URLs |
| `NEXT_PUBLIC_EMBED_ENABLED` | Delightex-iframe ein/aus |
| `DEV_UNLOCK_ALL=true` | Dev: alle Hub-Fenster klickbar |

Vorlage: [`app/.env.example`](../app/.env.example)

---

## 13. Zukünftig: Directus (Phase 5)

Geplant laut [ADR-003](./adr/003-content-mvp-json-directus.md):

- Collections spiegeln das heutige JSON-Schema (`stations`, Medien, Hotspots, Dialog)
- Lehrkräfte pflegen über Admin-UI (Platzhalter in [`anleitungen/fuer-lehrkraefte.md`](../anleitungen/fuer-lehrkraefte.md))
- Frontend lädt dann aus Directus-API statt aus `stations.json`
- Medienbibliothek, Rollen, mandantenfähig (pro Schule)

Bis dahin: **kein Admin-UI** — alles über Repo-Dateien.

---

## 14. Schnellreferenz: Content-Typ → Ort → Wer (MVP)

| Content-Typ | Laufzeit-Ort | JSON / Config | Wer (MVP) |
|-------------|--------------|---------------|-----------|
| Stationstitel, Beschreibung | — | `stations.json` | MPZ |
| Medien (A/V/Foto/Text) | `public/media/{slug}/` | `medien[]` | MPZ |
| Externe Links / Embeds | — | `medien[]` (`link`/`embed`) | MPZ |
| Raumbild Flat | `public/stations/` | `bild` | MPZ + Export-Skript |
| Raumbild 360° | `public/stations/360/` | `viewer`, `panorama360` | MPZ + Export-Skript |
| Hotspots Flat | — | `hotspots[]` | MPZ (Kalibrierung) |
| Hotspots Sphere | — | `hotspots360[]` | MPZ (`?hotspot-calib=1`) |
| Dialog-Texte | — | `dialog.segmente[]` | MPZ |
| Dialog-Audio | `content/dialog-audio/` | `dialog.segmente[].quelle` | MPZ |
| Sprechblasen-Layout | — | `dialog.bubble` | MPZ |
| Coach-Texte | `content/coach-messages.json` | — | MPZ/Dev |
| Maskottchen-Bilder | `public/brand/mascots/` | — | MPZ (aus Auftraggeber) |
| Logos, Motive | `public/brand/` | — | MPZ |
| Hotspot-Preset-Icons | `public/brand/hotspot-icons/` | — | Dev |
| Hub-Gebäude-SVG | `public/brand/hub/` | — | Dev (Skript) |
| Farben/Typo | `gs39-tokens.css` | — | Dev (aus Auftraggeber) |
| Hub-Slot ↔ Station | `data/hub-slug-map.json` | MPZ Studio `/mpz/studio/hub` | MPZ |
| Stations-Akzente (Hub) | `data/station-accents.json` | MPZ Studio `/mpz/studio/hub` | MPZ |
| Stations-Icons (Hub) | `data/station-icons.json` | MPZ Studio `/mpz/studio/hub` | MPZ |
| Embed-Allowlist | `data/embed-allowlist.json` | MPZ Studio `/mpz/studio/embeds` | MPZ |
| Eintritts-Token | `access-tokens.ts` | — | Dev |
| QR-Codes | `public/qr/` (generiert) | — | Dev (`generate:qr`) |
| Demo → echter Content | Migration | Pfade in JSON | MPZ |

---

## 15. Kanonische Stationen (Slugs fix)

| Slug | Besonderheiten |
|------|----------------|
| `klassenzimmer` | Referenz-Station, vollständiger Content |
| `daz`, `pc-raum` | Dialog + Sphere |
| `musik` | Sphere, teils noch Demo-Texte |
| `kunst`, `hort` | Flat (4:3-Platzhalter) |
| `schulsozialarbeit` | Kein Raumbild, Demo-Text |
| `schulhof` | Außen-Station, Wegweiser-Slot (ADR-020) |

Vollständige Tabelle: [`content-verzeichnisstruktur.md`](./content-verzeichnisstruktur.md#kanonische-slug-liste-unveränderlich)

---

## Verwandte Dokumente

| Zweck | Datei |
|-------|-------|
| Schritt-für-Schritt einpflegen | [`anleitungen/content-einpflegen.md`](../anleitungen/content-einpflegen.md) |
| Slugs, Zonen, Pfade | [`content-verzeichnisstruktur.md`](./content-verzeichnisstruktur.md) |
| Architektur, Medien-Player | [`architektur.md`](./architektur.md) |
| Deploy, LFS, Dialog-Setup | [`anleitungen/fuer-entwickler.md`](../anleitungen/fuer-entwickler.md) |
| Lehrkräfte (Directus, später) | [`anleitungen/fuer-lehrkraefte.md`](../anleitungen/fuer-lehrkraefte.md) |
