---
name: schritt-abschliessen
description: >-
  Schließt einen abgeschlossenen Arbeitsschritt im Schulnavigator end-to-end ab:
  Kontext vom aktuellen Branch, Repo-Doku, GitHub-Issues syncen, Commit und Push.
  Aktiviert bei: Schritt abschließen, /schritt-abschliessen, Feature fertig
  dokumentieren, Issue schließen, Epic anlegen, GitHub Project aktualisieren,
  Branch abschließen und pushen.
disable-model-invocation: true
---

# Schritt abschließen — Schulnavigator

Orchestriert den **End-to-End-Workflow auf dem aktuellen Branch**:

Kontext erfassen → Repo-Doku → `gh` → Issue-Nummern zurückschreiben → **Commit → Push**.

Läuft **selbständig durch**, ohne Rückfragen zu `gh`, Commit oder Push.

Repo: `flxln/schulnavigator`. Sprache: Deutsch (Doku, Issue-Bodies, Commit-Messages).

## Grundregeln

1. **Aktueller Branch** — `git branch --show-current` ermitteln; alle Schritte beziehen sich auf diesen Branch und seinen Diff zu `main` (bzw. `origin/main`).
2. **Markdown zuerst** — Änderungen zuerst in `dokumentation/` (und betroffene Anleitungen) festhalten, danach `gh` (siehe [planung/README.md](../../dokumentation/planung/README.md)).
3. **`gh` direkt ausführen** — ohne Bestätigung; bei Fehlern melden, korrigieren, erneut versuchen.
4. **Commit und Push immer abschließen** — nach Doku + `gh` alle relevanten Änderungen auf dem Branch committen und `git push` ausführen (siehe Phase 5).
5. **Keine Secrets** — `.env`, `.env.local`, Credentials nie stagen, committen oder in Issues/Doku.
6. **Entschiedene ADRs nicht überschreiben** — bei ADR-Bedarf Skill `adr-erstellen` befolgen.
7. **Kein Force-Push** — insbesondere nicht auf `main`/`master`.

## Einstieg: Was ist abgeschlossen?

Aus Kontext (Branch, Diff, Plan-Datei, Nutzerangabe) ableiten und **kurz** klassifizieren:

| Typ | Typische Artefakte |
|-----|-------------------|
| **A — Umsetzung fertig** | Code merged/lokal fertig, Issue existiert |
| **B — Architekturentscheidung** | Neuer/geänderter ADR, ggf. Epic |
| **C — Planung ohne Code** | Epic + Unterissues spezifizieren |
| **D — Nur Sync** | Markdown steht, GitHub hinkt hinterher |

Fehlt Kontext: Branch-Diff, offene `.cursor/plans/*.plan.md` und genannte Issue-Nummern lesen.

## Phase 1 — Kontext sammeln

Parallel prüfen:

- `git branch --show-current` — Branch-Name für Push und Commit-Kontext
- `git status` / `git diff` / `git diff main...HEAD` (falls `main` existiert) — Code + Doku auf dem Branch
- `.cursor/plans/issue_*` oder `adr-*` — gibt es einen Umsetzungsplan?
- `dokumentation/planung/` — Epic- oder Phase-Datei zum Thema?
- `dokumentation/adr/` + `entscheidungen.md` — ADR nötig oder schon vorhanden?
- `gh issue view N` — falls Issue-Nummer bekannt

**ADR nötig?** Ja, wenn: neue Architekturentscheidung, neues Content-Schema, Sicherheits-/DSGVO-Relevanz, API-/Deploy-Änderung. Nein bei: reiner Bugfix, reine UI-Politur ohne neue Entscheidung.

## Phase 2 — Repo dokumentieren

Reihenfolge und Ziele:

### 2a — ADR (falls nötig)

Skill `.cursor/skills/adr-erstellen/SKILL.md` vollständig anwenden:
`dokumentation/adr/NNN-….md` + Eintrag in `dokumentation/entscheidungen.md`.

### 2b — GitHub-Projekt-Spezifikation

Zielordner: `dokumentation/planung/`

| Situation | Datei |
|-----------|-------|
| Neues Epic | Neue `epic-<thema>.md` (Vorlage: [epic-externe-medien-hotspot-marker.md](../../dokumentation/planung/epic-externe-medien-hotspot-marker.md)) |
| Einzelnes Issue | `planung/archiv/issues-phase-N.md` oder [planung/offen.md](../../dokumentation/planung/offen.md) |
| Epic-Update | Bestehende `epic-*.md` — Checkboxen, Status, PR-Links |
| Milestone-Text | [milestones.md](../../dokumentation/planung/milestones.md) |

**Epic-Vorlage (Mindestinhalt):**

```markdown
# Epic: [Titel] (ADR-NNN)

**Milestone:** Phase N — [Name]
**Status:** [offen / Stufe X erledigt / abgeschlossen]

## Übersicht
| Rolle | Nr. | Titel | Labels | Blockiert durch |
|-------|-----|-------|--------|-----------------|
| **Epic (Parent)** | `#___` | … | … | — |
| Unterissue | `#___` | … | … | … |

## GitHub-Links
| Issue | URL |
|-------|-----|
| #___ | https://github.com/flxln/schulnavigator/issues/___ |
```

**Issue-Body-Vorlage (für `gh issue create --body-file`):**

```markdown
## Ziel
…

## Akzeptanzkriterien
- [ ] …

## Kontext
- ADR: …
- Epic-Parent: #NNN (nur bei Unterissue)
- Spezifikation: dokumentation/planung/…
```

Labels aus [labels.md](../../dokumentation/planung/labels.md). Milestone-Namen exakt wie in [milestones.md](../../dokumentation/planung/milestones.md) (z. B. `Phase 5 — Post-Fest`).

### 2c — Weitere Doku (nur wenn betroffen)

| Änderung | Datei |
|----------|-------|
| Content-Schema / Medientypen | `anleitungen/content-einpflegen.md` |
| Lokales Testen | `anleitungen/lokal-testen-und-anschauen.md` |
| DSGVO / Drittanbieter | `dokumentation/dsgvo.md` |
| Phasenstand | `dokumentation/archiv/projektplan.md` |
| Agenten-Kurzüberblick | `CLAUDE.md` (nur bei größeren Meilensteinen) |

### 2d — README-Checkliste

In [planung/README.md](../../dokumentation/planung/README.md) bzw. [planung/offen.md](../../dokumentation/planung/offen.md):
- erledigte Punkte `[x]` setzen
- **Letzter dokumentierter Abgleich:** auf heutiges Datum + Kurzvermerk aktualisieren

## Phase 3 — GitHub syncen (`gh`, ohne Bestätigung)

Nach Phase 2 **sofort** ausführen. Body-Dateien temporär unter `/tmp/` oder `dokumentation/planung/.draft-*.md` anlegen (`.draft-*` nicht committen).

### Issue anlegen

```bash
gh issue create \
  --repo flxln/schulnavigator \
  --title "Kurztitel" \
  --body-file /tmp/issue-body.md \
  --label "tech" \
  --label "design" \
  --milestone "Phase 5 — Post-Fest" \
  --assignee "@me"
```

Mehrere Labels: `--label` wiederholen. Epic zuerst anlegen, Nummer aus Output lesen, dann Unterissues mit `Parent: #NNN` im Body.

### Issue aktualisieren / schließen

```bash
gh issue edit N --repo flxln/schulnavigator --body-file /tmp/issue-body.md
gh issue close N --repo flxln/schulnavigator --comment "Umgesetzt in PR #…"
```

### Milestone-Beschreibung patchen

```bash
gh api repos/flxln/schulnavigator/milestones --jq '.[] | select(.title=="Phase 5 — Post-Fest") | .number'
gh api repos/flxln/schulnavigator/milestones/MILESTONE_NUM -X PATCH -f description="…"
```

### Nach `gh issue create`

1. Ausgegebene Issue-Nummer in die Markdown-Spezifikation zurückschreiben (`#NNN`, URL-Tabelle, `**GitHub:**` Zeile).
2. Verwandte ADR/Epic-Dateien mit echten Nummern aktualisieren (Platzhalter `#___` ersetzen).

**Wichtig:** Phase 3 endet erst, wenn alle Rückschreibungen in Markdown erledigt sind — danach erst Phase 5.

## Phase 4 — Commit (aktueller Branch)

Nach Phase 2 und 3 **automatisch** committen.

### Vorbereitung

```bash
git status
git diff --stat
```

### Staging

- **Stagen:** Code, `dokumentation/`, `anleitungen/`, `CLAUDE.md`, `.cursor/skills/` — alles, was zum abgeschlossenen Schritt gehört
- **Nicht stagen:** `.env`, `.env.local`, `dokumentation/planung/.draft-*`, Debug-Logs (`.cursor/debug-*.log`), nur lokale Artefakte

```bash
git add <relevante Pfade>
# oder bei vollständigem Feature-Branch mit nur projektbezogenen Änderungen:
# git add -A && git reset HEAD app/.env.local .env .env.local 2>/dev/null; true
```

### Commit-Message (Deutsch, 1–2 Sätze, Fokus „Warum“)

HEREDOC-Format:

```bash
git commit -m "$(cat <<'EOF'
Kurze Begründung des Schritts.

Optional: schließt #NNN, ADR-017 Stufe 3.
EOF
)"
```

- Issue-Referenz `schließt #NNN` nur, wenn Issue in Phase 3 geschlossen wurde
- Bei reinem Doku-/Epic-Sync: „Doku und GitHub-Issues für … synchronisiert“
- Wenn nichts zu committen: Phase überspringen, in Bericht vermerken

### Pre-Commit-Hook

Schlägt der Commit fehl (Lint, Tests, Token-Check): Fehler beheben, **neuen** Commit anlegen (kein `--amend`, außer Hook hat Dateien geändert und alle Amend-Bedingungen aus den Projektregeln sind erfüllt).

## Phase 5 — Push (aktueller Branch)

**Ohne Rückfrage** pushen:

```bash
BRANCH=$(git branch --show-current)
git push -u origin "$BRANCH"
```

- `-u` setzen, wenn Branch noch kein Upstream hat
- Bei Push-Ablehnung (nicht fast-forward): Nutzer informieren, **kein** `--force` — Rebase/Merge manuell anbieten
- Nach Push: `git status` prüfen („up to date with origin/…“)

## Phase 6 — Abschlussbericht

Kurz ausgeben (Markdown-Liste):

- **Branch:** Name + Push-Status
- **Commit:** Hash + Message (Kurzfassung)
- **Doku:** geänderte Dateien
- **GitHub:** Issues angelegt/geändert/geschlossen (mit URL)
- **Offen:** bewusst offen gelassen (z. B. DSB-Freigabe, PR noch nicht gemerged)
- **Nächster Schritt:** falls erkennbar (PR erstellen, Deploy, manueller Test)

## Entscheidungsbaum (Kurz)

```
Abgeschlossener Schritt (aktueller Branch)?
├─ Architekturentscheidung → ADR + Epic-MD → gh → Commit → Push
├─ Feature umgesetzt, Issue existiert → Doku + gh close/edit → Commit (Code+Doku) → Push
├─ Feature umgesetzt, kein Issue → Phase-MD + gh create → Nummern zurück → Commit → Push
├─ Nur geplant (kein Code) → epic-*.md + gh → Commit → Push
└─ MD schon aktuell → gh sync → Commit → Push
```

## Referenzen

| Thema | Pfad |
|-------|------|
| Sync-Regel | `dokumentation/planung/README.md` |
| ADR-Workflow | `.cursor/skills/adr-erstellen/SKILL.md` |
| Labels | `dokumentation/planung/labels.md` |
| Milestones | `dokumentation/planung/milestones.md` |
| Entscheidungsindex | `dokumentation/entscheidungen.md` |
| Projektphasen | `dokumentation/archiv/projektplan.md` |

## Beispiel: Issue #100 nach Umsetzung (Typ A)

1. Branch `feature/embed` — Diff/Plan lesen → Embed-Feature fertig
2. `epic-externe-medien-hotspot-marker.md`: #100 Checkbox `[x]`, Status Stufe 3 erledigt
3. `planung/offen.md`, `content-einpflegen.md`, `dsgvo.md` bei Bedarf
4. `planung/offen.md` oder Sync-Log aktualisieren + Datum
5. `gh issue close 100 --comment "Umgesetzt: EmbedViewer, Allowlist, CSP"`
6. `git add` Code + Doku → Commit „Medientyp embed umsetzen, schließt #100“
7. `git push -u origin feature/embed`
8. Bericht mit Branch, Commit, Issue-URL

## Beispiel: Neues Epic (Typ C)

1. Branch `docs/epic-foo` — `dokumentation/adr/NNN-….md` (falls neu)
2. `dokumentation/planung/epic-<thema>.md` mit Platzhaltern `#___`
3. `gh issue create` Epic → Nummer N; Unterissues mit `Parent: #N`
4. Epic-MD mit echten Nummern und URLs füllen
5. `entscheidungen.md` / `README.md` ergänzen
6. Commit „Epic Foo spezifiziert und GitHub-Issues #N–#M angelegt“
7. `git push -u origin docs/epic-foo`
8. Bericht
