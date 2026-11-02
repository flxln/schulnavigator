---
tags:
  - pre-mortem
  - 01a-code-praxis
  - issue-232
erstellt: 2026-06-24
---
# Pre-Mortem 1a — Code-Praxis: #232 Git-History bereinigen

**Plan:** [issue_232_git-history_e35f3875.plan.md](../../../.cursor/plans/issue_232_git-history_e35f3875.plan.md)

Aus der Perspektive des Entwicklers, der die Bereinigung der Git-History (Issue #232) auf dem lokalen Terminal und an den GitHub-Settings durchführen muss, fallen folgende operative Probleme auf:

### 1. `git add` in einem `--mirror` (Bare-Clone) schlägt fehl
- **Warum später teuer:** In Phase B wird das Repo explizit mit `git clone --mirror` geklont. Ein Mirror-Klon ist ein sogenanntes Bare-Repository, das keinen Working-Tree (keine ausgecheckten Dateien) hat.
- **Wann es beißt:** In Phase C soll nach dem `filter-repo` der Befehl `git add -f app/public/media/.gitkeep ...` ausgeführt werden. Das wird mit dem Fehler `This operation must be run in a work tree` fehlschlagen, da es im Bare-Klon keine Verzeichnisstruktur gibt.
- **Billige Gegenmaßnahme jetzt:** Im Plan den Workflow klarstellen: Entweder den Bare-Clone vor dem `git add` in ein reguläres Repo umwandeln (`git config --unset core.bare && git reset --hard`), oder — besser — nach dem `filter-repo` und dem `git push --force --all` auf origin einen **komplett neuen, regulären Klon** von origin ziehen und dort die `.gitkeep` Dateien committen und regulär pushen.

### 2. Fehlende Verzeichnisse beim Re-Committen der `.gitkeep`
- **Warum später teuer:** `git filter-repo --invert-paths` entfernt die gesamten betroffenen Verzeichnisse restlos aus der Git-History. Git trackt generell keine leeren Verzeichnisse.
- **Wann es beißt:** Selbst wenn der Entwickler in einem Arbeitsklon arbeitet, schlägt der in Phase C genannte Befehl `git add -f app/public/media/.gitkeep ...` mit `fatal: pathspec ... did not match any files` fehl. Da das Verzeichnis nicht mehr existiert, existiert auch die `.gitkeep` darin nicht (lokale ignorierte Dateien könnten zwar da sein, wenn sie vorher ignoriert waren, aber man kann sich nicht darauf verlassen).
- **Billige Gegenmaßnahme jetzt:** Die Befehle im Plan um ein explizites `mkdir -p` und `touch` ergänzen: 
  `mkdir -p app/public/media app/content/dialog-audio app/content/coach-audio`
  `touch app/public/media/.gitkeep app/content/dialog-audio/.gitkeep app/content/coach-audio/.gitkeep`
  bevor `git add -f` ausgeführt wird.

### 3. Doppelter Rewrite / Rebase-Chaos bei Branches (Phase D)
- **Warum später teuer:** Der Plan besagt in Phase D: *„Für jeden Remote-Branch: Branch auschecken. git rebase --onto <neuer-main> <alter-main> <branch> oder erneutes filter-repo auf Branch-Tip“*
- **Wann es beißt:** Wenn `git filter-repo` ohne Einschränkung auf spezifische Refs ausgeführt wird (wie im Kernbefehl der Phase C), schreibt es bereits automatisch **alle** Branches, Tags und Refs um, die diese Pfade enthalten. Wenn man danach noch manuelle Rebases versucht, fehlen die alten SHAs, oder man erzeugt extremes Konflikt-Chaos.
- **Billige Gegenmaßnahme jetzt:** In Phase D den Schritt „git rebase für Feature-Branches“ streichen. Ein globales `filter-repo` überschreibt die gesamte History aller Branches lokal. Es genügt, danach einmal `git push --force origin --all` (bzw. für jeden benötigten Branch) auszuführen, da die Feature-Branches lokal bereits auf der neu geschriebenen History basieren.

### 4. GitHub PR-Refs als Blocker für LFS-Garbage-Collection (V9)
- **Warum später teuer:** GitHub bewahrt Pull-Requests (auch geschlossene) in internen Refs (`refs/pull/...`) auf. Ein `git push --force origin --all` überschreibt zwar die Remote-Branches, aber nicht diese versteckten PR-Refs auf GitHub.
- **Wann es beißt:** In Phase E soll im GitHub Dashboard „Delete orphaned LFS objects“ geklickt werden. Wenn historische Medien noch in alten PR-Commits liegen, gelten die LFS-Objekte auf GitHub möglicherweise *nicht* als verwaist (orphaned) und lassen sich nicht via Self-Service löschen. Sie bleiben über alte PR-Links erreichbar.
- **Billige Gegenmaßnahme jetzt:** Im Plan notieren, dass GitHub Support möglicherweise kontaktiert werden muss, um PR-Caches/Refs zu leeren (ein bekanntes Problem bei Git-History Rewrites auf GitHub). Diese Erwartungshaltung managen, falls V9 in der Verifikation (Phase F) im Self-Service scheitert.
