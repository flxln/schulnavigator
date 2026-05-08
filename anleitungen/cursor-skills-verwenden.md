# Cursor-Skills verwenden

Diese Anleitung erklärt, wie Skills im Cursor-Agenten-Chat aufgerufen und
sinnvoll eingesetzt werden – sowohl die projektspezifischen Skills des
Schulnavigators als auch globale Skills.

---

## Voraussetzungen

- Cursor ist installiert (Version 2.0 oder neuer)
- Das Schulnavigator-Projekt ist in Cursor geöffnet
- Mindestens ein Skill ist vorhanden (z. B. `adr-erstellen` unter
  `.cursor/skills/`)

---

## Was sind Skills und warum sind sie nützlich?

Ein **Skill** ist eine Markdown-Datei, die dem Agenten erklärt, wie er bei
einer bestimmten Aufgabe vorgehen soll. Der Agent kennt damit projektspezifische
Konventionen, Workflows und Templates, die sonst jedes Mal neu erklärt werden
müssten.

Es gibt zwei Auslösemechanismen:

| Modus | Beschreibung |
|-------|-------------|
| **Automatisch** | Der Agent erkennt anhand der Beschreibung, wann ein Skill relevant ist, und lädt ihn ohne Aufforderung |
| **Manuell** | Der Skill wird explizit per `/skill-name` aufgerufen |

---

## Schritt 1 — Verfügbare Skills prüfen

Bevor Skills verwendet werden, sollte bekannt sein, welche aktiv sind.

1. Cursor-Einstellungen öffnen: **Cmd + Shift + J**
2. Menüpunkt **Rules** wählen
3. Abschnitt **Agent Decides** aufklappen

Dort erscheinen alle erkannten Skills mit Name und Beschreibung. Skills aus
`.cursor/skills/` (Projekt) und `~/.cursor/skills/` (global) werden gemeinsam
angezeigt.

**Hinweis:** Erscheint ein neu angelegter Skill nicht in der Liste, Cursor
einmal neu starten – Skills werden nur beim Start eingelesen.

---

## Schritt 2 — Skill automatisch auslösen

Der Standardweg: einfach schreiben, was getan werden soll. Cursor entscheidet
selbst, ob ein Skill passt.

**Beispiele für automatische Auslösung des `adr-erstellen`-Skills:**

```
Erstelle einen ADR für die Entscheidung, Next.js als Frontend-Framework
einzusetzen.
```

```
Wir haben uns für Payload CMS entschieden. Bitte dokumentiere das als
Architekturentscheidung.
```

```
Ich brauche einen neuen ADR: Video-Hosting via YouTube-Embeds.
```

Der Agent liest dabei die `SKILL.md` und folgt dem projektspezifischen Workflow
– er legt die Datei in `dokumentation/adr/` an, wählt die nächste freie Nummer
und aktualisiert `dokumentation/entscheidungen.md`.

---

## Schritt 3 — Skill manuell aufrufen

Wird der Skill nicht automatisch erkannt oder soll er gezielt erzwungen werden,
lässt er sich direkt ansprechen:

1. Im Agenten-Chat **`/`** (Schrägstrich) eingeben
2. Den Skill-Namen eintippen, z. B. `adr-erstellen`
3. Skill in der erscheinenden Liste auswählen und **Enter** drücken
4. Danach die eigentliche Aufgabe beschreiben

```
/adr-erstellen Dokumentiere die Entscheidung für PostgreSQL als Datenbank.
```

**Wann manueller Aufruf sinnvoll ist:**

- Die Anfrage ist unspezifisch und der Agent würde den Skill nicht selbst
  erkennen
- Ein Skill mit `disable-model-invocation: true` ist konfiguriert (solche
  Skills aktivieren sich grundsätzlich nur manuell)
- Der Skill soll unabhängig vom Gesprächskontext angewendet werden

---

## Schritt 4 — Prüfen, ob ein Skill aktiv war

Nach jeder Antwort zeigt Cursor im Chat-Verlauf an, welche Kontextquellen
verwendet wurden – darunter auch aktive Skills.

**So erkennst du einen aktiven Skill:**

- Im Antwortbereich erscheint ein kleiner Badge oder Hinweis auf den
  Skill-Namen (abhängig von der Cursor-Version)
- Der Agent folgt dem in der `SKILL.md` definierten Workflow, statt frei zu
  improvisieren

Wurde der falsche Skill ausgelöst oder keiner, obwohl einer passend wäre:
→ Anfrage präziser formulieren (Stichworte aus dem `description`-Feld nutzen)
→ Skill manuell per `/skill-name` aufrufen

---

## Schritt 5 — Projektspezifische Skills vs. globale Skills

Im Schulnavigator gibt es zwei Ebenen:

| Ebene | Pfad | Gilt für |
|-------|------|----------|
| **Projektweit** | `schulnavigator/.cursor/skills/` | Nur dieses Projekt |
| **Global** | `~/.cursor/skills/` | Alle Projekte auf diesem Rechner |

Projektspezifische Skills überschreiben keine globalen, beide sind gleichzeitig
aktiv. Haben zwei Skills ähnliche Beschreibungen, gewinnt derjenige, dessen
Beschreibung besser zur Anfrage passt.

**Aktuell verfügbare Skills im Schulnavigator-Projekt:**

| Skill | Auslöser |
|-------|---------|
| `adr-erstellen` | „ADR erstellen", „Architekturentscheidung dokumentieren", „neuen ADR anlegen" |

Globale Skills (unter `~/.cursor/skills/`) sind in den Cursor-Einstellungen
unter **Rules** ebenfalls sichtbar.

---

## Schritt 6 — Grenzen von Skills kennen

Skills verbessern die Qualität und Konsistenz von Agentenantworten, haben aber
Grenzen:

- **Kein Automatismus ohne Kontext:** Hat der Agent zu wenig Kontext (z. B.
  kurze Anfrage ohne Projekt-Bezug), erkennt er den passenden Skill
  möglicherweise nicht.
- **Kein Ersatz für Wissen:** Der Agent muss das Projekt kennen. Bei neuer
  Sitzung kurz den Kontext nennen, falls nötig.
- **Keine Ausführungsgarantie:** Zeigt der Agent unerwartetes Verhalten, lohnt
  es sich, in der `SKILL.md` zu prüfen, ob der Workflow klar genug beschrieben
  ist.

**Tipp:** Für wiederkehrende Aufgaben den genauen Auslöser-Wortlaut in der
Beschreibung des Skills nachschlagen (`description`-Feld in der `SKILL.md`)
und diesen in der Anfrage verwenden.

---

## Referenz: Skill-Dateien im Projekt

| Datei | Zweck |
|-------|-------|
| `.cursor/skills/adr-erstellen/SKILL.md` | ADR-Erstellung und -Pflege |
| `anleitungen/cursor-skill-adr-erstellen.md` | Anleitung: Neuen Skill anlegen |
| `anleitungen/cursor-skills-verwenden.md` | Diese Datei |

Weitere Infos zum Skill-Format: [cursor.com/docs/skills](https://cursor.com/docs/skills)
