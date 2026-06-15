# ADR-021 — Zugangsmodus konfigurierbar (open | gated), Tokens aus ENV, Embedding/CSP

**Datum:** 2026-06-15
**Status:** entschieden (ergänzt [ADR-005](./005-zugangskontrolle-token.md) und [ADR-007](./007-zugangskontrolle-cookie.md) um die konfigurierbare Durchsetzung)

## Kontext

[ADR-005](./005-zugangskontrolle-token.md) und [ADR-007](./007-zugangskontrolle-cookie.md) legen ein **weiches Zugangs-Gate** fest: Entry-Token (`fest`/`heft`) → HttpOnly-Cookie `sn_access`, von der Middleware bei jedem Request gegen eine Token-Liste geprüft. Dieses Gate ist **fest verdrahtet** — die App ist immer geschützt, es gibt keinen ungeschützten Betriebsmodus.

Zwei neue Anforderungen brechen diese Annahme auf:

1. **Einbettung auf Schulwebsites:** Die App soll perspektivisch per `<iframe>` in eine bestehende Website eingebunden werden. In diesem Szenario ist ein Token-Gate unerwünscht (die Website ist die Einladung), und die heutige CSP/Frame-Policy verhindert Framing ohnehin.
2. **Mehrere „Kunden" mit unterschiedlichem Bedarf:** Manche Schulen wollen offenen Zugang (Website-Einbettung), andere später eine **echte Sperre**. Ein fester Mechanismus für alle passt nicht.

Hinzu kommt ein verifizierter Ist-Stand-Befund (Erkundung SE-05, 2026-06-15): Die Token-Werte stehen **als Klartext** in [`app/lib/access-tokens.ts`](../../app/lib/access-tokens.ts) und liegen damit in einem **öffentlichen** GitHub-Repo (`flxln/schulnavigator`) — auch in der History nach Rotation. Sie werden **nicht** aus `process.env` gelesen. Für ein weiches Gate (DSGVO: Einladungslink-Charakter, ADR-007) ist das tolerierbar, untergräbt aber selbst die weiche Schutzwirkung und blockiert pro-Kunde-eigene Codes.

Hosting-Modell heute: **ein Deployment pro Mandant** (Coolify, ADR-001), nicht ein gemeinsames Deployment für viele Schulen. Echte Mandantenfähigkeit in einem Deployment hängt am Directus-Pfad (ADR-003) und ist hier **nicht** Gegenstand.

## Entscheidung

### 1. Zugangsmodus als Konfiguration pro Deployment

Neue Umgebungsvariable `SN_ACCESS_MODE` mit zwei Werten:

| Modus | Verhalten | Anwendungsfall |
|-------|-----------|----------------|
| `gated` (Default) | Heutiger Flow unverändert: Entry-Token → Cookie → Middleware-Prüfung; ohne gültigen Zugang Redirect `/eintritt`. | Schulfest, Schulstartheft, „echte Sperre"-Kunden |
| `open` | Middleware-Access-Check wird zum No-op; alle App-Routen ohne Token erreichbar. | Website-Einbettung, offener Dauerbetrieb |

- **Default = `gated`** → kein Verhaltenswechsel ohne explizites Opt-in; bestehende Deployments bleiben geschützt.
- Der Schalter wirkt ausschließlich auf die **Zugangs-Durchsetzung**. Hub-Modus (`fest`/`heft`), Stempel/`visitedSlugs` und Coach-Logik bleiben unberührt. In `open` ohne Cookie verwendet die App den Hub-Modus **`heft`** (voller Hub, alle Stationen von Anfang an klickbar) — passend zur offenen, einbettbaren Nutzung.

### 2. Tokens aus der Umgebung, Hardcode nur als Dev-Fallback

- Token-Liste wird in Production aus `SN_ACCESS_TOKENS` gelesen (JSON-Array `{ token, mode, expiresAt }`), nicht mehr aus dem Quellcode.
- Die heutigen Klartext-Werte in `access-tokens.ts` bleiben **nur** als Fallback für `NODE_ENV !== 'production'` (lokale Entwicklung).
- **Fail-closed:** Ist `SN_ACCESS_MODE=gated` und keine gültige `SN_ACCESS_TOKENS` gesetzt, lässt die App niemanden ein (kein stiller offener Zustand). Build-/Start-Validierung warnt explizit.
- Bei Einführung werden die exponierten Codes (`fest-2026`, `heft-2026-27`) **rotiert**; die alten gelten als verbrannt.

### 3. Embedding nur explizit erlauben (CSP)

- Einbettung als `<iframe>` erfordert eine konfigurierte Allowlist: `SN_EMBED_ANCESTORS` (Liste erlaubter Host-Origins) → `Content-Security-Policy: frame-ancestors …`.
- **Default: kein Framing erlaubt** (`frame-ancestors 'none'`/`'self'`). Framing ist ein bewusster Opt-in pro Deployment, unabhängig von `SN_ACCESS_MODE`.
- `robots.txt`/`noindex` (ADR-005 Konsequenzen) bleiben Default; ein offen+eingebettetes Deployment kann Indexierung separat relaxen.

## Begründung

- **Ein Schalter, beide Welten:** „offen" und „echte Sperre" sind dieselbe App mit unterschiedlicher Konfiguration — keine Forks, kein toter Code, der nur in einem Szenario läuft.
- **Backward-compatible:** Default `gated` ändert nichts am Bestand; das Risiko der Umstellung bleibt auf Deployments beschränkt, die `open` aktiv setzen.
- **Tokens aus ENV** ist ohnehin fällig (öffentliches Repo) und gleichzeitig die Voraussetzung für pro-Kunde-eigene Codes — ein Schritt löst Hygiene- und Mandanten-Anforderung.
- **Embedding getrennt vom Zugangsmodus:** Framing-Erlaubnis und Token-Gate sind orthogonal (man kann `gated` *und* eingebettet wollen). Getrennte Schalter halten die Kombinatorik sauber.
- **HMAC/JWT bleibt bewusst draußen:** Das Cookie trägt den Token selbst, der bei jedem Request neu validiert wird — Signierung fügt nichts hinzu (bestätigt ADR-007). Für `gated`-Kunden mit echtem Schutzbedarf liefert Entropie (lange Zufallstokens) + Rate-Limiting mehr als ein signiertes Cookie.

## Verworfene Alternativen

- **Status quo lassen (immer `gated`, Tokens im Code):** blockiert Website-Einbettung; Klartext-Tokens im öffentlichen Repo bleiben.
- **Separater Build/Fork pro Modus:** Wartungslast, Drift zwischen Varianten.
- **Zugang komplett entfernen (immer offen):** nimmt „echte Sperre"-Kunden die Option; widerspricht ADR-005.
- **Signiertes JWT-Cookie als Härtung:** Overkill, löst das eigentliche Problem (Token-Exposition, fehlende Drosselung) nicht — bereits in ADR-007 verworfen.
- **Echte Mandantenfähigkeit (ein Deployment, viele Schulen, Token-Pro-Tenant-Routing):** an Directus (ADR-003) gekoppelt, deutlich größerer Umfang; „ein Deployment pro Kunde" deckt den genannten Bedarf ab.

## Konsequenzen

- **Umsetzung (Middleware):** [`app/middleware.ts`](../../app/middleware.ts) liest `SN_ACCESS_MODE`; bei `open` früher `NextResponse.next()` für geschützte Routen. Bestehende `isPublicAssetPath`/Bypass-Logik bleibt.
- **Umsetzung (Tokens):** [`app/lib/access-tokens.ts`](../../app/lib/access-tokens.ts) lädt Liste aus `SN_ACCESS_TOKENS` (Prod) bzw. Hardcode-Fallback (Dev); `validateToken` unverändert. `scripts/qr-config.mjs` und ENV synchron halten (Rotation).
- **Umsetzung (CSP):** `frame-ancestors` aus `SN_EMBED_ANCESTORS` in `next.config.ts`-Headers oder Middleware.
- **Tests:** Middleware-Tests um beide Modi erweitern; ENV-Token-Laden mit Fail-closed-Fall abdecken. (Heutige Lücke laut SE-05: dünne Integrationstests des Token-Flows.)
- **Doku:** ADR-005/007 erhalten bei Annahme einen Status-Nachtrag („Durchsetzung konfigurierbar: ADR-021"); `anleitungen/fuer-entwickler.md` um die neuen ENV-Variablen ergänzen; DSGVO-Konzept prüfen, ob `open`-Modus + Einbettung eine eigene Einordnung braucht.
- **Folge-Härtung (optional, `gated`-Kunden mit echtem Schutzbedarf):** lange Zufallstokens + Rate-Limiting auf der Token-Validierung — separater Schritt (Agent-Stack `fsp-08`/`fsp-09`), nicht Teil dieses ADR.

### Festgelegte Sub-Entscheidungen (2026-06-15)

1. **Default-Hub-Modus in `open`:** `heft` (voller Hub, alle Stationen klickbar).
2. **Format `SN_ACCESS_TOKENS`:** JSON-Array `{ token, mode, expiresAt }`.
3. **Pilot (`schulnavigator.mpz.schule`):** bleibt `gated` (unverändert). `open` wird erst pro künftigem Einbettungs-Deployment aktiviert.
