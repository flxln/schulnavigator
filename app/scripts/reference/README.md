# Referenz für `validate:tokens`

Kopie von `auftraggeber/material/UI-Vorschläge/colors_and_type.css` für Docker-/CI-Builds (Build-Kontext nur `app/`).

Das Submodule `auftraggeber/` wird im Container nicht mitgeliefert — deshalb diese Referenz statt `../auftraggeber/...` zur Laufzeit. Hintergrund und Regeln für Agenten: [`dokumentation/build-kontext-submodule-regeln.md`](../../../dokumentation/build-kontext-submodule-regeln.md).

Bei Änderungen an der Auftraggeber-Quelle: Datei hier aktualisieren (oder aus dem Submodule kopieren), dann `npm run validate:tokens` und `app/app/gs39-tokens.css` anpassen.
