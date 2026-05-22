# ADR-007 — Zugangskontrolle: HttpOnly-Cookie + Middleware

**Datum:** 2026-05-22  
**Status:** entschieden

## Kontext

[ADR-005](./005-zugangskontrolle-token.md) sieht **`localStorage`** als Zugangsspeicher und **Middleware (oder äquivalent)** als Durchsetzung vor. Next.js **Edge-Middleware** läuft serverseitig und kann `localStorage` nicht lesen. Ein reiner Client-Guard würde geschützte Inhalte kurz „flashen“, bevor JavaScript umleitet.

Gleichzeitig muss ein per **System-Kamera** in einem neuen Tab geöffneter Raum-QR den Zugang behalten (Cross-Tab, same-origin).

## Entscheidung

- Zugang wird über ein **HttpOnly-Cookie** `sn_access` durchgesetzt; Inhalt = **nur der Token-String** (z. B. `fest-2026`).
- Cookie-Flags: `HttpOnly`, `Secure` (nur in Production), `SameSite=Lax`, `Path=/`.
- **Middleware** validiert bei jedem Request den Cookie-Inhalt erneut gegen [`app/lib/access-tokens.ts`](../../app/lib/access-tokens.ts) (Token-Liste + Ablauf) — Manipulation des Cookie-Werts bringt ohne Eintrag in der Liste nichts.
- Entry-QR `/eintritt?t=<token>`: Middleware setzt Cookie und leitet auf `/` um.
- Ohne gültigen Token → Redirect `/eintritt` (Hinweis/Fehler).
- Modus `fest`/`heft` wird serverseitig aus dem validierten Token abgeleitet und an den Hub gegeben (kein separates Client-Storage für den Modus).

## Begründung

- Echtes serverseitiges Gate ohne Flash geschützter Seiten.
- Cookie ist same-origin → Cross-Tab-Anforderung aus ADR-005 erfüllt (Raum-QR in neuem Tab sendet Cookie mit).
- Kein JWT/signiertes Cookie nötig — „weiches“ Gate, DSGVO-Einordnung unverändert (Einladungslink-Charakter).
- `validateToken` bleibt Edge-tauglich (reines TypeScript, keine Node-APIs).

## Verworfene Alternativen

- **Nur `localStorage` + Client-Redirect:** Middleware kann nicht durchsetzen; Flash-Risiko; widerspricht „Middleware“ in ADR-005.
- **Signiertes JWT-Cookie:** Overkill für MVP und DSGVO-Einordnung; Token-Liste reicht.
- **`sessionStorage`:** Cross-Tab bricht (bereits in ADR-005 verworfen).

## Konsequenzen

- ADR-005 bleibt inhaltlich gültig (Profile, Entry-Token, Scanner, keine Accounts). **Speicher und Durchsetzung** werden durch ADR-007 ergänzt (`localStorage` → Cookie).
- Issue **#23** setzt Cookie, Middleware, `/eintritt`-Hinweisseite, Hub-Modus-Plumbing und `/scan` um.
- Progressive Puzzle-Freischaltung (`fest`) bleibt **#21** (Stempel/`visitedSlugs` separat).
- Dev: `secure: false` wenn `NODE_ENV !== 'production'`, damit localhost funktioniert.
- Token-Rotation: Code in `access-tokens.ts` + `qr-config.mjs` synchron halten, deployen, QR-PNGs neu erzeugen.
