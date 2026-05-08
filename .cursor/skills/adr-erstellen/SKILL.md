---
name: adr-erstellen
description: >-
  Erstellt und pflegt Architecture Decision Records (ADRs) für den Schulnavigator
  nach dem projekteigenen Format und Workflow. Aktiviert bei: ADR erstellen,
  Architekturentscheidung dokumentieren, technische Entscheidung festhalten,
  neuen ADR anlegen, ADR-Vorlage, dokumentation/adr, Entscheidung dokumentieren.
---

# ADR erstellen – Schulnavigator

Dieser Skill steuert das Anlegen und Pflegen von Architecture Decision Records
im Schulnavigator-Projekt nach dem Workflow aus `CLAUDE.md`.

## Dateiformat

- **Ablageort:** `dokumentation/adr/`
- **Dateiname:** `NNN-kebab-case-titel.md` (fortlaufend nummeriert)
- **Vorlage:** `dokumentation/adr/000-template.md`
- **Sprache:** Deutsch

## Pflichtfelder

```
# ADR-NNN — [Titel]

**Datum:** YYYY-MM-DD
**Status:** offen / entschieden / verworfen / ersetzt durch ADR-YYY

## Kontext
## Entscheidung
## Begründung
## Verworfene Alternativen
## Konsequenzen
```

## Workflow

1. Dateien in `dokumentation/adr/` prüfen → nächste freie Nummer bestimmen
2. Neue Datei `NNN-kebab-case-titel.md` auf Basis von `000-template.md` anlegen
3. Alle Pflichtfelder ausfüllen
4. Eintrag in `dokumentation/entscheidungen.md` ergänzen:

```
| [NNN](./adr/NNN-titel.md) | Titel | Status | YYYY-MM-DD |
```

## Regeln

- Entschiedene ADRs **niemals überschreiben**
- Änderungsbedarf → neuen ADR anlegen, alten mit `**Status:** ersetzt durch ADR-NNN` markieren
- Status-Werte: `offen` → `entschieden` → `ersetzt durch ADR-NNN` oder `verworfen`
