import type { LegalPageContent } from '@/content/legal/types'

export const impressumContent: LegalPageContent = {
  title: 'Impressum',
  intro:
    'Virtueller Schulrundgang der 39. Grundschule Dresden (Schulnavigator).',
  sections: [
    {
      id: 'anbieter',
      title: 'Anbieter (technischer Betrieb)',
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
        {
          type: 'text',
          text: 'Ansprechpartner: Thomas Weidemann (Teamkoordinator)\nE-Mail: thomas.weidemann@mpz-dresden.de',
        },
        {
          type: 'text',
          text: 'Das MPZ betreibt diese Anwendung im Auftrag der 39. Grundschule Dresden. Die Server stehen in Deutschland.',
        },
      ],
    },
    {
      id: 'schultraeger',
      title: 'Schulträger',
      blocks: [
        {
          type: 'text',
          text: 'Landeshauptstadt Dresden (LHD)\nvertreten durch den Oberbürgermeister\nDr.-Külz-Ring 19\n01067 Dresden',
        },
        { type: 'text', text: 'Telefon: 0351 488 0\nTelefax: 0351 488 2231' },
        {
          type: 'link',
          label: 'stadtverwaltung@dresden.de',
          href: 'mailto:stadtverwaltung@dresden.de',
        },
      ],
    },
    {
      id: 'schule',
      title: 'Schule (Auftraggeberin)',
      blocks: [
        {
          type: 'text',
          text: '39. Grundschule Dresden — Plauen\nSchleiermacherstraße 8\n01187 Dresden',
        },
        { type: 'text', text: 'Telefon: 0351 471 30 57\nTelefax: 0351 451 90 12' },
        {
          type: 'link',
          label: 'GS_039@dresdner-schulen.de',
          href: 'mailto:GS_039@dresdner-schulen.de',
        },
      ],
    },
    {
      id: 'inhalt',
      title: 'Verantwortlich für die Inhalte',
      blocks: [
        {
          type: 'text',
          text: 'Ines Schubert (Schulleitung)\nSten Ullmann (Lehrkraft)',
        },
        {
          type: 'text',
          text: 'Die in der App dargestellten Texte, Audios, Bilder und Videos stammen von der Schule bzw. wurden im Schulprojekt erstellt. Für inhaltliche Fragen wenden Sie sich an die Schule.',
        },
      ],
    },
    {
      id: 'zweck',
      title: 'Zweck und Nutzung',
      blocks: [
        {
          type: 'text',
          text: 'Diese Web-App dient dem virtuellen Schulrundgang der 39. Grundschule Dresden (u. a. Tag der offenen Tür, Schulfest, Schulstartheft). Der Zugang ist durch Eintritts-QR-Codes beschränkt. Inhalte sind zur Nutzung in der App bestimmt; ein systematischer Download ist nicht vorgesehen.',
        },
        {
          type: 'text',
          text: 'Die App wurde in Kooperation mit dem Medienpädagogischen Zentrum Dresden entwickelt und betrieben.',
        },
      ],
    },
    {
      id: 'maskottchen',
      title: 'Bildrechte',
      blocks: [
        {
          type: 'text',
          text: 'Die Zeichnung des Schulgebäudes auf der Startseite stammt von Roberto Zänker.',
        },
        {
          type: 'text',
          text: 'Die in der App verwendeten Figuren Frieda (Giraffe) und Otto (Maus) stammen aus dem Schulplaner des FLVG Verlagshaus OHG, Kirchweg 9, 08527 Straßberg.',
        },
        {
          type: 'link',
          label: 'Mit freundlicher Genehmigung von FLVG',
          href: 'https://shop.flvg.de/catalog/',
          external: true,
        },
        {
          type: 'link',
          label: 'www.flvg.de',
          href: 'https://www.flvg.de',
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
          text: 'Als Diensteanbieter sind wir für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich. Für die Inhalte der App ist die Schule verantwortlich (siehe oben).',
        },
        {
          type: 'text',
          text: 'Die App kann auf externe Websites verlinken (z. B. über Medien-Hotspots). Auf deren Inhalte haben wir keinen Einfluss; für diese fremden Inhalte übernehmen wir keine Gewähr. Verantwortlich sind die jeweiligen Anbieter.',
        },
      ],
    },
    {
      id: 'urheberrecht',
      title: 'Urheberrecht',
      blocks: [
        {
          type: 'text',
          text: 'Die von der Schule bereitgestellten Inhalte unterliegen dem deutschen Urheberrecht. Eine Vervielfältigung, Bearbeitung oder Verbreitung außerhalb der vorgesehenen Nutzung in dieser App bedarf der Zustimmung der Rechteinhaberin bzw. des Rechteinhabers.',
        },
      ],
    },
    {
      id: 'streit',
      title: 'Streitbeilegung',
      blocks: [
        {
          type: 'text',
          text: 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit.',
        },
        {
          type: 'link',
          label: 'ec.europa.eu/consumers/odr',
          href: 'https://ec.europa.eu/consumers/odr',
          external: true,
        },
        {
          type: 'text',
          text: 'Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
        },
      ],
    },
  ],
}
