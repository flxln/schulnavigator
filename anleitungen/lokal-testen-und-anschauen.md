# Schulnavigator — Lokal anschauen und testen

_Kurzanleitung: Entwicklungsstand im Browser prüfen, typische Checks, produktionsnahes Verhalten._

Ausführliches Setup und Docker: [`fuer-entwickler.md`](./fuer-entwickler.md).

---

## Voraussetzung

- Node.js 20+ und npm
- Terminal im Verzeichnis **`app/`** (alle `npm`-Befehle dort)

---

## 1. Entwicklungsserver (Alltag)

```bash
cd app
npm install   # nur bei erstem Mal oder nach Dependency-Änderung
npm run dev
```

- **URL:** [http://localhost:3000](http://localhost:3000)
- **Änderungen** an Code/CSS: Seite lädt in der Regel automatisch nach (Hot Reload).

**Sinnvolle Seiten zum Durchklicken:**

| Seite | Zweck |
| ----- | ----- |
| [http://localhost:3000/](http://localhost:3000/) | Startseite (Phase 1 noch minimal) |
| [http://localhost:3000/raum/musik](http://localhost:3000/raum/musik) | Demo: Raumbild, **2 Hotspots**, **4 Medien-Slots** (alle Typen) |
| [http://localhost:3000/raum/schulsozialarbeit](http://localhost:3000/raum/schulsozialarbeit) | **Ohne** Raumbild: statischer Platzhalter + Text-Medium |
| [http://localhost:3000/raum/klassenzimmer](http://localhost:3000/raum/klassenzimmer) | Raumbild + **leere** Medienliste (Empty-State) |
| [http://localhost:3000/raum/gibts-nicht](http://localhost:3000/raum/gibts-nicht) | **404** (nur im Dev-Server; unbekannte Slugs sind zur Build-Zeit fest) |

**Hinweis zu 404:** Die Routen kommen aus `data/stations.json` (`generateStaticParams`). Ein Slug, der **nicht** in der JSON-Datei steht, liefert in der **Produktion** nach `npm run build` eine 404-Seite. Unter `npm run dev` zeigt Next.js oft eine dynamische 404 — zum Verhalten wie online unbedingt **Abschnitt 3** ausführen.

---

## 2. Mobil / schmales Layout prüfen

1. Browser **Entwicklertools** öffnen (z. B. F12 oder Rechtsklick → Untersuchen).
2. **Geräte-Symbol** aktivieren (responsive Modus).
3. Viewport z. B. **375 × 667** wählen und `/raum/musik` erneut laden.

So prüfst du, ob nichts horizontal scrollt und Stubs (Viewer, Medien) im Hochformat sinnvoll wirken.

---

## 3. Wie online: Build + Start

Entspricht dem, was `npm run build` auf dem Server bzw. in Docker auch macht (inkl. Asset-Check):

```bash
cd app
npm run build
npm run start
```

- App unter [http://localhost:3000](http://localhost:3000) (Port siehe Terminal-Ausgabe).
- Zum Beenden: im Terminal `Ctrl+C`.

`npm run build` ruft zuvor **`npm run validate:stations`** auf: Es muss jede in `stations.json` referenzierte Datei unter `public/` existieren (Raumbilder, Demo-Medien). Fehlt etwas, bricht der Build mit einer klaren Meldung ab.

---

## 4. Schnelle Qualitätschecks (ohne Browser)

Im Ordner `app/`:

```bash
npm run validate:stations   # nur Asset-Pfade prüfen
npm run lint                  # ESLint
npm run format:check          # Prettier (nur Prüfung)
```

---

## 5. Health-Check (API)

Mit laufendem Server (`dev` oder `start`):

```bash
curl -s http://localhost:3000/api/health
```

Erwartung: HTTP **200** und eine kurze OK-Antwort (für Monitoring/Coolify relevant).

---

## 6. Docker (optional)

Identisches Laufzeit-Image wie in Produktion — Schritt-für-Schritt: Abschnitt **Docker** in [`fuer-entwickler.md`](./fuer-entwickler.md).

---

## Kurz-Checkliste vor einem Push

1. `npm run build` im Ordner `app/` erfolgreich
2. `npm run lint` ohne Fehler
3. Manuell `/raum/musik` und eine zweite Station im Browser geöffnet

Bei Fragen zum Datenmodell oder zu Stationen: [`data/stations.json`](../app/data/stations.json) und [`auftraggeber/material/stationen/zuordnung-stationen-bilder.md`](../auftraggeber/material/stationen/zuordnung-stationen-bilder.md).
