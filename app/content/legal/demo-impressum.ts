import type { LegalPageContent } from '@/content/legal/types'

export const demoImpressumContent: LegalPageContent = {
  title: 'Impressum',
  intro: 'Demo des Schulnavigators. Inhalte und Bilder sind erfunden und gehören zu keiner Schule.',
  sections: [
    {
      id: 'anbieter',
      title: 'Anbieter',
      blocks: [
        {
          type: 'text',
          text: 'Medienpädagogisches Zentrum Dresden\nÖffentliche Einrichtung der Landeshauptstadt Dresden\nAnnenhöfe — Hertha-Lindner-Straße 17\n01067 Dresden',
        },
        { type: 'text', text: 'Telefon: +49 351 488 929880' },
        {
          type: 'link',
          label: 'info@mpz-dresden.de',
          href: 'mailto:info@mpz-dresden.de',
        },
        {
          type: 'link',
          label: 'mpz-dresden.de',
          href: 'https://mpz-dresden.de',
          external: true,
        },
      ],
    },
    {
      id: 'zweck',
      title: 'Zweck',
      blocks: [
        {
          type: 'text',
          text: 'Diese Instanz ist die Demo und Entwicklungsumgebung des Schulnavigators. Sie zeigt zwölf Beispielstationen. Es werden keine Inhalte, Fotos oder Aufnahmen einer Schule ausgeliefert.',
        },
      ],
    },
    {
      id: 'maskottchen',
      title: 'Bildrechte',
      blocks: [
        {
          type: 'text',
          text: 'Die Strichzeichnung des Schulhauses auf der Startseite ist eine schematische Ansicht für die Navigation.',
        },
        {
          type: 'text',
          text: 'Die Figuren Frieda (Giraffe) und Otto (Maus) stammen aus dem Schulplaner des FLVG Verlagshaus OHG, Kirchweg 9, 08527 Straßberg.',
        },
        {
          type: 'link',
          label: 'Mit freundlicher Genehmigung von FLVG',
          href: 'https://shop.flvg.de/catalog/',
          external: true,
        },
      ],
    },
    {
      id: 'haftung',
      title: 'Haftung für Inhalte und Links',
      blocks: [
        {
          type: 'text',
          text: 'Als Diensteanbieter sind wir für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich. Die Stationstexte dieser Demo sind Beispieldaten.',
        },
      ],
    },
  ],
}
