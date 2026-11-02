# Pre-Mortem 1a — Code-Praxis & Implementierbarkeit: #213 Hotspots S11 S12

**Plan:** [213_hotspots_s11_s12_3d33134e.plan.md](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/.cursor/plans/#213_hotspots_s11_s12_3d33134e.plan.md)
**Berührte Dateien:**
- `app/components/mpz-studio/station-hotspots-table.tsx`
- `app/components/mpz-studio/station-hotspot-add-form.tsx`
- `app/components/mpz-studio/station-hotspot-edit-form.tsx`
- `app/components/mpz-studio/hotspot-icon-upload.tsx`

---

### [Datenverlust beim Typwechsel] — Koordinaten-Reset im Add-Form
- **Warum später teuer:** Sehr frustrierende UX. Ein Nutzer ermittelt im Viewer die genauen Koordinaten (yaw/pitch) oder gibt manuell x/y und eine ID ein. Entscheidet er sich dann um und wechselt über die neuen Typ-Karten von "Medien-Hotspot" auf "Dialog-Hotspot", wird im aktuellen Code `resetForm` aufgerufen, was das gesamte Formular inklusive Koordinaten und ID leert.
- **Wann es beißt:** In der UI mit zwei großen, stets sichtbaren Typ-Karten ist das Umschalten präsenter und verlockender als bei einem `<select>`. Jeder Wechsel vernichtet die bis dahin getätigten Eingaben stillschweigend.
- **Billige Gegenmaßnahme jetzt:** In `handleActionChange` von `station-hotspot-add-form.tsx` nicht stupide `resetForm` aufrufen. Stattdessen den bisherigen State mergen und nur typspezifische Felder leeren/wechseln, `id`, `label` und die Koordinaten (`x`, `y`, `yaw`, `pitch`) aber zwingend beibehalten.

### [Layout-Kollaps der Typ-Karten] — Umgang mit fehlenden Optionen
- **Warum später teuer:** Das Add-Formular rendert Optionen bedingt: Ist z. B. kein Dialog an der Station definiert (`!canAddDialog`), fällt die Option im aktuellen `<select>` einfach weg. Ersetzen wir das Select naiv durch `grid-cols-2` mit zwei `<MpzCard>`, wird bei nur einer verfügbaren Option das Grid asymmetrisch und zerschossen dargestellt (eine Karte klebt einsam auf der linken Hälfte).
- **Wann es beißt:** Bei allen Stationen, die z. B. nur Medien haben, aber keinen Dialog-Reiter konfiguriert haben.
- **Billige Gegenmaßnahme jetzt:** Entweder das Grid dynamisch auf `grid-cols-1` setzen, wenn nur eine Option verfügbar ist, oder — noch robuster — die Karte für die nicht verfügbare Option anzeigen, aber auf `disabled` setzen (Grau, `opacity-50`) inklusive kurzem Hinweis (z.B. "Zuerst Dialog-Figur anlegen").

### [Verwaister Upload-State] — Icon-Auswahl beim zweiten Hotspot
- **Warum später teuer:** Der `useEffect` in `station-hotspot-add-form.tsx`, der das neu hochgeladene Icon automatisch im Formular selektiert, reagiert auf Änderungen von `uploadedIconPath`. Nach dem erfolgreichen Speichern eines Hotspots leert `resetForm` das Dropdown (`form.icon = ''`). Da sich `uploadedIconPath` (Prop aus der Parent-Komponente) aber nicht ändert, feuert der Effekt für den *nächsten* anzulegenden Hotspot nicht erneut.
- **Wann es beißt:** Wenn ein Nutzer ein Icon hochlädt, den ersten Hotspot anlegt (Icon wird korrekt verwendet), und sofort danach einen zweiten Hotspot anlegt. Im Formular steht das Icon wieder auf "(keins)", und der Hotspot wird unbeabsichtigt ohne Icon gespeichert, wenn der Nutzer es übersieht.
- **Billige Gegenmaßnahme jetzt:** In der Submit-Routine statt `icon: ''` zu setzen, explizit prüfen, ob ein `uploadedIconPath` existiert, und diesen als neuen Default übernehmen (da Icons oft für mehrere Hotspots wiederverwendet werden). Alternativ `uploadedIconPath` nach dem Submit im Parent auf `null` zurücksetzen.

### [Redundante Netzwerk-Requests] — fetchHotspotIconPaths
- **Warum später teuer:** Die Liste der Icons wird derzeit von `HotspotIconUpload`, `StationHotspotAddForm` und potenziell jedem aufgeklappten `StationHotspotEditForm` individuell beim Mounten via `fetchHotspotIconPaths` geladen. Das erzeugt pro Seitenaufruf oder Bearbeiten-Klick 2 bis 3 un-gecachte Fetch-Requests an dieselbe Route.
- **Wann es beißt:** Bei langsamen Verbindungen, da die Dropdowns in Add/Edit asynchron nachladen und sich die UI verzögert aktualisiert.
- **Billige Gegenmaßnahme jetzt:** Die `iconPaths`-Liste besser zentral in der `station-hotspots-table.tsx` fetchen und als Prop (`iconPaths={paths}`) an Upload, Add und Edit weitergeben. Der Upload triggert dann bei Erfolg einen Refresh auf Parent-Ebene.
