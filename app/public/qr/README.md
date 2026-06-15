# QR-Codes (`public/qr/`)

PNG-Dateien und **Druck-PDFs** werden mit `npm run generate:qr` erzeugt (Issue #15). Sie sind in `.gitignore` (`public/qr/*.png`, `public/qr/pdf/*.pdf`), damit keine localhost-URLs versehentlich committed werden. Bewusst einchecken: `git add -f public/qr/entry-fest.png` usw.

**Entry-Token rotieren:** `npm run rotate:access-tokens` ([#141](https://github.com/flxln/schulnavigator/issues/141)) — rotiert Tokens in `lib/access-token-constants.mjs`, regeneriert Manifeste und beide QR-/PDF-Sets. Manuell bleiben: Coolify `SN_ACCESS_TOKENS`, Deploy, Druck. Siehe [`anleitungen/fuer-entwickler.md`](../../../anleitungen/fuer-entwickler.md#token-pflegen--rotieren).

## Voraussetzung

In `app/.env.local` (Vorlage: `.env.example`) **`NEXT_PUBLIC_BASE_URL`** setzen — ohne trailing slash, für Druck die **Produktions-Domain** nach Deploy (#16).

## Befehle

```bash
cd app
npm run generate:qr -- --dry-run
npm run generate:qr
# Schulfest (12 Räume + Entry fest): siehe anleitungen/schulfest-gs39-playbook.md
npm run generate:qr -- --preset=schulfest
```

Optional: Pixelbreite `--size=512` oder Umgebungsvariable `QR_PRINT_WIDTH_PX`.

| Befehl | Ausgabe |
|--------|---------|
| `generate:qr` | 2 Entry + 12 Raum → `manifest.json` + PDFs unter `pdf/` |
| `generate:qr -- --preset=schulfest` | 1 Entry (`fest`) + 12 Raum → `manifest-schulfest.json` + `qr-schulfest-*.pdf` |
| `generate:qr -- --only=slug1,slug2` | Subset nach Slug-Liste |
| `rotate:access-tokens` | Neue Entry-Tokens + beide QR-Sets + Coolify-JSON (#141) |

## Druck-PDFs (`public/qr/pdf/`)

Bei jedem Lauf (ohne `--dry-run`) werden **zwei PDFs** erzeugt. Volles Set (`qr-*.pdf`) und Schulfest-Set (`qr-schulfest-*.pdf`) können nebeneinander im Ordner liegen — `generate:qr` löscht nur PDFs des jeweiligen Presets.

| Datei (volles Set) | Layout |
|--------------------|--------|
| `qr-a5-2up.pdf` | A4 Hochformat, **2 Zonen à A5-Hälfte** (210×148,5 mm), gestrichelte Schnittlinie in der Mitte; QR ~11 cm mit **label** (Slug) und **subtitle** (Raumtitel) |
| `qr-a4-grid-3cm.pdf` | A4-Raster **5×6** (30 Zellen/Seite), QR **30×30 mm**, label + subtitle unter dem Code |

Bei `--preset=schulfest`: `qr-schulfest-a5-2up.pdf` und `qr-schulfest-a4-grid-3cm.pdf`.

Reihenfolge in beiden PDFs: zuerst Entry-QRs, dann Räume alphabetisch nach Slug.

`--dry-run` zeigt zusätzlich die Print-Item-Liste und geschätzte Seitenanzahl (ohne Dateien).

## `manifest.json`

Wird beim echten Lauf (ohne `--dry-run`) geschrieben. Schema:

| Feld | Bedeutung |
|------|-----------|
| `generatedAt` | ISO-8601-Zeitstempel |
| `baseUrl` | verwendete Basis-URL |
| `entries` | Entry-QRs (`file`, `url`, `token`, `mode`: `fest` \| `heft`) |
| `rooms` | Raum-QRs (`file`, `url`, `slug`, `titel`) |

Für den Druckprozess siehe [anleitungen/qr-codes-drucken.md](../../../anleitungen/qr-codes-drucken.md).

## Entry-URLs vor Phase 2

Die Route `/eintritt` zeigt bis Issue #23 eine **Platzhalterseite** (kein 404); Token-Prüfung, Middleware und `localStorage` folgen in #23. Die **URL-Form** der Entry-QRs ist bereits festgelegt ([ADR-005](../../../dokumentation/adr/005-zugangskontrolle-token.md)).

## Manuelle Checkliste (nach `generate:qr`)

- [ ] Anzahl PNGs = 2 + Anzahl Stationen in `data/stations.json`
- [ ] Handy-Scan: mindestens ein Raum-QR und ein Entry-QR
- [ ] Druckprobe: QR mindestens 3×3 cm; bei Warnung zu langer URL `--size` erhöhen oder größer drucken
