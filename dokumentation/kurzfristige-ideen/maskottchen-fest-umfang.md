# Maskottchen zum Fest — konkreter Umfang

_Konkreter, bewusst kleiner Schnitt der [Fortschritts-Einblendung](./maskottchen-fortschritt-einblendung.md) für den Einsatz am Schulfest. Nicht das volle Trigger-System — nur die drei Auftritte, die sich lohnen und niemanden stören._

**Bezug:** [Fortschritts-Einblendung (Vollidee)](./maskottchen-fortschritt-einblendung.md) · [ADR-011](../adr/011-dialog-mascot-hotspots.md) (Raum-Dialog, bleibt getrennt) · Fortschritt: `sn_visited_slugs`, `SparkleBurst` (#63)

**Entscheidung:** Chat 2026-06-03 — zum Fest gibt es **drei** Maskottchen-Auftritte: ein großes Slide-In beim Start, ein Maskottchen als CTA, eine Abschlussfeier mit Sparkle. Mehr nicht.

---

## Die drei Auftritte

### 1. Großes Slide-In beim ersten Hub-Aufruf

- **Wann:** Erster Aufruf / Login auf dem Hub (`/`), nachdem hydratisiert ist. Pro Gerät einmal (`localStorage`, analog `sn_sparkle_done`).
- **Was:** Großes Maskottchen schiebt sich ein (Slide-In), kurze Begrüßung + Erklärung, wie der Rundgang funktioniert (Gebäude antippen / QR-Code an der Tür scannen).
- **Schließen:** X oder Tap auf Hintergrund. `prefers-reduced-motion` → nur Fade statt Slide.
- **Charakter:** Begrüßung/Onboarding, einmalig. Bewusst groß, weil es der Einstiegsmoment ist und die Aufmerksamkeit hier frei ist.

### 2. Maskottchen als CTA (dauerhaft auf dem Hub)

- **Wann:** Steht fest auf dem Hub, unabhängig vom Slide-In. Verschwindet nicht beim Wegklicken.
- **Was:** Kleines Maskottchen als sichtbarer Handlungs-Anker — führt zur Kernaktion (Raum öffnen / scannen). Verlässlich sichtbar, weil *funktional*: Wer das Slide-In wegtippt oder verpasst, findet hier weiterhin den Weg.
- **Charakter:** Kein Popup, keine Einblendung — Teil der Hub-UI.

### 3. Abschlussfeier mit Sparkle (11/11)

- **Wann:** Alle Stationen besucht (`visitedCount === 11`). Einmalig (`sn_sparkle_done` bleibt der Marker).
- **Was:** Maskottchen(e) ragen rein + `SparkleBurst` im Hintergrund. **Ein** Moment, nicht zwei nebeneinander.
- **Charakter:** Belohnung/Feier. Der emotional stärkste Auftritt, Risiko „nervig" = null, weil der Rundgang vorbei ist.

---

## Was bewusst NICHT zum Fest dabei ist

- Keine Mitten-Meilensteine (3 / 6 / 10 Räume). Erst am Fest beobachten, ob Einblendungen stören — dann ggf. nachrüsten.
- Keine generische Trigger-Engine, kein `coach-messages.json` + Validator, kein Provider/Hook-System. Das kommt erst, wenn es mehrere echte Trigger und Pflegebedarf gibt.
- Keine raumbezogenen Einblendungen (`room-first-*`).
- Kein `fest-locked-tap` als Figur — der gesperrte-Raum-Hinweis bleibt vorerst `Gs39Toast`.
- Kein Coach-Audio. Nur Text.
- Der Raum-Dialog (ADR-011) bleibt davon unberührt und getrennt.

---

## Zu klären (vor Umsetzung)

1. **Slide-In vs. CTA — getrennte oder gemeinsame Komponente?** Inhalt überschneidet sich (Begrüßung + Scan-Hinweis). Vorschlag: getrennt, weil unterschiedliche Lebensdauer (einmalig flüchtig vs. dauerhaft).
2. **Welche Figur wo?** Slide-In, CTA, Feier — Frieda, Otto oder beide je Auftritt.
3. **Copy:** Texte für die drei Auftritte mit MPZ abstimmen.
4. **Feier 11/11:** Maskottchen *mit* Sparkle im Hintergrund (ein Moment) — bestätigen.

---

## Checkliste

- [ ] Copy für Slide-In, CTA, Feier mit MPZ abstimmen
- [ ] Figur-Zuordnung je Auftritt festlegen
- [ ] Slide-In-Komponente (einmalig, `localStorage`, `reduced-motion`)
- [ ] Maskottchen-CTA in Hub-UI
- [ ] 11/11-Feier: Maskottchen + bestehender `SparkleBurst` zusammenführen
- [ ] `prefers-reduced-motion` manuell prüfen
- [ ] `lokal-testen-und-anschauen.md` ergänzen

---

_Erfasst: 2026-06-03 — konkreter Fest-Schnitt aus der Fortschritts-Einblendungs-Idee._
