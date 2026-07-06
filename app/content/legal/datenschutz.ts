import { LEGAL_DSB_CONTACT } from '@/content/legal/dsb-contact'
import type { LegalPageContent } from '@/content/legal/types'

export const datenschutzContent: LegalPageContent = {
  title: 'Datenschutzerklärung',
  intro:
    'Informationen zur Verarbeitung personenbezogener Daten beim Schulnavigator der 39. Grundschule Dresden.',
  sections: [
    {
      id: 'verantwortlicher',
      title: 'Verantwortliche Stelle',
      blocks: [
        {
          type: 'text',
          text: '39. Grundschule Dresden — Plauen\nSchleiermacherstraße 8\n01187 Dresden',
        },
        { type: 'text', text: 'Telefon: 0351 471 30 57' },
        {
          type: 'link',
          label: 'GS_039@dresdner-schulen.de',
          href: 'mailto:GS_039@dresdner-schulen.de',
        },
        {
          type: 'text',
          text: `Datenschutzbeauftragte/r: ${LEGAL_DSB_CONTACT.name}\nE-Mail: ${LEGAL_DSB_CONTACT.email}\nTelefon: ${LEGAL_DSB_CONTACT.phone}`,
        },
      ],
    },
    {
      id: 'auftragsverarbeiter',
      title: 'Auftragsverarbeiter (technischer Betrieb)',
      blocks: [
        {
          type: 'text',
          text: 'Medienpädagogisches Zentrum Dresden\nHertha-Lindner-Straße 17\n01067 Dresden',
        },
        {
          type: 'link',
          label: 'info@mpz-dresden.de',
          href: 'mailto:info@mpz-dresden.de',
        },
        {
          type: 'text',
          text: 'Das MPZ betreibt die App im Auftrag der Schule. Ein Auftragsverarbeitungsvertrag (AVV) liegt zwischen Schule und MPZ vor (unterschrieben am 25.06.2026).',
        },
      ],
    },
    {
      id: 'zweck',
      title: 'Zweck der App',
      blocks: [
        {
          type: 'text',
          text: 'Der Schulnavigator ermöglicht einen virtuellen Rundgang durch die 39. Grundschule Dresden. Die App richtet sich an Besucherinnen und Besucher (z. B. am Tag der offenen Tür oder mit dem Schulstartheft). Es werden keine Nutzerkonten angelegt.',
        },
      ],
    },
    {
      id: 'cookie',
      title: 'Cookie für den Zugang',
      blocks: [
        {
          type: 'text',
          text: 'Nach dem Scan eines gültigen Eintritts-QR-Codes setzen wir ein technisch notwendiges Cookie (Name: sn_access). Es speichert nur den Zugangs-Token-String, damit Sie die App ohne erneuten Eintritts-QR nutzen können — auch in einem neuen Browser-Tab.',
        },
        {
          type: 'text',
          text: 'Das Cookie ist HttpOnly (nicht per JavaScript auslesbar), wird nur über HTTPS übertragen (Produktion) und läuft ab, wenn der jeweilige Eintritts-Zeitraum endet (z. B. Schulfest oder Schuljahr). Es dient nicht dem Tracking oder der Werbung.',
        },
        {
          type: 'text',
          text: 'Rechtsgrundlage: berechtigtes Interesse der Schule an einem kontrollierten Zugang zu den Schul-Inhalten (Art. 6 Abs. 1 lit. f DSGVO), soweit kein anderes Rechtsgrundlagen-Interesse vorrangig ist.',
        },
      ],
    },
    {
      id: 'local',
      title: 'Speicherung nur auf Ihrem Gerät',
      blocks: [
        {
          type: 'text',
          text: 'Fortschritt (besuchte Stationen), Coach-Hinweise und ähnliche Einstellungen werden ausschließlich lokal in Ihrem Browser (localStorage) gespeichert. Diese Daten werden nicht an unsere Server übermittelt und nicht mit anderen Nutzerinnen verknüpft.',
        },
      ],
    },
    {
      id: 'server',
      title: 'Server und Hosting',
      blocks: [
        {
          type: 'text',
          text: 'Die App wird auf einem VPS des Medienpädagogischen Zentrums Dresden bei IONOS in Deutschland betrieben. Beim Aufruf von Seiten und Medien werden technisch bedingt Verbindungsdaten (z. B. IP-Adresse, Zeitpunkt, angeforderte URL) kurzzeitig in Server-Logs verarbeitet — wie bei jedem Webangebot.',
        },
        {
          type: 'text',
          text: 'Wir setzen keine Analyse- oder Tracking-Tools (z. B. Google Analytics) ein.',
        },
      ],
    },
    {
      id: 'schuelermedien',
      title: 'Schüler-Medien in der App',
      blocks: [
        {
          type: 'text',
          text: 'Fotos, Videos und Audioaufnahmen mit erkennbaren Schülerinnen und Schülern werden nur mit dokumentierter Einwilligung der Schule veröffentlicht. Schüler-Binärdateien werden ausschließlich auf dem IONOS-VPS des MPZ in Deutschland gehostet.',
        },
      ],
    },
    {
      id: 'drittanbieter',
      title: 'Externe Inhalte und Einbettungen',
      blocks: [
        {
          type: 'text',
          text: 'Bei Medien vom Typ „Link“ öffnet die App die Zielseite erst nach Ihrem Tipp in einem neuen Tab — ohne vorheriges Laden von Drittanbieter-Inhalten.',
        },
        {
          type: 'text',
          text: 'Bei eingebetteten Inhalten (z. B. Delightex) lädt die App nach Ihrer Auswahl Inhalte von dem jeweiligen Anbieter in einem eingebetteten Fenster (iframe). Dabei können personenbezogene Daten (z. B. IP-Adresse) an den Anbieter übermittelt werden. Nutzen Sie diese Funktion nur, wenn Sie damit einverstanden sind.',
        },
        {
          type: 'text',
          text: 'Book-Creator-Inhalte (Lesewelt) werden derzeit als externer Link geöffnet — kein iframe — bis eine formale DSB-Freigabe für Einbettungen vorliegt.',
        },
      ],
    },
    {
      id: 'github',
      title: 'Versionsverwaltung (nur technischer Quellcode)',
      blocks: [
        {
          type: 'text',
          text: 'Anwendungsquellcode und strukturierte Inhaltsdaten (z. B. Stationstexte, Hotspot-Koordinaten) werden in einem privaten GitHub-Repository versioniert. Dort werden keine Schüler-Foto-, Video- oder Audio-Binärdateien gespeichert.',
        },
      ],
    },
    {
      id: 'rechte',
      title: 'Ihre Rechte',
      blocks: [
        {
          type: 'text',
          text: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch und Datenübertragbarkeit — soweit die gesetzlichen Voraussetzungen erfüllt sind. Wenden Sie sich dazu an die Schule (Verantwortliche) oder an den Datenschutzbeauftragten.',
        },
        {
          type: 'text',
          text: 'Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig in Sachsen ist die Sächsische Datenschutz- und Transparenzbeauftragte (SDTB).',
        },
        {
          type: 'link',
          label: 'datenschutz.sachsen.de',
          href: 'https://www.datenschutz.sachsen.de',
          external: true,
        },
      ],
    },
    {
      id: 'lehrkraefte-login',
      title: 'Lehrkräfte-Login (geplant, Directus)',
      blocks: [
        {
          type: 'text',
          text: 'Für die künftige Content-Pflege durch Lehrkräfte ist ein separates CMS (Directus) geplant. Dabei werden Lehrkräfte-Accounts (Name, E-Mail, Passwort-Hash, Login-Protokolle) verarbeitet — ausschließlich zur Wahrnehmung schulischer Aufgaben. Es werden keine Schülerdaten im CMS gespeichert. Vor dem ersten Login informieren wir Lehrkräfte gesondert und aktualisieren diese Erklärung.',
        },
      ],
    },
    {
      id: 'stand',
      title: 'Stand',
      blocks: [
        {
          type: 'text',
          text: 'Stand: Juni 2026. Wir passen diese Erklärung an, wenn sich die App oder die Rechtslage ändert.',
        },
      ],
    },
  ],
}
