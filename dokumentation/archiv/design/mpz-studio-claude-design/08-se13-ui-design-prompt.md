---
tags:
  - prompt
  - software-engineering
  - 13-ui-design-konzept
erstellt: 2026-05-20
---
# UI-Design-Konzept — direkt einsetzbar

> **Situation:** Du weißt, was das System tun soll — aber nicht, wie die Oberfläche aussieht und aufgebaut ist.
> **Referenz:** [ui-design-konzept.md](ui-design-konzept.md)
> **Leitplanken:** [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)

---

Du bist Interface-Architekt. Deine Leitprinzipien sind Klarheit (Lesbarkeit, eindeutige Bedienelemente), Zurückhaltung (Oberfläche unterstützt Inhalt, nicht sich selbst) und Tiefe (visuelle Ebenen vermitteln Hierarchie). Entwirf das UI-Konzept für folgende Anwendung.

**Produkt:**
[Beschreibe in 2–3 Sätzen: Was tut die Anwendung, für wen?]

**Plattform und Zielgeräte:**
- [z. B. Web (Desktop + Tablet), native iOS-App, Electron Desktop-App]
- Responsive nötig? [Ja / Nein — wenn ja: welche Breakpoints sind relevant?]

**Nutzerprofil:**
- Wer benutzt es? [z. B. Sachbearbeiter im Büro, Schüler am Tablet, Außendienst-Techniker unterwegs]
- Technische Vorkenntnisse: [z. B. gering — kein Technik-Hintergrund]
- Nutzungshäufigkeit: [z. B. täglich 4+ Stunden / gelegentlich 1× pro Woche]
- Nutzungskontext: [z. B. am Schreibtisch mit großem Monitor / unterwegs mit einer Hand am Smartphone]

**Bestehendes Design-System:**
- [z. B. Material Design 3 / Tailwind + eigene Tokens / keins (Greenfield)]
- Vorhandene Komponentenbibliothek: [z. B. shadcn/ui, Ant Design — oder: keine]

**Barrierefreiheit:**
- Zielstufe: [z. B. WCAG 2.1 AA / keine explizite Vorgabe]
- Besondere Anforderungen: [z. B. hoher Anteil sehbeeinträchtigter Nutzer / motorische Einschränkungen / keine besonderen]

**Kern-User-Stories (3–5):**
1. [z. B. „Nutzer erstellt ein neues Projekt mit Titel, Beschreibung und Fälligkeitsdatum"]
2. [z. B. „Nutzer findet eine ältere Rechnung über die Suche und lädt das PDF herunter"]
3. [z. B. „Admin weist einem Teammitglied eine Aufgabe zu und setzt Priorität"]
4. [...]
5. [...]

**Bewusst ausgeschlossen in dieser Phase:**
[Was braucht die UI noch NICHT? z. B. „kein Onboarding-Wizard, kein Dark Mode, kein Dashboard mit Charts"]

---

Liefere:

1. **Informationsarchitektur** — Seitenhierarchie, Navigationsstruktur, Benennung der Hauptbereiche

2. **Komponenteninventar** — benötigte UI-Komponenten mit Zweck, Zuständen (Default, Hover, Active, Disabled, Error, Loading) und Dateninhalt

3. **Interaktionsflüsse** — pro Kern-User-Story: Screen → Aktion → Feedback → nächster Screen. Fehlerpfade und Ladezustände einschließen.

4. **Visuelle Systematik:**
   - Typografie-Hierarchie (Überschriften, Fließtext, Labels, Hilfetext)
   - Farbsystem (Primär, Sekundär, Semantisch, Neutral — mit Kontrastprüfung)
   - Spacing-/Grid-System (Basis-Einheit, Breakpoints)
   - Ikonografie-Stil und Quelle
   - Dark Mode (falls im Scope)

5. **Barrierefreiheit als Designentscheidung** — Fokusreihenfolge, Touch-Target-Größen (≥ 44×44 pt), farbunabhängige Zustandskommunikation, Screen-Reader-Strategie

6. **Plattform-Konventionen** — welche Standardmuster der Zielplattform übernommen werden und wo bewusst abgewichen wird (mit Begründung)

**Qualitätsregel:** Jede Kern-User-Story hat einen vollständigen Interaktionsfluss mit Fehlerpfaden. Mindestens eine Designentscheidung ist explizit mit einem HIG-Prinzip (Klarheit, Zurückhaltung, Tiefe) begründet. Barrierefreiheit taucht in mindestens drei konkreten Entscheidungen auf — nicht als Anhang. Kein Implementierungscode.


## Verwandte Notizen

- [[00_Meta/Agenten_Framework/Prompts_Software_Engineering/README|Prompts Software Engineering]] — Übergeordnete Notiz
