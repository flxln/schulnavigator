# Content-Verzeichnisstruktur

Kanonische Referenz für alle Inhalte des Schulnavigators. Zwei Zonen: Autorenzone (Submodule, kein Docker-Image) und Laufzeitzone (`app/`, im Image).

Verwandte Entscheidungen: [ADR-006](./adr/006-raum-viewer-gyro-hotspots.md) (Gyro), [ADR-010](./adr/010-dialog-cutscene-gated-audio.md) (Dialog-Audio), [ADR-003](./adr/003-content-mvp-json-directus.md) (Directus-Zielbild), [build-kontext-submodule-regeln.md](./build-kontext-submodule-regeln.md).

---

## Kanonische Slug-Liste (unveränderlich)

Slugs sind durch gedruckte QR-Codes physisch fixiert. Keine Umbenennung ohne neue QR-Drucke. Alle Ordnernamen und `stations.json`-Einträge leiten sich von dieser Tabelle ab.

| # | Slug | Titel | Rohfoto | Status |
|--:|------|-------|---------|--------|
| 1 | `klassenzimmer` | Klassenzimmer | `012.jpeg` | ✅ |
| 2 | `daz` | DaZ-Zimmer | `011.jpeg` | 🟡 prüfen |
| 3 | `pc-raum` | PC-Raum | `010.jpeg` | ✅ |
| 4 | `werken` | Werkenzimmer | `008.jpeg` | ✅ |
| 5 | `turnhalle` | Turnhalle | `006.jpeg` | ✅ |
| 6 | `speiseraum` | Speiseraum | `005.jpeg` | ✅ |
| 7 | `kunst` | Kunstzimmer | `004.jpeg` | ✅ |
| 8 | `lesewelt` | Lesewelt | `003.jpeg` | ✅ |
| 9 | `hort` | Hortzimmer | `002.jpeg` | ✅ |
| 10 | `musik` | Musikzimmer | `001.jpeg` | ✅ |
| 11 | `schulsozialarbeit` | Schulsozialarbeiterzimmer | — | ❌ Foto fehlt |

Vollständige Zuordnung Slug ↔ Rohfoto ↔ HTML-Referenz: [`auftraggeber/material/stationen/zuordnung-stationen-bilder.md`](../auftraggeber/material/stationen/zuordnung-stationen-bilder.md).

Stationen mit Dialog-Audio (MVP): `daz`, `pc-raum`.

---

## Grundprinzip: zwei Zonen

| Zone | Pfad | Rolle | Im Docker-Image? |
|------|------|--------|------------------|
| Autoren- & Rohmaterial | `auftraggeber/material/` | Schule/MPZ liefert, Varianten, Rohaudio | **Nein** |
| Laufzeit-Content | `app/data/`, `app/public/`, `app/content/` | Versioniert, deploybar | **Ja** |

**Workflow:** Rohmaterial in `auftraggeber/` → nach Freigabe **kopieren** (nicht verlinken) nach `app/`.

---

## Autorenzone (`auftraggeber/material/`)

```
auftraggeber/material/
├── stationen/
│   ├── zuordnung-stationen-bilder.md   # Slug ↔ Foto (Referenz)
│   ├── Virtueller Schulrundgang.html
│   ├── 001.jpeg … 012.jpeg             # 4:3-Rohfotos
│   └── transkripte/                    # Dialog-Artefakte
│       ├── daz/
│       └── pc-raum/
│
├── stationen-360-pano/                 # Gyro-Panoramas (ADR-006)
│   ├── README.md
│   ├── flat/                           # Panoramas (≥ 2,5:1)
│   │   └── {slug}/
│   │       ├── raw/                    # Originalaufnahmen
│   │       └── export/
│   │           └── {slug}.jpg          # freigegebenes Exportbild → app/public/stations/
│   └── equirect/                       # optional später (ADR-014)
│       └── {slug}/export/
│
├── medien/                             # Stations-Medien (Roh)
│   ├── README.md
│   └── {slug}/
│       ├── audio/
│       ├── video/
│       ├── fotos/
│       └── texte/
│
└── UI-Vorschläge/                      # bestehend
```

---

## Laufzeitzone (`app/`)

```
app/
├── data/
│   └── stations.json                   # Metadaten, Hotspots, Dialog-Schema
│
├── content/                            # nicht öffentlich (Route-Handler)
│   └── dialog-audio/{slug}/
│       └── {nn}-{sprecher}.wav         # z. B. 01-frieda.wav, 09-beide.wav
│
└── public/
    ├── brand/                          # Logos, Maskottchen
    ├── stations/                       # Raumbilder (1 Datei pro Slug)
    │   └── {slug}.jpg                  # ≤ 500 KB, optimiert
    ├── media/                          # öffentliche Stations-Medien
    │   └── {slug}/
    │       ├── audio/
    │       ├── video/
    │       ├── fotos/
    │       └── texte/
    ├── demo/                           # Platzhalter (wird pro Station ersetzt)
    └── qr/                             # generierte QR-PNGs
```

---

## Pfadkonventionen in `stations.json`

| Feld | Pfad | Auslieferung |
|------|------|--------------|
| `bild` | `/stations/{slug}.jpg` | statisch |
| `medien[].quelle` (audio/video/foto/text) | `/media/{slug}/{typ}/{datei}` | statisch |
| `dialog.segmente[].quelle` | `/api/dialog/{slug}/{nn}-{sprecher}.wav` | Route-Handler, Cookie-geschützt |

---

## Content-Typ → Ablage

| Content-Typ | Autorenzone | Laufzeit | Auslieferung |
|-------------|-------------|----------|--------------|
| Texte, Hotspots, Dialog-Metadaten | `stationen/`, `transkripte/` | `data/stations.json` | SSR/Client |
| Raumbild / Gyro-Panorama | `stationen-360-pano/flat/{slug}/export/` | `public/stations/{slug}.jpg` | statisch |
| 360°-Kugel (später, ADR-014) | `stationen-360-pano/equirect/` | `public/stations/360/{slug}.jpg` | statisch |
| Dialog-Audio | `transkripte/{slug}/` | `content/dialog-audio/{slug}/` | `GET /api/dialog/…` (Cookie) |
| Audio / Video / Foto / Text | `medien/{slug}/` | `public/media/{slug}/…` | statisch |
| Brand / Maskottchen | `UI-Vorschläge/assets/` | `public/brand/` | statisch |
| QR-Codes | — | `public/qr/` | statisch |

---

## Dialog-Audio-Konvention (ADR-010)

- **Dateiname:** `{nn}-{sprecher}.wav` — nn zweistellig (01–99), sprecher: `frieda`, `otto` oder `beide`
- **Ablage:** `app/content/dialog-audio/{slug}/`
- **Route:** `GET /api/dialog/{slug}/{clip}` mit Cookie-Auth (403 ohne Token), Range/206 für iOS
- **Quelle:** `auftraggeber/material/stationen/transkripte/{slug}/`

Details: [ADR-010](./adr/010-dialog-cutscene-gated-audio.md).

---

## Demo → Media Migration

`public/demo/` enthält Platzhalter-Medien für Stationen ohne echten Content. Migration pro Station:

1. Echte Mediendateien in `app/public/media/{slug}/` ablegen
2. `/demo/…`-Pfade in `stations.json` durch `/media/{slug}/…` ersetzen
3. `npm run validate:stations` — muss grün sein
4. Demo-Datei entfernen, sobald alle Referenzen umgestellt sind

**Owner:** MPZ/Entwickler bei Content-Freigabe der jeweiligen Station.
