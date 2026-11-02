# GitHub-Support-Ticket — #232 LFS-Purge & PR-Refs

**Status:** Ticket **#4510440** — GC durchgeführt; Follow-up mit 7 SHAs gesendet (2026-06-25) — Antwort auf PR-Refs ausstehend  
**Repository:** https://github.com/flxln/schulnavigator (privat)  
**Kontext:** DSGVO — Schüler-Medien (Kinderfotos, -videos, Dialog-/Coach-Audio) aus Git- und LFS-History entfernt  
**Referenz:** [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) · [Removing files from Git LFS](https://docs.github.com/en/repositories/working-with-files/managing-large-files/removing-files-from-git-large-file-storage)

---

## Support-Antwort (2026-06-24, Imafidon)

> Cache clearance and garbage collection on the repository completed. Commit URLs should return 404.  
> Commits still referenced in pull requests, branches or tags may not have been GC'd.

### Verifikation (API `GET /repos/.../commits/{sha}`)

| Ergebnis | Commits (Kurz-SHA) |
|----------|-------------------|
| **Nicht mehr erreichbar** | `6a55156`, `457955c`, `49c0291`, `ee0df4a` (Tip pre-Rewrite `kunde/39-gs`) u. a. |
| **Noch erreichbar** (vermutlich `refs/pull/*`) | siehe Tabelle unten |

| Voller SHA | Kurz | Commit-Message |
|------------|------|----------------|
| `f45f9a4bc10baba2e98bfaf3edf6569886372330` | `f45f9a4` | feat(demo): Otto/Frieda-Dialog mit gated Audio — **enthält dialog-audio WAVs** |
| `ff48a44e37dd4009b4f4afdbfff1af56f3441e2a` | `ff48a44` | Coach-Audio-Nachzieh |
| `2f07ae5b9721f557bc8dc8d8092d1f597748a567` | `2f07ae5` | Coach-Audio mit Autoplay (#193) |
| `516c8b1183adc66b710726019332a38db5e7c45d` | `516c8b1` | link media type |
| `f0355a9963817a0def3fdd276ceda3b52b6ceb94` | `f0355a9` | Hotspot-Marker Icon-Fallback |
| `995b2c8d337df75043ef6a880e1325d6ed277250` | `995b2c8` | TextViewer / Demo klassenzimmer |
| `03128c9dc56b37330dbee9988accb779fac2dc5b` | `03128c9` | media handling Doku |

**Antwort an Support:** siehe Abschnitt [Antwortvorlage](#antwortvorlage-an-support) unten.

---

## Antwortvorlage an Support

```
Hi Imafidon,

Thank you for running cache clearance and garbage collection.

I verified via the API and web UI. Most pre-rewrite commit SHAs now return 404 / "No commit found", which is expected.

However, the following commits are still accessible (likely still referenced via refs/pull/*/head from closed PRs). Several contain student dialog audio (children's voices) under app/content/dialog-audio/:

- f45f9a4bc10baba2e98bfaf3edf6569886372330
- ff48a44e37dd4009b4f4afdbfff1af56f3441e2a
- 2f07ae5b9721f557bc8dc8d8092d1f597748a567
- 516c8b1183adc66b710726019332a38db5e7c45d
- f0355a9963817a0def3fdd276ceda3b52b6ceb94
- 995b2c8d337df75043ef6a880e1325d6ed277250
- 03128c9dc56b37330dbee9988accb779fac2dc5b

The commit that originally introduced sensitive student audio was:
f45f9a4bc10baba2e98bfaf3edf6569886372330

Could you please dereference or purge any remaining refs/pull/*/head (and any other refs) that still point to these commits, and confirm orphaned LFS objects for app/public/media/, app/content/dialog-audio/, and app/content/coach-audio/ are fully removed?

Please retain LFS under app/public/stations/ (room panoramas without identifiable children).

Thank you,
Felix
```

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

- [x] Ticket **#4510440** an GitHub Support (2026-06-24)
- [x] Erste Support-Antwort: Cache-Clearance + GC (Imafidon, 2026-06-25)
- [x] Follow-up gesendet (2026-06-25): 7 noch erreichbare SHAs + Bitte um `refs/pull/*`-Dereferenzierung
- [ ] Finale Support-Bestätigung (alle 7 SHAs 404, LFS purged)
- [ ] V9 in [Post-Mortem #232](../../reviews/post-mortem/post-mortem-232-2026-06-24.md) als grün markieren
- [ ] Optional: `dsgvo.md` — Hinweis „GitHub-Support LFS-Purge ausstehend" entfernen

**Stand Verifikation (2026-06-25):** 7 SHAs noch via API erreichbar; `6a55156` und die meisten Branch-Tips sind weg.

**Backup (MPZ-only, nicht pushen):** `/tmp/schulnavigator-pre-232-mirror.git` — enthält Pre-Rewrite-History inkl. LFS-OIDs für Support-Nachfragen.
