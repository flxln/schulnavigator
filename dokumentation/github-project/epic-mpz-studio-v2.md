# Epic: MPZ Studio v2 — Content-Vollständigkeit & Betrieb (ADR-022)

**Milestone:** [MPZ Studio v2](https://github.com/flxln/schulnavigator/milestone/9) (GitHub #9, fällig 31.08.2026)
**Status:** geplant — Epic-Issue und Unterissues **noch nicht** auf GitHub angelegt · Branch **`mpz-studio-v2`**
**Parent:** Epic [#158](https://github.com/flxln/schulnavigator/issues/158) (v1 abgeschlossen, Merge `mpz-studio-v1` → `main` ausstehend)

**Domänen-Übersicht:** [mpz-studio-ui.md](../kurzfristige-ideen/mpz-studio-ui.md) · **Spec:** [2026-06-16-mpz-studio-spezifikation.md](../projektmanagement/2026-06-16-mpz-studio-spezifikation.md) (Phasierung v2/v3)

## Ziel

v0+v1 decken Ingest, Station-Detail, Medien-Upload/Löschen und Hotspot-CRUD ab. **v2 schließt die Lücken**, die heute nur über Plan A (JSON/CLI) pflegbar sind — ohne v3-Polish (WYSIWYG, Batch-Import).

Leitplanken unverändert (ADR-022): nur `NODE_ENV=development`, nie Coolify, kein Git aus dem Studio.

## Geplante Unterissues (Vorlage — Nummern nach Anlage auf GitHub ergänzen)

| Paket | Titel (Vorschlag) | Domäne | Priorität | Blockiert durch |
|-------|-------------------|--------|-----------|-----------------|
| v2-A | Raumbild-Upload Flat + 360° (Validator Größe/Ratio) | Raum | hoch | v1 Merge |
| v2-B | Medien PATCH (Metadaten bearbeiten) | Medien | hoch | v1 Merge |
| v2-B | Medien link/embed im Studio anlegen | Medien | hoch | v2-B PATCH |
| v2-C | Dialog-Tab: Segmente, Gruppen, `bubble` (Formular) | Dialog | mittel | v1 Merge |
| v2-C | Dialog-Hotspot anlegen/bearbeiten (`action: dialog`) | Hotspots | mittel | #165–#168 |
| v2-D | Coach-Editor (`coach-messages.json` CRUD) | Coach | mittel | v1 Merge |
| v2-E | Deploy-Tab (QR, Token, Env, validate-all) | Betrieb | hoch | v1 Merge |
| v2-F | `embed-allowlist.json` extrahieren + Studio-UI | Konfig | niedrig | — |
| v2-F | Hub-Slug-Map + Station-Akzente/Icons (Config) | Konfig | niedrig | — |
| v2-F | Brand-Uploads (Logos, Maskottchen) | Brand | niedrig | — |

**Empfohlene Reihenfolge:** v2-B (Medien PATCH) → v2-A (Raumbild) → v2-E (Deploy) → v2-C/D → v2-F.

## Scope v2 — drin / draußen

| In v2 | Nicht v2 (v3 oder Directus) |
|-------|------------------------------|
| Raumbild-Upload, Medien-PATCH, link/embed-Formular | Markdown-WYSIWYG |
| Dialog-Editor (Formular), Dialog-Hotspots | Dialog-Bubble visuell |
| Coach-CRUD | Batch-Import `auftraggeber/` |
| Deploy-Tab | YouTube im Studio (ADR-004) |
| Config-Extraktion (Allowlist, Hub, Brand) | Lehrkräfte-Admin (Directus #47) |

## Akzeptanzkriterien (Epic)

- [ ] Alle Zeilen in [mpz-studio-ui.md — Fortschritt](../kurzfristige-ideen/mpz-studio-ui.md#fortschritt-domäne--crud--issue--umsetzung) mit „v2“ sind ✓ oder bewusst v3/deferred
- [ ] `npm run build` grün nach jedem Unterissue
- [ ] Plan A bleibt Fallback für jedes v2-Feature

## Nächste Schritte (vor Implementierung)

1. Merge `mpz-studio-v1` → `main` (PR)
2. Milestone „MPZ Studio v2“ auf GitHub anlegen
3. Epic-Issue + Unterissues aus Tabelle oben anlegen
4. Erstes Issue: **Medien PATCH** (kleinster Nutzen, bekanntes Muster)

## Kontext

- [epic-mpz-studio-v1.md](./epic-mpz-studio-v1.md) (abgeschlossen)
- [epic-mpz-studio.md](./epic-mpz-studio.md) (v0)
- [ADR-022](../adr/022-mpz-studio-internes-ingest-tool.md)
