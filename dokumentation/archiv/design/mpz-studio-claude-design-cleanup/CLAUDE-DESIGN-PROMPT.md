# Claude Design — Kopier-Prompt (MPZ Studio Cleanup v2.1)

Lade zuerst **alle Dateien** aus diesem Ordner hoch. Optional: Screenshots aus `assets/`. Dann den Block unten **vollständig** in Claude Design einfügen.

---

## Prompt (kopieren ab hier)

```
Du bist Interface-Architekt im Modus SE 13 (UI-Design-Konzept). Deine Leitplanken: Klarheit, Zurückhaltung, Tiefe (Apple HIG). Du lieferst ein vollständiges UI-Konzept und High-Fidelity-Mockups — **keinen** React-, HTML- oder CSS-Implementierungscode.

## Auftrag

Räume die Oberfläche von **MPZ Studio v2.1** auf: klare Informationsarchitektur, gruppierte Navigation, einheitliche Muster — bei voller Funktionsabdeckung aller umgesetzten Module.

MPZ Studio ist ein internes Content-Ingest-Tool für den Schulnavigator (39. Grundschule Dresden). Es läuft nur lokal auf dem Laptop des MPZ (Felix), schreibt stations.json und Medien ins Git-Repo, und ist **kein** CMS für Lehrkräfte.

Lies die hochgeladenen Dateien vollständig. Verbindlich:

- `00-cleanup-brief.md` — Ziel, Scope, Nutzer
- `08-bekannte-ui-probleme.md` — Ist-Probleme, die du lösen sollst
- `02-screens-v2.1-und-user-stories.md` — Screen-Inventar S1–S24
- `11-se13-qualitaetsregeln.md` — Qualitätsregeln

## Design-System (Pflicht)

- Farben, Typo, Spacing **ausschließlich** aus `03-design-system-gs39-tokens.css`
- Kein Dark Mode — warmer Papier-Look
- Orientierung an `09-ui-komponenten-referenz.md` (Gs39Button, Gs39Card)
- Studio = **Werkzeug-UI**: dichter als die Besucher-App, weniger Dekoration

## Datenmodell

- Felder aus `04-stations-schema.json` und `05-typendefinitionen.md`
- Mock-Daten: `06-referenz-station-klassenzimmer.json`, `07-referenz-station-daz.json`, `10-hub-stationen-liste.json`
- Coach: `13-coach-messages-auszug.json` · Embeds: `14-embed-allowlist.json`

## Cleanup-Pflicht

Beantworte explizit die Probleme in `08-bekannte-ui-probleme.md`:

1. Flache 9-Punkte-Navigation → gruppierte IA
2. Dialog-Audio ist **kein globaler Inhalt** — Segment-Zeilenmodell (`15-dialog-segment-zeilenmodell.md`): Text + Audio pro Zeile, kein globaler Nav/Tab
3. Medien-Upload (Modal vs. Route vs. Tab) → einheitlicher Einstieg
4. Brand vs. Hub aufgeteilt → **entschieden:** zusammenlegen zu einer Route `/mpz/studio/design` (Tabs Hub + Brand)
5. Dialog-Editor überladen → Sub-Navigation oder vergleichbare Entlastung
6. Save & Validate — Dirty-State und Feedback klarer
7. Mobile Sidebar scanbar machen
8. Sphere-Kalibrierung asymmetrisch zu Flat → **S14** `/mpz/calib/sphere/{slug}` (`16-sphere-calib-screen.md`)

## Screens — vollständig v2.1 (jeden mit Empty, Filled, Error, Loading)

**Shell:** S1 Studio-Shell, S2 Plan-A-Banner, S3 Save & Validate, S4 Dashboard

**Stationen:** S5 Grid … **S13 Flat-Kalibrierung** · **S14 Sphere-Kalibrierung** (Layout wie S13) · **S15 Dialog (alle Stationen: no-dialog + Segment-Zeile)** · **Global:** S17–S21

## Kern-User-Stories (jeweils Interaktionsfluss + Fehlerpfad)

1. Medien ingestieren (alle 6 Typen) → Validierung → Vorschau
2. Hotspot kalibrieren (Flat **S13** + Sphere **S14** — gleiches Vollbild-Layout)
3. Dialog pflegen (Segmente, Gruppen, Bubble, Audio)
4. Coach-Nachricht anlegen
5. Deploy vorbereiten (validate-all, QR, Token)
6. Validierung fehlgeschlagen → Rollback-Hinweis

## Barrierefreiheit

WCAG 2.1 AA wo praktikabel: Touch-Targets ≥ 44 px, Fehler mit Text + Farbe, logische Fokus-Reihenfolge. Mindestens drei konkrete A11y-Entscheidungen benennen.

## Lieferformat (in dieser Reihenfolge)

1. **Informationsarchitektur** — neue Navigation, Gruppierung, Breadcrumbs
2. **Lösungen** für alle Punkte in `08-bekannte-ui-probleme.md`
3. **Komponenteninventar** — UI-Bausteine mit Zuständen
4. **Interaktionsflüsse** — pro Kern-User-Story
5. **Visuelle Systematik** — Typo, Farben (Token-Namen), Spacing
6. **High-Fidelity-Mockups** — alle Screens, Desktop 1280 px primär
7. **Abweichungen von der Besucher-App** — kurz begründet

## Qualitätsregeln

- Kein generisches Admin-Dashboard — GS39-Branding durchgängig
- Kein Scope über v2.1 hinaus (kein v3 Polish, kein Directus)
- Kein Implementierungscode
- Offene Fragen aus `08-bekannte-ui-probleme.md` beantworten — nicht offen lassen
- Jede Kern-Story hat einen vollständigen Fehlerpfad
```

---

## Optional: Kurz-Prompt (Folge-Iteration)

Einzelprompts für jeden Screen und Zustand: [`18-mockup-prompts.md`](./18-mockup-prompts.md) (47 Pflicht + 1 optional).

```
Überarbeite nur [z. B. S15 Dialog-Editor / neue Sidebar-IA] aus MPZ Studio Cleanup v2.1.

Beibehalten: GS39-Tokens, Lösungen aus dem ersten Konzept, Scope v2.1.

Fokus: [konkret]

Kein Code. High-Fidelity-Mockup + kurze Begründung.
```

---

## Nach dem Design

Ergebnis für Feature-Implementierung (Refactor `app/components/mpz-studio/`) verwenden. Spec: `dokumentation/spezifikationen/mpz-studio.md`.
