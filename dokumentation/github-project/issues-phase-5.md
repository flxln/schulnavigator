# Issues — Phase 5: Post-Fest

Milestone: **Phase 5** | Fällig: 31.10.2026

Kein harter Termin. Prioritäten werden nach der Schulfest-Auswertung festgelegt.
Issues hier sind Vorausplanung — können nach dem 26.06. konkretisiert und neu priorisiert werden.

---

## #44 — Auswertung mit Schule

**Labels:** `org`
**Assignee:** Felix / Thomas

Meeting mit Sten und Tina nach dem Schulfest.
Fragen:
- Was hat gut funktioniert?
- Was hat Eltern/Kinder begeistert?
- Was war technisch problematisch (WLAN, Laden, Bedienung)?
- Welche Stationen sollen überarbeitet werden?
- Welche neuen Stationen sollen dazukommen?

Ergebnis: priorisierte Liste für Phase-5-Features.

---

## #45 — Bekannte Bugs und UX-Probleme dokumentieren

**Labels:** `tech`
**Assignee:** Felix

Alle während Projekttag und Schulfest beobachteten Probleme als Issues anlegen.
Besonders: mobile Darstellung, Ladezeiten, In-App-Scanner, Puzzle-Hub, Token/`heft`-Modus.

---

## #46 — Entscheidung: Content-Pflege langfristig

**GitHub:** geschlossen (2026-05-21)

**Labels:** `org`
**Assignee:** Thomas / Felix

**Status: entschieden (2026-05-21)** — [ADR-003](../adr/003-content-mvp-json-directus.md)

- Schule pflegt selbst über **Directus** (Headless CMS)
- MPZ betreibt Hosting und Mandanten
- Eigenes Custom-Admin **verworfen**

---

## #47 — Directus einführen und Content migrieren

**Labels:** `tech`
**Assignee:** Felix

Directus auf Coolify deployen; Collections aus JSON-Schema; Migration der 39. Grundschule.

Lehrkräfte können ohne Entwickler (über Directus-UI):
- Stationsbeschreibungen bearbeiten
- Medien hochladen und zuordnen
- Neue Stationen anlegen (Rollen abhängig)

Datenschutz: Login nur für Lehrkräfte, keine Schülerdaten im CMS.

---

## #48 — Englisch-Menü aktivieren

**Labels:** `tech`
**Assignee:** Felix

`en.json` vollständig übersetzen (Menütexte, Systemmeldungen).
Sprachumschalter in der UI aktivieren.
Content (Audio/Video) bleibt deutsch — nur UI-Texte mehrsprachig.
Tinas Motivation: englischsprachige Eltern (TU Dresden, internationale Familien).

---

## #49 — Weitere Stationen nachrüsten

**Labels:** `content` `org`
**Assignee:** Felix / Schule

Stationen mit schwachem Content oder technischen Problemen überarbeiten; ggf. **12.+ Station** (z. B. Außenbereich, Robotik-Werkraum) — Liste aus #44.
Aktuell **11 Stationen** im MVP; Erweiterung über JSON (bis Directus #47 live).

---

## #50 — Wunschliste Phase 2 evaluieren

**Labels:** `tech` `org`
**Assignee:** Thomas / Felix

Im Gespräch am 07.05. wurden mehrere Features diskutiert, die explizit auf "nach 26.6." verschoben wurden.
Nach der Auswertung entscheiden, welche davon umgesetzt werden:

- [ ] Echtes AR (Kamera/WebXR/iframe) — **nicht** MVP-Gyro-Viewer ([ADR-006](../adr/006-raum-viewer-gyro-hotspots.md))
- [ ] 360°-Panorama-Viewer
- [ ] Interaktive Trigger (Lego-Motor, Tafel-Steuerung per App)
- [ ] Mal-App im Kunstzimmer
- [ ] Mini-Spiel "Schulranzen packen"
- [ ] Kind-gezeichnete interaktive Schulhaus-Karte
- [ ] Verlinkung zu externen Lernspielen

Jedes Feature bekommt einen eigenen Issue wenn es beschlossen wird.

---

## #51 — Mandantenfähigkeit: andere Schulen vorbereiten

**Labels:** `tech`
**Assignee:** Felix

Thomas-Vision: Das MPZ stellt die Lösung anderen Schulen bereit.
Voraussetzungen:
- Schul-spezifische Konfiguration (Name, Logo, Maskottchen, Stationen, Token-Profile `fest`/`heft`) ausgelagert
- Deployment-Prozess für neue Schulen dokumentiert
- Onboarding-Anleitung für Lehrkräfte erstellt

Zeitrahmen: frühestens Schuljahr 2026/27.
