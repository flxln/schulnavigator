# Epic: Zugangsmodus konfigurierbar (ADR-021)

**Milestone:** Phase 5 — Post-Fest  
**Status:** umgesetzt — [PR #140](https://github.com/flxln/schulnavigator/pull/140) offen; Dev-Deploy mit `SN_ACCESS_TOKENS` verifiziert  
**Branch:** `feat/adr-021-zugangsmodus`  
**Folge zu:** #23 (ADR-007), #57/#82 (ADR-008) — erweitert Zugangskontrolle um konfigurierbare Durchsetzung

**Quellen:**

- [ADR-021](../../adr/021-zugangsmodus-konfigurierbar.md) (ergänzt [ADR-005](../../adr/005-zugangskontrolle-token.md), [ADR-007](../../adr/007-zugangskontrolle-cookie.md))
- Umsetzungsplan: [`.cursor/plans/adr-021_zugangsmodus_c30df8a5.plan.md`](../../.cursor/plans/adr-021_zugangsmodus_c30df8a5.plan.md)

---

## Übersicht

| Rolle | Nr. | Titel (kurz) | Labels | Blockiert durch |
|-------|-----|--------------|--------|-----------------|
| **Epic (Parent)** | `#132` | Zugangsmodus konfigurierbar: open/gated, Tokens ENV, Embedding (ADR-021) | `tech` | — |
| Unterissue | `#133` | access-config + access-tokens: ENV-Laden, Single-Source Dev-Tokens | `tech` | — |
| Unterissue | `#134` | Middleware + Dialog-API: SN_ACCESS_MODE open/gated | `tech` | #133 |
| Unterissue | `#135` | CSP frame-ancestors (SN_EMBED_ANCESTORS) | `tech` | — |
| Unterissue | `#136` | Build-/Runtime-Validierung + Docker-Entrypoint | `tech` | #133 |
| Unterissue | `#137` | Token-Rotation + QR-Sync + .env.example | `tech` | #133 |
| Unterissue | `#138` | Tests ADR-021 (Middleware, ENV, CSP) | `tech` | #133, #134, #135 |
| Unterissue | `#139` | Entwickler-Doku: ENV, Deploy-Checkliste, DSGVO-Hinweis | `tech` | #136, #137 |

**Empfohlene Reihenfolge:** `#133` → `#134` + `#135` (parallel möglich) → `#136` + `#137` → `#138` → `#139`.

## GitHub-Links

| Issue | URL |
|-------|-----|
| #132 (Epic) | https://github.com/flxln/schulnavigator/issues/132 |
| #133 | https://github.com/flxln/schulnavigator/issues/133 |
| #134 | https://github.com/flxln/schulnavigator/issues/134 |
| #135 | https://github.com/flxln/schulnavigator/issues/135 |
| #136 | https://github.com/flxln/schulnavigator/issues/136 |
| #137 | https://github.com/flxln/schulnavigator/issues/137 |
| #138 | https://github.com/flxln/schulnavigator/issues/138 |
| #139 | https://github.com/flxln/schulnavigator/issues/139 |

---

## Epic `#132` — Zugangsmodus konfigurierbar (ADR-021)

**Labels:** `tech`  
**Assignee:** Felix  
**Milestone:** Phase 5 — Post-Fest

### Ziel

Eine App, zwei Betriebsmodi pro Deployment (Coolify):

1. **`gated` (Default):** Heutiger Flow — Entry-Token → HttpOnly-Cookie → Middleware; ohne Zugang Redirect `/eintritt`.
2. **`open`:** Middleware-Gate ist No-op; alle App-Routen ohne Token; Hub ohne Cookie = Modus `heft`.
3. **Tokens aus ENV** in Production (`SN_ACCESS_TOKENS`); Klartext nur noch Dev-Fallback; Fail-closed bei `gated` ohne gültige ENV.
4. **Website-Einbettung:** CSP `frame-ancestors` aus `SN_EMBED_ANCESTORS` (Opt-in; Default kein Framing).

Pilot `schulnavigator.mpz.schule` bleibt `gated` — nur `SN_ACCESS_TOKENS` ergänzen, kein `open`.

### Unterissues

- [x] `#133` — access-config + access-tokens — [PR #140](https://github.com/flxln/schulnavigator/pull/140)
- [x] `#134` — Middleware + Dialog-API
- [x] `#135` — CSP frame-ancestors
- [x] `#136` — Build-/Runtime-Validierung + Docker-Entrypoint
- [x] `#137` — Token-Rotation + QR-Sync
- [x] `#138` — Tests
- [x] `#139` — Entwickler-Doku

### Nicht im Scope

- Rate-Limiting / lange Zufallstokens als Härtung (`fsp-09`) — separater Schritt
- JWT/signiertes Cookie (ADR-007 verworfen)
- Mandantenfähigkeit in einem Deployment (Directus-Pfad)
- robots/noindex-Relaxierung für `open`
- DSGVO-Freigabe für Embedding (Prüfhinweis in #139)

### Epic erledigt wenn

- [x] Alle Unterissues geschlossen
- [x] `npm run test` + `npm run build` grün
- [x] Coolify Dev: `SN_ACCESS_TOKENS` gesetzt, Deploy verifiziert
- [x] Coolify Prod: `SN_ACCESS_TOKENS` gesetzt
- [x] Entry-QR-Manifeste mit rotierten Tokens (`manifest.json`, `manifest-schulfest.json`)
- [x] ADR-021 in `entscheidungen.md` verlinkt; `fuer-entwickler.md` aktualisiert

### Folge-Issue

- [x] **#141** — CLI `rotate:access-tokens` — [PR #142](https://github.com/flxln/schulnavigator/pull/142) → `main`

---

## `#133` — access-config + access-tokens: ENV-Laden, Single-Source Dev-Tokens

**Parent:** #132  
**Labels:** `tech`  
**Assignee:** Felix

### Ziel

Neues Modul `access-config.ts` (`getAccessMode`, `isAccessGated`). `access-tokens.ts` lädt Production aus `SN_ACCESS_TOKENS` (JSON `{ token, mode, expiresAt }`), Dev aus benannten Konstanten (`FEST_DEV_TOKEN`/`HEFT_DEV_TOKEN`) als einzige Token-Quelle im Repo.

### Akzeptanzkriterien

- [ ] `SN_ACCESS_MODE`: `gated` | `open`, Default `gated`, unbekannt → `gated`
- [ ] `getAccessTokens()` / `validateToken()` nutzen dynamische Liste
- [ ] `qr-config.mjs` und `dev-unlock.ts` importieren Dev-Konstanten — keine Magic Strings `fest-2026`/`heft-2026-27`
- [ ] Unit-Tests: Parser + Dev-Fallback + ENV-Parsing

**Plan:** Schritt 1 in [adr-021_zugangsmodus-Plan](../../.cursor/plans/adr-021_zugangsmodus_c30df8a5.plan.md#1-access-config--token-refactoring)

---

## `#134` — Middleware + Dialog-API: SN_ACCESS_MODE open/gated

**Parent:** #132  
**Labels:** `tech`  
**Assignee:** Felix  
**Blockiert durch:** #133

### Ziel

`middleware.ts`: bei `open` kein Zwang-Redirect; `?t=` wird **vor** Open-Early-Exit verarbeitet (fest-Cookie auch in `open`). Dialog-Route: Gate nur bei `isAccessGated()`.

### Akzeptanzkriterien

- [ ] `gated`: Verhalten identisch zu heute
- [ ] `open`: `/`, `/raum/*`, `/stationen` ohne Cookie → 200
- [ ] `open` + gültiges `?t=fest-…`: Cookie gesetzt, URL bereinigt
- [ ] `open` + Dialog-API: 200 ohne Cookie (Datei vorhanden)
- [ ] Middleware-Tests für beide Modi

**Plan:** Schritte 2–3

---

## `#135` — CSP frame-ancestors (SN_EMBED_ANCESTORS)

**Parent:** #132  
**Labels:** `tech`  
**Assignee:** Felix

### Ziel

`frame-ancestors.ts` analog `embed-allowlist.ts`; `next.config.ts` kombiniert `frame-src` + `frame-ancestors`. Strenge Origin-Validierung (`https://<host>` only). Kein `X-Frame-Options` in Next-Config.

### Akzeptanzkriterien

- [ ] Default: `frame-ancestors 'none'`
- [ ] `SN_EMBED_ANCESTORS=https://schule.example.de` → korrekter CSP-Header
- [ ] Ungültige Origins → Build-Fehler (nicht still verwerfen)
- [ ] Tests `frame-ancestors.test.ts`, `next.config.test.ts`

**Plan:** Schritt 4

---

## `#136` — Build-/Runtime-Validierung + Docker-Entrypoint

**Parent:** #132  
**Labels:** `tech`  
**Assignee:** Felix  
**Blockiert durch:** #133

### Ziel

Zwei Stufen (Pre-Mortem #1): Build prüft nur JSON-**Format** wenn ENV gesetzt; Runtime-Entrypoint prüft Existenz/Fail-closed + ENV↔`ENTRY_QRS`-Sync (#5).

### Akzeptanzkriterien

- [ ] `validate-access-config.mjs` in `build`-Kette — kein `exit(1)` bei fehlendem Secret im Builder
- [ ] Docker `CMD`/Entrypoint: Runtime-Check vor `node server.js`
- [ ] `gated` + Production ohne `SN_ACCESS_TOKENS` → Container startet nicht (klare Meldung)

**Plan:** Schritt 5

---

## `#137` — Token-Rotation + QR-Sync + .env.example

**Parent:** #132  
**Labels:** `tech`  
**Assignee:** Felix  
**Blockiert durch:** #133

### Ziel

Neue rotierte Tokens (alte `fest-2026`/`heft-2026-27` verbrannt). `npm run generate:qr`, Entry-QRs/PDFs aktualisieren. `.env.example` mit `SN_ACCESS_MODE`, `SN_ACCESS_TOKENS`, `SN_EMBED_ANCESTORS`.

### Akzeptanzkriterien

- [ ] Keine exponierten Klartext-Tokens mehr im öffentlichen Repo
- [ ] `ENTRY_QRS` synchron zu Dev-Konstanten; Runtime-Sync-Check in #136
- [ ] Ops-Notiz: Coolify Prod/Dev **vor** Deploy `SN_ACCESS_TOKENS` setzen

**Plan:** Schritt 6

---

## `#138` — Tests ADR-021 (Middleware, ENV, CSP)

**Parent:** #132  
**Labels:** `tech`  
**Assignee:** Felix  
**Blockiert durch:** #133, #134, #135

### Ziel

Vollständige Vitest-Abdeckung laut Plan: access-config, access-tokens ENV, middleware open/gated inkl. `?t=` in open, frame-ancestors, next.config CSP.

### Akzeptanzkriterien

- [ ] Alle Tests über benannte Token-Konstanten (keine Magic Strings)
- [ ] `npm run test` grün

**Plan:** Abschnitt Tests

---

## `#139` — Entwickler-Doku: ENV, Deploy-Checkliste, DSGVO-Hinweis

**Parent:** #132  
**Labels:** `tech`  
**Assignee:** Felix  
**Blockiert durch:** #136, #137

### Ziel

`anleitungen/fuer-entwickler.md`: neue ENV-Variablen, Smoke-Tests gated/open, Coolify Token-Rotation, `curl -I` für frame-ancestors. Kurzer DSGVO-Prüfhinweis in `dsgvo.md`.

### Akzeptanzkriterien

- [ ] Deploy-Checkliste aus Plan übernommen
- [ ] Smoke-Tests mit neuen Token-Werten dokumentiert
- [ ] `entscheidungen.md`-Index geprüft

**Plan:** Schritt 7
