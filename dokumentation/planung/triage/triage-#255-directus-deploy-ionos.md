---
issue: 255
erstellt: 2026-11-03
prompt: 00_issue-triage-pipeline-routing
---

## Triage: Issue #255 – Directus-Deploy auf dem neuen IONOS-Server (nicht die 39. GS)

**Score:** A=2 B=2 C=2 D=2 → 8/8 (G1, 3. Nov 2026; vorher C=1, 7/8)
**Stufe:** VOLL
**Prompt-Variante:** Fable-unterstützt (D=2)
**Empfohlener Pfad:** Gemischt. B=2 und D=2 verlangen starke Prüfung vorn (Unknowns, Härtung), die Umsetzung läuft günstig auf Composer.
**Aktiv:** Gemischt
**Datensensitivität:** intern. Secrets und Admin-Zugangsdaten gehören in keinen Prompt. Fable läuft über ◆, nicht über Cursor („NO ZDR“).
**Doku-Root:** `dokumentation/`
**Branch:** feature/255-directus-deploy-auf-dem-neuen-ionos (aus `pipeline-git start`)
**Verifikationsprofil:** Erhöht (B=2): Erfolgs- und Recovery-Fall für Admin-Zugang und Deploy, `test`/`lint`/`build` dokumentiert, Backup/Restore im Post-Mortem geprüft.
**Kontingent-Refresh:** übersprungen (Skript fehlt, Werte manuell) · 2026-11-02 19:02 CET
**Kontingentlage:** ⌘ First-party: ok, 0,3 % · ⌘ API: ok, 0 % · ◆ 5h: ok, 35 % · ◆ 7d: ok, 50 % (Werte von gestern) · ‡ 5h: ok, 10 % · ‡ Woche: ok, 8 % · ◇ Gemini-Pool: ok · ◇ Argon-Woche: 64 % verbraucht (Reset ca. 4. Nov) · ◇ Claude+GPT: widersprüchlich, nicht einplanen · ◎: nicht verfügbar · ⬡ IONOS: nicht im Inventar · stale: nein
**Harness-Inventar:** ok (Stand 2026-11-02)
**Verifikationsinventar:** ok (Stand 2026-11-02)
**Grok 4.7:** verfügbar (Cursor), Fallback für Schritt 4
**Fable-Budget:** 1 Lauf auf −1. Danach liegt Schritt 0 bei Composer, ein zweiter Lauf braucht die Freigabe aus G2. Harness-Inventar: „Fable 5.1 nur mit Credits“, vorher klären.
**GLM-Spur (Cline):** ja (01b)
**Gemini-Abo ◇ Flash:** ja (5a)
**Gemini-Abo ◇ Pro:** ja (Schritt 4, Argon knapp, Fallback Grok 4.7)
**Gemini Free Tier (◎):** nein
**IONOS MPZ (⬡):** nein (Inventar)
**Unknowns-Exploration vorab:** nein (erledigt 3. Nov 2026, [Befund](../../reviews/unknowns/unknowns-%23255-directus-cube-2026-11-03.md)). Ursache: IONOS-Störung für neu angelegte/neu gestartete Cloud Server seit 22. Okt (status.ionos.cloud), Cube `mpz-anwendungen` noch nicht nutzbar.
**Vorbedingung V0 vor Schritt 3:** Cube erreichbar, IONOS-Fix für den Host bestätigt, Cube im Bestand-Coolify validiert. Gehört nicht zu #255.

**Freigabe (Felix, 3. Nov 2026):** Das Issue ist nur insofern pausiert, als die produktive 39. GS kein Directus bekommt. Alles andere ist freigegeben. `39-gs.mpz.schule` bleibt auf JSON und `release/39-gs`. Die ADRs 029, 030, 031 gelten für die eigene Instanz auf dem neuen IONOS-Server.

**Planungsstand:** `planung-abgleich --check`: Gleichstand. Die Issue-Datei hat kein Frontmatter, keinen Titel, kein Ziel und keine Akzeptanzkriterien, das Tool überspringt sie. Schritt −1/0 ergänzt Frontmatter (`depends_on`), Ziel und Akzeptanzkriterien und streicht den Halt-Abschnitt zugunsten der Freigabe oben (Vorlage `issue-252-d04-adr-runtime.md`).

### Bewertung

- **A=2:** Neuer Server, Directus, Datenbank, Volumes, Proxy, Coolify und Anbindung an die ADRs 029, 030, 031.
- **B=2:** Admin-Zugang, Auth-Gates, Datenhaltung.
- **C=1:** Ziel klar, Akzeptanzkriterien fehlen, Verhalten nicht strittig.
- **D=2:** Ursache der Deploy-Probleme unbekannt, kein Referenz-Deploy für Directus.

### Pfad A – Optimal (Qualität)

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| −1 Unknowns | Fable 5.1 | ◆ | `xhigh` | D=2 |
| 0 Plan | Composer 2.5 | ⌘ | `—` | Fable-Slot auf −1 verbraucht |
| 01a | Sonnet 5.5 | ◆ | `high` | — |
| 01b | GLM 5.3 | ‡ | `high` | — |
| 2 Härten | Opus 5.5 | ◆ | `high` | — |
| 3 Implementieren | Composer 2.5 | ⌘ | `—` | — |
| 4 Post-Mortem | Gemini 4 Argon | ◇ Pro | `high` | Fallback Grok 4.7 ⌘ `high` |
| 5a Abschließen | Sonnet 5.5 | ◆ | `medium` | — |

**Geschätzter Overhead:** 6 Modell-Läufe nach der Triage vor der ersten Code-Zeile · **Risiko wenn gewählt:** gering, Fable-Credits nötig

### Pfad B – Günstig (Kosten)

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| −1 Unknowns | Sonnet 5.5 | ◆ | `high` | Kosten-Pfad |
| 0 Plan | Composer 2.5 | ⌘ | `—` | — |
| 01a | Sonnet 4.6 | ⌘ | `medium` | — |
| 01b | Gemini 3.8 Flash | ◇ Flash | `medium` | ◎ fehlt |
| 2 Härten | Opus 5.5 | ◆ | `high` | — |
| 3 Implementieren | Composer 2.5-fast | ⌘ | `fast` | — |
| 4 Post-Mortem | Sonnet 5.5 | ◆ | `high` | — |
| 5a Abschließen | Gemini 3.8 Flash | ◇ Flash | `low` | — |

**Geschätzter Overhead:** wie A · **Risiko wenn gewählt:** 01b Flash statt GLM bei B=2, schwächere Spec-Prüfung

### Pfad C – IONOS Sicher (⬡ nicht im Inventar)

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| −1 Unknowns | Fable 5.1 | ◆ | `xhigh` | D=2 |
| 0 Plan | Composer 2.5 | ⌘ | `—` | — |
| 01a | Sonnet 5.5 | ◆ | `high` | Sonnet 4.6 ◇ entfällt (Pool widersprüchlich) |
| 01b | Qwen3.5-397B-A17B | ⬡ Aider | `—` | Fallback Llama-3.3-70B, gpt-oss-120b |
| 2 Härten | Opus 5.5 | ◆ | `high` | — |
| 3 Implementieren | Composer 2.5 | ⌘ | `—` | — |
| 4 Post-Mortem | Sonnet 5.5 | ◆ | `high` | ◇ Claude+GPT nicht einplanbar |
| 5a Abschließen | Qwen3.5-9B | ⬡ Aider | `—` | Fallback Mistral-Small-24B |

**Risiko wenn gewählt:** ⬡ nicht im Inventar, 01b ohne GLM-Spur

### Pfad D – IONOS Radikal (⬡ nicht im Inventar)

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| −1 Unknowns | Qwen3.5-397B-A17B | ⬡ Aider | `—` | kein Fable |
| 0 Plan | Composer 2.5 | ⌘ | `—` | — |
| 01a | Llama-3.3-70B | ⬡ Aider | `—` | — |
| 01b | Qwen3.5-397B-A17B | ⬡ Aider | `—` | andere Familie als 01a |
| 2 Härten | Qwen3.5-397B-A17B | ⬡ Aider | `—` | Opus-Ersatz |
| 3 Implementieren | Composer 2.5 | ⌘ | `—` | — |
| 4 Post-Mortem | Llama-3.3-70B | ⬡ Aider | `—` | Fallback Qwen3.8-27B |
| 5a Abschließen | Qwen3.5-9B | ⬡ Aider | `—` | Fallback Mistral-Small-24B |

**Risiko wenn gewählt:** keine GLM/Gemini-Diversität, Härtung ohne Opus-Nachweis bei B=2, Unknowns ohne Fable bei D=2

### Abweichungen zwischen den Pfaden

| Schritt | Optimal (A) | Günstig (B) | Sicher (C) | Radikal (D) | Trade-off |
|---------|-------------|-------------|------------|-------------|-----------|
| −1 | Fable ◆ | Sonnet ◆ | Fable ◆ | Qwen ⬡ | Unknowns-Qualität vs. Credits |
| 01a | Sonnet 5.5 | Sonnet 4.6 | Sonnet 5.5 | Llama ⬡ | Urteilstopf vs. MPZ |
| 01b | GLM ‡ | ◇ Flash | Qwen ⬡ | Qwen ⬡ | Spec-Tiefe bei B=2 |
| 2 | Opus ◆ | Opus ◆ | Opus ◆ | Qwen ⬡ | Härtungsqualität |
| 4 | Argon ◇ | Sonnet ◆ | Sonnet ◆ | Llama ⬡ | Audit-Familie |
| 5a | Sonnet ◆ | Flash ◇ | Qwen ⬡ | Qwen ⬡ | mechanisch |

### Aktiv – für die Pipeline: Gemischt

| Schritt | Modell | Harness | Effort | Abweichung? |
|---------|--------|---------|--------|-------------|
| −1 Unknowns | Opus 5.5 | ◆ | `high` | erledigt; klassische Variante statt Fable, Fable-Slot frei |
| 0 Plan | Opus 5.5 | ◆ | `high` | G1: C=2 und B=2, Composer-Begründung („Fable-Slot auf −1“) entfällt; Fable optional bei Credits |
| 01a | Sonnet 5.5 | ◆ | `high` | — |
| 01b | GLM 5.3 | ‡ | `high` | — |
| 2 Härten | Opus 5.5 | ◆ | `high` | Fable nur nach G2 |
| 3 Implementieren | Composer 2.5 | ⌘ | `—` | — |
| 4 Post-Mortem | Gemini 4 Argon | ◇ Pro | `high` | Fallback Grok 4.7 ⌘ bei knapper Argon-Quote |
| 5a Abschließen | Gemini 3.8 Flash | ◇ Flash | `low` | Fallback Composer ⌘ |

### Vorbedingungen / Blocker

| Kurztext | Status | Beleg |
|----------|--------|-------|
| ADRs 029, 030, 031 (#252, #253, #254) | entschieden | auf `main` |
| Start vor Serverfix | entschieden | Felix 3. Nov 2026: Go, nur Prod 39. GS ausgenommen |
| Issue-Datei ohne Ziel und Akzeptanzkriterien | offen | Schritt 0 ergänzt sie |
| Cube `mpz-anwendungen` nutzbar (V0) | offen | IONOS-Störung, blockiert Schritt 3, nicht Schritt 0–2 |
| Konsument `schulnavigator.mpz.schule` vs. ADR-028 Punkt 4 | offen | Felix 3. Nov: Konsument = `schulnavigator.mpz.schule`; braucht neuen ADR, blockiert #257 |
| Host-Wechsel (ADR-031, Auth-Konzept, dsgvo.md nennen MPZ-VPS) | offen | Empfehlung ADR-032 in Schritt 0 |
| Umzug der Schulnavigator-Apps auf den Cube | offen | Felix 3. Nov: eigenes Ticket, nicht #255 |

Der Serverfehler ist kein Blocker für die Planung; für die Umsetzung gilt V0.

### Routing-Gates

| Gate | Status | Beleg/Entscheidung |
|------|--------|--------------------|
| G1 | passiert (2026-11-03) | [`reviews/unknowns/unknowns-#255-directus-cube-2026-11-03.md`](../../reviews/unknowns/unknowns-%23255-directus-cube-2026-11-03.md): 8/8, VOLL bleibt, Schritt 0 auf Opus ◆ |
| G2 | offen | — |
| G3 | offen | — |

**Begründung:** B=2 und D=2 tragen die Stufe, A=2 verstärkt sie. Ohne Unknowns-Lauf stünde die Planung auf einer unbekannten Serverursache, deshalb liegt der Fable-Slot auf −1. Die Umsetzung ist Konfigurationsarbeit nach gehärtetem Plan und läuft auf Composer. Eine Stufe tiefer (LIGHT) ließe 1a und 1b nicht beide laufen, bei Admin-Zugang und Datenhaltung zu riskant. Gemischt, weil Prüfung vorn stark sein muss und Ausführung und Abschluss günstig bleiben können.
