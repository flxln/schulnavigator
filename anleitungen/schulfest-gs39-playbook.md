# Schulfest GS39 — Playbook (26.06.2026)

Operative Anleitung für Team und Schule am Schulfest. Technik: Modus **`fest`**, Entry `fest-2026`, Raum-QRs → `/raum/{slug}` ([ADR-005](../dokumentation/adr/005-zugangskontrolle-token.md)).

**Quelle Strategie:** [issues-schulfest-gs39-nachtrag.md](../dokumentation/github-project/issues-schulfest-gs39-nachtrag.md) (Epic #86)

Verwandt: [qr-codes-drucken.md](./qr-codes-drucken.md) · [content-einpflegen.md](./content-einpflegen.md) · [Abschlusstest Geräte](../dokumentation/projektmanagement/2026-06-15-abschlusstest-geraete.md)

---

## 1. Ablauf für Besucher (Modus `fest`)

1. **Entry-QR** am Schuleingang scannen → `/eintritt?t=fest-2026` → Cookie → Startseite (Hub gesperrt, 0/12).
2. **Raum-QR** scannen (In-App-Scanner `/scan` oder System-Kamera) → Station öffnet sich, Hub-Slot wird freigeschaltet.
3. Inhalt im Raum ansehen (Gyro, Hotspots, Medienliste).
4. Nächsten Raum-QR scannen — bis alle besuchten Stationen im Hub sichtbar sind.

**Hinweis:** Geschlossene Räume werden am Schulfest **nicht** an der Klassentür ausgehängt, sondern ggf. als **Hof-Virtualisierung** (gleicher Slug, QR auf dem Schulhof).

---

## 2. QR-Drucksubset (Vorschlag bis Freigabe Schule)

Nicht alle 12 Stationen drucken — Ziel **≤7 Raum-QRs + 1 Entry** ([Council-Empfehlung](../protokolle/analyse-schulnavigator-gs39-nachtrag.md)).

| Slug | Raum | Rolle am Schulfest | QR-Platzierung (Vorschlag) |
|------|------|--------------------|----------------------------|
| `turnhalle` | Turnhalle | physisch offen | Im Raum / Eingang Turnhalle |
| `speiseraum` | Speiseraum | physisch offen | Speiseraum |
| `werken` | Werkenzimmer | physisch offen | Werken |
| `lesewelt` | Lesewelt (Mediathek) | physisch offen | Mediathek |
| `klassenzimmer` | Klassenzimmer | physisch offen (optional) | Klassenzimmer / Portal |
| `musik` | Musikzimmer | Hof-Virtualisierung | Schulhof-Schild |
| `daz` | DaZ-Zimmer | Hof-Virtualisierung | Schulhof-Schild |

**Nicht im Schulfest-Subset (Vorschlag):** `pc-raum`, `kunst`, `hort`, `schulsozialarbeit`, `schulhof` — nur Hub oder Tag der offenen Tür.

> **Freigabe:** Tabelle mit Sten/Tina anpassen (#90). Slugs im Code: `app/scripts/qr-config.mjs` → `SCHULFEST_QR_SLUGS`.

---

## 3. QR erzeugen

```bash
cd app
# Vorschau
npm run generate:qr -- --preset=schulfest --dry-run
# PNGs + manifest-schulfest.json
npm run generate:qr -- --preset=schulfest
```

**Ausgabe:** `public/qr/entry-fest.png` + 7× `raum-{slug}.png` + `manifest-schulfest.json`

**Abweichende Slug-Liste** (nach Schul-Freigabe):

```bash
npm run generate:qr -- --only=turnhalle,speiseraum,werken,lesewelt,musik,daz
```

Nur Entry `fest` bei `--preset=schulfest`; für Heft-Material separat:

```bash
npm run generate:qr
```

---

## 4. Outdoor-Spezifikation (Schulhof)

| Parameter | Wert |
|-----------|------|
| Mindestgröße | **5 × 5 cm** (besser für Sonne) |
| Fehlerkorrektur | **Level H** (Generator-Default) |
| Material | **Matt** laminiert, kein Hochglanz |
| Beschriftung | Raumname + „Scannen → Station in der App“ |
| Test | Scan aus **1 m**, **Sonnenlicht**, iOS + Android |

Sonnentest protokollieren (Datum, Scan ja/nein) — Zeile in [Abschlusstest](../dokumentation/projektmanagement/2026-06-15-abschlusstest-geraete.md) oder hier ergänzen.

---

## 5. Tag der offenen Tür (separat)

- Menschen in (fast) allen Räumen; App **ergänzt** Live-Gespräche.
- Modus **`heft`** im Schulstartheft (`heft-2026-27`) — alle Stationen sofort im Hub.
- Raum-QRs eher **an der Tür**; ggf. volles Set `npm run generate:qr` (alle 12 + 2 Entry).

---

## 6. Notfall

| Problem | Maßnahme |
|---------|----------|
| Kein Mobilfunk | Tablet-Fallback ([#41](../dokumentation/github-project/issues-phase-4.md)) — Entry-URL einmal öffnen |
| App nicht erreichbar | MPZ-Ansprechpartner ([#42](../dokumentation/github-project/issues-phase-4.md)) |
| Scan klappt nicht | Buddy am Hof; QR-Größe / Beschädigung prüfen |

---

## 7. Checkliste am 26.06.

- [ ] Entry-QR `fest` am Eingang sichtbar
- [ ] Nur Schulfest-Subset ausgehängt (keine 12× Tür-QR)
- [ ] Hof-Schilder beschriftet und wetterfest
- [ ] Tablet-Fallback geladen (`/eintritt?t=fest-2026`)
- [ ] MPZ erreichbar (Felix/Julia)
- [ ] Mobilfunk am Hof getestet ([#91](../dokumentation/github-project/issues-schulfest-gs39-nachtrag.md))
