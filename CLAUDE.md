# CLAUDE.md — Schulnavigator

Dieses Dokument beschreibt Projektstruktur, Arbeitsweise und Konventionen für Coding-Agenten, die am Schulnavigator arbeiten.

---

## Was ist der Schulnavigator?

Eine Web-App für Schulen. Besucher eines Tags der offenen Tür scannen QR-Codes an Zimmern und sehen dort Multimedia-Inhalte (Texte, Bilder, Videos). **MVP:** Content als JSON im Repo (MPZ pflegt). **Langfrist:** Lehrkräfte pflegen über **Directus** — kein Custom-Admin (ADR-003).

---

## Projektphasen

Das Projekt befindet sich aktuell in der **Konzeptphase** (`1_ideen/`). Vor Entwicklungsstart müssen das Auftraggebергespräch geführt und die offenen technischen Entscheidungen getroffen sein.

Sobald die Entwicklung beginnt, zieht das Projekt nach `2_in-arbeit/schulnavigator/`.

---

## Verzeichnisstruktur

```
schulnavigator/
├── CLAUDE.md                          ← diese Datei
│
├── auftraggeber/
│   ├── auftraggeber-gespraech.md      # Fragenliste fürs Gespräch mit Schule
│   └── antworten.md                   # Ausgefüllt nach dem Gespräch
│
├── dokumentation/
│   ├── technische-fragen.md           # Offene techn. Fragen (intern)
│   ├── architektur.md                 # Tech-Stack, URL-Schema, Datenmodell
│   ├── dsgvo.md                       # Datenschutzkonzept
│   ├── entscheidungen.md              # ADR-Index (Übersichtstabelle + Konventionen)
│   └── adr/
│       ├── 000-template.md            # Vorlage für neue ADRs
│       └── 001-hosting-coolify.md     # Entschiedene ADRs, fortlaufend nummeriert
│
├── protokolle/                        # Gesprächsprotokolle (YYYY-MM-DD-thema.md)
│
├── prompts/
│   ├── system-prompt.md               # Haupt-System-Prompt für Coding-Agenten
│   ├── code-konventionen.md           # Was beim Coden zu beachten ist
│   └── content-generierung.md        # Prompts zur KI-gestützten Inhaltserstellung
│
├── anleitungen/
│   ├── fuer-lehrkraefte.md            # Directus / Content-Pflege für Lehrkräfte
│   ├── qr-codes-drucken.md            # QR-Codes exportieren & drucken
│   └── fuer-entwickler.md             # Setup, Deploy, Wartung
│
└── app/                               # Der eigentliche Anwendungscode
    ├── src/
    ├── public/
    └── Dockerfile
```

---

## Bekannte Architekturentscheidungen

| ADR | Entscheidung | Status |
|---|---|---|
| [001](./dokumentation/adr/001-hosting-coolify.md) | Hosting: MPZ-Hetzner-Server via Coolify, Docker | entschieden |
| [002](./dokumentation/adr/002-frontend-nextjs.md) | Frontend: Next.js (App Router), Tailwind | entschieden |
| [003](./dokumentation/adr/003-content-mvp-json-directus.md) | Content: JSON (MVP), Directus; kein Custom-Admin | entschieden |
| [004](./dokumentation/adr/004-video-hosting-mpz.md) | Video: MPZ-Server; YouTube optional nach Rechtsklärung | entschieden |
| [005](./dokumentation/adr/005-zugangskontrolle-token.md) | Zugang: Entry-Token, fest/heft, In-App-Scanner | entschieden |

Vollständiger ADR-Index: [`dokumentation/entscheidungen.md`](./dokumentation/entscheidungen.md)

---

## Offene Entscheidungen (vor Entwicklungsstart zu klären)

Alle noch offenen technischen Fragen stehen in [`dokumentation/technische-fragen.md`](./dokumentation/technische-fragen.md). Die wichtigsten:

- YouTube-Freigabe (Recht/DSB) — vor Nutzung von Embed, siehe ADR-004
- Directus-Rollen und Mandantenfähigkeit (bei Skalierung auf weitere Schulen)

---

## Deployment-Anforderungen (bereits entschieden)

Die App **muss** ein `Dockerfile` enthalten:

- Multi-stage Build (Build + schlankes Runtime-Image)
- Port via Umgebungsvariable (`PORT`)
- Health-Check-Endpunkt: `GET /api/health` → `200 OK`

---

## ADR-Workflow

Neue Architekturentscheidungen werden so dokumentiert:

1. `dokumentation/adr/000-template.md` kopieren
2. Fortlaufend nummerieren: `NNN-kebab-case-titel.md`
3. Eintrag in `dokumentation/entscheidungen.md` (Tabelle) ergänzen
4. Entschiedene ADRs **nicht überschreiben** — bei Änderungen neuen ADR erstellen, alten mit `ersetzt durch ADR-NNN` markieren

---

## Konventionen (Platzhalter — wird bei Entwicklungsstart befüllt)

Detaillierte Code-Konventionen: [`prompts/code-konventionen.md`](./prompts/code-konventionen.md)

Kurzfassung (vorläufig):
- TypeScript strict, kein `any`
- Dateinamen: `kebab-case`
- Komponenten: `PascalCase`
- Keine Kommentare, die nur beschreiben was der Code tut

---

## Wichtige Dokumente für den Einstieg

| Zweck | Datei |
|---|---|
| Was muss mit Auftraggebern geklärt werden? | `auftraggeber/auftraggeber-gespraech.md` |
| Was ist technisch noch offen? | `dokumentation/technische-fragen.md` |
| Welche Entscheidungen wurden bereits getroffen? | `dokumentation/entscheidungen.md` |
| Wie wird deployed? | `dokumentation/adr/001-hosting-coolify.md` |
