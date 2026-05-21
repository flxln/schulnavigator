# ADR-005 — Zugangskontrolle: Entry-Token, Nutzungsmodi, In-App-Scanner

**Datum:** 2026-05-21  
**Status:** entschieden

## Kontext

Die App soll nicht öffentlich indexierbar sein, aber ohne Passwort-Eingabe nutzbar bleiben (Gespräch 39. Grundschule). Besucher scannen QR-Codes; am Schulfest sollen sie **physisch zu den Räumen** gehen, im Schulstartheft sollen Eltern **alle Stationen bequem** erreichen können.

Technisch: Web-App (Next.js), kein App Store (ADR-002), Hosting MPZ (ADR-001).

## Entscheidung

### 1. Zugang: ein Entry-Token (kein Login)

- **Route:** `/eintritt?t=<token>` (oder äquivalent `?token=`)
- **QR am Eingang / im Schulstartheft** enthält die vollständige URL → Nutzer scannt **einmalig mit der System-Kamera**
- Server/Config prüft Token + **Ablaufdatum**
- Gültiger Token wird in **`localStorage`** gespeichert (nicht nur `sessionStorage`), damit ein **neuer Tab** durch späteren Kamera-Scan auf Raum-QRs den Zugang behält
- **Keine** Nutzerkonten, **kein** Passwort

### 2. Zwei Nutzungsprofile (an Token gekoppelt)

| Profil | Token-Beispiel | Gültigkeit | Startseite nach Entry |
|--------|----------------|------------|------------------------|
| **`fest`** | Schulfest / Tag der offenen Tür | kurz (z. B. Festzeitraum) | **Puzzle-Hub:** schematisches Schulhaus mit 11 Segmenten; Segmente werden nach Scan **progressive disclosure** (aufgedeckt); nur freigeschaltete Stationen klickbar |
| **`heft`** | Schulstartheft / Dauerbetrieb | lang (z. B. 1 Schuljahr) | **Voller Hub:** alle 11 Stationen von Anfang an auf der Startseite anklickbar |

Raum-QRs (`/raum/[slug]`) sind in **beiden** Modi **Navigation**, keine separaten Zugangsrechte pro Raum. Wer den Entry hat, könnte eine Raum-URL theoretisch manuell aufrufen — am Fest lenkt der **Puzzle-Hub** (gesperrte Segmente) die Nutzung, ohne alle Räume sofort anzubieten.

### 3. Navigation nach Entry

- **Schulfest:** Nutzer bleiben in der Web-App; **In-App-QR-Scanner** (`/scan`, z. B. `html5-qrcode`) für Raum-QRs an den Türen — kein ständiges Wechseln zur System-Kamera
- **Fallback:** System-Kamera auf Raum-QR funktioniert dank `localStorage`; **Stationsliste** auf der Startseite nur im Modus `heft`, beim Fest nicht
- **Stempel** (Gamification): separat in `localStorage`, welche Stationen besucht wurden — **kein** Zugangsrecht

### 4. Geschützte Routen

Middleware (oder äquivalent): ohne gültigen Token in `localStorage` → Hinweisseite („QR am Eingang / im Heft scannen“).

Ausnahmen: `/eintritt`, statische Hinweis-/Fehlerseiten, `/api/health`, Impressum/Datenschutz.

### 5. Token-Rotation

Neue Token pro Schulfest bzw. pro Schuljahres-Heft; Entry-QR am Eingang austauschbar (Gespräch: „ändern ist kein Problem“). Raum-QRs an Türen bleiben stabil (`/raum/[slug]`).

### 6. Druck / Heft

- **Ein** Entry-QR im Schulstartheft — **keine** eigenen Tokens pro Raum im Druck
- Optional im Heft: inhaltliche Übersicht der Stationen (ohne Ersatz für Entry)

## Begründung

- Entspricht „Passwort ist der QR am Eingang“ (Sten), ohne Tippen
- **Puzzle-Hub bei `fest`** verbindet Museum-Übersicht (Thomas) mit QR-first-Rundgang: Teile decken sich nach Scan auf
- **`heft` mit Hub** unterstützt Eltern ohne Besuch jedes Raums
- **`localStorage`** vermeidet leere Sessions bei Kamera-Scan in neuem Tab
- In-App-Scanner reduziert Reibung zwischen 11 Stationen
- Ein Token-Typ pro Profil skaliert später auf weitere Schulen (Config/Env)

## Verworfene Alternativen

- **Nur `sessionStorage`:** Raum-QR per Kamera öffnet oft neuen Tab ohne Token
- **Voller Hub bei `fest`:** widerspricht Schulfest-Nutzerführung (sofort alle Räume klickbar)
- **Token pro Raum im Heft:** unnötiger Druck- und Support-Aufwand
- **HTTP-Basic / Passwort:** im Gespräch verworfen
- **Echtes Login / Accounts:** zu schwer für MVP und Zielgruppe
- **Serverseitiger Scan-Nachweis pro Raum:** zu aufwendig für 26.06.

## Konsequenzen

- **Phase 1 (Issue #14):** Startseite `/` mit schematischem Schulhaus (11 SVG-Segmente, Zuordnung `puzzleSegmentId` → Slug); Fortschritt-Platzhalter `0/11`; Link zu `/scan` (Platzhalterseite bis Phase 2); Freischalt-Logik nur als **Dev-Stub** (alle offen / alle gesperrt), ohne Token — echte Modi `fest`/`heft` folgen in Phase 2 (#21, #23)
- **Phase 1 (Issue #15):** Statische QR-Codes: `npm run generate:qr` (`tsx scripts/generate-qr-codes.ts`) → `public/qr/*.png` + `manifest.json`; URL-Bau in `lib/qr-urls.ts`; Token-Strings und Dateinamen in `scripts/qr-config.mjs`; `.env` / `.env.local` via `scripts/load-env-local.mjs`. Die **URL-Form** der Entry-QRs bleibt stabil.
- **Phase 1 (Issue #16):** Route `/eintritt` mit **Platzhalterseite** (HTTP 200, kein Next-404); `robots.txt` (`Disallow: /`) und `noindex` im Root-Layout bis zur abschließenden Feinabstimmung in #23. Serverseitige Token-Prüfung, Middleware und `localStorage` folgen in Phase 2 (#23).
- Phase 2: Middleware, `localStorage`-Hilfen, `/scan` mit Scanner, Startseite: Puzzle-Hub (`fest`) vs. voller Hub (`heft`); bestehende Route `/eintritt` (#16) um Token-Logik erweitern
- **Phase 2 (#23):** Token-Validierung und Ablaufdatum (mindestens `fest-2026`, `heft-2026-27` wie in `qr-config.mjs`); bei geänderter Domain oder Token die PNGs mit `npm run generate:qr` neu erzeugen
- Zwei Entry-QR-Drucke: Eingang Schulfest + Heft (gleiche App, unterschiedliche URLs)
- `robots.txt` / `noindex`: Basis site-wide in #16; in #23 bei Bedarf für geschützte Bereiche verfeinern (ADR-Ziel: App nicht öffentlich indexierbar)
- DSGVO: Zugang über Einladungslink-Charakter dokumentieren; kein Anspruch auf starke Authentifizierung
