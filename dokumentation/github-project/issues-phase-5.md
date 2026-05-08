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
Besonders: mobile Darstellung, Ladezeiten, QR-Code-Scan-Verhalten.

---

## #46 — Entscheidung: Admin-Interface

**Labels:** `org` `blocker`
**Assignee:** Thomas / Felix

Kernfrage: Wer pflegt Content langfristig ein?

- Option A: Schule pflegt selbst → Admin-Interface entwickeln (Issues #47)
- Option B: MPZ pflegt auf Anfrage → kein Admin-Interface nötig, Prozess dokumentieren

Diese Entscheidung wurde im Gespräch am 07.05. aufgeschoben. Muss jetzt getroffen werden.

---

## #47 — Admin-Interface entwickeln

**Labels:** `tech`
**Assignee:** Felix

*(Nur wenn Issue #46 mit Option A entschieden wurde)*

Lehrkräfte können ohne Entwickler:
- Stationsbeschreibungen bearbeiten
- Medien hochladen und zuordnen
- Neue Stationen anlegen

Technologie-Entscheidung: eigenes CMS (z.B. Payload CMS) oder einfaches Form-Interface.
Datenschutz: Login nur für Lehrkräfte, keine Schülerdaten im Admin.

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

Stationen, die für 26.6. nicht geschafft wurden, nachträglich ergänzen.
Konkrete Liste ergibt sich aus Issue #44 (Auswertung).
Mögliche Kandidaten aus dem Gespräch: restliche Klassenzimmer, Außenbereich, Hortraum.

---

## #50 — Wunschliste Phase 2 evaluieren

**Labels:** `tech` `org`
**Assignee:** Thomas / Felix

Im Gespräch am 07.05. wurden mehrere Features diskutiert, die explizit auf "nach 26.6." verschoben wurden.
Nach der Auswertung entscheiden, welche davon umgesetzt werden:

- [ ] AR-Elemente (Augmented Reality via WebXR/iframe)
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
- Schul-spezifische Konfiguration (Name, Logo, Maskottchen, Stationen) ausgelagert
- Deployment-Prozess für neue Schulen dokumentiert
- Onboarding-Anleitung für Lehrkräfte erstellt

Zeitrahmen: frühestens Schuljahr 2026/27.
