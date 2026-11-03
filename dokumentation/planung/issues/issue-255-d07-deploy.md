---
title: "Directus-Deploy Demo (Proxmox-VM, nicht 39. GS)"
github_number: 255
github_url: "https://github.com/flxln/schulnavigator/issues/255"
status: in_arbeit
parent: "#47"
depends_on:
  - "#251"
  - "#252"
  - "#253"
  - "#254"
plan: "../../.cursor/plans/issue_255_directus-siliconsound_c4622b8a.plan.md"
---

# Directus-Deploy Demo (Proxmox-VM, nicht 39. GS)

## Ziel

Directus 11 mit Postgres als Docker-Compose-Stack in einer **VM auf dem Proxmox-Homelab** betreiben, öffentlich als `https://directus.mpz.schule` über einen Reverse-SSH-Tunnel und Traefik auf dem MPZ-VPS (Muster ScratchCraft): TLS, HSTS, Auth-Härtung (Admin 2FA, Session 8 h), dedizierter Service-User, ADR-031-Deploy-Regeln (kein Public-Read auf Assets, Upload-Limits). **Nur synthetische Demo-Daten**, keine Schul- oder Lehrkräfte-Accounts, keine Stations-Collections (folgen in #256). **`39-gs.mpz.schule`** bleibt JSON/`release/39-gs`. Konsument für spätere Demo: **`schulnavigator.mpz.schule`** (ADR-032). Kein App-Code in diesem Issue.

## Akzeptanzkriterien

- [ ] Directus + Postgres in der Proxmox-VM deployed; `GET https://directus.mpz.schule/server/health` 200, TLS, HSTS
- [ ] ADR-032 + Eintrag `entscheidungen.md`; ADR-028 Punkt 4 ersetzt; Auth-Konzept-Nachtrag Service-User
- [ ] Keine Public-Policy auf `directus_files`; anonym `/assets/*` → 403; Postgres, Directus-, Tunnel- und Edge-Port von außen nicht erreichbar
- [ ] Admin 2FA Pflicht, Session ≤ 8 h; Rollen Redaktion/Admin; keine Lehrkräfte-User
- [ ] API-Only-Service-User (read); Token nicht im Repo
- [ ] VVT Lehrkräfte-Accounts in `dsgvo.md` konkretisiert (Demo-Speicherort Proxmox-VM)
- [ ] Spike-Reste auf MPZ-VPS (`directus-spike-251`, `app-spike`) in Coolify gelöscht
- [ ] Betrieb in `anleitungen/fuer-entwickler.md` dokumentiert (VM, Tunnel, Route, Volumes, Env, Recovery)
- [ ] Verifikation B=2: Erfolgs- und Recovery-Fälle aus Plan; `app/` test/lint/build grün

## Kontext

- Epic-Parent: #47
- Spezifikation: `dokumentation/planung/epics/epic-directus.md`
- Gates: `dokumentation/spezifikationen/directus-auth-konzept.md`
- Council: `dokumentation/reviews/council-directus-planung-2026-07-06.md`
- Unknowns: `dokumentation/reviews/unknowns/unknowns-#255-directus-cube-2026-11-03.md`
- Triage: `dokumentation/planung/triage/triage-#255-directus-deploy-ionos.md` (VOLL, 4/8, Host Proxmox-VM)
- Blockiert durch: #251–#254 (entschieden)
- Blockiert: #256, #257, #258, #260

**Freigabe (Felix, 3. November 2026):** Prod-39-GS ohne Directus. Demo-Host Proxmox-VM mit Tunnel über den MPZ-VPS und synthetischen Daten ist #255-Scope (Unknowns 0b; SiliconSound verworfen wegen RAM). Domain `directus.mpz.schule`, Wildcard-DNS reicht. Cube-Umzug später, eigenes Ticket. Vor Deploy: Proxmox läuft, `free -h` auf dem Host.
