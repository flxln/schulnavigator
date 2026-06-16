# ADR-022 — MPZ Studio: internes Ingest-/Pflege-Werkzeug (Dev-only, Ausnahme zu ADR-003)

**Datum:** 2026-06-16
**Status:** entschieden

## Kontext

Der MVP-Content-Workflow (Medien in `public/` + Einträge in `app/data/stations.json`) ist für das Volumen des Projekttags (24./25.06.2026) und des Schulfests (26.06.2026) **fehleranfällig und träge**: Pfad-Tippfehler, doppelte Medien-IDs, manuell gesetzte Hotspot-Koordinaten, Fehler erst zum Build-Zeitpunkt.

[ADR-003](./003-content-mvp-json-directus.md) legt fest: **kein Custom-Admin-Interface**, Directus (#47) ist das Zielbild für die Content-Pflege durch **Lehrkräfte**. Directus vor dem Schulfest einzuführen ist bei verbleibenden ~8 Tagen zu groß und zeitkritisch.

Die Plan-A-Lösung (CLI `npm run content:ingest`, JSON-Schema, VS-Code-Snippets, Hotspot-Kalibrierung) ist **bereits umgesetzt** (2026-06-16) und deckt den kritischen Pfad ab. Offen blieb die Frage, ob ein komfortableres, **MPZ-internes** Pflege-UI („MPZ Studio") gebaut werden darf, ohne ADR-003 zu verletzen. Zwei unabhängige Plan-Reviews (SE-15: Codex und GLM-5.1) benennen genau diesen ungeklärten ADR-003-Konflikt als Pflicht-Klärung **vor** Umsetzung. Diese Entscheidung schließt die Lücke.

Detail-Spezifikation, Scope-Stufen und Implementierungsfragen: [`dokumentation/projektmanagement/2026-06-16-mpz-studio-spezifikation.md`](../projektmanagement/2026-06-16-mpz-studio-spezifikation.md).

## Entscheidung

Es wird ein schmales, **MPZ-internes** Ingest-/Pflege-Werkzeug („MPZ Studio") gebaut — als bewusst geschnittene **Ergänzung/Ausnahme zu ADR-003**, nicht als dessen Widerruf.

Abgrenzung, die den ADR-003-Konflikt auflöst:

- **Zielgruppe ausschließlich MPZ/Felix**, nicht Lehrkräfte. Ein Lehrkräfte-Admin-UI bleibt verboten; Directus (#47) bleibt das Zielbild für Lehrkräfte.
- **Temporäres Betriebs-/Projekttag-Werkzeug**, das eingefroren oder abgelöst wird, sobald Directus live ist.
- **Kein CMS-Ersatz:** keine Rollen, Workflows oder Multi-User-Features. Das Tool schreibt ausschließlich lokale Repo-Dateien (JSON + Assets) komfortabler als die CLI.

Plan A (CLI/JSON-Ingest) bleibt der **Pflicht- und Fallback-Pfad**; MPZ Studio (Plan B / v0+) ist **optional** und darf den Projekttag bzw. das Schulfest nicht blockieren.

## Begründung

- ADR-003 schützt vor einem dauerhaften, wartungsintensiven Mini-CMS für **Lehrkräfte** mit Rollen/Workflows/Medienverwaltung. MPZ Studio baut nichts davon — es ist ein dünner Komfort-Layer über demselben Dateischreib-Pfad, den die bereits genehmigte CLI nutzt.
- Der Single-Operator-, Dev-only- und Befristungs-Charakter begrenzt Wartungsaufwand und Risiko und hält das Directus-Zielbild unangetastet.
- Die JSON-Struktur der MVP-Pflege dient ohnehin als Vorlage für spätere Directus-Collections (ADR-003); ein strukturiertes Studio festigt diese Vorlage.

## Verworfene Alternativen

- **Reine CLI/JSON-Pflege dauerhaft (Plan A allein):** Für das Volumen des Projekttags zu fehleranfällig und träge (Pfade, IDs, Hotspot-Koordinaten von Hand).
- **Directus vor dem Schulfest einführen:** Zu groß und zeitkritisch (~8 Tage), siehe ADR-003 — kein zweites System vor dem 26.06.
- **TypeScript-Config-Dateien direkt vom Tool patchen:** Fehleranfällig; stattdessen Config-Extraktion nach JSON (`embed-allowlist.json`, `station-icons.json`, `hub-slug-map.json`, `station-accents.json`) als editierbare Quelle.
- **Studio auch in Production / auf Coolify aktivieren:** HTTP-Schreibzugriff auf `public/` zur Laufzeit ist ein Sicherheitsrisiko — verworfen.

## Konsequenzen

- **Dev-only:** Routen `/mpz/*` und `/api/mpz/*` sind nur bei `NODE_ENV=development` aktiv; in Production liefern sie `notFound()` / 404. Studio wird **nie** auf Coolify aktiviert, kein HTTP-Schreibzugriff auf `public/` in Production.
- **Auth:** Secret-Header `x-mpz-studio-key` gegen `SN_MPZ_STUDIO_SECRET` (nur in `.env.local`, nie in Prod-Env). **Ergänzung 2026-06-16 (#145):** Browser-Zugriff auf `/mpz/*` zusätzlich per httpOnly-Cookie `sn-mpz-studio` — gesetzt durch `POST /api/mpz/session` nach erfolgreicher Header-Prüfung; Middleware und API akzeptieren Header **oder** Cookie (unabhängige Prüfung, kein Kurzschluss).
- **Guard pro Route (Sicherheitsbefund aus Review):** Die bestehende `app/middleware.ts` matcht `/api/*` **nicht** — der Dev-/Auth-Guard muss daher pro Studio-API-Route greifen (zentraler Helper), nicht über die Middleware. Defense-in-Depth: Das Prod-Docker-Image enthält kein für den Laufzeit-User beschreibbares `data/`/`public/`.
- **Single Source of Truth:** Die bestehenden Validatoren (`validate:stations`, `validate:coach`, `validate:tokens`) laufen nach jedem Save — struktur- und asset-seitig.
- **Projekttag-Sicherung:** Plan A (CLI/JSON) bleibt verpflichtend und ist der Fallback bei Instabilität von Plan B; das Studio darf den 24.–26.06.2026 nicht blockieren.
- **ADR-003 bleibt gültig** und wird mit einem Cross-Link „ergänzt durch ADR-022" markiert; das Lehrkräfte-Zielbild (Directus, #47) ist unberührt. Nach Directus-Migration wird Studio eingefroren oder nur noch für Migration/Massenimport genutzt.
- **Detailtiefe:** Scope-Schnitt (v0/v1/v2), IO-/Upload-Kontrakt, Config-Extraktion und Test-Strategie sind Implementierungs-/Plan-Themen und liegen in der Spezifikation, nicht in diesem ADR.
