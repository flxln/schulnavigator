# ADR-001 — Hosting: MPZ-VPS (IONOS) mit Coolify

**Datum:** 2026-05-07  
**Status:** entschieden

## Kontext

Die App muss zuverlässig gehostet werden. Es gibt Zugang zu einem bestehenden VPS des MPZ (Medienpädagogisches Zentrum) bei **IONOS** (Standort Deutschland), der über Coolify verwaltet wird.

## Entscheidung

Die App wird als Docker-Container auf dem MPZ-VPS (IONOS) deployed und über Coolify verwaltet.

## Begründung

- Bestehende Infrastruktur, keine zusätzlichen Hosting-Kosten
- Coolify ermöglicht einfaches Deployment ohne manuelles SSH
- Docker-Container sorgen für reproduzierbare Umgebungen
- Daten bleiben auf schulnaher Infrastruktur in Deutschland (DSGVO-vorteilhaft)

## Verworfene Alternativen

- **Vercel/Netlify:** kostenlos, aber Daten auf US-Servern, weniger Kontrolle
- **Schulserver direkt:** kein Coolify, komplexeres Deployment

## Konsequenzen

- App muss zwingend ein `Dockerfile` enthalten
- Build- und Runtime-Schritte müssen containerisiert werden
- Health-Check-Endpunkt für Coolify einplanen (`/api/health`)
- Port konfigurierbar via Umgebungsvariable

## Hinweis (Korrektur 2026-06)

In älteren Projektdokumenten, Issues und Chats wurde der Host teils als „Hetzner“ bezeichnet. Tatsächlich handelt es sich um einen **VPS bei IONOS**. Technischer Ablauf (Coolify, Docker, Volumes, rsync) bleibt unverändert.
