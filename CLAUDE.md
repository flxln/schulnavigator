# CLAUDE.md — Schulnavigator

Dieses Dokument beschreibt Projektstruktur, Arbeitsweise und Konventionen für Coding-Agenten, die am Schulnavigator arbeiten.

---

## Was ist der Schulnavigator?

Eine Web-App für Schulen. Besucher eines Tags der offenen Tür scannen QR-Codes an Zimmern und sehen dort Multimedia-Inhalte (Texte, Bilder, Videos). **MVP:** Content als JSON im Repo (MPZ pflegt). **Ab ADR-032:** MPZ Studio bekommt einen Produktionsmodus (Konten pro Person, Content-Volume, Medien hinter dem Cookie); erst MPZ, später benannte Lehrkräfte. Directus ist nicht mehr das Zielbild.

---

## Projektphasen

Das Projekt liegt unter `2_in-arbeit/schulnavigator/`. **Phase 0** (Architektur-ADRs) ist abgeschlossen; **Phase 1** (Foundation) umfasst **#9–#16** — siehe [`dokumentation/archiv/projektplan.md`](./dokumentation/archiv/projektplan.md). **Phase 2:** Raum-Viewer (**#55**/#56), GS39-UI (**#58**), Dialog Maskottchen (**#71**/#72), Medien-Player (**#18–#20**) + **TextViewer** (**#93**) — umgesetzt. **360°-Sphere-Viewer** (**#113**, Branch `feature/360-sphere-viewer`): PSV v5 + Gyro, Koexistenz Flat/Sphere per `viewer`-Flag ([ADR-018](./dokumentation/adr/018-360-sphere-viewer.md)), Pilot `musik` — umgesetzt. **Demo-Content:** **`klassenzimmer`** mit 4 Medien/Hotspots (`public/media/klassenzimmer/`). **Raumbilder:** **#27** geschlossen (8/11 Panorama in `public/stations/`); **#17** offen für `kunst`, `hort`, `schulsozialarbeit`. **Live:** `https://39-gs.mpz.schule` (Coolify, Branch `release/39-gs`, Auto-Deploy aus). **Demo:** `https://schulnavigator.mpz.schule` (Branch `main`, nur synthetische Daten, ADR-033). [`anleitungen/fuer-entwickler.md`](./anleitungen/fuer-entwickler.md).

**Git:** `main` ist der Stamm. Die Schule deployt von `release/39-gs` (nur bewusst verschieben). `kunde/39-gs` ist gelöscht (Tag `archiv/kunde-39-gs`). Regel: [`.cursor/rules/release-39-gs.mdc`](./.cursor/rules/release-39-gs.mdc), [ADR-028](./dokumentation/adr/028-main-und-release-39-gs.md).

---

## Verzeichnisstruktur

```
schulnavigator/
├── CLAUDE.md                          ← diese Datei
│
├── dokumentation/
│   ├── README.md                      # Landkarte der Doku
│   ├── technische-fragen.md           # Offene techn. Fragen (intern)
│   ├── architektur.md                 # Tech-Stack, URL-Schema, Datenmodell
│   ├── dsgvo.md                       # Datenschutzkonzept
│   ├── entscheidungen.md              # ADR-Index (Übersichtstabelle + Konventionen)
│   ├── build-kontext-submodule-regeln.md  # Docker nur app/; Submodule nicht einbinden (Agenten)
│   ├── adr/                           # Architecture Decision Records
│   ├── content/                       # Slugs, Pflege-Übersicht
│   ├── planung/                       # Issues, Milestones, offen.md
│   ├── spezifikationen/               # Feature-Specs (MPZ Studio)
│   ├── ideen/                         # Produktideen (offen / archiv)
│   ├── reviews/                       # Pre-/Post-Mortems
│   └── archiv/                        # Eingefrorener Projektplan, Meetings, Design
│
├── prompts/
│   ├── system-prompt.md               # Haupt-System-Prompt für Coding-Agenten
│   ├── code-konventionen.md           # Was beim Coden zu beachten ist
│   └── content-generierung.md        # Prompts zur KI-gestützten Inhaltserstellung
│
├── anleitungen/
│   ├── fuer-lehrkraefte.md            # Content-Pflege für Lehrkräfte (Stufe 2 ADR-032)
│   ├── qr-codes-drucken.md            # QR-Codes exportieren & drucken
│   ├── fuer-entwickler.md             # Setup, Deploy, Wartung
│   └── lokal-testen-und-anschauen.md  # Dev-Server, Testrouten, Build-Check
│
├── auftraggeber/                      # Submodule — Material/Doku, nicht im Docker-Image
├── protokolle/                        # Submodule — Protokolle, nicht in Build/Runtime
│
└── app/                               # Next.js (npm-Projektroot) = Docker-Build-Kontext
    ├── app/                           # App Router: `/`, `/scan`, `/raum/[slug]`, `api/health`; `gs39-tokens.css`
    ├── components/                    # u. a. `raum-viewer/`, `media/` (#18–#20), `raum-station-client.tsx`, `schoolhouse/` (#14)
    ├── data/
    ├── lib/                           # u. a. `stations.ts`, `school-theme.ts`, `raum-viewer/`, `schoolhouse-*.ts` (#14)
    ├── scripts/                       # u. a. `validate-tokens.mjs`, `reference/colors_and_type.css` (Docker)
    ├── public/
    ├── vitest.config.ts               # Unit-Tests (`npm run test`)
    ├── package.json
    ├── Dockerfile                     # Multi-Stage, Standalone (#10)
    └── .dockerignore
```

---

## Bekannte Architekturentscheidungen

| ADR                                                         | Entscheidung                                           | Status      |
| ----------------------------------------------------------- | ------------------------------------------------------ | ----------- |
| [001](./dokumentation/adr/001-hosting-coolify.md)           | Hosting: MPZ-VPS (IONOS) via Coolify, Docker        | entschieden |
| [002](./dokumentation/adr/002-frontend-nextjs.md)           | Frontend: Next.js (App Router), Tailwind               | entschieden |
| [003](./dokumentation/adr/003-content-mvp-json-directus.md) | Content: JSON (MVP); Directus-Zielbild ersetzt durch ADR-032 | teilweise ersetzt |
| [004](./dokumentation/adr/004-video-hosting-mpz.md)         | Video: MPZ-Server; YouTube optional nach Rechtsklärung | entschieden |
| [005](./dokumentation/adr/005-zugangskontrolle-token.md)    | Zugang: Entry-Token, fest/heft, In-App-Scanner         | entschieden |
| [006](./dokumentation/adr/006-raum-viewer-gyro-hotspots.md) | Raum-Viewer: Gyro (Standard), Hotspots, Tap-Fallback   | entschieden |
| [007](./dokumentation/adr/007-zugangskontrolle-cookie.md)   | Zugang: HttpOnly-Cookie + Middleware (ergänzt ADR-005) | entschieden |
| [008](./dokumentation/adr/008-eintritt-in-app-scanner.md)   | Eintritt: In-App-Scanner auf `/eintritt/scan` (ergänzt ADR-005; Shell mit `/scan`) | entschieden |
| [017](./dokumentation/adr/017-externe-medien-hotspot-marker.md) | Externe Medien (`link`, `embed`), Hotspot-Icons — Stufe 1–3 live (#98–#100, #109) ([Umsetzungsplan](./dokumentation/archiv/projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md)) | entschieden |
| [018](./dokumentation/adr/018-360-sphere-viewer.md)             | 360°-Sphere-Viewer (PSV v5) + Flat-Koexistenz per `viewer`-Flag; Gyro-Plugin; Spike Musikraum | entschieden |
| [019](./dokumentation/adr/019-coach-fortschritt-einblendung.md) | Coach-Einblendungen (fortschritts-getriggert, getrennt vom Dialog); Schwellwert-Trigger, `duo-split`, modus-getrennter Seen-State, Layer-Vertrag ([Plan](./.cursor/plans/archiv/2026-06/coach_sparkle_mvp_d9e82ce2.plan.md)) | entschieden |
| [022](./dokumentation/adr/022-mpz-studio-internes-ingest-tool.md) | MPZ Studio: internes Dev-only-Ingest-Tool (nur MPZ, nicht Lehrkräfte); Ausnahme/ergänzt ADR-003; `/mpz/*` nur `NODE_ENV=development`, Secret-Header, Validatoren nach Save ([Spec](./dokumentation/spezifikationen/mpz-studio.md)); Produktionsmodus → ADR-032 | entschieden |
| [028](./dokumentation/adr/028-main-und-release-39-gs.md) | `main` ist der Stamm; Schule deployt von `release/39-gs` (Auto-Deploy aus); Punkt 4 → ADR-033 | entschieden |
| [029](./dokumentation/adr/029-runtime-datenpfad-directus.md) | Runtime-Datenpfad Directus: Fetch + Data-Cache (Option b); Fallback `stations.json` | ersetzt durch ADR-032 |
| [032](./dokumentation/adr/032-mpz-studio-produktions-admin.md) | MPZ Studio als schmales Produktions-Admin statt Directus; CMS-Umfang (Undo, Entwürfe, Rollen, Mehrsprachigkeit) ausgeschlossen | entschieden |
| [033](./dokumentation/adr/033-demo-instanz-schulnavigator-mpz-schule.md) | `schulnavigator.mpz.schule` = Demo/Test (Branch `main`, nur synthetische Daten); `/data/schulnavigator/*` nur an der GS39-App | entschieden |

Vollständiger ADR-Index: [`dokumentation/entscheidungen.md`](./dokumentation/entscheidungen.md)

---

## Laufzeit & Docker — Submodule (Pflicht für Agenten)

Die Ordner **`auftraggeber/`** und **`protokolle/`** sind **Git-Submodule** (eigene Repos). Sie gehören **nicht** in Docker-Build oder Laufzeit der App.

- **Build-Kontext und Image:** nur [`app/`](./app/) (`COPY . .` im Dockerfile).
- **Verboten für Agenten:** Build-Skripte, Imports oder Deploy-Schritte, die `../auftraggeber` oder `../protokolle` zur Laufzeit voraussetzen — ohne kopierte Ressource unter `app/`.
- **Stattdessen:** benötigte Dateien nach `app/public/`, `app/data/`, `app/scripts/reference/` usw. **kopieren** und versionieren.

Vollständige Regeln, Ursache des Coolify-Fehlers (Mai 2026) und Checkliste: [`dokumentation/build-kontext-submodule-regeln.md`](./dokumentation/build-kontext-submodule-regeln.md).

---

## UI & Design-Tokens (GS39)

- Auftraggeber-Quelle: `auftraggeber/material/UI-Vorschläge/colors_and_type.css`
- App: `app/app/gs39-tokens.css` + semantische Tailwind-Klassen in `globals.css` (kein Dark Mode)
- Vor Build: `npm run validate:tokens` (auch in `npm run build`)
- Nach Änderung an der Auftraggeber-CSS: `gs39-tokens.css` anpassen und Referenzkopie `app/scripts/reference/colors_and_type.css` für Docker mitpflegen

Details: [`dokumentation/architektur.md`](./dokumentation/architektur.md) (Abschnitte UI & Raum-Viewer), [`anleitungen/lokal-testen-und-anschauen.md`](./anleitungen/lokal-testen-und-anschauen.md).

---

## Offene Entscheidungen (vor Entwicklungsstart zu klären)

Alle noch offenen technischen Fragen stehen in [`dokumentation/technische-fragen.md`](./dokumentation/technische-fragen.md). Die wichtigsten:

- YouTube-Freigabe (Recht/DSB) — vor Nutzung von Embed, siehe ADR-004
- Weitere Embed-Anbieter (Book Creator, H5P) — Domain + DSB; Workaround: `typ: link` (Book Creator Lesewelt: #128 erledigt)
- Lehrkräfte-Konten im Studio-Produktionsmodus: benannte Personen (#249), VVT/AVV (Stufe 2 ADR-032)

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

## Feature-Pipeline: Git-Ablauf (Team-Regel)

Gilt für alle im Team. Vollständige Regeln: `.cursor/rules/feature-pipeline-git.mdc` (Symlink aus `hilfreiche-tools`, Bootstrap 2. November 2026), Routing in [`dokumentation/planung/harness-inventar.md`](./dokumentation/planung/harness-inventar.md).

**Freigabe:** Auf dem Branch `<typ>/<nr>-<slug>` des bearbeiteten Issues sind Commit je Schritt, Push und Draft-PR dauerhaft freigegeben. **Nie:** auf `main` arbeiten, mergen, `--force`, Branches löschen.

1. Vor dem ersten Artefakt: `./scripts/pipeline-git start --issue <nr>`
2. Nach jedem Pipeline-Artefakt im selben Turn: `./scripts/pipeline-git commit --schritt <id>` (`triage`, `-1`, `0`, `1`, `2`, `3`, `direkt`, `4`, `5a`; sonst `--schritt frei --titel "…" --paths <dateien>`)
3. Bei Abschluss (5a): `./scripts/pipeline-git finish`

Exit 2: falscher Branch, erst `start`. Exit 3: Secret-Datei genannt, entfernen. Exit 4: Push abgelehnt, nicht erzwingen. Exit 5: `gh` fehlt, PR legt der Nutzer an.

`scripts/pipeline-git` ist ein lokaler Symlink auf `~/Projekte/hilfreiche-tools/bin/pipeline-git` und nicht getrackt. Neu anlegen: `ln -s ~/Projekte/hilfreiche-tools/bin/pipeline-git scripts/pipeline-git`.

---

## Konventionen (Platzhalter — wird bei Entwicklungsstart befüllt)

Detaillierte Code-Konventionen: [`prompts/code-konventionen.md`](./prompts/code-konventionen.md)

Kurzfassung (vorläufig):

- TypeScript strict, kein `any`
- Dateinamen: `kebab-case`
- Komponenten: `PascalCase`
- Keine Kommentare, die nur beschreiben was der Code tut
- **Vor jedem Edit: Datei zuerst lesen.** Vor dem Ändern einer Funktion: alle Aufrufer per grep suchen. Erst recherchieren, dann editieren.

---

## Wichtige Dokumente für den Einstieg

| Zweck                                           | Datei                                      |
| ----------------------------------------------- | ------------------------------------------ |
| Was muss mit Auftraggebern geklärt werden?      | `auftraggeber/auftraggeber-gespraech.md`   |
| Was ist technisch noch offen?                   | `dokumentation/technische-fragen.md`       |
| Welche Entscheidungen wurden bereits getroffen? | `dokumentation/entscheidungen.md`          |
| Wie wird deployed?                              | `dokumentation/adr/001-hosting-coolify.md` |
| Docker nur `app/`, Submodule nicht einbinden?   | `dokumentation/build-kontext-submodule-regeln.md` |
| Content-Architektur (Pfade, Slugs, Ablage)      | `dokumentation/content/verzeichnisstruktur.md` |
| Offene Issues / Planung                         | `dokumentation/planung/offen.md`               |
| Doku-Landkarte                                  | `dokumentation/README.md`                      |
| Content manuell einpflegen (JSON, Hotspots)     | `anleitungen/content-einpflegen.md`            |
