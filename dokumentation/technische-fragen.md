# Schulnavigator — Technische Klärungsfragen

Diese Fragen kläre ich als Entwickler intern oder entscheide eigenständig.
Sie werden **nicht** in Auftraggebергesprächen thematisiert.

---

## Hosting & Infrastruktur

- ✅ **Hosting:** MPZ-Hetzner-Server mit Coolify, Docker-Container
- Braucht die Schule eine eigene Domain oder reicht eine Subdomain?
- Muss das System auch **offline** funktionieren, falls das Schulnetz kein Internet hat?
  - Falls ja: Service Worker + PWA-Caching notwendig

## URL-Schema & QR-Codes

- URL-Struktur pro Raum: `/raum/[id]` (numerisch) oder sprechend z. B. `/raum/chemie`?
- QR-Codes: **statisch** (vorab als PNG generiert und ausgedruckt) oder **dynamisch** (CMS erzeugt sie live)?
- Redirect-Schicht sinnvoll? (z. B. `qr.schulnavigator.de/42` → echte URL), damit URLs später geändert werden können, ohne QR-Codes neu zu drucken

## Content-Modell & CMS

- Welcher CMS-Ansatz?
  - **Option A:** Headless CMS (Directus, Payload CMS) — mächtig, aber Setup-Aufwand
  - **Option B:** Markdown/JSON-Dateien im Repo — einfach, aber kein GUI für Lehrkräfte
  - **Option C:** Einfaches Custom-Admin-Interface (vibecoded) — bester Kompromiss für a-technische Nutzer
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

- Video-Hosting: **YouTube-Embed** (einfachste Option) oder eigene Uploads?
- Maximale Bildgröße / Kompression automatisch beim Upload?
- Werden Videos lokal im Schulnetz abgespielt oder kommen sie von extern?

## Authentifizierung & Admin

- Admin-Bereich: Passwortschutz ausreichend oder echte Nutzerverwaltung nötig?
- Mehrere Lehrkräfte gleichzeitig als Editoren oder nur eine verantwortliche Person?
- Rollen: nur Superadmin, oder auch Raum-spezifische Editoren?

## Tech-Stack (Vorschlag zur Entscheidung)

- **Frontend:** Next.js (App Router) + Tailwind CSS
- **Backend/CMS:** Payload CMS oder einfaches JSON-API
- **Hosting:** Vercel
- **QR-Code-Bibliothek:** `qrcode` (npm)
- **Sprachen:** TypeScript strict, React 19

## Erweiterbarkeit

- Soll die Architektur von Anfang an mehrere Schulen/Mandanten unterstützen?
- Mehrsprachigkeit (DE/TR/AR etc.) — jetzt einplanen oder erst bei Bedarf?
- Analytics: Wie viele Besucher haben welchen Raum gescannt? (DSGVO-konform lösbar via Plausible)
