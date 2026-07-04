---
tags:
  - post-mortem
  - feature-port
  - kunde-39-gs
  - mpz-studio
erstellt: 2026-07-04
---

# Post-Mortem — MPZ Studio kunde/39-gs → feature/mpz-studio (2026-07-04)

**Abgleich zwischen Plan (`.cursor/plans/mpz_kunde→feature_port_bc2fdfc9.plan.md`) und Ausführung.**

Pfadbasierter Port (kein Branch-Merge) brachte den Funktionsstand von `kunde/39-gs` auf `feature/mpz-studio`, ohne #218-Design-Dateien zu überschreiben. Alle Akzeptanzkriterien erfüllt; `npm run test` 1159/1159, `npm run build` grün (Structure-Validatoren).

---

## 1. Commits

| Branch | Commit | Inhalt |
|--------|--------|--------|
| `feature/mpz-studio` | `9df7355` | 81 Dateien: Deploy (#228–#230, #233), ADR-026 + Chain-on-Save, Raumbild-Limits, Safari-Modal, MPZ-Banner |
| `kunde/39-gs` | unverändert | Kein Merge, kein Push von feature nach kunde |

**Merge-Base der Divergenz:** `8c5517d` (2026-06-24)

---

## 2. Port-Umfang

| Block | Inhalt |
|-------|--------|
| Deploy-Infrastruktur | `sync-content` API, `mpz-deploy-*`, Scripts, Middleware, Media-Route, `package.json` Build-Pipeline |
| Dialog ADR-026 | optionales `quelle`, Segment-Formular Chain-on-Save, Viewer (`dialog-player`, Playlist) |
| Studio-UX | Raumbild 8/12 MB, Safari-Modal, Vorschau-Control, Hotspot-Ingest |
| MPZ-Banner | `mpz-offer-banner`, Home + Eintritt (+ `eintritt-scan-link`) |

**Bewusst nicht portiert:** Legal-Seiten, GS39-Content (`stations.json`, `public/`-Medien), Raum-Viewer-Marker.

**#218 beibehalten (feature):** `hub-panel.tsx`, `design-page-shell.tsx`, `brand-panel.tsx`, `design/page.tsx`

---

## 3. Abweichungen vom Plan

| Thema | Befund |
|-------|--------|
| `station-dialog-segment-form.test.tsx` | Slug `kunst` → `daz`; Tests für Audio-Vorschau auf `mode="add"` (kein Dialog auf `kunst` in Feature-`stations.json`) |
| `mpz-medium-references.test.ts` | Feature-Version beibehalten (GS39-Klassenzimmer-Assertions passen nicht zur Demo-`stations.json`) |
| `middleware.test.ts` | `HEFT_DEV_TOKEN` statt `FEST_DEV_TOKEN` im Test „kein Upgrade“ (Assertion passte nicht zu Middleware-Logik) |
| `eintritt-scan-link.tsx` | Zusätzlich portiert (Abhängigkeit von `eintritt-screen.tsx`) |
| `audio-autoplay-unlock.ts` | Zusätzlich portiert (Abhängigkeit von `home-screen.tsx`) |
| `studio-demo-klassenzimmer.ts` | Test-Fixture von kunde mitportiert |

---

## 4. Verifikation

- `cd app && npm run test` — 1159/1159 grün
- `cd app && npm run build` — grün (`validate:stations:structure`, `validate:coach:structure`)
- #218-Polish in Hub/Design/Brand auf feature unverändert (Diff zu kunde in diesen 4 Dateien)

---

## 5. Branch-Stand nach Abschluss

| Branch | Status |
|--------|--------|
| `feature/mpz-studio` | `9df7355` + Doku-Commit; gepusht nach `origin` |
| `kunde/39-gs` | unverändert (Prod-Deploy-Branch) |
| `main` | unberührt |

---

## 6. Offene Punkte (Übergabe)

- **#221** (Text-only Dialog): Code auf feature via Port; Lesewelt-Pilot-Content weiter separat (Issue-Akzeptanz „Content nach Merge“).
- **`welcome-hub.wav`:** Altschuld auf feature (#210); Build nutzt Structure-Validator — kein Blocker dieses Ports.
- **Rückport #218 → kunde:** Nur bei Bedarf pfadbasiert; aktuell nicht nötig (kunde hat funktionalen Stand, älteres Hub/Design-Styling).

## Fazit

Port plankonform, vollständig, ohne Datenverlust auf `kunde/39-gs`. `feature/mpz-studio` ist funktional mit `kunde/39-gs` synchron (Deploy, Dialog, UX), behält #218-Visual-Polish. Abnahmefähig für Weiterentwicklung auf `feature/*`.
