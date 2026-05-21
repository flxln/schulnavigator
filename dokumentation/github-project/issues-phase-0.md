# Issues — Phase 0: Architektur-Entscheidungen

Milestone: **Phase 0** | Fällig: 14.05.2026

---

## #1 — Stationen-Scope schriftlich fixieren

**GitHub:** geschlossen (2026-05-21) — 11 Stationen aus Material Tina, verbindlich laut Projektstand

**Labels:** `org` `blocker` `extern`
**Assignee:** Sten / Tina

Ursprünglich: schriftliche Liste mit Raumname, Medientyp, verantwortliche Klasse.

**Erledigt für Phase 0:** 11 Stationen aus Material Tina (`Virtueller Schulrundgang.html`) + Slugs in [`zuordnung-stationen-bilder.md`](../../auftraggeber/material/stationen/zuordnung-stationen-bilder.md) — Routing und Datenmodell können gebaut werden.

**Ausgelagert (Phase 2):** Medientyp + Klasse pro Station → Content-Lieferplan (#25, Meeting 10.06.).

---

## #2 — ADR: Routing-Schema

**GitHub:** geschlossen (2026-05-21) — [ADR-002](../adr/002-frontend-nextjs.md): `/raum/[slug]`

**Labels:** `tech` `blocker`
**Assignee:** Felix

---

## #3 — ADR: Video-Hosting

**GitHub:** geschlossen (2026-05-21)

**Labels:** `tech` `blocker`
**Assignee:** Felix

**Status: entschieden** — [ADR-004](../adr/004-video-hosting-mpz.md)

- Vorerst: Upload auf MPZ-Server (Datenschutz, DE)
- YouTube-Embed: Option nach rechtlicher Klärung (DSB/Schule); MVP nicht aktivieren
- Implikation: Speicher/Upload-Limit; Player-Schema `upload` | `youtube` vorbereiten

---

## #4 — ADR: Content-Management

**GitHub:** geschlossen (2026-05-21)

**Labels:** `tech`
**Assignee:** Felix

**Status: entschieden** — siehe [ADR-003](../adr/003-content-mvp-json-directus.md)

- MVP bis 26.6.: JSON im Repo, Pflege durch Felix/MPZ
- Langfristig: Directus (self-hosted, Coolify)
- Custom-Admin verworfen

---

## #5 — ADR: Zugangskontrolle

**GitHub:** geschlossen (2026-05-21) — [ADR-005](../adr/005-zugangskontrolle-token.md)

**Labels:** `tech`
**Assignee:** Felix

- Entry `/eintritt?t=…`, Speicherung in **`localStorage`**
- Modi: **`fest`** (kein Hub, In-App-Scanner) / **`heft`** (Hub, alle Stationen)
- Entry einmalig System-Kamera; Raum-QRs danach In-App-Scanner
- `fest`: Puzzle-Hub (progressive disclosure); `heft`: voller Hub
- Zwei Token (Fest + Schuljahr); Entry-QR bei Rotation neu drucken

---

## #6 — ADR: Wartung nach Schulfest

**GitHub:** geschlossen (2026-05-21) — [ADR-003](../adr/003-content-mvp-json-directus.md): Schule pflegt via Directus, MPZ Betrieb

**Labels:** `org` `blocker`
**Assignee:** Thomas / Felix

---

## #7 — AVV-Entwurf an Schule schicken

**GitHub:** geschlossen (2026-05-21) — Entwurf versendet; Unterschrift bis Schulfest → [#43](./issues-phase-4.md)

**Labels:** `org`
**Assignee:** Thomas

Auftragsverarbeitungsvertrag (AVV) zwischen MPZ und 39. Grundschule aufsetzen und zur Unterschrift schicken.
Muss bis zum Schulfest unterschrieben vorliegen.
Enthält: Hosting-Details, Speicherort der Daten (Deutschland), Verantwortlichkeiten.

---

## #8 — Maskottchen-Rechte klären (Giraffe / Maus)

**GitHub:** geschlossen (2026-05-21) — Freigabe: `auftraggeber/material/verlagsinfo/freigabe-bilder-bildrechte.pdf`; Nennung im Impressum offen

**Labels:** `org` `extern`
**Assignee:** Tina

---

## #55 — ADR: Raum-Viewer (Gyro, Hotspots)

**GitHub:** geschlossen (2026-05-21) — [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md)

**Labels:** `tech`
**Assignee:** Felix

- MVP: normales Querformat-Foto, **Gyro-Viewer Standard**, Hotspots, Tap-Fallback
- Nicht MVP: 360°-Panorama, Kamera-AR/WebXR
- Umsetzung: Phase 1 Schema (#12), Phase 2 Komponente (#55 in Phase 2), Phase 3 Hotspot-Koordinaten
