# Build- und Laufzeitkontext — Submodule und KI-Agenten

**Zielgruppe:** Entwickler und **Coding-Agenten** (Cursor, Claude Code, …), die am Schulnavigator arbeiten.

**Kurzregel:** Alles, was im **Docker-Image** oder zur **Laufzeit** der App gebraucht wird, muss unter [`app/`](../app/) liegen — nicht über Pfade wie `../auftraggeber/` oder `../protokolle/` angebunden werden.

---

## Auslöser (Coolify-Deploy, Mai 2026)

`npm run build` ruft `validate:tokens` auf. Das Skript las zuerst nur:

`../auftraggeber/material/UI-Vorschläge/colors_and_type.css`

Im Docker-Container ist `WORKDIR` `/app`, der Build-Kontext nur `app/` (`COPY . .`). Der Pfad wurde zu **`/auftraggeber/...`** aufgelöst — existiert im Image nicht → Build-Abbruch:

```text
validate:tokens: ENOENT: no such file or directory, open '/auftraggeber/.../colors_and_type.css'
```

**Fix im Repo:** Fallback auf [`app/scripts/reference/colors_and_type.css`](../app/scripts/reference/colors_and_type.css) (Referenzkopie im App-Verzeichnis).

---

## Zwei getrennte Repos neben `app/` (Git-Submodule)

Im Hauptrepo [`flxln/schulnavigator`](https://github.com/flxln/schulnavigator) sind zwei **Submodule** eingetragen ([`.gitmodules`](../.gitmodules)):

| Pfad | Repo | Inhalt (typisch) |
|------|------|------------------|
| [`auftraggeber/`](../auftraggeber/) | `schulnavigator-auftraggeber` | Gesprächsnotizen, Schul-Material, Design-Quellen (`colors_and_type.css`), Stationstexte |
| [`protokolle/`](../protokolle/) | `schulnavigator-protokolle` | Gesprächsprotokolle, Analysen |

Diese Ordner sind **Dokumentation und Auftraggeber-Material** — kein Teil der Next.js-App und **nicht** im Produktions-Docker-Image.

Coolify klont oft **nur** das Hauptrepo (Submodule deaktiviert). Selbst mit Submodule: der **Docker-Build-Kontext bleibt `app/`** — die Submodule liegen **eine Ebene darüber** und landen nicht in `COPY . .`.

---

## Was gilt für Docker und Laufzeit

| Bereich | Build-Kontext / Image | Submodule `auftraggeber/`, `protokolle/` |
|---------|------------------------|-------------------------------------------|
| Coolify / `docker build` in `app/` | nur `app/` | **nicht** enthalten |
| Laufzeit-Container (Next.js standalone) | nur gebautes `app/` | **nicht** mounten oder importieren |
| Lokale Entwicklung (volles Repo) | `npm` in `app/`, Submodule lesbar | zum **Lesen** von Specs/Material OK |

**Deployment** ([ADR-001](./adr/001-hosting-coolify.md), [`anleitungen/fuer-entwickler.md`](../anleitungen/fuer-entwickler.md)): Base Directory **`/app`**, Dockerfile in `app/`.

---

## Pflichtregeln für KI-Agenten

1. **Keine Laufzeit-Abhängigkeit** von `auftraggeber/` oder `protokolle/` — weder in `import`, noch in Build-Skripten, `next.config`, Dockerfile oder Server-Code mit Pfaden wie `join(__dirname, '..', 'auftraggeber', …)` **ohne** Fallback unter `app/`.

2. **Build-Skripte** (`package.json` scripts, `app/scripts/*.mjs`): Wenn eine Quelle außerhalb von `app/` geprüft wird, **immer** eine Kopie oder Referenz **innerhalb** von `app/` vorsehen (wie bei Design-Tokens). Im Container muss der Build **ohne** Submodule durchlaufen.

3. **Assets für die Website** (Bilder, Audio, Video, JSON-Content): unter `app/public/`, `app/data/` o. ä. ablegen — nicht zur Laufzeit aus `auftraggeber/material/` streamen.

4. **Nach Übernahme aus dem Submodule:** Referenz-/Snapshot-Dateien in `app/` pflegen und in einer README unter dem Zielordner kurz dokumentieren (siehe [`app/scripts/reference/README.md`](../app/scripts/reference/README.md)).

5. **Submodule nicht „für Deploy mitdenken“** — kein `COPY ../auftraggeber` im Dockerfile, kein Erweitern des Build-Kontexts auf Repo-Root, außer es gibt einen expliziten, dokumentierten ADR dazu.

6. **`protokolle/`** niemals in Build oder Runtime einbinden — nur für Menschen/Planung.

---

## Wohin kopieren? (Orientierung)

| Bedarf | Ziel unter `app/` | Beispiel |
|--------|-------------------|----------|
| Design-Tokens (Build-Check) | `app/scripts/reference/` | `colors_and_type.css` |
| App-CSS (Runtime) | `app/app/` | `gs39-tokens.css` |
| Stationen-Daten | `app/data/` | `stations.json` |
| Statische Medien | `app/public/` | `public/stations/{slug}.jpg` |
| QR-PNGs (generiert) | `app/public/qr/` | `npm run generate:qr` |

**Source of Truth** für Auftraggeber-Themen bleibt im Submodule; die **App** nutzt die **kopierte, versionierte** Fassung im Hauptrepo.

---

## Design-Tokens (Referenzimplementierung)

| Rolle | Pfad |
|-------|------|
| Source of Truth (Submodule, lokal) | `auftraggeber/material/UI-Vorschläge/colors_and_type.css` |
| Runtime / Tailwind | `app/app/gs39-tokens.css` |
| Docker-Build / CI ohne Submodule | `app/scripts/reference/colors_and_type.css` |
| Validierung | `npm run validate:tokens` — bevorzugt Submodule-Pfad, sonst `scripts/reference/` |

Workflow bei Token-Änderung:

1. Auftraggeber-CSS anpassen (Submodule)
2. `app/app/gs39-tokens.css` synchronisieren
3. `app/scripts/reference/colors_and_type.css` kopieren/aktualisieren
4. `cd app && npm run validate:tokens && npm run build`

---

## Checkliste vor PR / Deploy (Agenten)

- [ ] Kein neuer Code, der **nur** unter `../auftraggeber` oder `../protokolle` liegt und für Build/Runtime nötig ist
- [ ] `cd app && npm run build` erfolgreich (simuliert Coolify)
- [ ] Optional: `cd app && docker build -t schulnavigator-app .`
- [ ] Bei neuer externer Quelle: Kopie oder Referenz unter `app/` + README-Zeile

---

## Verwandte Dokumente

- [`CLAUDE.md`](../CLAUDE.md) — Agenten-Einstieg, Verweis hierher
- [`anleitungen/fuer-entwickler.md`](../anleitungen/fuer-entwickler.md) — Coolify, Submodule-Fehler, Troubleshooting
- [`dokumentation/architektur.md`](./architektur.md) — UI-Tokens, Deployment
- [`app/AGENTS.md`](../app/AGENTS.md) — Regeln im npm-Projektroot
