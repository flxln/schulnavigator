# Harness-Inventar – Schulnavigator

**Stand:** 2026-11-02 · **Kontingent-Snapshot:** `kontingent-status.md` lokal, nie committen (vor Triage aktualisieren)

**Zweck:** Pflichtlektüre jeder Einzel-Triage, bevor die Aktiv-Tabelle gefüllt wird. Ein Harness gilt als verfügbar, wenn er hier steht. Eine Triage leitet die Verfügbarkeit nicht aus ihrem eigenen Laufzeitkontext ab. Ist die Datei älter als 14 Tage, vermerkt die Triage „Stale“.

**Bootstrap:** gelaufen am 2. November 2026. Regeln sind Symlinks aus `hilfreiche-tools/feature-pipeline/schulnavigator/harness/` (`harness-bootstrap apply`). `scripts/pipeline-git` ist ein lokaler Symlink auf `hilfreiche-tools/bin/pipeline-git` (nicht getrackt).

**Doku-Root:** `dokumentation/`

**Offen, von Felix zu bestätigen:** Die Tabellen übernehmen den Stand von `step-app` (7. Oktober 2026). Ob IONOS/Aider (⬡) für den Schulnavigator genutzt wird, ist nicht geklärt. Bis dahin nicht einplanen.

---

## Verfügbare Harnesses (Symbole)

| Symbol | Harness | Typischer Einsatz |
|--------|---------|-------------------|
| ⌘ | Cursor | Composer 2.5 (0/3), Grok 4.7 (01a/4); **Auto nur Alltag, nicht Pipeline** |
| ◆ | Claude Code (CLI) | Opus 5.5 (2), Sonnet 5.5; Fable 5.1 nur mit Credits |
| ‡ | Cline | GLM 5.3 (01b) |
| ◇ | Antigravity | 3.8 Flash (5a) |
| ⊕ | Composer (Cursor) | Schnelle Edits, Harness-Setup; kein eigener Pipeline-Topf |

**Nicht verfügbar / nicht einplanen:** ⬡ IONOS/Aider (nicht bestätigt). ◎ Gemini API Free Tier (kein AI-Studio-Key). 5a-Fallback ist ⊕ / ⌘ Composer.

---

## Verteilungsregeln (Triage-Pflicht)

1. Kein Monopol: mindestens 2 verschiedene Symbole pro Issue (LIGHT/VOLL). ⊕ zählt nicht gegen ⌘.
2. LIGHT mit nur einem Pre-Mortem: 01a → ‡ GLM 5.3.
3. Vor Triage `kontingent-status.md` prüfen; erschöpfte Töpfe → Fallback in der Aktiv-Tabelle notieren.
4. Kein Auto: Pipeline-Schritte brauchen ein benanntes Modell.
5. Der Lauf folgt Harness und Modell der Triage. Abweichungen kommen ins Post-Mortem.

---

## Pipeline-Schritt → Default-Harness

| Schritt | Default | Alternative bei Kontingent |
|---------|---------|---------------------------|
| Triage | ◆ Sonnet 5.5 | ⌘ Sonnet 5.5 (API-Pool) |
| 00 Plan | ⌘ Composer 2.5 · `—` | ◆ Sonnet 5.5 (LIGHT 00b) |
| 01a Pre-Mortem | ◆ Sonnet 5.5 | ⌘ Grok 4.7 · `high` |
| 01b Pre-Mortem | ‡ GLM 5.3 | ◇ 3.8 Flash Medium |
| 02 Härten | ◆ Opus 5.5 | — |
| 03 Implementieren | ⌘ Composer 2.5 · `—` | ⌘ `fast` (DIREKT) |
| 04 Post-Mortem | ◇ / ◆ Sonnet 5.5 | ⌘ Grok 4.7 |
| 05a Abschließen | ◇ 3.8 Flash Low | ⊕ / ⌘ Composer |

Triage darf abweichen, mit Begründung in `triage-#NN-*.md`. Modellstand: Vault `08_modell-routing` (10/2026).

---

## Touch-Portal-Sync

Nach jedem Pipeline-Artefakt `python3 ~/Projekte/hilfreiche-tools/python/touchportal-feature-pipeline/main.py …`. Regeln liegen als Symlinks in `.cursor/rules/`, `CLAUDE.local.md`, `GEMINI.md`, `.agents/rules/`, `.clinerules/`.

---

## Pflege

| Wann | Aktion |
|------|--------|
| Neuer Harness, Abo oder Modellgeneration | Tabellen und Verteilungsregeln anpassen |
| Vor jeder Triage | `kontingent-status.md` aktualisieren |
| Routing-Änderung im Vault | `08_modell-routing` diffen, Defaults hier nachziehen |
