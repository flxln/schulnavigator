---
issue: 252
erstellt: 2026-11-02
prompt: 00_issue-triage-pipeline-routing
---

## Triage: Issue #252: ADR Runtime-Datenpfad (Build-JSON vs. Runtime-Fetch vs. Webhook-Rebuild)

**Score:** A=1 B=1 C=1 D=0 → 3/8
**Stufe:** LIGHT
**Prompt-Variante:** klassisch
**Empfohlener Pfad:** Gemischt: Der Spike (#251) hat Option b gemessen, die Spec-Prüfung gegen Kriterien und Gates läuft billig über GLM, Härtung über Opus, Rest günstig.
**Aktiv:** Gemischt
**LIGHT-Pre-Mortem:** 01b: dominantes Risiko ist Spec/Vertrag (Entscheidung gegen die Epic-Kriterien, Gate-Intaktheit, Folgen für #256/#257), nicht Implementierbarkeit
**Datensensitivität:** intern (ADR enthält keine personenbezogenen Daten)
**Doku-Root:** `dokumentation/`
**Branch:** feature/252-adr-runtime-datenpfad-build-json-vs (aus `pipeline-git start`)
**Verifikationsprofil:** Standard (B≤1)
**Kontingent-Refresh:** übersprungen (Skript fehlt, Werte manuell) · 2026-11-02 19:02 CET
**Kontingentlage:** ⌘ First-party: ok, 0,3 % · ⌘ API: ok, 0,0 % · ◆ 5h: ok, 35 % · ◆ 7d: ok, 50 % · ‡ 5h: ok, 10 % · ‡ Woche: ok, 8 % · ◇ Gemini-Pool: ok (5h 4 %, Woche 10 %), Argon Woche 64 % · ◇ Claude+GPT: Kopfzeile sagt „leer“, Tabelle sagt 0 %, widersprüchlich, nicht einplanen · ◎: unbekannt, nicht verfügbar · ⬡ IONOS: nicht im Inventar · stale: nein
**Harness-Inventar:** ok (Stand 2026-11-02)
**Verifikationsinventar:** ok (Stand 2026-11-02), Browser-Zugriff ja (Claude in Chrome), für einen ADR ohne Belang
**Grok 4.7:** verfügbar (Cursor), keine Rolle in dieser Triage
**Fable-Budget:** kein Lauf
**GLM-Spur (Cline):** ja (01b)
**Gemini-Abo ◇ Flash:** ja (5a)
**Gemini-Abo ◇ Pro:** nein (Argon-Woche zu 64 % verbraucht, für LIGHT nicht nötig)
**Gemini Free Tier (◎):** nein
**IONOS MPZ (⬡):** nein (Inventar)
**Unknowns-Exploration vorab:** nein (C=1, D=0; der Spike war die Exploration)

**Planungsstand:** `planung-abgleich --check`: Gleichstand. Die Issue-Datei nennt „Blockiert durch: #251“ von Hand im Body, #251 ist geschlossen. Das gehört in `depends_on`, nicht in den Body; nicht Teil dieser Triage.

### Bewertung

- **A=1:** Ergebnis ist ein ADR plus Eintrag in `entscheidungen.md`. Die Entscheidung wirkt auf `stations.ts`, Deploy und Directus, das Artefakt bleibt aber Doku.
- **B=1:** Eine falsche Wahl kostet in #256/#257 Umbau, ist als ADR aber per Folge-ADR heilbar. Kein Datenverlust, keine Auth-Änderung in diesem Issue.
- **C=1:** Optionen und Kriterien stehen im Epic (E1), der Spike empfiehlt b für den MVP. Offen: Option c nicht gemessen, Preview für Lehrkräfte, Gate-Folgen (Medien-Regression S1 gehört zu #254), Gewichtung der Kriterien.
- **D=0:** 28 ADRs als Muster, Spike-Bericht mit Messwerten liegt vor.

### Pfad A: Optimal (Qualität)

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| 0 Plan | Sonnet 5.5 | ◆ Claude Code | medium | Kurz-Checkliste statt Vollplan (→ 00b) |
| 01b Logik/Spec | GLM 5.3 | ‡ Cline | high | 01a entfällt (LIGHT, Spec-Risiko dominiert) |
| 2 Härten | Opus 5.5 | ◆ Claude Code | high | B≥1 |
| 3 Implementieren | Composer 2.5 | ⌘ Cursor | — | — |
| 4 Post-Mortem | Sonnet 5.5 | ◆ Claude Code | medium | kompakt |
| 5a Abschließen | Composer 2.5 | ⌘ Cursor | — | — |

**Geschätzter Overhead:** 4 Modell-Läufe nach Triage vor dem ADR-Text (0, 01b, 2, dann 3) · **Risiko wenn gewählt:** gering

### Pfad B: Günstig (Kosten)

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| 0 Plan | Sonnet 5.5 | ◆ Claude Code | medium | Kurz-Checkliste (→ 00b) |
| 01b Logik/Spec | Gemini 3.8 Flash | ◇ Antigravity | medium | ◎ nicht verfügbar, ◇ Flash statt GLM |
| 2 Härten | Opus 5.5 | ◆ Claude Code | high | B≥1 |
| 3 Implementieren | Composer 2.5-fast | ⌘ Cursor | fast | — |
| 4 Post-Mortem | Sonnet 4.6 | ⌘ Cursor | medium | kompakt |
| 5a Abschließen | Gemini 3.8 Flash | ◇ Antigravity | low | — |

**Geschätzter Overhead:** 4 Läufe · **Risiko wenn gewählt:** 01b mit Flash statt GLM, schwächeres Spec-Gutachten bei einer Entscheidung, die #256 und #257 trägt

### Pfad C: IONOS Sicher

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| 0 Plan | Composer 2.5 | ⌘ Cursor | — | — |
| 01b | Qwen3.5-397B-A17B | ⬡ Aider | — | ⬡ nicht im Inventar |
| 2 Härten | Opus 5.5 | ◆ Claude Code | high | — |
| 3 Implementieren | Composer 2.5 | ⌘ Cursor | — | — |
| 4 Post-Mortem | Sonnet 4.6 | ◇ Antigravity | high | Claude+GPT-Pool, derzeit widersprüchlich vermerkt |
| 5a Abschließen | Qwen3.5-9B | ⬡ Aider | — | ⬡ nicht im Inventar |

**Geschätzter Overhead:** gleiche Schrittzahl · **Risiko wenn gewählt:** ⬡ nicht bestätigt; 4 auf älterer Claude-Generation

### Pfad D: IONOS Radikal (LIGHT)

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| 0 Plan | Composer 2.5 | ⌘ Cursor | — | — |
| 01b | gpt-oss-120b | ⬡ Aider | — | ⬡ nicht im Inventar |
| 2 Härten | Qwen3.5-397B-A17B | ⬡ Aider | — | nur B≥1 |
| 3 Implementieren | Composer 2.5-fast | ⌘ Cursor | fast | — |
| 4 Post-Mortem | Qwen3.8-27B | ⬡ Aider | — | — |
| 5a Abschließen | Mistral-Small-24B | ⬡ Aider | — | — |

**Geschätzter Overhead:** gleiche Schrittzahl · **Risiko wenn gewählt:** ⬡ nicht bestätigt; keine GLM/Gemini-Diversität; Härtung ohne Opus

### Abweichungen zwischen den Pfaden

| Schritt | Optimal (A) | Günstig (B) | Sicher (C) | Radikal (D) | Trade-off |
|---------|-------------|-------------|------------|-------------|-----------|
| 01b | GLM 5.3 ‡ | 3.8 Flash ◇ | Qwen3.5-397B ⬡ | gpt-oss-120b ⬡ | Spec-Qualität vs. Kosten |
| 2 | Opus 5.5 ◆ | Opus 5.5 ◆ | Opus 5.5 ◆ | Qwen3.5-397B ⬡ | Härtungsqualität |
| 4 | Sonnet 5.5 ◆ | Sonnet 4.6 ⌘ | Sonnet 4.6 ◇ | Qwen3.8-27B ⬡ | Audit-Familie |
| 5a | Composer ⌘ | 3.8 Flash ◇ | Qwen3.5-9B ⬡ | Mistral-Small ⬡ | mechanisch |

### Aktiv: Gemischt

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| 0 Plan | Sonnet 5.5 | ◆ Claude Code | medium | Kurz-Checkliste (→ 00b), kein `.cursor/plans/` |
| 01b Logik/Spec | GLM 5.3 | ‡ Cline | high | 01a entfällt; Verteilungsregel 2 (GLM) und Spec-Risiko stimmen überein |
| 2 Härten | Opus 5.5 | ◆ Claude Code | high | B=1 |
| 3 Implementieren | Composer 2.5 | ⌘ Cursor | — | ADR-Text und `entscheidungen.md`-Eintrag |
| 4 Post-Mortem | Sonnet 4.6 | ⌘ Cursor | medium | kompakt, API-Pool bei 0 %, entlastet ◆ (7d 50 %) |
| 5a Abschließen | Gemini 3.8 Flash | ◇ Antigravity | low | Fallback ⊕/⌘ Composer |

Symbole in der Kette: ◆ ‡ ⌘ ◇, die Verteilungsregel (mindestens zwei) ist erfüllt.

### Routing-Gates

| Gate | Status | Beleg/Entscheidung |
|------|--------|--------------------|
| G1 | entfällt | C=1, D=0, keine Unknowns-Exploration |
| G2 | offen | nach 01b und Opus-Härtung; Fable-Eskalation nur bei ungelöstem Blocker (nicht erwartet) |
| G3 | offen | Basis, `git diff --name-status`, gelesener Diff, Statusprüfung. Hochstufen auf VOLL, falls der ADR eine Option c oder eine neue Messung verlangt |

**Gate-Protokoll:** (leer)

### Begründung

Die Stufe bestimmt Achse C und A: Der Spike hat die Wahl vorbereitet, das Artefakt ist ein einzelner ADR. Eine Stufe tiefer (DIREKT) würde das Spec-Gutachten gegen die Epic-Kriterien und die Folgen für #256/#257 streichen, obwohl diese beiden Issues auf der Entscheidung aufbauen. VOLL wäre Overhead, solange keine neue Messung nötig ist. Gemischt statt Günstig, weil 01b hier das Hauptrisiko trägt und GLM dort die stärkere Spur ist. Pfad C/D sind nicht aktivierbar, ⬡ steht nicht im Inventar.
