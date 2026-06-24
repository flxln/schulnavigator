# Offene Punkte — DSB, Schule, Technik

**Stand:** 2026-06-24 (Phase 0 abgeschlossen)

## Organisatorisch / DSGVO

| # | Frage | Entscheidung (2026-06-24) |
|---|-------|---------------------------|
| O1 | Darf **`stations.json`** auf GitHub liegen? | **Option A** — Ja, nur Binärmedien trennen; JSON bleibt in Git |
| O2 | Reicht **privates** GitHub-Repo + AVV für **Code**, wenn **keine** Schüler-Binärdateien mehr gepusht werden? | **Ja** |
| O3 | **Bereits gepushte** Schüler-Medien in Git/LFS-History | **History bereinigen** — separates Vorhaben [#232](https://github.com/flxln/schulnavigator/issues/232); Inventar: [07-inventar-github.md](./07-inventar-github.md) |
| O4 | **Einwilligungen** Fotos/Video/Audio — dokumentiert? | **Ja** — Schülereinwilligung bei der Schule dokumentiert |
| O5 | **Raumbilder** `public/stations/` — Kinder erkennbar? | **Nein** — dürfen in Git/LFS bleiben (Bahn A) |

## Technisch

| # | Frage | Status / Notiz |
|---|-------|----------------|
| T1 | Coolify: **Volume-Mounts** pro Application — Pfade und Rechte (User `nextjs` uid 1001) | **Design entschieden** (Mount-Pfade siehe [03](./03-zielarchitektur.md)); Rechte (uid 1001) bleiben als Phase-2.2-Test mit Server-Admin |
| T2 | **rsync --delete** — gewollt wenn Datei lokal gelöscht? | **Entschieden:** kein `--delete` im Default; Pruning nur per `--prune`-Opt-in ⁸ |
| T3 | **Coach-Audio** und **Dialog-Audio** — gleiche Sync-Pipeline? | **Entschieden: Ja**, coach-audio durchgängig Bahn B ⁶ |
| T4 | **CI/GitHub Actions** — Build ohne Medien: grün? | **Entschieden:** Build nutzt `validate:*:structure` (kein `existsSync`), volle Validatoren lokal ⁵ |
| T5 | **Backup** der Volumes auf Hetzner | Offen (kein Pre-Mortem-Bezug): Server-Backup-Strategie, nicht GitHub |
| T6 | Mehrere MPZ-Rechner — wer darf rsync? | **Entschieden:** SSH-Key je MPZ-Laptop; `accept-new` deckt Erst-Connect ab ⁷ |

## Produkt / Studio

| # | Frage | Notiz |
|---|-------|-------|
| P1 | Studio-Warnung wenn Nutzer versucht, Medien zu committen? | Optional: Pre-commit-Hook oder Studio-Hinweis |
| P2 | Deploy-Tab zeigt „Medien nicht auf GitHub“ + Button Sync | Phase 3 optional |

## Entscheidungslog

| Datum | Wer | Ergebnis |
|-------|-----|----------|
| 2026-06-24 | MPZ (Planung) | Anforderung festgehalten: Schüler-Medien nie GitHub; Deploy-Split geplant |
| 2026-06-24 | Plan-Härtung (Tech-Lead) | Technische Blocker entschieden: Mount-Grenze + Icon-Umzug, `git rm --cached`, `:structure`-Validatoren, coach-audio Bahn B, rsync `accept-new` ohne `--delete` (T2/T3/T4/T6) |
| 2026-06-24 | DSB/Schule | **Phase-0-Freigabe (A1):** Schriftliches Einverständnis zur technischen Umsetzung Phase 1–4 liegt in **Papierform** vor |
| 2026-06-24 | DSB/Schule | **O1** Option A · **O2** Ja · **O3** History bereinigen (#232) · **O4** Einwilligungen dokumentiert · **O5** Raumbilder bleiben in Git |

## Änderungslog (Plan-Härtung 2026-06-24)

- ⁵ T4 entschieden: Build via `:structure`-Validatoren statt `SKIP_ASSET_VALIDATE` (1b #1 / 1a #4).
- ⁶ T3 entschieden: coach-audio gleiche Bahn-B-Pipeline wie dialog-audio (1b #3).
- ⁷ T1/T6 präzisiert: Mount-Design entschieden, Rechte-Test offen; SSH-Key je Laptop, `accept-new` für Erst-Connect (1a #3).
- ⁸ T2 entschieden: rsync ohne `--delete` als Default, `--prune` opt-in (Datenverlust-Risiko).

*Phase 0 (#227): O1–O5 und A1 sind entschieden; Gate für [#228](https://github.com/flxln/schulnavigator/issues/228) ist offen.*
