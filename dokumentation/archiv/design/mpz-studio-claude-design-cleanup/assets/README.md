# Assets — Screenshots für Claude Design

Optional, aber **stark empfohlen** für ein Cleanup-Redesign: Zeigt das aktuelle „Durcheinander“.

## Aufnahme

```bash
cd app && npm run dev
```

Browser: http://localhost:3000/mpz/studio  
Fensterbreite: **~1280 px**  
PNG hier speichern und mit dem Paket hochladen.

Zugang: Studio läuft nur bei `NODE_ENV=development`. Ggf. zuerst `/mpz/unlock` mit Studio-Secret.

---

## Empfohlene Screenshots (Studio)

| Dateiname | Route / Aktion |
|-----------|----------------|
| `studio-dashboard.png` | `/mpz/studio` |
| `studio-stationen-grid.png` | `/mpz/studio/stationen` |
| `studio-station-stammdaten.png` | `/mpz/studio/stationen/klassenzimmer` |
| `studio-station-medien.png` | `…/klassenzimmer?tab=medien` |
| `studio-station-hotspots.png` | `…/klassenzimmer?tab=hotspots` |
| `studio-station-dialog.png` | `/mpz/studio/stationen/daz?tab=dialog` (Segment-Zeile mit Audio) |
| `studio-station-dialog-empty.png` | `/mpz/studio/stationen/klassenzimmer?tab=dialog` (ohne Dialog — „Dialog hinzufügen“) |
| `studio-coach.png` | `/mpz/studio/coach` |
| `studio-embeds.png` | `/mpz/studio/embeds` |
| `studio-hub.png` | `/mpz/studio/hub` |
| `studio-brand.png` | `/mpz/studio/brand` |
| `studio-deploy.png` | `/mpz/studio/deploy` |
| `studio-calib-flat.png` | `/mpz/calib/flat/klassenzimmer` |
| `studio-calib-sphere-ist.png` | **Ist:** `/raum/klassenzimmer?hotspot-calib=1` (Overlay) — Referenz für Migration |
| `studio-calib-sphere-soll.png` | **Soll (Mock):** S14 `/mpz/calib/sphere/klassenzimmer` — nach Design-Freeze |
| `studio-save-validate-error.png` | Nach fehlgeschlagener Validierung (rot) |

---

## Optional: Besucher-App (visuelle Referenz)

| Dateiname | Route |
|-----------|--------|
| `raum-klassenzimmer.png` | `/raum/klassenzimmer` (mit Eintritt-Token) |
| `hub-startseite.png` | `/` |

Nicht verpflichtend — Tokens und `09-ui-komponenten-referenz.md` reichen für Branding.

---

## Hinweis

Dieser Ordner ist im Repo leer (Screenshots nicht versioniert). Vor dem Upload manuell befüllen.
