# Offene Punkte — Schulnavigator

**Stand:** 2026-11-03 · Führend für neue Arbeit: [GitHub Issues](https://github.com/flxln/schulnavigator/issues). Diese Datei ist die schlanke Repo-Übersicht.

**Letzter Abgleich:** 2026-11-03 — [ADR-032](../adr/032-mpz-studio-produktions-admin.md) ([#271](https://github.com/flxln/schulnavigator/issues/271), PR [#272](https://github.com/flxln/schulnavigator/pull/272)): Directus nicht mehr Zielbild, MPZ Studio bekommt Produktionsmodus; Epic [#273](https://github.com/flxln/schulnavigator/issues/273); #47, #255, #259, #260, #262, #263 überholt. — Directus-Halt: kein Directus an der 39. GS, [#255](https://github.com/flxln/schulnavigator/issues/255) wartet auf den neuen IONOS-Server (Deploy dort noch offen). — [#254](https://github.com/flxln/schulnavigator/issues/254) ADR-031 (Medien-Storage, Variante b-Proxy) umgesetzt, Abschluss per PR; Post-Mortem ✅. — [#253](https://github.com/flxln/schulnavigator/issues/253) ADR-030 (Migrationsstrategie + Content-Freeze) in PR; Post-Mortem ✅. — 2026-11-02 — [#252](https://github.com/flxln/schulnavigator/issues/252) ADR-029 (Runtime-Datenpfad, Option b) umgesetzt, Abschluss per PR; Post-Mortem ✅. — 2026-07-06 — [#250](https://github.com/flxln/schulnavigator/issues/250) Gates 4–6 formal abgeschlossen (Auth-Konzept „beschlossen", Gate-Tabelle widerspruchsfrei, Trigger für Gate 4/6 benannt, AVV-Negativbefund → Blocker [#263](https://github.com/flxln/schulnavigator/issues/263) vor #261); Post-Mortem ✅. — AVV [#43](https://github.com/flxln/schulnavigator/issues/43) unterschrieben (25.06.2026, Anhang ADR-027); Backup T5 [#243](https://github.com/flxln/schulnavigator/issues/243) inkl. Follow-ups [#246](https://github.com/flxln/schulnavigator/issues/246)–[#248](https://github.com/flxln/schulnavigator/issues/248) abgeschlossen.

Historischer Phasenplan: [archiv/projektplan.md](../archiv/projektplan.md) (eingefroren). Abgeschlossene Epics: [archiv/epics/](./archiv/epics/).

---

## Audit Phase 5 (2026-07-05)

| Thema | Status | Issue / Doku |
|-------|--------|--------------|
| Media-Gate Prod | **live** (403 + no-store) | [#238](https://github.com/flxln/schulnavigator/issues/238) erledigt — PR #239, #241, Post-Mortem |
| AVV #43 | **erledigt** (25.06.2026) | Unterschrift MPZ-Hefter; Anhang ADR-027 enthalten — [#43](https://github.com/flxln/schulnavigator/issues/43) |
| DSB LaSuB | In App/DSE | `dsb-contact.ts` |
| #232 V9 | **offen** — 7 SHAs via `refs/pull/*` | GitHub-Support Ticket **#4510440** (Follow-up 25.06. unbeantwortet); Detail: [08-github-support-ticket-232.md](./schuelermedien-deploy-trennung/08-github-support-ticket-232.md) |
| Mirror Pre-Rewrite | **Entscheidung ausstehend** | `/tmp/schulnavigator-pre-232-mirror.git` auf MPZ-Rechner — nach Support-Bestätigung löschen oder verschlüsselt archivieren mit Löschdatum |
| HSTS Proxy | **erledigt** (2026-07-05) | [#242](https://github.com/flxln/schulnavigator/issues/242) |
| Volume-Backup T5 | **erledigt** (2026-07-05) | [#243](https://github.com/flxln/schulnavigator/issues/243); Follow-ups [#246](https://github.com/flxln/schulnavigator/issues/246) Cron, [#247](https://github.com/flxln/schulnavigator/issues/247) Snapshots, [#248](https://github.com/flxln/schulnavigator/issues/248) Headscale — alle **erledigt** (2026-07-06) |
| Log-Retention | Ziel ≤ 14 Tage | Server-Admin bestätigen; [dsgvo.md](../dsgvo.md) |

---

## Technik (MPZ / Viewer)

*(Schüler-Medien Deploy-Trennung Epic #226 abgeschlossen 2026-06-24 — [ADR-027](../adr/027-schuelermedien-nicht-in-git.md))*

**ADR-026-Restthema:** Eingebettete Dialog-Bubble zeigt für Text-only-Segmente noch kein „Weiter" — Viewer-Cutscene (`DialogPlayer`) ist abgedeckt; Follow-up optional.

## GitHub — noch offen

| Issue | Thema | Hinweis |
|-------|--------|---------|
| Epic [#205](https://github.com/flxln/schulnavigator/issues/205) | MPZ Studio v3 Visual Polish | **eingefroren** (2026-07-04) |
| [#17](https://github.com/flxln/schulnavigator/issues/17) | Raumbilder liefern (extern) | 8/11; fehlen: `kunst`, `hort`, `schulsozialarbeit` |
| Epic [#86](https://github.com/flxln/schulnavigator/issues/86) | Schulfest GS39 Nachtrag | Post-Mortem 26.06. nachgezogen; #44-Meeting offen |
| [#89](https://github.com/flxln/schulnavigator/issues/89) | Sonnentest QR-Druck | Feldtest ausstehend |
| [#44](https://github.com/flxln/schulnavigator/issues/44) | Auswertung mit Schule | Leitfaden: [2026-06-meeting-44-leitfaden.md](../archiv/projektmanagement/2026-06-meeting-44-leitfaden.md) |
| [#221](https://github.com/flxln/schulnavigator/issues/221) | Dialog: Text-only-Segmente | Milestone Phase 5 |
| [#48](https://github.com/flxln/schulnavigator/issues/48) | i18n + Englisch-Menü | Milestone Phase 5 |
| [#273](https://github.com/flxln/schulnavigator/issues/273) | MPZ Studio Produktionsmodus (Epic, ADR-032) | [issue-273](./issues/issue-273-epic-studio-produktionsmodus.md) · Stufe 1 (MPZ live): [#256](https://github.com/flxln/schulnavigator/issues/256) Save-Pfad, [#257](https://github.com/flxln/schulnavigator/issues/257) Lesepfad, [#258](https://github.com/flxln/schulnavigator/issues/258) Backup · Stufe 2 (Lehrkräfte): [#249](https://github.com/flxln/schulnavigator/issues/249), [#261](https://github.com/flxln/schulnavigator/issues/261) · ersetzt Directus-Epic [#47](https://github.com/flxln/schulnavigator/issues/47) |

## Content / MPZ

- [x] **Post-Fest GS39:** Heft-Hub per Fest-Entry-QR — [Playbook §8](../../anleitungen/schulfest-gs39-playbook.md)
- [x] **#264:** `main` enthält den GS39-Content. Schule deployt von `release/39-gs` ([ADR-028](../adr/028-main-und-release-39-gs.md)). `kunde/39-gs` ist veraltet und bleibt, bis der Release in Coolify bestätigt ist. Legacy `schulnavigator.mpz.schule`: Auto-Deploy aus, kein Redeploy (keine Medien-Volumes).
- Coach-Texte final mit MPZ abstimmen (`app/content/coach-messages.json`)

## Technische Fragen (ohne ADR)

Siehe [technische-fragen.md](../technische-fragen.md) — u. a. YouTube-Recht, H5P/DSB, Directus-Rollen.