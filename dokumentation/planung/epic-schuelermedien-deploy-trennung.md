# Epic: Schüler-Medien Deploy-Trennung (ADR-027)

**Milestone:** [Schüler-Medien Deploy-Trennung](https://github.com/flxln/schulnavigator/milestone/14) (GitHub #14)  
**Status:** offen (2026-06-24)  
**GitHub Epic:** [#226](https://github.com/flxln/schulnavigator/issues/226)

**Planung:** [schuelermedien-deploy-trennung/](./schuelermedien-deploy-trennung/README.md)

---

## Ziel

**Code und Konfiguration über GitHub + Coolify; Schüler-Medien nur vom MPZ-Rechner direkt auf den Hetzner-Server** — möglichst in einem automatisierten Deploy-Schritt (Zwei-Bahnen-Modell).

Auslöser: MPZ Studio schreibt Medien lokal ins Repo; `git push` legt Kinder-Inhalte auf GitHub — datenschutzrechtlich nicht akzeptabel.

---

## Übersicht Unterissues

| Rolle | Nr. | Titel | Labels | Blockiert durch |
|-------|-----|-------|--------|-----------------|
| **Epic (Parent)** | `#226` | Schüler-Medien Deploy-Trennung (ADR-027) | `tech` | — |
| Unterissue | `#227` | Phase 0: Abstimmung DSB/Schule & Sofortmaßnahmen | `org`, `extern` | — |
| Unterissue | `#228` | Phase 1: Repo & Ignore — Schüler-Medien aus Git | `tech`, `blocker` | #227 |
| Unterissue | `#229` | Phase 2: Server, Coolify-Volumes & Structure-Validatoren | `tech` | #228 |
| Unterissue | `#230` | Phase 3: Deploy-Automatisierung (rsync + MPZ Studio) | `tech` | #229 |
| Unterissue | `#231` | Phase 4: Doku & Compliance (ADR-027, DSGVO) | `documentation`, `tech` | #230 |
| Separates Vorhaben | `#232` | Git-History: Schüler-Medien aus LFS/GitHub entfernen | `org`, `extern`, `tech` | #227 (Inventar) |

**Empfohlene Reihenfolge:** #227 → #228 → #229 → #230 → #231; parallel/später #232

---

## Phasen (Kurz)

### Phase 0 — Sofortmaßnahmen (ohne Code)

DSB/Schule: Freigabe, Inventar Git/LFS, Entscheidung `stations.json`. Keine neuen Schüler-Medien pushen bis Phase 2 live.

### Phase 1 — Repo & Ignore

`git rm --cached`, `.gitignore`, `.gitkeep`, Icon-Umzug nach `public/stations-icons/`, LFS bereinigen, Anleitungen.

### Phase 2 — Server & Coolify

Persistent Volumes, Mounts, Initial-rsync, `:structure`-Validatoren im Build.

### Phase 3 — Deploy-Automatisierung

`deploy-content.sh`, Env-Vorlage, MPZ Studio Deploy-Tab, Entwickler-Checkliste.

### Phase 4 — Doku & Compliance

ADR-027 entscheiden, `dsgvo.md`, AVV-Anhang, Epic abschließen.

---

## GitHub-Links

| Issue | URL |
|-------|-----|
| #226 | https://github.com/flxln/schulnavigator/issues/226 |
| #227 | https://github.com/flxln/schulnavigator/issues/227 |
| #228 | https://github.com/flxln/schulnavigator/issues/228 |
| #229 | https://github.com/flxln/schulnavigator/issues/229 |
| #230 | https://github.com/flxln/schulnavigator/issues/230 |
| #231 | https://github.com/flxln/schulnavigator/issues/231 |
| #232 | https://github.com/flxln/schulnavigator/issues/232 |

## Kontext

- ADR: [027-schuelermedien-nicht-in-git.md](../adr/027-schuelermedien-nicht-in-git.md) (offen)
- Pre-Mortem: [pre-mortem-1a](../reviews/pre-mortem/pre-mortem-1a-schuelermedien-deploy-trennung.md), [pre-mortem-1b-repo-ignore](../reviews/pre-mortem/pre-mortem-1b-repo-ignore.md)

## Checkliste (Epic)

- [x] Phase 0: DSB-Freigabe (#227) — 2026-06-24
- [x] Phase 1: Schüler-Medien aus Git-Index (#228) — 2026-06-24
- [ ] Phase 2: Coolify-Volumes + Structure-Build (#229) — Code + Server-Ops ✅ 2026-06-24; Prod-Smoke offen
- [ ] Phase 3: Deploy-Skript + Studio-Tab (#230)
- [ ] Phase 4: ADR-027 + DSGVO-Doku (#231)
- [ ] Optional: Git-History bereinigen (#232)
