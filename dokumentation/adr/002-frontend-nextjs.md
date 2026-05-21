# ADR-002 — Frontend: Next.js (App Router)

**Datum:** 2026-05-21  
**Status:** entschieden

## Kontext

Die Besucher-App braucht statische Stationsseiten, API-Endpunkte (Health-Check, Token-Prüfung, später Medien), Docker-Deployment auf Coolify (ADR-001) und eine Grundlage für spätere Anbindung an ein Headless CMS (ADR-003).

## Entscheidung

- **Framework:** Next.js mit App Router
- **Sprache:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **Routing:** `/raum/[slug]` mit sprechenden Slugs (z. B. `/raum/musikzimmer`)

## Begründung

- Passt zu Coolify/Docker und dem geforderten `/api/health`
- SSG/ISR für QR-Stationen; API Routes ohne separates Backend
- Gleicher Stack wie gängige Headless-CMS-Frontends; Directus-Anbindung über REST/GraphQL gut dokumentiert
- Bildoptimierung (`next/image`) und Client-Komponenten für Gamification (`localStorage`)

## Verworfene Alternativen

- **Astro:** Bessere Performance bei rein statischen Seiten, aber Token-API und CMS-Integration erfordern zusätzliche Schichten — für den engen Zeitplan unnötige Komplexität.
- **SvelteKit:** Geeignet, aber kleineres Ökosystem und weniger Erfahrung im Projekt-Kontext.
- **Reines Static Site Generator (11ty o. ä.):** Kein integrierter API-Layer für Zugangskontrolle und Uploads.

## Konsequenzen

- `app/`-Verzeichnis mit Next.js-Projekt, Multi-Stage-`Dockerfile`
- Datenmodell für Stationen zunächst als JSON im Repo (MVP, siehe ADR-003)
- URL-Schema in `architektur.md` und Content-Dateien auf `[slug]` ausrichten
