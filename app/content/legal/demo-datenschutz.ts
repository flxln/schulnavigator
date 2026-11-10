import type { LegalPageContent } from '@/content/legal/types'

export const demoDatenschutzContent: LegalPageContent = {
  title: 'Datenschutz',
  intro:
    'Hinweise zur Demo des Schulnavigators. Diese Instanz verarbeitet keine Daten einer Schule und keine Schüler-Medien.',
  sections: [
    {
      id: 'verantwortlicher',
      title: 'Verantwortliche Stelle',
      blocks: [
        {
          type: 'text',
          text: 'Medienpädagogisches Zentrum Dresden\nÖffentliche Einrichtung der Landeshauptstadt Dresden\nAnnenhöfe — Hertha-Lindner-Straße 17\n01067 Dresden',
        },
        {
          type: 'link',
          label: 'info@mpz-dresden.de',
          href: 'mailto:info@mpz-dresden.de',
        },
      ],
    },
    {
      id: 'zweck',
      title: 'Zweck',
      blocks: [
        {
          type: 'text',
          text: 'Die Demo zeigt einen Beispielrundgang mit erfundenen Texten und einfarbigen Platzhalterbildern. Es gibt keine Nutzerkonten und keine Inhalte einer konkreten Schule.',
        },
      ],
    },
    {
      id: 'cookie',
      title: 'Cookie für den Zugang',
      blocks: [
        {
          type: 'text',
          text: 'Nach dem Öffnen eines gültigen Einladungslinks setzen wir ein technisch notwendiges Cookie (Name: sn_access). Es speichert nur den Zugangs-Token, damit der Rundgang ohne erneuten Link erreichbar bleibt.',
        },
        {
          type: 'text',
          text: 'Das Cookie ist HttpOnly, wird in Produktion nur über HTTPS übertragen und läuft mit dem hinterlegten Zeitraum ab. Es dient nicht dem Tracking.',
        },
        {
          type: 'text',
          text: 'Rechtsgrundlage: berechtigtes Interesse des Medienpädagogischen Zentrums, den Demo-Zugang zu begrenzen (Art. 6 Abs. 1 lit. f DSGVO).',
        },
      ],
    },
    {
      id: 'local',
      title: 'Speicherung nur auf Ihrem Gerät',
      blocks: [
        {
          type: 'text',
          text: 'Besuchte Stationen und Hinweise des Maskottchens liegen nur lokal im Browser (localStorage). Sie werden nicht an den Server gesendet.',
        },
      ],
    },
    {
      id: 'server',
      title: 'Server',
      blocks: [
        {
          type: 'text',
          text: 'Die Demo läuft auf einem Server des Medienpädagogischen Zentrums in Deutschland. Beim Aufruf entstehen die üblichen Verbindungsdaten in Server-Logs (IP-Adresse, Zeitpunkt, aufgerufene Adresse). Es gibt keine Analysewerkzeuge.',
        },
      ],
    },
    {
      id: 'rechte',
      title: 'Ihre Rechte',
      blocks: [
        {
          type: 'text',
          text: 'Sie können Auskunft, Berichtigung, Löschung und Einschränkung verlangen und sich bei einer Aufsichtsbehörde beschweren. Anfragen an info@mpz-dresden.de.',
        },
      ],
    },
    {
      id: 'stand',
      title: 'Stand',
      blocks: [{ type: 'text', text: '10. November 2026' }],
    },
  ],
}
