# Verifikations-Inventar – Schulnavigator

**Stand:** 2026-11-02 · **Nachbar:** `dokumentation/planung/harness-inventar.md`

**Zweck:** Triage und Post-Mortem gleichen behauptete Laufzeit-Checks gegen die hier deklarierten Fähigkeiten ab.

## Deklarierte Fähigkeiten

| Feld | Wert | Hinweis |
|------|------|---------|
| **Start-Befehl** | `cd app && npm run dev:http` | Dev-Server ohne HTTPS-Zertifikate; `npm run dev` braucht `certificates/` |
| **Smoke-Befehl** | `cd app && npm run test` | Vitest. `tsc --noEmit` meldet bekannte Fehler in `middleware.test.ts` und `qr-pdf-layouts.test.ts` |
| **Browser-Zugriff** | ja (Claude in Chrome) | Nur in Claude-Code-Sessions mit der Chrome-Erweiterung |

## Stale-Regel

| Wann | Aktion |
|------|--------|
| Vor jeder Triage | Stand prüfen; älter als 14 Tage → Triage vermerkt Stale (kein Blocker) |
| Nach Stack- oder Harness-Wechsel | Befehle und Browser-Zeile aktualisieren |
