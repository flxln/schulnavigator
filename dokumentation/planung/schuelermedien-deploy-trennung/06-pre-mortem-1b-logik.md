# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag

**Stand:** 2026-06-24  
**Plan:** [`schuelermedien-deploy-trennung`](./README.md)

Der Kernentscheid ist konsistent: ADR-027, Anforderungen und Zielarchitektur
ziehen dieselbe Grenze zwischen GitHub/Coolify für Code und Hetzner-Volumes
für Schüler-Medien. Die riskanten Stellen liegen nicht im Zielbild, sondern
in unvollständig definierten Verträgen zwischen Plan, Docker-Build,
Validatoren und Mount-Pfaden.

### Build-Validierung ist nicht sauber in Struktur- und Asset-Check getrennt
- **Warum später teuer:** Der Plan empfiehlt lokal vollständige Validierung
  plus Coolify-Build ohne Asset-Check (`C + A`) und nennt dafür
  `SKIP_ASSET_VALIDATE` oder `validate:stations:structure`
  ([03-zielarchitektur.md](./03-zielarchitektur.md), `04-umsetzungsplan.md`).
  Im Code ist `validate:stations` aber der Asset-Check selbst: Es resolved
  `/media/...` nach `public/...`, `/api/dialog/...` nach
  `content/dialog-audio/...` und bricht bei fehlenden Dateien ab
  (`app/scripts/validate-station-assets.ts`). Zusätzlich ruft `npm run build`
  weiterhin `validate:coach` auf; dieser prüft bei gesetzter `quelle` ebenfalls
  `content/coach-audio/{id}.wav`. Ein Skip nur für `validate:stations` lässt
  den Coolify-Build also weiterhin an Coach-Audio scheitern, sobald Coach-WAVs
  ausgelagert werden.
- **Wann es beißt:** Phase 2.5 beim ersten Build aus einem Git-Clone ohne
  Schüler-Medien; später erneut bei jedem Coach-Audio-Feature, das `quelle:
  "/api/coach/{id}"` nutzt.
- **Billige Gegenmaßnahme jetzt:** Im Plan verbindlich festlegen:
  `npm run build` nutzt eine reine Strukturvalidierung ohne Datei-Existenz für
  `stations` **und** `coach` (z. B. `validate:stations:structure` und
  `validate:coach:structure`), während `deploy-content.sh` lokal vor `rsync`
  die vollständigen Asset-Validatoren ausführt. Falls ein ENV-Flag gewählt
  wird, muss der Name und die Wirkung für beide Validatoren exakt benannt sein.

### `public/media`-Volume maskiert versionierte Icons und Platzhalter
- **Warum später teuer:** Die Zielarchitektur mountet das ganze Volume nach
  `/app/public/media`, während der Umsetzungsplan gleichzeitig Icons ohne
  Personen weiter in Git erlauben will (`!/public/media/**/icons/`). Ein
  Docker-Mount auf `/app/public/media` überdeckt aber den kompletten im Image
  mitgelieferten Unterbaum. Git-versionierte Icons unter
  `public/media/{slug}/icons/` wären zur Laufzeit nicht sichtbar, wenn sie nicht
  zusätzlich per `rsync` im Volume landen. Damit konkurrieren zwei Wahrheiten:
  Bahn A sagt „Icons ggf. in Git“, Bahn B sagt „ganzer `public/media`-Baum aus
  dem Volume“.
- **Wann es beißt:** Phase 1.1/1.2 bei `.gitignore` und Platzhaltern; spätestens
  nach Phase 2.2, wenn Hotspot-Icons in `stations.json` auf
  `/media/{slug}/icons/...` zeigen und lokal funktionieren, live aber 404
  liefern.
- **Billige Gegenmaßnahme jetzt:** Eine Mount-Grenze wählen und dokumentieren:
  Entweder `public/media` ist vollständig Bahn B, inklusive Icons und
  Platzhaltern, oder Schüler-Medien werden unter stabilen Unterordnern
  gemountet (`audio`, `video`, `fotos`, `texte`) und Git-Icons bleiben außerhalb
  dieser Mounts. Die `.gitignore`-Ausnahmen müssen exakt zur gewählten
  Mount-Grenze passen.

### Coach-Audio ist in Zielarchitektur enthalten, aber im Deploy-Vertrag nicht
- **Warum später teuer:** Die Anforderungen nennen Coach-Audio mit
  Kinderstimmen als betroffenen Pfad, die Zielarchitektur listet optional
  `content/coach-audio` als Volume, und die offenen Punkte sagen „gleiche
  Sync-Pipeline“. Der Umsetzungsplan ignoriert `content/coach-audio` aber in
  `.gitignore`, Deploy-Skript und Akzeptanzkriterien. Im Code ist Coach-Audio
  bereits ein eigener API-Vertrag (`/api/coach/{messageId}`) mit eigener
  Existenzprüfung im Validator. Ohne explizite Entscheidung entsteht ein
  halber Migrationszustand: Dialog-Audio ist aus Git entfernt, Coach-Audio
  bleibt entweder versehentlich in Git/LFS oder bricht den Build.
- **Wann es beißt:** Sobald Coach-Nachrichten Schülerstimmen enthalten oder
  ein Redakteur Coach-WAVs über das Studio pflegt. Folge-Issues zu Coach-Audio
  müssen dann erraten, ob `coach-audio` Git-, Volume- oder Sonderfall ist.
- **Billige Gegenmaßnahme jetzt:** In Phase 1-3 eine klare Diskriminierung
  ergänzen: `coach-audio` ist entweder **immer Bahn B**, sobald irgendeine
  Kinderstimme möglich ist, oder explizit **nicht Bestandteil dieses Vorhabens**
  und darf bis zur DSB-Entscheidung keine Schülerstimmen enthalten. Wenn Bahn B:
  `.gitignore`, `.gitattributes`, Coolify-Mount, `rsync`-Zeile,
  Build-Validator und Smoke-Test für `/api/coach/{id}` ergänzen.
