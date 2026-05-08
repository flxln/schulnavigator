# Issues — Phase 1: Foundation

Milestone: **Phase 1** | Fällig: 28.05.2026

**Voraussetzung:** Issues #1, #2, #3, #4, #5 aus Phase 0 müssen geschlossen sein.

---

## #9 — Next.js-Projekt aufsetzen

**Labels:** `tech`
**Assignee:** Felix

- Next.js (App Router), TypeScript strict, Tailwind CSS
- ESLint + Prettier konfigurieren
- Verzeichnisstruktur anlegen: `app/`, `components/`, `data/`, `public/`
- Initiales Commit ins GitHub-Repo

---

## #10 — Dockerfile erstellen

**Labels:** `tech`
**Assignee:** Felix

- Multi-stage Build: Build-Stage + schlankes Runtime-Image
- Port via Umgebungsvariable `PORT`
- Health-Check-Endpunkt: `GET /api/health` → `200 OK`
- Anforderung aus CLAUDE.md, Pflicht für Coolify-Deploy

---

## #11 — Routing: /raum/[slug]

**Labels:** `tech`
**Assignee:** Felix

- Dynamische Route `app/raum/[slug]/page.tsx`
- Slug kommt aus JSON-Datenmodell (siehe #12)
- 404-Seite für unbekannte Slugs
- Weiterleitung von `/` auf Startseite

---

## #12 — JSON-Datenmodell für Stationen definieren

**Labels:** `tech`
**Assignee:** Felix

Schema pro Station (TypeScript-Interface + JSON-Beispieldatei):

```ts
interface Station {
  slug: string
  titel: string
  beschreibung: string
  bild: string          // Pfad in /public
  medien: Medium[]
}

interface Medium {
  typ: 'audio' | 'video' | 'foto' | 'text'
  quelle: string        // Pfad oder Text
  untertitel?: string
}
```

Platzhalter-Einträge für alle 8 Stationen anlegen (Inhalte kommen in Phase 3).

---

## #13 — Platzhalter-Stationsseite

**Labels:** `tech`
**Assignee:** Felix

Stationsseite zeigt:
- Raumbild (Placeholder-Grafik bis echte Fotos vorliegen)
- Titel + Beschreibungstext
- Media-Slot (leer, aber Komponenten-Struktur steht)
- Zurück-Button zur Startseite

Responsive (Mobile First — Eltern halten Handy im Hochformat).

---

## #14 — Startseite: schematisches Schulhaus

**Labels:** `tech`
**Assignee:** Felix

- Schematische Schulhaus-Grafik (SVG oder Bild) mit anklickbaren Punkten je Station
- Klick → navigiert zur Stationsseite
- Fortschrittsanzeige (Platzhalter, Logik kommt in Phase 2)
- Thomas-Idee: "wie im Museum, man sieht alle 8 Punkte auf einen Blick"

---

## #15 — QR-Code-Generator-Script

**Labels:** `tech`
**Assignee:** Felix

- Node-Script (oder npm-Befehl), das pro Station einen QR-Code als PNG generiert
- QR-Code zeigt auf: `https://[domain]/raum/[slug]?token=[token]`
- Ausgabe in `/public/qr/` oder separatem Ordner
- Druckfertig: min. 300dpi, schwarzweiß

---

## #16 — Deployment auf MPZ-Server testen

**Labels:** `tech`
**Assignee:** Felix

- Docker-Image bauen und auf Coolify/Hetzner deployen
- Domain/Subdomain festlegen (z.B. `schulnavigator.mpz-dresden.de`)
- HTTPS prüfen
- Health-Check erreichbar
- Ergebnis: Deploy-Link, den Sten/Tina im Browser öffnen können

---

## #17 — Raumfotos für alle 8 Stationen liefern

**Labels:** `content` `extern`
**Assignee:** Sten

Sten fotografiert alle 8 vereinbarten Räume (bei Sonnenschein, wurde im Gespräch zugesagt).
Format: Querformat, min. 1920px Breite, JPG.
Lieferdatum: bis 28.05. damit Phase 2 mit echten Bildern starten kann.
Bei Verzögerung: Platzhalter-Grafiken werden verwendet.
