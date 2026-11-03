## ADR-032: MPZ Studio als schmales Produktions-Admin statt Directus

**Labels:** `tech` `documentation`

Directus wird nicht das CMS für die Pflege durch Lehrkräfte. Ab v12 (MSCL, 10. Juni 2026) läuft eine Instanz ohne Lizenzschlüssel auf der Core-Stufe: drei Studio-Sitze, kein SSO, eigene Berechtigungsregeln werden ignoriert. Ein Grant- oder Bezahlschlüssel prüft alle 12 Stunden gegen `licensing.directus.com`. Payload, Strapi, PocketBase, NocoDB, Baserow und Git-CMS scheitern an anderen harten Grenzen (Bericht siehe Kontext).

Entscheidung von Felix am 3. November 2026: MPZ Studio wird jetzt zu einem schmalen Admin ausgebaut, das auf dem Live-Server läuft. Erste Nutzer sind MPZ-Konten; Lehrkräfte folgen in einer zweiten Stufe, sobald sie benannt sind.

**Aufgaben:**
- [ ] ADR-032 schreiben: ersetzt das Directus-Zielbild aus ADR-003 und das Verbot eines eigenen Admins; ersetzt ADR-029 und ADR-031, soweit sie Directus voraussetzen; ergänzt ADR-022 (Produktionsmodus)
- [ ] Schnitt festhalten: Stufe 1 (MPZ live), Stufe 2 (Lehrkräfte), ausgeschlossener Umfang (Undo, Entwürfe, weitere Rollen, Audit über „wer, wann, welche Station“ hinaus, Mehrsprachigkeit)
- [ ] Single-Source-of-Truth-Regel für `stations.json` nach Aktivierung des Volumes
- [ ] Eintrag in `dokumentation/entscheidungen.md`, Hinweise in ADR-003, 022, 029, 031
- [ ] Folge: neues Epic anlegen, Directus-Issues (#47, #255 bis #263) zuordnen oder schließen (eigener Schritt nach Review des ADR)

**Akzeptanzkriterium:** ADR-032 ist entschieden und im Index; ADR-003, 022, 029 und 031 verweisen darauf; der ausgeschlossene Umfang steht ausdrücklich im ADR.

**Nicht in diesem Issue:** App-Code, Schließen der Directus-Issues, Epic-Anlage.

---

## Kontext

- Bericht: `dokumentation/reviews/cms-alternativen-2026-11-03.md` (Lizenzprüfung Directus und Alternativen, 3. November 2026)
- ADR-003, ADR-022, ADR-029, ADR-031
- Epic Directus: #47
