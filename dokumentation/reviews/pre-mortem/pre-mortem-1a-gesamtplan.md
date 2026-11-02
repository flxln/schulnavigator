# Pre-Mortem 1a — Code-Praxis & Implementierbarkeit: Gesamtplan UI-Cleanup

**Ziel-Dokument:** Roadmap & Cleanup-Brief (`mpz-studio-claude-design-cleanup/`)
**Betrachteter Code:** `app/components/mpz-studio/*`

---

### [Fehlender API-Zustandsübergang] — „Dialog hinzufügen“ initialisiert kein Objekt
- **Warum später teuer:** Die UI-Vorgabe (Phase 4.3) lautet „Tab Dialog immer sichtbar + Button 'Dialog hinzufügen'“. Aktuell prüft `station-dialog-panel.tsx` lediglich `if (!dialog)` und bricht ab. Ein Klick auf einen neuen Hinzufügen-Button muss ein komplettes leeres Dialog-Grundgerüst (`{ figuren: [], segmente: [], gruppen: [], bubble: null }`) im Backend erzeugen, bevor der Editor überhaupt weiterarbeiten kann.
- **Wann es beißt:** Wenn der Frontend-Entwickler den Button einbaut und feststellt, dass es keine `POST`-Methode zur Anlage des Dialog-Skeletons gibt, da bisher nur Teil-Updates via `PATCH` existieren.
- **Billige Gegenmaßnahme jetzt:** Im Plan ergänzen, dass ein Initialisierungs-Endpunkt (z.B. `POST /api/mpz/stations/[slug]/dialog/init`) oder eine Anlage-Logik im bestehenden `PATCH` implementiert werden muss, die das Default-Gerüst in der `stations.json` erzeugt.

### [UI-Sprengung durch Inline-Player] — Audio-Upload in der Segment-Zeile
- **Warum später teuer:** Phase 4.2 fordert „Dialog-Audio: Segment-Zeilenmodell; Upload/Play in Segment-Zeile“. Das bedeutet, die komplexe Funktionalität aus `dialog-audio-panel.tsx` (File Dropzone, Audio-Referenzen, Ladezustände) muss direkt in die Tabellenzellen der `station-dialog-panel.tsx` wandern.
- **Wann es beißt:** Bei der Umsetzung von Phase 4.4. Eine Standard-Tabelle wird extrem unübersichtlich und bricht im Layout, wenn Drag & Drop-Zonen pro Zeile eingefügt werden. Zudem liefert der Endpoint `/api/mpz/dialog-audio/status` aktuell `DialogSegmentAudit`-Objekte – es muss sichergestellt sein, dass diese die abspielbaren URLs für das `<audio>`-Tag enthalten.
- **Billige Gegenmaßnahme jetzt:** Den Audio-Teil nicht direkt in die statische `<td>` pressen, sondern pro Zeile eine aufklappbare Sub-Zeile (Expandable Row) für den Upload/Player oder ein modales Popover einplanen.

### [Hartcodiertes Link-Verhalten] — Sphere-Kalibrierung öffnet weiterhin externe Tabs
- **Warum später teuer:** In Phase 4.8 wird eine symmetrische interne Studio-Route `/mpz/calib/sphere/[slug]` für 360-Grad-Hotspots angelegt. In der aktuellen `station-hotspots-table.tsx` (Z. 135) ist jedoch hartcodiert, dass Links für Sphere-Hotspots mit `target="_blank"` und `rel="noopener noreferrer"` die externe Besucher-App öffnen.
- **Wann es beißt:** Wenn die neue Route existiert und verlinkt wird. Ein Klick öffnet fälschlicherweise immer noch einen neuen Tab, was das Single-Page-Gefühl des Studios bricht. Zudem bleibt unten auf der Seite der veraltete Text-Hinweis (`/raum/[slug]?hotspot-calib=1`) stehen.
- **Billige Gegenmaßnahme jetzt:** Als To-Do in Phase 4.8 explizit aufnehmen: „`target='_blank'`-Logik für `isSphere` in `station-hotspots-table.tsx` entfernen und den statischen Info-Text zur Besucher-App-Route löschen.“

### [Routen-Kollision] — Zusammenlegung von Design & Hub
- **Warum später teuer:** Phase 3/4 plant, "Brand / Hub" zu einem Sidebar-Eintrag "Design & Hub" zusammenzulegen. Die Sidebar in `studio-shell.tsx` steuert ihren Active-State über `pathname.startsWith(...)`.
- **Wann es beißt:** Wenn man in `GLOBAL_ITEMS` nur noch einen Eintrag setzt, aber die Seiten `/mpz/studio/hub` und `/mpz/studio/brand` getrennt bleiben, geht der Navigations-State kaputt. Mergt man beide, brechen alte Links zur `/brand`-Seite.
- **Billige Gegenmaßnahme jetzt:** Klar definieren: Wir erstellen eine neue Route `/mpz/studio/design` als Container, importieren dort `hub-panel.tsx` sowie `brand-panel.tsx` (als Tabs oder untereinander) und richten in der `next.config.js` Redirects für die alten Pfade ein.
