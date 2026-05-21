# Schulnavigator — Technische Klärungsfragen

Diese Fragen kläre ich als Entwickler intern oder entscheide eigenständig.
Sie werden **nicht** in Auftraggebergesprächen thematisiert.

---

## Hosting & Infrastruktur

- ✅ **Hosting:** MPZ-Hetzner-Server mit Coolify, Docker-Container
- ✅ **Öffentliche Schul-App-URL (Subdomain MPZ):** `schulnavigator.mpz.schule` — abgedeckt durch **Wildcard-DNS** `*.mpz.schule` → Coolify-VPS (`217.154.120.240`). Coolify-Application + HTTPS siehe [`anleitungen/fuer-entwickler.md`](../anleitungen/fuer-entwickler.md). Eine **eigene Schul-Domain** ist für den MVP nicht vorgesehen.
- Muss das System auch **offline** funktionieren, falls das Schulnetz kein Internet hat?
  - Falls ja: Service Worker + PWA-Caching notwendig

## URL-Schema & QR-Codes

- ✅ **URL-Struktur pro Raum:** `/raum/[slug]` (sprechend) — umgesetzt in `app/app/raum/[slug]/`; siehe [ADR-002](./adr/002-frontend-nextjs.md)
- ✅ **QR-Codes MVP:** **statisch** — vorab als PNG generiert (`npm run generate:qr` in `app/`, Issue #15); Anleitung [qr-codes-drucken.md](../anleitungen/qr-codes-drucken.md). Dynamische Erzeugung durch CMS ist **nicht** MVP.
- **Post-MVP / Skalierung:** Redirect-Schicht (z. B. `qr.…/42` → Ziel-URL), damit gedruckte Codes bei URL-Wechsel ohne Neudruck umschwenkbar sind — aktuell nicht umgesetzt

## Content-Modell & CMS

- ✅ **Entschieden** ([ADR-003](./adr/003-content-mvp-json-directus.md)):
  - **MVP bis 26.06.:** JSON-Dateien (+ Medien) im Repo, Pflege durch MPZ
  - **Langfristig:** Directus (self-hosted auf Coolify), Pflege durch Lehrkräfte
  - **Verworfen:** Custom-Admin-Interface, Payload/Strapi als Primärwahl
- Datenmodell pro Raum (Minimalvorschlag):
  ```
  {
    id: string,
    name: string,
    beschreibung: string,
    bilder: string[],   // URLs
    videos: string[],   // YouTube-Embeds oder Upload-URLs
    zustaendige_person: string
  }
  ```

## Video & Medien

- ✅ **Video-Hosting vorerst:** Upload auf MPZ-Server — [ADR-004](./adr/004-video-hosting-mpz.md)
- 🟡 **YouTube-Embed:** Option für später, wenn Schule/DSB rechtlich freigibt; Player/Datenmodell vorbereiten
- Offen: Maximale Dateigröße / Kompression beim Upload
- Offen: Object Storage vs. `public/`-Ordner im Container

## Authentifizierung & Zugang (Besucher)

- ✅ **Entry-Token** über `/eintritt?t=…`, Speicherung in **`localStorage`**, keine Accounts — [ADR-005](./adr/005-zugangskontrolle-token.md)
- ✅ **Modi:** `fest` (kein Stations-Hub, In-App-Scanner) vs. `heft` (Hub mit allen Stationen)
- ✅ Entry einmalig per **System-Kamera**; Raum-QRs danach primär **In-App-Scanner**
- Raum-QRs = Navigation, kein separates Freischalten pro Raum

## Admin (Lehrkräfte, langfristig Directus)

- Mehrere Lehrkräfte gleichzeitig als Editoren oder nur eine verantwortliche Person?
- Rollen: nur Superadmin, oder auch raum-spezifische Editoren?

## Tech-Stack

- ✅ **Frontend:** Next.js (App Router) + Tailwind CSS — [ADR-002](./adr/002-frontend-nextjs.md)
- ✅ **Content MVP:** JSON im Repo; **Ziel:** Directus — [ADR-003](./adr/003-content-mvp-json-directus.md)
- ✅ **Hosting:** MPZ-Hetzner, Coolify, Docker — [ADR-001](./adr/001-hosting-coolify.md)
- ✅ **QR-Code-Bibliothek:** `qrcode` (npm), Aufruf über `npm run generate:qr` — Issue #15
- **Sprachen:** TypeScript strict, React 19

## Erweiterbarkeit

- Soll die Architektur von Anfang an mehrere Schulen/Mandanten unterstützen?
- Mehrsprachigkeit (DE/TR/AR etc.) — jetzt einplanen oder erst bei Bedarf?
- Analytics: Wie viele Besucher haben welchen Raum gescannt? (DSGVO-konform lösbar via Plausible)
