# Kurz-Checkliste: Issue #254 — ADR Medien-Storage (Gate-kompatibel)

**Stufe:** LIGHT · **Prompt-Variante:** klassisch  
**Follow-up zu:** #251 (Spike Phase 6) · **Triage:** [triage-#254-adr-medien-storage.md](../triage/triage-%23254-adr-medien-storage.md) · 2026-11-03

## Ziel & Akzeptanzkriterien

- Neue ADR unter `dokumentation/adr/` mit **031** (`ls dokumentation/adr/`, höchste Nummer +1; Stand Triage: 030 auf `main`).
- ADR-031 entscheidet **E3-Option** (a/b/c), Status **„entschieden“**; verworfene Alternativen mit Kurzgrund (Spike S1-Befund für b).
- **Fünf E3-Kriterien** ([Epic E3](../epics/epic-directus.md#e3--medien-storage--254)) nur für die gewählte Option: Ja/Nein/Abweichung + Beleg (Spike Phase 6, ADR-027, Backup T5, AVV, `app/lib/mpz-upload-rules.ts`).
- **Scope-Frage Lehrkräfte-Upload** im ADR geklärt (MPZ-only vs. Directus-Upload) und an die Option gekoppelt.
- Zeile in [`dokumentation/entscheidungen.md`](../../entscheidungen.md); Folgen für **#255**, **#259** (und ggf. Backup/AVV) benannt, ohne deren Umsetzung.
- Kein App-Code geändert.

## Ausführungs-Checkliste

1. **01b Pre-Mortem** (GLM/Cline): Spec gegen ADR-027, 029, 030, Cookie-Gate S1, Option-b-Schutzschicht, Backup T5.
2. **02 Plan härten** (Opus): diese Datei präzisieren (Entscheidungstabelle, Kriterien-Belege).
3. **Vorlage:** `dokumentation/adr/000-template.md` → `031-medien-storage-directus-gate.md` (Slug an Entscheidung anpassen).
4. **ADR-Inhalt:** Kontext (Ist: Volumes + gated `/media/*`, Spike #251); Entscheidung + verworfene Alternativen; E3-Kriterien-Tabelle; Konsequenzen für Deploy (#255), Pilot (#259), Backup/AVV; Bezug ADR-029/030 ohne Widerspruch.
5. **`entscheidungen.md`:** Tabellenzeile ADR-031, Status „entschieden“, Datum.
6. **03 Implementieren** (Composer): nur Doku; Verifikation unten.
7. **04 Post-Mortem** kompakt · **05a Abschließen:** Issue-Datei, `offen.md`, GitHub-Body-Sync.

## Verifikation

- Genau eine neue ADR `031-*.md`; Nummer = höchste vorherige +1.
- `rg "Medien-Storage|031-" dokumentation/entscheidungen.md` → Link stimmt mit Dateiname.
- ADR: Status „entschieden“; Kriterien-Tabelle fünf Zeilen; S1/Cookie und ADR-027 explizit; Scope Lehrkräfte-Upload beantwortet.
- `git diff --name-status main` nur unter `dokumentation/`; `cd app && npm run build` grün.

## Referenzen

- [#254](https://github.com/flxln/schulnavigator/issues/254) · Epic E3 · [spike-directus-2026-07.md](../../reviews/spike-directus-2026-07.md#phase-6--e3-medien-gate-befund)
- [ADR-027](../../adr/027-schuelermedien-nicht-in-git.md) · [ADR-029](../../adr/029-runtime-datenpfad-directus.md) · [ADR-030](../../adr/030-migrationsstrategie-content-freeze.md)
- Vorlage Issue/Checkliste: [#252](../issues/issue-252-d04-adr-runtime.md)

## Nicht in Scope

- Directus-Deploy (#255), Pilot (#259), Proxy/Signierung implementieren, Object-Storage-Anbindung, neuer Spike, Auth-Konzept ändern.

## Offene Punkte

- Scope Lehrkräfte-Upload: im ADR entscheiden (Epic markiert bei Option a); wenn unentscheidbar nach Schritt 0 → G1, Triage neu.
