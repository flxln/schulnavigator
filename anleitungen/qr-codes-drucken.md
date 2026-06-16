# Schulnavigator — QR-Codes drucken

*Schritt-für-Schritt-Anleitung zum Exportieren und Drucken der QR-Codes (Issue #15, [ADR-005](../dokumentation/adr/005-zugangskontrolle-token.md)).*

---

## Voraussetzungen

- Node.js 20+ und `npm install` im Ordner `app/`
- **Produktions-Domain** nach Deploy (#16) in `app/.env.local` als `NEXT_PUBLIC_BASE_URL` (ohne trailing slash) — Vorlage: [`app/.env.example`](../app/.env.example)
- Technische Details und Entwickler-Workflow: [`fuer-entwickler.md`](./fuer-entwickler.md), Ordner-Hinweise: [`app/public/qr/README.md`](../app/public/qr/README.md)

**Entry-Token rotieren (neue `fest-`/`heft-` URLs):** `npm run rotate:access-tokens` ([#141](https://github.com/flxln/schulnavigator/issues/141)) — erzeugt neue Tokens, aktualisiert Manifeste und beide PDF-Sets. Details: [`fuer-entwickler.md` — Token rotieren](./fuer-entwickler.md#token-pflegen--rotieren). Nach jeder Rotation: Coolify `SN_ACCESS_TOKENS` (Prod + Dev) **vor** Deploy setzen.

---

## Schritt 1: QR-PNGs und Druck-PDFs erzeugen

Im Verzeichnis `app/`:

```bash
npm run generate:qr -- --dry-run
```

Prüft URLs und schreibt **keine** Dateien (Manifest-Vorschau auf der Konsole).

```bash
npm run generate:qr
```

Erzeugt unter `app/public/qr/`:

- zwei **Entry-QRs** (`entry-fest.png`, `entry-heft.png`) mit `/eintritt?t=…`
- je einen **Raum-QR** pro Eintrag in `data/stations.json` (`raum-{slug}.png`) mit `/raum/{slug}` **ohne** Token
- zwei **Druck-PDFs** unter `app/public/qr/pdf/`:
  - `qr-a5-2up.pdf` — A4 mit zwei beschrifteten QR-Zonen (halbiert = A5-Kärtchen)
  - `qr-a4-grid-3cm.pdf` — A4-Raster mit QR **3×3 cm** und Slug/Titel pro Zelle

Optional: größere Pixelmatrix für dichtere URLs: `--size=640` oder `QR_PRINT_WIDTH_PX` in `.env.local`.

### Schulfest-Subset (26.06., Modus `fest`)

Nicht alle 12 Räume drucken — siehe [schulfest-gs39-playbook.md](./schulfest-gs39-playbook.md).

```bash
npm run generate:qr -- --preset=schulfest --dry-run
npm run generate:qr -- --preset=schulfest
```

Erzeugt **1× Entry** (`entry-fest.png`) + **12× Raum-QR** (alle Stationen in `app/scripts/qr-config.mjs`), `manifest-schulfest.json` und `qr-schulfest-a5-2up.pdf` / `qr-schulfest-a4-grid-3cm.pdf`.

Eigene Slug-Liste:

```bash
npm run generate:qr -- --only=turnhalle,speiseraum,werken,lesewelt,musik,daz
```

**Outdoor (Schulhof):** mind. **5 × 5 cm**, matt laminiert, Sonnentest — Spezifikation im Playbook.

**Warnung „URL zu lang“:** Bei kleinem Druck (3 cm) lieber 4 cm wählen oder `--size` erhöhen.

---

## Schritt 2: Druckvorlage

**Variante A — PDFs (empfohlen):**

- `app/public/qr/pdf/qr-a5-2up.pdf` auf **A4** drucken, in der Mitte halbieren → zwei beschriftete A5-Kärtchen pro Blatt
- `app/public/qr/pdf/qr-a4-grid-3cm.pdf` für kleine Aufkleber/Einzel-QRs (3 cm Kantenlänge, 5×6 pro Seite)

**Variante B — Einzel-PNGs:**

- PNGs aus `app/public/qr/` in die gewünschte Layout-Software legen (z. B. ein QR pro A6-Kärtchen).

`manifest.json` im gleichen Ordner listet Dateiname und Ziel-URL (Hilfe für Abnahme und [#36](../dokumentation/github-project/issues-phase-3.md)).

---

## Schritt 3: Drucken und anbringen

- **Schwarzweiß**, mind. **300 dpi** bezogen auf die gedruckte QR-Größe
- QR-Code mindestens **3 × 3 cm** (besser 4 cm bei langen URLs)
- Nach dem Druck mit dem Handy testen (Scan aus ~1 m Entfernung)

---

## Empfehlung

- Laminieren für Langlebigkeit
- A5 oder A6 Format ist gut lesbar
- PNGs und PDFs sind standardmäßig **nicht** versioniert (`public/qr/*.png`, `public/qr/pdf/*.pdf` in `.gitignore`); bewusst committen: `git add -f app/public/qr/…`

---

## Checkliste vor dem Fest

- [ ] `NEXT_PUBLIC_BASE_URL` zeigt auf die **live** Domain (HTTPS)
- [ ] `npm run generate:qr` ohne `--dry-run` ausgeführt, `manifest.json` geprüft
- [ ] Stichprobe: Raum-QR und Entry-QR mit Handy gescannt
- [ ] Physische Verteilung mit der Schule geklärt (12 Räume + Eingang/Heft)
