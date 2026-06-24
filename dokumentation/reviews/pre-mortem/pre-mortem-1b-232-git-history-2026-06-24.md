---
tags:
  - pre-mortem
  - review
  - issue-232
  - 01b-logik-spec
erstellt: 2026-06-24
---
# Pre-Mortem 1b — Git-History: Schüler-Medien bereinigen (#232)

Dieses Gutachten bewertet `.cursor/plans/issue_232_git-history_e35f3875.plan.md` anhand der Logik- und Spec-Konsistenz aus `1b_pre-mortem-logik.md`. Referenz sind insbesondere `dokumentation/planung/schuelermedien-deploy-trennung/07-inventar-github.md`, der aktuelle Ref-Bestand des Repositories und die GitHub-Dokumentation zur Entfernung sensibler Daten und von Git-LFS-Objekten.

---

### GitHub-LFS-Purge ohne belastbaren Ausführungspfad — Phase E verspricht eine nicht vorhandene Self-Service-Funktion

- **Warum später teuer:** Der Plan nennt „Settings → Git LFS → Delete orphaned LFS objects“ als regulären Schritt und ein Support-Ticket nur als Ausweichweg. GitHubs aktueller Vertrag ist umgekehrt: Nach dem History-Rewrite bleiben LFS-Objekte im Remote-Storage; zur Entfernung muss das Repository gelöscht und neu erstellt oder GitHub Support eingeschaltet werden. Bei sensiblen Daten kann Support zusätzlich PR-Refs, Cache-Ansichten und verwaiste LFS-Objekte bereinigen, entscheidet aber selbst, ob der Fall die Voraussetzungen erfüllt. Damit hängt das zentrale Ziel „in keinem LFS-Objekt auf GitHub mehr rekonstruierbar“ von einer externen Zusage ab, die im Plan noch als Annahme geführt wird.
- **Wann es beißt:** In Phase E nach dem irreversiblen Force-Push: Die Git-History ist bereits umgeschrieben, aber V9 und das Schließen von #232 bleiben auf unbestimmte Zeit blockiert, falls Support den Purge nicht bestätigt oder weitere Angaben verlangt.
- **Billige Gegenmaßnahme jetzt:** GitHub Support vor Phase C kontaktieren und die Purge-Fähigkeit für diesen konkreten Datenschutzfall bestätigen lassen. Das Support-Ticket als verpflichtendes Gate mit benötigten Artefakten in den Plan aufnehmen: Repository, betroffene PR-Anzahl, „First Changed Commit(s)“ und die von `git-filter-repo` erzeugte Liste verwaister LFS-Objekte. `git lfs prune` ausdrücklich nur als lokale Bereinigung behandeln.

### Branch-Liste deckt das formulierte Datenziel nicht ab — Tags, PR-Refs und weitere Refs bleiben unspezifiziert

- **Warum später teuer:** Ziel und Akzeptanzkriterium sprechen von „keinem Commit“ und „keinem LFS-Objekt auf GitHub“, der operative Scope nennt dagegen nur zehn Remote-Branches. Bereits lokal existiert der Tag `pre-adr-016`; dessen Historie enthält Bahn-B-Pfade. Zusätzlich können GitHub-PR-Refs und Cache-Ansichten alte Commits erreichbar halten. GitHub weist ausdrücklich darauf hin, dass ein reiner Branch-Force-Push diese Referenzen nicht vollständig entfernt und Support betroffene PR-Refs dereferenzieren muss.
- **Wann es beißt:** Nach einem scheinbar grünen Branch-Check, wenn ein alter Tag, ein geschlossener Pull Request oder eine direkte SHA-URL weiterhin auf Schüler-Medien verweist. Dann ist Akzeptanzkriterium 4 trotz bereinigter Branches nicht erfüllt.
- **Billige Gegenmaßnahme jetzt:** Den Scope von „alle Remote-Branches“ auf „alle schreibbaren Remote-Refs einschließlich Tags“ erweitern. Vor dem Rewrite `git ls-remote origin` inventarisieren, nach dem Rewrite `git-filter-repo --sensitive-data-removal` verwenden und `.git/filter-repo/changed-refs` auswerten. Nicht schreibbare `refs/pull/*` samt Anzahl verbindlich in das Support-Ticket und V9 aufnehmen.

### Zwei widersprüchliche Rewrite-Modelle — globaler Filterlauf und anschließendes Branch-Rebase

- **Warum später teuer:** Phase C führt `git filter-repo` im Mirror-Klon ohne `--refs` aus und beschreibt damit einen globalen Rewrite aller vorhandenen Refs. Phase D behandelt die Branches anschließend so, als sei nur `main` umgeschrieben worden, und fordert je Branch ein `rebase --onto <neuer-main> <alter-main>` oder einen erneuten Filterlauf. Das sind unterschiedliche Transformationsverträge. Ein zusätzliches Rebase verändert die bereits gefilterte Branch-Topologie nochmals und kann branchspezifische Merge-Historie verlieren; ein erneuter Filterlauf erzeugt wiederum andere Zuordnungen alter zu neuer SHAs.
- **Wann es beißt:** Beim ersten divergenten Kunden- oder Feature-Branch. Der Operator muss während des Rewrite-Fensters improvisieren, welche Historie maßgeblich ist, und die dokumentierte SHA-Zuordnung sowie die spätere Verifikation sind nicht mehr reproduzierbar.
- **Billige Gegenmaßnahme jetzt:** Ein Modell festlegen: frischer Mirror, genau ein globaler `git-filter-repo --sensitive-data-removal --invert-paths ...`-Lauf über alle Refs, danach Prüfung von `changed-refs` und ein koordinierter Mirror-Push aller schreibbaren Branches und Tags. Die per-Branch-Rebase-Alternative aus Phase D entfernen. Falls bewusst nur ausgewählte Refs transformiert werden sollen, diese stattdessen vollständig über `--refs` definieren und das schwächere Ziel explizit machen.

### Verifikationspaket prüft nicht den zugesagten Scope — Pfad-Touches und aktueller Checkout statt vollständiger History

- **Warum später teuer:** V4 nutzt `git log --all -- <pfade>` und behauptet damit „keine Medien-Binaries“ zu prüfen; der Befehl zeigt jedoch nur Commits mit Pfadänderungen und unterscheidet weder Binärdateien noch `.gitkeep` zuverlässig. V5 nutzt `git lfs ls-files` ohne `--all` und prüft laut lokal installiertem Git-LFS nur den aktuell ausgecheckten Branch. Auch der Spot-Check zweier alter SHAs beweist nicht, dass sämtliche inventarisierten Git- und LFS-Objekte aus allen Refs verschwunden sind.
- **Wann es beißt:** Beim Abschluss von Phase F: `main` ist sauber und V4/V5 erscheinen grün, während ein anderer Ref noch einen alten LFS-Pointer oder Nicht-LFS-Blob enthält.
- **Billige Gegenmaßnahme jetzt:** V4 durch einen Objektpfad-Check über alle Refs ersetzen, dessen Ausgabe außer den drei erlaubten `.gitkeep` leer sein muss, zum Beispiel `git rev-list --objects --all` mit exakter Pfadfilterung. V5 verbindlich als `git lfs ls-files --all` ausführen und alle OIDs außerhalb `app/public/stations/**` verbieten. Zusätzlich die vor dem Rewrite erfasste vollständige Pfad- und LFS-OID-Liste nach dem Rewrite automatisiert gegenprüfen; die zwei SHA-Checks bleiben nur ergänzende Stichproben.

Die Scope-Grenze selbst ist konsistent: Plan und Inventar nennen dieselben drei zu entfernenden Bahn-B-Verzeichnisse und nehmen `app/public/stations/**` als Bahn A ausdrücklich aus. Vor der Umsetzung müssen jedoch Ref-Scope, GitHub-Purge-Vertrag und die dazu passenden Verifikationskriterien vereinheitlicht werden.

## Quellen

- [GitHub Docs: Removing files from Git Large File Storage](https://docs.github.com/en/repositories/working-with-files/managing-large-files/removing-files-from-git-large-file-storage)
- [GitHub Docs: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
