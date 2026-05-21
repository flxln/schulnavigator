# QR-Codes (`public/qr/`)

PNG-Dateien werden mit `npm run generate:qr` erzeugt (Issue #15). Sie sind in `.gitignore` (`public/qr/*.png`), damit keine localhost-URLs versehentlich committed werden. Bewusst einchecken: `git add -f public/qr/entry-fest.png` usw.

## Voraussetzung

In `app/.env.local` (Vorlage: `.env.example`) **`NEXT_PUBLIC_BASE_URL`** setzen — ohne trailing slash, für Druck die **Produktions-Domain** nach Deploy (#16).

## Befehle

```bash
cd app
npm run generate:qr -- --dry-run
npm run generate:qr
```

Optional: Pixelbreite `--size=512` oder Umgebungsvariable `QR_PRINT_WIDTH_PX`.

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
