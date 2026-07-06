# Prompt: Directus #47 — Epic & Issue-Schnitt (Planung, kein Produktionscode)

> **Verwendung:** Auftrag an Fable 5 im Cursor-Workspace mit beiden Repos
> (`schulnavigator` + `wissen-ki-und-mehr`). Arbeitsverzeichnis: Repo-Root `schulnavigator/`.
> Erstellt 2026-07-06 nach Council-Review; ersetzt den ersten Prompt-Entwurf.

---

Du bist Tech-Lead und zerlegst das Vorhaben **„Directus #47 — Lehrkräfte-CMS nach ADR-003“**
in umsetzbare GitHub-Artefakte. Noch kein Produktionscode — Deliverables sind Dateien im Repo
und Issue-Texte. Arbeite autonom bis alle Deliverables liegen; brich nur ab, wenn eine
Pflicht-Quelle fehlt und sich nicht ersetzen lässt — dann benenne die Lücke, statt zu raten.

## Verbindliche Quellen (zuerst lesen; unabhängige Reads parallelisieren)

| Quelle | Was daraus zu entnehmen ist |
|---|---|
| `dokumentation/reviews/council-directus-planung-2026-07-06.md` | Chairman-Empfehlung (Adoption-First, Spike), DoD-Formel „2 Lehrkräfte, 1 Raum, ohne Felix“, Gate 9 |
| `dokumentation/adr/003-content-mvp-json-directus.md` | Grundentscheidung, Abgrenzung „kein Custom-Admin“ |
| `dokumentation/spezifikationen/directus-auth-konzept.md` | **Gates 1–8 inkl. aktuellem Gate-Stand im Kopf der Datei** (Stand 2026-07-06: 1–3 ✅, 4–8 offen), Auth-Anforderungen, Hosting |
| `dokumentation/reviews/pre-mortem/audit-phase-5-2026-07-04.md` | Abschnitt „Abhängigkeiten vor Directus (#47)“, Befund S1 (Media-Gate) |
| `dokumentation/planung/offen.md` | Aktueller Stand #47 und Nachbar-Issues |
| `dokumentation/planung/labels.md` | **Einzige gültige Label-Quelle** (`tech`, `design`, `content`, `org`, `blocker`) |
| `dokumentation/planung/archiv/epics/epic-mpz-studio.md` | Format-Vorlage für das Epic (Übersichtstabelle, Ziel, Leitplanken, Scope, Risiken, Checkliste) |
| `dokumentation/content/verzeichnisstruktur.md` | Content-Pfade/Slugs — Basis für Migrationsstrategie JSON ↔ Directus |
| `app/lib/stations.ts`, `app/data/` | Ist-Datenpfad (Build-time vs. Runtime) |
| `app/app/media/[...path]/route.ts` | Cookie-Gate der Medienauslieferung — Directus-Asset-URLs dürfen es nicht umgehen |
| `/Users/felixlein/Projekte/wissen-ki-und-mehr/00_Meta/Runbook_Agentic_Projekte/03b_issue-triage.md` | Triage-Logik für Pipeline-Stufen (DIREKT / LIGHT / VOLL) |

**Fallback Triage:** Ist `03b_issue-triage.md` im Workspace nicht lesbar, lass die
Pipeline-Stufen-Spalte leer und vermerke das als offenen Punkt — Stufen **nicht** erfinden.

## Verifizieren statt annehmen

- **Gate-Stand** aus dem Kopf des Auth-Konzepts übernehmen; bei Widerspruch zu anderen Quellen beides nennen.
- **Gate 8 (Branch-Konsolidierung):** tatsächlichen Stand per Git prüfen, nicht aus Doku abschreiben.
  Legal-/DSGVO-Dateien liegen (Stand Anfang Juli 2026) nur auf `kunde/39-gs`, nicht auf `main`;
  das Auth-Konzept nennt zusätzlich `feature/mpz-studio`. Prüfen mit:
  `git branch -a`, `git log main..kunde/39-gs --oneline`, `git show kunde/39-gs:<pfad>`.
  Ergebnis als Gate-8-Status ins Epic schreiben.
- Jede Aussage über Code (Datenlader, Media-Gate, stations.json) nur nach gelesener Datei.

## Harte Constraints

- Docker-Build-Kontext ist nur `app/` (`dokumentation/build-kontext-submodule-regeln.md`) — gilt auch für jede Directus-Anbindung.
- Kein Lehrkräfte-Login vor erfüllten Gates 1–8 (Auth-Konzept).
- Chairman-Empfehlung ist bindend: **Adoption-First, technischer Spike vor Full-Migration.**
- MPZ Studio bleibt Dev-only (ADR-022) — kein Ersatz für Directus, keine Vermischung.
- Medien müssen hinter dem Entry-Cookie-Gate bleiben (Audit-Befund S1) — Storage-Entscheidung muss das berücksichtigen.

## Aufgaben

1. **Programm-Entscheidungen** als offene Punkte + empfohlene ADR-Themen formulieren — nicht selbst entscheiden:
   - Runtime-Datenpfad (Build-time JSON vs. API-Fetch vs. Webhook-Rebuild)
   - Migrationsstrategie (JSON ↔ Directus, Content-Freeze ja/nein/wann)
   - Medien-Storage (`public/` vs. Object Storage vs. Directus-Assets) — inkl. Gate-Kompatibilität
   - Messbare DoD für #47 — Ausgangspunkt ist die Council-Formel „2 Lehrkräfte pflegen 1 Raum ohne Felix“, nicht „Directus live“

2. **Epic-Dokument** anlegen: `dokumentation/planung/epics/epic-directus.md` (Ordner anlegen —
   aktive Planung lebt unter `planung/`, erst nach Abschluss wandert sie nach `planung/archiv/epics/`)
   - Format wie `epic-mpz-studio.md`: Übersichtstabelle, Ziel, Leitplanken, Scope-Abgrenzung, Risiken, Checkliste
   - Die **Übersichtstabelle ist zugleich die Tabelle „vorgeschlagene Issues“** — keine separate Tabelle im Chat
   - Abhängigkeiten: Gates 1–8 mit aktuellem Status + optional Gate 9 „Champion benannt“ (Council)

3. **Issue-Schnitt** (Parent + Unterissues), pro Issue:
   - Ziel (1 Absatz)
   - Akzeptanzkriterien (prüfbar, Checkboxen)
   - Blockiert durch / Parent
   - Labels **nur aus `labels.md`**; erscheint ein neues Label (z. B. `dsgvo`) sinnvoll, als Vorschlag kennzeichnen, nicht als existierend verwenden
   - Pipeline-Stufe (DIREKT / LIGHT / VOLL) nach Triage-Logik (siehe Quellen + Fallback)
   - Explizit markieren, welches Issue der **Spike** ist: eine Station end-to-end (Directus → Next.js → Prod-Deploy)

4. **Roadmap** als nummerierte Reihenfolge: **Gates → Spike → Pilot → Lehrkräfte-Onboarding.**
   Pro Schritt zwei Pflichtangaben:
   - „**Erledigt wenn:** <prüfbares Kriterium>“
   - „**Zuständig:** MPZ/Felix | Schule | DSB“ — mehrere Gates sind organisatorisch, nicht technisch

5. **GitHub-Issue-Bodies** als je eine Markdown-Datei unter `dokumentation/planung/issues/`
   (Ordner anlegen), Namensschema `issue-directus-<slug>.md`, kompatibel mit
   `gh issue create --body-file`. **Keine `gh`-Aufrufe, kein Commit, kein Push** — Freigabe folgt separat.

## Verboten

- „Analog zu X“ ohne gelesenen Code
- Big-Bang-Migration aller Stationen im ersten Issue
- Fehlercodes, APIs, Labels oder Triage-Stufen erfinden
- Gates 4–8 überspringen oder als erledigt annehmen
- Entscheidungen aus Aufgabe 1 selbst treffen statt als offene Punkte auszuweisen

## Deliverables (Pflicht)

- `dokumentation/planung/epics/epic-directus.md`
- Issue-Body-Dateien unter `dokumentation/planung/issues/issue-directus-*.md`
- Optional: `dokumentation/spezifikationen/directus-implementierung.md` (Spec vor ADR), nur falls Aufgabe 1 dafür genug Substanz liefert
- **Abschlussmeldung** (letzte Nachricht, kein Reasoning-Narrativ):
  - Liste aller erzeugten Dateien mit Pfaden
  - 5 Bullets: wie die Chairman-Empfehlung umgesetzt wurde
  - 3 größte offene Fragen
