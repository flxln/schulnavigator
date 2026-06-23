# Pre-Mortem 1a — Code-Praxis: #212 Medien S8/S9

## Funde & Code-Risiken

### Modal-Footer Submit vs. gekapselter Form-State
- **Warum später teuer:** Der Plan ordnet den "Hinzufügen"-Button dem Footer des `MpzModal` (in `media-ingest-modal.tsx`) zu. Dieser Button soll deaktiviert (`disabled`) sein, wenn das Kind-Formular (`MediaIngestForm` oder `MediaLinkEmbedForm`) invalid oder `busy` ist. Das Modal hat jedoch keinen direkten Zugriff auf diesen internen State der Kind-Komponenten. Zudem löst ein Button außerhalb eines `<form>`-Tags keinen Submit aus, wenn er nicht über eine feste ID mit dem Formular verknüpft ist.
- **Wann es beißt:** Beim Implementieren der `disabled={isPending || busy}`-Logik am primären Footer-Button. Der Entwickler müsste mitten in der UI-Arbeit ein mühsames State-Lifting betreiben, um den Zustand beider Forms ins Modal hochzuziehen.
- **Billige Gegenmaßnahme jetzt:** Im Plan als technisches Detail ergänzen: (1) Die Formulare erhalten eine feste ID (z. B. `id="media-ingest-form"`), auf die sich der Footer-Button via `form="media-ingest-form"` bezieht. (2) Die Forms erhalten ein Callback-Prop `onStateChange?: (state: { busy: boolean, valid: boolean }) => void`, womit sie ihren Zustand an das umschließende Modal hochmelden, damit der Footer-Button reaktiv deaktiviert werden kann.

### Drag & Drop überschreibt natives FormData-Verhalten
- **Warum später teuer:** Der Plan verlangt eine Drop-Zone auf ein verstecktes `<input type="file">` in `media-ingest-form.tsx`. Aktuell ist das Formular "uncontrolled" und liest die zu sendende Datei im `handleSubmit` stur über `new FormData(e.currentTarget)` aus. Wenn ein Nutzer eine Datei per Drag & Drop in ein div zieht (via `onDrop`), landet diese Datei nicht magisch im versteckten nativen `<input>` (dies erfordert komplexe `DataTransfer`-Hacks). 
- **Wann es beißt:** Wenn der Entwickler das Drag & Drop-Event baut und feststellt, dass der POST-Request danach "MISSING_FILE" wirft, weil das fallengelassene File nie im `<form>`-Objekt registriert wurde.
- **Billige Gegenmaßnahme jetzt:** Im Plan festhalten, dass `MediaIngestForm` für das Datei-Feld auf einen kontrollierten React-State umgestellt wird (`const [file, setFile] = useState<File|null>(null)`). Sowohl der `onChange`-Handler des Inputs als auch der `onDrop`-Handler der Drop-Zone setzen diesen State. Im `handleSubmit` wird das File dann manuell ins `FormData`-Objekt injiziert (`data.set('file', file)`).

### MpzDataTable Empty-State blendet Tabellenköpfe aus
- **Warum später teuer:** Der Plan fordert für den leeren Zustand der S8-Tabelle ("Empty"): "Leere Tabelle mit Spaltenköpfen ... tbody mit einer Zeile". `MpzDataTable` besitzt aktuell ein Prop `isEmpty`, das bei `true` die *gesamte Tabelle* inkl. Header durch einen `<p>`-Tag ersetzt (Z. 20-26 in `mpz-data-table.tsx`). 
- **Wann es beißt:** Wenn der Entwickler gewohnheitsmäßig `<MpzDataTable isEmpty={medien.length === 0} emptyText="...">` verwendet. Die Tabelle verliert ihre Spaltenköpfe, was exakt dem S8-Mockup widerspricht und den optischen Abgleich scheitern lässt.
- **Billige Gegenmaßnahme jetzt:** Im Plan explizit die Dev-Direktive festhalten: "In `station-medien-table.tsx` darf das Prop `isEmpty` der `MpzDataTable` **nicht** genutzt werden (`isEmpty={false}`). Stattdessen wird die Empty-State-Hinweiszeile manuell als `<tr className="..."><td colSpan={5}>...</td></tr>` in `MpzDataTableBody` gerendert."
