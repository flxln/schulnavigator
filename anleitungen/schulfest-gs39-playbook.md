# Schulfest GS39 — Playbook (26.06.2026)

Operative Anleitung für Team und Schule am Schulfest. Technik: Modus **`fest`**, Entry-Token aus [`app/lib/access-token-constants.mjs`](../app/lib/access-token-constants.mjs) bzw. `public/qr/manifest-schulfest.json`, Raum-QRs → `/raum/{slug}` ([ADR-005](../dokumentation/adr/005-zugangskontrolle-token.md)).

**Quelle Strategie:** [issues-schulfest-gs39-nachtrag.md](../dokumentation/github-project/issues-schulfest-gs39-nachtrag.md) (Epic #86)

Verwandt: [qr-codes-drucken.md](./qr-codes-drucken.md) · [content-einpflegen.md](./content-einpflegen.md) · [Abschlusstest Geräte](../dokumentation/projektmanagement/2026-06-15-abschlusstest-geraete.md)

---

## 1. Ablauf für Besucher (Modus `fest`)

1. **Entry-QR** am Schuleingang scannen → `/eintritt?t=<fest-token>` → Cookie → Startseite (Hub gesperrt, 0/12).
2. **Raum-QR** scannen (In-App-Scanner `/scan` oder System-Kamera) → Station öffnet sich, Hub-Slot wird freigeschaltet.
3. Inhalt im Raum ansehen (Gyro, Hotspots, Medienliste).
4. Nächsten Raum-QR scannen — bis alle besuchten Stationen im Hub sichtbar sind.

**Hinweis:** Geschlossene Räume werden am Schulfest **nicht** an der Klassentür ausgehängt, sondern ggf. als **Hof-Virtualisierung** (gleicher Slug, QR auf dem Schulhof).

---

## 2. QR-Druckset (alle 12 Räume)

**Alle 12 Stationen** werden für das Schulfest generiert (`SCHULFEST_QR_SLUGS` in `app/scripts/qr-config.mjs`). Auch ohne vollständigen Raum-Content sind die Stationen in der App nutzbar — der Hub schaltet beim Scan frei.

**Physische Platzierung** (wo der QR hängt) ist unabhängig vom Druckset:

| Slug | Raum | Platzierung (Vorschlag) |
|------|------|-------------------------|
| `turnhalle` | Turnhalle | Im Raum / Eingang Turnhalle |
| `speiseraum` | Speiseraum | Speiseraum |
| `werken` | Werkenzimmer | Werken |
| `lesewelt` | Lesewelt (Mediathek) | Mediathek |
| `klassenzimmer` | Klassenzimmer | Klassenzimmer / Portal |
| `musik` | Musikzimmer | Raum oder Hof-Schild (Virtualisierung) |
| `daz` | DaZ-Zimmer | Raum oder Hof-Schild |
| `pc-raum` | PC-Raum | Raum oder Hof-Schild |
| `kunst` | Kunstzimmer | Raum oder Hof-Schild |
| `hort` | Hortzimmer | Raum oder Hof-Schild |
| `schulsozialarbeit` | Schulsozialarbeit | Raum oder Hof-Schild |
| `schulhof` | Schulhof | Schulhof-Schild |

Geschlossene Räume: QR **nicht** an der Klassentür, sondern ggf. als **Hof-Virtualisierung** (gleicher Slug).

> **Anpassung:** Tabelle mit Sten/Tina (#90). Kleineres Druckset: `--only=slug1,slug2` — Slugs im Code: `qr-config.mjs` → `SCHULFEST_QR_SLUGS`.

---

## 3. QR erzeugen

```bash
cd app
# Vorschau
npm run generate:qr -- --preset=schulfest --dry-run
# PNGs, PDFs + manifest-schulfest.json
npm run generate:qr -- --preset=schulfest
```

**Ausgabe:** `public/qr/entry-fest.png` + **12×** `raum-{slug}.png` + `manifest-schulfest.json` + `public/qr/pdf/qr-schulfest-a5-2up.pdf` und `qr-schulfest-a4-grid-3cm.pdf` (beschriftet mit Slug und Raumtitel — siehe [qr-codes-drucken.md](./qr-codes-drucken.md))

**Kleineres Set** (nur ausgewählte Räume drucken/aushängen):

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
- Modus **`heft`** im Schulstartheft (Heft-Token aus `manifest.json`) — alle Stationen sofort im Hub.
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
- [ ] Raum-QRs nach Platzierungstabelle ausgehängt (Tür oder Hof — nicht jeder QR muss an der Tür hängen)
- [ ] Hof-Schilder beschriftet und wetterfest
- [ ] Tablet-Fallback geladen (Entry-URL aus `manifest-schulfest.json` oder gedrucktem Entry-QR)
- [ ] MPZ erreichbar (Felix/Julia)
- [ ] Mobilfunk am Hof getestet ([#91](../dokumentation/github-project/issues-schulfest-gs39-nachtrag.md))
