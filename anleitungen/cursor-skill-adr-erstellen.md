# Projektspezifischen Cursor-Skill für ADR-Dokumentation erstellen

Diese Anleitung erklärt, wie ein maßgeschneiderter Cursor-Skill erstellt wird,
der den ADR-Prozess (Architecture Decision Records) des Schulnavigator-Projekts
kennt und Coding-Agenten automatisch bei der ADR-Erstellung unterstützt.

---

## Voraussetzungen

- Cursor ist installiert und geöffnet
- Das Schulnavigator-Projekt ist in Cursor geöffnet
- Grundkenntnisse in Markdown (kein Code nötig)
- Die Datei `dokumentation/adr/000-template.md` existiert im Projekt

---

## Was ist ein Cursor-Skill?

Ein **Cursor-Skill** ist eine Textdatei (`SKILL.md`), die dem KI-Agenten erklärt,
wann und wie er bei einer bestimmten Aufgabe vorgehen soll. Der Agent liest die
Datei automatisch, sobald er erkennt, dass die Aufgabe zum Skill passt – zum
Beispiel beim Stichwort „ADR erstellen" oder „Architekturentscheidung dokumentieren".

Skills, die im Projektordner liegen (unter `.cursor/skills/`), gelten **nur für
dieses Projekt** und können ins Git-Repository eingecheckt werden.

---

## Schritt-für-Schritt-Anleitung

### Schritt 1 — Skill-Ordner anlegen

Erstelle im Projektstamm folgenden Ordnerpfad:

```
schulnavigator/
└── .cursor/
    └── skills/
        └── adr-erstellen/
```

Der Ordner `.cursor/` ist ein versteckter Konfigurationsordner von Cursor (ähnlich
wie `.git/` für Git). Der Unterordner `skills/` enthält alle projektspezifischen
Skills. Der Name `adr-erstellen/` ist der Bezeichner des Skills – er muss mit dem
`name`-Feld in der `SKILL.md` übereinstimmen.

**Wichtig:** Das führende `.` (Punkt) im Ordnernamen `.cursor` macht den Ordner auf
macOS/Linux standardmäßig unsichtbar. In Cursor und im Terminal ist er trotzdem
zugänglich.

Im Terminal:

```bash
mkdir -p .cursor/skills/adr-erstellen
```

Der Parameter `-p` erstellt alle fehlenden Eltern-Ordner in einem Schritt.

---

### Schritt 2 — `SKILL.md` anlegen

Erstelle die Datei `.cursor/skills/adr-erstellen/SKILL.md` mit folgendem Inhalt:

```markdown
---
name: adr-erstellen
description: >-
  Erstellt und pflegt Architecture Decision Records (ADRs) für den Schulnavigator
  nach dem projekteigenen Format. Aktiviert bei: ADR erstellen, Architekturentscheidung
  dokumentieren, technische Entscheidung festhalten, neuen ADR anlegen, ADR-Vorlage,
  dokumentation/adr.
---

# ADR erstellen – Schulnavigator

Dieser Skill steuert das Anlegen und Pflegen von Architecture Decision Records (ADRs)
im Schulnavigator-Projekt nach dem definierten Workflow aus `CLAUDE.md`.

## Wann dieser Skill aktiv wird

- Eine neue Architekturentscheidung soll dokumentiert werden
- Ein bestehender ADR soll als „ersetzt" markiert werden
- Der ADR-Index in `dokumentation/entscheidungen.md` soll aktualisiert werden

## Projektspezifisches ADR-Format

Alle ADRs liegen unter `dokumentation/adr/` und folgen dem Schema:

- **Dateiname:** `NNN-kebab-case-titel.md` (fortlaufend nummeriert, z. B. `002-frontend-framework.md`)
- **Vorlage:** `dokumentation/adr/000-template.md`
- **Sprache:** Deutsch
- **Status-Werte:** `offen` → `entschieden` → `ersetzt durch ADR-NNN` oder `verworfen`

## Pflichtfelder jedes ADRs

| Feld | Inhalt |
|------|--------|
| Titel-Zeile | `# ADR-NNN — [Titel]` |
| Datum | `**Datum:** YYYY-MM-DD` |
| Status | `**Status:** offen / entschieden / verworfen / ersetzt durch ADR-YYY` |
| Kontext | Warum muss entschieden werden? |
| Entscheidung | Was wird konkret entschieden? |
| Begründung | Argumente für die Entscheidung |
| Verworfene Alternativen | Andere Optionen mit Ablehnungsgrund |
| Konsequenzen | Auswirkung auf Architektur und Betrieb |

## Workflow (Schritt für Schritt)

1. Nächste freie Nummer bestimmen: Dateien in `dokumentation/adr/` prüfen
2. `dokumentation/adr/000-template.md` als Basis verwenden
3. Neue Datei als `NNN-kebab-case-titel.md` in `dokumentation/adr/` anlegen
4. Alle Pflichtfelder ausfüllen
5. Eintrag in `dokumentation/entscheidungen.md` (Tabelle) ergänzen:
   `| [NNN](./adr/NNN-titel.md) | Titel | Status | YYYY-MM-DD |`
6. Entschiedene ADRs **niemals überschreiben** – bei Änderungsbedarf neuen ADR anlegen
   und alten mit `ersetzt durch ADR-NNN` markieren

## Beispiel-Prompt für den Agenten

> „Erstelle einen ADR für die Entscheidung, Next.js als Frontend-Framework zu verwenden."

Der Agent führt dann automatisch den vollständigen Workflow aus.
```

---

### Schritt 3 — Skill in Cursor prüfen

1. Öffne Cursor-Einstellungen mit **Cmd + Shift + J**
2. Navigiere zu **Rules**
3. Im Abschnitt **Agent Decides** sollte `adr-erstellen` erscheinen

Ist der Skill dort nicht sichtbar, Cursor neu starten (der Skill-Ordner wird beim
Start eingelesen).

---

### Schritt 4 — Skill testen

Öffne im Agenten-Chat ein neues Gespräch und schreibe:

```
Erstelle einen ADR für die Entscheidung, Next.js als Frontend-Framework einzusetzen.
```

Der Agent sollte daraufhin:
- die nächste freie ADR-Nummer bestimmen (aktuell `002`)
- eine Datei `dokumentation/adr/002-frontend-framework.md` anlegen
- die Tabelle in `dokumentation/entscheidungen.md` aktualisieren

**Hinweis:** Cursor zeigt im Chat an, welche Skills er für eine Aufgabe aktiviert hat.
Erscheint `adr-erstellen` dort, funktioniert der Skill korrekt.

---

### Schritt 5 — Skill ins Git-Repository einchecken

Da der Skill unter `.cursor/skills/` liegt und projektspezifisch ist, sollte er
versioniert werden. Prüfe zuerst, ob `.cursor/` in `.gitignore` ausgeschlossen ist:

```bash
cat .gitignore
```

Ist `.cursor` dort eingetragen, den Eintrag entweder entfernen oder nur den
Skills-Unterordner explizit tracken:

```bash
# .gitignore: Eintrag hinzufügen, um Skills trotz .cursor-Ausschluss zu tracken
!.cursor/skills/
```

Anschließend einchecken:

```bash
git add .cursor/skills/adr-erstellen/SKILL.md
git commit -m "Projektspezifischen ADR-Skill für Cursor hinzugefügt"
```

---

## Ergebnis

Nach dieser Anleitung ist folgendes vorhanden:

```
schulnavigator/
└── .cursor/
    └── skills/
        └── adr-erstellen/
            └── SKILL.md
```

Der Agent kennt jetzt:
- den projekteigenen ADR-Workflow aus `CLAUDE.md`
- das Dateinamenschema (`NNN-kebab-case-titel.md`)
- die Pflichtfelder aus `000-template.md`
- die Regel, ADRs nie zu überschreiben
- den Pflegeprozess für `dokumentation/entscheidungen.md`

---

## Skill erweitern

Soll der Skill später weitere Fähigkeiten erhalten (z. B. Deprecation-Workflow,
RFC-Stil), kann die `SKILL.md` jederzeit ergänzt werden. Optional kann ein
Unterordner `references/` mit der Vorlage verknüpft werden:

```
adr-erstellen/
├── SKILL.md
└── references/
    └── 000-template.md   ← Kopie oder Symlink der Projektvorlage
```

Weitere Infos zum Skill-Format: [cursor.com/docs/skills](https://cursor.com/docs/skills)
