---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01a-code-praxis
erstellt: 2026-06-24
---
# Pre-Mortem 1a — Code-Praxis & Implementierbarkeit: #216 Dialog S15

Spezialisiert auf Probleme, die erst beim Schreiben des Codes sichtbar werden: kaputte Imports, nicht-testbare Abhängigkeiten, stille Datenbugs.

**PLAN:**
[#216_dialog_s15_25cdfb74.plan.md](../../../.cursor/plans/#216_dialog_s15_25cdfb74.plan.md)

**RELEVANTER CODE:**
- `app/components/mpz-studio/station-dialog-panel.tsx`
- `app/components/mpz-studio/station-dialog-segment-audio-row.tsx`
- `app/components/mpz-studio/station-dialog-segment-form.tsx`
- `app/components/mpz-studio/mpz-form-alert.tsx`
- `app/components/mpz-studio/mpz-form-primitives.ts`

---

### [CSS-Konflikt bei Audio-Warnbanner] — `MpzFormAlert` überschreibt Tailwind-Klassen nicht zuverlässig
- **Warum später teuer:** Der Plan verlangt `<MpzFormAlert variant="info" className="border-brand-sun/40 bg-brand-sun/10">`. `MpzFormAlert` definiert jedoch hartkodiert `border-border-1 bg-bg-2` für die `info`-Variante. Tailwind verarbeitet die Klassennamen nicht nach Spezifität, d. h. die Standard-Hintergrundfarbe könnte das Sun-Styling einfach überstimmen.
- **Wann es beißt:** Bei der Implementierung sieht das Warnbanner plötzlich unscheinbar grau aus statt wie gewünscht auffällig gelb, weil CSS-Regeln kollidieren.
- **Billige Gegenmaßnahme jetzt:** Statt `MpzFormAlert` das bisherige rohe `<div className="rounded-gs39-sm border border-brand-sun/40 bg-brand-sun/10 px-4 py-3 text-sm text-fg-1">` beibehalten. Das Container-Div ist sicherer, um das Sun-Styling nicht zu verlieren, da im System bewusst keine `warn`-Variante eingeführt wird.

### [Ungültiges HTML/CSS-Verhalten] — `min-h-11` auf `<tr>`
- **Warum später teuer:** Der Plan verlangt `min-h-11` für die Tabellenzeilen (`<tr>`). `min-height` ist auf `display: table-row` laut CSS-Standard jedoch wirkungslos und wird von Browsern weitgehend ignoriert.
- **Wann es beißt:** Nach dem Migrieren sieht die Tabelle in der Höhe zu gedrungen aus und entspricht nicht den GS39-Vorgaben für die minimale Zeilenhöhe von 44px.
- **Billige Gegenmaßnahme jetzt:** `h-11` statt `min-h-11` direkt auf der `<tr>` verwenden (Tabellenzeilen nehmen `height` als strikte Minimalhöhe an) oder ein festes vertikales Padding (z. B. `py-3`) auf den `<td>` Elementen setzen, um die Höhe verlässlich aufzuspannen.

### [Layout-Verschiebung im Akkordeon-Header] — Chevron nach rechts verdrängt Buttons
- **Warum später teuer:** Der Plan fordert "Akkordeon-Header mit Chevron rechts". Aktuell ist der Toggle-Button für die Gruppen (`<button onClick={() => setGruppenOpen...`) Teil eines Flex-Containers, der rechts neben sich noch den separaten Button "Gruppe hinzufügen" hat (`justify-between`). Wenn das Chevron nun mittels Flexbox an den rechten Rand *innerhalb* des Toggle-Buttons rückt, drückt es direkt an den Add-Button.
- **Wann es beißt:** Man klappt die Gruppen-Ansicht auf und der Toggle-Pfeil klebt unschön direkt am "Gruppe hinzufügen"-Button oder zerschießt im schlechtesten Fall das Wrapping der Zeile.
- **Billige Gegenmaßnahme jetzt:** Dem Toggle-Button ein `pr-4` oder `mr-4` mitgeben, damit zwischen dem nach rechts verschobenen Chevron und dem benachbarten Action-Button genügend optischer Raum bleibt.

### [UX-Desynchronisation] — Formular und Empty-State rendern gleichzeitig
- **Warum später teuer:** Wenn keine Segmente vorhanden sind, zeigt die Tabelle laut Plan `<tr colSpan={7}>` mit dem Hinweis "Noch keine Segmente". Klickt man nun oben auf "Erstes Segment anlegen", öffnet sich das Inline-Formular `StationDialogSegmentForm` – die leere Tabelle mit dem "Noch keine Segmente"-Hinweis bleibt aber parallel darunter sichtbar.
- **Wann es beißt:** Der User befindet sich bereits im Ausfüllprozess für sein erstes Segment, aber das UI suggeriert darunter weiterhin als dicker Block "Noch keine Segmente", was unruhig und unpoliert wirkt.
- **Billige Gegenmaßnahme jetzt:** Ein kleines Rendering-Bypass einfügen: Wenn `addingSegment === true` und `dialog.segmente.length === 0` ist, die `MpzDataTable` ausblenden, da das Formular den Platz sinnvoll einnimmt. (Alternativ akzeptieren, dass beides sichtbar bleibt, es aber im Plan festhalten).

### [Redundante Disabled-Opacities] — Aktionen und LAST_SEGMENT Guard
- **Warum später teuer:** Der Plan spezifiziert `disabled:opacity-50` für die Buttons in der Aktionsspalte (Löschen, Bearbeiten, Audio). Wenn diese jedoch auf die Primitives (`mpzButtonClassName('ghost' / 'danger')`) umgestellt werden, bringen diese intern bereits ein `disabled:opacity-60` mit.
- **Wann es beißt:** Manuell hinzugefügte `opacity-50`-Klassen kämpfen gegen die Tokens der Primitives, was zu Design-Inkonsistenzen über verschiedene Buttons hinweg führt (manche sind 50% opak, andere 60%).
- **Billige Gegenmaßnahme jetzt:** Auf manuelles `disabled:opacity-50` bei Buttons komplett verzichten, sobald `mpzButtonClassName` verwendet wird.
