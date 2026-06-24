# Offene Punkte — DSB, Schule, Technik

**Stand:** 2026-06-24

## Organisatorisch / DSGVO

| # | Frage | Optionen | Empfehlung Planung |
|---|-------|----------|-------------------|
| O1 | Darf **`stations.json`** auf GitHub liegen? Enthält Dialog-Texte, ggf. Vornamen (z. B. „Safia“), Beschreibungen. | A) Ja, nur Binärmedien trennen · B) Nein, JSON auch nur auf Server · C) JSON in Git, aber personenbezogene Texte redigieren | Mit DSB klären **vor** Phase 1 |
| O2 | Reicht **privates** GitHub-Repo + AVZ für **Code**, wenn **keine** Schüler-Binärdateien mehr gepusht werden? | Ja/Nein | Typisch ja für Code; AVV/GitHub-Subprozessor prüfen |
| O3 | **Bereits gepushte** Schüler-Medien in Git/LFS-History — Löschung / `git lfs migrate` / BFG? | Rechtliche Bewertung + technische Bereinigung | Separates Ticket nach Inventar (Phase 0.2) |
| O4 | **Einwilligungen** Fotos/Video/Audio — dokumentiert? | [`dsgvo.md`](../../dsgvo.md), Issue #43 | Parallel zum Technik-Umbau |
| O5 | **Raumbilder** `public/stations/` — Kinder erkennbar? | Weiter LFS in Git vs. mit Medien-Bahn | Pro Bild prüfen |

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
| | DSB/Schule | *ausstehend* (O1–O5 bleiben extern) |

## Änderungslog (Plan-Härtung 2026-06-24)

- ⁵ T4 entschieden: Build via `:structure`-Validatoren statt `SKIP_ASSET_VALIDATE` (1b #1 / 1a #4).
- ⁶ T3 entschieden: coach-audio gleiche Bahn-B-Pipeline wie dialog-audio (1b #3).
- ⁷ T1/T6 präzisiert: Mount-Design entschieden, Rechte-Test offen; SSH-Key je Laptop, `accept-new` für Erst-Connect (1a #3).
- ⁸ T2 entschieden: rsync ohne `--delete` als Default, `--prune` opt-in (Datenverlust-Risiko).

*Hinweis: O1–O5 sind DSGVO-/rechtliche Fragen und bleiben bewusst bei DSB/Schule — kein Pre-Mortem-Befund, daher hier nicht „entschieden".*
