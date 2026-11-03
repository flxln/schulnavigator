# ADR-033: schulnavigator.mpz.schule als Demo- und Testinstanz

**Datum:** 2026-11-03
**Status:** entschieden
**Issue:** [#281](https://github.com/flxln/schulnavigator/issues/281) · Folge [#282](https://github.com/flxln/schulnavigator/issues/282)
**Entscheider:** Felix, 3. November 2026 (zuerst in der Triage zu #255)
**Ersetzt:** [ADR-028](./028-main-und-release-39-gs.md) Punkt 4; vermerkt Punkt 5 als erledigt
**Bezug:** [ADR-032](./032-mpz-studio-produktions-admin.md) (Produktionsmodus)

## Kontext

ADR-028 Punkt 4 behandelt `https://schulnavigator.mpz.schule` als Legacy-Domain: letztes Image, Auto-Deploy aus, nicht neu deployen, weil gedruckte URLs darauf zeigen könnten. In der Triage zu #255 hat Felix am 3. November 2026 entschieden, dass die Domain die Demo- und Testinstanz mit synthetischen Daten wird und keine alten Links mehr darauf zu beachten sind. Das Directus-Vorhaben, an dem das hing, ist durch ADR-032 überholt. Die Domain-Entscheidung bleibt.

Stand per Coolify-API am 3. November 2026:

| | Demo | 39. GS |
| --- | --- | --- |
| Application | `q1a8t4zswynvgutbw9og5l7n` | `jjgl5u105ucxjvbeuwflsjq4` |
| Domain | `schulnavigator.mpz.schule` | `39-gs.mpz.schule` |
| Branch | `main` | `release/39-gs` |
| Auto-Deploy | aus | aus |
| Volumes | keine | `/data/schulnavigator/{media,dialog-audio,coach-audio}` |
| Image | alt (`/datenschutz` antwortet 404) | aktuell |
| Zugang | Entry-Token aktiv | Entry-Token aktiv |

Bei derselben Prüfung fiel eine gestoppte Kopie der Schul-Application auf (`clone-of-schulnavigator…`, Branch `kunde/39-gs`), die **dieselben Host-Pfade** unter `/data/schulnavigator/` gemountet hatte wie die Live-Instanz. Ein Löschen mit Volumes hätte die Schüler-Medien der 39. GS mitgenommen. Die Kopie wird ohne Volumes entfernt.

ADR-032 bringt schreibende Routen auf einen Live-Server. Dafür fehlt bisher ein Ort, an dem man das vor der Schule ausprobiert.

## Entscheidung

1. **`schulnavigator.mpz.schule` ist die Demo- und Testinstanz des MPZ.** Sie ersetzt die Legacy-Rolle aus ADR-028 Punkt 4.
2. **Branch `main`, Auto-Deploy aus.** Redeploys passieren bewusst und von Hand. Die Demo darf jeden Stand von `main` zeigen, ohne dass das die Schule erreicht.
3. **Nur synthetische Daten.** Keine Schüler-Medien, keine personenbezogenen Daten, keine Konten von Schule oder Lehrkräften. Stationstexte, Hotspots, Dialoge und Medien der Demo sind ausgedacht. Wie der synthetische Content abgelegt wird und ob der Fallback auf das Image-JSON (GS39-Texte) in der Demo akzeptiert wird, klärt [#282](https://github.com/flxln/schulnavigator/issues/282).
4. **Eigene Volumes, eigene Tokens.** Die Demo mountet nie Host-Pfade unter `/data/schulnavigator/`. Sie bekommt eigene Entry-Tokens, nicht die der Schule.
5. **Erster Redeploy erst mit synthetischem Content** aus #282. Bis dahin bleibt das alte Image stehen.
6. **Testinstanz für ADR-032:** Der Studio-Produktionsmodus wird zuerst auf der Demo eingeschaltet, mit MPZ-Konten und synthetischen Daten, und erst danach auf `39-gs.mpz.schule`.
7. **Host-Pfade der Schule gehören einer Application.** `/data/schulnavigator/*` ist ausschließlich an `jjgl5u105ucxjvbeuwflsjq4` gemountet. Kopien oder Klone der Schul-Application bekommen diese Pfade nicht.

## Begründung

- Die Domain existiert, ist per Token geschützt und hat keine Volumes der Schule. Sie ist der billigste Ort für eine Demo.
- Neue Funktionen, vor allem der Produktionsmodus aus ADR-032 mit Login und Uploads, brauchen eine Instanz zum Ausprobieren, an der keine Schul- und Schülerdaten hängen.
- Punkt 7 schließt die Lücke, die der Klon gezeigt hat: Wer eine Application kopiert, kopiert in Coolify auch die Mounts.

## Verworfene Alternativen

- **Legacy-Domain abschalten:** Es gibt keine alten Links mehr zu schützen, aber dann fehlt die Testinstanz für ADR-032.
- **Demo auf einer neuen Subdomain:** Eine zweite Application und Domain für denselben Zweck, während die vorhandene ungenutzt bleibt.
- **Demo auf `release/39-gs` oder mit Schul-Volumes:** Verstößt gegen „nur synthetische Daten“ und bringt Schüler-Medien auf eine zweite Instanz.

## Konsequenzen

- **ADR-028:** Hinweis „Punkt 4 ersetzt durch ADR-033“. Punkt 5 ist erledigt: Die Schul-Application zeigt laut Coolify-API auf `release/39-gs`. `kunde/39-gs` ist am 3. November 2026 gelöscht, der Stand liegt im Tag `archiv/kunde-39-gs`.
- **Coolify-Rückbau:** gestoppte Kopie der Schul-Application (Branch `kunde/39-gs`), `directus-spike-251-app` und Service `directus-spike-251` werden entfernt, alle **ohne** Volumes.
- **Agenten-Regel** `.cursor/rules/release-39-gs.mdc`, `anleitungen/fuer-entwickler.md`, `dokumentation/architektur.md` und `CLAUDE.md` nennen die Domain als Demo. Kein Dokument verbietet mehr den Redeploy der Demo, die Bedingung aus Punkt 5 gilt.
- **Epic [#273](https://github.com/flxln/schulnavigator/issues/273):** Stufe 1 bekommt die Demo als ersten Zielort.
