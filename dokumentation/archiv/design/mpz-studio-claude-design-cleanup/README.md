# MPZ Studio — Claude Design Upload-Paket (Cleanup v2.1)

**Datum:** 2026-06-22  
**Zweck:** UI-Aufräumen und Neu-Strukturierung der **vollständigen** MPZ-Studio-Oberfläche (Epic v2/v2.1 umgesetzt)  
**Vorgänger:** [`../mpz-studio-claude-design/`](../mpz-studio-claude-design/) (nur v0-Scope, Juni 2026)

---

## Schnellstart

1. **Gesamten Ordner** `mpz-studio-claude-design-cleanup/` in Claude Design hochladen (alle Dateien unten).
2. Optional: Screenshots in [`assets/`](./assets/) ergänzen (siehe `assets/README.md`) und erneut hochladen.
3. **Prompt kopieren:** [`CLAUDE-DESIGN-PROMPT.md`](./CLAUDE-DESIGN-PROMPT.md) — vollständig in Claude Design einfügen.

---

## Dateien im Paket

| Datei | Rolle | Pflicht |
|-------|--------|---------|
| [`00-cleanup-brief.md`](./00-cleanup-brief.md) | Master-Brief: Ziel, Nutzer, Scope v2.1, Abgrenzung | ✅ |
| [`CLAUDE-DESIGN-PROMPT.md`](./CLAUDE-DESIGN-PROMPT.md) | **Kopier-Prompt für Claude Design** | ✅ |
| [`02-screens-v2.1-und-user-stories.md`](./02-screens-v2.1-und-user-stories.md) | Screen-Inventar S1–S24, Zustände, Flows | ✅ |
| [`08-bekannte-ui-probleme.md`](./08-bekannte-ui-probleme.md) | Ist-Zustand: Durcheinander, Redundanzen | ✅ |
| [`03-design-system-gs39-tokens.css`](./03-design-system-gs39-tokens.css) | Farben, Typo, Spacing | ✅ |
| [`04-stations-schema.json`](./04-stations-schema.json) | JSON-Schema → Formularfelder | ✅ |
| [`05-typendefinitionen.md`](./05-typendefinitionen.md) | TypeScript-Modell (Auszug, v2.1) | ✅ |
| [`01-spezifikation-auszug.md`](./01-spezifikation-auszug.md) | Navigation, Felder, Module (Snapshot) | empfohlen |
| [`06-referenz-station-klassenzimmer.json`](./06-referenz-station-klassenzimmer.json) | Mock: Medien + Hotspots (360°) | empfohlen |
| [`07-referenz-station-daz.json`](./07-referenz-station-daz.json) | Mock: Dialog + Dialog-Audio | empfohlen |
| [`10-hub-stationen-liste.json`](./10-hub-stationen-liste.json) | 12 Slugs für Grid | empfohlen |
| [`09-ui-komponenten-referenz.md`](./09-ui-komponenten-referenz.md) | Gs39Button, Gs39Card, TopBar | empfohlen |
| [`11-se13-qualitaetsregeln.md`](./11-se13-qualitaetsregeln.md) | SE 13 Qualitätsregeln (ausgefüllt) | empfohlen |
| [`12-komponenten-inventar-ist.md`](./12-komponenten-inventar-ist.md) | Aktuelle React-Komponenten ↔ Screens | empfohlen |
| [`13-coach-messages-auszug.json`](./13-coach-messages-auszug.json) | Coach-Panel Mock-Daten | optional |
| [`14-embed-allowlist.json`](./14-embed-allowlist.json) | Embeds-Tab Mock | optional |
| [`assets/`](./assets/) | Screenshots aktueller UI (manuell) | optional |

---

## Upload-Reihenfolge

1. `00-cleanup-brief.md`
2. `08-bekannte-ui-probleme.md`
3. `02-screens-v2.1-und-user-stories.md`
4. `03-design-system-gs39-tokens.css`
5. `04-stations-schema.json` + `05-typendefinitionen.md`
6. `06-referenz-station-klassenzimmer.json` + `07-referenz-station-daz.json` + `10-hub-stationen-liste.json`
7. `01-spezifikation-auszug.md`, `09-ui-komponenten-referenz.md`, `12-komponenten-inventar-ist.md`
8. `11-se13-qualitaetsregeln.md`
9. `13-coach-messages-auszug.json`, `14-embed-allowlist.json` (optional)
10. `assets/*.png` (falls vorhanden)
11. `CLAUDE-DESIGN-PROMPT.md` als Auftrag

---

## Unterschied zum v0-Paket

| | v0-Paket (Juni) | Dieses Paket |
|---|-----------------|--------------|
| Scope | Plan B v0 — 7 Kern-Screens | **Vollständiges Studio v2.1** |
| Coach, Deploy, Brand, Hub | ausgegraut / nicht designen | **mit designen** |
| Medien | nur Upload | CRUD, link/embed, Datei ersetzen |
| Dialog | nur Audio-Tab | **Dialog-Editor** (Segmente, Gruppen, Bubble) |
| Auftrag | Greenfield-Mockups | **IA-Cleanup** + Mockups |

---

## Quellen im Repo (bei Aktualisierung)

| Bundle-Datei | Original |
|--------------|----------|
| `01-spezifikation-auszug.md` | `dokumentation/spezifikationen/mpz-studio.md` |
| `03-design-system-gs39-tokens.css` | `app/app/gs39-tokens.css` |
| `04-stations-schema.json` | `app/data/stations.schema.json` |
| `06` / `07` | `app/data/stations.json` (Einträge) |
| `13-coach-messages-auszug.json` | `app/content/coach-messages.json` |
| `14-embed-allowlist.json` | `app/data/embed-allowlist.json` |

---

## Verknüpfung

- Spezifikation: [mpz-studio.md](../../spezifikationen/mpz-studio.md)
- Domänen/Routen: [mpz-studio-ui.md](../../ideen/archiv/mpz-studio-ui.md)
- ADR: [022-mpz-studio-internes-ingest-tool.md](../../adr/022-mpz-studio-internes-ingest-tool.md)
- v0-Prototyp (Vergleich): [../mpz-studio-claude-design/version_1/](../mpz-studio-claude-design/version_1/)
- **Upload-limit 10 MD:** [../mpz-studio-claude-design-10md/](../mpz-studio-claude-design-10md/) — gleicher Inhalt, 10 Dateien
