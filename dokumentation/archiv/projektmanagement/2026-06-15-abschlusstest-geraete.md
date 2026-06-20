# Abschlusstest Geräte — Produktion (Issue #38)

**Datum:** 2026-06-15  
**Umgebung:** `https://schulnavigator.mpz.schule` (HTTPS)  
**Durchführung:** Felix (MPZ)

Verwandt: [issues-phase-3.md](../planung/archiv/issues-phase-3.md) (#38), [lokal-testen-und-anschauen.md](../../anleitungen/lokal-testen-und-anschauen.md)

---

## Getestete Geräte

| Gerät | OS / Browser | Ergebnis |
|-------|----------------|----------|
| iPhone 11 | iOS / Safari | OK |
| iPad Pro | iPadOS / Safari | OK |
| iPad (Modell A1893) | iPadOS / Safari | OK |
| LG Q6 | Android | OK |

---

## Checkliste #38 (fest-Flow)

| Punkt | Status | Anmerkung |
|-------|--------|-----------|
| Entry per System-Kamera → Startseite | ✅ | `fest-2026` |
| In-App-Scan pro Raum → Stempel + Hub-Freischaltung | ✅ | |
| Gesperrtes Hub-Segment im Modus `fest` nicht klickbar | ✅ | |
| Medien laden (Audio/Video/Foto/Text) | ✅ | inkl. MPZ-Upload-Pfade |
| Gyro-Viewer + Hotspots (Portrait, Tap) | ✅ | iPhone + iPad |
| Sphere-Viewer (360°) | ✅ | Pilot-Stationen |
| Dialog `daz` / `pc-raum` | ✅ | Maskottchen, Audio |
| Embed Delightex / Book Creator | ✅ | Touch-Fallback Delightex geprüft |
| Coach-Einblendungen | ✅ | Hub / Raum-first |
| 12/12 Stationen → Abschluss (Sparkle) | ☐ | optional nachziehen |
| Raum-QR in neuem Tab (System-Kamera) | ☐ | optional |

---

## Noch offen (vor 26.06.)

| Punkt | Issue | Verantwortlich |
|-------|-------|----------------|
| Mobilfunk-/WLAN-Test **am Schulgelände** (Hof, Turnhalle) | #91 | Felix |
| Schulfest-QR-Subset Druck + Sonnentest Outdoor | #89, Playbook | Felix / Schule |
| Finale Slug-Liste Schulfest (physisch vs. Hof-QR) | #90 | Schule |

---

## Nächste Schritte

1. QR-Schulfest-Set erzeugen: `cd app && npm run generate:qr -- --preset=schulfest` — siehe [schulfest-gs39-playbook.md](../../anleitungen/schulfest-gs39-playbook.md)
2. Mobilfunk-Rundgang an der Schule dokumentieren (kurzer Eintrag in diesem Dokument oder Playbook)
3. Nach Projekttag (24./25.06.): erneuter Spot-Check mit echtem Content
