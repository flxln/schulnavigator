# GitHub-Support-Ticket — #232 LFS-Purge & PR-Refs

**Status:** Vorlage — manuell an GitHub Support senden (Phase B/E)  
**Repository:** https://github.com/flxln/schulnavigator (privat)  
**Kontext:** DSGVO — Schüler-Medien (Kinderfotos, -videos, Dialog-/Coach-Audio) aus Git- und LFS-History entfernt

## Betreff

Request: Purge orphaned Git LFS objects and dereference pull request refs — student media privacy (GDPR)

## Nachricht (Englisch)

Hello GitHub Support,

We have completed a `git filter-repo` history rewrite on our private repository `flxln/schulnavigator` to remove student media (photos, videos, children's voices in WAV files) from all branches and tags for GDPR compliance.

Please assist with:

1. **Purge all orphaned Git LFS objects** that are no longer referenced by any commit after our force-push (student media under paths `app/public/media/`, `app/content/dialog-audio/`, `app/content/coach-audio/`). LFS objects for `app/public/stations/` (room panoramas without identifiable children) must **remain**.

2. **Dereference or purge `refs/pull/*/head` commits** that may still reference the old history containing student media.

Repository: https://github.com/flxln/schulnavigator  
Rewrite date: 2026-06-24  
Related planning: Issue #232 in the same repository.

We can provide specific LFS OIDs or commit SHAs if needed.

Thank you.

## Nach Umsetzung

- [ ] Ticket-Nummer hier eintragen: ___________
- [ ] Support-Bestätigung ablegen (Screenshot/E-Mail)
- [ ] V9 in Post-Mortem #232 als grün markieren
