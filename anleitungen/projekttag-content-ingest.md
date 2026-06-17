# Projekttag — Content-Ingest (Plan A)

_Schneller, stabiler Workflow für 24./25.06.2026 — ohne MPZ Studio als Single Point of Failure._

**MPZ Studio (Plan B)** ist optional und kommt später; die volle Spezifikation steht in [`2026-06-16-mpz-studio-spezifikation.md`](../dokumentation/projektmanagement/2026-06-16-mpz-studio-spezifikation.md).

Allgemeine Content-Regeln: [content-einpflegen.md](./content-einpflegen.md)

---

## Plan A vs. Plan B

| | **Plan A (Pflicht)** | **Plan B (optional)** |
|---|----------------------|------------------------|
| **Was** | JSON-Schema, Snippets, CLI, Hotspot-Kalibrierung, Git-Rhythmus | MPZ Studio (lokales UI) |
| **Wann** | Sofort | Nur wenn bis ~22.06. stabil |
| **Risiko** | Niedrig | UI-Bug darf den Tag nicht blockieren |
| **Production** | Kein Schreib-Tool auf Coolify | Studio nur `npm run dev` auf dem Laptop |

---

## Checkliste Projekttag

### Mitbringen

- [ ] Laptop mit Repo + `npm run dev` getestet
- [ ] Mikrofon, Akku, Handy für Mobilfunk-Test
- [ ] Einverständniserklärungen (Schule)

### Pro Station (Rhythmus)

1. **Aufnahme** — Kinder-Audio/Video/Foto; nur mit Einwilligung
2. **Datei** — AirDrop/USB auf den Laptop
3. **Ingest** — CLI (siehe unten) oder manuell kopieren + Snippet in `stations.json`
4. **Hotspots** — Sphere: `/raum/{slug}?hotspot-calib=1` → „In stations.json übernehmen“ (#149); Flat: `/mpz/calib/flat/{slug}` (#149) oder manuell ([content-einpflegen.md](./content-einpflegen.md))
5. **Validieren** — `cd app && npm run validate:stations`
6. **Vorschau** — `npm run dev` → `/eintritt?t=<heft-token>` (aus `access-token-constants.mjs`) → `/raum/{slug}`
7. **Commit** — eine Station pro Commit (Rollback möglich)
8. **Deploy** — push → Coolify; Handy unter Mobilfunk testen

### Escape Hatch

Formate außerhalb von audio/video/foto/text (PDF, exotischer Embed): **direkt JSON** editieren — nicht Studio/CLI patchen unter Zeitdruck.

---

## IDE: JSON-Schema & Snippets

Öffne das Repo-Root in Cursor/VS Code. Für `app/data/stations.json` gilt:

- **Schema:** [`app/data/stations.schema.json`](../app/data/stations.schema.json) (Autocomplete, Enum für Slugs und Medientypen)
- **Snippets:** Präfix `sn-` in `.vscode/schulnavigator-content.code-snippets`

| Snippet | Inhalt |
|---------|--------|
| `sn-medium-audio` | Medien-Eintrag audio |
| `sn-medium-video` | Medien-Eintrag video (upload) |
| `sn-medium-foto` | foto |
| `sn-medium-text` | text (.md) |
| `sn-medium-link` | externer Link |
| `sn-medium-embed` | iframe-Embed |
| `sn-hotspot-flat` | Flat-Hotspot |
| `sn-hotspot360-medium` | Sphere-Hotspot Medien |
| `sn-hotspot360-dialog` | Sphere-Hotspot Dialog |
| `sn-dialog-segment` | Dialog-Segment + API-Pfad |
| `sn-coach-room-first` | Coach room-first |

**Tipp:** In `stations.json` an der Einfügestelle `sn-medium-audio` tippen → Tab.

---

## CLI: `content:ingest`

Kopiert eine Datei nach `public/media/{slug}/{audio|video|fotos|texte}/` und hängt optional einen `medien[]`-Eintrag an.

```bash
cd app

# Dry-run (nur anzeigen)
npm run content:ingest -- --slug werken --typ audio --file ~/Downloads/aufnahme.m4a --untertitel "Unser Werken" --dry-run

# Ausführen
npm run content:ingest -- --slug werken --typ audio --file ~/Downloads/aufnahme.m4a --untertitel "Unser Werken"

# Nur Datei kopieren, JSON manuell
npm run content:ingest -- --slug werken --typ foto --file ./bild.jpg --no-append
```

Nach dem Lauf: Struktur- und Asset-Validierung laufen **vor** dem Schreiben über [`lib/mpz-content-io`](../app/lib/mpz-content-io.ts) (Pre-Validate, dann atomarer Write; Backup `app/data/stations.json.bak`). Bei Fehler bleibt `stations.json` unverändert.

**Plan-B-Alternative (#147):** Derselbe Pfad/JSON-Effekt steht auch als lokales Studio-Upload-UI unter `/mpz/studio/ingest` bereit (nur `npm run dev`) — gemeinsamer Ingest-Layer mit der CLI, aber mit automatischem Umbenennen bei Kollision statt Abbruch.

**Nicht unterstützt:** `link`, `embed` — URLs per Snippet in JSON eintragen.

---

## Dialog-Audio

1. WAV nach `app/content/dialog-audio/{slug}/` — Namen: `01-frieda.wav`, `02-otto.wav`, … (Index in `segmente[]` + `rolle`)
2. In `stations.json`: Snippet `sn-dialog-segment` oder Referenz `daz` / `pc-raum`
3. `validate:stations` + Test mit Zugang (`/eintritt?t=heft-…`)

**Plan-B (#148):** `npm run content:ingest-dialog -- --slug daz --segment 0 --file ./clip.wav` oder Studio unter `/mpz/studio/dialog-audio` (setzt `quelle` automatisch).

---

## Undo bei Fehlern

| Problem | Aktion |
|---------|--------|
| Letzter Save falsch | `git checkout -- app/data/stations.json` |
| CLI hat .bak geschrieben | `cp app/data/stations.json.bak app/data/stations.json` |
| Deploy kaputt | vorherigen Commit auf Coolify redeployen |

Kein Studio auf Production — Schreibzugriff nur lokal im Repo.

---

## Verwandt

- Issue [#37](../dokumentation/github-project/issues-phase-3.md) — Projekttag
- [lokal-testen-und-anschauen.md](./lokal-testen-und-anschauen.md)
- [fuer-entwickler.md](./fuer-entwickler.md) — Deploy
