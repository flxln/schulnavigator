# Kurz-Checkliste: Issue #253 — ADR Migrationsstrategie JSON ↔ Directus + Content-Freeze

**Stufe:** LIGHT · **Prompt-Variante:** klassisch  
**Follow-up zu:** #251 (Spike), #252 (ADR-029 Runtime-Datenpfad)  
**Triage:** [triage-#253-adr-migrationsstrategie.md](../triage/triage-%23253-adr-migrationsstrategie.md) · 2026-11-02  
**Verifikationsprofil:** Standard (B=1)

## Ziel & Akzeptanzkriterien

- Neue ADR unter `dokumentation/adr/` mit **nächster freier Nummer** (beim Anlegen `ls dokumentation/adr/`; Stand 2026-11-02: **030**, #254 kann auf 031+ rutschen).
- ADR beantwortet die vier E2-Fragen aus [epic-directus.md](../epics/epic-directus.md#e2--migrationsstrategie-json--directus-content-freeze--253): Source-of-Truth-Wechsel (global vs. pro Raum), Content-Freeze (ja/nein/wann/Dauer), MPZ Studio (Dual-Write-Verbot, optional Rück-Export), kanonische Slugs (QR-fixiert).
- Freeze-Regeln sind so konkret, dass #259 sie ohne Interpretation anwenden kann (Zeitfenster, betroffene Slugs, wer committet noch JSON).
- Konsistenz mit [ADR-029](../../adr/029-runtime-datenpfad-directus.md) (Directus als SoT, c-Re-Trigger/Git-Satz), [ADR-028](../../adr/028-main-und-release-39-gs.md) (`main` / `release/39-gs`), [ADR-022](../../adr/022-mpz-studio-internes-ingest-tool.md) (Studio-Rolle nach Migration).
- Eintrag in [`dokumentation/entscheidungen.md`](../../entscheidungen.md); Folgen für #255, #259, #262 benannt, ohne deren Umsetzung.
- Kein App-Code geändert.

## Ausführungs-Checkliste

1. **01b Pre-Mortem** (GLM 5.3 / ‡ Cline, high): Spec-Risiko Freeze, Dual-Write, Slug-Invariante, Konflikt ADR-022/029; Funde in `dokumentation/reviews/pre-mortem/`.
2. **02 Plan härten** (Opus 5.5 / ◆): diese Datei ergänzen (Entscheidungstabelle, Verifikation); kein `.cursor/plans/`.
3. **Issue-Datei:** Frontmatter (`depends_on`), Ziel, Akzeptanzkriterien, Link auf diese Checkliste (Vorlage [#252](../issues/issue-252-d04-adr-runtime.md)).
4. **ADR anlegen:** Template `000-template.md` → `NNN-*-migration-freeze*.md`; Kontext Ist-Stand (#264: Content auf `main`, Deploy `release/39-gs`, Studio schreibt dev-JSON).
5. **ADR-Inhalt:** Entscheidung + verworfene Alternativen; Freeze als explizite Regeln (Council-Lücke schließen); Studio: eine Wahrheit pro Slug/Zeitraum; Slugs: Verweis [verzeichnisstruktur.md](../../content/verzeichnisstruktur.md), Erzwingung über Directus/Prozess (#256 folgt technisch).
6. **`entscheidungen.md`:** Tabellenzeile Status „entschieden“, Datum, Link.
7. **03 Implementieren** (Composer / ⌘): nur Doku; danach Verifikation unten.
8. **04 Post-Mortem** kompakt · **05a Abschließen** (Issue, `offen.md`, GitHub-Body, Draft-PR).

## Verifikation

- `ls dokumentation/adr/` → genau eine neue Migrations-/Freeze-ADR; Nummer = höchste vorherige +1.
- `rg -i "freeze|migration|slug|studio" dokumentation/adr/NNN-*.md` trifft alle vier E2-Themen; Verweis auf ADR-029 SoT-Satz.
- `rg "Migrationsstrategie\|Content-Freeze" dokumentation/entscheidungen.md` → Link stimmt mit Dateiname.
- ADR nennt #259 (Pilot), #262 (Studio-Abgrenzung), #255 nur soweit Deploy/Git-Freeze betrifft.
- `git diff --name-status main` → nur `dokumentation/` (Pipeline-Artefakte ausgenommen prüfen).
- `cd app && npm run build` grün (kein Code-Diff erwartet).

## Referenzen

- Issue [#253](https://github.com/flxln/schulnavigator/issues/253) · Epic E2 · Council [2026-07-06](../../reviews/council-directus-planung-2026-07-06.md) (Content-Freeze-Lücke)
- ADR-029 [#252](../checklists/checkliste-%23252-adr-runtime-datenpfad.md) · Spike [spike-directus-2026-07.md](../../reviews/spike-directus-2026-07.md)
- #259 Pilot · #262 MPZ Studio Read-only/Warnung

## Nicht in Scope

- Pilot-Migration (#259), Collections (#256), Lesepfad (#257), Prod-Deploy (#255), Medien-ADR (#254).
- MPZ-Studio-Code, Export-Jobs, Directus-Schema-Umsetzung.
- Big-Bang aller Stationen; Mandantenfähigkeit.

## Offene Punkte

- Keine (Unknowns-Exploration entfällt, C=1). Die Freeze-Variante ist **Inhalt der ADR-Entscheidung**, kein Planungs-Blocker; strittige AC nach 01b → Triage G1 (VOLL).
