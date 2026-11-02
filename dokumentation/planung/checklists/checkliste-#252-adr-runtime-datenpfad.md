# Kurz-Checkliste: Issue #252 — ADR Runtime-Datenpfad

**Stufe:** LIGHT · **Prompt-Variante:** klassisch  
**Follow-up zu:** #251 (Spike-Bericht)  
**Triage:** [triage-#252-adr-runtime-datenpfad.md](../triage/triage-%23252-adr-runtime-datenpfad.md) · 2026-11-02

## Ziel & Akzeptanzkriterien

- Neue ADR unter `dokumentation/adr/` (nächste freie Nummer beim Schreiben prüfen, Stand Repo: **029**) mit **einer** festgelegten Variante (a/b/c) für den Directus-Lesepfad.
- Jeder Epic-Kriterium aus E1 ([epic-directus.md](../epics/epic-directus.md#e1--runtime-datenpfad--252)) ist im ADR mit Ja/Nein/Abweichung beantwortet; Spike-Messwerte ([spike-directus-2026-07.md](../../reviews/spike-directus-2026-07.md#phase-5--e1-messungen-latenz-rebuild-dauer-fallback)) als Beleg zitiert.
- Zeile in [`dokumentation/entscheidungen.md`](../../entscheidungen.md) (Status „entschieden“, Datum).
- ADR nennt explizit Folgen für #256 (Schema/Validatoren) und #257 (Env, `stations.ts`/Fetch, Cache, Fallback) ohne deren Umsetzung.
- Kein App-Code geändert (nur Doku).

## Ausführungs-Checkliste

1. **01b Pre-Mortem** (GLM/Cline, Input diese Datei): Optionen gegen E1-Kriterien und Gate-Intaktheit; Blocker für Entscheidung b vs. c dokumentieren.
2. **02 Plan härten** (Opus): Checkliste + 01b-Befund; Entwurfssatz „gewählte Option + Non-Goals“ festziehen.
3. **Vorlage:** `dokumentation/adr/000-template.md` kopieren → `029-*-runtime-datenpfad*.md` (Nummer vor Anlage per `ls dokumentation/adr/` verifizieren).
4. **ADR-Inhalt:** Kontext (Build-Import in `app/lib/stations.ts`), Optionen a/b/c kurz, **Entscheidung** (Spike empfiehlt **b** MVP, **c** optional später), Konsequenzen (Directus-Ausfall, `validate-stations`, Build-Kontext nur `app/`, Publish-Latenz, Lehrkräfte-Preview als Anforderung vs. MVP-Abgrenzung).
5. **`entscheidungen.md`:** Tabellenzeile + ggf. Verweis in ADR-003 nur wenn nötig (kein ADR-003-Überschreiben).
6. **03 Implementieren** (Composer): Text finalisieren, keine `.cursor/plans/`, PR/Issue-Verweis optional im ADR-Footer.

## Verifikation

- `ls dokumentation/adr/029*.md` existiert; ADR listet abgelehnte Optionen mit Kurzgrund.
- `rg "029|Runtime-Datenpfad" dokumentation/entscheidungen.md` trifft neuen Eintrag.
- Stichprobe: ADR enthält Worte zu Fallback bei Directus-Ausfall, `validate-stations`, Build-Kontext `app/`.
- `cd app && npm run build` unverändert grün (kein Code diff erwartet).

## Referenzen

- Issue: [#252](https://github.com/flxln/schulnavigator/issues/252) · [issue-252-d04-adr-runtime.md](../issues/issue-252-d04-adr-runtime.md)
- Epic E1, Council: [council-directus-planung-2026-07-06.md](../../reviews/council-directus-planung-2026-07-06.md)
- Spike: [spike-directus-2026-07.md](../../reviews/spike-directus-2026-07.md) (Phase 4 Lesepfad, Phase 5 Messungen)
- Build-Regel: [build-kontext-submodule-regeln.md](../../build-kontext-submodule-regeln.md)

## Nicht in Scope

- Produktive Umsetzung (#257), Collections (#256), Deploy (#255), Migration/Freeze (#253), Medien-ADR (#254).
- Webhook/Coolify-Konfiguration, neuer Spike oder Messung Option **c**.
- Lehrkräfte-Preview als Feature bauen (nur im ADR als Anforderung/Follow-up benennen).

## Offene Punkte

- Keine Unknowns vorab (User/Triage); verbleibende Feinheiten (Preview-Route, On-Demand-Revalidation) in 01b/ADR-Text klären, nicht als Implementierung in #252.
