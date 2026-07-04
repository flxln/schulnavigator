---
tags:
  - post-mortem
  - feature-port
  - runtime
  - compliance
erstellt: 2026-07-04
---

# Post-Mortem — Runtime- und Compliance-Port nach main (2026-07-04)

**Plan:** `.cursor/plans/runtime-port_nach_main_gehaertet.plan.md` (gehärtet nach Pre-Mortem 1a/1b)

Pfadbasierter Selektiv-Port von `feature/mpz-studio` und `kunde/39-gs` nach `main` — ohne MPZ Studio v3, ohne Branch-Merge.

---

## 1. Umfang

| Block | Inhalt |
|-------|--------|
| Dialog ADR-026 | `quelle?`, Viewer-Cutscene „Weiter", Structure-Validatoren |
| GS39-UI | MPZ-Banner, Scan-CTA, Audio-Autoplay-Unlock |
| Media S1 | `/media/*` Cookie-Gate 403, `Cache-Control: private, max-age=3600` |
| Legal | Impressum, Datenschutz, Footer, Middleware `LEGAL_PUBLIC` |
| Zugang | `access-token-constants.mjs`, `applyEntryQrHubModes` |
| Doku | ADR-026, ADR-027, `dsgvo.md`, `offen.md` (#205 eingefroren) |

**Bewusst nicht:** MPZ Studio v3 UI, Deploy-Studio-Tab, Schüler-Medien in Git, eingebettetes Text-only-„Weiter" (ADR-026-Restthema).

---

## 2. Abweichungen vom Plan

| Thema | Befund |
|-------|--------|
| Studio-Dialog-Libs | `types.ts` (`quelle?`) erforderte minimale Anpassung in `mpz-dialog-audio-ingest`, `-sync`, `mpz-station-dialog`, `dialog-audio-status-badges` — sonst TypeScript-Build rot |
| Test-Fixture | `studio-demo-klassenzimmer.ts` mitportiert (Abhängigkeit von `validate-station-assets-structure.test.ts`) |
| `main` lokal | `git branch -f main origin/main` statt `pull` (Post-#232-Rewrite, kein gemeinsamer Vorfahr) |

---

## 3. Verifikation

- `cd app && npm run test` — 1003/1003 grün
- `cd app && npm run build` — grün (Structure-Validatoren)
- `/impressum`, `/datenschutz` in Middleware-Tests ohne Cookie
- Media-Route: 403 ohne Cookie, 200 mit Token, `private` Cache

---

## 4. Branch-Stand

| Branch | Status |
|--------|--------|
| `port/runtime-compliance-to-main` | PR → `main` |
| `kunde/39-gs` | unverändert |
| `feature/mpz-studio` | unverändert |

---

## Fazit

Port plankonform mit dokumentierten Minimal-Abweichungen für ADR-026-Typkompatibilität im bestehenden Studio-v2-Code. `main` ist Integrationsbranch für Besucher-App und Compliance; Prod bleibt `kunde/39-gs`.
