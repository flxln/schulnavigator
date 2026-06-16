# ADR-003 — Content: JSON im MVP, Directus langfristig (kein Custom-Admin)

**Datum:** 2026-05-21  
**Status:** entschieden  
**Hinweis:** ergänzt durch [ADR-022](./022-mpz-studio-internes-ingest-tool.md) — schmales, **MPZ-internes** Dev-only-Ingest-Tool als bewusste Ausnahme. Das hier festgelegte Verbot eines **Lehrkräfte**-Custom-Admins bleibt unverändert gültig; Directus (#47) bleibt das Zielbild für Lehrkräfte.

## Kontext

Bis zum Schulfest (26.06.2026) muss Content schnell eingepflegt werden. Langfristig sollen Lehrkräfte ohne technisches Vorwissen pflegen; das MPZ plant Skalierung auf weitere Schulen. Hosting erfolgt self-hosted auf Coolify (ADR-001).

## Entscheidung

**Gestaffeltes Content-Modell:**

| Phase | Zeitraum | Content-Quelle | Pflege durch |
|---|---|---|---|
| **MVP** | bis Schulfest 26.06.2026 | JSON-Dateien (+ Medien in `public/` oder Storage) im Repo | MPZ (Felix) |
| **Zielbild** | ab Auswertung / Herbst 2026 | **Directus** (Headless CMS, self-hosted auf Coolify) | Schule (Lehrkräfte), MPZ für Betrieb |

- **Frontend** bleibt Next.js (ADR-002); lädt MVP aus JSON, später aus Directus-API.
- **Eigenes Custom-Admin-Interface** wird nicht gebaut.

## Begründung

- **JSON MVP:** Schnellster Weg zum 26.06., versioniert, kein zweites System vor dem Fest.
- **Directus:** Poliertes Admin-UI für nicht-technische Redakteure; offizielles Docker-Image; Medienbibliothek; Rollen; mandantenfähig (pro Schule Instanz oder `school_id`).
- **Kein Custom-Admin:** Würde ein Mini-CMS nachbauen — hoher Wartungsaufwand, schlechte Skalierung auf viele Schulen.

JSON-Schema aus Phase 1 dient als Vorlage für Directus-Collections (nicht wegwerfen).

## Verworfene Alternativen

- **Nur JSON dauerhaft:** Schule kann ohne Git nicht pflegen; MPZ bleibt Flaschenhals.
- **Payload CMS:** Gute Next.js-Integration, Admin eher entwicklerorientiert; höherer Build-Aufwand als Directus auf Coolify.
- **Strapi:** Möglich, aber ressourcenhungriger; für diesen Use Case kein Vorteil gegenüber Directus.
- **Decap CMS (Git-basiert):** Lehrkräfte müssten indirekt über Git/OAuth — zu technisch für die Zielgruppe.
- **Eigenes Admin-UI (Phase-5-Plan):** Verworfen — Wartung und Feature-Lücken (Medien, Rollen, Workflows) übernehmen etablierte CMS.

## Konsequenzen

- Phase 1–3: Content in JSON + Dateien; kein Directus-Setup vor dem 26.06. (außer optionaler Spike, nicht blockierend).
- Phase 5: Directus deployen, Migration JSON → Directus, Anleitung für Lehrkräfte (`anleitungen/fuer-lehrkraefte.md` bezieht sich auf Directus, nicht auf Custom-UI).
- `technische-fragen.md` und GitHub-Issues Phase 5 anpassen (#46 Entscheidung gilt als getroffen: Directus).
- Mandantenfähigkeit: voraussichtlich Directus-Instanz pro Schule oder Mandanten-Feld — Detail in späterem ADR bei erster Zweitschule.
