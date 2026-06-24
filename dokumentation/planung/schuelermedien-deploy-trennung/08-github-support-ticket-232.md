# GitHub-Support-Ticket — #232 LFS-Purge & PR-Refs

**Status:** Eingereicht bei GitHub Support (2026-06-24) — serverseitige Bereinigung ausstehend  
**Repository:** https://github.com/flxln/schulnavigator (privat)  
**Kontext:** DSGVO — Schüler-Medien (Kinderfotos, -videos, Dialog-/Coach-Audio) aus Git- und LFS-History entfernt  
**Referenz:** [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) · [Removing files from Git LFS](https://docs.github.com/en/repositories/working-with-files/managing-large-files/removing-files-from-git-large-file-storage)

---

## Was lokal bereits erledigt ist

| Voraussetzung (GitHub-Doku) | Status |
|-----------------------------|--------|
| History mit `git filter-repo` über alle Branches und Tags umgeschrieben | ✅ 2026-06-24 |
| Force-Push abgeschlossen | ✅ 6 Branches + Tag `pre-adr-016` |
| Kategorie sensibler Daten benannt (Schüler-Foto/Video/Audio → GDPR) | ✅ |
| Nicht-sensitive LFS-Pfade explizit zum Behalten genannt (`app/public/stations/`) | ✅ |
| Repository kann nicht gelöscht/neu angelegt werden | ✅ (laufender Betrieb) |

**Keine weiteren Repository-Änderungen nötig** — verbleibende Bereinigung erfordert Support auf GitHub-Infrastruktur.

---

## Was GitHub Support serverseitig erledigt

Nach Verifikation des Rewrites (laut GitHub-Doku):

1. **`refs/pull/*/head` dereferenzieren oder löschen** — geschlossene PRs können alte Pre-Rewrite-Commits noch referenzieren (~**31** PR-Head-Refs, Stand 2026-06-24)
2. **Server-GC** — sensible Daten dauerhaft aus dem Storage entfernen
3. **Gecachte Views** bereinigen, die alte Commits noch zeigen könnten
4. **Verwaiste LFS-Objekte purgen** — Medien unter den Bahn-B-Pfaden, die nach dem Rewrite keinem Commit mehr zugeordnet sind

> Einziger unterstützter Weg für vollständige LFS-Entfernung, wenn das Repo nicht gelöscht werden kann.

**Zu behaltende LFS-Objekte:** `app/public/stations/**` (17 Raumbilder, O5 — keine erkennbaren Kinder).

---

## Ticket-Inhalt (Referenz / bei Nachfrage)

### Betreff

`Request: Purge orphaned Git LFS objects and dereference pull request refs — student media privacy (GDPR)`

### Nachricht (Englisch)

Hello GitHub Support,

We have completed a `git filter-repo` history rewrite on our private repository `flxln/schulnavigator` to remove student media (photos, videos, children's voices in WAV files) from all branches and tags for GDPR compliance.

**Repository:** https://github.com/flxln/schulnavigator (private)  
**Rewrite completion date:** 2026-06-24  
**Related issue:** #232 in the same repository

Please assist with:

1. **Purge all orphaned Git LFS objects** no longer referenced after our force-push. Paths to purge:
   - `app/public/media/`
   - `app/content/dialog-audio/`
   - `app/content/coach-audio/`

2. **Retain** LFS objects under `app/public/stations/` (room panoramas without identifiable children).

3. **Dereference or delete `refs/pull/*/head`** that may still point to pre-rewrite history (~31 pull request head refs).

4. Run server-side garbage collection to permanently expunge the sensitive data.

**Additional context:**
- All branches and tags were rewritten and force-pushed (37 refs changed per `git filter-repo` output).
- The repository cannot be deleted and recreated (production deployment in use).
- No live secrets remain in the rewritten history relevant to this request (access tokens are a separate concern, ADR-021).
- We can provide specific LFS OIDs or commit SHAs on request.

Thank you.

---

## Nach Support-Antwort

- [x] Ticket an GitHub Support gesendet (2026-06-24)
- [ ] Ticket-Nummer hier eintragen: ___________
- [ ] Support-Bestätigung ablegen (Screenshot/E-Mail)
- [ ] V9 in [Post-Mortem #232](../../reviews/post-mortem/post-mortem-232-2026-06-24.md) als grün markieren
- [ ] Optional: `dsgvo.md` — Hinweis „GitHub-Support LFS-Purge ausstehend" entfernen

**Backup (MPZ-only, nicht pushen):** `/tmp/schulnavigator-pre-232-mirror.git` — enthält Pre-Rewrite-History inkl. LFS-OIDs für Support-Nachfragen.
