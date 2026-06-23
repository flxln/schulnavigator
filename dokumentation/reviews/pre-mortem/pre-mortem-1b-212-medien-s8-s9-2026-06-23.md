---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01b-logik-spec
erstellt: 2026-06-23
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: #212 Medien S8/S9

**Geprüfte Dokumente:**
- Plan: `.cursor/plans/#212_medien_s8_s9_82f1fd9d.plan.md`
- Spec: `dokumentation/planung/epic-mpz-studio-v3-visual-polish.md` (Epic #205), `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/02-screens-v2.1-und-user-stories.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/mockups/SCREEN-MATRIX.md`
- Mockups: `s8_medien_list/code.html`, `s9_medien_modal_default/code.html`, `s9_medien_modal_link_embed/code.html`, `s9_medien_modal_error/code.html`
- Code: `app/components/mpz-studio/station-medien-table.tsx`, `app/components/mpz-studio/media-ingest-modal.tsx`, `app/components/mpz-studio/media-ingest-form.tsx`, `app/components/mpz-studio/media-link-embed-form.tsx`, `app/components/mpz-studio/medium-link-embed-fields.tsx`, `app/components/mpz-studio/mpz-modal.tsx`, `app/components/mpz-studio/media-ingest-modal-context.tsx`
- Lib/API: `app/app/api/mpz/media/ingest/route.ts`, `app/app/api/mpz/stations/[slug]/medien/route.ts`, `app/app/api/mpz/stations/[slug]/medien/[mediumId]/route.ts`, `app/lib/mpz-upload-rules.ts`, `app/lib/mpz-station-medien.ts`
- Vorgänger: #210 und #211 laut Plan erledigt; im aktuellen Code nicht verifiziert
- Gegenstück: [pre-mortem-1a-212-codepraxis.md](./pre-mortem-1a-212-codepraxis.md) (Implementierungs-Blocker)

---

Positiv: Die beiden Create-APIs haben bereits konkrete JSON-Fehlerformate mit `{ error, message }`. `POST /api/mpz/media/ingest` liefert bei Datei-Uploads 201 und `POST /api/mpz/stations/[slug]/medien` liefert bei Link/Embed 200; die Plan-Tabellen stimmen hier weitgehend mit dem Code überein. Auch die sechs Medium-Typen sind klar diskriminiert: Datei-Ingest gilt nur für `audio | video | foto | text`, Link/Embed laufen über die JSON-Route.

### Collision-Vertrag beschreibt `reject`, die API defaultet aber auf `rename`

- **Warum später teuer:** Der Plan listet bei Datei-Ingest `Dateiname-Kollision + collision=reject → COLLISION/409` und beschreibt S9-Error allgemein als Upload-Fehlerzustand. Die echte Route setzt aber den API/UI-Default auf `rename`, wenn `collision` fehlt oder nicht `replace`/`reject` ist. Das bestehende `MediaIngestForm` sendet kein `collision`-Feld. Damit führt ein Doppelupload im geplanten UI-Pfad nicht zu `COLLISION/409`, sondern zu einer automatisch umbenannten Datei.
- **Wann es beißt:** Bei S9-Error-Tests und bei Nutzererwartung nach AirDrop-/Finder-Doppeluploads. Ein Test, der Kollision als sichtbaren Error erwartet, wird gegen die Route falsch sein. Umgekehrt kann eine Implementierung, die aus dem Plan `collision=reject` ableitet, das bisher bewusst projektfreundliche Rename-Verhalten ändern.
- **Billige Gegenmaßnahme jetzt:** Im Plan explizit entscheiden: S9-Datei-Ingest nutzt weiter den API-Default `rename`; `COLLISION/409` ist nur ein API-Fall für Clients, die bewusst `collision=reject` senden. Wenn S9 Kollisionen als Error zeigen soll, muss das Formular das `collision`-Feld absichtlich setzen und der UX-Text dazu beschrieben werden.

### Modal-Footer braucht einen Kindformular-Vertrag, der nicht spezifiziert ist

- **Warum später teuer:** Der Plan verschiebt Submit-Buttons aus `MediaIngestForm` und `MediaLinkEmbedForm` in einen gemeinsamen `MpzModal.footer` und fordert zugleich `disabled wenn Form invalid/busy`. `MpzModal` kann aber nur ein passives `footer?: ReactNode` tragen; es kennt weder Formular-ID noch Validität noch Busy-State der Kindformulare. Die Kindformulare halten diese Zustände lokal (`busy`, `isPending`, `isLinkEmbedFormValid`, ausgewählte Datei). Ohne expliziten Vertrag ist unklar, wer Submit auslöst und wer den Disabled-Zustand kontrolliert.
- **Wann es beißt:** Direkt bei S9: Datei-Formular, Link-Formular und Embed-Formular haben unterschiedliche Validitätsbedingungen. Später bei #215, wenn Medien-Bearbeiten denselben Modal-/Footer-Mechanismus wiederverwenden soll. Eine ad-hoc-Lösung über DOM-IDs oder imperative Refs würde die Form-Komponenten semantisch koppeln und schwer testbar machen.
- **Billige Gegenmaßnahme jetzt:** Vor Umsetzung einen kleinen Component-Vertrag festlegen: z. B. jedes Formular erhält eine stabile `formId`, optional `hideSubmit`, und meldet `{ canSubmit, busy, submitLabel }` an den Modal-Parent; der Footer-Button nutzt dann `form={formId}`. Alternativ bleiben die Submit-Buttons in den Kindformularen und der Footer ist nur für `Abbrechen`.

### Vorgängerstatus #210/#211 widerspricht aktuellem Code

- **Warum später teuer:** Der Plan markiert #210 und #211 als erledigt und baut darauf auf: Header/Tabs sowie `MpzCard`-Muster seien vorhanden, nur der Medien-Tab bekomme jetzt die gleiche Hülle. Der aktuelle Code zeigt jedoch noch alte Zustände: `station-detail-shell.tsx` nutzt boxed Tabs und `section`-Wrapper; `station-stammdaten-form.tsx` und `station-raumbild-upload.tsx` sind noch nicht auf das #211-Muster migriert. Auch die #210/#211-Plan-Todos standen beim Lesen noch nicht als abgeschlossene Codebasis im relevanten Code.
- **Wann es beißt:** Bei der S8/S9-Screenshot-Abnahme und bei Merge-Reihenfolge. #212 ändert erneut `station-detail-shell.tsx`; wenn #210/#211 parallel oder später landen, konkurrieren drei Pläne um denselben Tab-Panel-Vertrag. Der Screenshot kann trotz korrekter Medienarbeit scheitern, weil Header, Tabs und Card-Hülle nicht dem angenommenen Stand entsprechen.
- **Billige Gegenmaßnahme jetzt:** Den Planstatus schärfen: Entweder #212 ist wirklich blockiert bis #210/#211 gemerged sind, oder #212 enthält eine explizite Rebase-Regel und bewertet Screenshots vorläufig nur für Medien-Tabelle und Modal. Die Aussage "Vorgänger erledigt" sollte erst nach Code-Verifikation im Plan stehen.

### S8-Referenz nennt Editing, Plan verschiebt Editing nach #215

- **Warum später teuer:** Die Spec beschreibt S8 als `empty, list, editing`, und die Mockup-Matrix führt `s8_medien_editing` als Stern-Referenz. Der Plan behandelt S8 aber nur als Empty/List und erklärt Inline-Editing beziehungsweise S10 als #215. Gleichzeitig bleibt die bestehende `StationMediumEditForm` im Medien-Tab weiterhin erreichbar. Damit gibt es drei Wahrheiten: Spec sagt S8 enthält Editing, Plan sagt Editing ist nicht #212, Code zeigt Editing weiterhin innerhalb der S8-Tabelle.
- **Wann es beißt:** Bei visueller Abnahme des Medien-Tabs: Klick auf "Bearbeiten" öffnet weiterhin eine alte Inline-Form in einer ansonsten migrierten S8-Tabelle. Prüfer können das als S8-Regress werten, während der Plan es als #215-Scope ablehnt. #215 muss dann eventuell S8-Layout-Annahmen aus #212 wieder ändern.
- **Billige Gegenmaßnahme jetzt:** Abnahmegrenze präzisieren: #212 migriert S8 nur für `empty` und `list`; `s8_medien_editing` und S10 werden in #215 bewertet. Zusätzlich im Plan festhalten, ob der Bearbeiten-Button in #212 sichtbar bleibt und die alte Form bewusst als temporärer Legacy-Zustand öffnet.

### S9-Error ist nur teilweise über Client-Validierung definiert

- **Warum später teuer:** Der Plan fordert für S9-Error: URL-Feld mit `border-error` bei Allowlist/HTTPS-Fehler und Submit disabled, wenn `!isLinkEmbedFormValid`. Die bestehende Validierung in `MediumLinkEmbedFields` unterscheidet aber nur zwei Textfehler (`httpsOk`, `embedUrlOk`) und nutzt aktuell `text-brand-red`; sie hat keinen exportierten Feldstatus und keinen `border-error`-Vertrag. Der Submit-Button lebt heute im Kindformular und nutzt dieselbe Validierung lokal.
- **Wann es beißt:** Wenn der Submit in den Modal-Footer wandert, muss der Parent wissen, ob Link oder Embed valide ist und welcher Fehlerzustand am URL-Feld sichtbar sein soll. Ohne gemeinsamen Fehlerstatus kann der Footer enabled sein, während das Feld visuell Fehler zeigt, oder umgekehrt. Folge-Consumer in #215/S18 werden dieselbe Link/Embed-Validierung wieder brauchen.
- **Billige Gegenmaßnahme jetzt:** Einen expliziten Link/Embed-Validation-Vertrag extrahieren, z. B. `getLinkEmbedValidation(typ, values, globalSuffixes) -> { valid, urlError?: 'missing' | 'invalid_https' | 'disallowed_embed_domain' }`. UI und Footer verwenden denselben Vertrag; `MediumLinkEmbedFields` bekommt daraus `aria-invalid`/`border-error` statt eigener lokaler Ableitung.
