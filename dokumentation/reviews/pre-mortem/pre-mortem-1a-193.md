# Pre-Mortem 1a — Code-Praxis & Implementierbarkeit: Coach Audio (#193)

**Datum:** 2026-06-20  
**Basis-Plan:** `coach_audio_#193_f0315f01.plan.md`  
**Reviewer:** Senior Engineer  

---

### [Cleanup-Race bei schnellem Unmount] — Unbehandelter Fehler im Audio-Promise
- **Warum später teuer:** In `useCoachAudio` wird beim Mount sofort `audio.play()` aufgerufen, was asynchron ein Promise zurückgibt. Wenn das Overlay direkt danach (z. B. durch schnellen Klick auf das Backdrop oder 'X') geschlossen wird, fordert der Plan im Cleanup-Schritt "Dismiss/unmount → pause(), el.removeAttribute('src')". Ein synchrones `pause()` während eines noch schwebenden `play()`-Promises wirft im Browser unweigerlich eine `DOMException` (`The play() request was interrupted by a call to pause()`), die Logs verschmutzt und evtl. Error-Boundaries triggert.
- **Wann es beißt:** Ein User öffnet eine Ansicht, bei der Autoplay triggert, navigiert aber sofort weiter oder drückt schnell Escape, bevor der Browser den Audio-Puffer fertig geladen hat.
- **Billige Gegenmaßnahme jetzt:** Im `useCoachAudio`-Hook das von `play()` zurückgegebene Promise auffangen und `AbortError` gezielt ignorieren, oder den synchronen `pause()`-Aufruf beim Unmount mit einem Check absichern (`isPlayPending`).

### [Fehlende fs-Abgrenzung in der Domain] — Seiteneffekt in mpz-coach-messages
- **Warum später teuer:** Der Plan spezifiziert unter "Domain: ... DELETE löscht WAV", dass beim Entfernen einer Coach-Message in `removeCoachMessage` (in `app/lib/mpz-coach-messages.ts`) auch die WAV-Datei gelöscht werden soll. Bislang ist diese Domain-Logik sauber und nutzt für IO-Operationen ausschließlich die Abstraktion `MpzContentIo`. Zieht man hier direkt `fs.unlinkSync` hinein, verschmutzt das die Domain und zerstört die Isolierung der Unit-Tests.
- **Wann es beißt:** Direkt beim Ausführen von `npm run test` für die Domain-Tests, die plötzlich gegen das echte Dateisystem laufen oder mühsame Mockings des `fs`-Moduls benötigen.
- **Billige Gegenmaßnahme jetzt:** Das Löschen der `.wav`-Datei nicht direkt in die reine Domain-Logik einbauen, sondern explizit im DELETE-Handler der API-Route (`app/app/api/mpz/coach/messages/[messageId]/route.ts`) anstoßen, oder – falls gekapselt gewünscht – über eine Erweiterung der `MpzContentIo`-Abstraktion abbilden.

### [Orphaned WAVs nach PATCH quelle: null] — Stiller Datenmüll im Repo
- **Warum später teuer:** Der Plan definiert richtigerweise, dass `quelle: null` per PATCH gesendet werden kann, um ein Audio von einer bestehenden Nachricht zu lösen (z. B. wenn das MPZ im Studio "Entfernen" klickt). Er spezifiziert jedoch das physische Löschen der WAV-Datei *nur* für den Fall, dass die gesamte Message gelöscht wird ("DELETE löscht WAV mit"). Wird aber nur das `quelle`-Feld per PATCH genullt, bleibt die alte `.wav` als verwaiste Datei ewig im Ordner `content/coach-audio/` liegen (Status: "fehlt").
- **Wann es beißt:** Wenn MPZ-Redakteure iterativ Clips hochladen, testen und wieder entfernen, sammelt sich im Dateisystem und in Git-LFS unnötiger Müll an, der händisch aufgeräumt werden muss.
- **Billige Gegenmaßnahme jetzt:** Im `PATCH`-Route-Handler ebenfalls prüfen, ob die `quelle` entfernt wird (`patch.quelle === null`). Wenn ja, und die Datei existiert physisch, sollte auch beim PATCH die `.wav`-Datei gelöscht werden, nicht nur beim kompletten DELETE der Message.
