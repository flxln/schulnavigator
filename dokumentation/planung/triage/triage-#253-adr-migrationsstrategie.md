---
issue: 253
erstellt: 2026-11-02
prompt: 00_issue-triage-pipeline-routing
---

## Triage: Issue #253: ADR Migrationsstrategie JSON ↔ Directus + Content-Freeze

**Score:** A=1 B=1 C=1 D=0 → 3/8
**Stufe:** LIGHT
**Prompt-Variante:** klassisch
**Empfohlener Pfad:** Gemischt: Das Risiko liegt in der Spec (offene Epic-Fragen E2, Folgen für #259), nicht in der Umsetzung. GLM prüft Spec und Vertrag billig, Opus härtet, der Rest läuft günstig.
**Aktiv:** Gemischt
**LIGHT-Pre-Mortem:** 01b: dominantes Risiko ist Spec/Vertrag (Freeze-Entscheidung, Dual-Write-Verbot, Slug-Unveränderlichkeit, Konsistenz mit ADR-022, 028, 029), nicht Implementierbarkeit
**Datensensitivität:** intern (ADR ohne personenbezogene Daten)
**Doku-Root:** `dokumentation/`
**Branch:** feature/253-adr-migrationsstrategie-json-directus (aus `pipeline-git start`)
**Verifikationsprofil:** Standard (B≤1)
**Kontingent-Refresh:** übersprungen (Skript fehlt, Werte manuell) · 2026-11-02 19:02 CET
**Kontingentlage:** ⌘ First-party: ok, 0,3 % · ⌘ API: ok, 0,0 % · ◆ 5h: ok, 35 % · ◆ 7d: ok, 50 % · ‡ 5h: ok, 10 % · ‡ Woche: ok, 8 % · ◇ Gemini-Pool: ok (5h 4 %, Woche 10 %), Argon Woche 64 % · ◇ Claude+GPT: Kopfzeile „leer“, Tabelle 0 %, widersprüchlich, nicht einplanen · ◎: nicht verfügbar · ⬡ IONOS: nicht im Inventar · stale: nein
**Harness-Inventar:** ok (Stand 2026-11-02)
**Verifikationsinventar:** ok (Stand 2026-11-02), Browser-Zugriff ja (Claude in Chrome), für einen ADR ohne Belang
**Grok 4.7:** verfügbar (Cursor), keine Rolle in dieser Triage
**Fable-Budget:** kein Lauf
**GLM-Spur (Cline):** ja (01b)
**Gemini-Abo ◇ Flash:** ja (5a)
**Gemini-Abo ◇ Pro:** nein (Argon-Woche zu 64 % verbraucht, für LIGHT nicht nötig)
**Gemini Free Tier (◎):** nein
**IONOS MPZ (⬡):** nein (Inventar)
**Unknowns-Exploration vorab:** nein (C=1, D=0; die offenen Fragen sind im Epic einzeln benannt)

**Planungsstand:** `planung-abgleich --check`: Gleichstand. Die Issue-Datei `issue-253-d05-adr-migration.md` hat weder Frontmatter noch Ziel noch Akzeptanzkriterien, nur den Abschnitt „Kontext“ mit „Blockiert durch: #251“ von Hand im Body. `planung-abgleich` überspringt sie deshalb. GitHub meldet #253 als blockiert durch #251 (geschlossen) und blockierend für #259 und #255 (die Datei nennt nur #259). Vorlage: `issue-252-d04-adr-runtime.md`. Schritt 0 ergänzt Frontmatter (`depends_on`), Ziel und Akzeptanzkriterien.

### Bewertung

- **A=1:** Ergebnis ist ein ADR plus Eintrag in `entscheidungen.md`. Die Entscheidung wirkt auf #255, #259, #262 und den Betrieb von MPZ Studio, das Artefakt bleibt aber Doku.
- **B=1:** Eine falsche Freeze- oder Migrationswahl trifft den Pilot (#259, dort B=2), ist als ADR aber per Folge-ADR heilbar. Kein Datenverlust und keine Auth-Änderung in diesem Issue.
- **C=1:** Die Epic-Sektion E2 nennt vier konkrete offene Fragen: Freeze ja/nein/wann/wie lang, pro Pilot-Raum oder global, Verhalten von MPZ Studio (Dual-Write-Verbot, Rück-Export als Fallback), Umgang mit der unveränderlichen Slug-Liste. Die Council-Konsenslücke beim Freeze ist die eigentliche Entscheidung. Wird sie in Schritt 0 als strittig erkannt (C=2), hochstufen, siehe G1.
- **D=0:** ADR-029 (#252) liegt als Muster und Vorgabe vor, ADR-028 klärt `main` vs. `release/39-gs`, ADR-022 regelt MPZ Studio. Der Epic-Ist-Stand (Stand #264) ist aktuell.

### Pfad A: Optimal (Qualität)

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| 0 Plan | Sonnet 5.5 | ◆ Claude Code | medium | Kurz-Checkliste statt Vollplan (→ 00b) |
| 01b Logik/Spec | GLM 5.3 | ‡ Cline | high | 01a entfällt (LIGHT, Spec-Risiko dominiert) |
| 2 Härten | Opus 5.5 | ◆ Claude Code | high | B≥1 |
| 3 Implementieren | Composer 2.5 | ⌘ Cursor | — | — |
| 4 Post-Mortem | Sonnet 5.5 | ◆ Claude Code | medium | kompakt |
| 5a Abschließen | Composer 2.5 | ⌘ Cursor | — | — |

**Geschätzter Overhead:** 3 Modell-Läufe nach Triage vor dem ADR-Text (0, 01b, 2) · **Risiko wenn gewählt:** gering

### Pfad B: Günstig (Kosten)

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| 0 Plan | Sonnet 5.5 | ◆ Claude Code | medium | Kurz-Checkliste (→ 00b) |
| 01b Logik/Spec | Gemini 3.8 Flash | ◇ Antigravity | medium | ◎ nicht verfügbar, ◇ Flash statt GLM |
| 2 Härten | Opus 5.5 | ◆ Claude Code | high | B≥1 |
| 3 Implementieren | Composer 2.5-fast | ⌘ Cursor | fast | — |
| 4 Post-Mortem | Sonnet 4.6 | ⌘ Cursor | medium | kompakt |
| 5a Abschließen | Gemini 3.8 Flash | ◇ Antigravity | low | — |

**Geschätzter Overhead:** 3 Läufe · **Risiko wenn gewählt:** 01b mit Flash statt GLM, schwächeres Spec-Gutachten bei einer Entscheidung, die den Pilot (#259) trägt

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
| 0 Plan | Sonnet 5.5 | ◆ Claude Code | medium | Kurz-Checkliste (→ 00b), kein `.cursor/plans/`; ergänzt Frontmatter, Ziel und Akzeptanzkriterien der Issue-Datei |
| 01b Logik/Spec | GLM 5.3 | ‡ Cline | high | 01a entfällt; Verteilungsregel 2 (GLM) und Spec-Risiko stimmen überein |
| 2 Härten | Opus 5.5 | ◆ Claude Code | high | B=1 |
| 3 Implementieren | Composer 2.5 | ⌘ Cursor | — | ADR-Text und `entscheidungen.md`-Eintrag |
| 4 Post-Mortem | Sonnet 4.6 | ⌘ Cursor | medium | kompakt, API-Pool bei 0 %, entlastet ◆ (7d 50 %) |
| 5a Abschließen | Gemini 3.8 Flash | ◇ Antigravity | low | Fallback ⊕/⌘ Composer |

Symbole in der Kette: ◆ ‡ ⌘ ◇, die Verteilungsregel (mindestens zwei) ist erfüllt.

### Routing-Gates

| Gate | Status | Beleg/Entscheidung |
|------|--------|--------------------|
| G1 | entfällt | C=1, D=0, keine Unknowns-Exploration. Zeigt Schritt 0, dass der Content-Freeze strittig bleibt oder die Akzeptanzkriterien nicht festzulegen sind (C=2), neu bewerten: 4/8, VOLL, Unknowns-Exploration vor der Planung |
| G2 | offen | nach 01b und Opus-Härtung; Fable-Eskalation nur bei ungelöstem Blocker (nicht erwartet) |
| G3 | offen | Basis, `git diff --name-status`, gelesener Diff, Statusprüfung. Hochstufen auf VOLL, falls der ADR eine neue Messung oder Änderungen an MPZ Studio verlangt |

**Gate-Protokoll:** (leer)

### Begründung

Entschieden hat Achse C zusammen mit A: Das Artefakt ist ein einzelner ADR, die Fragen stehen einzeln im Epic (E2), und ADR-029 gibt den Datenpfad vor. DIREKT würde das Spec-Gutachten gegen Epic, ADR-022, ADR-028 und ADR-029 streichen, obwohl #259 (B=2, VOLL mit Fable) auf dieser Entscheidung aufbaut. VOLL wäre Overhead, solange der Content-Freeze nicht als strittig auffällt. Gemischt statt Günstig, weil 01b das Hauptrisiko trägt und GLM dort die stärkere Spur ist. Pfad C/D sind nicht aktivierbar, ⬡ steht nicht im Inventar.
