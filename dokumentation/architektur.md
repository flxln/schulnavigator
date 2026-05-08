# Schulnavigator — Architektur

*Status: in Klärung*

## Tech-Stack

| Bereich | Entscheidung | Begründung |
|---|---|---|
| Frontend | — | |
| CMS / Backend | — | |
| Hosting | MPZ-Hetzner-Server via Coolify | Schulischer Infrastruktur, Docker-basiert |
| Containerisierung | Docker | Pflicht durch Coolify |
| QR-Code-Generierung | — | |
| Video-Hosting | — | |

## URL-Schema

```
/raum/[id]
```

*Noch zu entscheiden: numerische ID oder sprechende Namen?*

## Datenmodell (Entwurf)

```typescript
type Raum = {
  id: string;
  name: string;
  beschreibung: string;
  bilder: string[];   // URLs
  videos: string[];   // Embed-URLs
  zustaendig: string;
};
```

## Deployment

- **Produktion:** MPZ-Hetzner-Server, gemanagt über Coolify, deployed als Docker-Container
- **Staging:** noch offen — ggf. separates Coolify-Projekt auf demselben Server

### Voraussetzungen fürs Dockerfile

- Multi-stage Build empfohlen (Build-Stage + schlankes Runtime-Image)
- Port via Umgebungsvariable konfigurierbar (`PORT`)
- Health-Check-Endpunkt für Coolify: `/api/health`
