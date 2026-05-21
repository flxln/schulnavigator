# Schulnavigator

Eine Web-App für Schulen, die Besuchern eines Tags der offenen Tür an QR-Code-Stationen Multimedia-Inhalte zu einzelnen Räumen zugänglich macht — als geführter Rundgang oder freie Erkundung.

## Idee

Besucher scannen QR-Codes, die an Türen und Räumen angebracht sind, und sehen dort von Schülerinnen und Schülern erstellte Inhalte: kurze Audioaufnahmen, Videos, Fotos oder Texte. Eine optionale Gamification-Ebene (Stempel-System) macht den Rundgang interaktiv. Langfristig pflegen Lehrkräfte Inhalte über **Directus** (Headless CMS) — ohne technisches Vorwissen.

## Funktionen

- **Stationsseiten** — Jede Station hat eine eigene Seite mit Raumbild, Beschreibung und Medien (Audio, Video, Foto, Text)
- **Startseite mit Schulhaus-Übersicht** — Schematische Darstellung aller Stationen auf einen Blick
- **Stempel-System** — Besuchte Stationen werden markiert, Abschluss-Animation bei vollständigem Rundgang
- **Zugangskontrolle** — Entry-QR (Eingang/Heft); Modi _fest_ (Scan-Rundgang) und _heft_ (Stations-Hub); In-App-Scanner für Raum-QRs ([ADR-005](dokumentation/adr/005-zugangskontrolle-token.md))
- **Mehrsprachigkeit** — UI-Texte in Deutsch und Englisch (Content bleibt in der Originalsprache)
- **Content-Pflege (Directus)** — Stationen und Medien durch Lehrkräfte (Phase 5, nach Schulfest)

## Tech-Stack

| Bereich        | Technologie                                           |
| -------------- | ----------------------------------------------------- |
| Frontend       | Next.js (App Router), TypeScript strict, Tailwind CSS |
| Hosting        | Docker (Multi-stage Build), Coolify                   |
| Content (MVP)  | JSON im Repo                                          |
| Content (Ziel) | Directus (self-hosted)                                |
| Sprache        | Deutsch / Englisch                                    |

## Projektstruktur

```
schulnavigator/
├── app/                        # Next.js (npm-Projektroot, Issue #9)
│   ├── app/                    # App Router (Routen: page.tsx, layout.tsx, …)
│   ├── components/             # React-Komponenten
│   ├── data/                   # stations.json (Phase 1, #12)
│   ├── lib/                    # Hilfsfunktionen, Typen
│   ├── public/                 # Statische Assets (stations/, qr/)
│   ├── package.json
│   ├── Dockerfile              # folgt in Phase 1 (#10)
│   └── …
├── auftraggeber/               # Gesprächsgrundlagen und Antworten
├── anleitungen/                # Für Lehrkräfte, Entwickler, QR-Druck
├── dokumentation/
│   ├── adr/                    # Architecture Decision Records
│   ├── github-project/         # Issues, Milestones, Labels (Quelldaten)
│   ├── architektur.md
│   ├── dsgvo.md
│   ├── entscheidungen.md
│   └── projektplan.md
├── prompts/                    # System-Prompts für Coding-Agenten
├── protokolle/                 # Gesprächsprotokolle und Analysen
└── CLAUDE.md                   # Projektkonventionen für KI-Agenten
```

## Deployment

Die App erfordert ein `Dockerfile` mit:

- Multi-stage Build (Build + schlankes Runtime-Image)
- Port über Umgebungsvariable `PORT`
- Health-Check-Endpunkt: `GET /api/health` → `200 OK`

## Projektplan

Das Projekt ist in 6 Phasen aufgeteilt — von Architektur-Entscheidungen bis zum Live-Betrieb und der Erweiterung auf weitere Schulen. Details im [GitHub Project](https://github.com/flxln/schulnavigator/projects) und in [`dokumentation/projektplan.md`](./dokumentation/projektplan.md).

## Datenschutz

Die App wird als Auftragsverarbeitungsverhältnis betrieben. Alle Daten verbleiben auf Servern in Deutschland. Schülerinhalte werden nur mit entsprechender Einverständniserklärung verwendet und können nicht heruntergeladen werden. Details: [`dokumentation/dsgvo.md`](./dokumentation/dsgvo.md).

## Lizenz

Dieses Projekt ist nicht öffentlich lizenziert. Alle Rechte vorbehalten.
