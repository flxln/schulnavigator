# Pre-Mortem 1a: Code-Praxis & Implementierbarkeit
**Ziel-Plan:** `runbook_agentic_projekte_a5525f2f.plan.md`

Hier sind die drei kritischen, code-nahen Implementierungsrisiken, die beim sturen Abarbeiten des Plans sofort zu Fehlern führen würden:

### IO-Race-Condition beim Verschieben des Inbox-Ordners
- **Warum später teuer:** Der Plan besagt, den gesamten Ordner `000_Inbox/Workflow-Feature-Implementierung/` zu verschieben und *danach* einen Stub `README.md` im selben (nun nicht mehr existierenden) Pfad anzulegen. Dies führt unweigerlich zu einem `ENOENT` (Directory not found) Fehler auf Dateisystem-Ebene.
- **Wann es beißt:** Direkt in **Phase A — Gerüst**, wenn das Skript oder der Agent den `README.md` Stub in `000_Inbox/Workflow-Feature-Implementierung/` speichern will, der Ordner aber durch den vorherigen Move-Befehl bereits komplett verschwunden ist.
- **Billige Gegenmaßnahme jetzt:** Im Plan präzisieren: Nicht den Ordner selbst verschieben, sondern nur dessen *Inhalte* (z.B. via `mv 000_Inbox/Workflow-Feature-Implementierung/* ...`). So bleibt das Ursprungsverzeichnis für den neuen Stub bestehen.

### Fehlende Referenzdatei für Schritt "01" (Stille Pipeline-Lücke)
- **Warum später teuer:** Der Plan listet die zu verlinkenden Pipeline-Dateien explizit als `00–04, 1a, 1b`. Im Quellordner existieren jedoch nur Dateien für `00`, `02`, `03`, `04`, `1a` und `1b` — es gibt aktuell keine Datei, die mit `01` beginnt. 
- **Wann es beißt:** In **Phase B** beim Schreiben von `04_feature-pipeline.md`, wenn der Ablaufplan kanonisch dokumentiert wird und ein Skript/Agent stur versucht, `01_*.md` zu referenzieren. Die Iteration schlägt fehl oder produziert tote Links im Vault.
- **Billige Gegenmaßnahme jetzt:** Im Plan klarstellen, ob `1a` und `1b` zusammen den "Schritt 01" logisch ersetzen und somit keine eigene `01_*.md` referenziert werden darf, oder ob diese noch manuell als Stub angelegt werden muss.

### Falsche Dateiendung `.vorlage` vs. Markdown-Editor Kompatibilität
- **Warum später teuer:** Vorlagen sollen strikt mit der Endung `.vorlage` (z. B. `epic.md.vorlage`, `CLAUDE.md.vorlage`) gespeichert werden. Obsidian (und die meisten IDE-Setups) erkennen diese Endung nicht nativ als Markdown, wodurch Syntax-Highlighting, Suchbarkeit und saubere Obsidian-Wikilinks (`[[...]]`) kaputtgehen.
- **Wann es beißt:** Im Alltag, wenn ein Entwickler im Meta-Vault `00_Meta` arbeitet und auf den eingebetteten Link zur `CLAUDE.md.vorlage` klickt: Obsidian meldet "Unsupported file format" oder öffnet den Systemdialog, statt den Inhalt anzuzeigen.
- **Billige Gegenmaßnahme jetzt:** Die Dateiendungen so anpassen, dass `.md` immer am Ende steht (z. B. `dokumentation-README-vorlage.md` oder `vorlage-epic.md`). Das erhält die volle Nativ-Lesbarkeit in Obsidian und der IDE.
