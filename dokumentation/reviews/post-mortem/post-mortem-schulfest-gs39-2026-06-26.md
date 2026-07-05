---
tags:
  - post-mortem
  - schulfest
  - gs39
erstellt: 2026-07-05
---

# Post-Mortem — Schulfest GS39 (26.06.2026)

**Rückwirkend dokumentiert** aus Repo-Commits, Playbook und Audit Phase 5 (2026-07-04). Kein Gesprächsprotokoll mit Schule lag vor.

---

## 1. Kontext

- **Event:** Schulfest 39. Grundschule Dresden, 26.06.2026
- **Modus:** `fest` — 1 Entry-QR + 12 Raum-QRs, 5 physische Räume + Hof-Virtualisierung
- **Playbook:** [schulfest-gs39-playbook.md](../../anleitungen/schulfest-gs39-playbook.md), Epic [#86](https://github.com/flxln/schulnavigator/issues/86)

---

## 2. Was funktionierte (Repo-Beleg)

| Thema | Beleg |
|-------|-------|
| Abschlusstest 15.06. | 4 Geräte, fest-Flow grün ([2026-06-15-abschlusstest-geraete.md](../../anleitungen/archiv/2026-06-15-abschlusstest-geraete.md)) |
| QR-Druckset | #130 erledigt (PR #131) |
| Post-Fest-Umstellung | Entry-fest-QR → Heft-Hub ohne Neudruck (`FEST_ENTRY_HUB_MODE='heft'`, 27.06.) |
| Legal-Seiten global | Commit `d79d994` |

---

## 3. Hotfixes während/nach Fest (→ #45)

| Beobachtung (abgeleitet) | Fix | Commit |
|--------------------------|-----|--------|
| iOS Audio-Autoplay blockiert Dialog/Coach | Audio-Unlock-Geste | `cf63e0b` |
| Scan-CTA unklar ohne Buddy | „Scanne einen beliebigen Code" | `65a1119` |
| Coach-Texte zu lang/komplex | Willkommenstexte vereinfacht | kunde 25.–27.06. |
| Embeds Schulhof/Klassenraum fehlten | Delightex/Book-Creator ergänzt | kunde 25.–27.06. |
| Raumbild Schulsozialarbeit fehlte | Nachgeliefert | kunde 27.06. |

Diese Punkte sind als GitHub-Issues unter [#45](https://github.com/flxln/schulnavigator/issues/45) nachzuziehen.

---

## 4. Nicht protokolliert (offen für #44-Meeting)

- #89 Sonnentest Outdoor-QR
- #90 Schriftliche Playbook-Freigabe
- #91 WLAN-Test Hof
- #88 Content-Checkliste
- 12/12-Sparkle real erlebt (#38-Rest)

---

## 5. Lessons Learned

1. **Audio-Autoplay:** Fix vor Fest einplanen; iOS erfordert Nutzergeste.
2. **Scan-Verständnis:** Ohne Buddy niedrige Scan-Rate einplanen (Playbook).
3. **Dokumentation:** Beobachtungen zeitnah protokollieren — nicht nur in Commit-Messages.
4. **Compliance:** Media-Gate fehlte bis 05.07.2026 (Audit S1) — Prod-Fix Middleware + Route.

---

## 6. Nächste Schritte

- [ ] Meeting #44 mit Leitfaden [2026-06-meeting-44-leitfaden.md](../archiv/projektmanagement/2026-06-meeting-44-leitfaden.md)
- [ ] #45-Issues für Hotfixes anlegen
- [ ] Must/Should/Could für Herbst/TOT aus #44-Synthese
