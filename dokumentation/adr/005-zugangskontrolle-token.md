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
| **`fest`** | Schulfest / Tag der offenen Tür | kurz (z. B. Festzeitraum) | **Kein Hub:** keine klickbare Liste aller Räume; Willkommen + Fortschritt (Stempel) + „Station scannen“ |
| **`heft`** | Schulstartheft / Dauerbetrieb | lang (z. B. 1 Schuljahr) | **Hub:** alle Stationen auf der Startseite anklickbar |

Raum-QRs (`/raum/[slug]`) sind in **beiden** Modi **Navigation**, keine separaten Zugangsrechte pro Raum. Wer den Entry hat, könnte eine Raum-URL theoretisch manuell aufrufen — am Fest wird das über **UX** (kein Hub) nicht angeboten.

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
- **`fest` ohne Hub** erhält den Rundgang-Charakter am offenen Tag
- **`heft` mit Hub** unterstützt Eltern ohne Besuch jedes Raums
- **`localStorage`** vermeidet leere Sessions bei Kamera-Scan in neuem Tab
- In-App-Scanner reduziert Reibung zwischen 11 Stationen
- Ein Token-Typ pro Profil skaliert später auf weitere Schulen (Config/Env)

## Verworfene Alternativen

- **Nur `sessionStorage`:** Raum-QR per Kamera öffnet oft neuen Tab ohne Token
- **Hub in beiden Modi:** widerspricht Schulfest-Nutzerführung (sofort alle Räume klickbar)
- **Token pro Raum im Heft:** unnötiger Druck- und Support-Aufwand
- **HTTP-Basic / Passwort:** im Gespräch verworfen
- **Echtes Login / Accounts:** zu schwer für MVP und Zielgruppe
- **Serverseitiger Scan-Nachweis pro Raum:** zu aufwendig für 26.06.

## Konsequenzen

- Phase 2: `/eintritt`, Middleware, `localStorage`-Hilfen, `/scan`, startseite mit `mode`-Abzweigung
- Token-Generierungs-Script (Issue #23): mindestens `fest-2026`, `heft-2026-27` mit Ablaufdatum
- Zwei Entry-QR-Drucke: Eingang Schulfest + Heft (gleiche App, unterschiedliche URLs)
- `robots.txt` / `noindex` für geschützte Bereiche ergänzen
- DSGVO: Zugang über Einladungslink-Charakter dokumentieren; kein Anspruch auf starke Authentifizierung
