---
tags:
  - post-mortem
  - feature-port
  - kunde-39-gs
  - mpz-studio-ui-design-refactor
erstellt: 2026-06-24
---

# Post-Mortem — Kunde-Code Feature-Port (2026-06-24)

**Abgleich zwischen Plan (`.cursor/plans/kunde-code_feature-port_db51d05a.plan.md`) und Ausführung.**

Der Port wurde vollständig und plankonform durchgeführt. Alle Akzeptanzkriterien erfüllt bis auf den bekannten `validate:coach`-Blocker (`welcome-hub.wav`), der als Altschuld dokumentiert und kein Blocker dieses Plans war. Eine geringfügige Testanpassung (Slug `kunst` → `daz`) war wegen fehlender `stations.json` auf dem Feature-Branch nötig.

---

## 1. Todos

| ID | Befund |
|----|--------|
| `sichern-epic` | ✅ Commit `6bdb951` auf `kunde/39-gs`: ADR-027, Epic, Planungsordner, Pre-Mortem committet. `.cursor/plans/` ist gitignored — blieb lokal, wird nicht verloren. |
| `stash-kunde` | ✅ `git stash push -u` sicherte Working Tree (Medien, uncommittete Epic-Bearbeitungen in `dsgvo.md`, `entscheidungen.md`, `offen.md` u. a.). |
| `checkout-feature` | ✅ Auf `feature/mpz-studio-ui-design-refactor` gewechselt. |
| `port-code` | ✅ 46 Dateien portiert (Plan: 34 Code + 9 Doku; tatsächlich 46 — leichte Mehr-/Umzählung unkritisch, alle Ziel-Dateien enthalten). |
| `port-docs` | ✅ Kein manuelles Mergen nötig (plankonform: feature hatte 0 eigene Commits seit Merge-Base `7c55973`). |
| `verify` | ✅ 1130/1130 Tests grün. `npm run build` scheitert an vorbestehendem `validate:coach` (`welcome-hub.wav` fehlt auf feature) — bekannte Altschuld, kein neuer Bruch. |
| `commit-feature` | ✅ Commit `3f726c6` auf `feature/mpz-studio-ui-design-refactor`, nur lokal (nicht gepusht, plankonform). |
| `restore-kunde` | ✅ `git stash pop` zurückgespielt; Medien und uncommittete Epic-Bearbeitungen wieder da. |

---

## 2. Abweichungen

- **Testanpassung `station-dialog-segment-form.test.tsx` — Slug `kunst` → `daz`:** Feature-Branch hat keine GS39-`stations.json`; `kunst` hat dort keinen Dialog. Cursor hat den Slug auf `daz` geändert, das auf feature einen Dialog hat. Plankonformes Verhalten — die Plan-Annahme „Feature-Branch-`stations.json` bleibt unverändert" war korrekt, der Test musste sich anpassen.
- **46 statt 34+9 portierte Dateien:** Leichte Diskrepanz zur Planlistung. Kein Befund — kein Clobber, Akzeptanzkriterien erfüllt.

---

## 3. Plan-Härtungs-Bewertung

Die im Plan-Härtungsschritt eingearbeiteten Punkte haben sich bewährt:

- **Schritt 0 (Epic-Sicherung):** Kritisch. Ohne den Vorab-Commit wäre die Epic-Doku (ADR-027, Phase-0-Plan, Pre-Mortems) ausschließlich im Stash gewesen — bei `stash pop`-Fehler verloren. Schritt hat gegriffen.
- **Kein manuelles Mergen (Schritt 4):** Korrekt. Die Vereinfachung des Schrittes hat kein falsches Vertrauen erzeugt; feature hatte tatsächlich 0 Commits.
- **Clobber-Prüfung:** Die pre-Ausführungs-Verifikation (`git diff --quiet 7c55973 feature -- <doc-pfade>`) war nicht nötig, weil die Bedingung bei Ausführung noch galt. Sicherheitsnetz hat gepasst.

---

## 4. Aktueller Branch-Stand

| Branch | Status |
|--------|--------|
| `kunde/39-gs` | Commits + Medien + Working Tree wie vor Port; Epic-Doku jetzt zusätzlich committet (`6bdb951`) |
| `feature/mpz-studio-ui-design-refactor` | +1 Commit lokal (`3f726c6`), nicht gepusht |
| `main` | unberührt |

---

## 5. Offene Punkte (Übergabe)

- **Push auf `feature`:** Offene Frage 1 aus dem Plan — noch nicht entschieden, kein Teil dieses Ports.
- **`validate:coach` / `welcome-hub.wav`:** Altschuld auf `feature`; zugehöriges Post-Mortem #210. Vor PR gegen `main` zu lösen.
- **Phase 0 (#227):** Jetzt dran — `phase_0_issue_227_739f87c0.plan.md`.

## Fazit

Port sauber, vollständig, plankonform. Alle Tests grün. Kein Scope-Creep, kein Datenverlust, `kunde/39-gs` unverändert zurückgegeben. Abnahmefähig.
