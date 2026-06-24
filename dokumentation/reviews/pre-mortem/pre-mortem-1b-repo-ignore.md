# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: Phase 1 Repo Ignore (#228)

## 1. Datenverlust durch Ephemeral-Storage bei SVG-Uploads (Widersprüchliche Storage-Logik)
### [Ephemeral SVG Leak] — Ingest schreibt in versionierten statt persistenten Ordner
- **Warum später teuer:** Der Plan legt fest, dass SVG-Uploads aus dem MPZ Studio nach `public/stations-icons/` (Bahn A) geleitet werden, da diese "personenfrei" sind. Bahn A wird in der Coolify-Zielarchitektur aber rein über Git versioniert und erhält *keinen* persistenten Volume-Mount (anders als `public/media/`).
- **Wann es beißt:** Unmittelbar nach der Einführung der Struktur-Validatoren in #229. Wenn ein Mitarbeiter im Produktions-Studio ein neues SVG hochlädt, landet es im flüchtigen Container-Dateisystem. Beim nächsten Coolify-Deploy wird der Container neu gebaut, das SVG ist weg. Da die `stations.json` (im Volume) aber noch auf das SVG zeigt, bricht der Build-Prozess (`validate:stations`) mit einem 404-Fehler hart ab und legt das Deployment lahm.
- **Billige Gegenmaßnahme jetzt:** Die Ingest-Logik im Studio darf neue Uploads *niemals* dynamisch in `stations-icons/` ablegen. Die Trennung "SVG = Bahn A" darf nur für manuell committete Presets gelten. Studio-Uploads (egal ob SVG oder PNG) müssen immer nach `public/media/{slug}/icons/` (Bahn B) geschrieben werden.

## 2. Unvollständige Diskriminierung der Dateiendung überschreibt generische PNGs
### [PNG-Kollision] — Hartkodierte Datei-Endungsregel widerspricht Daten-Inventar
- **Warum später teuer:** Das Inventar verlangt, dass `klaviertasten.png` als generisches Icon nach `stations-icons/` (Bahn A) verschoben wird. Der Plan führt für das Ingest-Script aber die harte Regel ein: `.png / .webp → public/media/`.
- **Wann es beißt:** Wenn ein Nutzer im Studio versucht, `klaviertasten.png` zu ersetzen oder zu updaten. Das Ingest-Script leitet den Upload stur nach `public/media/...` um. Das Update "gelingt" technisch, aber das Frontend zeigt weiterhin das alte Icon an, da `stations.json` noch auf `/stations-icons/...` verweist. Eine Kollisionsprüfung gegen den alten Pfad findet nicht statt.
- **Billige Gegenmaßnahme jetzt:** `klaviertasten.png` vor dem Umzug in ein SVG konvertieren, sodass die Regel (SVG=Bahn A, PNG=Bahn B) trennscharf bleibt. Alternativ muss die Ingest-Logik den bestehenden Eintrag aus `stations.json` prüfen und den Upload ablehnen, falls er ein Bahn-A-Icon überschreiben würde ("Generische Icons können nur über Code-Änderungen aktualisiert werden").

## 3. Lücke im Path-Traversal-Schutz bei doppelten Roots
### [API Security] — resolveIconPublicPath sichert neue Pfadstruktur nicht vollständig ab
- **Warum später teuer:** `resolveIconPublicPath` soll laut Plan zwei Präfixe akzeptieren (`/media/{slug}/icons/` und `/stations-icons/{slug}/`). Bislang schützt die Funktion vor Directory Traversal (z. B. `../../`), indem der aufgelöste `candidate`-Pfad strikt gegen genau einen validen `iconsRoot` vergleicht wird (`candidate.startsWith(iconsPrefix)`).
- **Wann es beißt:** Wenn die Weiche im Code lediglich "erlaubt" `/stations-icons/` als String passieren zu lassen, aber der Verzeichnis-Schutzmechanismus nicht auf den *zweiten* Root (`public/stations-icons/`) ausgedehnt wird. Ein manipulierter Upload mit der Quelle `/stations-icons/daz/../../../config.json` könnte dann durch das Ingest-Script überschrieben werden (Arbitrary File Write Lücke im Studio).
- **Billige Gegenmaßnahme jetzt:** Im Plan als striktes Akzeptanzkriterium ergänzen: "Directory-Traversal-Schutz in `resolveIconPublicPath` muss für *beide* Roots (`mediaRoot` und `stationsIconsRoot`) isoliert via `startsWith()` evaluiert werden."
