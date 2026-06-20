# Claude Design — Version 1 (MPZ Studio)

**Export-Datum:** 2026-06-16  
**Quelle:** Claude Design  
**Aufgeräumt:** 2026-06-16 — Besucher-App (Schulnavigator-Rundgang) entfernt, nur Studio-Prototyp

## Ordner

```
version_1/mpz-studio-prototype/
├── MPZ Studio.html          ← Einstieg (interaktiver Prototyp)
├── studio-*.jsx             ← Screens (React + Babel)
├── tweaks-panel.jsx         ← Zustände umschalten (Edit-Panel)
├── uploads/                 ← Eingabe-Spec (Kopie des Upload-Pakets)
└── _ds/                     ← GS39 Design-Tokens (Claude Design System)
```

## Ansehen (lokal)

```bash
cd dokumentation/archiv/design/mpz-studio-claude-design/version_1/mpz-studio-prototype
python3 -m http.server 8765
```

Browser: http://localhost:8765/MPZ%20Studio.html

**Tweaks-Panel:** Screen-Zustände (`dashState`, `gridState`, `validateState`, …) — siehe `studio-app.jsx` → `TWEAK_DEFAULTS`.

## Abdeckung vs. v0-Spec

| v0-Screen | Datei |
|-----------|--------|
| S1 Shell | `studio-shell.jsx` |
| S2 Dashboard | `studio-dashboard.jsx` |
| S3 Stationen-Grid | `studio-stationen.jsx` |
| S4–S7, S10 Station Detail | `studio-stationen.jsx` |
| S8 Flat-Kalibrierung | `studio-calib.jsx` |
| S11 Save & Validate | `studio-app.jsx` |

Coach, Brand, Hub, Deploy: in Sidebar ausgegraut (`NAV_DISABLED`).

## Implementierung (SE 03)

- Prototyp, **nicht** Next.js — Umsetzung in `app/` mit `Gs39Button`, `Gs39Card`, `gs39-tokens.css`
- Epic [#144](https://github.com/flxln/schulnavigator/issues/144) · [ADR-022](../../../adr/022-mpz-studio-internes-ingest-tool.md)
