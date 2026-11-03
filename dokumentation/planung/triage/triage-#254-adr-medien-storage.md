---
issue: 254
erstellt: 2026-11-03
prompt: 00_issue-triage-pipeline-routing
---

## Triage: Issue #254: ADR Medien-Storage (`public/`-Volumes vs. Directus-Assets vs. Object Storage), Gate-kompatibel

**Score:** A=1 B=1 C=1 D=0 → 3/8
**Stufe:** LIGHT
**Prompt-Variante:** klassisch
**Empfohlener Pfad:** Gemischt: Das Risiko liegt in Spec und Vertrag (Entry-Cookie-Gate S1, ADR-027, Scope-Frage Lehrkräfte-Upload), nicht in der Umsetzung. GLM prüft Spec und Vertrag billig, Opus härtet, der Rest läuft günstig.
**Aktiv:** Gemischt
**LIGHT-Pre-Mortem:** 01b: dominantes Risiko ist Spec/Vertrag (S1-Regression durch `/assets/*`, Konsistenz mit ADR-027, 029, 030, Backup T5, AVV-/Speicherort-Anhang), nicht Implementierbarkeit
**Datensensitivität:** intern (ADR ohne personenbezogene Daten; der Gegenstand sind Schüler-Medien, der Text enthält aber keine)
**Doku-Root:** `dokumentation/`
**Branch:** feature/254-adr-medien-storage-public-volumes-vs (aus `pipeline-git start`)
**Verifikationsprofil:** Standard (B≤1)
**Kontingent-Refresh:** übersprungen (Skript fehlt, Werte manuell) · 2026-11-02 19:02 CET
**Kontingentlage:** ⌘ First-party: ok, 0,3 % · ⌘ API: ok, 0,0 % · ◆ 5h: ok, 35 % · ◆ 7d: ok, 50 % · ‡ 5h: ok, 10 % · ‡ Woche: ok, 8 % · ◇ Gemini-Pool: ok (5h 4 %, Woche 10 %), Argon Woche 64 % · ◇ Claude+GPT: Kopfzeile „leer“, Tabelle 0 %, widersprüchlich, nicht einplanen · ◎: nicht verfügbar · ⬡ IONOS: nicht im Inventar · stale: nein (Stand vom Vortag; die ◆-5h-Werte stammen von gestern Abend und sind für heute überholt)
**Harness-Inventar:** ok (Stand 2026-11-02)
**Verifikationsinventar:** ok (Stand 2026-11-02), Browser-Zugriff ja (Claude in Chrome), für einen ADR ohne Belang
**Grok 4.7:** verfügbar (Cursor), keine Rolle in dieser Triage
**Fable-Budget:** kein Lauf
**GLM-Spur (Cline):** ja (01b)
**Gemini-Abo ◇ Flash:** ja (5a)
**Gemini-Abo ◇ Pro:** nein (Argon-Woche zu 64 % verbraucht, für LIGHT nicht nötig)
**Gemini Free Tier (◎):** nein
**IONOS MPZ (⬡):** nein (Inventar)
**Unknowns-Exploration vorab:** nein (C=1, D=0; die Optionen und Kriterien stehen im Epic E3, der Spike #251 hat Option a und b praktisch geprüft)

**Planungsstand:** `planung-abgleich --check`: Gleichstand. Die Issue-Datei `issue-254-d06-adr-medien.md` besteht nur aus dem Abschnitt „Kontext“ (kein Frontmatter, kein Ziel, keine Akzeptanzkriterien, nicht einmal Überschrift), `planung-abgleich` überspringt sie. Die Datei nennt „Blockiert: #255, #259“, GitHub kennt nur #255 als blockiert durch #254. Die Beziehung zu #259 ist also nicht in GitHub abgebildet. #251 ist geschlossen. Schritt 0 ergänzt Frontmatter (`depends_on`), Ziel und Akzeptanzkriterien; Vorlage: `issue-252-d04-adr-runtime.md`. Nächste ADR-Nummer: 031 (029 und 030 liegen auf `main`).

### Bewertung

- **A=1:** Ergebnis ist ein ADR plus Eintrag in `entscheidungen.md`. Die Entscheidung wirkt auf #255 (Directus-Deploy), #259 (Pilot), die Medien-Auslieferung und das Backup, das Artefakt bleibt aber Doku.
- **B=1:** Eine falsche Wahl (Option b ohne Schutzschicht) wäre eine Security-Regression im Entry-Cookie-Gate (Audit S1), aber erst bei der Umsetzung in #255/#259, dort B=2. Als ADR ist sie per Folge-ADR heilbar. In diesem Issue gibt es keinen Code, keine Auth-Änderung, keinen Datenverlust.
- **C=1:** Epic E3 benennt Optionen a/b/c und die Kriterien (Cookie-Prüfung, ADR-027, Backup T5, AVV, Upload-Regeln). Der Spike belegt: Directus-Assets liefern mit Public-Read `200` ohne Cookie. Offen und strittig kann die Scope-Frage werden: Sollen Lehrkräfte Medien hochladen, oder bleibt der Ingest beim MPZ? Wird sie in Schritt 0 als nicht entscheidbar erkannt (C=2), hochstufen, siehe G1.
- **D=0:** ADR-029 (#252) und ADR-030 (#253) sind Muster, der Spike-Bericht Phase 6 liefert den E3-Befund, `lib/mpz-upload-rules.ts` und ADR-027 sind Referenz.

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

**Geschätzter Overhead:** 3 Läufe · **Risiko wenn gewählt:** 01b mit Flash statt GLM, schwächeres Spec-Gutachten bei einer Entscheidung, die das Auslieferungs-Gate für #255 und #259 festlegt

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
| 3 Implementieren | Composer 2.5 | ⌘ Cursor | — | ADR-031 und `entscheidungen.md`-Eintrag |
| 4 Post-Mortem | Sonnet 4.6 | ⌘ Cursor | medium | kompakt, API-Pool bei 0 %, entlastet ◆ (7d 50 %) |
| 5a Abschließen | Gemini 3.8 Flash | ◇ Antigravity | low | Fallback ⊕/⌘ Composer |

Symbole in der Kette: ◆ ‡ ⌘ ◇, die Verteilungsregel (mindestens zwei) ist erfüllt.

### Vorbedingungen / Blocker

| Kurztext | Status | Beleg |
|----------|--------|-------|
| #251 Spike (E3-Befund Phase 6) | entschieden | GitHub: #251 geschlossen; `dokumentation/reviews/spike-directus-2026-07.md` |
| Scope-Frage Lehrkräfte-Upload (ja/nein) | offen | Epic E3, Option a: „Scope-Frage!“; klärt Schritt 0 oder der Mensch, sonst G1 |

Die Scope-Frage blockiert den Start von Schritt 0 nicht, sie ist Teil der Entscheidung, die der ADR trifft. Bleibt sie nach Schritt 0 ohne Antwort, ist C=2 und G1 greift.

### Routing-Gates

| Gate | Status | Beleg/Entscheidung |
|------|--------|--------------------|
| G1 | entfällt | C=1, D=0, keine Unknowns-Exploration. Bleibt die Scope-Frage nach Schritt 0 strittig oder lassen sich die Akzeptanzkriterien nicht festlegen (C=2), neu bewerten: 4/8, VOLL, Unknowns-Exploration vor der Planung |
| G2 | offen | nach 01b und Opus-Härtung; Fable-Eskalation nur bei ungelöstem Blocker (nicht erwartet) |
| G3 | offen | Basis, `git diff --name-status`, gelesener Diff, Statusprüfung. Hochstufen auf VOLL, falls der ADR eine neue Messung, einen zweiten Spike oder Codeänderungen am Medien-Handler verlangt |

**Gate-Protokoll:** (leer)

### Begründung

Entschieden haben A und C: Das Artefakt ist ein einzelner ADR, die Optionen und Kriterien stehen in Epic E3, und der Spike hat die kritische Frage (Gate-Bypass bei Directus-Assets) bereits praktisch beantwortet. DIREKT würde das Spec-Gutachten gegen ADR-027, 029, 030 und das Cookie-Gate streichen, obwohl #255 und #259 (B=2) auf dieser Entscheidung aufbauen. VOLL wäre Overhead, solange die Scope-Frage nicht als strittig auffällt. Gemischt statt Günstig, weil 01b das Hauptrisiko trägt und GLM dort die stärkere Spur ist. Pfad C/D sind nicht aktivierbar, ⬡ steht nicht im Inventar.
