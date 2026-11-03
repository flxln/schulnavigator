## Epic: MPZ Studio Produktionsmodus (ADR-032)

MPZ Studio bekommt neben dem Dev-Modus einen Produktionsmodus auf dem Live-Server: Konten pro Person, Live-Fassung von `stations.json` auf einem Content-Volume, Lesen zur Request-Zeit mit Fallback auf das Image, Medien nur hinter dem Entry-Cookie. Ersetzt das Directus-Epic #47. Entscheidung und Grenzen: [ADR-032](https://github.com/flxln/schulnavigator/blob/main/dokumentation/adr/032-mpz-studio-produktions-admin.md) (PR #272).

**Ausgeschlossen (nur per Folge-ADR):** Undo mit Diff, Entwürfe und Vorschau, Rollen über admin/redaktion hinaus, Freigabe-Workflows, feldgenaues Protokoll, Mehrsprachigkeit, neue Stationen oder Inhaltstypen, SSO, Self-Signup.

### Stufe 1: MPZ pflegt live

- [ ] Produktionsmodus-Schalter (eigene Runtime-Variable, nicht `NODE_ENV`) und Guard; Dev-only-Bereiche bleiben im Produktionsmodus 404 (Issue folgt)
- [ ] Konten admin/redaktion, Hash, Session-Cookie, Origin-Prüfung, Login-Bremse, Konto-Skript im Container (Issue folgt)
- [ ] #257 Lesepfad vom Content-Volume mit Fallback auf das Image
- [ ] #256 Save-Pfad auf das Volume: Gesamtdokument validieren, kein Schüler-PII, keine neuen Slugs
- [ ] Uploads auf die Bahn-B-Volumes hinter dem Cookie-Gate (Issue folgt)
- [ ] Export Volume → Git, Pflicht vor Verschieben von `release/39-gs` und vor Schema-Änderungen (Issue folgt)
- [ ] #258 Content-Volume in Backup T5, Restore-Test
- [ ] Security-Review der schreibenden Routen vor Go-Live (Issue folgt)
- [ ] VVT-Eintrag für MPZ-Konten, Doku in `anleitungen/fuer-entwickler.md`

### Stufe 2: Lehrkräfte

- [ ] #249 Champion und Pflegefrequenz
- [ ] VVT, Datenschutzerklärung und AVV für Lehrkräfte-Konten (Nachfolger von #263)
- [ ] Anleitung `anleitungen/fuer-lehrkraefte.md` (Nachfolger von #260)
- [ ] #261 Pilot: 2 Lehrkräfte pflegen 1 Raum ohne Felix

### Geschlossen als überholt (Directus)

#47, #255, #259, #260, #262, #263

**Aufwand laut Bericht (Schätzung, keine Messung):** Stufe 1 grob 6 bis 10 Personenwochen. Quelle: `dokumentation/reviews/cms-alternativen-2026-11-03.md`.
