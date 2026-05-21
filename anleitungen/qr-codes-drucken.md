# Schulnavigator — QR-Codes drucken

*Schritt-für-Schritt-Anleitung zum Exportieren und Drucken der QR-Codes (Issue #15, [ADR-005](../dokumentation/adr/005-zugangskontrolle-token.md)).*

---

## Voraussetzungen

- Node.js 20+ und `npm install` im Ordner `app/`
- **Produktions-Domain** nach Deploy (#16) in `app/.env.local` als `NEXT_PUBLIC_BASE_URL` (ohne trailing slash) — Vorlage: [`app/.env.example`](../app/.env.example)
- Technische Details und Entwickler-Workflow: [`fuer-entwickler.md`](./fuer-entwickler.md), Ordner-Hinweise: [`app/public/qr/README.md`](../app/public/qr/README.md)

---

## Schritt 1: QR-PNGs erzeugen

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

Optional: größere Pixelmatrix für dichtere URLs: `--size=640` oder `QR_PRINT_WIDTH_PX` in `.env.local`.

**Hinweis:** Route `/eintritt` und Token-Prüfung kommen in Phase 2 (#23). Entry-QRs können bis dahin im Browser eine Fehlerseite zeigen — die **URL-Form** ist bereits festgelegt.

**Warnung „URL zu lang“:** Bei kleinem Druck (3 cm) lieber 4 cm wählen oder `--size` erhöhen.

---

## Schritt 2: Druckvorlage

- PNGs aus `app/public/qr/` in die gewünschte Layout-Software legen (z. B. ein QR pro A6-Kärtchen).
- `manifest.json` im gleichen Ordner listet Dateiname und Ziel-URL (Hilfe für Abnahme und [#36](../dokumentation/github-project/issues-phase-3.md)).

---

## Schritt 3: Drucken und anbringen

- **Schwarzweiß**, mind. **300 dpi** bezogen auf die gedruckte QR-Größe
- QR-Code mindestens **3 × 3 cm** (besser 4 cm bei langen URLs)
- Nach dem Druck mit dem Handy testen (Scan aus ~1 m Entfernung)

---

## Empfehlung

- Laminieren für Langlebigkeit
- A5 oder A6 Format ist gut lesbar
- PNGs sind standardmäßig **nicht** versioniert (`public/qr/*.png` in `.gitignore`); bewusst committen: `git add -f app/public/qr/…`

---

## Checkliste vor dem Fest

- [ ] `NEXT_PUBLIC_BASE_URL` zeigt auf die **live** Domain (HTTPS)
- [ ] `npm run generate:qr` ohne `--dry-run` ausgeführt, `manifest.json` geprüft
- [ ] Stichprobe: Raum-QR und Entry-QR mit Handy gescannt
- [ ] Physische Verteilung mit der Schule geklärt (11 Räume + Eingang/Heft)
