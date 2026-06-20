# MPZ Studio — Claude Design Upload-Paket

Bundle für **Schritt 2b (SE 13)** — UI-Konzept und Mockups in Claude Design.

**GitHub-Meilenstein:** MPZ Studio (Plan B, v0 optional bis ~22.06.2026)

---

## Schnellstart Claude Design

1. Alle Dateien dieses Ordners hochladen (Reihenfolge siehe unten).
2. Optional: Screenshots in [`assets/`](./assets/) ergänzen (siehe `assets/README.md`).
3. **Prompt kopieren:** [`CLAUDE-DESIGN-PROMPT.md`](./CLAUDE-DESIGN-PROMPT.md) (vollständiger Auftrag für Claude Design).
4. Qualitätsregeln zusätzlich: [`08-se13-ui-design-prompt.md`](./08-se13-ui-design-prompt.md).

---

## Dateien im Paket

| Datei | Rolle | Pflicht |
|-------|--------|---------|
| [`00-claude-design-brief.md`](./00-claude-design-brief.md) | Master-Brief, Produkt, Scope v0 | ✅ |
| [`CLAUDE-DESIGN-PROMPT.md`](./CLAUDE-DESIGN-PROMPT.md) | **Kopier-Prompt für Claude Design** | ✅ |
| [`02-v0-screens-und-user-stories.md`](./02-v0-screens-und-user-stories.md) | Screen-Liste, Zustände, Flows | ✅ |
| [`03-design-system-gs39-tokens.css`](./03-design-system-gs39-tokens.css) | Farben, Typo, Spacing | ✅ |
| [`04-stations-schema.json`](./04-stations-schema.json) | JSON-Schema → Formularfelder | ✅ |
| [`05-typendefinitionen.md`](./05-typendefinitionen.md) | TypeScript-Modell (Auszug) | ✅ |
| [`01-spezifikation-auszug.md`](./01-spezifikation-auszug.md) | Vollständige Spec (Snapshot) | empfohlen |
| [`06-referenz-station-klassenzimmer.json`](./06-referenz-station-klassenzimmer.json) | Mock-Daten | empfohlen |
| [`10-hub-stationen-liste.json`](./10-hub-stationen-liste.json) | 12 Slugs für Grid | empfohlen |
| [`07-projekttag-workflow.md`](./07-projekttag-workflow.md) | Nutzerkontext, Plan A Fallback | empfohlen |
| [`09-ui-komponenten-referenz.md`](./09-ui-komponenten-referenz.md) | Gs39Button, Gs39Card, TopBar | empfohlen |
| [`08-se13-ui-design-prompt.md`](./08-se13-ui-design-prompt.md) | SE 13 Qualitätsregeln | empfohlen |
| [`assets/`](./assets/) | Screenshots (manuell) | optional |

---

## Upload-Reihenfolge

1. `00-claude-design-brief.md`
2. `02-v0-screens-und-user-stories.md`
3. `03-design-system-gs39-tokens.css`
4. `04-stations-schema.json` + `05-typendefinitionen.md`
5. `06-referenz-station-klassenzimmer.json` + `10-hub-stationen-liste.json`
6. `01-spezifikation-auszug.md`, `07-projekttag-workflow.md`, `09-ui-komponenten-referenz.md`
7. `08-se13-ui-design-prompt.md`
8. `assets/*.png` (falls vorhanden)

---

## Wichtig: Scope v0

Claude Design soll **nur Plan B v0** mockuppen — nicht Coach, Brand, Hub, Deploy.

Vollversion-Navigation in der Spec dient als Zielbild; UI-Scope steht in `00` und `02`.

---

## Quellen im Repo (bei Aktualisierung)

| Bundle-Datei | Original |
|--------------|----------|
| `01-spezifikation-auszug.md` | `dokumentation/spezifikationen/mpz-studio.md` |
| `03-design-system-gs39-tokens.css` | `app/app/gs39-tokens.css` |
| `04-stations-schema.json` | `app/data/stations.schema.json` |
| `06-referenz-station-klassenzimmer.json` | `app/data/stations.json` (Eintrag klassenzimmer) |
| `07-projekttag-workflow.md` | `anleitungen/projekttag-content-ingest.md` |
| `08-se13-ui-design-prompt.md` | Vault: `wissen-ki-und-mehr/.../13_UI_Design_Konzept/prompt.md` |

Nach Änderungen an der Spec: Snapshot `01` neu kopieren.

---

## Verknüpfung

- Spezifikation: [mpz-studio.md](../../spezifikationen/mpz-studio.md)
- ADR: [022-mpz-studio-internes-ingest-tool.md](../../adr/022-mpz-studio-internes-ingest-tool.md)
- Nächster Schritt nach Design: SE 03 Feature-Implementierung (v0)
