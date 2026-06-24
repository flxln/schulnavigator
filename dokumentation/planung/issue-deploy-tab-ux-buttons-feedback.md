# Issue: Deploy-Tab — sichtbare Buttons und Inline-Feedback

**Status:** erledigt (2026-06-24)  
**GitHub:** [#233](https://github.com/flxln/schulnavigator/issues/233) — geschlossen  
**Parent:** Nacharbeit [#230](https://github.com/flxln/schulnavigator/issues/230) · verwandt [#219](https://github.com/flxln/schulnavigator/issues/219) (S21) · Epic [#205](https://github.com/flxln/schulnavigator/issues/205)  
**Plan:** `.cursor/plans/issue_233_deploy-tab-ux_7a579108.plan.md` (lokal, gitignored)

---

## Problem

Im MPZ Studio Deploy-Tab (`/mpz/studio/deploy`) sind die Buttons **„Medien deployen“** und **„Vollständig deployen“** (Sektion Schüler-Medien, Bahn B) praktisch unsichtbar: `bg-brand-green` / `text-brand-red` sind nicht in `@theme inline` ([`globals.css`](../../app/app/globals.css)) registriert — weiße Schrift auf hellem Kartenhintergrund.

Die API `POST /api/mpz/deploy/sync-content` liefert `200`, aber es gibt **kein Inline-Feedback** in der Bahn-B-Sektion; die Ausgabe erscheint nur ganz unten auf der Seite.

## Ziel

Redakteur sieht klickbare Deploy-Buttons und erhält Erfolgs-/Fehler-Rückmeldung direkt unter der Aktion — ohne Scrollen.

## Akzeptanzkriterien

- [x] Buttons in „Schüler-Medien (Bahn B)“ visuell als Primär-Buttons erkennbar
- [x] Busy-State während des Laufs sichtbar
- [x] Nach erfolgreichem Sync: `MpzFormAlert` success direkt in der Sektion
- [x] Bei Fehler: `MpzFormAlert` error + optional `<details>` mit Skript-Log
- [x] Alle Deploy-Tab-Action-Buttons nutzen `mpzButtonClassName` (MPZ-Konvention)
- [x] `globals.css`: `--color-brand-green` und `--color-brand-red` in `@theme`
- [x] `deploy-tab.test.tsx` mit Success- und Fehler-Mock
- [x] `npm run test` grün (1159 Tests)

## Berührte Dateien

| Datei | Änderung |
|-------|----------|
| `app/app/globals.css` | MODIFY — Theme-Tokens |
| `app/components/mpz-studio/deploy-tab.tsx` | MODIFY — Buttons + Inline-Feedback |
| `app/components/mpz-studio/deploy-tab.test.tsx` | NEU |

**Nicht:** API, `deploy-content.sh`, neuer Deploy-Flow

## GitHub-Links

| Issue | URL |
|-------|-----|
| #233 | https://github.com/flxln/schulnavigator/issues/233 |
