---
tags:
  - post-mortem
  - audit-phase-5
  - compliance
erstellt: 2026-07-05
---

# Post-Mortem — Audit Phase 5 Umsetzung (2026-07-05)

Plan-Code-Abgleich nach Implementierung des [gehärteten Umsetzungsplans](../../../.cursor/plans/audit_phase_5_umsetzung_fe564923.plan.md) auf Basis des [Audits](../audit-phase-5-2026-07-04.md).

**Pre-Mortems:** [1a](../pre-mortem/pre-mortem-1a-audit-phase-5-umsetzung-2026-07-04.md), [1b](../pre-mortem/pre-mortem-1b-audit-phase-5-umsetzung-2026-07-04.md)

---

## 1. Commits und PRs

| Branch | PR | Wesentliche Commits |
|--------|-----|---------------------|
| `kunde/39-gs` | [#239](https://github.com/flxln/schulnavigator/pull/239) | `cd654d2` Media-Route Cookie-Gate |
| `kunde/39-gs` | — | `21a1dc2` Middleware-Gate (statische `public/media/`) |
| `kunde/39-gs` | [#241](https://github.com/flxln/schulnavigator/pull/241) | DSGVO/Legal; Hotfix `e68ad29` stations.json |
| `feature/mpz-studio` | [#240](https://github.com/flxln/schulnavigator/pull/240) | Compliance-Port main → feature |
| `main` | — | `0001b91` Audit Phase 5 (Middleware, dsgvo v1.0, Legal) |

**Prod-Verifikation (39-gs.mpz.schule):** `/media/*` ohne Cookie → HTTP 403, `Cache-Control: no-store`.

---

## 2. Plan-Todos

| ID | Inhalt | Befund |
|----|--------|--------|
| `p0-media-gate-prod` | Media-Gate auf Prod | **✅** Route + Middleware, deployt, verifiziert |
| `p0-media-gate-feature` | Media-Gate auf feature | **✅** PR #240 |
| `p0-avv-43` | #43 wieder öffnen, Anhang prüfen | **✅** Issue wieder offen; Unterschrift weiterhin ausstehend |
| `p1-dsb` | LaSuB in `dsb-contact.ts` | **✅** |
| `p1-dsgvo-v1` | dsgvo.md v1.0 + VVT, Branch-Sync | **✅** |
| `p1-232-rest` | V9-Tracking in `offen.md` | **✅** Support-Follow-up offen |
| `p1-branch-sync` | Compliance main ↔ kunde ↔ feature | **✅** |
| `p1-hsts` | HSTS | **✅** Proxy aktiv (2026-07-05), [#242](https://github.com/flxln/schulnavigator/issues/242) — [Post-Mortem](./post-mortem-242-2026-07-05.md) |
| `p1-schulfest` | Post-Mortem 26.06., Leitfaden #44, #45 | **✅** |
| `p2-backup-logs` | T5 + Log-Retention dokumentieren | **✅** Entscheidung/Umsetzung offen ([#243](https://github.com/flxln/schulnavigator/issues/243)) |
| `p2-book-creator` | Embed → Link | **✅** kunde + main |
| `p3-security-klein` | Studio-Cookie, Spec, npm audit | **✅** |
| `directus-gates` | Auth-Konzept, DSE, VVT | **✅** [directus-auth-konzept.md](../../spezifikationen/directus-auth-konzept.md) |

---

## 3. Härtungs-Entscheidungen (E1–E11)

| Nr. | Entscheidung | Umgesetzt |
|-----|--------------|-----------|
| E1 | Deploy: pull vor `deploy:content`; Auto-Deploy prüfen | **✅** Coolify manuell getriggert |
| E2 | feature-Sync vollständig in Phase 1.4 | **✅** |
| E3 | DSB nur in `dsb-contact.ts`; `impressum.ts` Inhalte-Verantwortliche | **✅** |
| E4 | Studio-Cookie `secure` protokollbasiert | **✅** |
| E5 | `branch-freeze-kunde.mdc` portieren | **✅** |
| E6 | #232-Tracking in `offen.md` | **✅** |
| E7 | Book Creator: `dsgvo.md` kanonisch, DSE im selben PR | **✅** |
| ² | 403 mit `Cache-Control: no-store` | **✅** Route + Middleware |
| ⁸ | Legal + Token-Konstanten nach feature | **✅** |

---

## 4. Scope-Abweichungen

### Middleware-Schutz `/media/*` (notwendig)

Next.js liefert Volume-Mounts unter `public/media/` als statische Dateien aus — die Route allein reichte in Prod nicht. Zusätzlich: Middleware + `next.config`-Cache-Header.

### `stations.json`-Regression auf kunde (behoben)

PR #241 hatte kurz die kleine `main`-Version eingespielt; Hotfix `e68ad29` stellte die vollständige kunde-Datei wieder her (Lesewelt `typ: link`).

### Studio-Redirects in `next.config.ts` (main)

Redirects `/mpz/studio/hub|brand|dialog-audio` kamen mit `0001b91` auf `main` mit — harmlos, aber außerhalb des Audit-Kernscopes (Studio ist auf main dev-only).

---

## 5. Bewusst offen

- AVV-Unterschrift ([#43](https://github.com/flxln/schulnavigator/issues/43))
- Volume-Backup T5 ([#243](https://github.com/flxln/schulnavigator/issues/243))
- #232 V9 / Mirror-Governance ([#244](https://github.com/flxln/schulnavigator/issues/244))
- Meeting #44 mit Schule ([#245](https://github.com/flxln/schulnavigator/issues/245))

---

## Fazit

Der gehärtete Plan ist umgesetzt. Der kritische P0-Befund (öffentliche Schüler-Medien) ist in Prod geschlossen. HSTS am Proxy ist seit 2026-07-05 live ([#242](https://github.com/flxln/schulnavigator/issues/242)). Organisatorische und Infrastruktur-Punkte sind dokumentiert und als Issues nachverfolgbar.
